import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export class BackupService {
  private backupDir: string
  private mongoUri: string

  constructor() {
    this.backupDir = path.join(__dirname, '../../backups')
    this.mongoUri = process.env.MONGODB_URI || ''
    
    // Create backup directory if not exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  async createBackup(): Promise<{ success: boolean; message: string; path?: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(this.backupDir, `backup-${timestamp}`)

      console.log('🔄 Starting database backup...')
      console.log('📁 Backup path:', backupPath)

      // Use mongodump command
      const command = `mongodump --uri="${this.mongoUri}" --out="${backupPath}"`
      
      await execAsync(command)

      console.log('✅ Backup completed successfully!')

      // Clean old backups (keep last 7 days)
      await this.cleanOldBackups(7)

      return {
        success: true,
        message: 'Backup muvaffaqiyatli yaratildi',
        path: backupPath,
      }
    } catch (error: any) {
      console.error('❌ Backup error:', error.message)
      return {
        success: false,
        message: `Backup xatosi: ${error.message}`,
      }
    }
  }

  async cleanOldBackups(daysToKeep: number): Promise<void> {
    try {
      const files = fs.readdirSync(this.backupDir)
      const now = Date.now()
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000 // days to milliseconds

      for (const file of files) {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)

        if (now - stats.mtimeMs > maxAge) {
          fs.rmSync(filePath, { recursive: true, force: true })
          console.log(`🗑️  Deleted old backup: ${file}`)
        }
      }
    } catch (error: any) {
      console.error('❌ Clean old backups error:', error.message)
    }
  }

  async listBackups(): Promise<Array<{ name: string; date: Date; size: number }>> {
    try {
      const files = fs.readdirSync(this.backupDir)
      
      return files.map((file) => {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        
        return {
          name: file,
          date: stats.mtime,
          size: stats.size,
        }
      }).sort((a, b) => b.date.getTime() - a.date.getTime())
    } catch (error) {
      console.error('❌ List backups error:', error)
      return []
    }
  }

  async restoreBackup(backupName: string): Promise<{ success: boolean; message: string }> {
    try {
      const backupPath = path.join(this.backupDir, backupName)

      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          message: 'Backup topilmadi',
        }
      }

      console.log('🔄 Starting database restore...')
      console.log('📁 Restore from:', backupPath)

      const command = `mongorestore --uri="${this.mongoUri}" --drop "${backupPath}"`
      
      await execAsync(command)

      console.log('✅ Restore completed successfully!')

      return {
        success: true,
        message: 'Backup muvaffaqiyatli tiklandi',
      }
    } catch (error: any) {
      console.error('❌ Restore error:', error.message)
      return {
        success: false,
        message: `Restore xatosi: ${error.message}`,
      }
    }
  }
}

export const backupService = new BackupService()
