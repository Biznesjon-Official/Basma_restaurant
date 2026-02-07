import mongoose, { Schema, Document } from 'mongoose'

interface IPriceHistory {
  price: number
  date: Date
  changedBy: mongoose.Types.ObjectId
}

export interface IInventory extends Document {
  name: string
  unit: string
  quantity: number
  minQuantity: number
  price: number
  priceHistory: IPriceHistory[]
  supplier?: string
  category?: string
  lastRestockDate?: Date
  createdAt: Date
  updatedAt: Date
}

const InventorySchema = new Schema<IInventory>(
  {
    name: { type: String, required: true, trim: true, index: true },
    unit: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    minQuantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    priceHistory: [
      {
        price: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    supplier: { type: String, trim: true },
    category: { type: String, trim: true },
    lastRestockDate: { type: Date },
  },
  {
    timestamps: true,
  }
)

// Index for low stock alerts
InventorySchema.index({ quantity: 1, minQuantity: 1 })

// Virtual for low stock check
InventorySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minQuantity
})

export default mongoose.model<IInventory>('Inventory', InventorySchema)
