import { db } from "../src/config/database.js";
import { createManualSpb } from "../src/services/manual-spb.service.js";

async function test() {
  console.log("Starting test-create-spb...");
  try {
    const requestedBy = "TEST USER";
    const reason = "Diagnostic test";
    const items = [
      { materialName: "TEST MATERIAL", qtyPallets: 1, qtyPcs: 100 }
    ];

    console.log("Calling createManualSpb...");
    const spb = await createManualSpb(requestedBy, reason, items);
    console.log("SPB Created Successfully:", spb.spbNumber);
  } catch (err) {
    console.error("FAILED to create SPB:");
    console.error(err);
  } finally {
    await db.$disconnect();
  }
}

test();
