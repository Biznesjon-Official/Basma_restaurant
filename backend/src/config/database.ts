import mongoose from 'mongoose'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error('MONGODB_URI muhit o\'zgaruvchisi topilmadi')
    }

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    }

    await mongoose.connect(mongoURI, options)

    console.log('✅ MongoDB muvaffaqiyatli ulandi')
    console.log(`📊 Database: ${mongoose.connection.name}`)
  } catch (error: any) {
    console.error('❌ MongoDB ulanishda xatolik:', error.message)
    
    // Don't exit in development, allow server to start
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    } else {
      console.log('⚠️  Development rejimida server MongoDB siz ishga tushadi')
      console.log('💡 MongoDB Atlas da IP whitelist ni tekshiring yoki local MongoDB ishga tushiring')
    }
  }
}

// MongoDB events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB ulanishi uzildi')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB xatolik:', err.message)
})
