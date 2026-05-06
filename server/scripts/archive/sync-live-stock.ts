import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🚀 Starting Stock Reconciliation (Syncing Live Stock with Mutation Ground Truth)...");

  // 1. Get ALL live stock entries
  const liveRows = await db.select().from(transitStockLive);
  
  // 2. Map material totals from mutations
  // Formula: Sum of all ADJUST, IN, and -OUT records
  const mutations = await db.select().from(stockMutations);
  const materialBalances = {};
  
  mutations.forEach(m => {
    if (!materialBalances[m.materialName]) materialBalances[m.materialName] = 0;
    const q = parseFloat(String(m.qty || "0"));
    if (m.type === 'IN' || m.type === 'ADJUST') materialBalances[m.materialName] += q;
    else if (m.type === 'OUT') materialBalances[m.materialName] -= Math.abs(q);
  });

  // 3. Update transit_stock_live to match Material Balance
  // Note: if multiple rows exist, we divide proportionately or assign to the first
  for (const mName of Object.keys(materialBalances)) {
    const balance = materialBalances[mName];
    const rows = liveRows.filter(l => l.materialName === mName);
    
    if (rows.length === 1) {
      console.log(`✅ Updating ${mName}: ${rows[0].pcs} -> ${balance}`);
      await db.update(transitStockLive).set({ pcs: String(balance) }).where(eq(transitStockLive.id, rows[0].id));
    } else if (rows.length > 1) {
      // Divide total balance by pallets if we have multiple locations
      const totalPallets = rows.reduce((acc, r) => acc + (r.qtyPallets || 0), 0) || rows.length;
      const ppp = balance / totalPallets;
      for (const r of rows) {
        const newPcs = ppp * (r.qtyPallets || 1);
        console.log(`⚠️ Divided ${mName} in Row ${r.blockRowId}: ${r.pcs} -> ${newPcs.toFixed(2)}`);
        await db.update(transitStockLive).set({ pcs: String(newPcs.toFixed(4)) }).where(eq(transitStockLive.id, r.id));
      }
    }
  }

  console.log("✨ Done! Live Stock has been reconciled with the Mutation Log.");
  process.exit(0);
}

main().catch(console.error);
