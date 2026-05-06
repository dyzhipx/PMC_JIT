import * as process from 'node:process';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log('Menghapus data transaksi (lanjutan)...');
  
  // Try Schedule & Production safely
  if (db.schedule && db.schedule.deleteMany) {
      await db.schedule.deleteMany();
      console.log('✅ Schedules cleared');
  }
  if (db.productionBpp && db.productionBpp.deleteMany) {
      await db.productionBpp.deleteMany();
      console.log('✅ Production BPP (Daily Production) cleared');
  }
  if (db.productionOpname && db.productionOpname.deleteMany) {
      await db.productionOpname.deleteMany();
      console.log('✅ Production opnames cleared');
  }
  if (db.transitOpname && db.transitOpname.deleteMany) {
      await db.transitOpname.deleteMany();
      console.log('✅ Transit opnames cleared');
  }
  if (db.pendingReturn && db.pendingReturn.deleteMany) {
      await db.pendingReturn.deleteMany();
      console.log('✅ Pending returns cleared');
  }
  if (db.lineReject && db.lineReject.deleteMany) {
      await db.lineReject.deleteMany();
      console.log('✅ Line rejects cleared');
  }

  // Reset counters
  await db.systemCounter.updateMany({ data: { value: 0 } });
  console.log('✅ System counters reset');

  console.log('');
  console.log('🎉 SELESAI! Semua sisa data transaksi sudah di-reset ke 0.');
  
  await db.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
