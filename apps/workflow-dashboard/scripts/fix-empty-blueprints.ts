/**
 * Utility script to identify and fix Blueprint research stages
 * that are marked COMPLETE but have empty/insufficient markdown content.
 *
 * Usage:
 *   npx tsx scripts/fix-empty-blueprints.ts
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function fixEmptyBlueprints() {
  console.log('Scanning for Blueprint research stages with empty content...\n');

  // Find all research stages marked as COMPLETE
  const completeStages = await prisma.blueprintResearch.findMany({
    where: {
      status: 'COMPLETE',
    },
    include: {
      blueprint: {
        include: {
          application: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  console.log(`Found ${completeStages.length} stages marked as COMPLETE.\n`);

  // Find stages with empty or insufficient markdown
  const emptyStages = completeStages.filter(
    (stage) => !stage.markdown || stage.markdown.trim().length < 50
  );

  console.log(`Found ${emptyStages.length} COMPLETE stages with empty/insufficient content:\n`);

  for (const stage of emptyStages) {
    console.log(`------------------------------------------------`);
    console.log(`Application: ${stage.blueprint.application.fullName} (${stage.blueprint.application.email})`);
    console.log(`Blueprint ID: ${stage.blueprintId}`);
    console.log(`Stage: ${stage.stage} (Batch ${stage.batch})`);
    console.log(`Status: ${stage.status}`);
    console.log(`Markdown length: ${stage.markdown?.length || 0} chars`);
    console.log(`Error: ${stage.error || 'None'}`);
    console.log(`Attempts: ${stage.attempts}`);
    console.log(`Completed at: ${stage.completedAt}`);
  }

  console.log(`\n------------------------------------------------`);
  console.log(`Summary: ${emptyStages.length} stages need to be reset.\n`);

  if (emptyStages.length === 0) {
    console.log('No issues found. All COMPLETE stages have valid content.');
    return;
  }

  // Group by blueprint
  const affectedBlueprints = new Map<string, typeof emptyStages>();
  for (const stage of emptyStages) {
    if (!affectedBlueprints.has(stage.blueprintId)) {
      affectedBlueprints.set(stage.blueprintId, []);
    }
    affectedBlueprints.get(stage.blueprintId)!.push(stage);
  }

  console.log(`Affected Blueprints: ${affectedBlueprints.size}\n`);

  for (const [blueprintId, stages] of affectedBlueprints) {
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: blueprintId },
      include: {
        application: {
          select: {
            fullName: true,
          },
        },
      },
    });
    console.log(`- ${blueprint?.application.fullName || blueprintId}: ${stages.length} stages`);
    for (const stage of stages) {
      console.log(`  - ${stage.stage} (Batch ${stage.batch})`);
    }
  }

  // Offer to reset the affected stages
  console.log(`\nTo fix these issues, you can either:`);
  console.log(`1. Reset individual stages to PENDING and retry generation`);
  console.log(`2. Reset the entire Blueprint to PENDING`);
  console.log(`\nExample reset query for a single stage:`);
  console.log(`
UPDATE blueprint_research
SET status = 'PENDING',
    markdown = NULL,
    response = NULL,
    error = NULL,
    startedAt = NULL,
    completedAt = NULL
WHERE id = '<stage_id>';
  `);

  await prisma.$disconnect();
}

fixEmptyBlueprints().catch(console.error);
