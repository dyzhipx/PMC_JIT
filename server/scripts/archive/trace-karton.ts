import { db } from "../src/config/database.js";
import { transitStockLive, transitInventory, stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

// 1. Check live stock breakdown per row
const live = await db.select().from(transitStockLive)
  .where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));

console.log("=== TRANSIT STOCK LIVE (Stok Fisik per Baris) ===");
let totalPcs = 0;
for (const l of live) {
  const pcs = Math.round(parseFloat(String(l.pcs || "0")));
  totalPcs += pcs;
  console.log(`  Row ${l.blockRowId}: ${l.qtyPallets} pallet, ${pcs} PCS`);
}
console.log(`  TOTAL = ${totalPcs} PCS\n`);

// 2. Check inventory barcodes
const inv = await db.select().from(transitInventory)
  .where(eq(transitInventory.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
console.log("=== BARCODE DI TRANSIT ===");
for (const i of inv) {
  console.log(`  Barcode: ${i.barcode}, Pallets: ${i.palletsAvailable}, Row: ${i.blockRowId}`);
}
console.log(`  Total Barcode: ${inv.length}\n`);

// 3. Full mutation history
const muts = await db.select().from(stockMutations)
  .where(eq(stockMutations.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
console.log("=== RIWAYAT MUTASI LENGKAP ===");
let runningBalance = 0;
for (const m of muts) {
  const q = Math.round(parseFloat(String(m.qty || "0")));
  if (m.type === "IN") runningBalance += q;
  else if (m.type === "OUT") runningBalance -= Math.abs(q);
  else if (m.type === "ADJUST") runningBalance += q;
  console.log(`  ${m.date} ${m.time} | ${m.type.padEnd(6)} | ${String(q).padStart(6)} | ${m.line.padEnd(25)} | Saldo: ${runningBalance}`);
}

console.log(`\n📊 KESIMPULAN:`);
console.log(`  Stok Aktual (transit_stock_live) = ${totalPcs} PCS`);
console.log(`  Saldo Mutasi                     = ${runningBalance} PCS`);
console.log(`  Barcode tersedia                 = ${inv.length} pallet`);

// 4. What SHOULD the stock be?
const totalIn = muts.filter(m => m.type === "IN").reduce((s, m) => s + Math.round(parseFloat(m.qty || "0")), 0);
const totalOut = muts.filter(m => m.type === "OUT").reduce((s, m) => s + Math.abs(Math.round(parseFloat(m.qty || "0"))), 0);
console.log(`\n  Total masuk (IN)     = ${totalIn} PCS`);
console.log(`  Total keluar (OUT)   = ${totalOut} PCS`);
console.log(`  Seharusnya tersisa   = ${totalIn - totalOut} PCS (tanpa ADJ)`);
console.log(`  Selisih dgn aktual   = ${totalPcs - (totalIn - totalOut)} PCS ← INI yang menjadi ADJ`);

process.exit(0);
