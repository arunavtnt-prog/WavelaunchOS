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
    if (!session?.user?.id) {
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
        author: {
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

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

    // Prepare data with tags as JSON string
    const updateData: Record<string, unknown> = { ...updates }
    if (updates.tags) {
      updateData.tags = JSON.stringify(updates.tags)
    }

    // Update note
    const note = await db.note.update({
      where: { id: params.id },
      data: updateData,
    })

    // Log activity if content or important status changed
    if (updates.content || updates.isImportant !== undefined) {
      await db.activity.create({
        data: {
          clientId: note.clientId,
          type: 'NOTE_UPDATED',
          description: `Updated note`,
          userId,
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

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
        description: `Deleted note`,
        userId,
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
