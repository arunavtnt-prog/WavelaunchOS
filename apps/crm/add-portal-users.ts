// Simple script to add test portal users to the database
// Run with: node add-portal-users.js

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

const TEST_USERS = [
  {
    email: 'test@wavelaunch.studio',
    password: 'Test1234',
    fullName: 'Test User'
  },
  {
    email: 'demo@wavelaunch.studio',
    password: 'Demo1234',
    fullName: 'Demo User'
  },
  {
    email: 'admin@wavelaunch.studio',
    password: 'wavelaunch123',
    fullName: 'Admin User'
  }
];

async function createPortalUser(userData) {
  console.log(\`Creating portal user: \${userData.email}\`);

  // Check if portal user already exists
  const existing = await client.clientPortalUser.findUnique({
    where: { email: userData.email }
  });

  if (existing) {
    console.log(\`  → Portal user already exists\`);
    return false;
  }

  // Create client first (required for portal user)
  const client = await client.client.create({
    data: {
      fullName: userData.fullName,
      brandName: userData.fullName,
      email: userData.email,
      niche: 'Testing',
      status: 'ACTIVE',
      onboardedAt: new Date(),
      country: 'US',
      industryNiche: 'Testing',
      age: 25,
      professionalMilestones: '',
      personalTurningPoints: '',
      visionForVenture: '',
      hopeToAchieve: '',
      targetAudience: '',
      demographicProfile: '',
      targetDemographicAge: '',
      audienceGenderSplit: '',
      audienceMaritalStatus: '',
      currentChannels: '',
      keyPainPoints: '',
      brandValues: '',
      differentiation: '',
      uniqueValueProps: '',
      emergingCompetitors: '',
      idealBrandImage: '',
      inspirationBrands: '',
      brandingAesthetics: '',
      emotionsBrandEvokes: '',
      brandPersonality: '',
      preferredFont: '',
      productCategories: [],
      otherProductIdeas: null,
      scalingGoals: '',
      growthStrategies: '',
      longTermVision: '',
      specificDeadlines: null,
      additionalInfo: null
    }
  });

  console.log(\`  → Created client (ID: \${client.id})\`);

  // Create portal user
  const passwordHash = await hash(userData.password, 12);

  const portalUser = await client.clientPortalUser.create({
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

  console.log(\`  → Created portal user (ID: \${portalUser.id})\`);
  return true;
}

async function main() {
  console.log('🌱 Creating portal users...\n');
  console.log('Database:', DATABASE_URL.substring(0, 30) + '...\n');

  let created = 0;
  let skipped = 0;

  for (const userData of TEST_USERS) {
    const success = await createPortalUser(userData);
    if (success) created++;
    else skipped++;
  }

  console.log(\`\n✅ Created \${created} portal users\`);
  console.log(\`ℹ️  Skipped \${skipped} (already exists)\`);

  console.log('\n📝 Test Credentials:');
  TEST_USERS.forEach(u => {
    console.log(\`  \${u.email}\` + ' / ' + u.password);
  });

  console.log('\n🌐 Portal Login: http://localhost:3000/portal/login');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  })
  .finally(() => {
    client.\$disconnect();
  });
