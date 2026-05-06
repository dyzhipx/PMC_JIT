import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function resetOperationalTransactions() {
  console.log("=== MEMUAI FACTORY RESET DATA OPERASIONAL ===");

  try {
    // 1. Data Produksi & Schedule
    console.log("Menghapus Schedules...");
    await db.schedule.deleteMany();
    console.log("Menghapus Line Rejects...");
    await db.lineReject.deleteMany();
    console.log("Menghapus Production BPP Items...");
    await db.productionBppItem.deleteMany();
    console.log("Menghapus Production BPPs...");
    await db.productionBpp.deleteMany();
    console.log("Menghapus Production Opname Items...");
    await db.productionOpnameItem.deleteMany();
    console.log("Menghapus Production Opnames...");
    await db.productionOpname.deleteMany();

    // 2. Data Manual SPB
    console.log("Menghapus Manual SPB Scans...");
    await db.manualSpbScan.deleteMany();
    console.log("Menghapus Manual SPB Items...");
    await db.manualSpbItem.deleteMany();
    console.log("Menghapus Manual SPBs...");
    await db.manualSpb.deleteMany();

    // 3. Data Delivery (Gudang -> Produksi)
    console.log("Menghapus Delivery Scans...");
    await db.deliveryScan.deleteMany();
    console.log("Menghapus Delivery Items...");
    await db.deliveryItem.deleteMany();
    console.log("Menghapus Deliveries...");
    await db.delivery.deleteMany();

    // 4. Data Transit & Mutations
    console.log("Menghapus Transit Outbound Pending...");
    await db.transitOutboundPending.deleteMany();
    console.log("Menghapus Stock Mutations...");
    await db.stockMutation.deleteMany();
    console.log("Menghapus Transit Inventory...");
    await db.transitInventory.deleteMany();
    console.log("Menghapus Transit Stock Live...");
    await db.transitStockLive.deleteMany();

    // 5. Data Stock Check
    console.log("Menghapus Stock Check Entries...");
    await db.stockCheckEntry.deleteMany();
    console.log("Menghapus Stock Checks...");
    await db.stockCheck.deleteMany();

    // 6. Data di Line Produksi
    console.log("Menghapus Line Barcodes...");
    await db.lineBarcode.deleteMany();
    console.log("Menghapus Line Stock...");
    await db.lineStock.deleteMany();
    console.log("Menghapus Pending Returns...");
    await db.pendingReturn.deleteMany();

    // 7. External Onhand
    console.log("Menghapus External Onhand Barcodes...");
    await db.externalOnhandBarcode.deleteMany();
    console.log("Menghapus External Onhands...");
    await db.externalOnhand.deleteMany();

    // 8. Gudang Utama WMS
    console.log("Menghapus Warehouse Inventory...");
    await db.warehouseInventory.deleteMany();
    console.log("Menghapus Used Barcode Ledger...");
    await db.usedBarcode.deleteMany();

    // 9. Reset System Counters
    console.log("Mereset System Counters (Barcode & MID)...");
    await db.systemCounter.updateMany({
        where: { id: { in: ['barcode_counter', 'mid_counter'] } },
        data: { value: 0 }
    });

    console.log("=== RESET OPERASIONAL BERHASIL SEPENUHNYA ===");
  } catch (error) {
    console.error("Gagal melakukan reset:", error);
  } finally {
    await db.$disconnect();
  }
}

resetOperationalTransactions();
