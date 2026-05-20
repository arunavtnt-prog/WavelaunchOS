import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

// GET /api/business-plans - Get all business plans or filter by clientId
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const whereClause = clientId ? { clientId } : {}

    const plans = await prisma.businessPlan.findMany({
      where: whereClause,
      include: {
        client: true,
        generatedByUser: {
          select: {
            id: true,
            name: true as any,
            email: true,
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: plans,
    })
  } catch (error) {
    console.error('Fetch business plans error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business plans' },
      { status: 500 }
    )
  }
}
