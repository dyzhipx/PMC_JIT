import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function listCurrentLines() {
  const mappings = await db.lineSkuMapping.findMany({
    select: { line: true },
    distinct: ['line']
  });
  console.log('--- Unique Lines in LineSkuMapping ---');
  console.log(mappings.map(m => m.line));
  
  const bom = await db.bomComponent.findMany({
    select: { line: true },
    distinct: ['line']
  });
  console.log('\n--- Unique Lines in BomComponent ---');
  console.log(bom.map(b => b.line));

  await db.$disconnect();
}

listCurrentLines().catch(console.error);
