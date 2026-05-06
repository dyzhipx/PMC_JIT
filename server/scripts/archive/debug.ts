import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const mat = 'KARTON ABC SUSU 12 X 10 X 30 (R3)';
  
  console.log('=== 1. Semua Mutasi untuk material ini ===');
  const mutations = await db.stockMutation.findMany({
    where: { materialName: mat },
    orderBy: [{ date: 'asc' }, { time: 'asc' }]
  });
  
  let totalIn = 0, totalOut = 0, totalRelocIn = 0, totalRelocOut = 0, totalAdj = 0;
  
  mutations.forEach(m => {
    const q = Number(m.qty) || 0;
    const mSource = (m as any).source || '-';
    const label = `${m.type} | source=${mSource} | qty=${q} | line=${m.line} | block=${m.blockId} | row=${m.blockRowId}`;
    console.log(`  [${m.date?.toISOString().split('T')[0]}] ${label}`);
    
    if (m.type === 'IN') {
      if (mSource === 'RELOKASI') totalRelocIn += q;
      else totalIn += q;
    }
    else if (m.type === 'OUT') {
      if (mSource === 'RELOKASI') totalRelocOut += Math.abs(q);
      else totalOut += Math.abs(q);
    }
    else if (m.type === 'ADJUST') totalAdj += q;
  });
  
  console.log('\n=== 2. Ringkasan Mutasi ===');
  console.log(`  Total IN (non-reloc): ${totalIn}`);
  console.log(`  Total OUT (non-reloc): ${totalOut}`);
  console.log(`  Total RELOKASI IN: ${totalRelocIn}`);
  console.log(`  Total RELOKASI OUT: ${totalRelocOut}`);
  console.log(`  Net RELOKASI: ${totalRelocIn - totalRelocOut}`);
  console.log(`  Total ADJUST: ${totalAdj}`);
  console.log(`  Saldo Akhir (Kalkulasi): ${totalIn - totalOut + (totalRelocIn - totalRelocOut) + totalAdj}`);
  
  console.log('\n=== 3. Stok Aktual di Transit (Live) ===');
  const live = await db.transitStockLive.findMany({ where: { materialName: mat } });
  live.forEach(l => {
    console.log(`  Row=${l.blockRowId} | qty=${l.qtyPallets} pallet | pcs=${Number(l.pcs) || 0}`);
  });
  const totalLivePcs = live.reduce((sum, l) => sum + Number(l.pcs || 0), 0);
  console.log(`  Total stok aktual (PCS): ${totalLivePcs}`);
  
  console.log('\n=== 4. Transit Inventory detail ===');
  const inv = await db.transitInventory.findMany({ where: { materialName: mat } });
  inv.forEach(i => {
    const iPcs = Number((i as any).pcs) || 0;
    console.log(`  barcode=${i.barcode} | block=${i.blockId} | row=${i.blockRowId} | pallets=${i.palletsAvailable} | pcs=${iPcs}`);
  });
  console.log(`  Total items: ${inv.length}`);
  
  console.log('\n=== 5. Selisih Analisis ===');
  const saldoAkhir = totalIn - totalOut + (totalRelocIn - totalRelocOut) + totalAdj;
  console.log(`  Saldo Akhir (dari mutasi): ${saldoAkhir}`);
  console.log(`  Stok Aktual (live): ${totalLivePcs}`);
  console.log(`  SELISIH: ${saldoAkhir - totalLivePcs}`);
  
  if (totalRelocIn === 0 && totalRelocOut === 0) {
    console.log('\n  ⚠️ TIDAK ADA mutasi RELOKASI tercatat!');
  }
}

main().catch(console.error).finally(() => db.$disconnect());
