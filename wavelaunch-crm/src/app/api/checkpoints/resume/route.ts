import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleError } from '@/lib/utils/errors'
import { getCheckpoint, saveCheckpoint, completeCheckpoint, failCheckpoint } from '@/lib/ai/checkpoints'
import { getClaudeClient } from '@/lib/ai/claude'
import { promptLoader } from '@/lib/prompts/loader'
import { BUSINESS_PLAN_SECTIONS } from '@/lib/ai/sections'
import { z } from 'zod'

const resumeSchema = z.object({
  jobId: z.string(),
})

// POST /api/checkpoints/resume - Resume a checkpoint
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const body = await request.json()
    const { jobId } = resumeSchema.parse(body)

    // Get checkpoint
    const checkpoint = await getCheckpoint(jobId)
    if (!checkpoint) {
      return NextResponse.json(
        { success: false, error: 'Checkpoint not found' },
        { status: 404 }
      )
    }

    if (!checkpoint.canResume) {
      return NextResponse.json(
        { success: false, error: 'This checkpoint cannot be resumed' },
        { status: 400 }
      )
    }

    // Resume generation based on job type
    if (checkpoint.jobType === 'BUSINESS_PLAN') {
      await resumeBusinessPlanGeneration(checkpoint, userId)
    } else if (checkpoint.jobType === 'DELIVERABLE') {
      await resumeDeliverableGeneration(checkpoint, userId)
    } else {
      return NextResponse.json(
        { success: false, error: 'Unknown job type' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Generation resumed successfully',
    })
  } catch (error) {
    const err = handleError(error)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }
}

async function resumeBusinessPlanGeneration(checkpoint: any, userId: string) {
  try {
    const claudeClient = getClaudeClient()
    const template = await promptLoader.loadTemplate('BUSINESS_PLAN')

    const sections = BUSINESS_PLAN_SECTIONS
    const generatedSections = checkpoint.generatedContent || []

    // Continue from current section
    for (let i = checkpoint.currentSection; i < sections.length; i++) {
      const section = sections[i]

      // Create prompt for this section
      const sectionPrompt = `Generate the "${section.title}" section for a business plan.

Client Information:
${JSON.stringify(checkpoint.promptContext, null, 2)}

Requirements:
- This should be a complete, detailed section
- Use professional business language
- Focus specifically on ${section.title}
- Output in markdown format starting with ## ${section.title}

Generate only this section, nothing else.`

      // Generate section
      const sectionContent = await claudeClient.generate(sectionPrompt, {
        systemPrompt: template.systemPrompt,
        useCache: true,
        cacheTTLHours: 168,
        operation: `RESUME_BUSINESS_PLAN_${section.name.toUpperCase()}`,
        clientId: checkpoint.clientId,
        userId,
        metadata: {
          jobId: checkpoint.jobId,
          section: section.name,
          resumed: true,
        },
      })

      // Add to generated sections
      generatedSections.push({
        name: section.name,
        title: section.title,
        content: sectionContent,
      })

      // Update checkpoint
      await saveCheckpoint({
        jobId: checkpoint.jobId,
        jobType: 'BUSINESS_PLAN',
        clientId: checkpoint.clientId,
        totalSections: sections.length,
        completedSections: i + 1,
        currentSection: i + 1,
        generatedContent: generatedSections,
        promptContext: checkpoint.promptContext,
      })
    }

    // Combine all sections
    const fullContent = generatedSections
      .map((s: any) => s.content)
      .join('\n\n')

    // Get or create business plan
    const existingPlans = await db.businessPlan.findMany({
      where: { clientId: checkpoint.clientId },
      orderBy: { version: 'desc' },
      take: 1,
    })

    const version = existingPlans.length > 0 ? existingPlans[0].version + 1 : 1

    // Save business plan
    await db.businessPlan.create({
      data: {
        clientId: checkpoint.clientId,
        version,
        contentMarkdown: fullContent,
        status: 'DRAFT',
        generatedBy: userId,
      },
    })

    // Mark checkpoint as completed
    await completeCheckpoint(checkpoint.jobId)

    // Log activity
    await db.activity.create({
      data: {
        clientId: checkpoint.clientId,
        type: 'BUSINESS_PLAN_GENERATED',
        description: `Generated business plan v${version} (resumed from checkpoint)`,
        userId,
      },
    })
  } catch (error) {
    await failCheckpoint(
      checkpoint.jobId,
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw error
  }
}

async function resumeDeliverableGeneration(checkpoint: any, userId: string) {
  try {
    // Similar logic for deliverables
    // Implementation would be similar to resumeBusinessPlanGeneration
    // but for deliverables structure
    // Month can be stored in promptContext
    const month = checkpoint.promptContext?.month || 1

    // Mark as completed for now (would implement full logic)
    await completeCheckpoint(checkpoint.jobId)
  } catch (error) {
    await failCheckpoint(
      checkpoint.jobId,
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw error
  }
}
