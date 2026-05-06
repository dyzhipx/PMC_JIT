import { db } from "../src/config/database.js";
import { stockMutations, transitStockLive, blockRows, blocks } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

async function main() {
  const muts = await db.select().from(stockMutations)
    .where(eq(stockMutations.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
  
  console.log("=== MUTATIONS FOR KARTON ===");
  for (const m of muts) {
    let blockName = "NO_BLOCK";
    if (m.blockId) {
      const [b] = await db.select().from(blocks).where(eq(blocks.id, m.blockId));
      blockName = b ? b.name : "UNKNOWN_BLOCK";
    }
    console.log(`${m.date} | ${m.type.padEnd(6)} | ${String(m.qty).padStart(6)} | Block: ${m.blockId} (${blockName})`);
  }

  const live = await db.select().from(transitStockLive)
    .where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
  
  console.log("\n=== PHYSICAL STOCK ===");
  for (const l of live) {
    const [row] = await db.select().from(blockRows).where(eq(blockRows.id, l.blockRowId));
    let blockName = "NO_BLOCK";
    if (row && row.blockId) {
      const [b] = await db.select().from(blocks).where(eq(blocks.id, row.blockId));
      blockName = b ? b.name : "UNKNOWN_BLOCK";
    }
    console.log(`Row: ${l.blockRowId} | Pallets: ${l.qtyPallets} | PCS: ${l.pcs} | Block: ${row?.blockId} (${blockName})`);
  }
  
  process.exit(0);
}

main().catch(console.error);
