import { Router } from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/userController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Only admin can manage users
router.get('/', authenticate, authorize('admin'), getUsers)
router.get('/:id', authenticate, authorize('admin'), getUserById)
router.post('/', authenticate, authorize('admin'), createUser)
router.put('/:id', authenticate, authorize('admin'), updateUser)
router.delete('/:id', authenticate, authorize('admin'), deleteUser)
router.patch('/:id/toggle-status', authenticate, authorize('admin'), toggleUserStatus)

export default router
