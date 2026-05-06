import { db } from "../src/config/database.js";
import { stockMutations, stockChecks, stockCheckEntries, blockRows, blocks } from "../src/db/schema/index.js";
import { eq, and } from "drizzle-orm";

// 1. Show all stock checks
console.log("=== SEMUA STOCK CHECK ===");
const checks = await db.select().from(stockChecks);
for (const c of checks) {
  console.log(`  Date: ${c.checkDate} | ID: ${c.id}`);
  const entries = await db.select().from(stockCheckEntries).where(eq(stockCheckEntries.stockCheckId, c.id));
  for (const e of entries) {
    // Get row info
    const [row] = await db.select().from(blockRows).where(eq(blockRows.id, e.blockRowId));
    const matName = row ? row.materialName : "UNKNOWN";
    console.log(`    Row ${e.blockRowId} (${matName}) | PalletIdx: ${e.palletIndex} | Qty: ${e.quantity}`);
  }
}

// 2. Show ADJUST mutations that act as stock check saldo awal
console.log("\n=== ADJUST MUTATIONS (yang jadi Saldo Awal) ===");
const adjusts = await db.select().from(stockMutations).where(eq(stockMutations.type, "ADJUST"));
for (const a of adjusts) {
  console.log(`  ${a.date} ${a.time} | ${a.materialName} | qty=${a.qty} | ${a.line}`);
}

// 3. How does OPP get Saldo Awal = 500? Trace it
console.log("\n=== TRACE OPP WARNA (Saldo Awal = 500) ===");
const oppMuts = await db.select().from(stockMutations).where(eq(stockMutations.materialName, "OPP WARNA 48 X 500 X 10"));
for (const m of oppMuts) {
  console.log(`  ${m.date} ${m.time} | ${m.type} | qty=${m.qty} | ${m.line}`);
}

process.exit(0);
