import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import Table from '../models/Table'
import Order from '../models/Order'

// Check if waiter owns the table
export const checkTableOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tableId = req.params.tableId || req.body.tableId
    const userId = req.user?.userId

    if (!tableId) {
      return res.status(400).json({
        success: false,
        error: 'Table ID talab qilinadi',
      })
    }

    const table = await Table.findById(tableId)

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Stol topilmadi',
      })
    }

    // Admin can access all tables
    if (req.user?.role === 'admin') {
      return next()
    }

    // Waiter can only access their assigned tables
    if (req.user?.role === 'waiter') {
      if (table.currentWaiter?.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Sizda bu stolga kirish huquqi yo\'q',
        })
      }
    }

    next()
  } catch (error) {
    console.error('Table ownership check error:', error)
    res.status(500).json({ success: false, error: 'Xatolik yuz berdi' })
  }
}

// Check if waiter owns the order
export const checkOrderOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id || req.params.orderId
    const userId = req.user?.userId

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID talab qilinadi',
      })
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Buyurtma topilmadi',
      })
    }

    // Admin can access all orders
    if (req.user?.role === 'admin') {
      return next()
    }

    // Waiter can only access their own orders
    if (req.user?.role === 'waiter') {
      if (order.waiter?.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Sizda bu buyurtmaga kirish huquqi yo\'q',
        })
      }
    }

    next()
  } catch (error) {
    console.error('Order ownership check error:', error)
    res.status(500).json({ success: false, error: 'Xatolik yuz berdi' })
  }
}

// Prevent modification of closed orders
// RBAC: Closed/paid orders are IMMUTABLE
export const preventClosedOrderModification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id || req.params.orderId

    if (!orderId) {
      return next()
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Buyurtma topilmadi',
      })
    }

    // RBAC: Paid orders cannot be modified under any circumstances
    if (order.status === 'completed' || order.paymentStatus === 'paid') {
      console.warn('🚫 Attempt to modify closed order:', {
        orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        waiter: req.user?.userId,
        ip: req.ip,
      })
      
      return res.status(403).json({
        success: false,
        error: 'Yopilgan buyurtmani o\'zgartirish mumkin emas',
      })
    }

    next()
  } catch (error) {
    console.error('Closed order check error:', error)
    res.status(500).json({ success: false, error: 'Xatolik yuz berdi' })
  }
}

// Log waiter actions
// RBAC: ALL write operations MUST be logged
export const logWaiterAction = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // SECURITY: Log all waiter actions for audit trail
      console.log('🔐 RBAC Waiter Action:', {
        action,
        waiter: req.user?.userId,
        role: req.user?.role,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        params: req.params,
        body: req.body,
      })
      
      // Store original send function
      const originalSend = res.json.bind(res)
      
      // Override send to log response
      res.json = function(data: any) {
        console.log('📤 RBAC Action Result:', {
          action,
          waiter: req.user?.userId,
          success: data.success,
          timestamp: new Date().toISOString(),
        })
        return originalSend(data)
      }
      
      next()
    } catch (error) {
      console.error('❌ Logging error:', error)
      next() // Don't block the request if logging fails
    }
  }
}
