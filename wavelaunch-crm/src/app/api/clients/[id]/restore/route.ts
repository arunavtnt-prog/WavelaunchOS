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

    // Check if client exists and is archived
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!existingClient.deletedAt) {
      return NextResponse.json(
        { success: false, error: 'Client is not archived' },
        { status: 400 }
      )
    }

    // Restore the client
    const restoredClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        deletedAt: null,
        status: 'ACTIVE',
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CLIENT_RESTORED',
        description: `Restored client: ${restoredClient.creatorName}`,
        metadata: JSON.stringify({
          clientId: restoredClient.id,
          creatorName: restoredClient.creatorName,
          brandName: restoredClient.brandName,
        }),
        clientId: restoredClient.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: restoredClient,
      message: 'Client restored successfully',
    })
  } catch (error) {
    console.error('Restore client error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to restore client' },
      { status: 500 }
    )
  }
}
