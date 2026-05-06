import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  console.log("Analyzing BOM components for backfilling mappings...");
  
  const boms = await db.bomComponent.findMany({ select: { line: true, skuId: true } });
  
  let added = 0;
  for (const b of boms) {
    if (!b.line || !b.skuId) continue;
    
    const existing = await db.lineSkuMapping.findFirst({
      where: { skuId: b.skuId, line: b.line }
    });
    
    if (!existing) {
      await db.lineSkuMapping.create({
        data: { skuId: b.skuId, line: b.line }
      });
      added++;
    }
  }

  console.log(`Found and added ${added} mappings from BOM configurations.`);
}

run()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
