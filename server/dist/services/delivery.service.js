import { db } from "../config/database.js";
import * as masterService from "./master.service.js";
import * as warehouseService from "./warehouse.service.js";
import * as transitService from "./transit.service.js";
// ═══════════════════════════════════════════
//  DELIVERY LIFECYCLE
// ═══════════════════════════════════════════
export async function getOrCreateDelivery(date, shiftKey, slotId, initialItems = []) {
    const compositeKey = `${date}_${shiftKey}_${slotId}`;
    // Check if exists
    const existing = await db.delivery.findUnique({
        where: { compositeKey },
        include: { items: true, scans: true }
    });
    if (existing) {
        return existing;
    }
    // Create new delivery
    const delivery = await db.delivery.create({
        data: {
            compositeKey,
            date: new Date(date),
            shiftKey,
            slotId,
            status: "preparing",
            items: {
                create: initialItems.map(item => ({
                    materialName: item.material,
                    requiredPallets: item.required,
                }))
            }
        },
        include: { items: true, scans: true }
    });
    return delivery;
}
export async function addDeliveryItem(deliveryId, materialName, requiredPallets) {
    return db.deliveryItem.create({
        data: { deliveryId, materialName, requiredPallets }
    });
}
export async function getActiveDeliveries() {
    return db.delivery.findMany({
        include: { items: true, scans: true }
    });
}
export async function getDeliveryById(id) {
    return db.delivery.findUnique({
        where: { id },
        include: { items: true, scans: true }
    });
}
export async function scanDeliveryItem(deliveryId, material, barcode, qtyPallet, pcs, supplier, targetBlockRowId) {
    const uom = await masterService.getMaterialUOM(material);
    return db.$transaction(async (tx) => {
        // Find delivery
        const delivery = await tx.delivery.findUnique({
            where: { id: deliveryId },
            include: { items: true }
        });
        if (!delivery)
            return { success: false, message: "Delivery tidak ditemukan" };
        if (delivery.status !== "preparing")
            return { success: false, message: "Status delivery tidak valid untuk scan" };
        // Find the item
        const item = delivery.items.find((i) => i.materialName === material);
        if (!item)
            return { success: false, message: `Material ${material} tidak dibutuhkan pada delivery ini` };
        // Check duplicate barcode across all deliveries
        if (barcode && barcode !== "-") {
            const existingScan = await tx.deliveryScan.findUnique({ where: { barcode } });
            if (existingScan)
                return { success: false, message: `Barcode ${barcode} sudah pernah di-scan` };
        }
        // Update scanned count
        const currentScanned = parseFloat(String(item.scannedPallets || "0"));
        const newScanned = currentScanned + qtyPallet;
        if (newScanned > parseFloat(String(item.requiredPallets || "0"))) {
            return { success: false, message: `Kuota Penuh! Anda mencoba men-scan ${newScanned} pallet, melebih target kebutuhan (${item.requiredPallets} pallet) untuk shift/slot ini.` };
        }
        // Record the scan
        await tx.deliveryScan.create({
            data: {
                deliveryId,
                deliveryItemId: item.id,
                barcode: barcode !== "-" ? barcode : null,
                qtyPallet,
                uom,
                pcs,
                supplier,
                targetBlockRowId,
            }
        });
        await tx.deliveryItem.update({
            where: { id: item.id },
            data: { scannedPallets: newScanned }
        });
        // Check if delivery is fully scanned
        const updatedItems = await tx.deliveryItem.findMany({ where: { deliveryId } });
        const isComplete = updatedItems.every((i) => {
            const scanned = parseFloat(String(i.scannedPallets || "0"));
            return scanned >= i.requiredPallets - 0.001;
        });
        if (isComplete) {
            await tx.delivery.update({
                where: { id: deliveryId },
                data: { status: "delivering", updatedAt: new Date() }
            });
        }
        return { success: true, message: `Berhasil scan ${pcs} ${uom} ${material}`, isComplete };
    }, { timeout: 20000 });
}
export async function validateDelivery(deliveryId) {
    const delivery = await db.delivery.findUnique({
        where: { id: deliveryId },
        include: { scans: true }
    });
    if (!delivery || delivery.status !== "delivering") {
        return { success: false, message: "Delivery tidak valid untuk divalidasi" };
    }
    // Verify and transfer stock physically from WMS to Transit
    for (const scan of delivery.scans) {
        const item = await db.deliveryItem.findUnique({ where: { id: scan.deliveryItemId } });
        if (item && item.materialName) {
            // 1. Potong stock dari WMS Gudang Aktual — capture consumed items for MID/dateIn tracking
            const consumed = await warehouseService.consumeFromWMS(item.materialName, scan.qtyPallet, scan.barcode || "-");
            // Extract MID and dateIn from original warehouse record
            const sourceMid = consumed.length > 0 ? consumed[0].mid : undefined;
            const sourceDateInGudang = consumed.length > 0 ? consumed[0].dateIn : undefined;
            // 2. Terima ke Transit — pass original MID and dateInGudang
            await transitService.receiveToTransit(item.materialName, scan.qtyPallet, scan.barcode || "-", parseFloat(String(scan.pcs || "0")), "Distribus Bahan WMS", scan.targetBlockRowId || undefined, scan.supplier || "-", undefined, sourceMid, sourceDateInGudang);
        }
    }
    await db.delivery.update({
        where: { id: deliveryId },
        data: { status: "completed", updatedAt: new Date() }
    });
    return { success: true, message: "Delivery berhasil divalidasi, material masuk ke Transit." };
}
export async function refreshDelivery(date, shiftKey, slotId, initialItems = []) {
    const compositeKey = `${date}_${shiftKey}_${slotId}`;
    // Only refresh if preparing and no scans
    const existing = await db.delivery.findUnique({
        where: { compositeKey },
        include: { items: true }
    });
    if (existing && existing.status === "preparing") {
        const hasScans = existing.items.some((i) => parseFloat(String(i.scannedPallets || "0")) > 0);
        if (!hasScans) {
            await db.deliveryItem.deleteMany({ where: { deliveryId: existing.id } });
            await db.delivery.delete({ where: { id: existing.id } });
        }
    }
    return getOrCreateDelivery(date, shiftKey, slotId, initialItems);
}
export async function isBarcodeInActiveDelivery(barcode) {
    if (!barcode || barcode === "-")
        return null;
    const scans = await db.deliveryScan.findMany({ where: { barcode } });
    if (scans.length === 0)
        return null;
    for (const scan of scans) {
        const delivery = await db.delivery.findUnique({ where: { id: scan.deliveryId } });
        if (delivery && (delivery.status === "delivering" || delivery.status === "preparing")) {
            const item = await db.deliveryItem.findUnique({ where: { id: scan.deliveryItemId } });
            return { delivery, scan, item };
        }
    }
    return null;
}
