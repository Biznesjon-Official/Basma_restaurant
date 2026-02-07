import { Request, Response } from 'express'
import User from '../models/User'
import { generateToken } from '../utils/jwt'
import bcrypt from 'bcryptjs'

// Hardcoded Admin
const HARDCODED_ADMIN = {
  id: 'admin-hardcoded-id',
  fullName: 'Admin',
  phone: '901234567',
  password: 'admin123', // Plain text, will be compared directly
  role: 'admin' as const,
}

export const login = async (req: Request, res: Response) => {
  try {
    let { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Telefon va parol talab qilinadi.',
      })
    }

    // Normalize phone number: remove +998 prefix if present
    phone = phone.replace(/^\+998/, '').replace(/\s/g, '')

    // Check hardcoded admin first
    if (phone === HARDCODED_ADMIN.phone && password === HARDCODED_ADMIN.password) {
      const token = generateToken({
        userId: HARDCODED_ADMIN.id,
        role: HARDCODED_ADMIN.role,
      })

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: HARDCODED_ADMIN.id,
            fullName: HARDCODED_ADMIN.fullName,
            phone: HARDCODED_ADMIN.phone,
            role: HARDCODED_ADMIN.role,
          },
        },
      })
    }

    // Find user with password field (try both with and without +998 prefix)
    let user = await User.findOne({ phone, isActive: true }).select('+password')
    
    // If not found, try with +998 prefix
    if (!user) {
      user = await User.findOne({ phone: `+998${phone}`, isActive: true }).select('+password')
    }
    
    // If still not found, try with 998 prefix (no +)
    if (!user) {
      user = await User.findOne({ phone: `998${phone}`, isActive: true }).select('+password')
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Telefon yoki parol noto\'g\'ri.',
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Telefon yoki parol noto\'g\'ri.',
      })
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    })

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Tizimga kirishda xatolik.',
    })
  }
}

export const getProfile = async (req: any, res: Response) => {
  try {
    // Check if hardcoded admin
    if (req.user.userId === HARDCODED_ADMIN.id) {
      return res.json({
        success: true,
        data: {
          id: HARDCODED_ADMIN.id,
          fullName: HARDCODED_ADMIN.fullName,
          phone: HARDCODED_ADMIN.phone,
          role: HARDCODED_ADMIN.role,
        },
      })
    }

    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Foydalanuvchi topilmadi.',
      })
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Profil ma\'lumotlarini olishda xatolik.',
    })
  }
}
