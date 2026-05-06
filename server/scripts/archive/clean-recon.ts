import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations } from "../src/db/schema/index.js";
import { eq, and } from "drizzle-orm";
import { todayStr, nowTimeStr } from "../src/utils/format.js";
import * as masterService from "../src/services/master.service.js";

async function main() {
  console.log("🧹 STARTING CLEAN RECONCILIATION...");
  const today = todayStr();

  // 1. Delete all ADJUST records for TODAY to start fresh
  console.log("  - Deleting today's Adjustments...");
  await db.delete(stockMutations).where(and(eq(stockMutations.date, today), eq(stockMutations.type, 'ADJUST')));

  // 2. For every material, calculate the needed adjustment
  const live = await db.select().from(transitStockLive);
  const mutations = await db.select().from(stockMutations);

  const materials = [...new Set(live.map(l => l.materialName))];

  for (const mat of materials) {
    const physical = live.filter(l => l.materialName === mat).reduce((sum, l) => sum + Math.round(parseFloat(String(l.pcs || "0"))), 0);
    
    // Calculate mutation balance BEFORE adjustment
    let mutBalance = 0;
    const matMuts = mutations.filter(m => m.materialName === mat && m.date <= today && m.type !== 'ADJUST');
    
    // Add history (assuming saldo awal before today is already recorded or 0)
    // Actually, let's just use the current report logic: 
    // All history + today's IN - today's OUT
    const historyBeforeToday = mutations.filter(m => m.materialName === mat && m.date < today);
    historyBeforeToday.forEach(m => {
       const q = Math.round(parseFloat(String(m.qty || "0")));
       if (m.type === 'IN' || m.type === 'ADJUST') mutBalance += q;
       else mutBalance -= Math.abs(q);
    });

    const todayMuts = mutations.filter(m => m.materialName === mat && m.date === today && m.type !== 'ADJUST');
    todayMuts.forEach(m => {
       const q = Math.round(parseFloat(String(m.qty || "0")));
       if (m.type === 'IN') mutBalance += q;
       else if (m.type === 'OUT') mutBalance -= Math.abs(q);
    });

    const delta = physical - mutBalance;

    if (Math.abs(delta) > 0) {
      console.log(`  ✅ Adjusting ${mat}: Physical=${physical}, CurrentMutationTotal=${mutBalance}, Need ADJUST=${delta}`);
      const uom = (await masterService.getMaterialUOM(mat)) || "PCS";
      await db.insert(stockMutations).values({
        date: today,
        time: nowTimeStr(),
        type: "ADJUST",
        materialName: mat,
        qty: String(delta),
        uom,
        line: "Clean Recon",
        skuId: "-",
        barcode: "-"
      });
    } else {
      console.log(`  🆗 ${mat} is already in sync. (Physical=${physical}, Mutation=${mutBalance})`);
    }
  }

  console.log("✨ RECONCILIATION COMPLETE. All materials should now have 0 Selisih.");
  process.exit(0);
}

main().catch(console.error);
