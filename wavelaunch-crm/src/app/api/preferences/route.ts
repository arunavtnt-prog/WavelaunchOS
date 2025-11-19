import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { updatePreferencesSchema } from '@/schemas/preferences'
import {
  successResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'
import { logInfo } from '@/lib/logging/logger'

/**
 * GET /api/preferences - Get current user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Get user's client record
    const client = await db.client.findUnique({
      where: { email: user.email },
    })

    if (!client) {
      return successResponse(
        null,
        'No client record found for this user'
      )
    }

    // Get or create preferences
    let preferences = await db.notificationPreferences.findUnique({
      where: { clientId: client.id },
    })

    if (!preferences) {
      // Create default preferences
      preferences = await db.notificationPreferences.create({
        data: {
          clientId: client.id,
        },
      })
      logInfo('Created default notification preferences', {
        clientId: client.id,
        userId: user.id,
      })
    }

    return successResponse(preferences, 'Preferences retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PUT /api/preferences - Update current user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const validation = updatePreferencesSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid preferences data', validation.error.errors)
    }

    const data = validation.data

    // Get user's client record
    const client = await db.client.findUnique({
      where: { email: user.email },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'No client record found for this user' },
        { status: 404 }
      )
    }

    // Update or create preferences
    const preferences = await db.notificationPreferences.upsert({
      where: { clientId: client.id },
      update: data,
      create: {
        clientId: client.id,
        ...data,
      },
    })

    logInfo('Updated notification preferences', {
      clientId: client.id,
      userId: user.id,
      updatedFields: Object.keys(data),
    })

    return successResponse(preferences, 'Preferences updated successfully')
  } catch (error) {
    return handleError(error)
  }
}
