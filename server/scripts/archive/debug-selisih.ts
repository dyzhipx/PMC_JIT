import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log('=== ANALISIS SELISIH PER BLOK (FIXED SCHEMA) ===');
  
  const materials = await db.stockMutation.findMany({ select: { materialName: true }, distinct: ['materialName'] });
  const blocks = await db.blockLayout.findMany({ include: { blockRows: true } });
  
  // Get Live Stock
  const liveStock = await db.transitStockLive.findMany();
  
  for (const mObj of materials) {
    const matName = mObj.materialName!;
    if (!matName) continue;

    for (const block of blocks) {
      // 1. Calculate Book Balance for this Block/Material
      const mutations = await db.stockMutation.findMany({
        where: { materialName: matName, blockId: block.id }
      });

      let bookBalance = 0;
      mutations.forEach(m => {
        const q = parseFloat(m.qty as any) || 0;
        if (m.type === 'IN' || m.type === 'ADJUST') bookBalance += q;
        else if (m.type === 'OUT') bookBalance -= Math.abs(q);
      });

      // 2. Get Actual Live Stock for this Block/Material
      const blockLive = liveStock.filter(l => l.blockRowId && block.blockRows.some(r => r.id === l.blockRowId) && l.materialName === matName);
      const actualStock = blockLive.reduce((sum, l) => sum + parseFloat(l.pcs as any || '0'), 0);

      const selisih = bookBalance - actualStock;

      if (Math.abs(selisih) > 0.1) {
        console.log(`\n[!] DISCREPANCY DETECTED:`);
        console.log(`    Material: ${matName}`);
        console.log(`    Block: ${block.blockNumber} (ID: ${block.id})`);
        console.log(`    Book Balance: ${bookBalance}`);
        console.log(`    Actual Stock: ${actualStock}`);
        console.log(`    SELISIH: ${selisih}`);
      }
    }
  }
}

main().catch(console.error).finally(() => db.$disconnect());
