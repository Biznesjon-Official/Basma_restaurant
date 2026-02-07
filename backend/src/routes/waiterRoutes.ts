import { Router } from 'express'
import {
  getMyTables,
  getMyOrders,
  createWaiterOrder,
  addItemsToOrder,
  submitOrderToKitchen,
  markAsServed,
  getAvailableMenu,
} from '../controllers/waiterController'
import { authenticate, authorize } from '../middlewares/auth'
import {
  checkOrderOwnership,
  preventClosedOrderModification,
  logWaiterAction,
} from '../middlewares/waiterAuth'

const router = Router()

// All routes require waiter authentication
const waiterAuth = [authenticate, authorize('waiter', 'admin')]

// Get waiter's tables
router.get('/tables', waiterAuth, getMyTables)

// Get waiter's orders
router.get('/orders', waiterAuth, getMyOrders)

// Get available menu (read-only)
router.get('/menu', waiterAuth, getAvailableMenu)

// Create new order
router.post(
  '/orders',
  waiterAuth,
  logWaiterAction('create_order'),
  createWaiterOrder
)

// Add items to order
router.post(
  '/orders/:orderId/items',
  waiterAuth,
  checkOrderOwnership,
  preventClosedOrderModification,
  logWaiterAction('add_items'),
  addItemsToOrder
)

// Submit order to kitchen
router.post(
  '/orders/:orderId/submit',
  waiterAuth,
  checkOrderOwnership,
  preventClosedOrderModification,
  logWaiterAction('submit_to_kitchen'),
  submitOrderToKitchen
)

// Mark order as served (ready for cashier)
router.post(
  '/orders/:orderId/served',
  waiterAuth,
  checkOrderOwnership,
  logWaiterAction('mark_as_served'),
  markAsServed
)

export default router
