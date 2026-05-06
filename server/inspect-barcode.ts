import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const barcode = "00112";
  
  console.log("--- Transit Inventory ---");
  const ti = await prisma.transitInventory.findMany({ where: { barcode }});
  console.log(ti);

  console.log("--- Line Barcodes ---");
  const lb = await prisma.lineBarcode.findMany({ where: { barcode }});
  console.log(lb);

  console.log("--- Pending Returns ---");
  const pr = await prisma.pendingReturn.findMany({ where: { barcode }});
  console.log(pr);

  console.log("--- Stock Mutations (Recent 5 for this barcode) ---");
  const sm = await prisma.stockMutation.findMany({ where: { barcode }, take: 5, orderBy: { createdAt: 'desc' } });
  console.log(sm);
  
}

main().catch(console.error).finally(() => prisma.$disconnect());
