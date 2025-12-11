import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { randomBytes, createHash } from 'crypto'
import { checkRateLimit } from '@/lib/rate-limiter'

/**
 * Hash a token for secure storage
 * Uses SHA-256 to create a one-way hash
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// Generate invite token for portal user
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Rate limiting: 20 invites per hour per admin user
    const rateLimitResult = checkRateLimit({
      identifier: userId,
      endpoint: 'generate-invite',
      maxRequests: 20,
      windowSeconds: 60 * 60, // 1 hour
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many invite requests. Please try again in ${Math.ceil(rateLimitResult.resetIn / 60)} minutes.`,
          resetIn: rateLimitResult.resetIn,
        },
        { status: 429 }
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

    // Generate unique invite token (plain text for URL)
    const inviteToken = randomBytes(32).toString('hex')
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Hash the token before storing (security best practice)
    const inviteTokenHash = hashToken(inviteToken)

    // Update portal user with hashed invite token
    await prisma.clientPortalUser.update({
      where: { id: portalUserId },
      data: {
        inviteToken: inviteTokenHash,
        inviteTokenExpiry,
        invitedBy: userId,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: portalUser.clientId,
        userId,
        type: 'CLIENT_UPDATED',
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
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const patchUserId = session.user.id

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

    // Generate new invite token (plain text for URL)
    const inviteToken = randomBytes(32).toString('hex')
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Hash the token before storing (security best practice)
    const inviteTokenHash = hashToken(inviteToken)

    // Update portal user with hashed invite token
    await prisma.clientPortalUser.update({
      where: { id: portalUserId },
      data: {
        inviteToken: inviteTokenHash,
        inviteTokenExpiry,
        invitedBy: patchUserId,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: portalUser.clientId,
        userId: patchUserId,
        type: 'CLIENT_UPDATED',
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
