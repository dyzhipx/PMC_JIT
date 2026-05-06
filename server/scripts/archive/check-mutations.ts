import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const material = 'KARTON ABC SUSU 12 X 10 X 30 (R3)';
  const m = await db.stockMutation.findMany({ where: { materialName: material } });
  let total = 0;
  console.log('--- Current Mutations for ' + material + ' ---');
  m.forEach(r => {
    const q = parseFloat(String(r.qty));
    if (r.type === 'IN' || r.type === 'ADJUST') total += q;
    else if (r.type === 'OUT') total -= Math.abs(q);
    console.log(`[${r.id}] Type: ${r.type}, Source: ${r.source}, Qty: ${r.qty}, Line: ${r.line}`);
  });
  console.log('--- TOTAL BOOK STOCK: ' + total + ' ---');
  
  const live = await db.transitStockLive.findMany({ where: { materialName: material } });
  let liveSum = 0;
  live.forEach(l => {
    liveSum += parseFloat(String(l.pcs));
    console.log(`Live Entry: ${l.pcs} pcs`);
  });
  console.log('--- TOTAL LIVE STOCK: ' + liveSum + ' ---');
}
main().finally(() => db.$disconnect());
