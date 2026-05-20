import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/utils/errors'
import { getResumableCheckpoints, deleteCheckpoint } from '@/lib/ai/checkpoints'

// GET /api/checkpoints - Get all resumable checkpoints
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || undefined

    const checkpoints = await getResumableCheckpoints(clientId)

    return NextResponse.json({
      success: true,
      data: checkpoints,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// DELETE /api/checkpoints?jobId=xxx - Delete a checkpoint
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    await deleteCheckpoint(jobId)

    return NextResponse.json({
      success: true,
      message: 'Checkpoint deleted successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
