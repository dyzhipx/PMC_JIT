import { createManualSpb, processSpbItem } from './src/services/manual-spb.service.js';
import { db } from './src/config/database.js';

async function main() {
  try {
    // exact payload mimicking frontend
    const reqBody = {
      requestedBy: "Test UI",
      reason: "Emergency",
      items: [
        { materialName: "Material X", qtyPallets: 1, qtyPcs: null } // mimicking empty pcs
      ]
    };

    console.log("Creating SPB...");
    const spb = await createManualSpb(
        reqBody.requestedBy, 
        reqBody.reason, 
        reqBody.items
    );
    console.log("Created successfully:", spb.spbNumber);

    const itemId = spb.items[0].id;

    console.log("Processing SPB item...");
    // Mock the same parameters from frontend scan process
    const processReq = {
      barcode: "-",
      pcs: 10,
      supplier: "-"
    };

    const res = await processSpbItem(
        itemId,
        processReq.barcode,
        processReq.pcs,
        processReq.supplier
    );
    console.log("Process result:", res);

  } catch (err: any) {
    console.error("Test failed:", err.message);
  }
}
main();
