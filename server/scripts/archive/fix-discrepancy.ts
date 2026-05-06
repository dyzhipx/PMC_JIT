import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const matName = 'KARTON ABC SUSU 12 X 10 X 30 (R3)';
  const now = new Date();
  
  const adjustments = [
    { blockId: '10b70e6f-ff85-4625-b971-f2d39de915b1', qty: -1250, label: 'Blok 1' },
    { blockId: '47931cd3-3dd2-4165-9ada-70dc328a898a', qty: 1250, label: 'Blok 12' }
  ];

  console.log(`=== EXECUTING DATA FIX FOR: ${matName} ===`);

  for (const adj of adjustments) {
    console.log(`Adjusting ${adj.label} by ${adj.qty}...`);

    await db.stockMutation.create({
      data: {
        date: now,
        time: now,
        type: 'ADJUST',
        source: 'SYSTEM_FIX',
        materialName: matName,
        qty: adj.qty,
        uom: 'PCS',
        blockId: adj.blockId,
        line: 'RECONCILIATION',
        createdAt: now
      }
    });
  }

  console.log('✅ Adjustments created successfully.');
}

main().catch(console.error).finally(() => db.$disconnect());
