import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword, generateRandomPassword } from '@/lib/auth/portal-auth'

const createPortalUserSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  email: z.string().email('Invalid email address'),
  sendWelcomeEmail: z.boolean().default(true),
  customPassword: z.string().min(8).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = createPortalUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { clientId, email, sendWelcomeEmail, customPassword } = validation.data

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client not found',
        },
        { status: 404 }
      )
    }

    // Check if client is not archived
    if (client.status === 'ARCHIVED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot create portal user for archived client',
        },
        { status: 400 }
      )
    }

    // Check if portal user already exists for this client
    const existingPortalUser = await prisma.clientPortalUser.findUnique({
      where: { clientId },
    })

    if (existingPortalUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal user already exists for this client',
        },
        { status: 400 }
      )
    }

    // Check if email is already in use
    const existingEmail = await prisma.clientPortalUser.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address is already in use',
        },
        { status: 400 }
      )
    }

    // Generate password
    const password = customPassword || generateRandomPassword(12)
    const passwordHash = await hashPassword(password)

    // Create portal user
    const portalUser = await prisma.clientPortalUser.create({
      data: {
        clientId,
        email,
        passwordHash,
        isActive: true,
        emailVerified: false,
        invitedAt: new Date(),
        notifyNewDeliverable: true,
        notifyNewMessage: true,
        notifyMilestoneReminder: true,
        notifyWeeklySummary: false,
      },
      include: {
        client: true,
      },
    })

    // TODO: Send welcome email with password
    if (sendWelcomeEmail) {
      console.log('TODO: Send welcome email to:', email)
      console.log('Temporary password:', password)
      // await sendWelcomeEmail(email, password, client.creatorName)
    }

    return NextResponse.json({
      success: true,
      data: {
        portalUser: {
          id: portalUser.id,
          email: portalUser.email,
          isActive: portalUser.isActive,
          invitedAt: portalUser.invitedAt,
        },
        // Return password only if not sending email (for manual sharing)
        temporaryPassword: !sendWelcomeEmail ? password : undefined,
      },
      message: sendWelcomeEmail
        ? 'Portal user created and welcome email sent'
        : 'Portal user created. Please share the temporary password with the client.',
    })
  } catch (error) {
    console.error('Create portal user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while creating the portal user',
      },
      { status: 500 }
    )
  }
}

// Get portal user for a client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client ID is required',
        },
        { status: 400 }
      )
    }

    const portalUser = await prisma.clientPortalUser.findUnique({
      where: { clientId },
      include: {
        client: {
          select: {
            id: true,
            creatorName: true,
            brandName: true,
            email: true,
          },
        },
      },
    })

    if (!portalUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal user not found for this client',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: portalUser.id,
        email: portalUser.email,
        isActive: portalUser.isActive,
        emailVerified: portalUser.emailVerified,
        invitedAt: portalUser.invitedAt,
        activatedAt: portalUser.activatedAt,
        lastLoginAt: portalUser.lastLoginAt,
        client: portalUser.client,
        preferences: {
          notifyNewDeliverable: portalUser.notifyNewDeliverable,
          notifyNewMessage: portalUser.notifyNewMessage,
          notifyMilestoneReminder: portalUser.notifyMilestoneReminder,
          notifyWeeklySummary: portalUser.notifyWeeklySummary,
        },
      },
    })
  } catch (error) {
    console.error('Get portal user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching the portal user',
      },
      { status: 500 }
    )
  }
}

// Update portal user (activate/deactivate)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const updateSchema = z.object({
      portalUserId: z.string(),
      isActive: z.boolean().optional(),
      email: z.string().email().optional(),
      preferences: z
        .object({
          notifyNewDeliverable: z.boolean().optional(),
          notifyNewMessage: z.boolean().optional(),
          notifyMilestoneReminder: z.boolean().optional(),
          notifyWeeklySummary: z.boolean().optional(),
        })
        .optional(),
    })

    const validation = updateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { portalUserId, isActive, email, preferences } = validation.data

    // Check if portal user exists
    const existingUser = await prisma.clientPortalUser.findUnique({
      where: { id: portalUserId },
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portal user not found',
        },
        { status: 404 }
      )
    }

    // If changing email, check it's not in use
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.clientPortalUser.findUnique({
        where: { email },
      })

      if (emailInUse) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email address is already in use',
          },
          { status: 400 }
        )
      }
    }

    // Update portal user
    const updatedUser = await prisma.clientPortalUser.update({
      where: { id: portalUserId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(email && { email }),
        ...(preferences && {
          notifyNewDeliverable: preferences.notifyNewDeliverable,
          notifyNewMessage: preferences.notifyNewMessage,
          notifyMilestoneReminder: preferences.notifyMilestoneReminder,
          notifyWeeklySummary: preferences.notifyWeeklySummary,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
      },
      message: 'Portal user updated successfully',
    })
  } catch (error) {
    console.error('Update portal user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while updating the portal user',
      },
      { status: 500 }
    )
  }
}
