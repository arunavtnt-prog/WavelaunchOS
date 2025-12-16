import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const listNotesSchema = z.object({
  clientId: z.string().cuid().optional(),
  tag: z.string().optional(),
  important: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
})

const createNoteSchema = z.object({
  clientId: z.string().cuid(),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  isImportant: z.boolean().default(false),
})

// GET /api/notes - List notes with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || undefined
    const tag = searchParams.get('tag') || undefined
    const important = searchParams.get('important') || undefined
    const search = searchParams.get('search') || undefined

    const { clientId: validatedClientId, tag: validatedTag, important: validatedImportant, search: validatedSearch } =
      listNotesSchema.parse({ clientId, tag, important, search })

    // Build query
    const where: any = {}
    if (validatedClientId) where.clientId = validatedClientId
    if (validatedImportant === 'true') where.isImportant = true
    if (validatedImportant === 'false') where.isImportant = false

    // Tag filter
    if (validatedTag) {
      where.tags = {
        has: validatedTag,
      }
    }

    // Search filter
    if (validatedSearch) {
      where.OR = [
        { title: { contains: validatedSearch, mode: 'insensitive' } },
        { content: { contains: validatedSearch, mode: 'insensitive' } },
      ]
    }

    // Get notes
    const notes = await db.note.findMany({
      where,
      orderBy: [
        { isImportant: 'desc' },
        { updatedAt: 'desc' },
      ],
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: notes,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, content, tags, isImportant } = createNoteSchema.parse(body)

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId, deletedAt: null },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Create note
    const note = await db.note.create({
      data: {
        clientId,
        content,
        tags: JSON.stringify(tags),
        isImportant,
        authorId: session.user?.id || '',
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId,
        type: 'NOTE_CREATED',
        description: `Created new note`,
        userId: session.user?.id || '',
      },
    })

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Note created successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
