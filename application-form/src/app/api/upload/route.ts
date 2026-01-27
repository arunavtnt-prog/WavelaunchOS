import { NextRequest, NextResponse } from 'next/server'
import { saveZipFile } from '@/lib/storage'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: 'File must be a ZIP file' },
        { status: 400 }
      )
    }

    // Validate file size (25MB)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 25 MB' },
        { status: 400 }
      )
    }

    // Generate a unique application ID for this upload
    const applicationId = randomUUID()

    // Save file to storage
    const fileData = await saveZipFile(file, applicationId)

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        filepath: fileData.filepath,
        filename: fileData.filename,
        filesize: fileData.filesize,
      },
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
