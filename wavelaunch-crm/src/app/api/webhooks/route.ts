import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/authorize'
import { prisma } from '@/lib/db'
import { successResponse, createdResponse, validationErrorResponse, handleError } from '@/lib/api/responses'
import { z } from 'zod'

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1),
})

/**
 * GET /api/webhooks - List all webhooks (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()

    const webhooks = await prisma.$queryRaw<any[]>`
      SELECT * FROM webhooks
      ORDER BY created_at DESC
    `

    const formatted = webhooks.map((w) => ({
      id: w.id,
      name: w.name,
      url: w.url,
      events: JSON.parse(w.events),
      isActive: w.is_active,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
      lastTriggeredAt: w.last_triggered_at,
    }))

    return successResponse(formatted, 'Webhooks retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/webhooks - Create a new webhook (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    const validation = createWebhookSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid webhook data', validation.error.errors)
    }

    const { name, url, secret, events } = validation.data
    const id = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await prisma.$executeRaw`
      INSERT INTO webhooks (id, name, url, secret, events, created_by, created_at, updated_at)
      VALUES (
        ${id},
        ${name},
        ${url},
        ${secret || null},
        ${JSON.stringify(events)},
        ${user.id},
        NOW(),
        NOW()
      )
    `

    const webhook = {
      id,
      name,
      url,
      events,
      isActive: true,
      createdAt: new Date(),
    }

    return createdResponse(webhook, 'Webhook created successfully')
  } catch (error) {
    return handleError(error)
  }
}
