import mongoose, { Schema, Document } from 'mongoose'

export interface ITable extends Document {
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  currentOrder?: mongoose.Types.ObjectId
  currentWaiter?: mongoose.Types.ObjectId
  qrCode: string
  qrCodeUrl: string
  createdAt: Date
  updatedAt: Date
}

const TableSchema = new Schema<ITable>(
  {
    number: { type: Number, required: true, unique: true, index: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'cleaning'],
      default: 'available',
      index: true,
    },
    currentOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    currentWaiter: { type: Schema.Types.ObjectId, ref: 'User' },
    qrCode: { type: String, required: true, unique: true, index: true },
    qrCodeUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<ITable>('Table', TableSchema)
