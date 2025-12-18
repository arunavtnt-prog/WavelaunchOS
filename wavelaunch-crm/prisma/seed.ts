import { PrismaClient, PromptTemplateType } from '@prisma/client'
import { hash } from 'bcryptjs'

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
      type: PromptTemplateType.BUSINESS_PLAN,
      content: 'name: Business Plan Generator\ndescription: Comprehensive business plan template for creator brands\ntype: BUSINESS_PLAN\n\nsystemPrompt: |\n  You are an expert business consultant specializing in creator brands and digital businesses. You create comprehensive, actionable business plans that help creators turn their passion into sustainable businesses. Your plans are strategic, practical, and tailored to each creator\'s unique niche and audience.\n\nuserPrompt: |\n  Generate a comprehensive business plan for the following creator:\n\n  ## Creator Information\n  **Name:** {{client_name}}\n  **Brand:** {{brand_name}}\n  **Niche:** {{niche}}\n  **Industry:** {{industry}}\n  **Target Audience:** {{target_audience}}\n  **Age:** {{age}}\n  **Country:** {{country}}\n\n  ## Vision & Goals\n  **Vision for Venture:** {{vision_for_venture}}\n  **Hope to Achieve:** {{hope_to_achieve}}\n\n  ## Professional Background\n  **Professional Milestones:** {{professional_milestones}}\n  **Personal Turning Points:** {{personal_turning_points}}\n\n  ## Market Understanding\n  **Current Channels:** {{current_channels}}\n  **Key Pain Points:** {{key_pain_points}}\n  **Brand Values:** {{brand_values}}\n\n  ## Demographics\n  **Target Demographic Age:** {{target_demographic_age}}\n  **Audience Gender Split:** {{audience_gender_split}}\n  **Audience Marital Status:** {{audience_marital_status}}\n  **Demographic Profile:** {{demographic_profile}}\n\n  ## Requirements:\n  1. Create a professional business plan with the following sections:\n     - Executive Summary\n     - Business Description & Mission\n     - Market Analysis\n     - Target Audience Deep Dive\n     - Competitive Analysis\n     - Products & Services\n     - Marketing & Sales Strategy\n     - Operations Plan\n     - Management Team\n     - Financial Projections (3-5 years)\n     - Risk Assessment\n     - Implementation Timeline\n\n  2. Include specific, actionable recommendations\n  3. Provide realistic financial projections based on the creator\'s niche\n  4. Consider their current resources and constraints\n  5. Focus on scalable, sustainable growth strategies\n  6. Include content creation strategies relevant to their niche\n  7. Address monetization strategies specific to creator businesses\n\n  Format the response in professional business plan format with clear headings, bullet points, and tables where appropriate. Use a confident, expert tone while remaining encouraging and practical.\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - business-plan\n  - creator-brand\n  - comprehensive\n  - strategic',
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
      type: PromptTemplateType.DELIVERABLE_M1,
      content: 'name: Month 1: Foundation Excellence\ndescription: Foundation setup and initial brand development\ntype: DELIVERABLE_M1\n\nsystemPrompt: |\n  You are an expert business consultant helping creators build their brand foundation.\n\nuserPrompt: |\n  Generate Month 1 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - foundation\n  - brand-development\n  - month-1',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    },
    {
      name: 'Month 2: Brand Readiness & Productization',
      type: PromptTemplateType.DELIVERABLE_M2,
      content: 'name: Month 2: Brand Readiness & Productization\ndescription: Brand development and product creation\ntype: DELIVERABLE_M2\n\nsystemPrompt: |\n  You are an expert business consultant helping creators develop their brand and products.\n\nuserPrompt: |\n  Generate Month 2 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - brand-development\n  - productization\n  - month-2',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    },
    {
      name: 'Month 3: Market Entry Preparation',
      type: PromptTemplateType.DELIVERABLE_M3,
      content: 'name: Month 3: Market Entry Preparation\ndescription: Market research and entry strategy\ntype: DELIVERABLE_M3\n\nsystemPrompt: |\n  You are an expert business consultant helping creators prepare for market entry.\n\nuserPrompt: |\n  Generate Month 3 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - market-entry\n  - preparation\n  - month-3',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    },
    {
      name: 'Month 4: Sales Engine & Launch Infrastructure',
      type: PromptTemplateType.DELIVERABLE_M4,
      content: 'name: Month 4: Sales Engine & Launch Infrastructure\ndescription: Sales systems and launch preparation\ntype: DELIVERABLE_M4\n\nsystemPrompt: |\n  You are an expert business consultant helping creators build sales systems.\n\nuserPrompt: |\n  Generate Month 4 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - sales-engine\n  - launch-infrastructure\n  - month-4',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    },
    {
      name: 'Month 5: Pre-Launch Mastery',
      type: PromptTemplateType.DELIVERABLE_M5,
      content: 'name: Month 5: Pre-Launch Mastery\ndescription: Final preparations before launch\ntype: DELIVERABLE_M5\n\nsystemPrompt: |\n  You are an expert business consultant helping creators prepare for launch.\n\nuserPrompt: |\n  Generate Month 5 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - pre-launch\n  - mastery\n  - month-5',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    },
    {
      name: 'Month 6: Soft Launch Execution',
      type: PromptTemplateType.DELIVERABLE_M6,
      content: 'name: Month 6: Soft Launch Execution\ndescription: Soft launch and initial market testing\ntype: DELIVERABLE_M6\n\nsystemPrompt: |\n  You are an expert business consultant helping creators with soft launch.\n\nuserPrompt: |\n  Generate Month 6 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - soft-launch\n  - execution\n  - month-6',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    },
    {
      name: 'Month 7: Scaling & Growth Systems',
      type: PromptTemplateType.DELIVERABLE_M7,
      content: 'name: Month 7: Scaling & Growth Systems\ndescription: Scaling operations and growth strategies\ntype: DELIVERABLE_M7\n\nsystemPrompt: |\n  You are an expert business consultant helping creators scale their business.\n\nuserPrompt: |\n  Generate Month 7 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - scaling\n  - growth-systems\n  - month-7',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    },
    {
      name: 'Month 8: Full Launch & Market Domination',
      type: PromptTemplateType.DELIVERABLE_M8,
      content: 'name: Month 8: Full Launch & Market Domination\ndescription: Full launch and market dominance strategies\ntype: DELIVERABLE_M8\n\nsystemPrompt: |\n  You are an expert business consultant helping creators achieve market domination.\n\nuserPrompt: |\n  Generate Month 8 deliverable for: {{client_name}}\n\nvariables:\n  - client_name\n  - brand_name\n  - niche\n  - industry\n  - target_audience\n  - age\n  - country\n  - vision_for_venture\n  - hope_to_achieve\n  - professional_milestones\n  - personal_turning_points\n  - current_channels\n  - key_pain_points\n  - brand_values\n  - target_demographic_age\n  - audience_gender_split\n  - audience_marital_status\n  - demographic_profile\n\ntags:\n  - full-launch\n  - market-domination\n  - month-8',
      variables: JSON.stringify([
        'client_name', 'brand_name', 'niche', 'industry', 'target_audience', 'age', 'country',
        'vision_for_venture', 'hope_to_achieve', 'professional_milestones', 'personal_turning_points',
        'current_channels', 'key_pain_points', 'brand_values', 'target_demographic_age',
        'audience_gender_split', 'audience_marital_status', 'demographic_profile'
      ]),
      isActive: true,
    }
  ]

  for (const template of templates) {
    console.log(`Processing template: ${template.name}, type: ${template.type}`)
    const existing = await prisma.promptTemplate.findFirst({
      where: { type: template.type },
    })

    if (!existing) {
      console.log(`Creating template: ${template.name}`)
      try {
        const result = await prisma.promptTemplate.create({ data: template })
        console.log('✅ Created template:', template.name, 'ID:', result.id)
      } catch (error) {
        console.error(`❌ Failed to create template ${template.name}:`, error)
        // Continue with other templates instead of stopping
      }
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
