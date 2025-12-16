import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { STORAGE_LIMIT_BYTES, STORAGE_WARNING_THRESHOLD } from '@/lib/utils/constants'

// GET /api/storage/stats - Get storage statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total storage used
    const totalStorage = await db.file.aggregate({
      _sum: {
        filesize: true,
      },
      _count: true,
    })

    const usedBytes = totalStorage._sum.filesize || 0
    const usedPercentage = (usedBytes / STORAGE_LIMIT_BYTES) * 100
    const limitBytes = STORAGE_LIMIT_BYTES
    const warningThresholdBytes = STORAGE_LIMIT_BYTES * STORAGE_WARNING_THRESHOLD

    // Get storage by category
    const storageByCategory = await db.file.groupBy({
      by: ['category'],
      _sum: {
        filesize: true,
      },
      _count: true,
    })

    // Get storage by client (top 10)
    const storageByClient = await db.file.groupBy({
      by: ['clientId'],
      _sum: {
        filesize: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          filesize: 'desc',
        },
      },
      take: 10,
    })

    // Enrich client data
    const clientIds = storageByClient.map((s) => s.clientId).filter((id): id is string => id !== null)
    const clients = await db.client.findMany({
      where: { id: { in: clientIds } },
      select: {
        id: true,
        fullName: true,
      },
    })

    const enrichedStorageByClient = storageByClient.map((storage) => {
      const client = clients.find((c) => c.id === storage.clientId)
      return {
        clientId: storage.clientId,
        clientName: client?.fullName || 'Unknown',
        fileCount: storage._count,
        storageBytes: storage._sum.filesize || 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        usedBytes,
        limitBytes,
        usedPercentage: Math.round(usedPercentage * 100) / 100,
        warningThresholdBytes,
        isWarning: usedBytes >= warningThresholdBytes,
        isOverLimit: usedBytes >= limitBytes,
        totalFiles: totalStorage._count,
        availableBytes: Math.max(0, limitBytes - usedBytes),
        byCategory: storageByCategory.map((cat) => ({
          category: cat.category,
          fileCount: cat._count,
          storageBytes: cat._sum.filesize || 0,
        })),
        byClient: enrichedStorageByClient,
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
