import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/authorize'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      })
    }

    // Check if user is admin
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    // Check portal user access for the specific client
    const portalUser = await prisma.clientPortalUser.findFirst({
      where: {
        clientId: 'cmjbea5gf0001la042weqruly',
        isActive: true,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      currentUser: userWithRole,
      portalUserForClient: portalUser,
      hasAdminAccess: userWithRole?.role === 'ADMIN',
      hasPortalAccess: !!portalUser,
    })

  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
