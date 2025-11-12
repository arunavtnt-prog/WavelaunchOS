import { db } from '@/lib/db'
import { JobType, JobStatus } from '@prisma/client'
import { MAX_JOB_RETRIES, JOB_RETRY_DELAYS } from '@/lib/utils/constants'

export type JobPayload = {
  [key: string]: any
}

export type JobResult = {
  success: boolean
  data?: any
  error?: string
}

export class JobQueue {
  private processing = new Map<string, boolean>()
  private maxConcurrency = 1 // Only 1 AI job at a time

  async enqueue(type: JobType, payload: JobPayload): Promise<string> {
    const job = await db.job.create({
      data: {
        type,
        status: 'QUEUED',
        payload: JSON.stringify(payload),
        attempts: 0,
      },
    })

    // Start processing immediately
    this.processNext()

    return job.id
  }

  async getJob(id: string) {
    return db.job.findUnique({ where: { id } })
  }

  async getJobsByStatus(status: JobStatus) {
    return db.job.findMany({
      where: { status },
      orderBy: { createdAt: 'asc' },
    })
  }

  async cancelJob(id: string) {
    await db.job.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
  }

  async retryJob(id: string) {
    const job = await db.job.findUnique({ where: { id } })
    if (!job) throw new Error('Job not found')

    await db.job.update({
      where: { id },
      data: {
        status: 'QUEUED',
        attempts: 0,
        error: null,
      },
    })

    this.processNext()
  }

  private async processNext() {
    // Check if we're at max concurrency
    const processing = Array.from(this.processing.values()).filter(Boolean).length
    if (processing >= this.maxConcurrency) {
      return
    }

    // Get next queued job
    const job = await db.job.findFirst({
      where: { status: 'QUEUED' },
      orderBy: { createdAt: 'asc' },
    })

    if (!job) return

    // Mark as processing
    this.processing.set(job.id, true)

    await db.job.update({
      where: { id: job.id },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    })

    try {
      // Execute job based on type
      const payload = JSON.parse(job.payload)
      const result = await this.executeJob(job.type, payload)

      // Mark as completed
      await db.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          result: JSON.stringify(result),
          completedAt: new Date(),
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Check if we should retry
      if (job.attempts < MAX_JOB_RETRIES) {
        const delay = JOB_RETRY_DELAYS[job.attempts] || 8000

        // Schedule retry
        setTimeout(async () => {
          await db.job.update({
            where: { id: job.id },
            data: {
              status: 'QUEUED',
              attempts: job.attempts + 1,
              error: errorMessage,
            },
          })
          this.processNext()
        }, delay)
      } else {
        // Mark as failed
        await db.job.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            error: errorMessage,
            completedAt: new Date(),
          },
        })
      }
    } finally {
      this.processing.delete(job.id)
      // Process next job
      this.processNext()
    }
  }

  private async executeJob(type: JobType, payload: JobPayload): Promise<JobResult> {
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

      default:
        throw new Error(`Unknown job type: ${type}`)
    }
  }

  private async generateBusinessPlan(payload: any): Promise<JobResult> {
    // Import dynamically to avoid circular dependencies
    const { generateBusinessPlan } = await import('@/lib/ai/generate-business-plan')
    return generateBusinessPlan(payload.clientId, payload.userId)
  }

  private async generateDeliverable(payload: any): Promise<JobResult> {
    const { generateDeliverable } = await import('@/lib/ai/generate-deliverable')
    return generateDeliverable(
      payload.clientId,
      payload.month,
      payload.userId
    )
  }

  private async generatePDF(payload: any): Promise<JobResult> {
    const { generatePDF } = await import('@/lib/pdf/generator')
    return generatePDF(payload.type, payload.id, payload.quality)
  }

  private async backupDatabase(payload: any): Promise<JobResult> {
    const { createBackup } = await import('@/lib/backup/create')
    return createBackup(payload.manual, payload.userId)
  }

  private async cleanupFiles(payload: any): Promise<JobResult> {
    const { cleanupTempFiles } = await import('@/lib/files/cleanup')
    return cleanupTempFiles()
  }
}

// Singleton instance
export const jobQueue = new JobQueue()
