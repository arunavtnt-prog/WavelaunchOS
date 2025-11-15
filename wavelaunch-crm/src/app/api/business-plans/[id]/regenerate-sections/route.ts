import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { getClaudeClient } from '@/lib/ai/claude'
import { promptLoader } from '@/lib/prompts/loader'
import { buildClientContext } from '@/lib/prompts/context-builder'
import { getSections, storeSections, combineSections } from '@/lib/ai/sections'
import { z } from 'zod'

const regenerateSectionsSchema = z.object({
  sectionNames: z.array(z.string()).min(1, 'At least one section must be selected'),
})

// POST /api/business-plans/[id]/regenerate-sections - Regenerate specific sections
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sectionNames } = regenerateSectionsSchema.parse(body)

    // Get business plan
    const businessPlan = await db.businessPlan.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    })

    if (!businessPlan) {
      return NextResponse.json(
        { success: false, error: 'Business plan not found' },
        { status: 404 }
      )
    }

    // Get all sections
    let allSections = await getSections(params.id, 'BUSINESS_PLAN')

    // If no sections exist, parse from content first
    if (allSections.length === 0 && businessPlan.contentMarkdown) {
      await storeSections(
        params.id,
        'BUSINESS_PLAN',
        businessPlan.contentMarkdown,
        businessPlan.generatedBy
      )
      allSections = await getSections(params.id, 'BUSINESS_PLAN')
    }

    if (allSections.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No sections found to regenerate' },
        { status: 400 }
      )
    }

    // Load prompt template
    const template = await promptLoader.loadTemplate('BUSINESS_PLAN')

    // Build context
    const context = await buildClientContext(businessPlan.clientId)

    // Regenerate each selected section
    const claudeClient = getClaudeClient()
    const regeneratedSections: any[] = []

    for (const sectionName of sectionNames) {
      // Find the section
      const section = allSections.find((s) => s.sectionName === sectionName)
      if (!section) {
        continue
      }

      // Create a focused prompt for this section
      const sectionPrompt = `Generate the "${sectionName}" section for a business plan.

Client Information:
${JSON.stringify(context, null, 2)}

Requirements:
- This should be a complete, detailed section
- Use professional business language
- Focus specifically on ${sectionName}
- Output in markdown format starting with ## ${sectionName}

Generate only this section, nothing else.`

      // Generate the section
      const sectionContent = await claudeClient.generate(sectionPrompt, {
        systemPrompt: template.systemPrompt,
        useCache: true,
        cacheTTLHours: 72,
        operation: `REGENERATE_SECTION_${sectionName.toUpperCase()}`,
        clientId: businessPlan.clientId,
        userId: session.user.id,
        metadata: {
          businessPlanId: params.id,
          sectionName,
        },
      })

      // Update the section in database
      await db.documentSection.update({
        where: { id: section.id },
        data: {
          content: sectionContent.replace(/^##\s+.+\n+/, ''), // Remove heading as we store it separately
          generatedBy: session.user.id,
          version: section.version + 1,
          updatedAt: new Date(),
        },
      })

      regeneratedSections.push(sectionName)
    }

    // Get updated sections
    const updatedSections = await getSections(params.id, 'BUSINESS_PLAN')

    // Combine sections into full content
    const fullContent = combineSections(updatedSections)

    // Update business plan with combined content
    await db.businessPlan.update({
      where: { id: params.id },
      data: {
        contentMarkdown: fullContent,
        updatedAt: new Date(),
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId: businessPlan.clientId,
        type: 'BUSINESS_PLAN_UPDATED',
        description: `Regenerated sections: ${regeneratedSections.join(', ')}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Regenerated ${regeneratedSections.length} section(s)`,
      data: {
        regeneratedSections,
        totalSections: updatedSections.length,
      },
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}
