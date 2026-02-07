import mongoose from 'mongoose'
import MenuItem from '../models/MenuItem'
import Table from '../models/Table'
import Inventory from '../models/Inventory'
import Order from '../models/Order'
import User from '../models/User'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || ''

async function clearData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB ulandi')

    // Clear all data except admin user
    await MenuItem.deleteMany({})
    console.log('🗑️  Menu elementlari o\'chirildi')

    await Table.deleteMany({})
    console.log('🗑️  Stollar o\'chirildi')

    await Inventory.deleteMany({})
    console.log('🗑️  Ombor ma\'lumotlari o\'chirildi')

    await Order.deleteMany({})
    console.log('🗑️  Buyurtmalar o\'chirildi')

    // Keep only admin user
    const adminCount = await User.countDocuments({ role: 'admin' })
    console.log(`ℹ️  Admin foydalanuvchilar saqlanadi: ${adminCount} ta`)

    console.log('🎉 Barcha test ma\'lumotlar o\'chirildi!')
    console.log('✅ Faqat Admin user qoldi')
    process.exit(0)
  } catch (error) {
    console.error('❌ Xatolik:', error)
    process.exit(1)
  }
}

clearData()
