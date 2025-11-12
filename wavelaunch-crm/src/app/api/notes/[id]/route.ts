import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isImportant: z.boolean().optional(),
})

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const note = await db.note.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            creatorName: true,
            brandName: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: note,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// PATCH /api/notes/[id] - Update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check note exists
    const existingNote = await db.note.findUnique({
      where: { id: params.id },
    })

    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updates = updateNoteSchema.parse(body)

    // Update note
    const note = await db.note.update({
      where: { id: params.id },
      data: updates,
    })

    // Log activity if title or important status changed
    if (updates.title || updates.isImportant !== undefined) {
      await db.activity.create({
        data: {
          clientId: note.clientId,
          type: 'NOTE_UPDATED',
          description: `Updated note: ${note.title}`,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Note updated successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check note exists
    const existingNote = await db.note.findUnique({
      where: { id: params.id },
    })

    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    // Delete note
    await db.note.delete({
      where: { id: params.id },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: existingNote.clientId,
        type: 'NOTE_DELETED',
        description: `Deleted note: ${existingNote.title}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
