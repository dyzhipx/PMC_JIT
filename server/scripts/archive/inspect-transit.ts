import { db } from "../src/config/database.js";

async function main() {
  const items = await db.transitInventory.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  console.log('Sample TransitInventory:');
  console.log(items.map(i => ({ id: i.id, barcode: i.barcode, mid: i.mid, supplier: i.supplier, dateInGudang: i.dateInGudang })));
  process.exit();
}
main();
