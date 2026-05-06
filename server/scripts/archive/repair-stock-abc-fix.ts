import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function fixRepair() {
  const materialName = "KARTON ABC SUSU 12 X 10 X 30 (R3)";
  const oldLineErroneous = "Produksi L";
  const correctLine = "A";
  const barcode = "00001";
  const pcs = 1250;
  const supplier = "-";

  console.log(`Fixing previous repair mistake...`);

  try {
    await db.$transaction(async (tx) => {
      // 1. Delete erroneous LineStock
      await tx.lineStock.deleteMany({
        where: { line: oldLineErroneous, materialName }
      });
      console.log(`Deleted erroneous stock in line: ${oldLineErroneous}`);

      // 2. Delete erroneous LineBarcode
      await tx.lineBarcode.deleteMany({
        where: { line: oldLineErroneous, barcode }
      });
      console.log(`Deleted erroneous barcode in line: ${oldLineErroneous}`);

      // 3. Upsert correct LineStock
      const existingLineStock = await tx.lineStock.findFirst({
        where: { line: correctLine, materialName }
      });

      if (existingLineStock) {
        await tx.lineStock.update({
          where: { id: existingLineStock.id },
          data: {
            qtyPallets: existingLineStock.qtyPallets + 1,
            pcs: String(parseFloat(String(existingLineStock.pcs || "0")) + pcs)
          }
        });
      } else {
        await tx.lineStock.create({
          data: { line: correctLine, materialName, qtyPallets: 1, pcs: String(pcs) }
        });
      }
      console.log(`Corrected stock in line: ${correctLine}`);

      // 4. Create correct LineBarcode
      const today = new Date();
      const timeStr = "02:26:59";
      await tx.lineBarcode.create({
        data: {
          barcode,
          materialName,
          line: correctLine,
          pcs: String(pcs),
          supplier,
          dateIn: today,
          timeIn: new Date(`1970-01-01T${timeStr}Z`)
        }
      });
      console.log(`Corrected barcode in line: ${correctLine}`);
    });

    console.log("✅ Data successfully moved to the correct line (A).");
  } catch (error) {
    console.error("❌ Correction failed:", error);
  } finally {
    await db.$disconnect();
  }
}

fixRepair();
