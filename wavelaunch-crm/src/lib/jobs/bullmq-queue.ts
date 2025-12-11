/**
 * BullMQ Job Queue System
 *
 * Distributed job queue using BullMQ and Redis for production-ready background processing.
 * Replaces in-memory queue with persistent, scalable queue system.
 *
 * Features:
 * - Persistent jobs (survive server restarts)
 * - Distributed processing (multiple workers)
 * - Job prioritization
 * - Automatic retries with exponential backoff
 * - Job progress tracking
 * - Delayed jobs (scheduling)
 * - Job monitoring and metrics
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { JobType, JobStatus } from '@prisma/client'
import { getRedis, isRedisAvailable } from '@/lib/redis/client'
import { db } from '@/lib/db'
import { logInfo, logError, logDebug } from '@/lib/logging/logger'

export type JobPayload = {
  [key: string]: any
}

export type JobResult = {
  success: boolean
  data?: any
  error?: string
}

// Job queue names
const QUEUE_NAMES = {
  AI_GENERATION: 'ai-generation',
  PDF_GENERATION: 'pdf-generation',
  FILE_OPERATIONS: 'file-operations',
  DATABASE_OPERATIONS: 'database-operations',
  SCHEDULED_TASKS: 'scheduled-tasks',
} as const

// Job priorities (lower number = higher priority)
export const JOB_PRIORITY = {
  CRITICAL: 1,
  HIGH: 3,
  NORMAL: 5,
  LOW: 7,
} as const

// Redis connection configuration
const CONNECTION_CONFIG = {
  host: process.env.REDIS_URL?.replace('redis://', '')?.split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    // Reconnect after exponential backoff
    return Math.min(times * 50, 2000)
  },
}

/**
 * BullMQ Queue Manager
 * Manages multiple queues for different job types
 */
class BullMQJobQueue {
  private queues: Map<string, Queue> = new Map()
  private workers: Map<string, Worker> = new Map()
  private queueEvents: Map<string, QueueEvents> = new Map()
  private isInitialized = false

  /**
   * Initialize all queues and workers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logDebug('BullMQ already initialized')
      return
    }

    if (!isRedisAvailable()) {
      logError('Redis not available. BullMQ requires Redis to function.')
      throw new Error('Redis connection required for BullMQ')
    }

    try {
      logInfo('Initializing BullMQ job queue system...')

      // Initialize all queues
      for (const [name, queueName] of Object.entries(QUEUE_NAMES)) {
        await this.createQueue(queueName)
        await this.createWorker(queueName)
        await this.setupQueueEvents(queueName)
      }

      this.isInitialized = true
      logInfo('BullMQ job queue system initialized successfully', {
        queues: Object.values(QUEUE_NAMES),
      })
    } catch (error) {
      logError('Failed to initialize BullMQ', error as Error)
      throw error
    }
  }

  /**
   * Create a queue instance
   */
  private async createQueue(queueName: string): Promise<Queue> {
    const queue = new Queue(queueName, {
      connection: CONNECTION_CONFIG,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    })

    this.queues.set(queueName, queue)
    logDebug(`Created queue: ${queueName}`)
    return queue
  }

  /**
   * Create a worker for processing jobs
   */
  private async createWorker(queueName: string): Promise<Worker> {
    const worker = new Worker(
      queueName,
      async (job: Job) => {
        logInfo(`Processing job ${job.id} of type ${job.name}`, {
          jobId: job.id,
          jobName: job.name,
          queueName,
          attempt: job.attemptsMade + 1,
        })

        try {
          // Update database status to PROCESSING
          if (job.data.jobId) {
            await db.job.update({
              where: { id: job.data.jobId },
              data: {
                status: 'PROCESSING',
                startedAt: new Date(),
              },
            })
          }

          // Execute the job
          const result = await this.executeJob(job.name as JobType, job.data)

          // Update database status to COMPLETED
          if (job.data.jobId) {
            await db.job.update({
              where: { id: job.data.jobId },
              data: {
                status: 'COMPLETED',
                result: JSON.stringify(result),
                completedAt: new Date(),
              },
            })
          }

          logInfo(`Job ${job.id} completed successfully`, {
            jobId: job.id,
            jobName: job.name,
          })

          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          logError(`Job ${job.id} failed`, error as Error, {
            jobId: job.id,
            jobName: job.name,
            attempt: job.attemptsMade + 1,
          })

          // Update database with error
          if (job.data.jobId) {
            const attempts = job.attemptsMade + 1
            await db.job.update({
              where: { id: job.data.jobId },
              data: {
                attempts,
                error: errorMessage,
                status: attempts >= 3 ? 'FAILED' : 'QUEUED',
                completedAt: attempts >= 3 ? new Date() : undefined,
              },
            })
          }

          throw error
        }
      },
      {
        connection: CONNECTION_CONFIG,
        concurrency: queueName === QUEUE_NAMES.AI_GENERATION ? 1 : 3, // AI jobs: 1 at a time, others: 3
        limiter: {
          max: queueName === QUEUE_NAMES.AI_GENERATION ? 10 : 100, // Max jobs per duration
          duration: 60000, // 1 minute
        },
      }
    )

    // Handle worker events
    worker.on('completed', (job, result) => {
      logDebug(`Worker completed job ${job.id}`, { jobId: job.id, result })
    })

    worker.on('failed', (job, error) => {
      logError(`Worker failed job ${job?.id}`, error, { jobId: job?.id })
    })

    worker.on('error', (error) => {
      logError('Worker error', error)
    })

    this.workers.set(queueName, worker)
    logDebug(`Created worker for queue: ${queueName}`)
    return worker
  }

  /**
   * Setup queue event listeners for monitoring
   */
  private async setupQueueEvents(queueName: string): Promise<void> {
    const queueEvents = new QueueEvents(queueName, {
      connection: CONNECTION_CONFIG,
    })

    queueEvents.on('waiting', ({ jobId }) => {
      logDebug(`Job ${jobId} is waiting in ${queueName}`)
    })

    queueEvents.on('active', ({ jobId, prev }) => {
      logDebug(`Job ${jobId} is now active in ${queueName}`)
    })

    queueEvents.on('completed', ({ jobId, returnvalue }) => {
      logDebug(`Job ${jobId} completed in ${queueName}`)
    })

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      logError(`Job ${jobId} failed in ${queueName}: ${failedReason}`)
    })

    queueEvents.on('progress', ({ jobId, data }) => {
      logDebug(`Job ${jobId} progress in ${queueName}:`, { progress: data })
    })

    this.queueEvents.set(queueName, queueEvents)
  }

  /**
   * Get queue for a specific job type
   */
  private getQueueForJobType(type: JobType): Queue {
    let queueName: string

    switch (type) {
      case 'GENERATE_BUSINESS_PLAN':
      case 'GENERATE_DELIVERABLE':
        queueName = QUEUE_NAMES.AI_GENERATION
        break

      case 'GENERATE_PDF':
        queueName = QUEUE_NAMES.PDF_GENERATION
        break

      case 'CLEANUP_FILES':
        queueName = QUEUE_NAMES.FILE_OPERATIONS
        break

      case 'BACKUP_DATABASE':
        queueName = QUEUE_NAMES.DATABASE_OPERATIONS
        break

      default:
        queueName = QUEUE_NAMES.SCHEDULED_TASKS
    }

    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`)
    }

    return queue
  }

  /**
   * Enqueue a new job
   */
  async enqueue(
    type: JobType,
    payload: JobPayload,
    options?: {
      priority?: number
      delay?: number // Delay in milliseconds
    }
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Create job record in database
    const dbJob = await db.job.create({
      data: {
        type,
        status: 'QUEUED',
        payload: JSON.stringify(payload),
        attempts: 0,
      },
    })

    // Add to BullMQ queue
    const queue = this.getQueueForJobType(type)
    const job = await queue.add(type, { ...payload, jobId: dbJob.id }, {
      priority: options?.priority || JOB_PRIORITY.NORMAL,
      delay: options?.delay,
      jobId: `${type}-${dbJob.id}`,
    })

    logInfo(`Enqueued job ${dbJob.id} of type ${type}`, {
      jobId: dbJob.id,
      type,
      queueName: queue.name,
    })

    return dbJob.id
  }

  /**
   * Get job status from BullMQ
   */
  async getJobStatus(id: string): Promise<JobStatus | null> {
    const dbJob = await db.job.findUnique({ where: { id } })
    return dbJob?.status || null
  }

  /**
   * Cancel a job
   */
  async cancelJob(id: string): Promise<void> {
    const dbJob = await db.job.findUnique({ where: { id } })
    if (!dbJob) {
      throw new Error('Job not found')
    }

    // Remove from BullMQ queue
    const queue = this.getQueueForJobType(dbJob.type)
    const bullJobId = `${dbJob.type}-${id}`
    const job = await queue.getJob(bullJobId)

    if (job) {
      await job.remove()
      logInfo(`Removed job ${id} from BullMQ queue`)
    }

    // Update database
    await db.job.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    logInfo(`Cancelled job ${id}`)
  }

  /**
   * Retry a failed job
   */
  async retryJob(id: string): Promise<void> {
    const dbJob = await db.job.findUnique({ where: { id } })
    if (!dbJob) {
      throw new Error('Job not found')
    }

    // Reset attempts and status in database
    await db.job.update({
      where: { id },
      data: {
        status: 'QUEUED',
        attempts: 0,
        error: null,
      },
    })

    // Re-enqueue in BullMQ
    const payload = JSON.parse(dbJob.payload)
    const queue = this.getQueueForJobType(dbJob.type)
    await queue.add(dbJob.type, { ...payload, jobId: dbJob.id }, {
      jobId: `${dbJob.type}-${id}`,
    })

    logInfo(`Retrying job ${id}`)
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics() {
    const metrics: Record<string, any> = {}

    const entries = Array.from(this.queues.entries())
    for (const [name, queue] of entries) {
      const counts = await queue.getJobCounts()
      metrics[name] = {
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
      }
    }

    return metrics
  }

  /**
   * Execute a job based on its type
   */
  private async executeJob(type: JobType, payload: any): Promise<JobResult> {
    switch (type) {
      case 'GENERATE_BUSINESS_PLAN':
        return this.generateBusinessPlan(payload)

      case 'GENERATE_DELIVERABLE':
        return this.generateDeliverable(payload)

      case 'GENERATE_PDF':
        return this.generatePDF(payload)

      case 'BACKUP_DATABASE':
        return this.backupDatabase(payload)

      case 'CLEANUP_FILES':
        return this.cleanupFiles(payload)

      case 'CLEANUP_OLD_JOBS':
        return this.cleanupOldJobs(payload)

      case 'SEND_EMAIL':
        return this.sendEmail(payload)

      case 'SEND_REMINDER_EMAILS':
        return this.sendReminderEmails(payload)

      case 'UPDATE_CLIENT_METRICS':
        return this.updateClientMetrics(payload)

      default:
        throw new Error(`Unknown job type: ${type}`)
    }
  }

  private async generateBusinessPlan(payload: any): Promise<JobResult> {
    const { generateBusinessPlan } = await import('@/lib/ai/generate-business-plan')
    return generateBusinessPlan(payload.clientId, payload.userId)
  }

  private async generateDeliverable(payload: any): Promise<JobResult> {
    const { generateDeliverable } = await import('@/lib/ai/generate-deliverable')
    return generateDeliverable(payload.clientId, payload.month, payload.userId)
  }

  private async generatePDF(payload: any): Promise<JobResult> {
    if (payload.businessPlanId) {
      const { generateBusinessPlanPDF } = await import('@/lib/pdf/generate-business-plan-pdf')
      return generateBusinessPlanPDF({
        businessPlanId: payload.businessPlanId,
        quality: payload.quality || 'final',
        userId: payload.userId,
      })
    } else if (payload.deliverableId) {
      const { generateDeliverablePDF } = await import('@/lib/pdf/generate-deliverable-pdf')
      return generateDeliverablePDF({
        deliverableId: payload.deliverableId,
        quality: payload.quality || 'final',
        userId: payload.userId,
      })
    } else {
      throw new Error('Missing businessPlanId or deliverableId in PDF generation payload')
    }
  }

  private async backupDatabase(payload: any): Promise<JobResult> {
    const { createBackup } = await import('@/lib/backup/backup')
    return createBackup(payload.label)
  }

  private async cleanupFiles(payload: any): Promise<JobResult> {
    const { cleanupTempFiles } = await import('@/lib/files/cleanup')
    return cleanupTempFiles()
  }

  private async cleanupOldJobs(payload: any): Promise<JobResult> {
    const olderThanDays = payload.olderThanDays || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const deleted = await db.job.deleteMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          lt: cutoffDate,
        },
      },
    })

    logInfo(`Cleaned up ${deleted.count} old completed jobs`, {
      olderThanDays,
      cutoffDate,
    })

    return {
      success: true,
      data: { deletedCount: deleted.count },
    }
  }

  private async sendEmail(payload: any): Promise<JobResult> {
    const { sendTemplatedEmail } = await import('@/lib/email/sender')

    try {
      const success = await sendTemplatedEmail(
        payload.to,
        payload.type,
        payload.context || {}
      )

      return {
        success,
        data: { emailSent: success },
      }
    } catch (error) {
      logError('Email send job failed', error as Error, {
        type: payload.type,
        to: payload.to,
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email send failed',
      }
    }
  }

  private async sendReminderEmails(payload: any): Promise<JobResult> {
    // Check for overdue deliverables and send reminders
    const { clientJourneyWorkflow } = await import('@/lib/workflows/client-journey')
    await clientJourneyWorkflow.checkOverdueDeliverables(payload.userId || 'system')

    return {
      success: true,
      data: { message: 'Reminder emails processed' },
    }
  }

  private async updateClientMetrics(payload: any): Promise<JobResult> {
    // This will be implemented when metrics system is added
    // For now, just return success
    logInfo('Client metrics update job executed (metrics system not yet implemented)')

    return {
      success: true,
      data: { message: 'Metrics updated (not yet implemented)' },
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logInfo('Shutting down BullMQ job queue system...')

    // Close all workers first (stop processing new jobs)
    const workerEntries = Array.from(this.workers.entries())
    for (const [name, worker] of workerEntries) {
      await worker.close()
      logDebug(`Closed worker: ${name}`)
    }

    // Close all queue event listeners
    const queueEventEntries = Array.from(this.queueEvents.entries())
    for (const [name, queueEvents] of queueEventEntries) {
      await queueEvents.close()
      logDebug(`Closed queue events: ${name}`)
    }

    // Close all queues
    const queueEntries = Array.from(this.queues.entries())
    for (const [name, queue] of queueEntries) {
      await queue.close()
      logDebug(`Closed queue: ${name}`)
    }

    this.isInitialized = false
    logInfo('BullMQ job queue system shut down successfully')
  }
}

// Singleton instance
export const bullMQJobQueue = new BullMQJobQueue()

// Initialize on module load if Redis is available
if (isRedisAvailable()) {
  bullMQJobQueue.initialize().catch((error) => {
    logError('Failed to initialize BullMQ on module load', error)
  })
}

// Graceful shutdown on process termination
process.on('SIGTERM', async () => {
  await bullMQJobQueue.shutdown()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await bullMQJobQueue.shutdown()
  process.exit(0)
})
