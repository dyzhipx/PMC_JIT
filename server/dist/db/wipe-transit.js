import { db } from "../config/database.js";
async function wipeAll() {
    console.log("=== WIPE ALL OPERATIONAL DATA ===");
    // 1. Check transit_stock_live BEFORE
    const before = await db.transitStockLive.findMany();
    console.log(`transit_stock_live BEFORE: ${before.length} rows`);
    for (const r of before) {
        console.log(`  - blockRowId=${r.blockRowId}, material=${r.materialName}, qty=${r.qtyPallets}, pcs=${r.pcs}`);
    }
    // 2. Delete everything
    try {
        await db.pendingReturn.deleteMany();
        console.log("✅ pendingReturns deleted");
    }
    catch (e) {
        console.log("⚠️ pendingReturns:", e.message);
    }
    try {
        await db.lineBarcode.deleteMany();
        console.log("✅ lineBarcodes deleted");
    }
    catch (e) {
        console.log("⚠️ lineBarcodes:", e.message);
    }
    try {
        await db.lineStock.deleteMany();
        console.log("✅ lineStock deleted");
    }
    catch (e) {
        console.log("⚠️ lineStock:", e.message);
    }
    try {
        await db.transitOutboundPending.deleteMany();
        console.log("✅ transitOutboundPending deleted");
    }
    catch (e) {
        console.log("⚠️ transitOutboundPending:", e.message);
    }
    try {
        await db.transitStockLive.deleteMany();
        console.log("✅ transitStockLive deleted");
    }
    catch (e) {
        console.log("⚠️ transitStockLive:", e.message);
    }
    try {
        await db.transitInventory.deleteMany();
        console.log("✅ transitInventory deleted");
    }
    catch (e) {
        console.log("⚠️ transitInventory:", e.message);
    }
    try {
        await db.deliveryScan.deleteMany();
        console.log("✅ deliveryScans deleted");
    }
    catch (e) {
        console.log("⚠️ deliveryScans:", e.message);
    }
    try {
        await db.deliveryItem.deleteMany();
        console.log("✅ deliveryItems deleted");
    }
    catch (e) {
        console.log("⚠️ deliveryItems:", e.message);
    }
    try {
        await db.delivery.deleteMany();
        console.log("✅ deliveries deleted");
    }
    catch (e) {
        console.log("⚠️ deliveries:", e.message);
    }
    try {
        await db.stockCheckEntry.deleteMany();
        console.log("✅ stockCheckEntries deleted");
    }
    catch (e) {
        console.log("⚠️ stockCheckEntries:", e.message);
    }
    try {
        await db.stockCheck.deleteMany();
        console.log("✅ stockChecks deleted");
    }
    catch (e) {
        console.log("⚠️ stockChecks:", e.message);
    }
    try {
        await db.warehouseInventory.deleteMany();
        console.log("✅ warehouseInventory deleted");
    }
    catch (e) {
        console.log("⚠️ warehouseInventory:", e.message);
    }
    try {
        await db.stockMutation.deleteMany();
        console.log("✅ stockMutations deleted");
    }
    catch (e) {
        console.log("⚠️ stockMutations:", e.message);
    }
    try {
        await db.usedBarcode.deleteMany();
        console.log("✅ usedBarcodes deleted");
    }
    catch (e) {
        console.log("⚠️ usedBarcodes:", e.message);
    }
    // Reset counters
    try {
        await db.systemCounter.updateMany({ where: { id: { in: ['barcode_counter', 'mid_counter'] } }, data: { value: 0 } });
        console.log("✅ systemCounters reset to 0");
    }
    catch (e) {
        console.log("⚠️ systemCounters:", e.message);
    }
    // 3. Verify transit_stock_live AFTER
    const after = await db.transitStockLive.findMany();
    console.log(`\ntransit_stock_live AFTER: ${after.length} rows`);
    if (after.length === 0) {
        console.log("\n🎉 SUKSES! Semua data operasional sudah bersih.");
    }
    else {
        console.log("\n❌ MASIH ADA DATA! Ada masalah...");
    }
    process.exit(0);
}
wipeAll().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
