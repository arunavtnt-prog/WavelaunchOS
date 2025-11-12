import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/utils/errors'
import { restoreBackup } from '@/lib/backup/backup'

// POST /api/backups/[filename]/restore - Restore a backup
export async function POST(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Restore requested by ${session.user.email} for backup: ${params.filename}`)

    const result = await restoreBackup(params.filename)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
