import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const mutations = await db.stockMutation.findMany();
  let updated = 0;

  for (const m of mutations) {
    let newSource = "WAREHOUSE";

    if (m.type === "OUT") {
       if (m.line?.includes("Transit ->")) newSource = "OUTBOUND";
       else newSource = "PRODUCTION";
    } else if (m.type === "IN") {
       if (m.line?.includes("Retur SISA")) newSource = "RETURN_PARTIAL";
       else if (m.line?.includes("Retur")) newSource = "RETURN_FULL";
       else newSource = "WAREHOUSE";
    } else if (m.type === "ADJUST") {
       newSource = "STOCK_CHECK";
    } else if (m.type === "RELOKASI") {
       newSource = "RELOKASI";
    }

    if (m.source !== newSource) {
      await db.stockMutation.update({
        where: { id: m.id },
        data: { source: newSource }
      });
      updated++;
    }
  }

  console.log(`Successfully backfilled source for ${updated} mutations.`);
}

main().catch(console.error).finally(() => db.$disconnect());
