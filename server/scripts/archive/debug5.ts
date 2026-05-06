import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const pending = await db.pendingReturn.findMany({ where: { barcode: '00003' } });
  console.log('Pending:', pending);
  const lineBc = await db.lineBarcode.findMany({ where: { barcode: '00003' } });
  console.log('Line Barcodes:', lineBc);
  const transitInv = await db.transitInventory.findMany({ where: { barcode: '00003' } });
  console.log('Transit Inventory:', transitInv);
}
main().catch(console.error).finally(() => db.$disconnect());
