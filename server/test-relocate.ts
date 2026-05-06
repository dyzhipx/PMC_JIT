import { PrismaClient } from '@prisma/client';
import { relocateTransitPallet } from './src/services/transit.service.js';

const db = new PrismaClient();

async function main() {
  try {
    // Find a random barcode in transit to relocate
    const firstInv = await db.transitInventory.findFirst({
        where: { NOT: { blockRowId: null } }
    });
    if (!firstInv) {
        console.log("No valid inventory to test");
        return;
    }
    const otherRow = await db.blockRow.findFirst({
        where: { id: { not: firstInv.blockRowId! } }
    });
    console.log(`Relocating ${firstInv.barcode} to ${otherRow!.id}`);
    
    const result = await relocateTransitPallet(firstInv.barcode, otherRow!.id, 'System');
    console.log("Result:", result);
  } catch (err: any) {
    console.error("Error occurred:", err.message);
  } finally {
    await db.$disconnect();
  }
}

main();
