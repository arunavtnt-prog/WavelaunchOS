import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const sampleClients = [
  {
    fullName: 'Sarah Johnson',
    brandName: 'Mindful Growth',
    email: 'sarah@mindfulgrowth.com',
    niche: 'Personal Development',
    status: 'ACTIVE',
    onboardedAt: new Date('2024-01-15'),
  },
  {
    fullName: 'Mike Chen',
    brandName: 'Tech Simplified',
    email: 'mike@techsimplified.io',
    niche: 'Technology Education',
    status: 'ACTIVE',
    onboardedAt: new Date('2024-02-01'),
  },
  {
    fullName: 'Emily Rodriguez',
    brandName: 'Fitness Forward',
    email: 'emily@fitnessforward.com',
    niche: 'Health & Fitness',
    status: 'ACTIVE',
    onboardedAt: new Date('2024-03-10'),
  },
]

async function main() {
  console.log('🌱 Creating portal users...')

  for (const clientData of sampleClients) {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { email: clientData.email },
    })

    if (!existingClient) {
      // Create client first
      const client = await prisma.client.create({
        data: {
          fullName: clientData.fullName,
          brandName: clientData.brandName,
          email: clientData.email,
          niche: clientData.niche,
          status: clientData.status,
          onboardedAt: clientData.onboardedAt,
          country: 'US',
        },
      })

      // Create portal user
      const portalPasswordHash = await hash('Test1234', 12)

      await prisma.clientPortalUser.create({
        data: {
          clientId: client.id,
          email: clientData.email,
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

      console.log(`✅ Created client with portal access: ${clientData.fullName}`)
    } else {
      console.log(`ℹ️  Client already exists: ${clientData.email}`)
    }
  }

  console.log('✅ Portal users creation complete!')
}

main()
  .catch((error) => {
    console.error('❌ Error creating portal users:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
