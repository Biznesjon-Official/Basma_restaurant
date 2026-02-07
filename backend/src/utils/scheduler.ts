import cron, { ScheduledTask } from 'node-cron'
import { backupService } from './backup'

export class Scheduler {
  private tasks: Map<string, ScheduledTask> = new Map()

  // Schedule daily backup at 3:00 AM
  scheduleDailyBackup() {
    const task = cron.schedule('0 3 * * *', async () => {
      console.log('⏰ Running scheduled backup...')
      const result = await backupService.createBackup()
      
      if (result.success) {
        console.log('✅ Scheduled backup completed')
      } else {
        console.error('❌ Scheduled backup failed:', result.message)
      }
    })

    this.tasks.set('daily-backup', task)
    console.log('📅 Daily backup scheduled at 3:00 AM')
  }

  // Stop all scheduled tasks
  stopAll() {
    this.tasks.forEach((task, name) => {
      task.stop()
      console.log(`⏹️  Stopped task: ${name}`)
    })
    this.tasks.clear()
  }

  // Start all tasks
  startAll() {
    this.scheduleDailyBackup()
  }
}

export const scheduler = new Scheduler()
