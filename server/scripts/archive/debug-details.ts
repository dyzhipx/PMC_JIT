import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations, blockRows } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

async function main() {
  const materials = ['KARTON ABC SUSU 12 X 10 X 30 (R3)', 'PLASTIK ABC SUSU 30 GR (R3)'];
  
  for (const m of materials) {
    console.log(`\n\n=== DETAILS FOR: ${m} ===`);
    
    console.log("\n[LIVE STOCK ROWS]");
    const live = await db.select().from(transitStockLive).where(eq(transitStockLive.materialName, m));
    live.forEach(l => {
      console.log(`  RowID: ${l.blockRowId}, Pallets: ${l.qtyPallets}, PCS: ${l.pcs}`);
    });

    console.log("\n[MUTATION HISTORY]");
    const mutations = await db.select().from(stockMutations).where(eq(stockMutations.materialName, m));
    mutations.sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time)).forEach(l => {
      console.log(`  ${l.date} ${l.time} [${l.type}] Qty: ${l.qty} RowID: ${l.blockRowId} Source: ${l.line}`);
    });
  }

  process.exit(0);
}

main().catch(console.error);
