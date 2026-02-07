import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Customer from '../models/Customer'

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const isVIP = req.query.isVIP as string

    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }
    if (isVIP !== undefined) {
      query.isVIP = isVIP === 'true'
    }

    const skip = (page - 1) * limit

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ totalSpent: -1 }).skip(skip).limit(limit),
      Customer.countDocuments(query),
    ])

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get customers error:', error)
    res.status(500).json({ success: false, error: 'Mijozlarni olishda xatolik' })
  }
}

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id)

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Mijoz topilmadi' })
    }

    res.json({ success: true, data: customer })
  } catch (error) {
    console.error('Get customer error:', error)
    res.status(500).json({ success: false, error: 'Mijozni olishda xatolik' })
  }
}

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, name, email, notes } = req.body

    const existingCustomer = await Customer.findOne({ phone })
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan',
      })
    }

    const customer = await Customer.create({
      phone,
      name,
      email,
      notes,
    })

    res.status(201).json({ success: true, data: customer })
  } catch (error) {
    console.error('Create customer error:', error)
    res.status(500).json({ success: false, error: 'Mijoz yaratishda xatolik' })
  }
}

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, notes, isVIP, loyaltyPoints } = req.body

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, notes, isVIP, loyaltyPoints },
      { new: true, runValidators: true }
    )

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Mijoz topilmadi' })
    }

    res.json({ success: true, data: customer })
  } catch (error) {
    console.error('Update customer error:', error)
    res.status(500).json({ success: false, error: 'Mijozni yangilashda xatolik' })
  }
}

export const getTopCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const topCustomers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(limit)

    res.json({ success: true, data: topCustomers })
  } catch (error) {
    console.error('Get top customers error:', error)
    res.status(500).json({ success: false, error: 'Top mijozlarni olishda xatolik' })
  }
}
