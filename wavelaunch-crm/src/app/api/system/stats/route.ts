import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import * as fs from 'fs/promises'
import * as path from 'path'

// GET /api/system/stats - Get system statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Database size
    const dbPath = path.join(process.cwd(), 'data', 'wavelaunch.db')
    let databaseSizeBytes = 0
    try {
      const dbStats = await fs.stat(dbPath)
      databaseSizeBytes = dbStats.size
    } catch (error) {
      console.error('Error reading database size:', error)
    }

    // File storage
    const fileStorage = await db.file.aggregate({
      _sum: { fileSize: true },
      _count: true,
    })
    const totalFileStorageBytes = fileStorage._sum.fileSize || 0
    const totalFiles = fileStorage._count

    // Backup storage
    const backupDir = path.join(process.cwd(), 'data', 'backups')
    let backupSizeBytes = 0
    let backupCount = 0
    try {
      const backupFiles = await fs.readdir(backupDir)
      for (const file of backupFiles) {
        if (file.endsWith('.db')) {
          const filePath = path.join(backupDir, file)
          const stats = await fs.stat(filePath)
          backupSizeBytes += stats.size
          backupCount++
        }
      }
    } catch (error) {
      console.error('Error reading backup directory:', error)
    }

    // Job queue stats
    const jobStats = await db.job.groupBy({
      by: ['status'],
      _count: true,
    })

    const jobsByStatus = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
    }

    jobStats.forEach((stat) => {
      jobsByStatus[stat.status as keyof typeof jobsByStatus] = stat._count
    })

    // Recent failed jobs
    const recentFailedJobs = await db.job.findMany({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        error: true,
        createdAt: true,
      },
    })

    // Database record counts
    const [
      clientCount,
      businessPlanCount,
      deliverableCount,
      noteCount,
      activityCount,
    ] = await Promise.all([
      db.client.count({ where: { deletedAt: null } }),
      db.businessPlan.count(),
      db.deliverable.count(),
      db.note.count(),
      db.activity.count(),
    ])

    // System uptime (app start time - would need to be tracked in production)
    const uptimeSeconds = process.uptime()

    // Memory usage
    const memoryUsage = process.memoryUsage()

    return NextResponse.json({
      success: true,
      data: {
        storage: {
          database: {
            bytes: databaseSizeBytes,
            readable: formatBytes(databaseSizeBytes),
          },
          files: {
            bytes: totalFileStorageBytes,
            count: totalFiles,
            readable: formatBytes(totalFileStorageBytes),
          },
          backups: {
            bytes: backupSizeBytes,
            count: backupCount,
            readable: formatBytes(backupSizeBytes),
          },
          total: {
            bytes: databaseSizeBytes + totalFileStorageBytes + backupSizeBytes,
            readable: formatBytes(databaseSizeBytes + totalFileStorageBytes + backupSizeBytes),
          },
        },
        jobs: {
          byStatus: jobsByStatus,
          total: Object.values(jobsByStatus).reduce((a, b) => a + b, 0),
          recentFailures: recentFailedJobs,
        },
        records: {
          clients: clientCount,
          businessPlans: businessPlanCount,
          deliverables: deliverableCount,
          notes: noteCount,
          activities: activityCount,
        },
        system: {
          uptimeSeconds,
          uptimeReadable: formatUptime(uptimeSeconds),
          memory: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
            rssReadable: formatBytes(memoryUsage.rss),
            heapUsedReadable: formatBytes(memoryUsage.heapUsed),
          },
          nodeVersion: process.version,
          platform: process.platform,
        },
      },
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.join(' ') || '0m'
}
