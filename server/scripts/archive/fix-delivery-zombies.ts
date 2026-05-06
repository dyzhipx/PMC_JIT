import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function fixDeliveryZombies() {
  console.log("Mencari zombie data di Delivery...");

  const deliveries = await db.delivery.findMany({
    where: { status: "preparing" },
    include: { items: true, scans: true }
  });

  for (const d of deliveries) {
    for (const item of d.items) {
      const scansForItem = d.scans.filter(s => s.deliveryItemId === item.id);
      
      // Calculate total pallets scanned logically from the scans
      const actualScannedCount = scansForItem.reduce((sum, s) => sum + (s.qtyPallet || 1), 0);
      const dbScannedCount = parseFloat(String(item.scannedPallets || "0"));
      const required = parseFloat(String(item.requiredPallets || "0"));

      if (actualScannedCount !== dbScannedCount) {
        console.log(`\n⚠️ Delivery: ${d.compositeKey} | Item: ${item.materialName}`);
        console.log(`- Scanned di DB Line Item: ${dbScannedCount}`);
        console.log(`- Jumlah Aktual Scan Barcode: ${actualScannedCount}`);
        console.log(`- Kebutuhan (Required): ${required}`);

        if (actualScannedCount > required) {
          console.log(`  -> OVER QUOTA (Zombie found). Menghapus sisa scan yang berlebih...`);
          
          // Sort scans by created time desc to delete the newest ones that exceeded quota
          const sortedScans = scansForItem.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
          let deleteCount = actualScannedCount - required;
          
          for (let i = 0; i < deleteCount; i++) {
            const excessScan = sortedScans[i];
            await db.deliveryScan.delete({ where: { id: excessScan.id } });
            console.log(`      * Dihapus barcode: ${excessScan.barcode} (ID: ${excessScan.id})`);
          }
          
          // Set to match exact required
          await db.deliveryItem.update({
            where: { id: item.id },
            data: { scannedPallets: required }
          });
          console.log(`  -> Item disinkronisasi ke ${required} pallet.`);
        } else {
          // If valid scans but count drifted, sync it
          await db.deliveryItem.update({
            where: { id: item.id },
            data: { scannedPallets: actualScannedCount }
          });
          console.log(`  -> Item disinkronisasi angka scannedPallets ke aktual ${actualScannedCount}.`);
        }
      }
    }
  }

  console.log("\n✅ Pengecekan dan perbaikan Delivery Zombies selesai.");
  await db.$disconnect();
}

fixDeliveryZombies().catch(e => {
  console.error("Error:", e);
  db.$disconnect();
});
