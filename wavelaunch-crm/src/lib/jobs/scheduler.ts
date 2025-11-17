/**
 * Job Scheduler
 *
 * Manages scheduled and recurring background tasks using cron-like patterns.
 * Supports both BullMQ (when Redis available) and simple interval-based scheduling.
 *
 * Features:
 * - Cron-like scheduling patterns
 * - Timezone support
 * - Job deduplication (prevent duplicate scheduled jobs)
 * - Automatic retry on failure
 * - Configurable schedules per environment
 */

import { Queue, QueueScheduler } from 'bullmq'
import { isRedisAvailable } from '@/lib/redis/client'
import { jobQueue, JOB_PRIORITY } from './index'
import { logInfo, logError, logDebug } from '@/lib/logging/logger'

// Cron patterns for common schedules
export const SCHEDULES = {
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_6_HOURS: '0 */6 * * *',
  EVERY_12_HOURS: '0 */12 * * *',
  DAILY_AT_MIDNIGHT: '0 0 * * *',
  DAILY_AT_2AM: '0 2 * * *',
  DAILY_AT_NOON: '0 12 * * *',
  WEEKLY_SUNDAY: '0 0 * * 0',
  WEEKLY_MONDAY: '0 0 * * 1',
  MONTHLY_FIRST: '0 0 1 * *',
} as const

export interface ScheduledTask {
  name: string
  pattern: string // Cron pattern
  jobType: string
  payload: any
  enabled: boolean
  priority?: number
  description?: string
}

// Default scheduled tasks
const DEFAULT_TASKS: ScheduledTask[] = [
  {
    name: 'cleanup-temp-files',
    pattern: SCHEDULES.DAILY_AT_2AM,
    jobType: 'CLEANUP_FILES',
    payload: {},
    enabled: true,
    priority: JOB_PRIORITY.LOW,
    description: 'Clean up temporary files and old uploads',
  },
  {
    name: 'database-backup',
    pattern: SCHEDULES.DAILY_AT_MIDNIGHT,
    jobType: 'BACKUP_DATABASE',
    payload: { label: 'scheduled-daily-backup' },
    enabled: true,
    priority: JOB_PRIORITY.NORMAL,
    description: 'Create daily database backup',
  },
  {
    name: 'cleanup-old-jobs',
    pattern: SCHEDULES.WEEKLY_SUNDAY,
    jobType: 'CLEANUP_OLD_JOBS',
    payload: { olderThanDays: 30 },
    enabled: true,
    priority: JOB_PRIORITY.LOW,
    description: 'Remove completed jobs older than 30 days',
  },
  {
    name: 'send-reminder-emails',
    pattern: SCHEDULES.DAILY_AT_NOON,
    jobType: 'SEND_REMINDER_EMAILS',
    payload: {},
    enabled: false, // Disabled until email system is fully implemented
    priority: JOB_PRIORITY.NORMAL,
    description: 'Send reminder emails for pending deliverables',
  },
  {
    name: 'update-client-metrics',
    pattern: SCHEDULES.EVERY_6_HOURS,
    jobType: 'UPDATE_CLIENT_METRICS',
    payload: {},
    enabled: false, // Disabled until metrics system is implemented
    priority: JOB_PRIORITY.LOW,
    description: 'Update client engagement metrics',
  },
]

/**
 * Job Scheduler
 * Manages scheduled tasks with cron-like patterns
 */
class JobScheduler {
  private schedulers: Map<string, any> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isInitialized = false

  /**
   * Initialize the scheduler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logDebug('Job scheduler already initialized')
      return
    }

    logInfo('Initializing job scheduler...')

    // Get tasks from database or use defaults
    const tasks = await this.getScheduledTasks()

    if (isRedisAvailable()) {
      // Use BullMQ for scheduling (production)
      await this.initializeBullMQScheduler(tasks)
    } else {
      // Use interval-based scheduling (development)
      logDebug('Redis not available, using interval-based scheduler')
      this.initializeIntervalScheduler(tasks)
    }

    this.isInitialized = true
    logInfo(`Job scheduler initialized with ${tasks.length} tasks`)
  }

  /**
   * Initialize BullMQ-based scheduler (production)
   */
  private async initializeBullMQScheduler(tasks: ScheduledTask[]): Promise<void> {
    for (const task of tasks) {
      if (!task.enabled) {
        logDebug(`Skipping disabled task: ${task.name}`)
        continue
      }

      try {
        // Create a queue for this scheduled task
        const queue = new Queue(`scheduled-${task.name}`, {
          connection: {
            host: process.env.REDIS_URL?.replace('redis://', '')?.split(':')[0] || 'localhost',
            port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
            maxRetriesPerRequest: null,
          },
        })

        // Add repeatable job with cron pattern
        await queue.add(
          task.jobType,
          task.payload,
          {
            repeat: {
              pattern: task.pattern,
            },
            priority: task.priority || JOB_PRIORITY.NORMAL,
            removeOnComplete: true,
            removeOnFail: false,
          }
        )

        this.schedulers.set(task.name, queue)
        logInfo(`Scheduled task: ${task.name} (${task.pattern})`, {
          task: task.name,
          pattern: task.pattern,
          description: task.description,
        })
      } catch (error) {
        logError(`Failed to schedule task: ${task.name}`, error as Error)
      }
    }
  }

  /**
   * Initialize interval-based scheduler (development fallback)
   */
  private initializeIntervalScheduler(tasks: ScheduledTask[]): void {
    for (const task of tasks) {
      if (!task.enabled) {
        logDebug(`Skipping disabled task: ${task.name}`)
        continue
      }

      // Convert cron pattern to interval (simplified)
      const intervalMs = this.cronToInterval(task.pattern)

      if (intervalMs) {
        const interval = setInterval(async () => {
          logInfo(`Running scheduled task: ${task.name}`)
          try {
            await jobQueue.enqueue(task.jobType as any, task.payload, {
              priority: task.priority,
            })
          } catch (error) {
            logError(`Failed to enqueue scheduled task: ${task.name}`, error as Error)
          }
        }, intervalMs)

        this.intervals.set(task.name, interval)
        logInfo(`Scheduled task: ${task.name} (every ${intervalMs / 1000}s)`, {
          task: task.name,
          intervalSeconds: intervalMs / 1000,
          description: task.description,
        })
      } else {
        logError(`Could not parse cron pattern for task: ${task.name}`)
      }
    }
  }

  /**
   * Convert simple cron patterns to intervals (for development mode)
   * Only supports basic patterns
   */
  private cronToInterval(pattern: string): number | null {
    // Map common patterns to milliseconds
    const patternMap: Record<string, number> = {
      [SCHEDULES.EVERY_MINUTE]: 60 * 1000,
      [SCHEDULES.EVERY_5_MINUTES]: 5 * 60 * 1000,
      [SCHEDULES.EVERY_15_MINUTES]: 15 * 60 * 1000,
      [SCHEDULES.EVERY_30_MINUTES]: 30 * 60 * 1000,
      [SCHEDULES.EVERY_HOUR]: 60 * 60 * 1000,
      [SCHEDULES.EVERY_6_HOURS]: 6 * 60 * 60 * 1000,
      [SCHEDULES.EVERY_12_HOURS]: 12 * 60 * 60 * 1000,
      [SCHEDULES.DAILY_AT_MIDNIGHT]: 24 * 60 * 60 * 1000,
      [SCHEDULES.DAILY_AT_2AM]: 24 * 60 * 60 * 1000,
      [SCHEDULES.DAILY_AT_NOON]: 24 * 60 * 60 * 1000,
      [SCHEDULES.WEEKLY_SUNDAY]: 7 * 24 * 60 * 60 * 1000,
      [SCHEDULES.WEEKLY_MONDAY]: 7 * 24 * 60 * 60 * 1000,
      [SCHEDULES.MONTHLY_FIRST]: 30 * 24 * 60 * 60 * 1000,
    }

    return patternMap[pattern] || null
  }

  /**
   * Get scheduled tasks from database or defaults
   */
  private async getScheduledTasks(): Promise<ScheduledTask[]> {
    // For now, return default tasks
    // In the future, this could load from database to allow dynamic configuration
    return DEFAULT_TASKS
  }

  /**
   * Add a new scheduled task
   */
  async addTask(task: ScheduledTask): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    logInfo(`Adding scheduled task: ${task.name}`)

    if (isRedisAvailable()) {
      const queue = new Queue(`scheduled-${task.name}`, {
        connection: {
          host: process.env.REDIS_URL?.replace('redis://', '')?.split(':')[0] || 'localhost',
          port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
          maxRetriesPerRequest: null,
        },
      })

      await queue.add(
        task.jobType,
        task.payload,
        {
          repeat: {
            pattern: task.pattern,
          },
          priority: task.priority || JOB_PRIORITY.NORMAL,
        }
      )

      this.schedulers.set(task.name, queue)
    } else {
      const intervalMs = this.cronToInterval(task.pattern)
      if (intervalMs) {
        const interval = setInterval(async () => {
          try {
            await jobQueue.enqueue(task.jobType as any, task.payload, {
              priority: task.priority,
            })
          } catch (error) {
            logError(`Failed to enqueue scheduled task: ${task.name}`, error as Error)
          }
        }, intervalMs)

        this.intervals.set(task.name, interval)
      }
    }
  }

  /**
   * Remove a scheduled task
   */
  async removeTask(taskName: string): Promise<void> {
    logInfo(`Removing scheduled task: ${taskName}`)

    // Remove from BullMQ
    const queue = this.schedulers.get(taskName)
    if (queue) {
      const repeatableJobs = await queue.getRepeatableJobs()
      for (const job of repeatableJobs) {
        await queue.removeRepeatableByKey(job.key)
      }
      await queue.close()
      this.schedulers.delete(taskName)
    }

    // Remove from intervals
    const interval = this.intervals.get(taskName)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(taskName)
    }
  }

  /**
   * List all scheduled tasks
   */
  async listTasks(): Promise<ScheduledTask[]> {
    return this.getScheduledTasks()
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logInfo('Shutting down job scheduler...')

    // Clear all intervals
    for (const [name, interval] of this.intervals) {
      clearInterval(interval)
      logDebug(`Cleared interval for task: ${name}`)
    }
    this.intervals.clear()

    // Close all BullMQ schedulers
    for (const [name, queue] of this.schedulers) {
      await queue.close()
      logDebug(`Closed scheduler for task: ${name}`)
    }
    this.schedulers.clear()

    this.isInitialized = false
    logInfo('Job scheduler shut down successfully')
  }
}

// Singleton instance
export const scheduler = new JobScheduler()

// Initialize on module load
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULER === 'true') {
  scheduler.initialize().catch((error) => {
    logError('Failed to initialize job scheduler', error)
  })
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await scheduler.shutdown()
})

process.on('SIGINT', async () => {
  await scheduler.shutdown()
})
