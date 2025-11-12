import { PrismaClient } from '@prisma/client'
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
      type: 'BUSINESS_PLAN',
      yamlPath: '/data/prompts/business-plan.yaml',
      isActive: true,
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
    },
  ]

  for (const template of templates) {
    const existing = await prisma.promptTemplate.findFirst({
      where: { type: template.type as any },
    })

    if (!existing) {
      await prisma.promptTemplate.create({
        data: template as any,
      })
      console.log(`✅ Created template: ${template.name}`)
    } else {
      console.log(`ℹ️  Template already exists: ${template.name}`)
    }
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
