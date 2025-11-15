import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { promises as fs } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fileIds } = body

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File IDs array is required' },
        { status: 400 }
      )
    }

    // Fetch files to delete
    const files = await prisma.file.findMany({
      where: {
        id: { in: fileIds },
        deletedAt: null,
      },
    })

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files found' }, { status: 404 })
    }

    // Soft delete files
    await prisma.file.updateMany({
      where: {
        id: { in: fileIds },
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log activity for each file
    for (const file of files) {
      await prisma.activity.create({
        data: {
          type: 'FILE_DELETED',
          description: `Bulk deleted file: ${file.filename}`,
          metadata: JSON.stringify({
            fileId: file.id,
            filename: file.filename,
            category: file.category,
          }),
          clientId: file.clientId,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: files.length,
        message: `Successfully deleted ${files.length} file(s)`,
      },
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete files' },
      { status: 500 }
    )
  }
}
