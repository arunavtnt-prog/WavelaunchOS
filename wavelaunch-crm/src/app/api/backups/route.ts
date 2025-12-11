import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/utils/errors'
import { listBackups, createBackup, getBackupStats } from '@/lib/backup/backup'
import { z } from 'zod'

const createBackupSchema = z.object({
  label: z.string().optional(),
})

// GET /api/backups - List all backups with stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backups = await listBackups()
    const stats = await getBackupStats()

    return NextResponse.json({
      success: true,
      data: {
        backups,
        stats,
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

// POST /api/backups - Create a new backup
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { label } = createBackupSchema.parse(body)

    const result = await createBackup(label)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Backup created successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
