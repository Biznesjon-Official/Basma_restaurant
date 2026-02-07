import dotenv from 'dotenv'
import path from 'path'
import http from 'http'
import app from './app'
import { connectDB } from './config/database'
import { initializeSocket } from './config/socket'
import { startOrderMonitoring, startOrderPolling } from './services/orderMonitor'
import { startInventoryMonitoring } from './services/inventoryMonitor'
import logger from './utils/logger'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })
const PORT = process.env.PORT

// Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()

    // Create HTTP server
    const server = http.createServer(app)

    // Initialize Socket.io
    initializeSocket(server)
    logger.info('Socket.io initialized')

    // Start MongoDB Change Streams monitoring for external orders
    try {
      startOrderMonitoring()
      logger.info('MongoDB Change Streams monitoring started')
    } catch (error) {
      logger.warn('Change Streams ishlamadi, polling ishlatiladi', error)
      // Fallback to polling if Change Streams not available
      startOrderPolling()
    }

    // Start inventory monitoring
    startInventoryMonitoring()
    logger.info('Inventory monitoring started')

    // Start Express Server
    server.listen(PORT, () => {
      logger.info('================================')
      logger.info(`BASMA Backend ishga tushdi`)
      logger.info(`Port: ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`URL: http://localhost:${PORT}`)
      logger.info(`Socket.io: ws://localhost:${PORT}`)
      logger.info('================================')
    })
  } catch (error) {
    logger.error('Server ishga tushmadi', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection', { message: err.message, stack: err.stack })
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack })
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  process.exit(0)
})

startServer()
