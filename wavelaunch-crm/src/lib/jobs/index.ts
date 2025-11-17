/**
 * Unified Job Queue Interface
 *
 * Provides a consistent API for job queueing that automatically
 * uses BullMQ (when Redis is available) or falls back to in-memory queue.
 *
 * This allows for:
 * - Development without Redis (in-memory)
 * - Production with Redis (BullMQ)
 * - Seamless migration between the two
 */

import { JobType, JobStatus } from '@prisma/client'
import { isRedisAvailable } from '@/lib/redis/client'
import { bullMQJobQueue, JobPayload, JobResult, JOB_PRIORITY } from './bullmq-queue'
import { jobQueue as inMemoryQueue } from './queue'
import { logInfo, logWarn } from '@/lib/logging/logger'

/**
 * Job Queue Interface
 * Provides unified API regardless of backend implementation
 */
interface IJobQueue {
  enqueue(type: JobType, payload: JobPayload, options?: EnqueueOptions): Promise<string>
  getJob(id: string): Promise<any>
  getJobsByStatus(status: JobStatus): Promise<any[]>
  cancelJob(id: string): Promise<void>
  retryJob(id: string): Promise<void>
}

export interface EnqueueOptions {
  priority?: number
  delay?: number // Delay in milliseconds
}

/**
 * Unified Job Queue
 * Routes to BullMQ or in-memory queue based on Redis availability
 */
class UnifiedJobQueue implements IJobQueue {
  private useBullMQ: boolean

  constructor() {
    this.useBullMQ = isRedisAvailable()

    if (this.useBullMQ) {
      logInfo('Job queue using BullMQ (Redis-backed)')
    } else {
      logWarn('Job queue using in-memory implementation (Redis not available)')
      logWarn('For production, please configure Redis for persistent job queue')
    }
  }

  /**
   * Enqueue a new job
   */
  async enqueue(
    type: JobType,
    payload: JobPayload,
    options?: EnqueueOptions
  ): Promise<string> {
    if (this.useBullMQ) {
      return bullMQJobQueue.enqueue(type, payload, options)
    } else {
      // In-memory queue doesn't support options (priority, delay)
      if (options?.delay) {
        logWarn(`Job delay not supported in in-memory queue. Ignoring delay of ${options.delay}ms`)
      }
      if (options?.priority) {
        logWarn(`Job priority not supported in in-memory queue. Ignoring priority ${options.priority}`)
      }
      return inMemoryQueue.enqueue(type, payload)
    }
  }

  /**
   * Get job by ID
   */
  async getJob(id: string) {
    return inMemoryQueue.getJob(id) // Both implementations use same database
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: JobStatus) {
    return inMemoryQueue.getJobsByStatus(status) // Both implementations use same database
  }

  /**
   * Cancel a job
   */
  async cancelJob(id: string): Promise<void> {
    if (this.useBullMQ) {
      await bullMQJobQueue.cancelJob(id)
    } else {
      await inMemoryQueue.cancelJob(id)
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(id: string): Promise<void> {
    if (this.useBullMQ) {
      await bullMQJobQueue.retryJob(id)
    } else {
      await inMemoryQueue.retryJob(id)
    }
  }

  /**
   * Get queue metrics (BullMQ only)
   */
  async getQueueMetrics() {
    if (this.useBullMQ) {
      return bullMQJobQueue.getQueueMetrics()
    } else {
      // Return basic metrics for in-memory queue
      const [queued, processing, completed, failed] = await Promise.all([
        this.getJobsByStatus('QUEUED'),
        this.getJobsByStatus('PROCESSING'),
        this.getJobsByStatus('COMPLETED'),
        this.getJobsByStatus('FAILED'),
      ])

      return {
        'in-memory': {
          waiting: queued.length,
          active: processing.length,
          completed: completed.length,
          failed: failed.length,
          delayed: 0,
        },
      }
    }
  }

  /**
   * Check if using BullMQ
   */
  isUsingBullMQ(): boolean {
    return this.useBullMQ
  }
}

// Export singleton instance
export const jobQueue = new UnifiedJobQueue()

// Export types and constants
export type { JobPayload, JobResult }
export { JOB_PRIORITY }
export { JobType, JobStatus }
