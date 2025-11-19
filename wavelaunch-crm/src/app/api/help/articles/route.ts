import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth/authorize'
import { db } from '@/lib/db'
import { createHelpArticleSchema, searchHelpArticlesSchema } from '@/schemas/help'
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  handleError,
} from '@/lib/api/responses'

/**
 * POST /api/help/articles - Create help article (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = createHelpArticleSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse('Invalid article data', validation.error.errors)
    }

    const data = validation.data

    // Create article
    const article = await db.helpArticle.create({
      data: {
        categoryId: data.categoryId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        authorId: user.id,
        publishedAt: data.isPublished ? new Date() : null,
      },
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

    return createdResponse(article, 'Help article created successfully')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/help/articles - Search and list help articles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate search params
    const filters = searchHelpArticlesSchema.parse({
      query: searchParams.get('query') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      tags: searchParams.get('tags') || undefined,
      isPublished: searchParams.get('isPublished') !== null ? searchParams.get('isPublished') : 'true',
      isFeatured: searchParams.get('isFeatured') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    // Build where clause
    const where: any = {}

    // Only show published articles to non-admins
    if (filters.isPublished !== undefined) {
      try {
        await requireAuth()
        const user = await requireAuth()
        if (user.role !== 'ADMIN') {
          where.isPublished = true
        } else {
          where.isPublished = filters.isPublished
        }
      } catch {
        where.isPublished = true // Not authenticated, only show published
      }
    }

    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured

    // Search functionality
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { content: { contains: filters.query, mode: 'insensitive' } },
        { excerpt: { contains: filters.query, mode: 'insensitive' } },
      ]
    }

    // Tag filtering
    if (filters.tags) {
      const tagArray = filters.tags.split(',').map((t) => t.trim())
      // This is a simplified tag search - in production, you might want full-text search
      where.tags = { contains: tagArray[0] }
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit
    const take = filters.limit

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      db.helpArticle.findMany({
        where,
        skip,
        take,
        orderBy: {
          [filters.sortBy]: filters.sortOrder,
        },
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
      }),
      db.helpArticle.count({ where }),
    ])

    // Parse tags from JSON
    const articlesWithParsedTags = articles.map((article) => ({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
    }))

    return successResponse(
      {
        articles: articlesWithParsedTags,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
      },
      'Help articles retrieved successfully'
    )
  } catch (error) {
    return handleError(error)
  }
}
