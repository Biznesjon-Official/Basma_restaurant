import mongoose from 'mongoose'
import User from '../models/User'
import Staff from '../models/Staff'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || ''

// Har bir rol uchun test foydalanuvchilar
const TEST_USERS = [
  // ADMIN ROLLAR
  {
    fullName: 'Admin Akbar',
    phone: '998901111111',
    role: 'admin' as const,
    password: 'admin123',
    isActive: true,
  },
  {
    fullName: 'Admin Dilshod',
    phone: '998901111112',
    role: 'admin' as const,
    password: 'admin123',
    isActive: true,
  },

  // WAITER (OFITSIANT) ROLLAR
  {
    fullName: 'Ofitsiant Ali',
    phone: '998902222221',
    role: 'waiter' as const,
    password: 'waiter123',
    isActive: true,
  },
  {
    fullName: 'Ofitsiant Bobur',
    phone: '998902222222',
    role: 'waiter' as const,
    password: 'waiter123',
    isActive: true,
  },
  {
    fullName: 'Ofitsiant Sardor',
    phone: '998902222223',
    role: 'waiter' as const,
    password: 'waiter123',
    isActive: true,
  },

  // CHEF (OSHPAZ) ROLLAR
  {
    fullName: 'Oshpaz Vali',
    phone: '998903333331',
    role: 'chef' as const,
    password: 'chef123',
    isActive: true,
  },
  {
    fullName: 'Oshpaz Rustam',
    phone: '998903333332',
    role: 'chef' as const,
    password: 'chef123',
    isActive: true,
  },
  {
    fullName: 'Oshpaz Jamshid',
    phone: '998903333333',
    role: 'chef' as const,
    password: 'chef123',
    isActive: true,
  },

  // STOREKEEPER (OMBORCHI) ROLLAR
  {
    fullName: 'Omborchi Karim',
    phone: '998904444441',
    role: 'storekeeper' as const,
    password: 'store123',
    isActive: true,
  },
  {
    fullName: 'Omborchi Aziz',
    phone: '998904444442',
    role: 'storekeeper' as const,
    password: 'store123',
    isActive: true,
  },

  // CASHIER (KASSIR) ROLLAR
  {
    fullName: 'Kassir Dilnoza',
    phone: '998905555551',
    role: 'cashier' as const,
    password: 'cashier123',
    isActive: true,
  },
  {
    fullName: 'Kassir Malika',
    phone: '998905555552',
    role: 'cashier' as const,
    password: 'cashier123',
    isActive: true,
  },
  {
    fullName: 'Kassir Nodira',
    phone: '998905555553',
    role: 'cashier' as const,
    password: 'cashier123',
    isActive: true,
  },
]

// Staff ma'lumotlari (agar kerak bo'lsa)
const STAFF_DATA = [
  // Morning shift
  { name: 'Ofitsiant Ali', role: 'waiter' as const, phone: '998902222221', shift: 'morning' as const, status: 'active' as const },
  { name: 'Oshpaz Vali', role: 'chef' as const, phone: '998903333331', shift: 'morning' as const, status: 'active' as const },
  { name: 'Kassir Dilnoza', role: 'cashier' as const, phone: '998905555551', shift: 'morning' as const, status: 'active' as const },
  
  // Evening shift
  { name: 'Ofitsiant Bobur', role: 'waiter' as const, phone: '998902222222', shift: 'evening' as const, status: 'active' as const },
  { name: 'Oshpaz Rustam', role: 'chef' as const, phone: '998903333332', shift: 'evening' as const, status: 'active' as const },
  { name: 'Kassir Malika', role: 'cashier' as const, phone: '998905555552', shift: 'evening' as const, status: 'active' as const },
  
  // Night shift
  { name: 'Ofitsiant Sardor', role: 'waiter' as const, phone: '998902222223', shift: 'night' as const, status: 'active' as const },
  { name: 'Oshpaz Jamshid', role: 'chef' as const, phone: '998903333333', shift: 'night' as const, status: 'active' as const },
  { name: 'Kassir Nodira', role: 'cashier' as const, phone: '998905555553', shift: 'night' as const, status: 'active' as const },
  
  // Storekeeper (full day)
  { name: 'Omborchi Karim', role: 'storekeeper' as const, phone: '998904444441', shift: 'morning' as const, status: 'active' as const },
  { name: 'Omborchi Aziz', role: 'storekeeper' as const, phone: '998904444442', shift: 'evening' as const, status: 'active' as const },
]

async function createAllUsers() {
  try {
    console.log('🔄 MongoDB ga ulanish...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB ulandi\n')

    console.log('👥 Foydalanuvchilar yaratilmoqda...\n')

    let createdCount = 0
    let existingCount = 0

    for (const userData of TEST_USERS) {
      const existingUser = await User.findOne({ phone: userData.phone })
      
      if (existingUser) {
        console.log(`ℹ️  Mavjud: ${userData.fullName} (${userData.role}) - ${userData.phone}`)
        existingCount++
      } else {
        await User.create(userData)
        console.log(`✅ Yaratildi: ${userData.fullName} (${userData.role}) - ${userData.phone}`)
        createdCount++
      }
    }

    console.log('\n📊 Staff ma\'lumotlari yaratilmoqda...\n')

    let staffCreated = 0
    let staffExisting = 0

    for (const staffData of STAFF_DATA) {
      const existingStaff = await Staff.findOne({ phone: staffData.phone })
      
      if (existingStaff) {
        console.log(`ℹ️  Mavjud staff: ${staffData.name} (${staffData.role}) - ${staffData.shift}`)
        staffExisting++
      } else {
        await Staff.create(staffData)
        console.log(`✅ Staff yaratildi: ${staffData.name} (${staffData.role}) - ${staffData.shift}`)
        staffCreated++
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 NATIJALAR:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Yangi foydalanuvchilar: ${createdCount}`)
    console.log(`   Mavjud foydalanuvchilar: ${existingCount}`)
    console.log(`   Jami foydalanuvchilar: ${TEST_USERS.length}`)
    console.log(`   Yangi staff: ${staffCreated}`)
    console.log(`   Mavjud staff: ${staffExisting}`)
    console.log(`   Jami staff: ${STAFF_DATA.length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('📱 LOGIN MA\'LUMOTLARI:\n')
    
    console.log('👑 ADMIN:')
    console.log('   998901111111 / admin123 (Admin Akbar)')
    console.log('   998901111112 / admin123 (Admin Dilshod)\n')
    
    console.log('🍽️  OFITSIANT (WAITER):')
    console.log('   998902222221 / waiter123 (Ali - Ertalab)')
    console.log('   998902222222 / waiter123 (Bobur - Kechqurun)')
    console.log('   998902222223 / waiter123 (Sardor - Kecha)\n')
    
    console.log('👨‍🍳 OSHPAZ (CHEF):')
    console.log('   998903333331 / chef123 (Vali - Ertalab)')
    console.log('   998903333332 / chef123 (Rustam - Kechqurun)')
    console.log('   998903333333 / chef123 (Jamshid - Kecha)\n')
    
    console.log('📦 OMBORCHI (STOREKEEPER):')
    console.log('   998904444441 / store123 (Karim)')
    console.log('   998904444442 / store123 (Aziz)\n')
    
    console.log('💰 KASSIR (CASHIER):')
    console.log('   998905555551 / cashier123 (Dilnoza - Ertalab)')
    console.log('   998905555552 / cashier123 (Malika - Kechqurun)')
    console.log('   998905555553 / cashier123 (Nodira - Kecha)\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Barcha foydalanuvchilar muvaffaqiyatli yaratildi!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ XATOLIK:', error)
    process.exit(1)
  }
}

createAllUsers()
