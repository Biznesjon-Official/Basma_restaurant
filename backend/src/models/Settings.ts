import mongoose, { Document, Schema } from 'mongoose'

export interface ISettings extends Document {
  restaurantName: string
  restaurantPhone: string
  restaurantAddress: string
  currency: string
  timezone: string
  taxRate: number
  serviceCharge: number
  telegram: {
    enabled: boolean
    botToken?: string
    chatId?: string
    notifications: {
      dailyReport: boolean
      weeklyReport: boolean
      monthlyReport: boolean
      lowStock: boolean
      newOrder: boolean
    }
  }
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  business: {
    openTime: string
    closeTime: string
    workingDays: string[]
  }
  updatedBy: mongoose.Types.ObjectId
  updatedAt: Date
}

const settingsSchema = new Schema<ISettings>(
  {
    restaurantName: {
      type: String,
      default: 'BASMA Osh Markazi',
    },
    restaurantPhone: String,
    restaurantAddress: String,
    currency: {
      type: String,
      default: 'UZS',
    },
    timezone: {
      type: String,
      default: 'Asia/Tashkent',
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    telegram: {
      enabled: {
        type: Boolean,
        default: false,
      },
      botToken: String,
      chatId: String,
      notifications: {
        dailyReport: { type: Boolean, default: false },
        weeklyReport: { type: Boolean, default: false },
        monthlyReport: { type: Boolean, default: false },
        lowStock: { type: Boolean, default: false },
        newOrder: { type: Boolean, default: false },
      },
    },
    notifications: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    business: {
      openTime: { type: String, default: '08:00' },
      closeTime: { type: String, default: '23:00' },
      workingDays: {
        type: [String],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<ISettings>('Settings', settingsSchema)
