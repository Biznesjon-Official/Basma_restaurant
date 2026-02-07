import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Table from '../models/Table'
import Order from '../models/Order'
import MenuItem from '../models/MenuItem'
import Recipe from '../models/Recipe'
import Inventory from '../models/Inventory'
import InventoryTransaction from '../models/InventoryTransaction'
import { createActivityLog } from './activityLogController'
import { emitNewOrder, emitOrderStatusUpdate } from '../config/socket'

// Get waiter's assigned tables
export const getMyTables = async (req: AuthRequest, res: Response) => {
  try {
    const waiterId = req.user?.userId

    // RBAC: Waiter can only see their assigned tables and available tables
    const tables = await Table.find({
      $or: [
        { currentWaiter: waiterId }, // Tables assigned to this waiter
        { status: 'available' }, // Available tables that can be claimed
      ],
    }).sort({ number: 1 })

    res.json({ success: true, data: tables })
  } catch (error) {
    console.error('Get my tables error:', error)
    res.status(500).json({ success: false, error: 'Stollarni olishda xatolik' })
  }
}

// Get waiter's orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const waiterId = req.user?.userId
    const status = req.query.status as string

    // Waiter o'zining restoran buyurtmalari + barcha marketplace buyurtmalarni ko'radi
    const query: any = {
      $or: [
        { waiter: waiterId, orderType: 'restaurant' }, // O'zining restoran buyurtmalari
        { orderType: 'marketplace' } // Barcha marketplace buyurtmalari
      ]
    }
    
    // Status filter
    if (status) {
      const statuses = status.split(',')
      query.status = { $in: statuses }
    } else {
      // Default: faqat faol buyurtmalar
      query.paymentStatus = { $ne: 'paid' }
    }

    const orders = await Order.find(query)
      .populate('items.menuItem')
      .populate('table')
      .populate('waiter', 'fullName')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: orders })
  } catch (error) {
    console.error('Get my orders error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmalarni olishda xatolik' })
  }
}

// Create new order
export const createWaiterOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { tableId, items, specialInstructions } = req.body
    const waiterId = req.user?.userId

    // RBAC: Validate input
    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Stol va taomlar talab qilinadi',
      })
    }

    // Validate table
    const table = await Table.findById(tableId)
    if (!table) {
      return res.status(404).json({ success: false, error: 'Stol topilmadi' })
    }

    // RBAC: Check if table is available or already assigned to this waiter
    if (table.status === 'occupied' && table.currentWaiter?.toString() !== waiterId) {
      console.warn('🚫 Unauthorized table access attempt:', {
        waiter: waiterId,
        table: tableId,
        currentWaiter: table.currentWaiter,
      })
      
      return res.status(403).json({
        success: false,
        error: 'Bu stol boshqa ofitsiantga biriktirilgan',
      })
    }

    // Validate menu items
    const menuItemIds = items.map((item: any) => item.menuItem)
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, available: true })

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Ba\'zi taomlar topilmadi yoki mavjud emas',
      })
    }

    // RBAC: Use menu prices from database, NOT from request
    // This prevents price manipulation
    const orderItems = items.map((item: any) => {
      const menuItem = menuItems.find((m) => m._id.toString() === item.menuItem)
      return {
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem!.price, // ALWAYS use DB price
        specialInstructions: item.specialInstructions || '',
      }
    })

    const totalAmount = orderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    // Create order
    const order = await Order.create({
      table: tableId,
      tableNumber: table.number,
      waiter: waiterId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      specialInstructions,
    })

    // Update table status
    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied',
      currentWaiter: waiterId,
      currentOrder: order._id,
    })

    // Log action
    await createActivityLog(
      waiterId!,
      'create',
      'order',
      order._id.toString(),
      { tableNumber: table.number, totalAmount },
      req.ip,
      req.get('user-agent')
    )

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('table')

    res.status(201).json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('Create waiter order error:', error)
    res.status(500).json({ success: false, error: 'Buyurtma yaratishda xatolik' })
  }
}

// Add items to existing order
export const addItemsToOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const { items } = req.body
    const waiterId = req.user?.userId

    // RBAC: Validate input
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Taomlar talab qilinadi',
      })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // RBAC: Check ownership (only for restaurant orders)
    if (order.orderType === 'restaurant' && order.waiter && order.waiter.toString() !== waiterId) {
      console.warn('🚫 Unauthorized order modification attempt:', {
        waiter: waiterId,
        order: orderId,
        orderWaiter: order.waiter,
      })
      
      return res.status(403).json({
        success: false,
        error: 'Sizda bu buyurtmaga kirish huquqi yo\'q',
      })
    }

    // RBAC: Check if order is closed
    if (order.status === 'completed' || order.paymentStatus === 'paid') {
      return res.status(403).json({
        success: false,
        error: 'Yopilgan buyurtmaga taom qo\'shib bo\'lmaydi',
      })
    }

    // Validate and add items
    const menuItemIds = items.map((item: any) => item.menuItem)
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, available: true })

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Ba\'zi taomlar topilmadi yoki mavjud emas',
      })
    }

    // RBAC: Use menu prices from database, NOT from request
    const newItems = items.map((item: any) => {
      const menuItem = menuItems.find((m) => m._id.toString() === item.menuItem)
      return {
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem!.price, // ALWAYS use DB price
        specialInstructions: item.specialInstructions || '',
      }
    })

    order.items.push(...newItems)
    order.totalAmount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    await order.save()

    // Log action
    await createActivityLog(
      waiterId!,
      'update',
      'order',
      order._id.toString(),
      { action: 'add_items', itemsCount: items.length },
      req.ip,
      req.get('user-agent')
    )

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('table')

    res.json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('Add items to order error:', error)
    res.status(500).json({ success: false, error: 'Taom qo\'shishda xatolik' })
  }
}

// Update order status (submit to kitchen)
export const submitOrderToKitchen = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const waiterId = req.user?.userId

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // Check ownership (only for restaurant orders)
    if (order.orderType === 'restaurant' && order.waiter && order.waiter.toString() !== waiterId) {
      return res.status(403).json({
        success: false,
        error: 'Sizda bu buyurtmaga kirish huquqi yo\'q',
      })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Faqat kutilayotgan buyurtmalarni yuborish mumkin',
      })
    }

    order.status = 'preparing'
    await order.save()

    // Log action
    await createActivityLog(
      waiterId!,
      'status_change',
      'order',
      order._id.toString(),
      { from: 'pending', to: 'preparing' },
      req.ip,
      req.get('user-agent')
    )

    // Emit socket event to kitchen
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('table')
      .populate('waiter', 'fullName')

    emitNewOrder(populatedOrder)
    console.log('📤 Socket: Yangi buyurtma oshxonaga yuborildi', order._id)

    res.json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('Submit order error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmani yuborishda xatolik' })
  }
}

// Mark order as served (ready for payment by cashier)
export const markAsServed = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const waiterId = req.user?.userId

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // Check ownership (only for restaurant orders)
    if (order.orderType === 'restaurant' && order.waiter && order.waiter.toString() !== waiterId) {
      return res.status(403).json({
        success: false,
        error: 'Sizda bu buyurtmaga kirish huquqi yo\'q',
      })
    }

    // Check if order is ready
    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        error: 'Faqat tayyor buyurtmalarni yetkazish mumkin',
      })
    }

    order.status = 'served'
    await order.save()

    // Log action
    await createActivityLog(
      waiterId!,
      'status_change',
      'order',
      order._id.toString(),
      { from: 'ready', to: 'served' },
      req.ip,
      req.get('user-agent')
    )

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('table')

    res.json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('Mark as served error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmani yetkazishda xatolik' })
  }
}

// Close order and process payment
export const closeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const { paymentType } = req.body
    const waiterId = req.user?.userId

    const order = await Order.findById(orderId).populate('table')
    if (!order) {
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // Check ownership (only for restaurant orders)
    if (order.orderType === 'restaurant' && order.waiter && order.waiter.toString() !== waiterId) {
      return res.status(403).json({
        success: false,
        error: 'Sizda bu buyurtmaga kirish huquqi yo\'q',
      })
    }

    if (order.status === 'completed' || order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Buyurtma allaqachon to\'langan',
      })
    }

    // Validate payment type
    const validPaymentTypes = ['cash', 'card', 'online', 'prepaid']
    if (!validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        error: 'Noto\'g\'ri to\'lov turi',
      })
    }

    order.status = 'completed'
    order.paymentMethod = paymentType as 'cash' | 'card' | 'online' | 'prepaid'
    order.paymentStatus = 'paid'
    order.paidAt = new Date()
    await order.save()

    // ==================== AVTOMATIK WRITE-OFF ====================
    // Buyurtma yopilganda ombor qoldiqlarini avtomatik kamaytirish
    try {
      const populatedOrder = await Order.findById(order._id).populate('items.menuItem')
      
      for (const item of populatedOrder!.items) {
        if (!item.menuItem) continue
        
        const menuItemId = item.menuItem._id
        
        // Texnologik kartani topish
        const recipe = await Recipe.findOne({ menuItem: menuItemId }).populate('ingredients.inventoryItem')
        
        if (recipe) {
          // Har bir ingredient uchun
          for (const ingredient of recipe.ingredients) {
            const inventoryItem = await Inventory.findById(ingredient.inventoryItem)
            
            if (inventoryItem) {
              const quantityToDeduct = ingredient.quantity * item.quantity
              const balanceBefore = inventoryItem.quantity
              const balanceAfter = balanceBefore - quantityToDeduct
              
              // Ombor qoldiqni kamaytirish
              inventoryItem.quantity = balanceAfter
              await inventoryItem.save()
              
              // Transaction yaratish
              await InventoryTransaction.create({
                inventoryItem: inventoryItem._id,
                type: 'write-off',
                quantity: -quantityToDeduct,
                unit: inventoryItem.unit,
                order: order._id,
                balanceBefore,
                balanceAfter,
                performedBy: waiterId,
              })
              
              console.log(`✅ Write-off: ${inventoryItem.name} -${quantityToDeduct}${inventoryItem.unit}`)
            }
          }
        }
      }
    } catch (writeOffError) {
      console.error('❌ Write-off error:', writeOffError)
      // Don't fail the order close if write-off fails
    }
    // ==================== END WRITE-OFF ====================

    // Free the table (only for restaurant orders)
    if (order.orderType === 'restaurant' && order.table) {
      await Table.findByIdAndUpdate(order.table._id, {
        status: 'available',
        currentWaiter: null,
        currentOrder: null,
      })
    }

    // Log action
    await createActivityLog(
      waiterId!,
      'status_change',
      'order',
      order._id.toString(),
      { action: 'close_order', paymentType, amount: order.totalAmount },
      req.ip,
      req.get('user-agent')
    )

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('table')

    res.json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('Close order error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmani yopishda xatolik' })
  }
}

// Get available menu items (read-only)
// RBAC: Waiter can ONLY view menu, NOT modify prices or items
export const getAvailableMenu = async (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string

    const query: any = { available: true }
    if (category) query.category = category

    // Return only necessary fields, hide cost/profit data
    const menuItems = await MenuItem.find(query)
      .select('-cost -__v') // Hide cost from waiters
      .sort({ category: 1, name: 1 })

    res.json({ success: true, data: menuItems })
  } catch (error) {
    console.error('Get available menu error:', error)
    res.status(500).json({ success: false, error: 'Menu olishda xatolik' })
  }
}
