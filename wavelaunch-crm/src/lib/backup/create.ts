import { db } from '@/lib/db'
import { BackupLog, BackupStatus } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'
import { BACKUP_RETENTION_DAYS, BACKUP_SCHEDULE_TIME } from '@/lib/utils/constants'

const execPromise = promisify(exec)

interface BackupResult {
  success: boolean
  filename?: string
  filepath?: string
  error?: string
}

export async function createBackup(manual: boolean = false, userId?: string): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'data', 'backups')
  const filename = `backup-${timestamp}.sql`
  const filepath = path.join(backupDir, filename)

  try {
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true })

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set in environment variables')
    }

    // Create backup using pg_dump (for PostgreSQL)
    const { stdout, stderr } = await execPromise(
      `pg_dump ${databaseUrl} --file="${filepath}" --format=plain`
    )

    if (stderr) {
      console.error('Backup stderr:', stderr)
    }

    // Get file stats
    const stats = await fs.stat(filepath)
    const filesize = stats.size

    // Log the backup in database
    await db.backupLog.create({
      data: {
        filename,
        filepath,
        filesize,
        status: BackupStatus.SUCCESS,
        verified: true,
      },
    })

    // Clean up old backups
    await cleanupOldBackups()

    return {
      success: true,
      filename,
      filepath,
    }
  } catch (error) {
    console.error('Backup failed:', error)
    
    // Log the failed backup
    await db.backupLog.create({
      data: {
        filename,
        filepath,
        status: BackupStatus.FAILED,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function cleanupOldBackups(): Promise<void> {
  try {
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - BACKUP_RETENTION_DAYS)

    // Find and delete old backups
    const oldBackups = await db.backupLog.findMany({
      where: {
        createdAt: {
          lt: retentionDate,
        },
      },
    })

    for (const backup of oldBackups) {
      try {
        if (backup.filepath) {
          await fs.unlink(backup.filepath).catch(console.error)
        }
        await db.backupLog.delete({
          where: { id: backup.id },
        })
      } catch (error) {
        console.error(`Failed to delete old backup ${backup.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Error during backup cleanup:', error)
  }
}

// Export for testing
export const __test__ = {
  cleanupOldBackups,
}
