import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Order from '../models/Order'
import { createActivityLog } from './activityLogController'
import { emitOrderStatusUpdate } from '../config/socket'

// Get all orders for kitchen (KDS - Kitchen Display System)
// RBAC: Chef can see ALL orders, but CANNOT modify items or prices
export const getKitchenOrders = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string

    // RBAC: Chef sees orders that need preparation
    const query: any = {
      status: { $in: ['preparing', 'ready'] },
    }

    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name category preparationTime') // Only necessary fields
      .populate('table', 'number')
      .populate('waiter', 'fullName')
      .sort({ createdAt: 1 }) // FIFO - First In First Out
      .limit(100)

    res.json({ success: true, data: orders })
  } catch (error) {
    console.error('Get kitchen orders error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmalarni olishda xatolik' })
  }
}

// Update order status
// RBAC: Chef can ONLY change status: preparing -> ready
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    const chefId = req.user?.userId

    // RBAC: Validate allowed status transitions
    const allowedStatuses = ['ready']
    if (!allowedStatuses.includes(status)) {
      console.warn('🚫 Chef attempted invalid status change:', {
        chef: chefId,
        orderId,
        attemptedStatus: status,
      })
      
      return res.status(403).json({
        success: false,
        error: 'Faqat "ready" statusiga o\'zgartirish mumkin',
      })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // RBAC: Can only update orders in 'preparing' status
    if (order.status !== 'preparing') {
      console.warn('🚫 Chef attempted to update non-preparing order:', {
        chef: chefId,
        orderId,
        currentStatus: order.status,
      })
      
      return res.status(400).json({
        success: false,
        error: 'Faqat tayyorlanayotgan buyurtmalarni yangilash mumkin',
      })
    }

    // Update status
    order.status = status
    await order.save()

    // Log action
    await createActivityLog(
      chefId!,
      'status_change',
      'order',
      order._id.toString(),
      { from: 'preparing', to: status },
      req.ip,
      req.get('user-agent')
    )

    // Emit socket event to waiter
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('table')
      .populate('waiter')

    emitOrderStatusUpdate(populatedOrder)
    console.log('📤 Socket: Buyurtma tayyor, ofitsiantga xabar yuborildi', order._id)

    res.json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ success: false, error: 'Statusni yangilashda xatolik' })
  }
}
