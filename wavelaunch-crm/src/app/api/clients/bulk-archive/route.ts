import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientIds } = body

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client IDs array is required' },
        { status: 400 }
      )
    }

    // Fetch clients to archive
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        deletedAt: null,
      },
    })

    if (clients.length === 0) {
      return NextResponse.json({ success: false, error: 'No clients found' }, { status: 404 })
    }

    // Archive clients (soft delete)
    await prisma.client.updateMany({
      where: {
        id: { in: clientIds },
      },
      data: {
        deletedAt: new Date(),
        status: 'ARCHIVED',
      },
    })

    // Log activity for each client
    for (const client of clients) {
      await prisma.activity.create({
        data: {
          type: 'CLIENT_ARCHIVED',
          description: `Bulk archived client: ${client.fullName}`,
          metadata: JSON.stringify({
            clientId: client.id,
            fullName: client.fullName,
          }),
          clientId: client.id,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        archivedCount: clients.length,
        message: `Successfully archived ${clients.length} client(s)`,
      },
    })
  } catch (error) {
    console.error('Bulk archive error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to archive clients' },
      { status: 500 }
    )
  }
}
