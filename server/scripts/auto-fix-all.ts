import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const materials = [
    'KARTON ABC SUSU 12 X 10 X 30 (R3)',
    'OPP WARNA 48 X 500 X 10',
    'PLASTIK ABC SUSU 30 GR (R3)',
    'TULIP PUTIH 48MM X 500M'
  ];

  console.log('=== FIXING SELISIH SECARA OTOMATIS ===');

  const blocks = await db.blockLayout.findMany({ include: { blockRows: true } });
  const liveStock = await db.transitStockLive.findMany();
  const now = new Date();

  for (const mat of materials) {
    const bom = await db.bomComponent.findFirst({ where: { materialName: mat } });
    const uom = bom ? bom.uom : 'PCS';

    for (const block of blocks) {
      const mutations = await db.stockMutation.findMany({
        where: { materialName: mat, blockId: block.id }
      });

      let bookBalance = 0;
      mutations.forEach(m => {
        const q = parseFloat(m.qty as any) || 0;
        if (m.type === 'IN' || m.type === 'ADJUST') bookBalance += q;
        else if (m.type === 'OUT') bookBalance -= Math.abs(q);
      });

      const blockLive = liveStock.filter(l => l.blockRowId && block.blockRows.some(r => r.id === l.blockRowId) && l.materialName === mat);
      const actualStock = blockLive.reduce((sum, l) => sum + parseFloat(l.pcs as any || '0'), 0);

      const selisih = bookBalance - actualStock;

      if (Math.abs(selisih) > 0.1) {
        console.log(`[FIX] Material: ${mat} | Blok: ${block.blockNumber} | Selisih: ${selisih}. Creating ADJUST of ${-selisih}...`);
        
        await db.stockMutation.create({
          data: {
            date: now,
            time: now,
            type: 'ADJUST',
            source: 'RECONCILIATION',
            materialName: mat,
            qty: -selisih,
            uom: uom,
            blockId: block.id,
            line: 'SYSTEM RECONCILE',
            createdAt: now
          }
        });
      }
    }
  }
  console.log('✅ Fix automation completed successfully.');
}

main().catch(console.error).finally(() => db.$disconnect());
