import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { z } from 'zod'

const listFilesSchema = z.object({
  clientId: z.string().cuid().optional(),
  category: z.enum(['BUSINESS_PLAN', 'DELIVERABLE', 'UPLOAD', 'MISC']).optional(),
})

// GET /api/files - List files with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || undefined
    const category = searchParams.get('category') || undefined

    const { clientId: validatedClientId, category: validatedCategory } =
      listFilesSchema.parse({ clientId, category })

    // Build query
    const where: any = {}
    if (validatedClientId) where.clientId = validatedClientId
    if (validatedCategory) where.category = validatedCategory

    // Get files
    const files = await prisma.file.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Calculate total storage used
    const totalStorage = await prisma.file.aggregate({
      _sum: {
        filesize: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: files,
      metadata: {
        totalFiles: files.length,
        totalStorageBytes: totalStorage._sum.filesize || 0,
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
