import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { backupService } from '../utils/backup'
import ActivityLog from '../models/ActivityLog'

// Create manual backup
export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    const result = await backupService.createBackup()

    // Log activity
    await ActivityLog.create({
      user: req.user?.userId,
      action: 'backup_created',
      details: result.message,
      ipAddress: req.ip,
    })

    res.json(result)
  } catch (error) {
    console.error('Create backup error:', error)
    res.status(500).json({ success: false, error: 'Backup yaratishda xato' })
  }
}

// List all backups
export const listBackups = async (req: AuthRequest, res: Response) => {
  try {
    const backups = await backupService.listBackups()

    res.json({
      success: true,
      data: backups,
    })
  } catch (error) {
    console.error('List backups error:', error)
    res.status(500).json({ success: false, error: 'Backup ro\'yxatini olishda xato' })
  }
}

// Restore backup
export const restoreBackup = async (req: AuthRequest, res: Response) => {
  try {
    const { backupName } = req.body

    if (!backupName) {
      return res.status(400).json({ success: false, error: 'Backup nomi kiritilmagan' })
    }

    const result = await backupService.restoreBackup(backupName)

    // Log activity
    await ActivityLog.create({
      user: req.user?.userId,
      action: 'backup_restored',
      details: `Backup tiklandi: ${backupName}`,
      ipAddress: req.ip,
    })

    res.json(result)
  } catch (error) {
    console.error('Restore backup error:', error)
    res.status(500).json({ success: false, error: 'Backup tiklashda xato' })
  }
}
