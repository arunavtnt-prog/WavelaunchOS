import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

// GET /api/business-plans - Get all business plans
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const plans = await prisma.businessPlan.findMany({
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
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
