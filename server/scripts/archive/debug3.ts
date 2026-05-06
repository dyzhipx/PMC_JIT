import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const inv = await db.transitInventory.findMany({ where: { barcode: '00001' } });
  console.log('Transit Inventory 00001:', inv);
}
main().catch(console.error).finally(() => db.$disconnect());
