import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_CORS_ORIGINS
  ? process.env.ALLOWED_CORS_ORIGINS.split(',').map(s => s.trim())
  : [
    'https://apply.wavelaunch.org',
    'https://login.wavelaunch.org',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3009',
  ]

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

const STORAGE_PATH = process.env.STORAGE_PATH || './data/applications'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: 'File must be a ZIP file' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate file size (25MB)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 25 MB' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Generate a unique application ID for this upload
    const applicationId = randomUUID()

    // Create application directory
    await fs.mkdir(path.join(STORAGE_PATH, applicationId), { recursive: true })

    // Save file
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = path.join(STORAGE_PATH, applicationId, filename)

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save file
    await fs.writeFile(filepath, buffer)

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        filepath,
        filename: file.name,
        filesize: file.size,
      },
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500, headers: corsHeaders }
    )
  }
}
