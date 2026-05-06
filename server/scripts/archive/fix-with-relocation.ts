import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const matName = 'KARTON ABC SUSU 12 X 10 X 30 (R3)';
  const now = new Date();
  
  // Identifying the movement
  const sourceBlockId = '10b70e6f-ff85-4625-b971-f2d39de915b1'; // Blok 1
  const targetBlockId = '47931cd3-3dd2-4165-9ada-70dc328a898a'; // Blok 12
  const qty = 1250;

  console.log(`=== RECORDING LATE RELOCATION FOR: ${matName} ===`);
  console.log(`Moving ${qty} PCS from Blok 1 to Blok 12...`);

  // 1. Mutation OUT from source
  await db.stockMutation.create({
    data: {
      date: now,
      time: now,
      type: 'OUT',
      source: 'RELOKASI',
      materialName: matName,
      qty: qty,
      uom: 'PCS',
      blockId: sourceBlockId,
      line: 'INTERNAL TRANSFER',
      createdAt: now
    }
  });

  // 2. Mutation IN to target
  await db.stockMutation.create({
    data: {
      date: now,
      time: now,
      type: 'IN',
      source: 'RELOKASI',
      materialName: matName,
      qty: qty,
      uom: 'PCS',
      blockId: targetBlockId,
      line: 'INTERNAL TRANSFER',
      createdAt: now
    }
  });

  console.log('✅ Relocation mutations created successfully.');
}

main().catch(console.error).finally(() => db.$disconnect());
