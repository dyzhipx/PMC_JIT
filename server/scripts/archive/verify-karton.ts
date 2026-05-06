import { db } from "../src/config/database.js";
import { stockMutations, transitStockLive } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

// Check final state for KARTON
const all = await db.select().from(stockMutations)
  .where(eq(stockMutations.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));

console.log("=== FINAL KARTON MUTATIONS ===");
let totalIn = 0, totalOut = 0, totalAdj = 0;
for (const r of all) {
  const q = Math.round(parseFloat(r.qty || "0"));
  if (r.type === "IN") totalIn += q;
  else if (r.type === "OUT") totalOut += Math.abs(q);
  else if (r.type === "ADJUST") totalAdj += q;
  console.log(`  ${r.type.padEnd(6)} | ${String(q).padStart(6)} | ${r.date} ${r.time} | ${r.line}`);
}
const balance = totalIn - totalOut + totalAdj;

const live = await db.select().from(transitStockLive)
  .where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
const actualPcs = live.reduce((s, l) => s + Math.round(parseFloat(String(l.pcs || "0"))), 0);

console.log(`\n📊 SUMMARY:`);
console.log(`  IN     = +${totalIn}`);
console.log(`  OUT    = -${totalOut}`);
console.log(`  ADJ    = ${totalAdj >= 0 ? '+' : ''}${totalAdj}`);
console.log(`  ─────────────────`);
console.log(`  Saldo Akhir  = ${balance}`);
console.log(`  Stok Aktual  = ${actualPcs}`);
console.log(`  Selisih      = ${balance - actualPcs}`);

process.exit(0);
