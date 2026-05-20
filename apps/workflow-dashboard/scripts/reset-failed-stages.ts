/**
 * Utility script to reset FAILED blueprint research stages to PENDING
 * so they can be retried with the improved retry logic.
 *
 * Usage:
 *   npx tsx scripts/reset-failed-stages.ts [blueprintId]
 *
 * If blueprintId is not provided, resets ALL failed stages.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetFailedStages(blueprintId?: string) {
  const where = blueprintId
    ? {
        status: 'FAILED',
        blueprintId,
      }
    : {
        status: 'FAILED',
      };

  const failedStages = await prisma.blueprintResearch.findMany({
    where,
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

  if (failedStages.length === 0) {
    console.log('No FAILED stages found to reset.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${failedStages.length} FAILED stages to reset:\n`);

  // Group by blueprint
  const byBlueprint = new Map<string, typeof failedStages>();
  for (const stage of failedStages) {
    if (!byBlueprint.has(stage.blueprintId)) {
      byBlueprint.set(stage.blueprintId, []);
    }
    byBlueprint.get(stage.blueprintId)!.push(stage);
  }

  for (const [bpId, stages] of byBlueprint) {
    const blueprint = stages[0].blueprint;
    console.log(`Blueprint: ${blueprint.application.fullName} (${blueprint.application.email})`);
    console.log(`  Stages: ${stages.map(s => `${s.stage} (Batch ${s.batch})`).join(', ')}`);
    console.log(`  Error types: ${[...new Set(stages.map(s => s.error?.split(':')[0]?.trim() || 'Unknown'))].join(', ')}`);
    console.log('');
  }

  // Reset the stages
  console.log('Resetting stages to PENDING...\n');

  for (const stage of failedStages) {
    await prisma.blueprintResearch.update({
      where: { id: stage.id },
      data: {
        status: 'PENDING',
        prompt: null,
        response: null,
        markdown: null,
        error: null,
        startedAt: null,
        completedAt: null,
        attempts: 0, // Reset attempts counter
      },
    });
  }

  console.log(`Reset ${failedStages.length} stages to PENDING.`);

  // Update blueprint status if needed
  for (const [bpId, stages] of byBlueprint) {
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: bpId },
      include: {
        researchStages: {
          select: { status: true },
        },
      },
    });

    if (!blueprint) continue;

    const allStages = blueprint.researchStages;
    const pending = allStages.filter(s => s.status === 'PENDING').length;
    const complete = allStages.filter(s => s.status === 'COMPLETE').length;
    const failed = allStages.filter(s => s.status === 'FAILED').length;

    console.log(`Blueprint ${bpId}: ${complete} complete, ${pending} pending, ${failed} failed`);

    // If blueprint was stuck in REVIEW_REQUIRED or COMPLETE but has failed stages, reset to IN_PROGRESS
    if ((blueprint.status === 'REVIEW_REQUIRED' || blueprint.status === 'COMPLETE') && pending > 0) {
      await prisma.blueprint.update({
        where: { id: bpId },
        data: {
          status: 'IN_PROGRESS',
          currentBatch: Math.min(...stages.map(s => s.batch)),
        },
      });
      console.log(`  -> Reset blueprint status to IN_PROGRESS, current batch to ${Math.min(...stages.map(s => s.batch))}`);
    }
  }

  console.log('\nDone! You can now retry generating the blueprint.');
  await prisma.$disconnect();
}

const blueprintId = process.argv[2];
resetFailedStages(blueprintId).catch(console.error);
