import { db } from "../src/config/database.js";
import { transitStockLive, transitInventory } from "../src/db/schema/index.js";

async function main() {
  const live = await db.select().from(transitStockLive);
  const inv = await db.select().from(transitInventory);

  console.log("--- STOCK SUMMARY ---");
  live.forEach(l => {
    const barcodes = inv.filter(i => i.blockRowId === l.blockRowId && i.materialName === l.materialName);
    console.log(`Row ${l.blockRowId} (${l.materialName}):`);
    console.log(`  Live Pallets: ${l.qtyPallets}`);
    console.log(`  Inventory Barcodes found: ${barcodes.length}`);
    if (barcodes.length < l.qtyPallets) {
      console.log(`  ❌ DISCREPANCY: Missing ${l.qtyPallets - barcodes.length} barcodes!`);
    }
  });

  process.exit(0);
}

main().catch(console.error);
