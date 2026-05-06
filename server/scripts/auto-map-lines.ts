import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  console.log("Analyzing schedules for automatic mapping...");
  const schedules = await db.schedule.findMany({ select: { line: true, skuId: true } });
  
  const mappings = new Set();
  const pairs: {skuId: string, line: string}[] = [];

  for (const s of schedules) {
    if (!s.line || !s.skuId) continue;
    const key = `${s.skuId}||${s.line}`;
    if (!mappings.has(key)) {
      mappings.add(key);
      pairs.push({ skuId: s.skuId, line: s.line });
    }
  }

  console.log(`Found ${pairs.length} unique Line-SKU combinations from active schedules.`);

  let added = 0;
  for (const p of pairs) {
    // Check if mapping already exists
    const existing = await db.lineSkuMapping.findFirst({
      where: { skuId: p.skuId, line: p.line }
    });
    if (!existing) {
      await db.lineSkuMapping.create({
        data: { skuId: p.skuId, line: p.line }
      });
      added++;
    }
  }

  console.log(`Successfully added ${added} new mappings to the database.`);
}

run()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
