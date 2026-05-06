import { db } from "../src/config/database.js";
import { transitStockLive, stockMutations } from "../src/db/schema/index.js";

async function main() {
  console.log("🛠 Rounding all STOCK and MUTATION counts to INTEGERS...");

  const live = await db.select().from(transitStockLive);
  for (const l of live) {
    const rounded = Math.round(parseFloat(String(l.pcs || "0")));
    await db.update(transitStockLive).set({ pcs: String(rounded) }).where(eq(transitStockLive.id, l.id));
  }

  const muts = await db.select().from(stockMutations);
  for (const m of muts) {
    const rounded = Math.round(parseFloat(String(m.qty || "0")));
    await db.update(stockMutations).set({ qty: String(rounded) }).where(eq(stockMutations.id, m.id));
  }

  console.log("✨ Done. All decimals removed.");
  process.exit(0);
}

import { eq } from "drizzle-orm";
main().catch(console.error);
