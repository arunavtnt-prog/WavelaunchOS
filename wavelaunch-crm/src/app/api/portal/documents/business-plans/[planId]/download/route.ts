import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'

// Download business plan PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    // Check authentication and verify session
    const auth = await getVerifiedPortalSession()

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Get business plan
    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id: params.planId },
      include: {
        client: true,
      },
    })

    if (!businessPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business plan not found',
        },
        { status: 404 }
      )
    }

    // Verify client owns this business plan
    if (businessPlan.clientId !== auth.portalUser.clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    // Check if PDF exists
    if (!businessPlan.pdfUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'PDF not available for this business plan',
        },
        { status: 404 }
      )
    }

    // Log download activity
    await prisma.activity.create({
      data: {
        clientId: businessPlan.clientId,
        type: 'DOCUMENT_DOWNLOAD',
        description: `Downloaded business plan v${businessPlan.version}`,
      },
    })

    // Return download URL (in production, this would generate a signed URL)
    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: businessPlan.pdfUrl,
        filename: `business-plan-v${businessPlan.version}.pdf`,
        version: businessPlan.version,
      },
    })
  } catch (error) {
    console.error('Business plan download error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while preparing the download',
      },
      { status: 500 }
    )
  }
}
