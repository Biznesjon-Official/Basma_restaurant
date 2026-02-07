import mongoose, { Document, Schema } from 'mongoose'

export interface ICustomer extends Document {
  phone: string
  name?: string
  email?: string
  totalOrders: number
  totalSpent: number
  lastVisit: Date
  loyaltyPoints: number
  notes?: string
  isVIP: boolean
  createdAt: Date
  updatedAt: Date
}

const customerSchema = new Schema<ICustomer>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    notes: String,
    isVIP: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
customerSchema.index({ phone: 1 })
customerSchema.index({ totalSpent: -1 })
customerSchema.index({ totalOrders: -1 })
customerSchema.index({ isVIP: 1 })

export default mongoose.model<ICustomer>('Customer', customerSchema)
