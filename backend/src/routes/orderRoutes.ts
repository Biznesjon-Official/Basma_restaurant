import { Router } from 'express'
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  sendToKitchen,
  sendToCashier,
} from '../controllers/orderController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Public route - mijozlar QR code orqali buyurtma beradi
router.post('/public', createOrder)

// RBAC: Waiter should use /api/waiter/orders endpoint
router.get('/', authenticate, getOrders) // Allow all authenticated users to filter by orderType
router.get('/:id', authenticate, authorize('admin', 'waiter', 'cashier'), getOrderById) // Waiter can see their own
router.post('/', authenticate, authorize('admin', 'cashier'), createOrder)
router.put('/:id/status', authenticate, authorize('admin', 'chef', 'cashier', 'waiter'), updateOrderStatus) // Allow waiter to update status
router.patch('/:id/status', authenticate, authorize('admin', 'chef', 'cashier', 'waiter'), updateOrderStatus) // Allow PATCH too
router.post('/:id/send-to-kitchen', authenticate, authorize('admin', 'waiter'), sendToKitchen) // Waiter oshxonaga yuboradi
router.post('/:id/send-to-cashier', authenticate, authorize('admin', 'waiter'), sendToCashier) // Waiter kassaga yuboradi

export default router
