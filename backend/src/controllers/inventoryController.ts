import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Inventory from '../models/Inventory'

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const lowStock = req.query.lowStock === 'true'

    const query: any = {}
    if (lowStock) {
      query.$expr = { $lte: ['$quantity', '$minQuantity'] }
    }

    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Inventory.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Inventory.countDocuments(query),
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
    console.error('Get inventory error:', error)
    res.status(500).json({ success: false, error: 'Ombor ma\'lumotlarini olishda xatolik' })
  }
}

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Inventory.create(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    console.error('Create inventory item error:', error)
    res.status(500).json({ success: false, error: 'Mahsulot qo\'shishda xatolik' })
  }
}

export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!item) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' })
    }

    res.json({ success: true, data: item })
  } catch (error) {
    console.error('Update inventory item error:', error)
    res.status(500).json({ success: false, error: 'Mahsulot yangilashda xatolik' })
  }
}
