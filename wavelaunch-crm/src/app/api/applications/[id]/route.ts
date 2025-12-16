import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/applications/[id] - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, reviewNotes } = await request.json()

    if (!status || !['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'CONVERTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const application = await db.application.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        reviewedAt: status !== 'PENDING' ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('Failed to update application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
