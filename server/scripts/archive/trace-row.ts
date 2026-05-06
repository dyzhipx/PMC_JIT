import { db } from "../src/config/database.js";
import { transitStockLive, transitInventory, stockMutations, stockCheckEntries, stockChecks } from "../src/db/schema/index.js";
import { eq, and, sql } from "drizzle-orm";

const ROW_ID = "2624174e-0e0a-4c3e-9316-a66adc1c976a";

console.log("============================================");
console.log("INVESTIGASI ROW 2624174e (KARTON - 833 PCS)");
console.log("============================================\n");

// 1. Current live state
const [live] = await db.select().from(transitStockLive).where(eq(transitStockLive.blockRowId, ROW_ID));
console.log("1. STATUS SAAT INI (transit_stock_live):");
if (live) {
  console.log(`   Material  : ${live.materialName}`);
  console.log(`   Pallets   : ${live.qtyPallets}`);
  console.log(`   PCS       : ${live.pcs}`);
  console.log(`   Updated   : ${live.updatedAt}`);
} else {
  console.log("   TIDAK ADA DATA");
}

// 2. All mutations for this row
console.log("\n2. RIWAYAT MUTASI untuk Row ini:");
const muts = await db.select().from(stockMutations).where(eq(stockMutations.blockRowId, ROW_ID));
if (muts.length === 0) {
  console.log("   TIDAK ADA MUTASI untuk Row ini!");
} else {
  let balance = 0;
  for (const m of muts) {
    const q = parseFloat(String(m.qty || "0"));
    if (m.type === "IN") balance += q;
    else if (m.type === "OUT") balance -= Math.abs(q);
    else if (m.type === "ADJUST") balance += q;
    console.log(`   ${m.date} ${m.time} | ${m.type.padEnd(6)} | qty=${String(q).padStart(8)} | ${m.line} | RunBal=${balance}`);
  }
  console.log(`   Running Balance = ${balance}`);
}

// 3. Stock check entries for this row
console.log("\n3. STOCK CHECK ENTRIES untuk Row ini:");
const checkEntries = await db.select().from(stockCheckEntries).where(eq(stockCheckEntries.blockRowId, ROW_ID));
if (checkEntries.length === 0) {
  console.log("   TIDAK ADA STOCK CHECK");
} else {
  for (const e of checkEntries) {
    console.log(`   CheckID: ${e.stockCheckId} | PalletIdx: ${e.palletIndex} | Qty: ${e.quantity}`);
  }
}

// 4. Inventory (barcodes) for this row
console.log("\n4. BARCODE INVENTORY untuk Row ini:");
const inv = await db.select().from(transitInventory).where(eq(transitInventory.blockRowId, ROW_ID));
if (inv.length === 0) {
  console.log("   TIDAK ADA BARCODE");
} else {
  for (const i of inv) {
    console.log(`   Barcode: ${i.barcode} | Pallets: ${i.palletsAvailable} | Supplier: ${i.supplier} | DateIn: ${i.dateInTransit} ${i.timeInTransit}`);
  }
}

// 5. Check ALL rows for this block to see if 833 came from splitting
console.log("\n5. SEMUA ROW KARTON di transit_stock_live:");
const allKarton = await db.select().from(transitStockLive).where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
for (const k of allKarton) {
  const pcsPerPallet = k.qtyPallets > 0 ? (parseFloat(String(k.pcs || "0")) / k.qtyPallets) : 0;
  console.log(`   Row ${k.blockRowId}: ${k.qtyPallets} pallet, ${k.pcs} PCS (${Math.round(pcsPerPallet)} PCS/pallet)`);
}

// 6. Origin analysis
console.log("\n6. ANALISIS ASAL 833:");
console.log("   833.33 ≈ 2500 / 3 (pembagian rata 2500 PCS ke 3 pallet)");
console.log("   833.33 ≈ 5000 / 6 (pembagian rata 5000 PCS ke 6 pallet)");  
console.log("   1250 / 1.5 = 833.33");
console.log("   Kemungkinan besar: ketika ada 3 pallet dengan total 2500 PCS,");
console.log("   lalu 2 pallet ditarik, sisa 1 pallet dengan 833 PCS (2500/3)");

process.exit(0);
