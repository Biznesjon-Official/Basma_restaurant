import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import User from '../models/User'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token topilmadi. Iltimos, tizimga kiring.',
        code: 'NO_TOKEN'
      })
    }

    let decoded
    try {
      decoded = verifyToken(token)
    } catch (error: any) {
      console.error('Token verification error:', error.message)
      return res.status(401).json({
        success: false,
        error: 'Token yaroqsiz yoki muddati tugagan.',
        code: 'INVALID_TOKEN'
      })
    }
    
    // Skip DB check for hardcoded admin
    if (decoded.userId === 'admin-hardcoded-id') {
      req.user = decoded
      return next()
    }

    // Check if MongoDB is connected
    const isMongoConnected = require('mongoose').connection.readyState === 1

    if (isMongoConnected) {
      // Verify user exists and is active
      try {
        const user = await User.findById(decoded.userId)
        if (!user) {
          console.error('User not found:', decoded.userId)
          return res.status(401).json({
            success: false,
            error: 'Foydalanuvchi topilmadi.',
            code: 'USER_NOT_FOUND'
          })
        }
        if (!user.isActive) {
          console.error('User is inactive:', decoded.userId)
          return res.status(401).json({
            success: false,
            error: 'Foydalanuvchi faol emas.',
            code: 'USER_INACTIVE'
          })
        }
      } catch (dbError) {
        console.error('Database error during auth:', dbError)
        return res.status(500).json({
          success: false,
          error: 'Ma\'lumotlar bazasida xatolik.',
          code: 'DB_ERROR'
        })
      }
    } else if (process.env.NODE_ENV === 'development') {
      // In development without MongoDB, allow test user
      console.log('⚠️  MongoDB ulanmagan, token tekshirilmayapti')
    }

    req.user = decoded
    next()
  } catch (error: any) {
    console.error('Authentication error:', error)
    return res.status(401).json({
      success: false,
      error: 'Autentifikatsiyada xatolik.',
      code: 'AUTH_ERROR'
    })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log('❌ Authorize: User yo\'q')
      return res.status(401).json({
        success: false,
        error: 'Autentifikatsiya talab qilinadi.',
      })
    }

    console.log('🔐 Authorize check:', {
      userRole: req.user.role,
      requiredRoles: roles,
      allowed: roles.includes(req.user.role)
    })

    if (!roles.includes(req.user.role)) {
      console.log('❌ Authorize: Ruxsat yo\'q', {
        userRole: req.user.role,
        requiredRoles: roles
      })
      return res.status(403).json({
        success: false,
        error: 'Sizda bu amalni bajarish uchun ruxsat yo\'q.',
      })
    }

    next()
  }
}
