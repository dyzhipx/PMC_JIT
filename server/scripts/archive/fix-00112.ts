import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const barcode = "00112";
  const line = "Produksi Line A";
  const material = "PLASTIK ABC SUSU 30 GR (R3)";
  const wrongPcs = 1250;
  const correctPcs = 72;
  const diffPcs = wrongPcs - correctPcs; // 1178

  await prisma.$transaction(async (tx) => {
    // 1. Delete Line Barcode
    const lb = await tx.lineBarcode.findFirst({ where: { barcode, materialName: material } });
    if (lb) {
      await tx.lineBarcode.delete({ where: { id: lb.id } });
      console.log("Deleted Line Barcode.");
    }

    // 2. Reduce Line Stock
    const ls = await tx.lineStock.findFirst({ where: { line, materialName: material } });
    if (ls) {
      const newPcs = Math.max(0, parseFloat(String(ls.pcs || "0")) - wrongPcs);
      const newQty = Math.max(0, ls.qtyPallets - 1);
      
      if (newQty === 0 && newPcs === 0) {
        await tx.lineStock.delete({ where: { id: ls.id } });
        console.log("Deleted Line Stock (empty).");
      } else {
        await tx.lineStock.update({ 
          where: { id: ls.id }, 
          data: { qtyPallets: newQty, pcs: String(newPcs) } 
        });
        console.log(`Updated Line Stock to ${newQty} pallets, ${newPcs} pcs.`);
      }
    }

    // 3. Find block mapping from the original scan OUT mutation
    const mutOut = await tx.stockMutation.findFirst({
      where: { barcode, type: "OUT", line: "Produksi Line A" },
      orderBy: { createdAt: "desc" }
    });

    if (!mutOut || !mutOut.blockId || !mutOut.blockRowId) {
       throw new Error("Could not find original OUT mutation with blockRow mapping.");
    }

    // 4. Update Transit Stock Live back by 1250 (72 return + 1178 adjustment)
    const tsl = await tx.transitStockLive.findFirst({ where: { blockRowId: mutOut.blockRowId, materialName: material } });
    if (tsl) {
       await tx.transitStockLive.update({
         where: { id: tsl.id },
         data: {
           qtyPallets: tsl.qtyPallets + 1,
           pcs: String(parseFloat(String(tsl.pcs || "0")) + wrongPcs)
         }
       });
       console.log(`Restored ${wrongPcs} pcs to TransitStockLive.`);
    }

    // 5. Recreate Transit Inventory for the barcode
    await tx.transitInventory.create({
      data: {
        materialName: material,
        barcode,
        mid: "-",
        dateInGudang: new Date(),
        dateInTransit: new Date(),
        timeInTransit: new Date(),
        palletsAvailable: 1,
        supplier: lb?.supplier || "-",
        blockId: mutOut.blockId,
        blockRowId: mutOut.blockRowId
      }
    });
    console.log("Recreated Transit Inventory.");

    // 6. Record Mutations to maintain audit trail
    // A) IN from Line (Return) but only 72
    await tx.stockMutation.create({
      data: {
        date: new Date(),
        time: new Date(),
        type: "IN",
        materialName: material,
        qty: String(correctPcs),
        uom: mutOut.uom,
        line: "Line A -> Transit (Retur)",
        skuId: "-",
        barcode,
        blockId: mutOut.blockId,
        blockRowId: mutOut.blockRowId
      }
    });

    // B) ADJUST the difference 1178
    await tx.stockMutation.create({
      data: {
        date: new Date(),
        time: new Date(),
        type: "ADJUST",
        materialName: material,
        qty: String(diffPcs), // +1178
        uom: mutOut.uom,
        line: "Koreksi Salah Scan Qty",
        skuId: "-",
        barcode: "ADJUST",
        blockId: mutOut.blockId,
        blockRowId: mutOut.blockRowId
      }
    });

    console.log("Mutation audit trail written.");
  });
}

main().then(() => console.log("Done")).catch(console.error).finally(() => prisma.$disconnect());
