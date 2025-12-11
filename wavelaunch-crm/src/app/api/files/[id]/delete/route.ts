import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import * as fs from 'fs/promises'

// DELETE /api/files/[id]/delete - Delete a file
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

    // Get file record
    const file = await db.file.findUnique({
      where: { id: params.id },
    })

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete file from disk
    try {
      await fs.unlink(file.filepath)
    } catch (error) {
      console.error('Error deleting file from disk:', error)
      // Continue even if file doesn't exist on disk
    }

    // Delete file record from database
    await db.file.delete({
      where: { id: params.id },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: file.clientId,
        type: 'FILE_DELETED',
        description: `Deleted file: ${file.filename}`,
        userId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
