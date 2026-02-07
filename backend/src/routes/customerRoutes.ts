import { Router } from 'express'
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getTopCustomers,
} from '../controllers/customerController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Admin can view and manage customers (CRM)
router.get('/', authenticate, authorize('admin'), getCustomers)
router.get('/top', authenticate, authorize('admin'), getTopCustomers)
router.get('/:id', authenticate, authorize('admin'), getCustomerById)
router.post('/', authenticate, authorize('admin'), createCustomer)
router.put('/:id', authenticate, authorize('admin'), updateCustomer)

export default router
