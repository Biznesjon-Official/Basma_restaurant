import { Router } from 'express'
import {
  getRevenueAnalytics,
  getTopSellingItems,
  getLowPerformingItems,
  getStaffPerformance,
  getExpenseAnalytics,
  getDashboardSummary,
  getProfitLossReport,
  getItemProfitability,
} from '../controllers/analyticsController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// All analytics routes are admin and cashier accessible (read-only)
router.get('/revenue', authenticate, authorize('admin', 'cashier'), getRevenueAnalytics)
router.get('/top-selling', authenticate, authorize('admin', 'cashier'), getTopSellingItems)
router.get('/low-performing', authenticate, authorize('admin', 'cashier'), getLowPerformingItems)
router.get('/staff-performance', authenticate, authorize('admin', 'cashier'), getStaffPerformance)
router.get('/expenses', authenticate, authorize('admin', 'cashier'), getExpenseAnalytics)
router.get('/dashboard', authenticate, authorize('admin', 'cashier'), getDashboardSummary)
router.get('/profit-loss', authenticate, authorize('admin', 'cashier'), getProfitLossReport)
router.get('/profitability', authenticate, authorize('admin', 'cashier'), getItemProfitability)

export default router
