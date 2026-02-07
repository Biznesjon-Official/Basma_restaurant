import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Only admin can manage settings
router.get('/', authenticate, authorize('admin'), getSettings)
router.put('/', authenticate, authorize('admin'), updateSettings)

export default router
