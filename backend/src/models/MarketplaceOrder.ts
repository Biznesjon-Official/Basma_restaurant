import mongoose, { Schema, Document } from 'mongoose'

interface IMarketplaceOrderItem {
  menuItem?: mongoose.Types.ObjectId
  menuItemName: string
  quantity: number
  price: number
  specialInstructions?: string
}

export interface IMarketplaceOrder extends Document {
  marketplaceOrderId: string
  marketplaceName: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: IMarketplaceOrderItem[]
  totalAmount: number
  deliveryFee?: number
  status: 'new' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
  orderType: 'delivery' | 'dine-in'
  deliveryType: 'delivery' | 'pickup'
  deliveryTime?: Date
  table?: mongoose.Types.ObjectId
  tableNumber?: number
  courier?: mongoose.Types.ObjectId
  paymentType: 'cash' | 'card' | 'online' | 'prepaid'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paidAt?: Date
  specialInstructions?: string
  priority?: 'normal' | 'urgent'
  acceptedAt?: Date
  preparationStartedAt?: Date
  readyAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  acceptedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MarketplaceOrderSchema = new Schema<IMarketplaceOrder>(
  {
    marketplaceOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    marketplaceName: {
      type: String,
      required: true,
      enum: ['Yandex', 'Uzum', 'Telegram', 'Website', 'Other'],
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, trim: true },
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        menuItemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        specialInstructions: { type: String, trim: true },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['new', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
      default: 'new',
      index: true,
    },
    orderType: {
      type: String,
      enum: ['delivery', 'dine-in'],
      required: true,
      default: 'delivery',
      index: true,
    },
    deliveryType: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
      default: 'delivery',
    },
    deliveryTime: Date,
    table: { type: Schema.Types.ObjectId, ref: 'Table' },
    tableNumber: { type: Number },
    courier: { type: Schema.Types.ObjectId, ref: 'User' },
    paymentType: {
      type: String,
      enum: ['cash', 'card', 'online', 'prepaid'],
      required: true,
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
      index: true,
    },
    paidAt: Date,
    specialInstructions: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
      index: true,
    },
    acceptedAt: Date,
    preparationStartedAt: Date,
    readyAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: { type: String, trim: true },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
)

MarketplaceOrderSchema.index({ status: 1, createdAt: -1 })
MarketplaceOrderSchema.index({ marketplaceName: 1, status: 1 })
MarketplaceOrderSchema.index({ customerPhone: 1 })
MarketplaceOrderSchema.index({ paymentStatus: 1 })

export default mongoose.model<IMarketplaceOrder>('MarketplaceOrder', MarketplaceOrderSchema)
