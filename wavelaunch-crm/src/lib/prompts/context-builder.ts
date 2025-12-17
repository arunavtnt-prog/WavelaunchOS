import { prisma } from '@/lib/db'
import { Client, Deliverable } from '@prisma/client'

export type ClientContext = {
  client_name: string
  brand_name: string
  email: string
  niche: string
  vision_statement: string
  target_industry: string
  target_audience: string
  demographics: string
  pain_points: string
  unique_value_props: string
  target_demographic_age: string
  brand_image: string
  brand_personality: string
  preferred_font: string
  goals?: string
  social_handles?: string
  onboarded_date: string
  generation_date: string
  wavelaunch_studio: string
}

export type DeliverableContext = ClientContext & {
  current_month_number: number
  month_title: string
  previous_months_summary?: string
}

export async function buildClientContext(clientId: string): Promise<ClientContext> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) {
    throw new Error(`Client not found: ${clientId}`)
  }

  return {
    client_name: client.fullName,
    brand_name: client.fullName,
    email: client.email,
    niche: client.industryNiche,
    vision_statement: client.visionForVenture,
    target_industry: client.industryNiche,
    target_audience: client.targetAudience,
    demographics: client.demographicProfile,
    pain_points: client.keyPainPoints,
    unique_value_props: client.uniqueValueProps,
    target_demographic_age: client.targetDemographicAge,
    brand_image: client.idealBrandImage,
    brand_personality: client.brandPersonality,
    preferred_font: client.preferredFont,
    onboarded_date: client.onboardedAt.toLocaleDateString(),
    generation_date: new Date().toLocaleDateString(),
    wavelaunch_studio: 'Wavelaunch Studio',
  }
}

export async function buildDeliverableContext(
  clientId: string,
  month: number
): Promise<DeliverableContext> {
  const clientContext = await buildClientContext(clientId)

  // Get month title
  const monthTitles = [
    'Month 1: Foundation Excellence',
    'Month 2: Brand Readiness & Productization',
    'Month 3: Market Entry Preparation',
    'Month 4: Sales Engine & Launch Infrastructure',
    'Month 5: Pre-Launch Mastery',
    'Month 6: Soft Launch Execution',
    'Month 7: Scaling & Growth Systems',
    'Month 8: Full Launch & Market Domination',
  ]

  // Get previous months' deliverables for context
  let previousSummary: string | undefined

  if (month > 1) {
    const previousDeliverables = await prisma.deliverable.findMany({
      where: {
        clientId,
        month: { lt: month },
        type: 'MAIN',
      },
      orderBy: { month: 'asc' },
      select: {
        month: true,
        title: true,
        contentMarkdown: true,
      },
    })

    if (previousDeliverables.length > 0) {
      previousSummary = previousDeliverables
        .map((d) => {
          // Extract first 500 chars as summary
          const summary = d.contentMarkdown.substring(0, 500)
          return `## ${d.title}\n${summary}...`
        })
        .join('\n\n')
    }
  }

  return {
    ...clientContext,
    current_month_number: month,
    month_title: monthTitles[month - 1] || `Month ${month}`,
    previous_months_summary: previousSummary,
  }
}
