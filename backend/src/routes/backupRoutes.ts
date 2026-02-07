import { Router } from 'express'
import { createBackup, listBackups, restoreBackup } from '../controllers/backupController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Only admin can manage backups
router.post('/create', authenticate, authorize('admin'), createBackup)
router.get('/list', authenticate, authorize('admin'), listBackups)
router.post('/restore', authenticate, authorize('admin'), restoreBackup)

export default router
