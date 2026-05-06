import { db } from "../src/config/database.js";
import { stockMutations, transitStockLive, blockRows } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

async function restoreForMaterial(matName: string) {
  console.log(`\n=== RESTORING: ${matName} ===`);
  
  // 1. Get live stock per row
  const live = await db.select().from(transitStockLive).where(eq(transitStockLive.materialName, matName));
  const muts = await db.select().from(stockMutations).where(eq(stockMutations.materialName, matName));

  for (const l of live) {
    const rowId = l.blockRowId;
    const [row] = await db.select().from(blockRows).where(eq(blockRows.id, rowId));
    const blockId = row?.blockId;
    
    const physical = Math.round(parseFloat(String(l.pcs || "0")));
    
    // sum mutations for this row
    let mutBal = 0;
    for (const m of muts) {
      if (m.blockRowId === rowId) {
        const q = Math.round(parseFloat(String(m.qty || "0")));
        if (m.type === "IN") mutBal += q;
        else if (m.type === "OUT") mutBal -= Math.abs(q);
        else if (m.type === "ADJUST") mutBal += q;
      }
    }
    
    const delta = physical - mutBal;
    
    console.log(`Row: ${rowId} (Block: ${blockId}) | Physical=${physical} | Mutation=${mutBal} | NeedDelta=${delta}`);
    
    if (delta !== 0) {
      await db.insert(stockMutations).values({
        date: "2026-04-06",
        time: "01:16:05",
        type: "ADJUST",
        materialName: matName,
        qty: String(delta),
        uom: matName.includes("KARTON") ? "PCS" : "ROL",
        line: "Stock Check Adjustment",
        blockId: blockId,
        blockRowId: rowId,
        skuId: "-",
        barcode: "-"
      });
      console.log(`✅ Inserted ADJ ${delta} for ${matName} in Row ${rowId}`);
    }
  }
}

async function main() {
  await restoreForMaterial("PLASTIK ABC SUSU 30 GR (R3)");
  await restoreForMaterial("OPP WARNA 48 X 500 X 10");
  await restoreForMaterial("TULIP PUTIH 48MM X 500M");
  
  // check final totals to confirm
  console.log("\n=== ALL MUTATIONS SUMMARY ===");
  const allMuts = await db.select().from(stockMutations);
  const sums: Record<string, { in: number, out: number, adj: number }> = {};
  for (const m of allMuts) {
    if (!sums[m.materialName]) sums[m.materialName] = { in: 0, out: 0, adj: 0 };
    const q = Math.round(parseFloat(m.qty || "0"));
    if (m.type === "IN") sums[m.materialName].in += q;
    else if (m.type === "OUT") sums[m.materialName].out += q;
    else if (m.type === "ADJUST") sums[m.materialName].adj += q;
  }
  
  for (const mat in sums) {
    console.log(`${mat.padEnd(35)} | IN=${sums[mat].in} | OUT=${sums[mat].out} | ADJ=${sums[mat].adj}`);
  }
  
  process.exit(0);
}

main().catch(console.error);
