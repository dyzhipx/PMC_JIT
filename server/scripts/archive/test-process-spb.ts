import { processSpbItem } from "../src/services/manual-spb.service.js";
import { db } from "../src/config/database.js";

async function test() {
  console.log("Starting test-process-spb...");
  try {
    const spbNumber = 'SPB-MNL-20260416-021';
    const barcode = 'TEST-BARCODE-001';
    const material = 'TEST MATERIAL';

    // Get item ID
    const spb = await db.manualSpb.findUnique({
      where: { spbNumber },
      include: { items: true }
    });

    if (!spb || spb.items.length === 0) {
      throw new Error("Target SPB not found");
    }

    const item = spb.items.find(i => i.materialName === material);
    if (!item) throw new Error("Item not found in SPB");

    console.log(`Processing Item ID: ${item.id} with Barcode: ${barcode}`);

    const result = await processSpbItem(
      item.id,
      barcode,
      100, // pcs
      "TEST SUPPLIER"
    );

    console.log("Processing Result:", JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log("SUCCESS: Item processed correctly");
    } else {
      console.error("FAILED: Processing returned success=false");
    }

  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await db.$disconnect();
  }
}

test();
