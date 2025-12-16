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
    const { clientIds, status } = body

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client IDs array is required' },
        { status: 400 }
      )
    }

    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required (ACTIVE or INACTIVE)' },
        { status: 400 }
      )
    }

    // Fetch clients to update
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
      },
    })

    if (clients.length === 0) {
      return NextResponse.json({ success: false, error: 'No clients found' }, { status: 404 })
    }

    // Update client statuses
    await prisma.client.updateMany({
      where: {
        id: { in: clientIds },
      },
      data: {
        status,
      },
    })

    // Log activity for each client
    for (const client of clients) {
      await prisma.activity.create({
        data: {
          type: 'CLIENT_UPDATED',
          description: `Bulk updated client status to ${status}: ${client.creatorName}`,
          metadata: JSON.stringify({
            clientId: client.id,
            creatorName: client.creatorName,
            oldStatus: client.status,
            newStatus: status,
          }),
          clientId: client.id,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: clients.length,
        message: `Successfully updated ${clients.length} client(s) to ${status}`,
      },
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update clients' },
      { status: 500 }
    )
  }
}
