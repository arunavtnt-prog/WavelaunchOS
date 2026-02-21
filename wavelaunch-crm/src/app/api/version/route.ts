import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '2026-02-21-v3',
    commit: '6594bd5',
    timestamp: new Date().toISOString()
  })
}
