import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function checkLiveStock(materialName: string) {
  const live = await db.transitStockLive.findMany({ where: { materialName } });
  console.log(`\n--- TransitStockLive ---`);
  console.log(JSON.stringify(live, null, 2));
  await db.$disconnect();
}

checkLiveStock("KARTON ABC SUSU 12 X 10 X 30 (R3)").catch(console.error);
