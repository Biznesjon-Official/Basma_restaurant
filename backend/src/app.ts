import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { errorHandler, notFound } from './middlewares/errorHandler'
import { apiLimiter } from './middlewares/rateLimiter'
import logger from './utils/logger'

const app: Application = express()

// Security & Performance Middlewares
app.use(helmet())
app.use(compression())

// Morgan logging - production da faqat errors
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }))
} else {
  app.use(morgan('dev'))
}

// CORS Configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001'
logger.info('CORS Configuration', { frontendUrl })

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
)

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate Limiting
app.use('/api/', apiLimiter)

// Health Check Routes
import healthRoutes from './routes/healthRoutes'
app.use('/api', healthRoutes)

// API Routes
import authRoutes from './routes/authRoutes'
import menuRoutes from './routes/menuRoutes'
import orderRoutes from './routes/orderRoutes'
import tableRoutes from './routes/tableRoutes'
import inventoryRoutes from './routes/inventoryRoutes'
import userRoutes from './routes/userRoutes'
import analyticsRoutes from './routes/analyticsRoutes'
import expenseRoutes from './routes/expenseRoutes'
import incomeRoutes from './routes/incomeRoutes'
import customerRoutes from './routes/customerRoutes'
import settingsRoutes from './routes/settingsRoutes'
import activityLogRoutes from './routes/activityLogRoutes'
import waiterRoutes from './routes/waiterRoutes'
import chefRoutes from './routes/chefRoutes'
import storekeeperRoutes from './routes/storekeeperRoutes'
import cashierRoutes from './routes/cashierRoutes'
import marketplaceOrderRoutes from './routes/marketplaceOrderRoutes'
import waiterCallRoutes from './routes/waiterCallRoutes'
import webhookRoutes from './routes/webhookRoutes'

app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/incomes', incomeRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/activity-logs', activityLogRoutes)
app.use('/api/waiter', waiterRoutes)
app.use('/api/chef', chefRoutes)
app.use('/api/storekeeper', storekeeperRoutes)
app.use('/api/cashier', cashierRoutes)
app.use('/api/marketplace-orders', marketplaceOrderRoutes)
app.use('/api/waiter-calls', waiterCallRoutes)
app.use('/api/webhooks', webhookRoutes) // Webhook routes (no auth required)

// Error Handlers
app.use(notFound)
app.use(errorHandler)

export default app
