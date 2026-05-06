import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function fixSupplier() {
  const transits = await db.transitInventory.findMany({ where: { supplier: "-" } });
  let count = 0;
  for (const t of transits) {
    if (t.barcode && t.barcode !== "-") {
      // Try WMS first
      let wms = await db.warehouseInventory.findFirst({ where: { barcode: t.barcode } });
      if (wms && wms.supplierName) {
        await db.transitInventory.update({
          where: { id: t.id },
          data: { supplier: wms.supplierName }
        });
        count++;
        continue;
      }

      // Try Delivery Scans
      let scan = await db.deliveryScan.findFirst({ where: { barcode: t.barcode } });
      if (scan && scan.supplier && scan.supplier !== "-") {
        await db.transitInventory.update({
          where: { id: t.id },
          data: { supplier: scan.supplier }
        });
        count++;
      }
    }
  }
  console.log(`Updated ${count} transit items with missing supplier`);
  await db.$disconnect();
}

fixSupplier();
