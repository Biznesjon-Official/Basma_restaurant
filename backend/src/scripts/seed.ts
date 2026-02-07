import mongoose from 'mongoose'
import MenuItem from '../models/MenuItem'
import Table from '../models/Table'
import Inventory from '../models/Inventory'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || ''

// Menu items
const menuItems = [
  { name: 'Samarqand oshi', category: 'Osh', price: 45000, cost: 22000, available: true, preparationTime: 25 },
  { name: 'Toshkent oshi', category: 'Osh', price: 42000, cost: 20000, available: true, preparationTime: 25 },
  { name: 'Buxoro oshi', category: 'Osh', price: 48000, cost: 24000, available: true, preparationTime: 30 },
  { name: "To'y oshi", category: 'Osh', price: 55000, cost: 28000, available: true, preparationTime: 35 },
  { name: 'Mastava', category: "Sho'rva", price: 28000, cost: 12000, available: true, preparationTime: 15 },
  { name: "Lag'mon", category: "Sho'rva", price: 32000, cost: 14000, available: true, preparationTime: 20 },
  { name: 'Shurpa', category: "Sho'rva", price: 35000, cost: 16000, available: true, preparationTime: 25 },
  { name: "Qo'y kabob", category: 'Kabob', price: 18000, cost: 9000, available: true, preparationTime: 15 },
  { name: 'Mol kabob', category: 'Kabob', price: 16000, cost: 8000, available: true, preparationTime: 15 },
  { name: 'Jigar kabob', category: 'Kabob', price: 14000, cost: 7000, available: true, preparationTime: 12 },
  { name: 'Tovuq kabob', category: 'Kabob', price: 12000, cost: 5000, available: true, preparationTime: 12 },
  { name: 'Achichuk', category: 'Salat', price: 15000, cost: 5000, available: true, preparationTime: 5 },
  { name: 'Shakarob', category: 'Salat', price: 12000, cost: 4000, available: true, preparationTime: 5 },
  { name: 'Coca-Cola', category: 'Ichimlik', price: 8000, cost: 4000, available: true, preparationTime: 1 },
  { name: 'Fanta', category: 'Ichimlik', price: 8000, cost: 4000, available: true, preparationTime: 1 },
  { name: 'Kompot', category: 'Ichimlik', price: 6000, cost: 2000, available: true, preparationTime: 2 },
  { name: 'Choy (choynak)', category: 'Ichimlik', price: 10000, cost: 2000, available: true, preparationTime: 5 },
  { name: 'Halvo', category: 'Shirinlik', price: 15000, cost: 8000, available: true, preparationTime: 2 },
  { name: 'Chak-chak', category: 'Shirinlik', price: 18000, cost: 9000, available: true, preparationTime: 2 },
]

// Tables
const tables = [
  { number: 1, capacity: 4, status: 'available' },
  { number: 2, capacity: 4, status: 'available' },
  { number: 3, capacity: 6, status: 'available' },
  { number: 4, capacity: 2, status: 'available' },
  { number: 5, capacity: 8, status: 'available' },
  { number: 6, capacity: 4, status: 'available' },
  { number: 7, capacity: 4, status: 'available' },
  { number: 8, capacity: 6, status: 'available' },
  { number: 9, capacity: 4, status: 'available' },
  { number: 10, capacity: 10, status: 'available' },
  { number: 11, capacity: 4, status: 'available' },
  { number: 12, capacity: 4, status: 'available' },
]

// Inventory
const inventory = [
  { name: 'Guruch (Laser)', unit: 'kg', quantity: 150, minQuantity: 50, price: 22000, supplier: 'Agro Markaz' },
  { name: "Qo'y go'shti", unit: 'kg', quantity: 45, minQuantity: 20, price: 95000, supplier: "Go'sht Savdo" },
  { name: "Mol go'shti", unit: 'kg', quantity: 30, minQuantity: 15, price: 85000, supplier: "Go'sht Savdo" },
  { name: 'Sabzi', unit: 'kg', quantity: 25, minQuantity: 10, price: 8000, supplier: 'Dehqon Bozori' },
  { name: 'Piyoz', unit: 'kg', quantity: 40, minQuantity: 15, price: 5000, supplier: 'Dehqon Bozori' },
  { name: "Yog' (paxta)", unit: 'litr', quantity: 35, minQuantity: 20, price: 28000, supplier: "Yog' Zavodi" },
  { name: 'Tuz', unit: 'kg', quantity: 20, minQuantity: 10, price: 3000, supplier: 'Ulgurji Savdo' },
  { name: 'Pomidor', unit: 'kg', quantity: 15, minQuantity: 10, price: 12000, supplier: 'Dehqon Bozori' },
  { name: 'Coca-Cola (0.5L)', unit: 'dona', quantity: 120, minQuantity: 50, price: 5500, supplier: 'Coca-Cola UZ' },
  { name: 'Non', unit: 'dona', quantity: 8, minQuantity: 20, price: 4000, supplier: 'Novvoyxona' },
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB ulandi')

    // Clear existing data
    await MenuItem.deleteMany({})
    await Table.deleteMany({})
    await Inventory.deleteMany({})
    console.log('🗑️  Eski ma\'lumotlar o\'chirildi')

    // Insert new data
    await MenuItem.insertMany(menuItems)
    console.log('✅ Menu elementlari qo\'shildi:', menuItems.length)

    await Table.insertMany(tables)
    console.log('✅ Stollar qo\'shildi:', tables.length)

    await Inventory.insertMany(inventory)
    console.log('✅ Ombor ma\'lumotlari qo\'shildi:', inventory.length)

    // Create default users if they don't exist
    const users = [
      { fullName: 'Admin', phone: '998901234567', role: 'admin', password: 'admin123' },
      { fullName: 'Ofitsiant Ali', phone: '998901234568', role: 'waiter', password: 'waiter123' },
      { fullName: 'Oshpaz Vali', phone: '998901234569', role: 'chef', password: 'chef123' },
      { fullName: 'Omborchi Karim', phone: '998901234570', role: 'storekeeper', password: 'store123' },
      { fullName: 'Kassir Dilnoza', phone: '998901234571', role: 'cashier', password: 'cashier123' },
    ]

    for (const userData of users) {
      const existingUser = await User.findOne({ phone: userData.phone })
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        await User.create({
          ...userData,
          password: hashedPassword,
          isActive: true,
        })
        console.log(`✅ User yaratildi: ${userData.fullName} (${userData.role})`)
      } else {
        console.log(`ℹ️  User mavjud: ${userData.fullName}`)
      }
    }

    console.log('🎉 Barcha ma\'lumotlar muvaffaqiyatli qo\'shildi!')
    console.log('\n📋 Login ma\'lumotlari:')
    console.log('Admin: 998901234567 / admin123')
    console.log('Waiter: 998901234568 / waiter123')
    console.log('Chef: 998901234569 / chef123')
    console.log('Storekeeper: 998901234570 / store123')
    console.log('Cashier: 998901234571 / cashier123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Xatolik:', error)
    process.exit(1)
  }
}

seed()
