import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id
    
    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      }
    })

    // Check all clients to see what IDs exist
    const allClients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      searchedId: clientId,
      clientExists: !!client,
      client: client,
      allRecentClients: allClients,
      totalClients: await prisma.client.count()
    })

  } catch (error) {
    console.error('Debug client error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
