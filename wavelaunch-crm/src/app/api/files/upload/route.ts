import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError, StorageError } from '@/lib/utils/errors'
import { MAX_FILE_SIZE_BYTES, STORAGE_LIMIT_BYTES } from '@/lib/utils/constants'
import * as fs from 'fs/promises'
import * as path from 'path'
import { z } from 'zod'

const uploadSchema = z.object({
  clientId: z.string().cuid(),
  category: z.enum(['BUSINESS_PLAN', 'DELIVERABLE', 'UPLOAD', 'MISC']),
})

// POST /api/files/upload - Upload a file
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const category = formData.get('category') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate inputs
    const { clientId: validatedClientId, category: validatedCategory } = uploadSchema.parse({
      clientId,
      category,
    })

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: validatedClientId, deletedAt: null },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
        },
        { status: 413 }
      )
    }

    // Check total storage
    const totalStorage = await db.file.aggregate({
      _sum: {
        fileSize: true,
      },
    })

    const currentStorage = totalStorage._sum.fileSize || 0
    if (currentStorage + file.size > STORAGE_LIMIT_BYTES) {
      throw new StorageError('Storage limit exceeded', STORAGE_LIMIT_BYTES)
    }

    // Create upload directory
    const uploadDir = path.join(
      process.cwd(),
      'data',
      'clients',
      validatedClientId,
      'files'
    )
    await fs.mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`
    const filepath = path.join(uploadDir, filename)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(filepath, buffer)

    // Create file record
    const fileRecord = await db.file.create({
      data: {
        clientId: validatedClientId,
        filename,
        filepath,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        category: validatedCategory,
        uploadedBy: session.user.id,
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: validatedClientId,
        type: 'FILE_UPLOADED',
        description: `Uploaded file: ${file.name}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: fileRecord,
      message: 'File uploaded successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
