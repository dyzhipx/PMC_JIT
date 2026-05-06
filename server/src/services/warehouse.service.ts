import { db } from "../config/database.js";
import { getNextBarcodeRange, getNextMID } from "../utils/barcode.js";
import { todayStr, nowTimeStr } from "../utils/format.js";
import { broadcastEvent } from "../config/socket.js";
import * as masterService from "./master.service.js";

// ═══════════════════════════════════════════
//  WAREHOUSE STOCK
// ═══════════════════════════════════════════
export async function getWarehouseStock() {
  return db.warehouseInventory.findMany({
    orderBy: { dateIn: 'asc' }
  });
}

export async function addWarehouseStock(data: {
  material: string;
  supplier: string;
  supplierId?: string;
  qtyPerPallet: number;
  palletsTotal: number;
  dateIn?: string;
}) {
  const mid = await getNextMID();
  const barcodeRange = await getNextBarcodeRange(data.palletsTotal);
  const timeInStr = nowTimeStr();
  const timeIn = new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`);
  const dateIn = new Date(data.dateIn || todayStr());

  const inserted = [];
  for (let i = 0; i < data.palletsTotal; i++) {
    const barcode = barcodeRange.barcodes[i];
    const row = await db.warehouseInventory.create({
        data: {
          mid,
          barcode,
          materialName: data.material,
          supplierName: data.supplier,
          supplierId: data.supplierId || null,
          qtyPerPallet: data.qtyPerPallet,
          palletsAvailable: 1,
          dateIn,
          timeIn,
        }
    });
    inserted.push(row);
  }

  broadcastEvent('warehouse_stock_updated', { source: 'addWarehouseStock', material: data.material });
  return { mid, barcodeRange, items: inserted };
}

export async function deleteWarehouseStock(id: string) {
  await db.warehouseInventory.delete({ where: { id } });
}

export async function consumeFromWMS(material: string, qtyPallet: number, barcode?: string, tx?: any) {
  const consumed = [];
  const client = tx || db;

  if (barcode && barcode !== "-") {
    // Find specific pallet by barcode
    const item = await client.warehouseInventory.findUnique({
      where: { barcode }
    });

    if (item && item.palletsAvailable > 0) {
      const take = Math.min(item.palletsAvailable, qtyPallet);
      consumed.push({ ...item, taken: take });

      const newAvail = item.palletsAvailable - take;
      if (newAvail <= 0) {
        await client.warehouseInventory.delete({ where: { id: item.id } });
      } else {
        await client.warehouseInventory.update({
           where: { id: item.id },
           data: { palletsAvailable: newAvail }
        });
      }
    }
  } else {
    // FIFO fallback
    let remaining = qtyPallet;
    const stock = await client.warehouseInventory.findMany({
      where: { materialName: material },
      orderBy: { dateIn: 'asc' }
    });

    for (const item of stock) {
      if (remaining <= 0) break;
      if (item.palletsAvailable <= 0) continue;

      const take = Math.min(item.palletsAvailable, remaining);
      consumed.push({ ...item, taken: take });
      remaining -= take;

      const newAvail = item.palletsAvailable - take;
      if (newAvail <= 0) {
        await client.warehouseInventory.delete({ where: { id: item.id } });
      } else {
        await client.warehouseInventory.update({
           where: { id: item.id },
           data: { palletsAvailable: newAvail }
        });
      }
    }
  }

  broadcastEvent('warehouse_stock_updated', { source: 'consumeFromWMS', material });
  return consumed;
}

/**
 * Get current system counters.
 */
export async function getCounters() {
  const countBar = await db.systemCounter.findUnique({ where: { id: "barcode_counter" }});
  const countMid = await db.systemCounter.findUnique({ where: { id: "mid_counter" }});
  return {
    barcodeCounter: countBar?.value ?? 0,
    midCounter: countMid?.value ?? 0
  };
}

/**
 * Initialize system counters if they don't exist.
 */
export async function ensureCounters() {
  const countBar = await db.systemCounter.findUnique({ where: { id: "barcode_counter" }});
  if (!countBar) await db.systemCounter.create({ data: { id: "barcode_counter", value: 0 }});
  
  const countMid = await db.systemCounter.findUnique({ where: { id: "mid_counter" }});
  if (!countMid) await db.systemCounter.create({ data: { id: "mid_counter", value: 0 }});
}

// ═══════════════════════════════════════════
//  WAREHOUSE OUTBOUND (MULTI-DESTINATION)
// ═══════════════════════════════════════════
export async function requestWarehouseOutbound(barcode: string, destination: string) {
  const inv = await db.warehouseInventory.findFirst({ where: { barcode } });
  if (!inv) return { success: false, message: `Barcode ${barcode} tidak ada di Gudang.` };
  if (inv.palletsAvailable <= 0) return { success: false, message: `Barcode ${barcode} sudah kosong.` };
  
  // Consume 1 pallet (since warehouse uses 1 barcode per pallet)
  const newAvail = inv.palletsAvailable - 1;
  if (newAvail <= 0) {
    await db.warehouseInventory.delete({ where: { id: inv.id } });
  } else {
    await db.warehouseInventory.update({
      where: { id: inv.id },
      data: { palletsAvailable: newAvail }
    });
  }
  
  const uom = await masterService.getMaterialUOM(inv.materialName);
  const timeInStr = nowTimeStr();
  const defPQ = await masterService.getPalletQty(inv.materialName);
  const pcs = Number(inv.qtyPerPallet || defPQ);

  await db.stockMutation.create({
    data: { 
      date: new Date(todayStr()), 
      time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`), 
      type: "OUT", 
      source: "OUTBOUND_GUDANG",
      materialName: inv.materialName, 
      qty: String(pcs), 
      uom: uom,
      line: `Gudang -> ${destination}`, 
      skuId: "-", 
      barcode,
      blockId: null,
      blockRowId: null
    }
  });

  await db.transitOutboundPending.create({
    data: { 
      barcode, 
      materialName: inv.materialName, 
      supplier: inv.supplierName || "-", 
      pcs: String(pcs), 
      destination, 
      targetLine: null, 
      date: new Date(todayStr()), 
      time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`), 
      status: "pending" 
    }
  });

  broadcastEvent('warehouse_stock_updated', { source: 'requestWarehouseOutbound', material: inv.materialName });
  broadcastEvent('outboundPendingChanged', { source: 'warehouseOutbound' });

  return { success: true, message: `Dikirim ke ${destination}. Menunggu verifikasi penerimaan.` };
}
