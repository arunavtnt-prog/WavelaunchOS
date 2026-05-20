import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const stages = await prisma.blueprintResearch.findMany({
    where: {
      blueprint: {
        application: {
          fullName: { contains: 'Cody' }
        }
      }
    },
    select: {
      stage: true,
      status: true,
      markdown: true,
      error: true,
    },
    orderBy: { stage: 'asc' }
  });

  console.log('Stage Content Check:');
  for (const s of stages) {
    const hasContent = s.markdown && s.markdown.length > 100;
    const preview = hasContent ? s.markdown.substring(0, 200).replace(/\n/g, ' ') : 'NO CONTENT';
    console.log(`\n${s.stage} (${s.status}):`);
    console.log(`  Markdown length: ${s.markdown?.length || 0}`);
    console.log(`  Has valid content: ${hasContent}`);
    if (!hasContent) {
      console.log(`  Error: ${s.error || 'None'}`);
    } else {
      console.log(`  Preview: ${preview}...`);
    }
  }

  await prisma.$disconnect();
}

check().catch(console.error);
