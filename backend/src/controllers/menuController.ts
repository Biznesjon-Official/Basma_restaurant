import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import MenuItem from '../models/MenuItem'

export const getMenuItems = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const category = req.query.category as string
    const available = req.query.available as string

    const query: any = {}
    if (category) query.category = category
    if (available !== undefined) query.available = available === 'true'

    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      MenuItem.find(query).sort({ category: 1, name: 1 }).skip(skip).limit(limit),
      MenuItem.countDocuments(query),
    ])

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get menu items error:', error)
    res.status(500).json({ success: false, error: 'Ma\'lumotlarni olishda xatolik' })
  }
}

export const createMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await MenuItem.create(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    console.error('Create menu item error:', error)
    res.status(500).json({ success: false, error: 'Menu qo\'shishda xatolik' })
  }
}

export const updateMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu topilmadi' })
    }

    res.json({ success: true, data: item })
  } catch (error) {
    console.error('Update menu item error:', error)
    res.status(500).json({ success: false, error: 'Menu yangilashda xatolik' })
  }
}

export const deleteMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id)

    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu topilmadi' })
    }

    res.json({ success: true, message: 'Menu o\'chirildi' })
  } catch (error) {
    console.error('Delete menu item error:', error)
    res.status(500).json({ success: false, error: 'Menu o\'chirishda xatolik' })
  }
}
