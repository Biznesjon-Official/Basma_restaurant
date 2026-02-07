import mongoose, { Schema, Document } from 'mongoose'

interface IOrderItem {
  menuItem?: mongoose.Types.ObjectId
  menuItemId?: mongoose.Types.ObjectId
  menuItemName?: string
  name?: string
  quantity: number
  price: number
  specialInstructions?: string
}

export interface IOrder extends Document {
  // ============================================
  // ORDER TYPE - Buyurtma turi
  // ============================================
  orderType: 'restaurant' | 'marketplace'
  
  // ============================================
  // RESTAURANT ORDER - Restoran ichidagi buyurtmalar
  // ============================================
  table?: mongoose.Types.ObjectId
  tableNumber?: number
  waiter?: mongoose.Types.ObjectId
  
  // ============================================
  // MARKETPLACE ORDER - Tashqi platformalardan
  // ============================================
  marketplaceOrderId?: string
  marketplaceName?: 'Yandex' | 'Uzum' | 'Telegram' | 'Website' | 'Other'
  
  // ============================================
  // CUSTOMER INFO - Mijoz ma'lumotlari
  // ============================================
  userId?: mongoose.Types.ObjectId  // Ro'yxatdan o'tgan mijoz
  customerName?: string              // Guest yoki marketplace mijoz
  customerPhone?: string
  customerAddress?: string
  
  // ============================================
  // DELIVERY INFO - Yetkazib berish (Optional - kelajak uchun)
  // ============================================
  deliveryType?: 'delivery' | 'pickup' | 'dine-in'
  deliveryFee?: number
  deliveryTime?: Date
  deliveryAddress?: string
  
  // ============================================
  // ORDER ITEMS - Buyurtma mahsulotlari
  // ============================================
  items: IOrderItem[]
  
  // ============================================
  // PRICING - Narxlar
  // ============================================
  subtotal?: number          // Mahsulotlar summasi
  serviceFee?: number        // Xizmat to'lovi
  discount?: number          // Chegirma
  totalAmount: number        // Jami summa
  
  // ============================================
  // STATUS - Holat
  // ============================================
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
  
  // ============================================
  // PAYMENT - To'lov
  // ============================================
  paymentMethod?: 'cash' | 'card' | 'online' | 'prepaid'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  paidAt?: Date
  
  // ============================================
  // ADDITIONAL INFO - Qo'shimcha
  // ============================================
  specialInstructions?: string
  priority?: 'normal' | 'urgent' | 'vip'
  
  // ============================================
  // TIMESTAMPS - Vaqt belgilari
  // ============================================
  preparationStartedAt?: Date
  readyAt?: Date
  servedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  
  createdAt: Date
  updatedAt: Date
  
  // ============================================
  // METHODS
  // ============================================
  calculateTotal(): number
  markAsPaid(): Promise<this>
  cancel(reason: string): Promise<this>
}

const OrderSchema = new Schema<IOrder>(
  {
    // ============================================
    // ORDER TYPE
    // ============================================
    orderType: {
      type: String,
      enum: ['restaurant', 'marketplace'],
      required: true,
      default: 'restaurant',
      index: true,
    },
    
    // ============================================
    // RESTAURANT ORDER
    // ============================================
    table: { 
      type: Schema.Types.ObjectId, 
      ref: 'Table',
      index: true,
    },
    tableNumber: { 
      type: Number, 
      index: true,
    },
    waiter: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true,
    },
    
    // ============================================
    // MARKETPLACE ORDER (Faqat o'z saytimizdan)
    // ============================================
    marketplaceOrderId: { 
      type: String, 
      sparse: true, 
      unique: true,
      index: true,
    },
    marketplaceName: { 
      type: String,
      default: 'Website',
      index: true,
    },
    
    // ============================================
    // CUSTOMER INFO
    // ============================================
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true,
    },
    customerName: { 
      type: String, 
      trim: true,
      index: true,
    },
    customerPhone: { 
      type: String, 
      trim: true,
      index: true,
    },
    customerAddress: { 
      type: String, 
      trim: true,
    },
    
    // ============================================
    // DELIVERY INFO (Optional - kelajak uchun)
    // ============================================
    deliveryType: {
      type: String,
      enum: ['delivery', 'pickup', 'dine-in'],
    },
    deliveryFee: { 
      type: Number, 
      default: 0, 
      min: 0,
    },
    deliveryTime: { 
      type: Date,
    },
    deliveryAddress: { 
      type: String, 
      trim: true,
    },
    
    // ============================================
    // ORDER ITEMS
    // ============================================
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        menuItemName: { type: String },
        name: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        specialInstructions: { type: String, trim: true },
      },
    ],
    
    // ============================================
    // PRICING
    // ============================================
    subtotal: { 
      type: Number, 
      min: 0,
    },
    serviceFee: { 
      type: Number, 
      default: 0, 
      min: 0,
    },
    discount: { 
      type: Number, 
      default: 0, 
      min: 0,
    },
    totalAmount: { 
      type: Number, 
      required: true,
      min: 0,
      index: true,
    },
    
    // ============================================
    // STATUS
    // ============================================
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
      default: 'pending',
      required: true,
      index: true,
    },
    
    // ============================================
    // PAYMENT
    // ============================================
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'prepaid'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    paidAt: { 
      type: Date,
      index: true,
    },
    
    // ============================================
    // ADDITIONAL INFO
    // ============================================
    specialInstructions: { 
      type: String, 
      trim: true,
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'vip'],
      default: 'normal',
      index: true,
    },
    
    // ============================================
    // TIMESTAMPS
    // ============================================
    preparationStartedAt: { type: Date },
    readyAt: { type: Date },
    servedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { 
      type: String, 
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================
// INDEXES - Tezkor qidiruv uchun
// ============================================
OrderSchema.index({ status: 1, createdAt: -1 })
OrderSchema.index({ orderType: 1, status: 1 })
OrderSchema.index({ tableNumber: 1, status: 1 })
OrderSchema.index({ customerPhone: 1, createdAt: -1 })
OrderSchema.index({ marketplaceName: 1, status: 1 })
OrderSchema.index({ waiter: 1, status: 1 })
OrderSchema.index({ createdAt: -1 })

// ============================================
// VIRTUAL FIELDS - Hisoblangan maydonlar
// ============================================
OrderSchema.virtual('isActive').get(function() {
  const doc = this as any
  return !['completed', 'cancelled'].includes(doc.status)
})

OrderSchema.virtual('isPaid').get(function() {
  const doc = this as any
  return doc.paymentStatus === 'paid'
})

// ============================================
// METHODS - Instance metodlar
// ============================================
OrderSchema.methods.calculateTotal = function() {
  const itemsTotal = this.items.reduce((sum: number, item: IOrderItem) => {
    return sum + (item.price * item.quantity)
  }, 0)
  
  this.subtotal = itemsTotal
  this.totalAmount = itemsTotal + (this.deliveryFee || 0) + (this.serviceFee || 0) - (this.discount || 0)
  
  return this.totalAmount
}

OrderSchema.methods.markAsPaid = function() {
  this.paymentStatus = 'paid'
  this.paidAt = new Date()
  return this.save()
}

OrderSchema.methods.cancel = function(reason: string) {
  this.status = 'cancelled'
  this.cancelledAt = new Date()
  this.cancelReason = reason
  return this.save()
}

// ============================================
// STATICS - Model metodlar
// ============================================
OrderSchema.statics.getActiveOrders = function() {
  return this.find({
    status: { $nin: ['completed', 'cancelled'] }
  }).sort({ createdAt: -1 })
}

OrderSchema.statics.getTodayOrders = function() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return this.find({
    createdAt: { $gte: today }
  }).sort({ createdAt: -1 })
}

OrderSchema.statics.getMarketplaceOrders = function(status?: string) {
  const query: any = { orderType: 'marketplace' }
  if (status) {
    query.status = status
  }
  return this.find(query).sort({ createdAt: -1 })
}

// ============================================
// MIDDLEWARE - Pre/Post hooks
// ============================================

// Auto-calculate total before saving
OrderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('deliveryFee') || this.isModified('serviceFee') || this.isModified('discount')) {
    (this as any).calculateTotal()
  }
  next()
})

// Update timestamps based on status
OrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date()
    const doc = this as any
    
    switch (doc.status) {
      case 'preparing':
        if (!doc.preparationStartedAt) doc.preparationStartedAt = now
        break
      case 'ready':
        if (!doc.readyAt) doc.readyAt = now
        break
      case 'served':
        if (!doc.servedAt) doc.servedAt = now
        break
      case 'completed':
        if (!doc.completedAt) doc.completedAt = now
        break
      case 'cancelled':
        if (!doc.cancelledAt) doc.cancelledAt = now
        break
    }
  }
  next()
})

export default mongoose.model<IOrder>('Order', OrderSchema)
