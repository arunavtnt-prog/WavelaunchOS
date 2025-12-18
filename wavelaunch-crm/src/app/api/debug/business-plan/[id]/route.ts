import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id
    
    // Get client with portal user info
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        portalUser: true,
        businessPlans: true,
      },
    })

    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.fullName,
        email: client.email,
        status: client.status,
        hasPortalUser: !!client.portalUser,
        portalUser: client.portalUser ? {
          id: client.portalUser.id,
          email: client.portalUser.email,
          isActive: client.portalUser.isActive,
          completedOnboarding: client.portalUser.completedOnboarding,
        } : null,
        businessPlanCount: client.businessPlans.length,
        businessPlans: client.businessPlans.map(bp => ({
          id: bp.id,
          version: bp.version,
          status: bp.status,
          generatedAt: bp.generatedAt,
        }))
      }
    })

  } catch (error) {
    console.error('Business plan status debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
