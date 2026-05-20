import { prisma } from '@/lib/db'
import { getClaudeClient } from './claude'
import { promptLoader } from '@/lib/prompts/loader'
import { buildClientContext } from '@/lib/prompts/context-builder'
import type { JobResult } from '@/lib/jobs'

export async function generateBusinessPlan(
  clientId: string,
  userId: string
): Promise<JobResult> {
  try {
    // Get client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      throw new Error('Client not found')
    }

    // Load prompt template
    const template = await promptLoader.loadTemplate('BUSINESS_PLAN')

    // Build context
    const context = await buildClientContext(clientId)

    // Render prompt
    const prompt = promptLoader.renderPrompt(template, context)

    // Get current version first
    const existingPlans = await prisma.businessPlan.findMany({
      where: { clientId },
      orderBy: { version: 'desc' },
      take: 1,
    })
    const version = existingPlans.length > 0 ? existingPlans[0].version + 1 : 1

    // Generate with Claude (with caching and token tracking)
    const claudeClient = getClaudeClient()
    const content = await claudeClient.generate(prompt, {
      systemPrompt: template.systemPrompt,
      useCache: true,
      cacheTTLHours: 168, // 7 days for business plans
      operation: 'BUSINESS_PLAN_GENERATION',
      clientId,
      userId,
      metadata: {
        version,
        templateName: template.name,
        templateVersion: template.version,
      },
    })

    // Save to database
    const businessPlan = await prisma.businessPlan.create({
      data: {
        clientId,
        version,
        contentMarkdown: content,
        status: 'DRAFT',
        generatedBy: userId,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        clientId,
        type: 'BUSINESS_PLAN_GENERATED',
        description: `Generated business plan v${version}`,
        userId,
      },
    })

    return {
      success: true,
      data: {
        businessPlanId: businessPlan.id,
        version,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
