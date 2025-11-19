import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { createHelpCategorySchema } from '@/schemas/help'
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'

/**
 * POST /api/help/categories - Create help category (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = createHelpCategorySchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid category data', validation.error.errors)
    }

    const data = validation.data

    // Create category
    const category = await db.helpCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        order: data.order,
        isPublished: data.isPublished,
      },
    })

    return createdResponse(category, 'Help category created successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/help/categories - List all help categories
 */
export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required for published categories
    const { searchParams } = new URL(request.url)
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    // Only show unpublished to admins
    let where: any = {}
    if (!includeUnpublished) {
      where.isPublished = true
    } else {
      try {
        await requireAdmin()
      } catch {
        where.isPublished = true // Not admin, only show published
      }
    }

    const categories = await db.helpCategory.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: { isPublished: true },
            },
          },
        },
      },
    })

    return successResponse(categories, 'Help categories retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}
