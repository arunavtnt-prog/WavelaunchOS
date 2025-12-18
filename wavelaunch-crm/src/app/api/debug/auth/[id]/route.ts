import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/authorize'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user',
        user: null
      })
    }
    
    // Check user details
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })
    
    // Test authorization logic directly
    const hasAccess = userWithRole?.role === 'ADMIN' ? true : false
    
    // Check if there are any portal users for this client
    const portalUsers = await prisma.clientPortalUser.findMany({
      where: { clientId },
      select: {
        id: true,
        email: true,
        isActive: true,
      }
    })
    
    return NextResponse.json({
      success: true,
      clientId,
      currentUser: userWithRole,
      hasAccess,
      portalUsers,
      debug: {
        userRole: userWithRole?.role,
        isAdmin: userWithRole?.role === 'ADMIN',
        portalUserCount: portalUsers.length
      }
    })

  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
