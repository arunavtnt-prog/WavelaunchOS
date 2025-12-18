const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSeed() {
  console.log('Testing template creation...');
  
  // Clear existing templates
  await prisma.promptTemplate.deleteMany();
  
  // Create simple templates
  const templates = [
    {
      name: 'Business Plan Generator',
      type: 'BUSINESS_PLAN',
      content: 'name: Business Plan Generator\ndescription: Comprehensive business plan template\ntype: BUSINESS_PLAN\n\nsystemPrompt: You are an expert business consultant.\n\nuserPrompt: Generate a comprehensive business plan.\n\nvariables:\n  - client_name\n  - brand_name',
      variables: '["client_name", "brand_name"]',
      isActive: true,
      isDefault: true
    },
    {
      name: 'Month 1: Foundation Excellence',
      type: 'DELIVERABLE_M1',
      content: 'name: Month 1\ndescription: Foundation setup\ntype: DELIVERABLE_M1\n\nsystemPrompt: Expert consultant\n\nuserPrompt: Generate Month 1 deliverable\n\nvariables:\n  - client_name',
      variables: '["client_name"]',
      isActive: true
    }
  ];

  for (const template of templates) {
    try {
      console.log(`Creating template: ${template.name}`);
      const result = await prisma.promptTemplate.create({ data: template });
      console.log('✅ Created template:', template.name, 'ID:', result.id);
    } catch (error) {
      console.error('❌ Failed to create template:', template.name, error.message);
    }
  }

  const finalCount = await prisma.promptTemplate.count();
  console.log('Total templates in database:', finalCount);
  
  await prisma.$disconnect();
}

testSeed().catch(console.error);
