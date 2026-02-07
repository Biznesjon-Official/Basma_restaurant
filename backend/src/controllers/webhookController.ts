import { Request, Response } from 'express'
import Order from '../models/Order'
import { getIO } from '../config/socket'

// WEBSITE WEBHOOK (Faqat o'z saytimizdan)
export const websiteWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📥 Website dan buyurtma keldi:', req.body)

    const order = await Order.create({
      orderType: 'marketplace',
      marketplaceName: 'Website',
      marketplaceOrderId: req.body.orderId || `WEB-${Date.now()}`,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerAddress: req.body.customerAddress,
      deliveryType: req.body.deliveryType || 'delivery',
      deliveryFee: req.body.deliveryFee || 0,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      paymentType: req.body.paymentType || 'cash',
      status: 'pending',
    })

    const io = getIO()
    const populatedOrder = await Order.findById(order._id)
    io.emit('marketplace-order-created', populatedOrder)
    io.emit('order:new', populatedOrder)

    console.log('✅ Website buyurtma saqlandi:', order._id)

    res.json({ success: true, order_id: order._id })
  } catch (error) {
    console.error('❌ Website webhook xatolik:', error)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}
