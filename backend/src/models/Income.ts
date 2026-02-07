import mongoose, { Document, Schema } from 'mongoose'

export interface IIncome extends Document {
  category: string
  amount: number
  description: string
  date: Date
  createdBy: mongoose.Types.ObjectId
  source: 'order' | 'manual' // order = from paid orders, manual = manually added
  orderId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const incomeSchema = new Schema<IIncome>(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: String,
      enum: ['order', 'manual'],
      default: 'manual',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
incomeSchema.index({ date: -1 })
incomeSchema.index({ category: 1, date: -1 })
incomeSchema.index({ source: 1 })

export default mongoose.model<IIncome>('Income', incomeSchema)
