import { db } from "../src/config/database.js";
import { stockMutations } from "../src/db/schema/index.js";
import { eq, and } from "drizzle-orm";

// ==================================================
// FIX: OUT records that used wrong average calculation
// The actual user input for each withdrawal was 1250 PCS
// ==================================================

// Fix OUT #1: 833 -> 1250
await db.update(stockMutations)
  .set({ qty: "1250" })
  .where(eq(stockMutations.id, "8b1120f5-6ed8-4f04-a5ca-9095527fc826"));
console.log("✅ Fixed OUT #1: 833 -> 1250");

// Fix OUT #3: 833 -> 1250
await db.update(stockMutations)
  .set({ qty: "1250" })
  .where(eq(stockMutations.id, "75504484-bc5b-47b7-8a22-b7733893d184"));
console.log("✅ Fixed OUT #3: 833 -> 1250");

// Delete the old ADJUST records (they were compensating for wrong data)
await db.delete(stockMutations)
  .where(eq(stockMutations.id, "3fc98777-fefe-4420-bc29-1bed4aad045b"));
console.log("✅ Deleted old Clean Recon ADJUST");

await db.delete(stockMutations)
  .where(eq(stockMutations.id, "729616ed-c3d9-4588-adb6-4c109cfa355c"));
console.log("✅ Deleted old Stock Check ADJUST from Apr 6");

// Verify final state
const all = await db.select().from(stockMutations)
  .where(eq(stockMutations.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));

let totalIn = 0, totalOut = 0, totalAdj = 0;
for (const r of all) {
  const q = Math.round(parseFloat(r.qty || "0"));
  if (r.type === "IN") totalIn += q;
  else if (r.type === "OUT") totalOut += Math.abs(q);
  else if (r.type === "ADJUST") totalAdj += q;
  console.log(`  ${r.type} | ${q} | ${r.line}`);
}

const balance = totalIn - totalOut + totalAdj;
console.log(`\n📊 FINAL: IN=${totalIn}, OUT=${totalOut}, ADJ=${totalAdj}, Balance=${balance}`);
console.log(`   Expected actual stock = 4583`);

// If balance != actual, we need one final correction ADJUST
import { transitStockLive } from "../src/db/schema/index.js";
const live = await db.select().from(transitStockLive)
  .where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
const actualPcs = live.reduce((s, l) => s + Math.round(parseFloat(String(l.pcs || "0"))), 0);
console.log(`   Actual physical PCS = ${actualPcs}`);

const delta = actualPcs - balance;
if (Math.abs(delta) > 0) {
  console.log(`   Need ADJUST = ${delta}`);
  await db.insert(stockMutations).values({
    date: "2026-04-07",
    time: "11:20:00",
    type: "ADJUST",
    materialName: "KARTON ABC SUSU 12 X 10 X 30 (R3)",
    qty: String(delta),
    uom: "PCS",
    line: "Koreksi OUT",
    skuId: "-",
    barcode: "-"
  });
  console.log(`   ✅ Inserted final ADJUST = ${delta}`);
} else {
  console.log(`   🎉 Already balanced! No ADJUST needed.`);
}

process.exit(0);
