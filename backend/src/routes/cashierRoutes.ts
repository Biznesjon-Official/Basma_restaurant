import { Router } from 'express'
import {
  getOrdersForPayment,
  processPayment,
  getCashierStats,
} from '../controllers/cashierController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// All routes require cashier or admin role
router.use(authenticate, authorize('cashier', 'admin'))

// Get orders ready for payment
router.get('/orders', getOrdersForPayment)

// Process payment
router.post('/orders/:orderId/payment', processPayment)

// Get cashier statistics
router.get('/stats', getCashierStats)

export default router
