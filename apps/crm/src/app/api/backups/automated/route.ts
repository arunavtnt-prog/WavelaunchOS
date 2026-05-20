import { NextRequest, NextResponse } from 'next/server'
import { createBackup, cleanupOldBackups } from '@/lib/backup/backup'

// POST /api/backups/automated - Run automated backup (for cron jobs)
export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (optional: add API key check here)
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.BACKUP_API_KEY

    // If API key is configured, verify it
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Running automated backup...')

    // Create backup with automated label
    const backupResult = await createBackup('automated')

    if (!backupResult.success) {
      console.error('Automated backup failed:', backupResult.error)
      return NextResponse.json(
        { success: false, error: backupResult.error },
        { status: 500 }
      )
    }

    console.log('Automated backup created successfully')

    // Cleanup old backups
    console.log('Cleaning up old backups...')
    const cleanupResult = await cleanupOldBackups()

    if (cleanupResult.success) {
      console.log(`Cleanup complete: ${cleanupResult.data?.deletedCount || 0} old backups removed`)
    } else {
      console.error('Cleanup failed:', cleanupResult.error)
    }

    return NextResponse.json({
      success: true,
      data: {
        backup: backupResult.data,
        cleanup: cleanupResult.data,
      },
      message: 'Automated backup completed successfully',
    })
  } catch (error: any) {
    console.error('Error in automated backup:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Automated backup failed' },
      { status: 500 }
    )
  }
}
