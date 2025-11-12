import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import * as fs from 'fs/promises'
import * as path from 'path'

// GET /api/files/[id]/download - Download a file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch file record
    const file = await db.file.findUnique({
      where: { id: params.id },
    })

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Read file from disk
    const filePath = file.filepath
    const fileBuffer = await fs.readFile(filePath)

    // Return file as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.fileType,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': file.fileSize.toString(),
      },
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
