import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Simple token authentication for external requests
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.EXTERNAL_API_TOKEN

  if (!expectedToken) {
    console.warn('EXTERNAL_API_TOKEN not configured')
    return false
  }

  return authHeader === `Bearer ${expectedToken}`
}

// GET /api/applications/external/list - List applications (token auth)
export async function GET(request: NextRequest) {
  try {
    if (!authenticateRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const takeRaw = Number(searchParams.get('take') || 100)
    const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 200) : 100

    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { convertedToClient: true },
    })

    return NextResponse.json({ success: true, data: applications })
  } catch (error) {
    console.error('External list applications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

