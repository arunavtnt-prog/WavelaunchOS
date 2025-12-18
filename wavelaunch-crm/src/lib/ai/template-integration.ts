/**
 * AI Template Integration
 * 
 * Bridge between the new template system and existing AI generation.
 */

import { templateEngine } from '@/lib/templates/engine'
import { buildClientContext } from '@/lib/prompts/context-builder'
import { prisma } from '@/lib/db'

/**
 * Generate business plan using new template system
 */
export async function generateBusinessPlanWithTemplates(
  clientId: string,
  userId: string
): Promise<{ content: string; metadata: any }> {
  try {
    // Get client data
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        businessPlans: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    })

    if (!client) {
      throw new Error('Client not found')
    }

    // Build context from existing system
    const context = await buildClientContext(clientId)
    
    // Get template
    const template = templateEngine.getTemplate('business-plan-standard')
    if (!template) {
      throw new Error('Business plan template not found')
    }

    // Render template with context
    const rendered = templateEngine.renderTemplate('business-plan-standard', context)

    return {
      content: rendered.content,
      metadata: rendered.metadata
    }
  } catch (error) {
    console.error('Template generation error:', error)
    throw error
  }
}

/**
 * Generate deliverable using new template system
 */
export async function generateDeliverableWithTemplates(
  clientId: string,
  month: number,
  userId: string
): Promise<{ content: string; metadata: any }> {
  try {
    // Get client data
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        deliverables: {
          orderBy: { month: 'desc' },
          take: 1
        }
      }
    })

    if (!client) {
      throw new Error('Client not found')
    }

    // Build context for deliverable
    const context = await buildClientContext(clientId)
    
    // Add deliverable-specific context
    const deliverableContext = {
      ...context,
      month,
      client_name: client.fullName,
      niche: client.industryNiche || 'creator',
      // Add more deliverable-specific variables as needed
    }

    // Get template by month
    const templateMap: Record<number, string> = {
      1: 'deliverable-month-1-foundation',
      // Add other months as they're created
    }

    const templateId = templateMap[month]
    if (!templateId) {
      throw new Error(`No template found for month ${month}`)
    }

    const template = templateEngine.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Render template with context
    const rendered = templateEngine.renderTemplate(templateId, deliverableContext)

    return {
      content: rendered.content,
      metadata: rendered.metadata
    }
  } catch (error) {
    console.error('Deliverable template generation error:', error)
    throw error
  }
}

/**
 * List available templates
 */
export function getAvailableTemplates() {
  return {
    businessPlans: templateEngine.getTemplatesByType('business_plan'),
    deliverables: templateEngine.getTemplatesByType('deliverable')
  }
}
