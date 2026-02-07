import { Router } from 'express'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Admin and cashier can manage expenses
router.get('/', authenticate, authorize('admin', 'cashier'), getExpenses)
router.post('/', authenticate, authorize('admin', 'cashier'), createExpense)
router.put('/:id', authenticate, authorize('admin', 'cashier'), updateExpense)
router.delete('/:id', authenticate, authorize('admin', 'cashier'), deleteExpense)

export default router
