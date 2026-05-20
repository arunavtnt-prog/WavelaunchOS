import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/authorize'
import { prisma } from '@/lib/db'
import { updateHelpArticleSchema } from '@/schemas/help'
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'

/**
 * GET /api/help/articles/[slug] - Get help article by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Public endpoint - no auth required for published articles
    const where: any = { slug: params.slug }

    // Only show published articles to non-admins
    try {
      const user = await requireAdmin()
      // Admin can see unpublished
    } catch {
      // Non-admin or not authenticated - only show published
      where.isPublished = true
    }

    const article = await prisma.helpArticle.findFirst({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!article) {
      return notFoundResponse('Help article')
    }

    // Increment view count
    await prisma.helpArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })

    // Parse tags from JSON
    const articleWithParsedTags = {
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
    }

    return successResponse(articleWithParsedTags, 'Help article retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PATCH /api/help/articles/[slug] - Update help article (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = updateHelpArticleSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid article data', validation.error.errors)
    }

    const data = validation.data

    // Find article by slug
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { slug: params.slug },
    })

    if (!existingArticle) {
      return notFoundResponse('Help article')
    }

    // Build update data
    const updateData: any = {}
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.title !== undefined) updateData.title = data.title
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.content !== undefined) updateData.content = data.content
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)
    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished
      // Set publishedAt when publishing for the first time
      if (data.isPublished && !existingArticle.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured

    // Update article
    const article = await prisma.helpArticle.update({
      where: { slug: params.slug },
      data: updateData,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Parse tags from JSON
    const articleWithParsedTags = {
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
    }

    return successResponse(articleWithParsedTags, 'Help article updated successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/help/articles/[slug] - Delete help article (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin()

    // Find article by slug
    const article = await prisma.helpArticle.findUnique({
      where: { slug: params.slug },
    })

    if (!article) {
      return notFoundResponse('Help article')
    }

    // Delete article
    await prisma.helpArticle.delete({
      where: { slug: params.slug },
    })

    return successResponse({ slug: params.slug }, 'Help article deleted successfully')
  } catch (error) {
    return handleError(error)
  }
}
