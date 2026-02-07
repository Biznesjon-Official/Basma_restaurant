import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Order from '../models/Order'
import Table from '../models/Table'
import Recipe from '../models/Recipe'
import Inventory from '../models/Inventory'
import InventoryTransaction from '../models/InventoryTransaction'
import { createActivityLog } from './activityLogController'
import { emitOrderStatusUpdate } from '../config/socket'

// Get orders ready for payment (served status)
export const getOrdersForPayment = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100

    // RBAC: Cashier can see all served orders
    const orders = await Order.find({ status: 'served' })
      .populate('items.menuItem')
      .populate('table')
      .populate('waiter', 'fullName')
      .sort({ createdAt: -1 })
      .limit(limit)

    res.json({ success: true, data: orders })
  } catch (error) {
    console.error('Get orders for payment error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmalarni olishda xatolik' })
  }
}

// Process payment and close order
export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const { paymentType } = req.body
    const cashierId = req.user?.userId

    // Validate payment type
    const validPaymentTypes = ['cash', 'card', 'online']
    if (!validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        error: 'Noto\'g\'ri to\'lov turi',
      })
    }

    const order = await Order.findById(orderId).populate('table')
    if (!order) {
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // RBAC: Check if order is ready for payment
    if (order.status !== 'served') {
      return res.status(400).json({
        success: false,
        error: 'Faqat yetkazilgan buyurtmalar uchun to\'lov qabul qilish mumkin',
      })
    }

    // Update order status
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
                performedBy: cashierId,
              })
              
              console.log(`✅ Write-off: ${inventoryItem.name} -${quantityToDeduct}${inventoryItem.unit}`)
            }
          }
        }
      }
    } catch (writeOffError) {
      console.error('❌ Write-off error:', writeOffError)
      // Don't fail the payment if write-off fails
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
      cashierId!,
      'payment',
      'order',
      order._id.toString(),
      { paymentType, amount: order.totalAmount },
      req.ip,
      req.get('user-agent')
    )

    // Emit socket event
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('table')
      .populate('waiter', 'fullName')

    emitOrderStatusUpdate(populatedOrder)
    console.log('📤 Socket: To\'lov qabul qilindi', order._id)

    res.json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('Process payment error:', error)
    res.status(500).json({ success: false, error: 'To\'lovni qabul qilishda xatolik' })
  }
}

// Get cashier statistics
export const getCashierStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Today's payments
    const todayOrders = await Order.find({
      paymentStatus: 'paid',
      paidAt: { $gte: today },
    })

    const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    
    // Payment breakdown
    const paymentBreakdown = todayOrders.reduce((acc: any, order) => {
      const type = order.paymentMethod || 'unknown'
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 }
      }
      acc[type].count += 1
      acc[type].amount += (order.totalAmount || 0)
      return acc
    }, {})

    // Pending payments
    const pendingPayments = await Order.countDocuments({ status: 'served' })

    res.json({
      success: true,
      data: {
        todayRevenue: totalRevenue,
        todayOrders: todayOrders.length,
        paymentBreakdown,
        pendingPayments,
      },
    })
  } catch (error) {
    console.error('Get cashier stats error:', error)
    res.status(500).json({ success: false, error: 'Statistikani olishda xatolik' })
  }
}
