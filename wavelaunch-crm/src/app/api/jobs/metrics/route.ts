import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth/authorize'
import { jobQueue } from '@/lib/jobs'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/api/responses'

/**
 * GET /api/jobs/metrics - Get job queue metrics
 * Returns comprehensive metrics about the job queue status
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin access for metrics
    await requireAdmin()

    // Get queue metrics from BullMQ or in-memory queue
    const queueMetrics = await jobQueue.getQueueMetrics()

    // Get database stats
    const [totalJobs, queuedJobs, processingJobs, completedJobs, failedJobs, recentJobs] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'QUEUED' } }),
      prisma.job.count({ where: { status: 'PROCESSING' } }),
      prisma.job.count({ where: { status: 'COMPLETED' } }),
      prisma.job.count({ where: { status: 'FAILED' } }),
      prisma.job.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
          startedAt: true,
          completedAt: true,
          attempts: true,
          error: true,
        },
      }),
    ])

    // Calculate success rate
    const totalProcessed = completedJobs + failedJobs
    const successRate = totalProcessed > 0 ? (completedJobs / totalProcessed) * 100 : 0

    // Get job type breakdown
    const jobTypeBreakdown = await prisma.job.groupBy({
      by: ['type', 'status'],
      _count: {
        id: true,
      },
    })

    // Get average processing time (last 100 completed jobs)
    const recentCompleted = await prisma.job.findMany({
      where: {
        status: 'COMPLETED',
        startedAt: { not: null },
        completedAt: { not: null },
      },
      take: 100,
      orderBy: { completedAt: 'desc' },
      select: {
        startedAt: true,
        completedAt: true,
      },
    })

    const avgProcessingTime = recentCompleted.length > 0
      ? recentCompleted.reduce((sum, job) => {
          const duration = job.completedAt!.getTime() - job.startedAt!.getTime()
          return sum + duration
        }, 0) / recentCompleted.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: totalJobs,
          queued: queuedJobs,
          processing: processingJobs,
          completed: completedJobs,
          failed: failedJobs,
          successRate: Math.round(successRate * 100) / 100,
        },
        queueMetrics,
        performance: {
          avgProcessingTimeMs: Math.round(avgProcessingTime),
          avgProcessingTimeSec: Math.round(avgProcessingTime / 1000),
        },
        jobTypeBreakdown,
        recentJobs,
        usingBullMQ: jobQueue.isUsingBullMQ(),
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
