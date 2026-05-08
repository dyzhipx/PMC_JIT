import { db } from "../config/database.js";
import * as warehouseService from "./warehouse.service.js";
import * as transitService from "./transit.service.js";
// ═══════════════════════════════════════════
//  MANUAL SPB SERVICE
// ═══════════════════════════════════════════
/**
 * Generate SPB number: SPB-MNL-YYYYMMDD-NNN
 */
async function generateSpbNumber() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `SPB-MNL-${dateStr}`;
    const existing = await db.manualSpb.findMany({
        where: { spbNumber: { startsWith: prefix } },
        orderBy: { spbNumber: 'desc' },
        take: 1,
    });
    let seq = 1;
    if (existing.length > 0) {
        const lastNum = existing[0].spbNumber.split('-').pop();
        seq = (parseInt(lastNum || '0') || 0) + 1;
    }
    return `${prefix}-${String(seq).padStart(3, '0')}`;
}
/**
 * Create a new Manual SPB
 */
export async function createManualSpb(requestedBy, reason, items, targetDate, targetShift) {
    console.log(`[ManualSPB] Creating SPB for ${requestedBy}, items: ${items.length}`);
    const spbNumber = await generateSpbNumber();
    const spb = await db.manualSpb.create({
        data: {
            spbNumber,
            requestedBy,
            reason,
            status: "active",
            targetDate: targetDate ? new Date(targetDate) : null,
            targetShift: targetShift || null,
            items: {
                create: items.map(item => ({
                    materialName: item.materialName,
                    qtyPallets: item.qtyPallets,
                    qtyPcs: item.qtyPcs || null,
                    targetBlockRowId: item.targetBlockRowId || null,
                    status: "pending",
                })),
            },
        },
        include: { items: true },
    });
    return spb;
}
/**
 * Get all Manual SPBs with optional status filter
 */
export async function getManualSpbs(status, page = 1, limit = 50) {
    const where = {};
    if (status)
        where.status = status;
    const skip = (page - 1) * limit;
    const [data, totalCount] = await Promise.all([
        db.manualSpb.findMany({
            where,
            include: { items: { include: { scans: true } } },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        db.manualSpb.count({ where })
    ]);
    return {
        data,
        metadata: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        }
    };
}
/**
 * Get a single Manual SPB by ID
 */
export async function getManualSpbById(id) {
    return db.manualSpb.findUnique({
        where: { id },
        include: { items: { include: { scans: true } } },
    });
}
/**
 * Process/scan an item from Manual SPB (Dispatch from Warehouse)
 * Consumes from WMS and marks as "shipping"
 */
export async function processSpbItem(itemId, barcode, pcs, supplier, targetBlockRowId) {
    return db.$transaction(async (tx) => {
        const item = await tx.manualSpbItem.findUnique({
            where: { id: itemId },
            include: { spb: true },
        });
        if (!item)
            throw new Error(`Item SPB ID ${itemId} tidak ditemukan`);
        if (item.status === "completed")
            throw new Error("Item ini sudah selesai (terima di Transit)");
        if (item.scannedPallets >= item.qtyPallets)
            throw new Error("Kuota pengiriman (scan) untuk item ini sudah terpenuhi");
        console.log(`[ManualSPB] Dispatching item ${itemId} (${item.materialName}) with barcode ${barcode}`);
        // Check duplicate barcode in manual scans
        if (barcode && barcode !== "-") {
            const existingScan = await tx.manualSpbScan.findUnique({ where: { barcode } });
            if (existingScan)
                throw new Error(`Barcode ${barcode} sudah pernah diproses di SPB Manual ini/lainnya`);
            const existingUsed = await tx.usedBarcode.findUnique({ where: { barcode } });
            if (existingUsed)
                throw new Error(`Barcode ${barcode} sudah pernah digunakan di sistem (Duplikasi)`);
        }
        // 1. Consume from WMS
        await warehouseService.consumeFromWMS(item.materialName, 1, barcode, tx);
        // 2. Create Shipping Scan (Wait for Transit Receipt)
        await tx.manualSpbScan.create({
            data: {
                manualSpbItemId: itemId,
                barcode: barcode !== "-" ? barcode : null,
                pcs,
                supplier: supplier || "-",
                targetBlockRowId: targetBlockRowId || item.targetBlockRowId || null,
                status: "shipping"
            }
        });
        // 3. Update scanned count
        const newScanned = item.scannedPallets + 1;
        await tx.manualSpbItem.update({
            where: { id: itemId },
            data: {
                scannedPallets: newScanned,
                status: "processing", // Changed from "completed" to "processing" until received
            },
        });
        return {
            success: true,
            message: `Berhasil dispatch ${pcs} pcs ${item.materialName}. Menunggu penerimaan di Transit (${newScanned}/${item.qtyPallets} palet dikirim)`,
            isComplete: false, // Item is only complete after transit receipt
        };
    }, { timeout: 20000 });
}
/**
 * Receive a manual SPB barcode at Transit
 */
export async function receiveSpbScan(barcode, actualPcs) {
    return db.$transaction(async (tx) => {
        // 1. Find the scan record
        const scan = await tx.manualSpbScan.findUnique({
            where: { barcode },
            include: {
                item: {
                    include: { spb: true }
                }
            }
        });
        if (!scan)
            return null; // Not a manual SPB scan
        if (scan.status === "received")
            throw new Error(`Barcode ${barcode} sudah pernah diterima di Transit`);
        console.log(`[ManualSPB] Receiving barcode ${barcode} at Transit for SPB ${scan.item.spb.spbNumber}`);
        // 2. Physically receive to Transit Stock
        await transitService.receiveToTransit(scan.item.materialName, 1, barcode, actualPcs, `SPB Manual: ${scan.item.spb.spbNumber}`, scan.targetBlockRowId || undefined, scan.supplier || "-", tx);
        // 3. Mark scan as received
        await tx.manualSpbScan.update({
            where: { id: scan.id },
            data: { status: "received" }
        });
        // 4. Update item received count
        const item = scan.item;
        const newReceived = item.receivedPallets + 1;
        const isItemComplete = newReceived >= item.qtyPallets;
        await tx.manualSpbItem.update({
            where: { id: item.id },
            data: {
                receivedPallets: newReceived,
                status: isItemComplete ? "completed" : "processing"
            }
        });
        // 5. Check if entire SPB is completed
        const allItems = await tx.manualSpbItem.findMany({
            where: { spbId: item.spbId }
        });
        const allComplete = allItems.every((i) => {
            if (i.id === item.id)
                return isItemComplete;
            return i.status === "completed";
        });
        if (allComplete) {
            await tx.manualSpb.update({
                where: { id: item.spbId },
                data: { status: "completed", updatedAt: new Date() }
            });
        }
        return {
            success: true,
            message: `Berhasil terima ${actualPcs} pcs ${item.materialName} untuk SPB ${scan.item.spb.spbNumber}`,
            spbNumber: scan.item.spb.spbNumber,
            isSpbComplete: allComplete
        };
    }, { timeout: 20000 });
}
/**
 * Delete a Manual SPB (only if no items have been scanned)
 */
export async function deleteManualSpb(id) {
    const spb = await db.manualSpb.findUnique({
        where: { id },
        include: { items: true },
    });
    if (!spb)
        return { success: false, message: "SPB tidak ditemukan" };
    const hasScanned = spb.items.some((i) => i.scannedPallets > 0);
    if (hasScanned)
        return { success: false, message: "Tidak dapat menghapus SPB yang sudah diproses" };
    await db.manualSpbItem.deleteMany({ where: { spbId: id } });
    await db.manualSpb.delete({ where: { id } });
    return { success: true, message: "SPB Manual berhasil dihapus" };
}
/**
 * Get manual SPB scan details by barcode
 */
export async function getManualSpbScanByBarcode(barcode) {
    return db.manualSpbScan.findUnique({
        where: { barcode },
        include: {
            item: {
                include: { spb: true }
            }
        }
    });
}
