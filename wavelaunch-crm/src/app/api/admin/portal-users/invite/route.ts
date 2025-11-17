import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

// Generate invite token for portal user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { portalUserId } = body

    if (!portalUserId) {
      return NextResponse.json(
        { success: false, error: 'Portal user ID is required' },
        { status: 400 }
      )
    }

    // Check if portal user exists
    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { id: portalUserId },
      include: { client: true },
    })

    if (!portalUser) {
      return NextResponse.json(
        { success: false, error: 'Portal user not found' },
        { status: 404 }
      )
    }

    // Check if already activated
    if (portalUser.isActive && portalUser.activatedAt) {
      return NextResponse.json(
        { success: false, error: 'This user has already activated their account' },
        { status: 400 }
      )
    }

    // Generate unique invite token
    const inviteToken = randomBytes(32).toString('hex')
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Update portal user with invite token
    await prisma.clientPortalUser.update({
      where: { id: portalUserId },
      data: {
        inviteToken,
        inviteTokenExpiry,
        invitedBy: session.user.id,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: portalUser.clientId,
        userId: session.user.id,
        description: `Generated portal invite for ${portalUser.email}`,
      },
    })

    // Construct invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/portal/invite/${inviteToken}`

    return NextResponse.json({
      success: true,
      data: {
        inviteUrl,
        inviteToken,
        expiresAt: inviteTokenExpiry,
        expiresIn: '7 days',
      },
      message: 'Invite link generated successfully',
    })
  } catch (error) {
    console.error('Generate invite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate invite' },
      { status: 500 }
    )
  }
}

// Regenerate invite token (if expired or resend needed)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { portalUserId } = body

    if (!portalUserId) {
      return NextResponse.json(
        { success: false, error: 'Portal user ID is required' },
        { status: 400 }
      )
    }

    // Check if portal user exists
    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { id: portalUserId },
      include: { client: true },
    })

    if (!portalUser) {
      return NextResponse.json(
        { success: false, error: 'Portal user not found' },
        { status: 404 }
      )
    }

    // Generate new invite token
    const inviteToken = randomBytes(32).toString('hex')
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Update portal user with new invite token
    await prisma.clientPortalUser.update({
      where: { id: portalUserId },
      data: {
        inviteToken,
        inviteTokenExpiry,
        invitedBy: session.user.id,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: portalUser.clientId,
        userId: session.user.id,
        description: `Regenerated portal invite for ${portalUser.email}`,
      },
    })

    // Construct invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/portal/invite/${inviteToken}`

    return NextResponse.json({
      success: true,
      data: {
        inviteUrl,
        inviteToken,
        expiresAt: inviteTokenExpiry,
        expiresIn: '7 days',
      },
      message: 'Invite link regenerated successfully',
    })
  } catch (error) {
    console.error('Regenerate invite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate invite' },
      { status: 500 }
    )
  }
}
