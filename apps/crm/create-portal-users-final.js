// Simple script to add test portal users to the database

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

  let successCount = 0;

  for (let i = 0; i < TEST_USERS.length; i++) {
    const userData = TEST_USERS[i];

    try {
      const existingClient = await prisma.client.findUnique({
        where: { email: userData.email }
      });

      if (!existingClient) {
        const client = await prisma.client.create({
          data: {
            fullName: userData.fullName,
            brandName: userData.brandName,
            email: userData.email,
            niche: 'Testing',
            status: 'ACTIVE',
            onboardedAt: new Date('2024-01-15'),
            country: 'US',
            industryNiche: 'Testing',
            age: 25
          }
        });

        const passwordHash = await hash(userData.password, 12);

        await prisma.clientPortalUser.create({
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

        successCount++;
      } catch (error) {
      console.error('Error creating user:', userData.fullName, '-', error.message);
    }
  }

  console.log('Done!');
  console.log('Created', successCount, 'portal users');
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
