import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const d1 = await db.stockMutation.deleteMany({
    where: {
      OR: [
        { source: 'SYSTEM_FIX' },
        { source: 'STOCK_CHECK', createdAt: { gte: new Date('2026-04-15T00:00:00Z') } }
      ]
    }
  });
  console.log(`Successfully reverted ${d1.count} mutations.`);
}

main().catch(console.error).finally(() => db.$disconnect());
