import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { promises as fs } from 'fs'
import { createReadStream } from 'fs'
import archiver from 'archiver'
import { Readable } from 'stream'

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

    // Fetch files
    const files = await prisma.file.findMany({
      where: {
        id: { in: fileIds },
        deletedAt: null,
      },
    })

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files found' }, { status: 404 })
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    })

    // Convert archive to ReadableStream for Response
    const stream = Readable.toWeb(archive) as ReadableStream

    // Add files to archive
    for (const file of files) {
      try {
        // Check if file exists
        await fs.access(file.filepath)

        // Add file to archive
        archive.file(file.filepath, { name: file.filename })
      } catch (err) {
        console.warn(`File not found: ${file.filepath}`)
        // Continue with other files
      }
    }

    // Finalize the archive
    archive.finalize()

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'FILE_UPLOADED',
        description: `Bulk downloaded ${files.length} file(s)`,
        metadata: JSON.stringify({
          fileCount: files.length,
          fileIds,
        }),
        userId: session.user?.id || '',
      },
    })

    // Return ZIP file as response
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="wavelaunch-files-${Date.now()}.zip"`,
      },
    })
  } catch (error) {
    console.error('Bulk download error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download files' },
      { status: 500 }
    )
  }
}
