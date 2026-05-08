import { db } from "../config/database.js";
async function resetOperational() {
    console.log("🔥 Warning: Ini akan MERESET SEMUA data operasional!");
    try {
        // Menghapus data operasional (Transaksional)
        await db.pendingReturn.deleteMany();
        await db.lineBarcode.deleteMany();
        await db.lineStock.deleteMany();
        console.log("✅ Line Stock & Inbound dihapus");
        await db.transitOutboundPending.deleteMany();
        await db.transitStockLive.deleteMany();
        await db.transitInventory.deleteMany();
        console.log("✅ Transit Stock & Inbound dihapus");
        await db.deliveryScan.deleteMany();
        await db.deliveryItem.deleteMany();
        await db.delivery.deleteMany();
        console.log("✅ Request Pengiriman dihapus");
        await db.stockCheckEntry.deleteMany();
        await db.stockCheck.deleteMany();
        console.log("✅ Data Stock Check dihapus");
        await db.warehouseInventory.deleteMany();
        console.log("✅ Warehouse / Gudang Aktual dihapus");
        await db.stockMutation.deleteMany();
        console.log("✅ Info Distribusi / Mutasi dihapus");
        await db.usedBarcode.deleteMany();
        console.log("✅ Used Barcodes dihapus");
        // Reset Counters
        await db.systemCounter.updateMany({
            where: { id: { in: ['barcode_counter', 'mid_counter'] } },
            data: { value: 0 }
        });
        console.log("✅ Barcode Counters direset ke 0");
        console.log("\n🎉 Reset Data Operasional Selesai! Sistem sudah bersih seperti semula.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Gagal melakukan reset:", error);
        process.exit(1);
    }
}
resetOperational();
