import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { smsService } from '../utils/sms'
import { createActivityLog } from './activityLogController'

// Send test SMS
export const sendTestSMS = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, message } = req.body
    const userId = req.user?.userId

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Telefon raqam va xabar talab qilinadi',
      })
    }

    // Send SMS
    const result = await smsService.sendSMS(phone, message)

    // Log activity
    await createActivityLog(
      userId!,
      'send_sms',
      'sms',
      phone,
      { message, result },
      req.ip,
      req.get('user-agent')
    )

    res.json({
      success: true,
      message: 'SMS yuborildi',
      data: result,
    })
  } catch (error) {
    console.error('Send SMS error:', error)
    res.status(500).json({
      success: false,
      error: 'SMS yuborishda xatolik',
    })
  }
}

// Get SMS history
export const getSMSHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    const query: any = { action: 'send_sms', entity: 'sms' }

    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = new Date(startDate as string)
      if (endDate) query.timestamp.$lte = new Date(endDate as string)
    }

    // Note: This would require ActivityLog model
    // For now, return empty array
    res.json({
      success: true,
      data: [],
      message: 'SMS history feature coming soon',
    })
  } catch (error) {
    console.error('Get SMS history error:', error)
    res.status(500).json({
      success: false,
      error: 'SMS tarixini olishda xatolik',
    })
  }
}
