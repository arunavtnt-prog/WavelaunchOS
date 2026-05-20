// Simple script to add test portal users to the database
// Run with: node create-portal-users-simple-v2.js

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
      // Step 1: Create Client record
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
          niche: 'Testing',
          status: 'ACTIVE',
          onboardedAt: new Date('2024-01-15'),
          country: 'US',
          industryNiche: 'Testing',
          age: 25
        }
      });

      console.log('Created client:', userData.fullName);

      // Step 2: Create ClientPortalUser for authentication
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
  TEST_USERS.forEach(u => {
    console.log('  Email: ' + u.email);
    console.log('  Password: ' + u.password);
  });

  console.log('');
  console.log('Portal Login: http://localhost:3000/portal/login');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
