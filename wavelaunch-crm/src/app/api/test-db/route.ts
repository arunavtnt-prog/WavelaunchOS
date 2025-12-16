import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection and schema
    console.log('Testing database connection...')
    
    // Test if we can query the clients table
    const clientCount = await db.client.count()
    console.log('Client count:', clientCount)
    
    // Test if fullName field exists by trying to select it
    const testClient = await db.client.findFirst({
      select: {
        id: true,
        fullName: true,
        email: true
      }
    })
    
    console.log('Test client:', testClient?.id, testClient?.fullName, testClient?.email)
    
    // Check table structure
    const tableInfo = await db.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' ORDER BY ordinal_position`
    
    return NextResponse.json({
      success: true,
      clientCount,
      testClient,
      tableColumns: tableInfo
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
