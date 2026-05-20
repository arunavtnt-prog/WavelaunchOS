import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function fixBlueprint() {
  const blueprintId = 'cml0bo3gc0001bpc9xkjpyuel';

  // Check if research stages exist
  const existingStages = await prisma.blueprintResearch.count({
    where: { blueprintId },
  });

  console.log('Existing research stages:', existingStages);

  if (existingStages === 0) {
    console.log('Creating missing research stages...');

    const stages = [
      // Batch 1
      { stage: 'MARKET_SIZING', batch: 1 },
      { stage: 'COMPETITIVE_INTELLIGENCE', batch: 1 },
      { stage: 'INDUSTRY_TRENDS', batch: 1 },
      // Batch 2
      { stage: 'AUDIENCE_DEEP_DIVE', batch: 2 },
      { stage: 'BRAND_POSITIONING', batch: 2 },
      // Batch 3
      { stage: 'PRODUCT_ARCHITECTURE', batch: 3 },
      { stage: 'FINANCIAL_PROJECTIONS', batch: 3 },
      // Batch 4
      { stage: 'GO_TO_MARKET', batch: 4 },
      { stage: 'OPERATIONAL_FRAMEWORK', batch: 4 },
      { stage: 'IMPLEMENTATION_ROADMAP', batch: 4 },
      // Batch 5
      { stage: 'EXECUTIVE_SUMMARY', batch: 5 },
      { stage: 'COMPILATION', batch: 5 },
    ];

    for (const stage of stages) {
      await prisma.blueprintResearch.create({
        data: {
          blueprintId,
          stage: stage.stage as any,
          batch: stage.batch,
          status: 'PENDING',
        },
      });
      console.log(`Created: ${stage.stage}`);
    }

    console.log('✅ All research stages created!');
  } else {
    console.log('✅ Research stages already exist');
  }
}

fixBlueprint()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
