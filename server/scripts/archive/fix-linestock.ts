import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const lineStock = await prisma.lineStock.findFirst({ 
    where: { line: 'A', materialName: 'PLASTIK ABC SUSU 30 GR (R3)' } 
  });
  console.log("Line A Stock:", lineStock);

  if (lineStock) {
    const wrongPcs = 1250;
    const newPcs = Math.max(0, parseFloat(String(lineStock.pcs || "0")) - wrongPcs);
    const newQty = Math.max(0, lineStock.qtyPallets - 1);
    
    if (newQty === 0 && newPcs === 0) {
      await prisma.lineStock.delete({ where: { id: lineStock.id } });
      console.log("Deleted Line Stock (empty).");
    } else {
      await prisma.lineStock.update({ 
        where: { id: lineStock.id }, 
        data: { qtyPallets: newQty, pcs: String(newPcs) } 
      });
      console.log(`Updated Line Stock to ${newQty} pallets, ${newPcs} pcs.`);
    }
  }
}
check().finally(() => prisma.$disconnect());
