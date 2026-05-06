import { db } from "../src/config/database.js";
import { stockMutations, blockRows, blockLayout } from "../src/db/schema/index.js";
import { eq, isNull } from "drizzle-orm";

async function main() {
  const mutations = await db.select().from(stockMutations).where(isNull(stockMutations.blockId));
  const rows = await db.select().from(blockRows);
  const blocks = await db.select().from(blockLayout);

  for (const m of mutations) {
    if (m.line === 'Stock Check Adjustment') {
      // find which blockRow has this material
      const row = rows.find(r => r.materialName === m.materialName);
      if (row) {
        console.log(`Fixing ${m.materialName} -> Block ${row.blockId}, Row ${row.id}`);
        await db.update(stockMutations)
          .set({ 
            blockId: row.blockId, 
            blockRowId: row.id,
            type: 'ADJUST' // fix the legacy IN to ADJUST
          })
          .where(eq(stockMutations.id, m.id));
      } else {
        console.warn(`No blockRow found for ${m.materialName}`);
      }
    }
  }
  console.log("Migration complete.");
  process.exit(0);
}

main().catch(console.error);
