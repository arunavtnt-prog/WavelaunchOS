import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        success: false,
        service: 'wavelaunch-crm',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        auth: 'unknown',
        ...(isDevelopment && { error: error instanceof Error ? error.message : 'Unknown error' }),
      },
      { status: 500 }
    )
  }

  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })

    if (adminCount === 0) {
      return NextResponse.json(
        {
          success: false,
          service: 'wavelaunch-crm',
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: 'connected',
          auth: 'unconfigured',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      service: 'wavelaunch-crm',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      auth: 'ready',
    })
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        success: false,
        service: 'wavelaunch-crm',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        auth: 'unavailable',
        ...(isDevelopment && { error: error instanceof Error ? error.message : 'Unknown error' }),
      },
      { status: 503 }
    )
  }
}
