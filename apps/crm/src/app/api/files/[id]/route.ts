import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    const applicationId = params.id

    // Read directory to find the file
    const appDir = path.join(STORAGE_PATH, applicationId)
    const files = await fs.readdir(appDir)

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No file found for this application' },
        { status: 404, headers: corsHeaders }
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
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500, headers: corsHeaders }
    )
  }
}
