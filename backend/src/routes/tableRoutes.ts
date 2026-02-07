import { Router } from 'express'
import { 
  getTables, 
  createTable, 
  updateTable, 
  getTableByQrCode, 
  regenerateQrCode,
  getTableQrCodeImage,
  getTableQrCodeSvg,
  getTableQrCodeDataUrl
} from '../controllers/tableController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

// Public route - QR code orqali stolni topish
router.get('/qr/:qrCode', getTableByQrCode)

// RBAC: Waiter should use /api/waiter/tables endpoint (only their tables)
router.get('/', authenticate, authorize('admin', 'cashier'), getTables)
router.post('/', authenticate, authorize('admin', 'cashier'), createTable)
router.put('/:id', authenticate, authorize('admin', 'cashier'), updateTable)
router.post('/:id/regenerate-qr', authenticate, authorize('admin'), regenerateQrCode)

// QR code image endpoints
router.get('/:id/qr-data', authenticate, authorize('admin', 'cashier'), getTableQrCodeDataUrl)
router.get('/:id/qr-image', authenticate, authorize('admin', 'cashier'), getTableQrCodeImage)
router.get('/:id/qr-svg', authenticate, authorize('admin', 'cashier'), getTableQrCodeSvg)

export default router
