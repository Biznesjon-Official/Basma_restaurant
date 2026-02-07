import mongoose, { Schema, Document } from 'mongoose'

export interface IInventoryTransaction extends Document {
  inventoryItem: mongoose.Types.ObjectId
  type: 'receive' | 'write-off' | 'adjustment' | 'audit'
  quantity: number
  unit: string
  price?: number // Faqat receive uchun
  supplier?: string // Faqat receive uchun
  invoiceNumber?: string // Faqat receive uchun
  order?: mongoose.Types.ObjectId // Faqat write-off uchun
  reason?: string // adjustment va audit uchun
  balanceBefore: number
  balanceAfter: number
  performedBy: mongoose.Types.ObjectId
  createdAt: Date
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    inventoryItem: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['receive', 'write-off', 'adjustment', 'audit'],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    reason: {
      type: String,
      trim: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for reports
InventoryTransactionSchema.index({ createdAt: -1 })
InventoryTransactionSchema.index({ type: 1, createdAt: -1 })

export default mongoose.model<IInventoryTransaction>(
  'InventoryTransaction',
  InventoryTransactionSchema
)
