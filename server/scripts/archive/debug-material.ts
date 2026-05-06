import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function checkMaterial(materialName: string) {
  console.log(`Checking data for: ${materialName}`);
  
  const transitInv = await db.transitInventory.findMany({ where: { materialName } });
  console.log(`\n--- TransitInventory ---`);
  console.log(JSON.stringify(transitInv, null, 2));

  const lineStock = await db.lineStock.findMany({ where: { materialName } });
  console.log(`\n--- LineStock ---`);
  console.log(JSON.stringify(lineStock, null, 2));

  const lineBarcode = await db.lineBarcode.findMany({ where: { materialName } });
  console.log(`\n--- LineBarcode ---`);
  console.log(JSON.stringify(lineBarcode, null, 2));

  const mutations = await db.stockMutation.findMany({ 
    where: { 
      materialName,
      type: 'OUT'
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(`\n--- StockMutation (OUT) ---`);
  console.log(JSON.stringify(mutations, null, 2));

  await db.$disconnect();
}

const mat = "KARTON ABC SUSU 12 X 10 X 30 (R3)";
checkMaterial(mat).catch(console.error);
