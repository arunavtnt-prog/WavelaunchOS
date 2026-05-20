import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const blueprint = await prisma.blueprint.findFirst({
    where: {
      application: {
        fullName: { contains: 'Cody' }
      }
    },
    include: {
      application: {
        select: {
          fullName: true,
          email: true,
        }
      },
      researchStages: {
        select: {
          stage: true,
          status: true,
          markdown: true,
        }
      }
    }
  });

  if (!blueprint) {
    console.log('No blueprint found for Cody');
    await prisma.$disconnect();
    return;
  }

  console.log('Blueprint for:', blueprint.application.fullName);
  console.log('Status:', blueprint.status);
  console.log('Progress:', blueprint.progress);
  console.log('Current Batch:', blueprint.currentBatch);
  console.log('Has Markdown:', blueprint.markdown !== null && blueprint.markdown !== undefined);
  console.log('Markdown Length:', blueprint.markdown?.length || 0);
  console.log('PDF Path:', blueprint.pdfPath || 'None');
  console.log('');
  console.log('Research Stages:');
  for (const s of blueprint.researchStages) {
    const mdLen = s.markdown?.length || 0;
    console.log(`  ${s.stage}: ${s.status}, markdown: ${mdLen} chars`);
  }

  await prisma.$disconnect();
}

check().catch(console.error);
