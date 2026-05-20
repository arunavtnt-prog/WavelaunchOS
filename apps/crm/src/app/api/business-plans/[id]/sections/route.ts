import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { getSections, storeSections, combineSections } from '@/lib/ai/sections'

// GET /api/business-plans/[id]/sections - Get all sections for a business plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id: params.id },
    })

    if (!businessPlan) {
      return NextResponse.json(
        { success: false, error: 'Business plan not found' },
        { status: 404 }
      )
    }

    // Get or create sections
    let sections = await getSections(params.id, 'BUSINESS_PLAN')

    // If no sections exist, parse from content
    if (sections.length === 0 && businessPlan.contentMarkdown) {
      await storeSections(
        params.id,
        'BUSINESS_PLAN',
        businessPlan.contentMarkdown,
        businessPlan.generatedBy
      )
      sections = await getSections(params.id, 'BUSINESS_PLAN')
    }

    return NextResponse.json({
      success: true,
      data: sections,
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
