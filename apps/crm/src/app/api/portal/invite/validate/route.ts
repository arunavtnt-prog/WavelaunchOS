import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createHash } from 'crypto'

/**
 * Hash a token for secure storage
 * Uses SHA-256 to create a one-way hash
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// Validate invite token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invite token is required' },
        { status: 400 }
      )
    }

    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token)

    // Find portal user by hashed invite token
    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { inviteToken: tokenHash },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    })

    if (!portalUser) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Invalid invite link',
      })
    }

    // Check if already activated
    if (portalUser.isActive && portalUser.activatedAt) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'This account has already been activated',
      })
    }

    // Check if token is expired
    if (portalUser.inviteTokenExpiry && new Date() > portalUser.inviteTokenExpiry) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'This invite link has expired. Please request a new one.',
      })
    }

    // Token is valid
    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        email: portalUser.email,
        clientName: portalUser.client.fullName,
        expiresAt: portalUser.inviteTokenExpiry,
      },
    })
  } catch (error) {
    console.error('Validate invite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate invite' },
      { status: 500 }
    )
  }
}
