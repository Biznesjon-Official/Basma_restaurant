import mongoose, { Schema, Document } from 'mongoose'

export interface IWaiterCall extends Document {
  table: mongoose.Types.ObjectId
  tableNumber: number
  status: 'pending' | 'responded' | 'completed'
  message?: string
  respondedBy?: mongoose.Types.ObjectId
  respondedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const WaiterCallSchema = new Schema<IWaiterCall>(
  {
    table: { 
      type: Schema.Types.ObjectId, 
      ref: 'Table', 
      required: true,
      index: true 
    },
    tableNumber: { 
      type: Number, 
      required: true,
      index: true 
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'completed'],
      default: 'pending',
      index: true,
    },
    message: { 
      type: String, 
      trim: true,
      default: 'Ofitsant chaqirildi' 
    },
    respondedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    respondedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
WaiterCallSchema.index({ status: 1, createdAt: -1 })
WaiterCallSchema.index({ tableNumber: 1, status: 1 })

export default mongoose.model<IWaiterCall>('WaiterCall', WaiterCallSchema)
