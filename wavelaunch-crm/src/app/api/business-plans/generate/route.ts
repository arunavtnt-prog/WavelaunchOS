import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { jobQueue } from '@/lib/jobs/queue'
import { generateBusinessPlanSchema } from '@/schemas/business-plan'
import { handleError } from '@/lib/utils/errors'

// POST /api/business-plans/generate - Queue business plan generation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId } = generateBusinessPlanSchema.parse(body)

    // Enqueue job
    const jobId = await jobQueue.enqueue('GENERATE_BUSINESS_PLAN', {
      clientId,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      data: { jobId },
      message: 'Business plan generation queued',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
