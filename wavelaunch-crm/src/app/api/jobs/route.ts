import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'

// GET /api/jobs - List all jobs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null
    const type = searchParams.get('type') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    // Get jobs
    const jobs = await db.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: jobs,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
