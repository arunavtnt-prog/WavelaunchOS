import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerifiedPortalSession } from '@/lib/auth/portal-auth'
import { z } from 'zod'

// Update notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getVerifiedPortalSession()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const preferencesSchema = z.object({
      notifyNewDeliverable: z.boolean().optional(),
      notifyNewMessage: z.boolean().optional(),
      notifyMilestoneReminder: z.boolean().optional(),
      notifyWeeklySummary: z.boolean().optional(),
    })

    const validation = preferencesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const preferences = validation.data

    // Update preferences
    await prisma.clientPortalUser.update({
      where: { id: auth.session.userId },
      data: preferences,
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
