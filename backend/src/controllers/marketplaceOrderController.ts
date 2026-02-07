import { Request, Response } from 'express'
import MarketplaceOrder from '../models/MarketplaceOrder'
import { getIO, emitMarketplaceOrder, emitMarketplaceOrderUpdate } from '../config/socket'
import { syncCustomerOrderStatus } from '../utils/customerOrderSync'

// Barcha marketplace buyurtmalarni olish
export const getMarketplaceOrders = async (req: Request, res: Response) => {
  try {
    const { status, marketplaceName, orderType } = req.query
    
    const filter: any = {}
    if (status) {
      // Multiple statuses support: ?status=new,accepted
      const statuses = (status as string).split(',')
      filter.status = { $in: statuses }
    } else {
      // Default: faqat faol buyurtmalar (delivered va cancelled emas)
      filter.status = { $nin: ['delivered', 'cancelled'] }
    }
    if (marketplaceName) filter.marketplaceName = marketplaceName
    if (orderType) filter.orderType = orderType
    
    const orders = await MarketplaceOrder.find(filter)
      .populate('acceptedBy', 'name')
      .populate('courier', 'name')
      .populate('items.menuItem', 'name price')
      .populate('table')
      .sort({ createdAt: -1 })
      // Limit yo'q - barcha faol buyurtmalar ko'rinadi
    
    res.json(orders)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Yangi marketplace buyurtma yaratish (webhook uchun)
export const createMarketplaceOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body
    
    console.log('📥 Webhook received:', JSON.stringify(orderData, null, 2))
    
    // Transform data from external site format to our format
    const transformedData = {
      marketplaceOrderId: orderData.marketplaceOrderId || `WEB-${Date.now()}`,
      marketplaceName: orderData.marketplaceName || 'Website',
      customerName: orderData.customerName || 'Web Mijoz',
      customerPhone: orderData.customerPhone || orderData.phone || '+998000000000',
      customerAddress: orderData.customerAddress || orderData.address || '',
      orderType: orderData.tableId ? 'dine-in' : 'delivery',
      deliveryType: orderData.deliveryType || (orderData.tableId ? 'pickup' : 'delivery'),
      deliveryTime: orderData.deliveryTime,
      deliveryFee: orderData.deliveryFee || 0,
      table: orderData.tableId || undefined,
      tableNumber: orderData.tableNumber || undefined,
      items: (orderData.items || []).map((item: any) => ({
        menuItem: item.menuItemId || item.menuItem,
        menuItemName: item.menuItemName || item.name,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions || item.notes || ''
      })),
      totalAmount: orderData.totalAmount || orderData.total || 0,
      paymentType: orderData.paymentType || orderData.paymentMethod || 'cash',
      paymentStatus: orderData.paymentStatus || 'pending',
      specialInstructions: orderData.specialInstructions || orderData.notes || '',
      priority: orderData.priority || 'normal',
      status: orderData.status === 'confirmed' ? 'new' : (orderData.status || 'new')
    }
    
    console.log('📦 Transformed data:', JSON.stringify(transformedData, null, 2))
    
    const order = new MarketplaceOrder(transformedData)
    await order.save()
    
    console.log('✅ Order saved:', order._id)
    
    // Real-time notification
    emitMarketplaceOrder(order)
    
    if (transformedData.table) {
      console.log('🍽️ Table order notification sent')
    } else {
      console.log('📱 Online order notification sent')
    }
    
    res.status(201).json(order)
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message)
    res.status(400).json({ message: error.message })
  }
}

// Buyurtmani tasdiqlash (waiter tomonidan)
export const acceptMarketplaceOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId
    
    const order = await MarketplaceOrder.findById(id)
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' })
    }
    
    if (order.status !== 'new') {
      return res.status(400).json({ message: 'Buyurtma allaqachon tasdiqlangan' })
    }
    
    order.status = 'accepted'
    order.acceptedBy = userId
    order.acceptedAt = new Date()
    await order.save()
    
    const populatedOrder = await MarketplaceOrder.findById(id)
      .populate('acceptedBy', 'name')
      .populate('items.menuItem', 'name price')
    
    const io = getIO()
    emitMarketplaceOrderUpdate(populatedOrder)
    
    // Sync customer order status
    if (order.marketplaceOrderId) {
      await syncCustomerOrderStatus(order.marketplaceOrderId, 'accepted')
    }
    
    res.json(populatedOrder)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// Buyurtma statusini yangilash
export const updateMarketplaceOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const order = await MarketplaceOrder.findById(id)
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' })
    }
    
    order.status = status
    
    // Vaqtlarni yangilash
    if (status === 'preparing') order.preparationStartedAt = new Date()
    if (status === 'ready') order.readyAt = new Date()
    if (status === 'delivered') order.deliveredAt = new Date()
    
    await order.save()
    
    const populatedOrder = await MarketplaceOrder.findById(id)
      .populate('acceptedBy', 'name')
      .populate('courier', 'name')
      .populate('items.menuItem', 'name price')
    
    emitMarketplaceOrderUpdate(populatedOrder)
    
    // Sync customer order status
    if (order.marketplaceOrderId) {
      await syncCustomerOrderStatus(order.marketplaceOrderId, status)
    }
    
    res.json(populatedOrder)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// Buyurtmani bekor qilish
export const cancelMarketplaceOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { cancelReason } = req.body
    
    const order = await MarketplaceOrder.findById(id)
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' })
    }
    
    order.status = 'cancelled'
    order.cancelledAt = new Date()
    order.cancelReason = cancelReason
    await order.save()
    
    emitMarketplaceOrderUpdate(order)
    
    // Sync customer order status
    if (order.marketplaceOrderId) {
      await syncCustomerOrderStatus(order.marketplaceOrderId, 'cancelled')
    }
    
    res.json(order)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// Bitta buyurtmani olish
export const getMarketplaceOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const order = await MarketplaceOrder.findById(id)
      .populate('acceptedBy', 'name')
      .populate('courier', 'name')
      .populate('items.menuItem', 'name price category')
    
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' })
    }
    
    res.json(order)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
