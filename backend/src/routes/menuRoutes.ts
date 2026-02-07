import { Router } from 'express'
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Public route - mijozlar menuni ko'rishi uchun
router.get('/public', getMenuItems)

// RBAC: Waiter should use /api/waiter/menu endpoint (read-only, without cost)
router.get('/', authenticate, authorize('admin'), getMenuItems)
router.post('/', authenticate, authorize('admin'), createMenuItem)
router.put('/:id', authenticate, authorize('admin'), updateMenuItem)
router.delete('/:id', authenticate, authorize('admin'), deleteMenuItem)

export default router
