import mongoose, { Schema, Document } from 'mongoose'

export interface IStaff extends Document {
  name: string
  role: 'admin' | 'waiter' | 'chef' | 'cashier' | 'storekeeper'
  phone: string
  avatar?: string
  status: 'active' | 'inactive'
  shift: 'morning' | 'evening' | 'night'
  createdAt: Date
  updatedAt: Date
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['admin', 'waiter', 'chef', 'cashier', 'storekeeper'],
      required: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    avatar: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    shift: {
      type: String,
      enum: ['morning', 'evening', 'night'],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
StaffSchema.index({ status: 1, role: 1 })
StaffSchema.index({ shift: 1, status: 1 })

export default mongoose.model<IStaff>('Staff', StaffSchema)
