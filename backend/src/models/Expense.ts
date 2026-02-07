import mongoose, { Document, Schema } from 'mongoose'

export interface IExpense extends Document {
  category: string
  amount: number
  description: string
  date: Date
  createdBy: mongoose.Types.ObjectId
  attachments?: string[]
  isRecurring: boolean
  createdAt: Date
  updatedAt: Date
}

const expenseSchema = new Schema<IExpense>(
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
    attachments: [String],
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
expenseSchema.index({ date: -1 })
expenseSchema.index({ category: 1, date: -1 })

export default mongoose.model<IExpense>('Expense', expenseSchema)
