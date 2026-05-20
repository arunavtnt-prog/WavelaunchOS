import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetBlueprintForHonestPrompts() {
  const blueprintId = 'cml0bo3gc0001bpc9xkjpyuel';

  console.log('Resetting blueprint to regenerate with honest prompts...');

  // Reset all COMPLETE stages back to PENDING so they regenerate with new prompts
  const result = await prisma.blueprintResearch.updateMany({
    where: {
      blueprintId,
      status: 'COMPLETE',
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

  // Reset blueprint progress
  await prisma.blueprint.update({
    where: { id: blueprintId },
    data: {
      status: 'PENDING',
      progress: 0,
      currentBatch: 1,
    },
  });

  console.log(`✅ Reset ${result.count} stages to PENDING`);
  console.log('✅ Blueprint reset to batch 1');
  console.log('');
  console.log('New prompts will:');
  console.log('  • NEVER make up data or sources');
  console.log('  • Clearly mark assumptions as "ASSUMPTION: ..."');
  console.log('  • Mark research needs as "RESEARCH NEEDED: ..."');
  console.log('  • Only use real data from AI knowledge');
}

resetBlueprintForHonestPrompts()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
