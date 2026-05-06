import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

async function main() {
  const materials = ['KARTON ABC SUSU 12 X 10 X 30 (R3)', 'PLASTIK ABC SUSU 30 GR (R3)'];
  
  console.log("--- LIVE STOCK ---");
  const live = await db.select().from(transitStockLive);
  materials.forEach(m => {
    const items = live.filter(l => l.materialName === m);
    const totalPallets = items.reduce((acc, curr) => acc + curr.qtyPallets, 0);
    const totalPcs = items.reduce((acc, curr) => acc + parseFloat(String(curr.pcs || 0)), 0);
    console.log(`${m}: ${totalPallets} Pallets, ${totalPcs} PCS`);
  });

  console.log("\n--- RECENT MUTATIONS (Date: 2026-04-06 & 2026-04-07) ---");
  const mutations = await db.select().from(stockMutations);
  materials.forEach(m => {
    const list = mutations.filter(l => (l.materialName === m || l.material === m) && (l.date === '2026-04-06' || l.date === '2026-04-07'));
    console.log(`\nMutations for ${m}:`);
    list.forEach(l => console.log(`  ${l.date} ${l.time} [${l.type}] Qty: ${l.qty} Line: ${l.line} BlockId: ${l.blockId}`));
  });

  process.exit(0);
}

main().catch(console.error);
