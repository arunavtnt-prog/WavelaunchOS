import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { successResponse, notFoundResponse, validationErrorResponse, handleError } from '@/lib/api/responses'
import { z } from 'zod'

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/webhooks/[id] - Get webhook by ID (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const webhooks = await db.$queryRaw<any[]>`
      SELECT * FROM webhooks WHERE id = ${params.id}
    `

    if (webhooks.length === 0) {
      return notFoundResponse('Webhook')
    }

    const webhook = webhooks[0]
    const formatted = {
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: JSON.parse(webhook.events),
      isActive: webhook.is_active,
      createdAt: webhook.created_at,
      updatedAt: webhook.updated_at,
      lastTriggeredAt: webhook.last_triggered_at,
    }

    return successResponse(formatted, 'Webhook retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PUT /api/webhooks/[id] - Update webhook (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()

    const validation = updateWebhookSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid webhook data', validation.error.errors)
    }

    const updates: string[] = []
    const values: any[] = []

    if (validation.data.name !== undefined) {
      updates.push('name = $' + (values.length + 1))
      values.push(validation.data.name)
    }
    if (validation.data.url !== undefined) {
      updates.push('url = $' + (values.length + 1))
      values.push(validation.data.url)
    }
    if (validation.data.secret !== undefined) {
      updates.push('secret = $' + (values.length + 1))
      values.push(validation.data.secret)
    }
    if (validation.data.events !== undefined) {
      updates.push('events = $' + (values.length + 1))
      values.push(JSON.stringify(validation.data.events))
    }
    if (validation.data.isActive !== undefined) {
      updates.push('is_active = $' + (values.length + 1))
      values.push(validation.data.isActive)
    }

    if (updates.length === 0) {
      return validationErrorResponse('No fields to update', [])
    }

    updates.push('updated_at = NOW()')

    await db.$executeRawUnsafe(`
      UPDATE webhooks SET ${updates.join(', ')}
      WHERE id = $${values.length + 1}
    `, ...values, params.id)

    return successResponse(null, 'Webhook updated successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/webhooks/[id] - Delete webhook (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    await db.$executeRaw`
      DELETE FROM webhooks WHERE id = ${params.id}
    `

    return successResponse(null, 'Webhook deleted successfully')
  } catch (error) {
    return handleError(error)
  }
}
