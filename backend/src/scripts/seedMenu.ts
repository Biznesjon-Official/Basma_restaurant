import mongoose from 'mongoose'
import dotenv from 'dotenv'
import MenuItem from '../models/MenuItem'

dotenv.config()

const menuItems = [
  // MILLIY TAOMLAR
  {
    name: 'Osh',
    category: 'Milliy taomlar',
    price: 25000,
    cost: 12000,
    available: true,
    preparationTime: 15,
    description: 'An\'anaviy o\'zbek oshi',
  },
  {
    name: 'Lag\'mon',
    category: 'Milliy taomlar',
    price: 22000,
    cost: 10000,
    available: true,
    preparationTime: 20,
    description: 'Qo\'l lag\'moni',
  },
  {
    name: 'Manti',
    category: 'Milliy taomlar',
    price: 18000,
    cost: 8000,
    available: true,
    preparationTime: 25,
    description: 'Bug\'da pishirilgan manti (6 dona)',
  },
  {
    name: 'Shashlik',
    category: 'Milliy taomlar',
    price: 30000,
    cost: 15000,
    available: true,
    preparationTime: 20,
    description: 'Qo\'y go\'shtidan shashlik (5 dona)',
  },
  {
    name: 'Norin',
    category: 'Milliy taomlar',
    price: 20000,
    cost: 9000,
    available: true,
    preparationTime: 15,
    description: 'Sovuq lag\'mon',
  },

  // SHO'RVALAR
  {
    name: 'Mastava',
    category: 'Sho\'rvalar',
    price: 15000,
    cost: 7000,
    available: true,
    preparationTime: 10,
    description: 'Guruch sho\'rvasi',
  },
  {
    name: 'Shurva',
    category: 'Sho\'rvalar',
    price: 14000,
    cost: 6500,
    available: true,
    preparationTime: 10,
    description: 'Go\'shtli sho\'rva',
  },
  {
    name: 'Naryn sho\'rvasi',
    category: 'Sho\'rvalar',
    price: 16000,
    cost: 7500,
    available: true,
    preparationTime: 12,
    description: 'Lag\'mon sho\'rvasi',
  },

  // SALATLAR
  {
    name: 'Achichiq salat',
    category: 'Salatlar',
    price: 12000,
    cost: 5000,
    available: true,
    preparationTime: 5,
    description: 'Pomidor, bodring, piyoz',
  },
  {
    name: 'Olivye',
    category: 'Salatlar',
    price: 15000,
    cost: 7000,
    available: true,
    preparationTime: 5,
    description: 'Klassik olivye salat',
  },
  {
    name: 'Sezar',
    category: 'Salatlar',
    price: 18000,
    cost: 8000,
    available: true,
    preparationTime: 7,
    description: 'Tovuq go\'shti bilan sezar',
  },

  // NON VA PISHIRIQLAR
  {
    name: 'Tandir non',
    category: 'Non va pishiriqlar',
    price: 3000,
    cost: 1000,
    available: true,
    preparationTime: 5,
    description: 'Tandirda pishirilgan non',
  },
  {
    name: 'Somsa',
    category: 'Non va pishiriqlar',
    price: 7000,
    cost: 3000,
    available: true,
    preparationTime: 15,
    description: 'Go\'shtli somsa',
  },
  {
    name: 'Patir',
    category: 'Non va pishiriqlar',
    price: 4000,
    cost: 1500,
    available: true,
    preparationTime: 5,
    description: 'Yog\'li patir',
  },

  // ICHIMLIKLAR
  {
    name: 'Choy (qora)',
    category: 'Ichimliklar',
    price: 5000,
    cost: 1000,
    available: true,
    preparationTime: 3,
    description: 'Issiq qora choy',
  },
  {
    name: 'Choy (ko\'k)',
    category: 'Ichimliklar',
    price: 5000,
    cost: 1000,
    available: true,
    preparationTime: 3,
    description: 'Issiq ko\'k choy',
  },
  {
    name: 'Kompot',
    category: 'Ichimliklar',
    price: 8000,
    cost: 3000,
    available: true,
    preparationTime: 2,
    description: 'Uy kompoti',
  },
  {
    name: 'Coca-Cola',
    category: 'Ichimliklar',
    price: 8000,
    cost: 4000,
    available: true,
    preparationTime: 1,
    description: '0.5L',
  },
  {
    name: 'Fanta',
    category: 'Ichimliklar',
    price: 8000,
    cost: 4000,
    available: true,
    preparationTime: 1,
    description: '0.5L',
  },
  {
    name: 'Sprite',
    category: 'Ichimliklar',
    price: 7000,
    cost: 3500,
    available: true,
    preparationTime: 1,
    description: '0.5L',
  },
  {
    name: 'Suv',
    category: 'Ichimliklar',
    price: 3000,
    cost: 1500,
    available: true,
    preparationTime: 1,
    description: 'Toza ichimlik suvi 0.5L',
  },

  // SHIRINLIKLAR
  {
    name: 'Tort (bir bo\'lak)',
    category: 'Shirinliklar',
    price: 15000,
    cost: 7000,
    available: true,
    preparationTime: 3,
    description: 'Uy torti',
  },
  {
    name: 'Muzqaymoq',
    category: 'Shirinliklar',
    price: 10000,
    cost: 4000,
    available: true,
    preparationTime: 2,
    description: 'Turli xil ta\'mlar',
  },
  {
    name: 'Halva',
    category: 'Shirinliklar',
    price: 12000,
    cost: 5000,
    available: true,
    preparationTime: 2,
    description: 'O\'zbek halvasi',
  },
]

const seedMenu = async () => {
  try {
    console.log('🔄 MongoDB ga ulanish...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-restaurant')
    console.log('✅ MongoDB ulandi\n')

    // Eski menyu mahsulotlarini o'chirish
    const oldCount = await MenuItem.countDocuments()
    if (oldCount > 0) {
      await MenuItem.deleteMany({})
      console.log(`🗑️  ${oldCount} ta eski mahsulot o'chirildi\n`)
    }

    // Yangi mahsulotlarni qo'shish
    console.log('📦 Menyu mahsulotlari qo\'shilmoqda...\n')
    
    for (const item of menuItems) {
      await MenuItem.create(item)
      console.log(`   ✅ ${item.name} - ${item.price.toLocaleString()} so'm`)
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 MENYU TAYYOR!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n📊 Jami: ${menuItems.length} ta mahsulot qo'shildi\n`)
    
    // Kategoriyalar bo'yicha statistika
    const categories = menuItems.reduce((acc: any, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {})

    console.log('📋 Kategoriyalar:')
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} ta`)
    })

    console.log('\n💡 Frontend\'da ko\'rish: http://localhost:3001/menu')
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

seedMenu()
