import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Settings from '../models/Settings'

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await Settings.findOne()

    if (!settings) {
      settings = await Settings.create({})
    }

    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ success: false, error: 'Sozlamalarni olishda xatolik' })
  }
}

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user?.userId,
    }

    let settings = await Settings.findOne()

    if (!settings) {
      settings = await Settings.create(updateData)
    } else {
      settings = await Settings.findOneAndUpdate({}, updateData, {
        new: true,
        runValidators: true,
      })
    }

    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ success: false, error: 'Sozlamalarni yangilashda xatolik' })
  }
}
