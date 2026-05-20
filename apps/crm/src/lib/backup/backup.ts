import * as fs from 'fs/promises'
import * as path from 'path'
import type { JobResult } from '@/types'

export interface BackupInfo {
  filename: string
  filepath: string
  timestamp: Date
  sizeBytes: number
  isValid: boolean
}

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups')
const DB_PATH = path.join(process.cwd(), 'data', 'wavelaunch.db')
const RETENTION_DAYS = 30

/**
 * Ensure backup directory exists
 */
async function ensureBackupDir(): Promise<void> {
  await fs.mkdir(BACKUP_DIR, { recursive: true })
}

/**
 * Create a backup of the database
 */
export async function createBackup(label?: string): Promise<JobResult> {
  try {
    await ensureBackupDir()

    // Check if database exists
    try {
      await fs.access(DB_PATH)
    } catch (error) {
      return {
        success: false,
        error: 'Database file not found',
      }
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const labelSuffix = label ? `-${label.replace(/[^a-zA-Z0-9-]/g, '_')}` : ''
    const filename = `backup-${timestamp}${labelSuffix}.db`
    const backupPath = path.join(BACKUP_DIR, filename)

    // Copy database file
    await fs.copyFile(DB_PATH, backupPath)

    // Verify backup
    const isValid = await verifyBackup(backupPath)
    if (!isValid) {
      await fs.unlink(backupPath)
      return {
        success: false,
        error: 'Backup verification failed',
      }
    }

    // Get file size
    const stats = await fs.stat(backupPath)

    console.log(`Created backup: ${filename} (${stats.size} bytes)`)

    return {
      success: true,
      data: {
        filename,
        filepath: backupPath,
        sizeBytes: stats.size,
      },
      message: 'Backup created successfully',
    }
  } catch (error: any) {
    console.error('Error creating backup:', error)
    return {
      success: false,
      error: error.message || 'Failed to create backup',
    }
  }
}

/**
 * Verify a backup file is valid database
 */
export async function verifyBackup(backupPath: string): Promise<boolean> {
  try {
    // Check file exists
    await fs.access(backupPath)

    // Read first 16 bytes to check database header
    const fd = await fs.open(backupPath, 'r')
    const buffer = Buffer.alloc(16)
    await fd.read(buffer, 0, 16, 0)
    await fd.close()

    // Database files start with "SQLite format 3\0"
    const header = buffer.toString('utf8', 0, 15)
    return header === 'SQLite format 3'
  } catch (error) {
    console.error('Error verifying backup:', error)
    return false
  }
}

/**
 * List all available backups
 */
export async function listBackups(): Promise<BackupInfo[]> {
  try {
    await ensureBackupDir()

    const files = await fs.readdir(BACKUP_DIR)
    const backups: BackupInfo[] = []

    for (const file of files) {
      if (!file.endsWith('.db')) continue

      const filepath = path.join(BACKUP_DIR, file)
      try {
        const stats = await fs.stat(filepath)
        const isValid = await verifyBackup(filepath)

        backups.push({
          filename: file,
          filepath,
          timestamp: stats.mtime,
          sizeBytes: stats.size,
          isValid,
        })
      } catch (error) {
        console.error(`Error reading backup ${file}:`, error)
      }
    }

    // Sort by timestamp descending (newest first)
    backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return backups
  } catch (error) {
    console.error('Error listing backups:', error)
    return []
  }
}

/**
 * Restore a backup (creates safety backup first)
 */
export async function restoreBackup(backupFilename: string): Promise<JobResult> {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename)

    // Verify backup exists and is valid
    const isValid = await verifyBackup(backupPath)
    if (!isValid) {
      return {
        success: false,
        error: 'Backup file is invalid or corrupted',
      }
    }

    // Create safety backup before restore
    console.log('Creating safety backup before restore...')
    const safetyResult = await createBackup('pre-restore-safety')
    if (!safetyResult.success) {
      return {
        success: false,
        error: 'Failed to create safety backup before restore',
      }
    }

    // Restore the backup
    console.log(`Restoring backup: ${backupFilename}`)
    await fs.copyFile(backupPath, DB_PATH)

    // Verify restored database
    const restoredValid = await verifyBackup(DB_PATH)
    if (!restoredValid) {
      // Restore safety backup if verification fails
      console.error('Restored database verification failed, restoring safety backup')
      await fs.copyFile(safetyResult.data.filepath, DB_PATH)
      return {
        success: false,
        error: 'Restored database verification failed, reverted to safety backup',
      }
    }

    console.log(`Successfully restored backup: ${backupFilename}`)

    return {
      success: true,
      data: {
        backupFilename,
        safetyBackup: safetyResult.data.filename,
      },
      message: 'Backup restored successfully',
    }
  } catch (error: any) {
    console.error('Error restoring backup:', error)
    return {
      success: false,
      error: error.message || 'Failed to restore backup',
    }
  }
}

/**
 * Delete a backup file
 */
export async function deleteBackup(backupFilename: string): Promise<JobResult> {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename)

    // Check file exists
    try {
      await fs.access(backupPath)
    } catch (error) {
      return {
        success: false,
        error: 'Backup file not found',
      }
    }

    // Delete the file
    await fs.unlink(backupPath)

    console.log(`Deleted backup: ${backupFilename}`)

    return {
      success: true,
      message: 'Backup deleted successfully',
    }
  } catch (error: any) {
    console.error('Error deleting backup:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete backup',
    }
  }
}

/**
 * Clean up old backups (keep last N days)
 */
export async function cleanupOldBackups(): Promise<JobResult> {
  try {
    const backups = await listBackups()
    const now = Date.now()
    const maxAge = RETENTION_DAYS * 24 * 60 * 60 * 1000
    let deletedCount = 0
    let errors = 0

    for (const backup of backups) {
      const age = now - backup.timestamp.getTime()
      if (age > maxAge) {
        const result = await deleteBackup(backup.filename)
        if (result.success) {
          deletedCount++
        } else {
          errors++
        }
      }
    }

    return {
      success: true,
      data: {
        deletedCount,
        errors,
        retentionDays: RETENTION_DAYS,
      },
      message: `Cleaned up ${deletedCount} old backup(s)`,
    }
  } catch (error: any) {
    console.error('Error cleaning up old backups:', error)
    return {
      success: false,
      error: error.message || 'Failed to cleanup old backups',
    }
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<{
  totalBackups: number
  totalSizeBytes: number
  oldestBackup: Date | null
  newestBackup: Date | null
  validBackups: number
  invalidBackups: number
}> {
  const backups = await listBackups()

  if (backups.length === 0) {
    return {
      totalBackups: 0,
      totalSizeBytes: 0,
      oldestBackup: null,
      newestBackup: null,
      validBackups: 0,
      invalidBackups: 0,
    }
  }

  const totalSizeBytes = backups.reduce((sum, b) => sum + b.sizeBytes, 0)
  const validBackups = backups.filter((b) => b.isValid).length
  const invalidBackups = backups.filter((b) => !b.isValid).length

  return {
    totalBackups: backups.length,
    totalSizeBytes,
    oldestBackup: backups[backups.length - 1].timestamp,
    newestBackup: backups[0].timestamp,
    validBackups,
    invalidBackups,
  }
}
