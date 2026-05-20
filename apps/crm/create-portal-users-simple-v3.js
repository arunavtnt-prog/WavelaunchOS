// Simple script to add test portal users to the database
// Run with: node create-portal-users-simple-v3.js

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

const TEST_USERS = [
  {
    fullName: 'Test User One',
    brandName: 'Test Brand One',
    email: 'test@wavelaunch.studio',
    password: 'Test1234'
  },
  {
    fullName: 'Test User Two',
    brandName: 'Test Brand Two',
    email: 'test2@wavelaunch.studio',
    password: 'Test1234'
  },
  {
    fullName: 'Demo User',
    brandName: 'Demo Brand',
    email: 'demo@wavelaunch.studio',
    password: 'Demo1234'
  }
];

async function main() {
  console.log('Creating portal users...');

  for (const userData of TEST_USERS) {
    try {
      const existingClient = await prisma.client.findUnique({
        where: { email: userData.email }
      });

      if (existingClient) {
        console.log('Client already exists:', userData.email);
        continue;
      }

      const client = await prisma.client.create({
        data: {
          fullName: userData.fullName,
          brandName: userData.brandName,
          email: userData.email,
          niche: userData.niche,
          status: userData.status,
          onboardedAt: userData.onboardedAt,
          country: userData.country,
          industryNiche: userData.niche,
          age: userData.age,
          professionalMilestones: userData.professionalMilestones,
          personalTurningPoints: userData.personalTurningPoints,
          visionForVenture: userData.visionForVenture,
          hopeToAchieve: userData.hopeToAchieve,
          targetAudience: userData.targetAudience,
          demographicProfile: userData.demographicProfile,
          targetDemographicAge: userData.targetDemographicAge,
          audienceGenderSplit: userData.audienceGenderSplit,
          audienceMaritalStatus: userData.audienceMaritalStatus,
          currentChannels: userData.currentChannels,
          keyPainPoints: userData.keyPainPoints,
          brandValues: userData.brandValues,
          differentiation: userData.differentiation,
          uniqueValueProps: userData.uniqueValueProps,
          emergingCompetitors: userData.emergingCompetitors,
          idealBrandImage: userData.idealBrandImage,
          inspirationBrands: userData.inspirationBrands,
          brandingAesthetics: userData.brandingAesthetics,
          emotionsBrandEvokes: userData.emotionsBrandEvokes,
          brandPersonality: userData.brandPersonality,
          preferredFont: userData.preferredFont,
          productCategories: userData.productCategories,
          otherProductIdeas: userData.otherProductIdeas,
          scalingGoals: userData.scalingGoals,
          growthStrategies: userData.growthStrategies,
          longTermVision: userData.longTermVision,
          specificDeadlines: userData.specificDeadlines,
          additionalInfo: userData.additionalInfo
        }
      });

      console.log('Created client:', userData.fullName);

      const passwordHash = await hash(userData.password, 12);

      const portalUser = await prisma.clientPortalUser.create({
        data: {
          clientId: client.id,
          email: userData.email,
          passwordHash: passwordHash,
          isActive: true,
          emailVerified: true,
          activatedAt: new Date(),
          invitedAt: new Date(),
          notifyNewDeliverable: true,
          notifyNewMessage: true,
          notifyMilestoneReminder: true,
          notifyWeeklySummary: false
        }
      });

      console.log('Created portal user:', userData.email);
    } catch (error) {
      console.error('Error creating user:', userData.fullName, '-', error.message);
    }
  }

  console.log('Done!');

  console.log('');
  console.log('Test Credentials:');
  TEST_USERS.forEach(function(u) {
    console.log('  Email: ' + u.email);
    console.log('  Password: ' + u.password);
  });

  console.log('');
  console.log('Portal Login: http://localhost:3000/portal/login');
}

main()
  .catch(function(error) {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(function() {
    prisma.$disconnect();
  });
