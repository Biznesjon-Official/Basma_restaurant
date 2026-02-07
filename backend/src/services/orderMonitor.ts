import mongoose from 'mongoose'
import Order from '../models/Order'
import { getIO } from '../config/socket'

let changeStream: any = null

/**
 * MongoDB Change Streams yordamida orders kolleksiyasini monitoring qilish
 * Barcha yangi buyurtmalarni aniqlash (marketplace va external)
 */
export const startOrderMonitoring = () => {
  try {
    console.log('🔍 Order monitoring boshlandi...')
    
    // Change stream yaratish - barcha yangi insert operatsiyalarini kuzatish
    changeStream = Order.watch([
      {
        $match: {
          operationType: 'insert',
          // Marketplace yoki confirmed statusdagi buyurtmalar
          $or: [
            { 'fullDocument.orderType': 'marketplace' },
            { 'fullDocument.status': 'confirmed' }
          ]
        }
      }
    ], {
      fullDocument: 'updateLookup'
    })

    changeStream.on('change', async (change: any) => {
      try {
        console.log('📥 Yangi buyurtma aniqlandi!', change.operationType)
        
        if (change.operationType === 'insert') {
          const newOrder = change.fullDocument
          
          // Intelligent detection: agar orderType yo'q yoki restaurant bo'lsa, 
          // lekin status confirmed bo'lsa - bu tashqi saytdan
          const isExternalOrder = 
            newOrder.orderType === 'marketplace' || 
            (newOrder.orderType === 'restaurant' && newOrder.status === 'confirmed')
          
          if (isExternalOrder) {
            console.log('📦 Tashqi buyurtma aniqlandi:', {
              id: newOrder._id,
              orderType: newOrder.orderType,
              status: newOrder.status,
              total: newOrder.totalAmount
            })
            
            // Populate qilish
            const populatedOrder = await Order.findById(newOrder._id)
              .populate('items.menuItem')
              .populate('waiter', 'fullName')
            
            // Socket orqali barcha ofitsiantlarga yuborish
            const io = getIO()
            io.emit('marketplace-order-created', populatedOrder)
            
            console.log('✅ Socket event yuborildi: marketplace-order-created')
          }
        }
      } catch (error) {
        console.error('❌ Change stream event xatosi:', error)
      }
    })

    changeStream.on('error', (error: any) => {
      console.error('❌ Change stream xatosi:', error)
      // Xato bo'lsa, qayta ulanishga harakat qilish
      setTimeout(() => {
        console.log('🔄 Change stream qayta ishga tushirilmoqda...')
        stopOrderMonitoring()
        startOrderMonitoring()
      }, 5000)
    })

    changeStream.on('close', () => {
      console.log('🔌 Change stream yopildi')
    })

    console.log('✅ Order monitoring muvaffaqiyatli ishga tushdi')
  } catch (error) {
    console.error('❌ Order monitoring xatosi:', error)
  }
}

/**
 * Monitoring to'xtatish
 */
export const stopOrderMonitoring = () => {
  if (changeStream) {
    changeStream.close()
    changeStream = null
    console.log('🛑 Order monitoring to\'xtatildi')
  }
}

/**
 * Fallback: Polling mexanizmi (agar Change Streams ishlamasa)
 * Har 10 sekundda yangi buyurtmalarni tekshirish
 */
let lastCheckTime = new Date()
let pollingInterval: NodeJS.Timeout | null = null

export const startOrderPolling = () => {
  console.log('🔄 Order polling boshlandi (fallback)...')
  
  pollingInterval = setInterval(async () => {
    try {
      // Oxirgi tekshiruvdan keyin yaratilgan buyurtmalarni topish
      // Marketplace yoki confirmed statusdagi buyurtmalar
      const newOrders = await Order.find({
        $or: [
          { orderType: 'marketplace' },
          { orderType: 'restaurant', status: 'confirmed' }
        ],
        createdAt: { $gt: lastCheckTime }
      })
        .populate('items.menuItem')
        .populate('waiter', 'fullName')
        .sort({ createdAt: -1 })
      
      if (newOrders.length > 0) {
        console.log(`📦 ${newOrders.length} ta yangi buyurtma topildi (polling)`)
        
        const io = getIO()
        newOrders.forEach(order => {
          io.emit('marketplace-order-created', order)
          console.log('✅ Socket event yuborildi:', order._id)
        })
      }
      
      lastCheckTime = new Date()
    } catch (error) {
      console.error('❌ Polling xatosi:', error)
    }
  }, 10000) // Har 10 sekundda
}

export const stopOrderPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
    console.log('🛑 Order polling to\'xtatildi')
  }
}
