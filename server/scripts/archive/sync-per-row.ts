import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🚀 Starting DEEP RECONCILIATION (Syncing individual rows with mutation history)...");

  const mutations = await db.select().from(stockMutations);
  const liveRows = await db.select().from(transitStockLive);

  // Group mutations by blockRowId and materialName
  const rowBalances = {}; // rowId -> material -> balance

  mutations.forEach(m => {
    if (!m.blockRowId || !m.materialName) return;
    const key = m.blockRowId;
    if (!rowBalances[key]) rowBalances[key] = {};
    if (!rowBalances[key][m.materialName]) rowBalances[key][m.materialName] = 0;

    const q = parseFloat(String(m.qty || "0"));
    if (m.type === 'IN' || m.type === 'ADJUST') rowBalances[key][m.materialName] += q;
    else if (m.type === 'OUT') rowBalances[key][m.materialName] -= Math.abs(q);
  });

  // Sync EACH row in transit_stock_live
  for (const row of liveRows) {
    const mat = row.materialName;
    const rid = row.blockRowId;
    const historyBalance = (rowBalances[rid] && rowBalances[rid][mat]) || 0;

    console.log(`🔎 Row ${rid} (${mat}): Current Live=${row.pcs}, History Balance=${historyBalance}`);
    
    if (Math.abs(parseFloat(String(row.pcs || "0")) - historyBalance) > 0.0001) {
       console.log(`✅ Adjusting Row ${rid} to match history balance: ${historyBalance}`);
       await db.update(transitStockLive)
               .set({ pcs: String(parseFloat(historyBalance.toFixed(4))) })
               .where(eq(transitStockLive.id, row.id));
    }
  }

  console.log("✨ ALL ROWS ARE NOW SINKRONIZED WITH THEIR INDIVIDUAL MUTATION HISTORIES.");
  process.exit(0);
}

main().catch(console.error);
