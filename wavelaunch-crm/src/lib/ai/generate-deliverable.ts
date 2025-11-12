import { db } from '@/lib/db'
import { getClaudeClient } from './claude'
import { promptLoader } from '@/lib/prompts/loader'
import { buildDeliverableContext } from '@/lib/prompts/context-builder'
import type { JobResult } from '@/lib/jobs/queue'
import type { PromptTemplateType } from '@prisma/client'

export async function generateDeliverable(
  clientId: string,
  month: number,
  userId: string
): Promise<JobResult> {
  try {
    // Validate month
    if (month < 1 || month > 8) {
      throw new Error('Month must be between 1 and 8')
    }

    // Get client
    const client = await db.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      throw new Error('Client not found')
    }

    // Check if deliverable already exists
    const existing = await db.deliverable.findFirst({
      where: {
        clientId,
        month,
        type: 'MAIN',
      },
    })

    if (existing) {
      throw new Error(`Deliverable for Month ${month} already exists`)
    }

    // Get template type
    const templateType = `DELIVERABLE_M${month}` as PromptTemplateType

    // Load prompt template
    const template = await promptLoader.loadTemplate(templateType)

    // Build context (includes previous months)
    const context = await buildDeliverableContext(clientId, month)

    // Render prompt
    const prompt = promptLoader.renderPrompt(template, context)

    // Generate with Claude
    const claudeClient = getClaudeClient()
    const content = await claudeClient.generate(prompt, template.systemPrompt)

    // Save to database
    const deliverable = await db.deliverable.create({
      data: {
        clientId,
        month,
        title: context.month_title,
        type: 'MAIN',
        contentMarkdown: content,
        status: 'DRAFT',
        generatedBy: userId,
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        clientId,
        type: 'DELIVERABLE_GENERATED',
        description: `Generated ${context.month_title}`,
        userId,
      },
    })

    return {
      success: true,
      data: {
        deliverableId: deliverable.id,
        month,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
