import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection and schema
    console.log('Testing database connection...')
    
    // Test if we can query the clients table
    const clientCount = await db.client.count()
    console.log('Client count:', clientCount)
    
    // Check table structure - get all columns to see what name field exists
    const tableInfo = await db.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' ORDER BY ordinal_position`
    
    // Try to find any name-related column
    const nameColumns = await db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' AND column_name ILIKE '%name%'`
    
    return NextResponse.json({
      success: true,
      clientCount,
      testClient: null, // Skip the failing query
      tableColumns: tableInfo,
      nameColumns: nameColumns
    })
    
  } catch (error: unknown) {
    console.error('Database test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: String(error)
    }, { status: 500 })
  }
}
