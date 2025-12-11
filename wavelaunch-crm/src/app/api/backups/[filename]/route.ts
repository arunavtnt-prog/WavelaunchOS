import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/utils/errors'
import { deleteBackup } from '@/lib/backup/backup'
import * as fs from 'fs/promises'
import * as path from 'path'

// DELETE /api/backups/[filename] - Delete a backup
export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await deleteBackup(params.filename)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// GET /api/backups/[filename] - Download a backup file
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backupPath = path.join(
      process.cwd(),
      'data',
      'backups',
      params.filename
    )

    // Check file exists
    try {
      await fs.access(backupPath)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await fs.readFile(backupPath)

    // Return as downloadable file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/x-sqlite3',
        'Content-Disposition': `attachment; filename="${params.filename}"`,
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
