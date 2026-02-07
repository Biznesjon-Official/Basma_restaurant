import express from 'express'
import {
  websiteWebhook,
} from '../controllers/webhookController'

const router = express.Router()

// Faqat o'z saytimizdan buyurtma qabul qilish
router.post('/order', websiteWebhook)

export default router
