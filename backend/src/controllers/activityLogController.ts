import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import ActivityLog from '../models/ActivityLog'

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const action = req.query.action as string
    const entity = req.query.entity as string
    const userId = req.query.userId as string

    const query: any = {}
    if (action) query.action = action
    if (entity) query.entity = entity
    if (userId) query.user = userId

    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'fullName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query),
    ])

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get activity logs error:', error)
    res.status(500).json({ success: false, error: 'Loglarni olishda xatolik' })
  }
}

export const createActivityLog = async (
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      entity,
      entityId,
      details,
      ipAddress,
      userAgent,
    })
  } catch (error) {
    console.error('Create activity log error:', error)
  }
}
