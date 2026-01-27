import { NextRequest, NextResponse } from 'next/server'
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
    
    // For testing - just return metadata without saving file
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = `data/applications/${applicationId}/${filename}`

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        filepath,
        filename: file.name,
        filesize: file.size,
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
