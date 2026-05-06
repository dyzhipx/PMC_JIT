import { createManualSpb, processSpbItem } from './src/services/manual-spb.service.js';
import { db } from './src/config/database.js';

async function main() {
  try {
    const spb = await createManualSpb("TestingUser", "Emergency", [
      { materialName: "Material B", qtyPallets: 1, qtyPcs: 10 }
    ]);
    console.log("SPB Created:", spb.spbNumber);
    const item = spb.items[0];

    // let's create a warehouse inventory first to be able to consume
    const barcode = "BARCODE-" + Date.now();
    await db.warehouseInventory.create({
      data: {
        mid: "MID-" + Date.now(),
        barcode,
        materialName: "Material B",
        palletsAvailable: 1,
        qtyPerPallet: 10,
        dateIn: new Date(),
        timeIn: new Date()
      }
    });

    const result = await processSpbItem(item.id, barcode, 10, "Supplier X");
    console.log("Process Result:", result);

  } catch (err: any) {
    console.error("Error expected:", err.message);
  }
}
main();
