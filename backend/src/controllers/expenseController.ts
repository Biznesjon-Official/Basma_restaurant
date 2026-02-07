import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Expense from '../models/Expense'

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const category = req.query.category as string
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    const query: any = {}
    if (category) query.category = category
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('createdBy', 'fullName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(query),
    ])

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({ success: false, error: 'Chiqimlarni olishda xatolik' })
  }
}

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, description, date, isRecurring } = req.body

    const expense = await Expense.create({
      category,
      amount,
      description,
      date: date || new Date(),
      isRecurring,
      createdBy: req.user?.userId,
    })

    res.status(201).json({ success: true, data: expense })
  } catch (error) {
    console.error('Create expense error:', error)
    res.status(500).json({ success: false, error: 'Chiqim yaratishda xatolik' })
  }
}

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, description, date, isRecurring } = req.body

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { category, amount, description, date, isRecurring },
      { new: true, runValidators: true }
    )

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Chiqim topilmadi' })
    }

    res.json({ success: true, data: expense })
  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({ success: false, error: 'Chiqimni yangilashda xatolik' })
  }
}

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Chiqim topilmadi' })
    }

    res.json({ success: true, message: 'Chiqim o\'chirildi' })
  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({ success: false, error: 'Chiqimni o\'chirishda xatolik' })
  }
}
