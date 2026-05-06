import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function check() {
  try {
    const rows = await db.blockRow.findMany();
    console.log(`Checking ${rows.length} rows for assignedLines JSON validity...`);
    for (const row of rows) {
      if (row.assignedLines) {
        try {
          JSON.parse(row.assignedLines);
        } catch (e) {
          console.error(`Invalid JSON in row ${row.id} (B${row.blockId}.${row.rowNumber}):`, row.assignedLines);
        }
      }
    }
    console.log("Check complete.");
  } catch (err) {
    console.error(err);
  } finally {
    await db.$disconnect();
  }
}

check();
