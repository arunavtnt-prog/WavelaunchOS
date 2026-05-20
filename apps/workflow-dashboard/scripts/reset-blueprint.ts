import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function resetBlueprint() {
  const blueprintId = 'cml0bo3gc0001bpc9xkjpyuel';

  console.log('Resetting blueprint stages...');

  // Reset all stages to PENDING
  const result = await prisma.blueprintResearch.updateMany({
    where: {
      blueprintId,
      status: { in: ['FAILED', 'IN_PROGRESS'] },
    },
    data: {
      status: 'PENDING',
      error: null,
      response: null,
      markdown: null,
      prompt: null,
      startedAt: null,
      completedAt: null,
    },
  });

  console.log(`✅ Reset ${result.count} stages to PENDING`);

  // Reset blueprint progress
  await prisma.blueprint.update({
    where: { id: blueprintId },
    data: {
      status: 'PENDING',
      progress: 0,
      currentBatch: 1,
    },
  });

  console.log('✅ Reset blueprint to PENDING');
}

resetBlueprint()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
