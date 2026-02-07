import Inventory from '../models/Inventory'
import { getIO } from '../config/socket'

// Kam qolgan mahsulotlarni tekshirish
export const checkLowStockItems = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] },
      isActive: true
    })

    if (lowStockItems.length > 0) {
      console.log(`⚠️  ${lowStockItems.length} ta mahsulot kam qolgan!`)
      
      // Socket orqali yuborish
      const io = getIO()
      io.emit('inventory:low-stock', {
        items: lowStockItems,
        count: lowStockItems.length,
        timestamp: new Date()
      })

      // Har bir mahsulot uchun log
      lowStockItems.forEach(item => {
        console.log(`  ⚠️  ${item.name}: ${item.quantity}${item.unit} (min: ${item.minQuantity}${item.unit})`)
      })
    }

    return lowStockItems
  } catch (error) {
    console.error('❌ Kam qolgan mahsulotlarni tekshirishda xatolik:', error)
    return []
  }
}

// Har 5 daqiqada tekshirish
export const startInventoryMonitoring = () => {
  console.log('📊 Ombor monitoring boshlandi...')
  
  // Dastlab tekshirish
  checkLowStockItems()
  
  // Har 5 daqiqada tekshirish
  setInterval(() => {
    checkLowStockItems()
  }, 5 * 60 * 1000) // 5 daqiqa
}
