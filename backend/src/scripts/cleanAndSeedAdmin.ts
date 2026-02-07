import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'

dotenv.config()

const cleanAndSeedAdmin = async () => {
  try {
    console.log('🔄 MongoDB ga ulanish...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-restaurant')
    console.log('✅ MongoDB ulandi\n')

    // ============================================
    // 1. BARCHA COLLECTIONLARNI TOZALASH
    // ============================================
    console.log('🗑️  DATABASE TOZALANMOQDA...\n')

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    const collections = await db.listCollections().toArray()
    
    for (const collection of collections) {
      const collectionName = collection.name
      const count = await db.collection(collectionName).countDocuments()
      
      if (count > 0) {
        await db.collection(collectionName).deleteMany({})
        console.log(`   ✅ ${collectionName}: ${count} ta hujjat o'chirildi`)
      } else {
        console.log(`   ⚪ ${collectionName}: bo'sh`)
      }
    }

    console.log('\n✅ Database to\'liq tozalandi!\n')

    // ============================================
    // 2. ADMIN YARATISH
    // ============================================
    console.log('👑 ADMIN YARATILMOQDA...\n')

    const adminData = {
      fullName: 'Admin',
      phone: '998901111111',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    }

    const admin = await User.create(adminData)
    console.log('✅ Admin yaratildi!\n')

    // ============================================
    // 3. NATIJALAR
    // ============================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 DATABASE TAYYOR!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('👤 ADMIN LOGIN MA\'LUMOTLARI:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Telefon:  ${adminData.phone}`)
    console.log(`   Parol:    ${adminData.password}`)
    console.log(`   Ism:      ${adminData.fullName}`)
    console.log(`   Rol:      ${adminData.role}`)
    console.log(`   ID:       ${admin._id}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('📝 KEYINGI QADAMLAR:')
    console.log('   1. Frontend\'ga kiring: http://localhost:3001/login')
    console.log('   2. Yuqoridagi login ma\'lumotlarini kiriting')
    console.log('   3. Xodimlar, menyu va boshqa ma\'lumotlarni qo\'shing')
    console.log('')
    console.log('💡 MASLAHAT:')
    console.log('   - Barcha xodimlarni yaratish: npm run seed:users')
    console.log('   - To\'liq seed (menyu, stollar): npm run seed:full')
    console.log('')

  } catch (error) {
    console.error('❌ Xatolik:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 MongoDB ulanishi yopildi')
    process.exit(0)
  }
}

// Tasdiqlash
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('⚠️  OGOHLANTIRISH: Bu script DATABASE\'ni TO\'LIQ TOZALAYDI!')
console.log('⚠️  Barcha ma\'lumotlar (orders, users, menu, etc.) o\'chiriladi!\n')

readline.question('Davom etishni xohlaysizmi? (yes/no): ', (answer: string) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    readline.close()
    cleanAndSeedAdmin()
  } else {
    console.log('❌ Bekor qilindi')
    readline.close()
    process.exit(0)
  }
})
