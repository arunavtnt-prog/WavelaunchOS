import type { PrismaClient } from '@prisma/client';

export function assertPrismaModel(
  db: PrismaClient,
  modelName: keyof PrismaClient & string
) {
  const anyDb = db as any;
  if (!anyDb || typeof anyDb[modelName] !== 'object') {
    throw new Error(
      `Prisma client is missing model "${modelName}". Restart the dev server and run \`npm run db:push\` (or \`npx prisma generate\`) to regenerate Prisma Client.`
    );
  }
}

