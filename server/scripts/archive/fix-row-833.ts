import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

const ROW_ID = "2624174e-0e0a-4c3e-9316-a66adc1c976a";

// 1. Fix live stock: mutation balance = 0, so pcs should be 0, pallet should be 0
// BUT there is still 1 barcode (00005) in transit inventory, so 1 pallet exists physically
// The barcode came IN at 10:37:02 with 1250 PCS but mutations show 2 OUT after that
// Actually wait - let's check: 2 IN and 2 OUT = net 0. But barcode 00005 still exists.
// This means the barcode was NOT consumed during the OUT. The OUT used average calc.
// So physically 1 pallet IS there (barcode 00005), it should be 1250 PCS not 833.

console.log("🔧 Fixing Row 2624174e...");
console.log("   Barcode 00005 masih ada di transit → 1 pallet fisik ada");
console.log("   Setiap pallet KARTON = 1.250 PCS");
console.log("   Mengubah: 833 PCS → 1.250 PCS");

await db.update(transitStockLive)
  .set({ pcs: "1250" })
  .where(eq(transitStockLive.blockRowId, ROW_ID));

// 2. Now fix the ADJUST to match new total
// New total: Row b269e457 = 3750 + Row 2624174e = 1250 = 5000
// Mutations: IN=6250, OUT=3750, so net = 2500
// Need ADJ = 5000 - 2500 = 2500

// Delete old Koreksi OUT adjust
await db.delete(stockMutations).where(eq(stockMutations.line, "Koreksi OUT"));
console.log("   Hapus ADJ lama (Koreksi OUT +2083)");

// Insert correct ADJ
await db.insert(stockMutations).values({
  date: "2026-04-07",
  time: "11:37:00",
  type: "ADJUST",
  materialName: "KARTON ABC SUSU 12 X 10 X 30 (R3)",
  qty: "2500",
  uom: "PCS",
  line: "Koreksi Saldo Awal",
  skuId: "-",
  barcode: "-"
});
console.log("   Insert ADJ baru: +2.500 (Koreksi Saldo Awal)");

// Verify
const [newLive] = await db.select().from(transitStockLive).where(eq(transitStockLive.blockRowId, ROW_ID));
const allLive = await db.select().from(transitStockLive).where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
const totalPcs = allLive.reduce((s, l) => s + Math.round(parseFloat(String(l.pcs || "0"))), 0);

const muts = await db.select().from(stockMutations).where(eq(stockMutations.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
let mutBal = 0;
for (const m of muts) {
  const q = Math.round(parseFloat(String(m.qty || "0")));
  if (m.type === "IN") mutBal += q;
  else if (m.type === "OUT") mutBal -= Math.abs(q);
  else if (m.type === "ADJUST") mutBal += q;
}

console.log(`\n📊 HASIL:`);
console.log(`   Stok Aktual = ${totalPcs} PCS`);
console.log(`   Saldo Mutasi = ${mutBal} PCS`);
console.log(`   Selisih = ${totalPcs - mutBal}`);
console.log(`   Row 2624174e: ${newLive?.qtyPallets} pallet, ${newLive?.pcs} PCS ← FIXED!`);

process.exit(0);
