import { Router } from 'express'
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
} from '../controllers/inventoryController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// RBAC: Waiter should NOT access inventory
router.get('/', authenticate, authorize('admin', 'storekeeper'), getInventory)
router.post('/', authenticate, authorize('admin', 'storekeeper'), createInventoryItem)
router.put('/:id', authenticate, authorize('admin', 'storekeeper'), updateInventoryItem)

export default router
