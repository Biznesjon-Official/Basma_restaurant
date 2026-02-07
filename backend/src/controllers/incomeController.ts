import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Income from '../models/Income'

// Get all incomes
export const getIncomes = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, category, limit = 100 } = req.query

    let filter: any = {}

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      }
    }

    if (category) {
      filter.category = category
    }

    const incomes = await Income.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit as string))
      .populate('createdBy', 'fullName')
      .populate('orderId', 'orderNumber')

    res.json({ success: true, data: incomes })
  } catch (error) {
    console.error('Get incomes error:', error)
    res.status(500).json({ success: false, error: 'Kirimlarni olishda xatolik' })
  }
}

// Create income
export const createIncome = async (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, description, date } = req.body

    const income = await Income.create({
      category,
      amount,
      description,
      date: date || new Date(),
      source: 'manual',
      createdBy: req.user?.userId,
    })

    res.status(201).json({ success: true, data: income })
  } catch (error) {
    console.error('Create income error:', error)
    res.status(500).json({ success: false, error: 'Kirim yaratishda xatolik' })
  }
}

// Update income
export const updateIncome = async (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, description, date } = req.body

    const income = await Income.findByIdAndUpdate(
      req.params.id,
      { category, amount, description, date },
      { new: true, runValidators: true }
    )

    if (!income) {
      return res.status(404).json({ success: false, error: 'Kirim topilmadi' })
    }

    res.json({ success: true, data: income })
  } catch (error) {
    console.error('Update income error:', error)
    res.status(500).json({ success: false, error: 'Kirimni yangilashda xatolik' })
  }
}

// Delete income
export const deleteIncome = async (req: AuthRequest, res: Response) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id)

    if (!income) {
      return res.status(404).json({ success: false, error: 'Kirim topilmadi' })
    }

    res.json({ success: true, message: 'Kirim o\'chirildi' })
  } catch (error) {
    console.error('Delete income error:', error)
    res.status(500).json({ success: false, error: 'Kirimni o\'chirishda xatolik' })
  }
}
