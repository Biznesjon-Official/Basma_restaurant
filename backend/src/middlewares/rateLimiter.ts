import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 daqiqa
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Juda ko\'p so\'rov yuborildi. Iltimos, keyinroq urinib ko\'ring.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
