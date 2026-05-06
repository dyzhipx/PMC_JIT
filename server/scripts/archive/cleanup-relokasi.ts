import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const material = 'KARTON ABC SUSU 12 X 10 X 30 (R3)';
  
  // Fix: Rebuild transit_stock_live from transit_inventory (source of truth)
  // 1. Delete old live stock entries for this material
  await db.transitStockLive.deleteMany({ where: { materialName: material } });
  console.log('Deleted old live stock entries');
  
  // 2. Get all inventory grouped by blockRowId
  const inv = await db.transitInventory.findMany({ where: { materialName: material } });
  const grouped: Record<string, { pallets: number; pcs: number }> = {};
  
  inv.forEach(i => {
    const rowId = i.blockRowId!;
    if (!grouped[rowId]) grouped[rowId] = { pallets: 0, pcs: 0 };
    grouped[rowId].pallets += i.palletsAvailable;
    grouped[rowId].pcs += parseFloat(String(i.pcs || '0'));
  });
  
  // 3. Create correct live stock entries
  for (const [rowId, data] of Object.entries(grouped)) {
    await db.transitStockLive.create({
      data: {
        blockRowId: rowId,
        materialName: material,
        qtyPallets: data.pallets,
        pcs: String(data.pcs)
      }
    });
    console.log(`Created live stock: Row ${rowId}, ${data.pallets} pallets, ${data.pcs} pcs`);
  }
  
  // 4. Verify
  const newLive = await db.transitStockLive.findMany({ where: { materialName: material } });
  let newSum = 0;
  newLive.forEach(l => { newSum += parseFloat(String(l.pcs)); });
  console.log(`\nNew Live Stock Total: ${newSum}`);
  console.log(`Book Stock: 3375`);
  console.log(`Selisih: ${3375 - newSum}`);
}

main().finally(() => db.$disconnect());
