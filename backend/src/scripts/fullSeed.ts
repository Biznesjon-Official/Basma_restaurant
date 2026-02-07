import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Models
import User from '../models/User'
import MenuItem from '../models/MenuItem'
import Table from '../models/Table'
import Inventory from '../models/Inventory'
import Order from '../models/Order'
import Customer from '../models/Customer'
import ActivityLog from '../models/ActivityLog'
import Expense from '../models/Expense'
import Income from '../models/Income'
import MarketplaceOrder from '../models/MarketplaceOrder'
import Recipe from '../models/Recipe'
import Settings from '../models/Settings'
import Staff from '../models/Staff'
import InventoryTransaction from '../models/InventoryTransaction'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || ''

async function fullSeed() {
  try {
    console.log('🔄 MongoDB ga ulanish...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB ulandi\n')

    // TO'LIQ TOZALASH
    console.log('🗑️  Database tozalanmoqda...')
    
    await User.deleteMany({})
    console.log('   ✓ Users o\'chirildi')
    
    await MenuItem.deleteMany({})
    console.log('   ✓ Menu Items o\'chirildi')
    
    await Table.deleteMany({})
    console.log('   ✓ Tables o\'chirildi')
    
    await Inventory.deleteMany({})
    console.log('   ✓ Inventory o\'chirildi')
    
    await Order.deleteMany({})
    console.log('   ✓ Orders o\'chirildi')
    
    await Customer.deleteMany({})
    console.log('   ✓ Customers o\'chirildi')
    
    await ActivityLog.deleteMany({})
    console.log('   ✓ Activity Logs o\'chirildi')
    
    await Expense.deleteMany({})
    console.log('   ✓ Expenses o\'chirildi')
    
    await Income.deleteMany({})
    console.log('   ✓ Incomes o\'chirildi')
    
    await MarketplaceOrder.deleteMany({})
    console.log('   ✓ Marketplace Orders o\'chirildi')
    
    await Recipe.deleteMany({})
    console.log('   ✓ Recipes o\'chirildi')
    
    await Settings.deleteMany({})
    console.log('   ✓ Settings o\'chirildi')
    
    await Staff.deleteMany({})
    console.log('   ✓ Staff o\'chirildi')
    
    await InventoryTransaction.deleteMany({})
    console.log('   ✓ Inventory Transactions o\'chirildi')

    console.log('\n✅ Database to\'liq tozalandi!\n')

    // MENU ITEMS QO'SHISH
    console.log('🍽️  Menu taomlarini qo\'shish...')
    
    const menuItems = [
      // OSH
      { name: 'Osh', category: 'Osh', price: 25000, cost: 12000, preparationTime: 20, available: true },
      { name: 'Toyoq oshi', category: 'Osh', price: 28000, cost: 14000, preparationTime: 20, available: true },
      { name: 'Devzira oshi', category: 'Osh', price: 35000, cost: 18000, preparationTime: 25, available: true },
      
      // SHASHLIK
      { name: 'Qo\'y shashlik', category: 'Shashlik', price: 18000, cost: 9000, preparationTime: 15, available: true },
      { name: 'Mol shashlik', category: 'Shashlik', price: 20000, cost: 10000, preparationTime: 15, available: true },
      { name: 'Tovuq shashlik', category: 'Shashlik', price: 15000, cost: 7500, preparationTime: 12, available: true },
      { name: 'Jigar shashlik', category: 'Shashlik', price: 16000, cost: 8000, preparationTime: 12, available: true },
      
      // KABOB
      { name: 'Lula kabob', category: 'Kabob', price: 22000, cost: 11000, preparationTime: 15, available: true },
      { name: 'Tuxum kabob', category: 'Kabob', price: 25000, cost: 13000, preparationTime: 18, available: true },
      
      // SALAT
      { name: 'Achichuk', category: 'Salat', price: 8000, cost: 3000, preparationTime: 5, available: true },
      { name: 'Olivye', category: 'Salat', price: 12000, cost: 5000, preparationTime: 8, available: true },
      { name: 'Grecheskiy salat', category: 'Salat', price: 15000, cost: 7000, preparationTime: 8, available: true },
      { name: 'Sezar salat', category: 'Salat', price: 18000, cost: 9000, preparationTime: 10, available: true },
      
      // SUYUQ TAOM
      { name: 'Mastava', category: 'Suyuq taom', price: 15000, cost: 7000, preparationTime: 15, available: true },
      { name: 'Lag\'mon', category: 'Suyuq taom', price: 20000, cost: 10000, preparationTime: 18, available: true },
      { name: 'Shurva', category: 'Suyuq taom', price: 18000, cost: 9000, preparationTime: 15, available: true },
      
      // MANTI VA CHUCHVARA
      { name: 'Manti', category: 'Manti', price: 20000, cost: 10000, preparationTime: 20, available: true },
      { name: 'Chuchvara', category: 'Manti', price: 18000, cost: 9000, preparationTime: 15, available: true },
      
      // NON
      { name: 'Oq non', category: 'Non', price: 3000, cost: 1000, preparationTime: 5, available: true },
      { name: 'Patir non', category: 'Non', price: 4000, cost: 1500, preparationTime: 8, available: true },
      { name: 'Tandir non', category: 'Non', price: 5000, cost: 2000, preparationTime: 10, available: true },
      
      // ICHIMLIK
      { name: 'Choy', category: 'Ichimlik', price: 3000, cost: 500, preparationTime: 3, available: true },
      { name: 'Kofe', category: 'Ichimlik', price: 8000, cost: 3000, preparationTime: 5, available: true },
      { name: 'Kompot', category: 'Ichimlik', price: 5000, cost: 2000, preparationTime: 3, available: true },
      { name: 'Coca Cola', category: 'Ichimlik', price: 7000, cost: 3500, preparationTime: 1, available: true },
      { name: 'Fanta', category: 'Ichimlik', price: 7000, cost: 3500, preparationTime: 1, available: true },
      { name: 'Sprite', category: 'Ichimlik', price: 7000, cost: 3500, preparationTime: 1, available: true },
      
      // SHIRINLIK
      { name: 'Tort', category: 'Shirinlik', price: 15000, cost: 7000, preparationTime: 5, available: true },
      { name: 'Muzqaymoq', category: 'Shirinlik', price: 10000, cost: 5000, preparationTime: 3, available: true },
    ]

    await MenuItem.insertMany(menuItems)
    console.log(`   ✓ ${menuItems.length} ta taom qo'shildi\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 HARDCODED ADMIN LOGIN:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('   Telefon:  901234567')
    console.log('   Parol:    admin123')
    console.log('   Role:     admin')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('ℹ️  Admin kodda hardcoded, DB da emas!')
    console.log('🎉 Seed muvaffaqiyatli yakunlandi!')
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ XATOLIK:', error)
    process.exit(1)
  }
}

fullSeed()
