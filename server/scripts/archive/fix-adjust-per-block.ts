import { db } from "../src/config/database.js";
import { stockMutations, transitStockLive, blockRows } from "../src/db/schema/index.js";
import { eq, inArray } from "drizzle-orm";

async function main() {
  // 1. Dapatkan baris fisik untuk KARTON
  const live = await db.select().from(transitStockLive)
    .where(eq(transitStockLive.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
  
  const blocksMap = {};
  for (const l of live) {
    const [row] = await db.select().from(blockRows).where(eq(blockRows.id, l.blockRowId));
    blocksMap[l.blockRowId] = row.blockId;
    console.log(`Fisik di Row ${l.blockRowId} (Block ${row.blockId}): ${l.pcs} PCS`);
  }

  // Row b269e457-0956-4a5c-b033-16af4dec0d71 has 3750 PCS
  // Row 2624174e-0e0a-4c3e-9316-a66adc1c976a has 1250 PCS

  // 2. Berapa Mutasi HANYA pada Baris b269e457-0956... ?
  const ROW1 = "b269e457-0956-4a5c-b033-16af4dec0d71";
  const ROW2 = "2624174e-0e0a-4c3e-9316-a66adc1c976a";

  const muts1 = await db.select().from(stockMutations).where(eq(stockMutations.blockRowId, ROW1));
  let bal1 = 0;
  for (const m of muts1) {
    const q = Math.round(parseFloat(m.qty||"0"));
    if(m.type==='IN') bal1+=q;
    else if(m.type==='OUT') bal1-=Math.abs(q);
    else if(m.type==='ADJUST') bal1+=q;
  }
  console.log(`\nRow 1 Mutasi (tanpa global ADJ): ${bal1} PCS. Fisik: 3750. Terdapat selisih ${3750 - bal1} PCS.`);

  const muts2 = await db.select().from(stockMutations).where(eq(stockMutations.blockRowId, ROW2));
  let bal2 = 0;
  for (const m of muts2) {
    const q = Math.round(parseFloat(m.qty||"0"));
    if(m.type==='IN') bal2+=q;
    else if(m.type==='OUT') bal2-=Math.abs(q);
    else if(m.type==='ADJUST') bal2+=q;
  }
  console.log(`Row 2 Mutasi (tanpa global ADJ): ${bal2} PCS. Fisik: 1250. Terdapat selisih ${1250 - bal2} PCS.`);

  // 3. DELETE global ADJUST yang tidak ada block-nya!
  console.log("\nMenghapus global ADJUST...");
  await db.delete(stockMutations).where(eq(stockMutations.line, "Stock Check Adjustment"));

  // 4. Masukkan ADJUST per block/row
  if (3750 - bal1 > 0) {
    await db.insert(stockMutations).values({
      date: "2026-04-06",
      time: "01:16:05",
      type: "ADJUST",
      materialName: "KARTON ABC SUSU 12 X 10 X 30 (R3)",
      qty: String(3750 - bal1),
      uom: "PCS",
      line: "Stock Check Adjustment",
      blockId: blocksMap[ROW1],
      blockRowId: ROW1,
      skuId: "-",
      barcode: "-"
    });
    console.log(`✅ Inserted ADJ +${3750-bal1} for Row 1`);
  }

  if (1250 - bal2 > 0) {
    await db.insert(stockMutations).values({
      date: "2026-04-06",
      time: "01:16:05",
      type: "ADJUST",
      materialName: "KARTON ABC SUSU 12 X 10 X 30 (R3)",
      qty: String(1250 - bal2),
      uom: "PCS",
      line: "Stock Check Adjustment",
      blockId: blocksMap[ROW2],
      blockRowId: ROW2,
      skuId: "-",
      barcode: "-"
    });
    console.log(`✅ Inserted ADJ +${1250-bal2} for Row 2`);
  }

  process.exit(0);
}

main().catch(console.error);
