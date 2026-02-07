import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Order from '../models/Order'
import { getIO } from '../config/socket'

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 0 // 0 = no limit
    const status = req.query.status as string
    const paymentStatus = req.query.paymentStatus as string
    const tableNumber = req.query.tableNumber as string
    const orderType = req.query.orderType as string

    const query: any = {}

    // Status filter - support multiple statuses
    if (status) {
      const statuses = status.split(',')
      query.status = { $in: statuses }
    } else if (!paymentStatus) {
      // Default: faqat faol buyurtmalar (to'lanmaganlar)
      query.paymentStatus = { $ne: 'paid' }
    }

    // PaymentStatus filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus
    }

    if (tableNumber) query.tableNumber = parseInt(tableNumber)

    // OrderType filter - optional
    if (orderType) {
      query.orderType = orderType
    }

    const skip = limit > 0 ? (page - 1) * limit : 0

    const ordersQuery = Order.find(query)
      .populate('items.menuItem')
      .populate('waiter', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)

    // Apply limit only if specified
    if (limit > 0) {
      ordersQuery.limit(limit)
    }

    const [orders, total] = await Promise.all([
      ordersQuery,
      Order.countDocuments(query),
    ])

    // Tashqi sayt buyurtmalari uchun menuItemName ni to'ldirish
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject() as any

      // Backward compatibility: totalAmount ni total sifatida ham qaytarish
      if (orderObj.totalAmount && !orderObj.total) {
        orderObj.total = orderObj.totalAmount
      }

      // Backward compatibility: paymentMethod ni paymentType sifatida ham qaytarish
      if (orderObj.paymentMethod && !orderObj.paymentType) {
        orderObj.paymentType = orderObj.paymentMethod
      }

      // Agar marketplace buyurtma bo'lsa va menuItem populate bo'lmagan bo'lsa
      if (orderObj.orderType === 'marketplace' || !orderObj.orderType) {
        orderObj.items = orderObj.items.map((item: any) => {
          // menuItemId ni menuItem ga ko'chirish
          if (!item.menuItem && item.menuItemId) {
            item.menuItem = item.menuItemId
          }

          // name ni menuItemName ga ko'chirish
          if (!item.menuItemName && item.name) {
            item.menuItemName = item.name
          }

          // Agar menuItem yo'q bo'lsa, menuItemName yoki name dan foydalanish
          if (!item.menuItem) {
            const itemName = item.menuItemName || item.name || 'Noma\'lum mahsulot'
            return {
              ...item,
              menuItem: {
                _id: item.menuItemId || null,
                name: itemName,
                price: item.price
              }
            }
          }
          return item
        })
      }

      return orderObj
    })

    console.log('📤 Buyurtmalar yuborilmoqda:', {
      total: processedOrders.length,
      marketplace: processedOrders.filter((o: any) => o.orderType === 'marketplace').length,
      restaurant: processedOrders.filter((o: any) => o.orderType === 'restaurant').length
    })

    res.json({
      success: true,
      data: processedOrders,
      pagination: {
        page,
        limit: limit || total,
        total,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
      },
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmalarni olishda xatolik' })
  }
}

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem')

    if (!order) {
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    const orderObj = order.toObject()

    // Tashqi sayt buyurtmalari uchun menuItemName ni to'ldirish
    if (orderObj.orderType === 'marketplace') {
      orderObj.items = orderObj.items.map((item: any) => {
        if (!item.menuItem && item.menuItemName) {
          return {
            ...item,
            menuItem: {
              _id: null,
              name: item.menuItemName,
              price: item.price
            }
          }
        }
        return item
      })
    }

    res.json({ success: true, data: orderObj })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ success: false, error: 'Buyurtmani olishda xatolik' })
  }
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📝 Yangi buyurtma yaratilmoqda:', {
      orderType: req.body.orderType,
      tableNumber: req.body.tableNumber,
      itemsCount: req.body.items?.length,
      totalAmount: req.body.totalAmount,
      hasGuestInfo: !!req.body.guestInfo,
      userId: req.body.userId
    })

    // Auto-detect orderType if not provided
    let orderData = { ...req.body }
    
    // guestInfo ni customerName va customerPhone ga convert qilish
    if (orderData.guestInfo) {
      orderData.customerName = orderData.guestInfo.name
      orderData.customerPhone = orderData.guestInfo.phone
      delete orderData.guestInfo
      console.log('👤 Guest info converted:', {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone
      })
    }
    
    // Agar orderType yo'q bo'lsa, avtomatik aniqlash
    if (!orderData.orderType) {
      // Agar table yoki tableNumber bo'lsa - restaurant
      if (orderData.table || orderData.tableNumber) {
        orderData.orderType = 'restaurant'
        console.log('🏪 OrderType avtomatik: restaurant (table mavjud)')
      } 
      // Agar customerName/customerPhone bo'lsa yoki userId yo'q bo'lsa - marketplace
      else if (orderData.customerName || orderData.customerPhone || !orderData.userId) {
        orderData.orderType = 'marketplace'
        console.log('🌐 OrderType avtomatik: marketplace (guest buyurtma)')
      }
      // Default: restaurant
      else {
        orderData.orderType = 'restaurant'
        console.log('🏪 OrderType avtomatik: restaurant (default)')
      }
    }

    // Agar status 'new' bo'lsa, 'pending' ga o'zgartirish
    if (orderData.status === 'new' || !orderData.status) {
      orderData.status = 'pending'
      console.log('📋 Status avtomatik: pending')
    }

    // paymentMethod mapping: click/payme/uzum -> online
    if (orderData.paymentMethod) {
      const methodMap: Record<string, string> = {
        'click': 'online',
        'payme': 'online',
        'uzum': 'online',
        'cash': 'cash',
        'card': 'card',
        'online': 'online',
        'prepaid': 'prepaid'
      }
      const mappedMethod = methodMap[orderData.paymentMethod.toLowerCase()]
      if (mappedMethod) {
        orderData.paymentMethod = mappedMethod
        console.log('💳 PaymentMethod mapped:', orderData.paymentMethod)
      }
    }

    // total -> totalAmount (backward compatibility)
    if (orderData.total && !orderData.totalAmount) {
      orderData.totalAmount = orderData.total
      delete orderData.total
    }

    // Agar totalAmount yo'q bo'lsa, items'dan hisoblash
    if (!orderData.totalAmount && orderData.items && orderData.items.length > 0) {
      orderData.totalAmount = orderData.items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity)
      }, 0)
      console.log('💰 TotalAmount hisoblandi:', orderData.totalAmount)
    }

    const order = await Order.create(orderData)
    console.log('✅ MongoDB ga saqlandi:', {
      orderId: order._id,
      status: order.status,
      createdAt: order.createdAt
    })

    const populatedOrder = await Order.findById(order._id).populate('items.menuItem')
    console.log('✅ Buyurtma to\'liq ma\'lumotlari olindi:', {
      orderId: populatedOrder?._id,
      itemsPopulated: populatedOrder?.items.length
    })

    // Emit socket event for real-time updates
    const io = getIO()

    // If it's a marketplace order, emit marketplace-order-created event
    if (order.orderType === 'marketplace') {
      io.emit('marketplace-order-created', populatedOrder)
      console.log('📡 Socket: marketplace-order-created emitted', {
        orderId: order._id,
        marketplaceName: order.marketplaceName,
        customerName: order.customerName
      })
    } else {
      io.emit('order:new', populatedOrder)
      console.log('📡 Socket: order:new emitted', {
        orderId: order._id,
        tableNumber: order.tableNumber
      })
    }

    console.log('🎉 Buyurtma muvaffaqiyatli yaratildi va yuborildi')
    res.status(201).json({ success: true, data: populatedOrder })
  } catch (error) {
    console.error('❌ Buyurtma yaratishda xatolik:', error)
    res.status(500).json({ success: false, error: 'Buyurtma yaratishda xatolik' })
  }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body
    console.log('🔄 Buyurtma holati yangilanmoqda:', {
      orderId: req.params.id,
      newStatus: status
    })

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.menuItem')

    if (!order) {
      console.log('❌ Buyurtma topilmadi:', req.params.id)
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    console.log('✅ MongoDB da yangilandi:', {
      orderId: order._id,
      oldStatus: req.body.oldStatus,
      newStatus: order.status
    })

    // Emit socket event for real-time updates
    const io = getIO()

    // Barcha buyurtmalar uchun order:status emit qilish
    io.emit('order:status', order)
    console.log('📡 Socket: order:status emitted (barcha buyurtmalar)', {
      orderId: order._id,
      status: order.status,
      orderType: order.orderType
    })

    // Agar tayyor bo'lsa, order:ready ham emit qilish
    if (status === 'ready') {
      io.emit('order:ready', order)
      console.log('📡 Socket: order:ready emitted', {
        orderId: order._id
      })
    }

    // If it's a marketplace order, emit marketplace-order-updated event
    if (order.orderType === 'marketplace') {
      io.emit('marketplace-order-updated', order)
      console.log('📡 Socket: marketplace-order-updated emitted', {
        orderId: order._id,
        status: order.status,
        marketplaceName: order.marketplaceName
      })

      // Also emit accepted event if status is accepted
      if (status === 'accepted') {
        io.emit('marketplace-order-accepted', order)
        console.log('📡 Socket: marketplace-order-accepted emitted', {
          orderId: order._id,
          customerName: order.customerName
        })
      }
    }

    console.log('🎉 Buyurtma holati muvaffaqiyatli yangilandi va yuborildi')
    res.json({ success: true, data: order })
  } catch (error) {
    console.error('❌ Buyurtma holatini yangilashda xatolik:', error)
    res.status(500).json({ success: false, error: 'Buyurtma holatini yangilashda xatolik' })
  }
}

// Waiter buyurtmani oshxonaga yuboradi
export const sendToKitchen = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id
    console.log('👨‍🍳 Buyurtma oshxonaga yuborilmoqda:', {
      orderId,
      waiterId: req.user?.userId
    })

    const order = await Order.findById(orderId)

    if (!order) {
      console.log('❌ Buyurtma topilmadi:', orderId)
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // Waiter'ni saqlash
    if (req.user?.userId) {
      order.waiter = req.user.userId as any
    }

    // Status'ni preparing ga o'zgartirish
    order.status = 'preparing'
    order.preparationStartedAt = new Date()

    await order.save()

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('waiter', 'fullName')

    console.log('✅ Buyurtma oshxonaga yuborildi:', {
      orderId: order._id,
      status: order.status,
      waiter: populatedOrder?.waiter
    })

    // Socket event emit qilish
    const io = getIO()
    
    // Kitchen'ga yangi buyurtma keldi
    io.emit('kitchen:new-order', populatedOrder)
    console.log('📡 Socket: kitchen:new-order emitted')

    // Order status yangilandi
    io.emit('order:status', populatedOrder)
    console.log('📡 Socket: order:status emitted')

    // Marketplace buyurtma bo'lsa
    if (order.orderType === 'marketplace') {
      io.emit('marketplace-order-updated', populatedOrder)
      console.log('📡 Socket: marketplace-order-updated emitted')
    }

    res.json({ 
      success: true, 
      data: populatedOrder,
      message: 'Buyurtma oshxonaga yuborildi'
    })
  } catch (error) {
    console.error('❌ Buyurtmani oshxonaga yuborishda xatolik:', error)
    res.status(500).json({ success: false, error: 'Buyurtmani oshxonaga yuborishda xatolik' })
  }
}

// Waiter buyurtmani kassaga yuboradi (served)
export const sendToCashier = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id
    console.log('💰 Buyurtma kassaga yuborilmoqda:', {
      orderId,
      waiterId: req.user?.userId
    })

    const order = await Order.findById(orderId)

    if (!order) {
      console.log('❌ Buyurtma topilmadi:', orderId)
      return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' })
    }

    // Faqat ready holatdagi buyurtmalarni kassaga yuborish mumkin
    if (order.status !== 'ready') {
      console.log('❌ Buyurtma tayyor emas:', order.status)
      return res.status(400).json({ 
        success: false, 
        error: 'Faqat tayyor buyurtmalarni kassaga yuborish mumkin' 
      })
    }

    // Status'ni served ga o'zgartirish
    order.status = 'served'
    order.servedAt = new Date()

    await order.save()

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('waiter', 'fullName')

    console.log('✅ Buyurtma kassaga yuborildi:', {
      orderId: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      items: order.items.length
    })

    // Socket event emit qilish
    const io = getIO()
    
    // Kassaga yangi buyurtma keldi
    io.emit('cashier:new-order', populatedOrder)
    console.log('📡 Socket: cashier:new-order emitted')

    // Order status yangilandi
    io.emit('order:status', populatedOrder)
    console.log('📡 Socket: order:status emitted')

    // Marketplace buyurtma bo'lsa
    if (order.orderType === 'marketplace') {
      io.emit('marketplace-order-updated', populatedOrder)
      console.log('📡 Socket: marketplace-order-updated emitted')
    }

    res.json({ 
      success: true, 
      data: populatedOrder,
      message: 'Buyurtma kassaga yuborildi'
    })
  } catch (error) {
    console.error('❌ Buyurtmani kassaga yuborishda xatolik:', error)
    res.status(500).json({ success: false, error: 'Buyurtmani kassaga yuborishda xatolik' })
  }
}
