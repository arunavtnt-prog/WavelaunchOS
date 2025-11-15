import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { readFile } from 'fs/promises'

// GET /api/applications/[id]/download - Download application ZIP file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    if (!application.zipFilePath || !application.zipFileName) {
      return NextResponse.json({ success: false, error: 'No file attached' }, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(application.zipFilePath)

    // Return as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${application.zipFileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Download application file error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
