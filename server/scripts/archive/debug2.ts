import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const pending = await db.pendingReturn.findMany();
  console.log('Pending Returns:', pending);
  const lineBc = await db.lineBarcode.findMany();
  console.log('Line Barcodes:', lineBc);
  const transitOut = await db.transitOutboundPending.findMany();
  console.log('Transit Outbound:', transitOut);
}
main().catch(console.error).finally(() => db.$disconnect());
