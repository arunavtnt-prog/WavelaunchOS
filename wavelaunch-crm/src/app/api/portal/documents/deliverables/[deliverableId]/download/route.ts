import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'

// Download deliverable PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { deliverableId: string } }
) {
  try {
    // Check authentication and verify session
    const auth = await getVerifiedPortalSession()

    if (!auth?.portalUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Get deliverable
    const deliverable = await prisma.deliverable.findUnique({
      where: { id: params.deliverableId },
      include: {
        client: true,
      },
    })

    if (!deliverable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deliverable not found',
        },
        { status: 404 }
      )
    }

    // Verify client owns this deliverable
    if (deliverable.clientId !== auth.portalUser.clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    // Check if PDF exists
    if (!deliverable.pdfPath) {
      return NextResponse.json(
        {
          success: false,
          error: 'PDF not available for this deliverable',
        },
        { status: 404 }
      )
    }

    // Log download activity
    await prisma.activity.create({
      data: {
        clientId: deliverable.clientId,
        type: 'DELIVERABLE_DELIVERED',
        description: `Downloaded ${deliverable.month} deliverable: ${deliverable.title}`,
      },
    })

    // Return download URL
    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: deliverable.pdfPath,
        filename: `${deliverable.month}-${deliverable.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        month: deliverable.month,
        title: deliverable.title,
      },
    })
  } catch (error) {
    console.error('Deliverable download error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while preparing the download',
      },
      { status: 500 }
    )
  }
}
