import { prisma } from '@/lib/db'
import { getClaudeClient } from './claude'
import { promptLoader } from '@/lib/prompts/loader'
import { buildClientContext } from '@/lib/prompts/context-builder'
import { generateBusinessPlanWithTemplates } from './template-integration'
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

    // Get current version first
    const existingPlans = await prisma.businessPlan.findMany({
      where: { clientId },
      orderBy: { version: 'desc' },
      take: 1,
    })
    const version = existingPlans.length > 0 ? existingPlans[0].version + 1 : 1

    // Try using new template system first
    try {
      const templateResult = await generateBusinessPlanWithTemplates(clientId, userId)
      
      // Save to database
      const businessPlan = await prisma.businessPlan.create({
        data: {
          clientId,
          version,
          contentMarkdown: templateResult.content,
          status: 'DRAFT',
          generatedBy: userId,
        },
      })

      await prisma.activity.create({
        data: {
          clientId,
          type: 'BUSINESS_PLAN_GENERATED',
          description: `Generated business plan v${version} using templates`,
          userId,
        },
      })

      return {
        success: true,
        data: {
          businessPlanId: businessPlan.id,
          version,
          templateUsed: true
        },
      }
    } catch (templateError) {
      console.warn('Template generation failed, falling back to old system:', templateError)
      
      // Fallback to old system
      const template = await promptLoader.loadTemplate('BUSINESS_PLAN')
      const context = await buildClientContext(clientId)
      const prompt = promptLoader.renderPrompt(template, context)

      const claudeClient = getClaudeClient()
      const content = await claudeClient.generate(prompt, {
        systemPrompt: template.systemPrompt,
        useCache: true,
        cacheTTLHours: 168,
        operation: 'BUSINESS_PLAN_GENERATION',
        clientId,
        userId,
        metadata: {
          version,
          templateName: template.name,
          templateVersion: template.version,
        },
      })

      const businessPlan = await prisma.businessPlan.create({
        data: {
          clientId,
          version,
          contentMarkdown: content,
          status: 'DRAFT',
          generatedBy: userId,
        },
      })

      await prisma.activity.create({
        data: {
          clientId,
          type: 'BUSINESS_PLAN_GENERATED',
          description: `Generated business plan v${version} (fallback)`,
          userId,
        },
      })

      return {
        success: true,
        data: {
          businessPlanId: businessPlan.id,
          version,
          templateUsed: false
        },
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
