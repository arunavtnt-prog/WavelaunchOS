import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const generateSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
})

// Helper function to generate business plan content based on client data
function generateBusinessPlanContent(client: any): string {
  return `# Business Plan: ${client.fullName}

## Executive Summary

${client.fullName} is a ${client.industryNiche} business. This comprehensive business plan outlines the vision, strategy, and execution plan for building a successful and sustainable business.

### Vision Statement
${client.visionForVenture}

${client.hopeToAchieve ? `### Business Goals\n${client.hopeToAchieve}\n` : ''}

---

## Market Analysis

### Target Industry
**Industry:** ${client.industryNiche}

**Market Opportunity:** Our analysis of the ${client.industryNiche} sector reveals significant opportunities for growth and innovation.

### Target Audience

**Primary Audience:** ${client.targetAudience}

**Demographics:**
- Age Range: ${client.targetDemographicAge}
- Details: ${client.demographicProfile}
${client.audienceGenderSplit ? `- Gender Split: ${client.audienceGenderSplit}` : ''}
${client.audienceMaritalStatus ? `- Marital Status: ${client.audienceMaritalStatus}` : ''}

### Pain Points

Our target audience faces the following challenges:

${client.keyPainPoints}

---

## Value Proposition

### Unique Value

${client.uniqueValueProps}

${client.differentiation ? `### Competitive Advantage\n\n${client.differentiation}\n` : ''}

${client.emergingCompetitors ? `### Competitive Landscape\n\n**Key Competitors:** ${client.emergingCompetitors}\n` : ''}

---

## Brand Identity

### Brand Image
${client.idealBrandImage}

### Brand Personality
${client.brandPersonality}

### Design Direction
**Preferred Typography:** ${client.preferredFont}

${client.brandValues ? `### Core Values\n${client.brandValues}\n` : ''}

${client.brandingAesthetics ? `### Visual Aesthetics\n${client.brandingAesthetics}\n` : ''}

${client.emotionsBrandEvokes ? `### Emotional Connection\n**Target Emotions:** ${client.emotionsBrandEvokes}\n` : ''}

${client.inspirationBrands ? `### Brand Inspiration\n**Reference Brands:** ${client.inspirationBrands}\n` : ''}

---

## Growth Strategy

${client.scalingGoals ? `### Scaling Goals\n${client.scalingGoals}\n` : ''}

${client.growthStrategies ? `### Growth Strategies\n${client.growthStrategies}\n` : ''}

${client.longTermVision ? `### Long-Term Vision (5-10 Years)\n${client.longTermVision}\n` : ''}

${client.currentChannels ? `### Current Marketing Channels\n${client.currentChannels}\n` : ''}

${client.specificDeadlines ? `### Key Milestones & Deadlines\n${client.specificDeadlines}\n` : ''}

---

## Founder Story

${client.professionalMilestones ? `### Professional Journey\n${client.professionalMilestones}\n` : ''}

${client.personalTurningPoints ? `### Personal Motivation\n${client.personalTurningPoints}\n` : ''}

${client.socialHandles ? `### Social Presence\n${client.socialHandles}\n` : ''}

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
- Establish brand identity and messaging
- Set up digital infrastructure
- Create core content library
- Launch initial marketing campaigns

### Phase 2: Growth (Months 3-5)
- Scale marketing efforts across proven channels
- Build community and engagement
- Develop strategic partnerships
- Optimize conversion funnel

### Phase 3: Scale (Months 6-8)
- Expand to new market segments
- Launch advanced products/services
- Implement automation systems
- Establish thought leadership

---

## Next Steps

1. **Review & Approve:** Review this business plan and provide feedback
2. **Finalize Strategy:** Refine specific tactics and timelines
3. **Begin Execution:** Start implementing Month 1 deliverables
4. **Monitor Progress:** Track KPIs and adjust strategy as needed

---

*This business plan was generated based on your onboarding questionnaire. It serves as a comprehensive foundation for your ${client.niche} business. Our team will work with you to refine and execute this plan over the coming months.*

**Generated on:** ${new Date().toLocaleDateString()}
**Status:** DRAFT - Pending Review
`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = generateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { clientId } = validation.data

    // Get client with all onboarding data
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        portalUser: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Admins can generate business plans for any client, regardless of portal user status
    // This allows generating plans for fresh clients converted from applications

    // Check if business plan already exists
    const existingPlan = await prisma.businessPlan.findFirst({
      where: { clientId },
    })

    if (existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Business plan already exists for this client' },
        { status: 400 }
      )
    }

    // Generate business plan content
    const contentMarkdown = generateBusinessPlanContent(client)

    // Create business plan
    const businessPlan = await prisma.businessPlan.create({
      data: {
        clientId,
        version: 1,
        status: 'DRAFT',
        contentMarkdown,
        generatedBy: session.user?.id || '',
        generatedAt: new Date(),
      },
    })

    // Create portal notification for client
    if (client.portalUser) {
      await prisma.portalNotification.create({
        data: {
          clientUserId: client.portalUser.id,
          type: 'NEW_DELIVERABLE',
          title: '📄 Your Business Plan Draft is Ready!',
          message: 'Our team has created your personalized business plan based on your onboarding information. Please review it in your portal.',
          actionUrl: '/portal/documents',
        },
      })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        clientId,
        userId: session.user?.id || '',
        type: 'BUSINESS_PLAN_GENERATED',
        description: `Generated AI business plan draft (v${businessPlan.version})`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Business plan generated successfully',
      data: {
        businessPlanId: businessPlan.id,
        version: businessPlan.version,
      },
    })
  } catch (error) {
    console.error('Generate business plan error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate business plan' },
      { status: 500 }
    )
  }
}
