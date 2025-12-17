import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlLength: process.env.DATABASE_URL?.length || 0,
      dbUrlStart: process.env.DATABASE_URL?.substring(0, 50) || ''
    }
  })
}
