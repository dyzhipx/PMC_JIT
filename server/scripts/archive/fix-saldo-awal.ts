import { db } from "../src/config/database.js";
import { stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

// Fix: Change KARTON ADJUST to same date/time/label as other materials' stock check
await db.update(stockMutations)
  .set({ 
    date: "2026-04-06",           // Same date as OPP/PLASTIK/TULIP stock check
    time: "01:16:05",             // Same time as other stock check adjustments
    line: "Stock Check Adjustment" // Same label as other materials
  })
  .where(eq(stockMutations.line, "Koreksi Saldo Awal"));

console.log("✅ KARTON ADJUST diubah ke tanggal 6 April (Stock Check Adjustment)");
console.log("   Sekarang akan muncul sebagai Saldo Awal, bukan ADJ");

// Verify
const adjusts = await db.select().from(stockMutations).where(eq(stockMutations.type, "ADJUST"));
console.log("\n=== Semua ADJUST sekarang: ===");
for (const a of adjusts) {
  console.log(`  ${a.date} ${a.time} | ${a.materialName} | qty=${a.qty} | ${a.line}`);
}

process.exit(0);
