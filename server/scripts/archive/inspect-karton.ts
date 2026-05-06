import { db } from "../src/config/database.js";
import { stockMutations } from "../src/db/schema/index.js";
import { eq } from "drizzle-orm";

const rows = await db.select().from(stockMutations).where(eq(stockMutations.materialName, "KARTON ABC SUSU 12 X 10 X 30 (R3)"));
console.log("=== ALL KARTON MUTATIONS ===");
for (const r of rows) {
  console.log(`${r.type} | qty=${r.qty} | date=${r.date} | time=${r.time} | line=${r.line} | id=${r.id}`);
}
process.exit(0);
