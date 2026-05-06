import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const materials = [
    'KARTON ABC SUSU 12 X 10 X 30 (R3)',
    'OPP WARNA 48 X 500 X 10',
    'PLASTIK ABC SUSU 30 GR (R3)',
    'TULIP PUTIH 48MM X 500M'
  ];

  console.log('=== DIAGNOSA STOK AKTUAL VS SALDO BUKU ===');

  for (const mat of materials) {
    console.log(`\n--- ${mat} ---`);
    
    // 1. Physical Pallets
    const physicalPallets = await db.transitInventory.findMany({ where: { materialName: mat } });
    console.log(`Palet Fisik di TransitInventory: ${physicalPallets.length}`);
    
    // 2. Live Summary
    const liveSummary = await db.transitStockLive.findMany({ where: { materialName: mat } });
    const livePcs = liveSummary.reduce((sum, l) => sum + Number(l.pcs || 0), 0);
    console.log(`Total PCS di TransitStockLive (Fisik): ${livePcs}`);
    
    // 3. Mutation Calculation
    const mutations = await db.stockMutation.findMany({ where: { materialName: mat } });
    let bookBalance = 0;
    mutations.forEach(m => {
      const q = parseFloat(m.qty as any) || 0;
      if (m.type === 'IN' || m.type === 'ADJUST') bookBalance += q;
      else if (m.type === 'OUT') bookBalance -= Math.abs(q);
    });
    console.log(`Total PCS di Laporan Mutasi (Buku): ${bookBalance}`);
    
    if (livePcs === 0 && bookBalance > 0) {
      console.log('KESIMPULAN: Barang sudah keluar secara fisik, tapi sistem mutasi tidak mencatat pengeluarannya.');
    }
  }
}

main().catch(console.error).finally(() => db.$disconnect());
