import express from 'express'
import {
  getMarketplaceOrders,
  createMarketplaceOrder,
  acceptMarketplaceOrder,
  updateMarketplaceOrderStatus,
  cancelMarketplaceOrder,
  getMarketplaceOrderById,
} from '../controllers/marketplaceOrderController'
import { authenticate } from '../middlewares/auth'

const router = express.Router()

// Public route - webhook uchun (tashqi saytlardan)
router.post('/webhook', createMarketplaceOrder)

// Protected routes
router.get('/', authenticate, getMarketplaceOrders)
router.get('/:id', authenticate, getMarketplaceOrderById)
router.patch('/:id/accept', authenticate, acceptMarketplaceOrder)
router.patch('/:id/status', authenticate, updateMarketplaceOrderStatus)
router.patch('/:id/cancel', authenticate, cancelMarketplaceOrder)

export default router
