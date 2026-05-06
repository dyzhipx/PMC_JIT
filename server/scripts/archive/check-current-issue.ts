import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

async function main() {
  const live = await db.select().from(transitStockLive)
    .where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
  
  let actualPcs = 0;
  console.log("=== LIVE STOCK ===");
  for (const l of live) {
    console.log(`Row: ${l.blockRowId}, Pallets: ${l.qtyPallets}, PCS: ${l.pcs}`);
    actualPcs += Math.round(parseFloat(String(l.pcs || "0")));
  }
  console.log(`TOTAL ACTUAL PCS = ${actualPcs}`);

  const muts = await db.select().from(stockMutations)
    .where(eq(stockMutations.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
  
  console.log("\n=== MUTATIONS ===");
  for (const m of muts) {
    console.log(`${m.date} | ${m.time} | ${m.type} | ${m.qty} | ${m.line} | ${m.id}`);
  }
  
  process.exit(0);
}

main().catch(console.error);
