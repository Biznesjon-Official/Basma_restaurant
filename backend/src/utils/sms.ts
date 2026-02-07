import axios from 'axios'

interface SMSConfig {
  email: string
  password: string
  token?: string
  tokenExpiry?: Date
}

export class SMSService {
  private config: SMSConfig
  private baseUrl = 'https://notify.eskiz.uz/api'

  constructor() {
    this.config = {
      email: process.env.ESKIZ_EMAIL || '',
      password: process.env.ESKIZ_PASSWORD || '',
    }
  }

  // Get auth token
  async getToken(): Promise<string> {
    try {
      // Check if token is still valid
      if (this.config.token && this.config.tokenExpiry && this.config.tokenExpiry > new Date()) {
        return this.config.token
      }

      // Get new token
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: this.config.email,
        password: this.config.password,
      })

      if (response.data.data?.token) {
        this.config.token = response.data.data.token
        // Token expires in 30 days
        this.config.tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        return this.config.token as string
      }

      throw new Error('Token olinmadi')
    } catch (error: any) {
      console.error('❌ SMS token error:', error.message)
      throw error
    }
  }

  // Send SMS
  async sendSMS(phone: string, message: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if SMS is enabled
      if (!process.env.SMS_ENABLED || process.env.SMS_ENABLED !== 'true') {
        console.log('📱 SMS disabled, would send:', phone, message)
        return {
          success: true,
          message: 'SMS yuborildi (test mode)',
        }
      }

      // Format phone number (remove +, spaces, etc)
      const formattedPhone = phone.replace(/[^0-9]/g, '')

      // Get token
      const token = await this.getToken()

      // Send SMS
      const response = await axios.post(
        `${this.baseUrl}/message/sms/send`,
        {
          mobile_phone: formattedPhone,
          message: message,
          from: '4546',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.status === 'success') {
        console.log('✅ SMS sent to:', formattedPhone)
        return {
          success: true,
          message: 'SMS muvaffaqiyatli yuborildi',
        }
      }

      throw new Error(response.data.message || 'SMS yuborilmadi')
    } catch (error: any) {
      console.error('❌ SMS send error:', error.message)
      return {
        success: false,
        message: `SMS xatosi: ${error.message}`,
      }
    }
  }

  // Send order ready notification
  async sendOrderReadyNotification(phone: string, tableNumber: number): Promise<void> {
    const message = `BASMA OSH MARKAZI: Sizning buyurtmangiz tayyor! Stol: ${tableNumber}. Yoqimli ishtaha!`
    await this.sendSMS(phone, message)
  }

  // Send booking confirmation
  async sendBookingConfirmation(
    phone: string,
    tableNumber: number,
    date: string,
    time: string
  ): Promise<void> {
    const message = `BASMA OSH MARKAZI: Bron tasdiqlandi! Stol: ${tableNumber}, Sana: ${date}, Vaqt: ${time}`
    await this.sendSMS(phone, message)
  }

  // Send low stock alert
  async sendLowStockAlert(phone: string, itemName: string, quantity: number): Promise<void> {
    const message = `BASMA OSH MARKAZI: Ogohlantirish! ${itemName} kam qoldi. Qoldiq: ${quantity}`
    await this.sendSMS(phone, message)
  }

  // Send daily report
  async sendDailyReport(phone: string, revenue: number, orders: number): Promise<void> {
    const message = `BASMA OSH MARKAZI: Kunlik hisobot. Tushum: ${revenue.toLocaleString()} so'm, Buyurtmalar: ${orders} ta`
    await this.sendSMS(phone, message)
  }
}

export const smsService = new SMSService()
