import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            businessPlans: true,
            deliverables: true,
            files: true,
            notes: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        total: clients.length,
      },
    })
  } catch (error) {
    console.error('Fetch archived clients error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archived clients' },
      { status: 500 }
    )
  }
}
