import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleError, StorageError } from '@/lib/utils/errors'
import { STORAGE_LIMIT_BYTES } from '@/lib/utils/constants'
import { requireAuth, authorizeClientAccess } from '@/lib/auth/authorize'
import { forbiddenResponse, badRequestResponse, validationErrorResponse } from '@/lib/api/responses'
import { validateUploadedFile, sanitizeFilename, generateSafeUploadPath } from '@/lib/files/validation'
import * as fs from 'fs/promises'
import * as path from 'path'
import { z } from 'zod'
import os from 'os'

const uploadSchema = z.object({
  clientId: z.string().cuid(),
  category: z.enum(['BUSINESS_PLAN', 'DELIVERABLE', 'UPLOAD', 'MISC']),
})

// POST /api/files/upload - Upload a file
export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null

  try {
    // Verify authentication
    const user = await requireAuth()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const category = formData.get('category') as string

    if (!file) {
      return badRequestResponse('No file provided')
    }

    // Validate inputs
    const { clientId: validatedClientId, category: validatedCategory } = uploadSchema.parse({
      clientId,
      category,
    })

    // Verify authorization to upload to this client
    const hasAccess = await authorizeClientAccess(user.id, validatedClientId)
    if (!hasAccess) {
      return forbiddenResponse('You do not have permission to upload files for this client')
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: validatedClientId, deletedAt: null },
    })

    if (!client) {
      return badRequestResponse('Client not found')
    }

    // Check total storage before processing file
    const totalStorage = await prisma.file.aggregate({
      _sum: {
        filesize: true,
      },
    })

    const currentStorage = totalStorage._sum.filesize || 0
    if (currentStorage + file.size > STORAGE_LIMIT_BYTES) {
      throw new StorageError('Storage limit exceeded')
    }

    // Write file to temporary location for validation
    const tempDir = os.tmpdir()
    const tempFileName = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`
    tempFilePath = path.join(tempDir, tempFileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(tempFilePath, buffer)

    // Validate uploaded file (content, size, type, etc.)
    const validation = await validateUploadedFile({
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      path: tempFilePath,
    })

    if (!validation.valid) {
      // Clean up temp file
      await fs.unlink(tempFilePath)
      tempFilePath = null

      return validationErrorResponse(
        'File validation failed',
        { errors: validation.errors, warnings: validation.warnings }
      )
    }

    // Generate safe upload path
    const uploadDir = path.join(process.cwd(), 'data', 'clients', validatedClientId, 'files')
    await fs.mkdir(uploadDir, { recursive: true })

    const finalPath = generateSafeUploadPath(
      path.join(process.cwd(), 'data', 'clients'),
      validatedClientId,
      validation.sanitizedFilename
    )

    // Ensure final directory exists
    await fs.mkdir(path.dirname(finalPath), { recursive: true })

    // Move file from temp to final location
    await fs.rename(tempFilePath, finalPath)
    tempFilePath = null // Moved successfully

    // Create file record
    const fileRecord = await prisma.file.create({
      data: {
        clientId: validatedClientId,
        filename: validation.sanitizedFilename,
        filepath: finalPath,
        mimetype: file.type || 'application/octet-stream',
        filesize: file.size,
        category: validatedCategory,
        uploadedBy: user.id,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId: validatedClientId,
        type: 'FILE_UPLOADED',
        description: `Uploaded file: ${validation.sanitizedFilename}`,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: fileRecord,
      message: 'File uploaded successfully',
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
    })
  } catch (error) {
    // Clean up temporary file if it still exists
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
      } catch (unlinkError) {
        console.error('Failed to clean up temp file:', unlinkError)
      }
    }

    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
