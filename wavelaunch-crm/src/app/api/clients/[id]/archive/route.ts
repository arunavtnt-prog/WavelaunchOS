import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = params.id

    // Check if client exists and is not already archived
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (existingClient.deletedAt) {
      return NextResponse.json(
        { success: false, error: 'Client is already archived' },
        { status: 400 }
      )
    }

    // Archive the client (soft delete)
    const archivedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        deletedAt: new Date(),
        status: 'ARCHIVED',
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CLIENT_ARCHIVED',
        description: `Archived client: ${archivedClient.creatorName}`,
        metadata: JSON.stringify({
          clientId: archivedClient.id,
          creatorName: archivedClient.creatorName,
          brandName: archivedClient.brandName,
        }),
        clientId: archivedClient.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: archivedClient,
      message: 'Client archived successfully',
    })
  } catch (error) {
    console.error('Archive client error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to archive client' },
      { status: 500 }
    )
  }
}
