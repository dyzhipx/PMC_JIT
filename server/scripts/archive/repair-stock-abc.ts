import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function repairStock() {
  const materialName = "KARTON ABC SUSU 12 X 10 X 30 (R3)";
  const barcode = "00001";
  const line = "Produksi Line A";
  const pcs = 1250;
  const supplier = "-";

  console.log(`Starting data repair for ${materialName}...`);

  try {
    await db.$transaction(async (tx) => {
      // 1. Manually upsert LineStock
      const existingLineStock = await tx.lineStock.findFirst({
        where: { line, materialName }
      });

      if (existingLineStock) {
        await tx.lineStock.update({
          where: { id: existingLineStock.id },
          data: {
            qtyPallets: existingLineStock.qtyPallets + 1,
            pcs: String(parseFloat(String(existingLineStock.pcs || "0")) + pcs)
          }
        });
        console.log("Updated existing LineStock.");
      } else {
        await tx.lineStock.create({
          data: { line, materialName, qtyPallets: 1, pcs: String(pcs) }
        });
        console.log("Created new LineStock.");
      }

      // 2. Create LineBarcode
      const today = new Date();
      const timeStr = "02:26:59"; // Based on the mutation record
      await tx.lineBarcode.create({
        data: {
          barcode,
          materialName,
          line,
          pcs: String(pcs),
          supplier,
          dateIn: today,
          timeIn: new Date(`1970-01-01T${timeStr}Z`)
        }
      });
      console.log(`Registered Barcode ${barcode} to ${line}.`);
    });

    console.log("✅ Repair successful. Data is now synchronized.");
  } catch (error) {
    console.error("❌ Repair failed:", error);
  } finally {
    await db.$disconnect();
  }
}

repairStock();
