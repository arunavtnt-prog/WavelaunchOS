import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const STORAGE_PATH = process.env.STORAGE_PATH || './data/applications'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params

    // Read directory to find the file
    const appDir = path.join(STORAGE_PATH, applicationId)
    const files = await fs.readdir(appDir)

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No file found for this application' },
        { status: 404 }
      )
    }

    // Get the first file (assuming only one file per application)
    const filename = files[0]
    const filepath = path.join(appDir, filename)

    // Read file
    const fileBuffer = await fs.readFile(filepath)

    // Get original filename (remove timestamp prefix)
    const originalFilename = filename.split('-').slice(1).join('-')

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${originalFilename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
