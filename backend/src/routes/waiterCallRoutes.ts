import express from 'express'
import {
  createWaiterCall,
  getWaiterCalls,
  respondToCall,
  completeCall,
  checkTableCall,
} from '../controllers/waiterCallController'
import { authenticate, authorize } from '../middlewares/auth'

const router = express.Router()

// Public route - mijoz QR code orqali chaqiradi
router.post('/', createWaiterCall)
router.get('/check/:tableId', checkTableCall)

// Protected routes - waiter uchun
router.get('/', authenticate, authorize('waiter', 'admin'), getWaiterCalls)
router.patch('/:id/respond', authenticate, authorize('waiter', 'admin'), respondToCall)
router.patch('/:id/complete', authenticate, authorize('waiter', 'admin'), completeCall)

export default router
