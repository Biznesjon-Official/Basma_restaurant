import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  fullName: string
  phone: string
  role: 'admin' | 'waiter' | 'chef' | 'storekeeper' | 'cashier'
  password: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      index: true 
    },
    role: {
      type: String,
      enum: ['admin', 'waiter', 'chef', 'storekeeper', 'cashier'],
      default: 'waiter',
      index: true,
    },
    password: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Indexes for performance
UserSchema.index({ phone: 1, isActive: 1 })
UserSchema.index({ role: 1, isActive: 1 })

export default mongoose.model<IUser>('User', UserSchema)
