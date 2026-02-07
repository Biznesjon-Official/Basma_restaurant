import { Router } from 'express'
import {
  getKitchenOrders,
  updateOrderStatus,
} from '../controllers/chefController'
import { authenticate, authorize } from '../middlewares/auth'
import { logChefAction } from '../middlewares/chefAuth'

const router = Router()

// All routes require chef authentication
const chefAuth = [authenticate, authorize('chef', 'admin')]

// Get all orders for kitchen (KDS)
router.get('/orders', chefAuth, getKitchenOrders)

// Update order status (preparing -> ready)
router.put(
  '/orders/:orderId/status',
  chefAuth,
  logChefAction('update_order_status'),
  updateOrderStatus
)

export default router
