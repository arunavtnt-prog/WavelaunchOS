import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { PromptTemplateType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@wavelaunch.studio'
  const adminPassword = process.env.ADMIN_PASSWORD || 'wavelaunch123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const passwordHash = await hash(adminPassword, 12)

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin User',
        role: 'ADMIN',
      },
    })

    console.log(`✅ Created admin user: ${adminEmail}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  // Create initial prompt templates
  const templates = [
    {
      name: 'Business Plan Generator',
      type: 'BUSINESS_PLAN',
      content: `name: Business Plan Generator
version: 1.0.0
description: Comprehensive business plan template for creator brands
type: BUSINESS_PLAN

systemPrompt: |
  You are an expert business consultant specializing in creator brands and digital businesses. 
  You create comprehensive, actionable business plans that help creators turn their passion into 
  sustainable businesses. Your plans are strategic, practical, and tailored to each creator's 
  unique niche and audience.

userPrompt: |
  Generate a comprehensive business plan for the following creator:

  ## Creator Information
  **Name:** {{client_name}}
  **Brand:** {{brand_name}}
  **Niche:** {{niche}}
  **Industry:** {{industry}}
  **Target Audience:** {{target_audience}}
  **Age:** {{age}}
  **Country:** {{country}}

  ## Vision & Goals
  **Vision for Venture:** {{vision_for_venture}}
  **Hope to Achieve:** {{hope_to_achieve}}

  ## Professional Background
  **Professional Milestones:** {{professional_milestones}}
  **Personal Turning Points:** {{personal_turning_points}}

  ## Market Understanding
  **Current Channels:** {{current_channels}}
  **Key Pain Points:** {{key_pain_points}}
  **Brand Values:** {{brand_values}}

  ## Demographics
  **Target Demographic Age:** {{target_demographic_age}}
  **Audience Gender Split:** {{audience_gender_split}}
  **Audience Marital Status:** {{audience_marital_status}}
  **Demographic Profile:** {{demographic_profile}}

  ## Requirements:
  1. Create a professional business plan with the following sections:
     - Executive Summary
     - Business Description & Mission
     - Market Analysis
     - Target Audience Deep Dive
     - Competitive Analysis
     - Products & Services
     - Marketing & Sales Strategy
     - Operations Plan
     - Management Team
     - Financial Projections (3-5 years)
     - Risk Assessment
     - Implementation Timeline

  2. Include specific, actionable recommendations
  3. Provide realistic financial projections based on the creator's niche
  4. Consider their current resources and constraints
  5. Focus on scalable, sustainable growth strategies
  6. Include content creation strategies relevant to their niche
  7. Address monetization strategies specific to creator businesses

  Format the response in professional business plan format with clear headings, bullet points, and tables where appropriate. Use a confident, expert tone while remaining encouraging and practical.

variables:
  - client_name
  - brand_name
  - niche
  - industry
  - target_audience
  - age
  - country
  - vision_for_venture
  - hope_to_achieve
  - professional_milestones
  - personal_turning_points
  - current_channels
  - key_pain_points
  - brand_values
  - target_demographic_age
  - audience_gender_split
  - audience_marital_status
  - demographic_profile

tags:
  - business-plan
  - creator-brand
  - comprehensive
  - strategic`,
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Month 1: Foundation Excellence',
      type: 'DELIVERABLE_M1',
      yamlPath: '/data/prompts/deliverable-m1.yaml',
      isActive: true,
    },
    {
      name: 'Month 2: Brand Readiness & Productization',
      type: 'DELIVERABLE_M2',
      yamlPath: '/data/prompts/deliverable-m2.yaml',
      isActive: true,
    },
    {
      name: 'Month 3: Market Entry Preparation',
      type: 'DELIVERABLE_M3',
      yamlPath: '/data/prompts/deliverable-m3.yaml',
      isActive: true,
    },
    {
      name: 'Month 4: Sales Engine & Launch Infrastructure',
      type: 'DELIVERABLE_M4',
      yamlPath: '/data/prompts/deliverable-m4.yaml',
      isActive: true,
    },
    {
      name: 'Month 5: Pre-Launch Mastery',
      type: 'DELIVERABLE_M5',
      yamlPath: '/data/prompts/deliverable-m5.yaml',
      isActive: true,
    },
    {
      name: 'Month 6: Soft Launch Execution',
      type: 'DELIVERABLE_M6',
      yamlPath: '/data/prompts/deliverable-m6.yaml',
      isActive: true,
    },
    {
      name: 'Month 7: Scaling & Growth Systems',
      type: 'DELIVERABLE_M7',
      yamlPath: '/data/prompts/deliverable-m7.yaml',
      isActive: true,
    },
    {
      name: 'Month 8: Full Launch & Market Domination',
      type: 'DELIVERABLE_M8',
      yamlPath: '/data/prompts/deliverable-m8.yaml',
      isActive: true,
    }
  ]

  for (const template of templates) {
    const existing = await prisma.promptTemplate.findFirst({
      where: { type: template.type },
    })

    if (!existing) {
      await prisma.promptTemplate.create({ data: template })
      console.log(`✅ Created template: ${template.name}`)
    } else {
      console.log(`ℹ️  Template already exists: ${template.name}`)
    }
  }

  // Create sample clients with portal users for testing (unchanged section)
  const sampleClients = [
    {
      creatorName: 'Sarah Johnson',
      brandName: 'Mindful Growth',
      email: 'sarah@mindfulgrowth.com',
      niche: 'Personal Development',
      status: 'ACTIVE' as const,
      onboardedAt: new Date('2024-01-15'),
      portalEmail: 'sarah@mindfulgrowth.com',
      portalPassword: 'Test1234',
    },
    {
      creatorName: 'Mike Chen',
      brandName: 'Tech Simplified',
      email: 'mike@techsimplified.io',
      niche: 'Technology Education',
      status: 'ACTIVE' as const,
      onboardedAt: new Date('2024-02-01'),
      portalEmail: 'mike@techsimplified.io',
      portalPassword: 'Test1234',
    },
    {
      creatorName: 'Emily Rodriguez',
      brandName: 'Fitness Forward',
      email: 'emily@fitnessforward.com',
      niche: 'Health & Fitness',
      status: 'ACTIVE' as const,
      onboardedAt: new Date('2024-03-10'),
      portalEmail: 'emily@fitnessforward.com',
      portalPassword: 'Test1234',
    },
  ]

  for (const clientData of sampleClients) {
    const existingClient = await prisma.client.findUnique({
      where: { email: clientData.email },
    })

    if (!existingClient) {
      const client = await prisma.client.create({
        data: {
          creatorName: clientData.creatorName,
          brandName: clientData.brandName,
          email: clientData.email,
          niche: clientData.niche,
          status: clientData.status,
          onboardedAt: clientData.onboardedAt,
        },
      })

      const portalPasswordHash = await hash(clientData.portalPassword, 12)

      await prisma.clientPortalUser.create({
        data: {
          clientId: client.id,
          email: clientData.portalEmail,
          passwordHash: portalPasswordHash,
          isActive: true,
          emailVerified: true,
          activatedAt: new Date(),
          invitedAt: new Date(),
          notifyNewDeliverable: true,
          notifyNewMessage: true,
          notifyMilestoneReminder: true,
          notifyWeeklySummary: false,
        },
      })

      console.log(`✅ Created client with portal access: ${clientData.creatorName}`)
    } else {
      console.log(`ℹ️  Client already exists: ${clientData.creatorName}`)
    }
  }

  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('📋 Test Portal Users:')
  console.log('  sarah@mindfulgrowth.com / Test1234')
  console.log('  mike@techsimplified.io / Test1234')
  console.log('  emily@fitnessforward.com / Test1234')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
