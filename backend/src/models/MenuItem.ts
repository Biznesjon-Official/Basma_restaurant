import mongoose, { Schema, Document } from 'mongoose'

export interface IMenuItem extends Document {
  name: string
  category: string
  price: number
  cost: number
  image?: string
  available: boolean
  preparationTime: number
  createdAt: Date
  updatedAt: Date
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    image: { type: String },
    available: { type: Boolean, default: true, index: true },
    preparationTime: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
MenuItemSchema.index({ name: 1, category: 1 })
MenuItemSchema.index({ available: 1, category: 1 })

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema)
