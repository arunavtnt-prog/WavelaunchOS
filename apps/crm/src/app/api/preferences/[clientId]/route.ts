import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/authorize'
import { prisma } from '@/lib/db'
import { updatePreferencesSchema } from '@/schemas/preferences'
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'
import { logInfo } from '@/lib/logging/logger'

/**
 * GET /api/preferences/[clientId] - Get client's notification preferences (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    await requireAdmin()

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
    })

    if (!client) {
      return notFoundResponse('Client')
    }

    // Get or create preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { clientId: params.clientId },
    })

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreferences.create({
        data: {
          clientId: params.clientId,
        },
      })
    }

    return successResponse(preferences, 'Client preferences retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PUT /api/preferences/[clientId] - Update client's notification preferences (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = updatePreferencesSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid preferences data', validation.error.errors)
    }

    const data = validation.data

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
    })

    if (!client) {
      return notFoundResponse('Client')
    }

    // Update or create preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { clientId: params.clientId },
      update: data,
      create: {
        clientId: params.clientId,
        ...data,
      },
    })

    logInfo('Admin updated client notification preferences', {
      clientId: params.clientId,
      adminId: user.id,
      updatedFields: Object.keys(data),
    })

    return successResponse(preferences, 'Client preferences updated successfully')
  } catch (error) {
    return handleError(error)
  }
}
