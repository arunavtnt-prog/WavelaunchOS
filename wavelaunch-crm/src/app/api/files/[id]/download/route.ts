import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { requireAuth, authorizeResourceOwnership } from '@/lib/auth/authorize'
import { forbiddenResponse, notFoundResponse } from '@/lib/api/responses'
import * as fs from 'fs/promises'
import * as path from 'path'

// GET /api/files/[id]/download - Download a file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth()

    // Fetch file record
    const file = await db.file.findUnique({
      where: { id: params.id },
    })

    if (!file) {
      return notFoundResponse('File')
    }

    // Verify authorization to download this file
    const hasAccess = await authorizeResourceOwnership(user.id, 'file', params.id)
    if (!hasAccess) {
      return forbiddenResponse('You do not have permission to download this file')
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
