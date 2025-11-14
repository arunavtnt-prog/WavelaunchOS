import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/prompts - List all prompt templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await db.promptTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      templates,
    })
  } catch (error: any) {
    console.error('Error fetching prompt templates:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch prompt templates',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
