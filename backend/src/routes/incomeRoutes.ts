import express from 'express'
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController'
import { authenticate, authorize } from '../middlewares/auth'

const router = express.Router()

// Admin and cashier can manage incomes
router.get('/', authenticate, authorize('admin', 'cashier'), getIncomes)
router.post('/', authenticate, authorize('admin', 'cashier'), createIncome)
router.put('/:id', authenticate, authorize('admin', 'cashier'), updateIncome)
router.delete('/:id', authenticate, authorize('admin', 'cashier'), deleteIncome)

export default router
