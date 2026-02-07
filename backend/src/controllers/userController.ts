import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import User from '../models/User'

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const role = req.query.role as string
    const isActive = req.query.isActive as string

    const query: any = {}
    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive === 'true'

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ])

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, error: 'Foydalanuvchilarni olishda xatolik' })
  }
}

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ success: false, error: 'Foydalanuvchini olishda xatolik' })
  }
}

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    let { fullName, phone, password, role } = req.body

    // Validation
    if (!fullName || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Barcha maydonlar to\'ldirilishi shart',
      })
    }

    // Format phone: add +998 prefix if not present
    if (!phone.startsWith('+998')) {
      phone = `+998${phone.replace(/\D/g, '')}`
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ phone })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan',
      })
    }

    // Create user
    const user = await User.create({
      fullName,
      phone,
      password,
      role,
      isActive: true,
    })

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password')

    res.status(201).json({ success: true, data: userResponse })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ success: false, error: 'Foydalanuvchi yaratishda xatolik' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    let { fullName, phone, role, isActive, password } = req.body

    // Format phone: add +998 prefix if not present
    if (phone && !phone.startsWith('+998')) {
      phone = `+998${phone.replace(/\D/g, '')}`
    }

    // Check if phone is being changed and already exists
    if (phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: req.params.id } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Bu telefon raqami boshqa foydalanuvchida mavjud',
        })
      }
    }

    const updateData: any = {}
    if (fullName) updateData.fullName = fullName
    if (phone) updateData.phone = phone
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    // If password is being updated, hash it
    if (password) {
      const user = await User.findById(req.params.id)
      if (user) {
        user.password = password
        await user.save()
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, error: 'Foydalanuvchini yangilashda xatolik' })
  }
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🗑️ Delete user request:', {
      userId: req.params.id,
      requestedBy: req.user?.userId,
    })

    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid ObjectId format:', req.params.id)
      return res.status(400).json({
        success: false,
        error: 'Noto\'g\'ri foydalanuvchi ID formati',
      })
    }

    // Prevent deleting yourself
    if (req.params.id === req.user?.userId) {
      console.log('❌ User tried to delete themselves')
      return res.status(400).json({
        success: false,
        error: 'O\'zingizni o\'chira olmaysiz',
      })
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      console.log('❌ User not found:', req.params.id)
      return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' })
    }

    console.log('✅ User deleted successfully:', user.fullName)
    res.json({ success: true, message: 'Foydalanuvchi o\'chirildi' })
  } catch (error) {
    console.error('❌ Delete user error:', error)
    res.status(500).json({ success: false, error: 'Foydalanuvchini o\'chirishda xatolik' })
  }
}

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    // Prevent deactivating yourself
    if (req.params.id === req.user?.userId) {
      return res.status(400).json({
        success: false,
        error: 'O\'zingizni faolsizlantira olmaysiz',
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' })
    }

    user.isActive = !user.isActive
    await user.save()

    const userResponse = await User.findById(user._id).select('-password')

    res.json({ success: true, data: userResponse })
  } catch (error) {
    console.error('Toggle user status error:', error)
    res.status(500).json({ success: false, error: 'Holat o\'zgartirishda xatolik' })
  }
}
