import { Router } from 'express'
import { getActivityLogs } from '../controllers/activityLogController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Only admin can view activity logs (read-only)
router.get('/', authenticate, authorize('admin'), getActivityLogs)

export default router
