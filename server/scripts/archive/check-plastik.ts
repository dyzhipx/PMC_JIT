import { db } from "../src/config/database.js";
import { stockMutations, transitStockLive, blockRows } from "../src/db/schema/index.js";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("=== MUTATIONS FOR PLASTIK === ");
  const muts = await db.select().from(stockMutations).where(eq(stockMutations.materialName, "PLASTIK ABC SUSU 30 GR (R3)"));
  for (const m of muts) {
    console.log(`${m.date} | ${m.type.padEnd(6)} | qty=${m.qty} | Line=${m.line} | Block=${m.blockId} | Row=${m.blockRowId} | id=${m.id}`);
  }

  console.log("\n=== PHYSICAL STOCK FOR PLASTIK ===");
  const live = await db.select().from(transitStockLive).where(eq(transitStockLive.materialName, "PLASTIK ABC SUSU 30 GR (R3)"));
  for (const l of live) {
    const [row] = await db.select().from(blockRows).where(eq(blockRows.id, l.blockRowId));
    console.log(`Row: ${l.blockRowId} | Block: ${row?.blockId} | PCS: ${l.pcs}`);
  }
  process.exit(0);
}

main().catch(console.error);
