import { db } from "../config/database.js";
import * as masterService from "./master.service.js";
import { todayStr, nowTimeStr } from "../utils/format.js";
import { broadcastEvent } from "../config/socket.js";

export async function getTransitInfo() {
  const layout = await masterService.getFullBlockLayout();
  const liveStock = await db.transitStockLive.findMany();
  const inventory = await db.transitInventory.findMany({
    where: { blockRowId: { not: null } },
    select: { barcode: true, materialName: true, pcs: true, blockRowId: true, palletsAvailable: true }
  });
  const info = { blocks: [] as any[], materials: {} as Record<string, number>, materialsPcs: {} as Record<string, number> };

  for (const block of layout) {
    const bInfo = { id: block.id, blockNumber: block.blockNumber, rows: [] as any[] };
    for (const row of block.rows) {
      const rowLive = liveStock.filter((l: any) => l.blockRowId === row.id);
      const totalQty = rowLive.reduce((sum, l) => sum + (l.qtyPallets || 0), 0);
      const totalPcs = rowLive.reduce((sum, l) => sum + parseFloat(String(l.pcs || "0")), 0);
      
      // For display: if multiple materials exist, show "MIXED" or list them
      let mat = row.materialName || null;
      if (rowLive.length > 0) {
        if (rowLive.length === 1) {
          mat = rowLive[0].materialName;
        } else {
          mat = "MIXED STOCK";
        }
      }

      // Barcode-level detail from inventory
      const rowInventory = inventory.filter(inv => inv.blockRowId === row.id);

      bInfo.rows.push({ 
        id: row.id, 
        rowNumber: row.rowNumber, 
        maxPallets: row.maxPallets, 
        material: mat, 
        qty: totalQty, 
        pcs: totalPcs, 
        available: Math.max(0, row.maxPallets - totalQty),
        isFlexible: row.isFlexible || false,
        contents: rowLive.map(l => ({ material: l.materialName, qty: l.qtyPallets })),
        barcodes: rowInventory.map(inv => ({ barcode: inv.barcode, material: inv.materialName, pcs: parseFloat(String(inv.pcs || "0")), pallets: inv.palletsAvailable }))
      });

      for (const l of rowLive) {
        if (l.materialName) {
          info.materials[l.materialName] = (info.materials[l.materialName] || 0) + l.qtyPallets;
          info.materialsPcs[l.materialName] = (info.materialsPcs[l.materialName] || 0) + parseFloat(String(l.pcs || "0"));
        }
      }
    }
    info.blocks.push(bInfo);
  }
  return info;
}

export async function getTransitInventory() {
  const items = await db.transitInventory.findMany({ orderBy: { createdAt: 'asc' } });
  
  // Background repair: if there are items with missing/dash supplier or mid, try to fix them in DB
  const missingObj = items.filter(i => !i.supplier || i.supplier === "-" || !i.mid || i.mid === "-");
  if (missingObj.length > 0) {
    repairTransitData(missingObj.map(m => m.id)).catch(err => console.warn('Repair transit data failed', err));
  }
  
  return items;
}

/**
 * Background utility to fill in missing supplier names and mids using history/master data
 */
async function repairTransitData(ids: string[]) {
  const itemsList = await db.transitInventory.findMany({
    where: { id: { in: ids } },
    select: { id: true, materialName: true, supplier: true, mid: true, barcode: true }
  });

  for (const item of itemsList) {
    let resolvedSupplier = item.supplier || "-";
    let resolvedMid = item.mid || "-";
    
    // 1. Precise match by barcode if it exists directly in warehouse
    if (item.barcode && item.barcode !== "-") {
      const wRef = await db.warehouseInventory.findFirst({ where: { barcode: item.barcode } });
      if (wRef) {
        if (resolvedSupplier === "-" && wRef.supplierName) resolvedSupplier = wRef.supplierName;
        if (resolvedMid === "-" && wRef.mid) resolvedMid = wRef.mid;
      }
    }

    // 2. Try Warehouse Inventory history (most reliable source for material)
    if (resolvedSupplier === "-" || resolvedMid === "-") {
      const warehouseRef = await db.warehouseInventory.findFirst({
        where: { materialName: item.materialName, NOT: { supplierName: "-" } },
        orderBy: { createdAt: 'desc' }
      });
      if (warehouseRef) {
        if (resolvedSupplier === "-" && warehouseRef.supplierName) resolvedSupplier = warehouseRef.supplierName;
        if (resolvedMid === "-" && warehouseRef.mid) resolvedMid = warehouseRef.mid;
      }
    }
    
    // 3. Try to find other transit records for SAME material that HAVE a supplier/mid
    if (resolvedSupplier === "-" || resolvedMid === "-") {
      const otherTransit = await db.transitInventory.findFirst({
        where: { materialName: item.materialName, NOT: { supplier: "-" } },
        orderBy: { createdAt: 'desc' }
      });
      if (otherTransit) {
        if (resolvedSupplier === "-" && otherTransit.supplier && otherTransit.supplier !== "-") resolvedSupplier = otherTransit.supplier;
        if (resolvedMid === "-" && otherTransit.mid && otherTransit.mid !== "-") resolvedMid = otherTransit.mid;
      }
    }

    if (resolvedSupplier !== item.supplier || resolvedMid !== item.mid) {
      const updateData: any = {};
      if (resolvedSupplier !== item.supplier) updateData.supplier = resolvedSupplier;
      if (resolvedMid !== item.mid) updateData.mid = resolvedMid;
      await db.transitInventory.update({
        where: { id: item.id },
        data: updateData
      }).catch(() => {});
    }
  }
}

export async function receiveToTransit(material: string, qtyPallet: number, barcode: string, actualPcs: number | null, source = "Gudang -> Transit", targetBlockRowId?: string, supplier: string = "-", tx?: any, midOverride?: string, dateInGudangOverride?: Date) {
  const client = tx || db;
  const layout = await masterService.getFullBlockLayout(client);
  const liveStock = await client.transitStockLive.findMany();
  const candidates: any[] = [];
  let explicitTarget: any = null;

  for (const block of layout) {
    for (const row of block.rows) {
      if (row.id === targetBlockRowId) {
        const live = liveStock.find((l: any) => l.blockRowId === row.id);
        explicitTarget = { blockRow: row, block, qty: live?.qtyPallets || 0, maxPallets: row.maxPallets, liveId: live?.id };
      }
      if (row.materialName === material && !row.isFlexible) {
        const live = liveStock.find((l: any) => l.blockRowId === row.id);
        candidates.push({ blockRow: row, block, qty: live?.qtyPallets || 0, maxPallets: row.maxPallets, liveId: live?.id });
      }
    }
  }

  let target = explicitTarget;

  if (!target) {
    if (candidates.length === 0) return { success: false, message: `Tidak ada blok untuk ${material}.` };
    candidates.sort((a, b) => a.qty - b.qty);
    target = candidates.find((c: any) => c.qty + qtyPallet <= c.maxPallets);
    if (!target) {
      return { success: false, message: `Kapasitas Transit Penuh (Stock Over) untuk material ${material}. Tidak dapat dialokasikan.` };
    }
  }
  const defPQ = await masterService.getPalletQty(material, client);
  const pcsAdd = actualPcs !== null ? actualPcs : qtyPallet * defPQ;

  if (target.liveId) {
    const live = liveStock.find((l: any) => l.id === target.liveId)!;
    await client.transitStockLive.update({
      where: { id: target.liveId },
      data: { materialName: material, qtyPallets: live.qtyPallets + qtyPallet, pcs: String(parseFloat(String(live.pcs || "0")) + pcsAdd) }
    });
  } else {
    await client.transitStockLive.create({
      data: { blockRowId: target.blockRow.id, materialName: material, qtyPallets: qtyPallet, pcs: String(pcsAdd) }
    });
  }

  if (barcode && barcode !== "-") {
    await markBarcodeUsed(barcode, tx);
  }

  // Resolve MID and dateInGudang: use overrides, or look up from warehouse inventory by barcode
  let resolvedMid = midOverride || "-";
  let resolvedDateInGudang = dateInGudangOverride || null;

  if ((resolvedMid === "-" || !resolvedDateInGudang) && barcode && barcode !== "-") {
    try {
      // Look up the original warehouse record by barcode to get MID and dateIn
      const warehouseRef = await db.warehouseInventory.findFirst({
        where: { barcode },
        select: { mid: true, dateIn: true }
      });
      if (warehouseRef) {
        if (resolvedMid === "-" && warehouseRef.mid) resolvedMid = warehouseRef.mid;
        if (!resolvedDateInGudang && warehouseRef.dateIn) resolvedDateInGudang = warehouseRef.dateIn;
      }
    } catch (_err) {
      // Warehouse record may already be deleted after consumeFromWMS, that's OK
    }
  }

  const timeInStr = nowTimeStr();
  await client.transitInventory.create({
    data: {
      materialName: material,
      barcode: barcode,
      mid: resolvedMid,
      dateInGudang: resolvedDateInGudang || new Date(todayStr()),
      dateInTransit: new Date(todayStr()),
      timeInTransit: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
      palletsAvailable: qtyPallet,
      pcs: String(pcsAdd),
      supplier: supplier,
      blockId: target.block.id,
      blockRowId: target.blockRow.id
    }
  });

  const uom = await masterService.getMaterialUOM(material, client);
  
  // Categorize source
  let sourceCat = "WAREHOUSE";
  if (source.includes("Retur SISA")) sourceCat = "RETURN_PARTIAL";
  else if (source.includes("Retur UTUH")) sourceCat = "RETURN_FULL";
  else if (source.includes("Ditolak dari")) sourceCat = "REJECTED_OUTBOUND";

  await client.stockMutation.create({
    data: { 
      date: new Date(todayStr()), 
      time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`), 
      type: "IN", 
      source: sourceCat,
      materialName: material, 
      qty: String(pcsAdd), 
      uom, 
      line: source, 
      skuId: "-", 
      barcode,
      blockId: target.block.id,
      blockRowId: target.blockRow.id
    }
  });

  broadcastEvent('transit_stock_updated', { source: 'receiveToTransit', material });
  
  return { success: true, message: `Diterima ${qtyPallet} pallet ${material}.`, blockId: target.block.id, blockRowId: target.blockRow.id };
}

export async function takeFromTransit(material: string, qty: number, line?: string, forcedPcs?: number, tx?: any, barcode?: string) {
  const client = tx || db;
  const uom = await masterService.getMaterialUOM(material, client);
  const palletQty = await masterService.getPalletQty(material, client);
  const allRows = await client.blockRow.findMany();

  let remaining = qty;

  // 1. Handle specific barcode if provided
  if (barcode && barcode !== "-") {

    const inv = await client.transitInventory.findFirst({ where: { barcode, materialName: material } });
    if (inv) {
      const take = Math.min(remaining, inv.palletsAvailable);
      const actualInvPcs = inv.pcs ? parseFloat(String(inv.pcs)) : (inv.palletsAvailable * palletQty);
      const pcsTaken = (forcedPcs !== undefined && remaining <= take) ? forcedPcs : (inv.palletsAvailable > 0 ? (parseFloat(String(forcedPcs || "0")) || Math.round(take * (actualInvPcs / inv.palletsAvailable))) : 0);
      
      // Update Live Stock for this specific row
      if (inv.blockRowId) {
        const live = await client.transitStockLive.findFirst({ where: { blockRowId: inv.blockRowId, materialName: material } });
        if (live) {
          await client.transitStockLive.update({
            where: { id: live.id },
            data: { 
              qtyPallets: Math.max(0, live.qtyPallets - take), 
              pcs: String(Math.max(0, Math.round(parseFloat(String(live.pcs || "0")) - pcsTaken))) 
            }
          });

          // Record mutation
          const row = allRows.find((r: any) => r.id === inv.blockRowId);
          if (row) {
            const timeInStr = nowTimeStr();
            await client.stockMutation.create({
              data: {
                date: new Date(todayStr()),
                time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
                type: "OUT",
                source: "PRODUCTION",
                materialName: material,
                qty: String(Math.round(pcsTaken)),
                uom,
                line: line || "Produksi",
                skuId: "-",
                barcode: barcode,
                blockId: row.blockId,
                blockRowId: row.id
              }
            });
          }
        }
      }

      // Update/Delete detail inventory
      if (take >= inv.palletsAvailable) {
        await client.transitInventory.delete({ where: { id: inv.id } });
      } else {
        await client.transitInventory.update({
          where: { id: inv.id },
          data: { palletsAvailable: inv.palletsAvailable - take }
        });
      }
      
      remaining -= take;
    }
  }

  // 2. FIFO Fallback (if remaining qty > 0)
  if (remaining > 0) {
    const liveStock = await client.transitStockLive.findMany({ 
      where: { materialName: material },
      orderBy: { qtyPallets: 'desc' } // or any logic to pick which block to take first
    });

    for (const stock of liveStock) {
      if (remaining <= 0) break;
      if (stock.qtyPallets <= 0) continue;
      const take = Math.min(remaining, stock.qtyPallets);
      const ppp = await masterService.getPalletQty(material, client);
      const pcsTaken = (forcedPcs !== undefined && remaining <= take) ? forcedPcs : Math.round(take * ppp);

      await client.transitStockLive.update({
        where: { id: stock.id },
        data: { 
          qtyPallets: stock.qtyPallets - take, 
          pcs: String(Math.max(0, Math.round(parseFloat(String(stock.pcs || "0")) - pcsTaken))) 
        }
      });

      const row = allRows.find((r: any) => r.id === stock.blockRowId);
      if (row) {
        const timeInStr = nowTimeStr();
        await client.stockMutation.create({
          data: {
            date: new Date(todayStr()),
            time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
            type: "OUT",
            source: "PRODUCTION",
            materialName: material,
            qty: String(Math.round(pcsTaken)),
            uom,
            line: line || "Produksi",
            skuId: "-",
            barcode: "-",
            blockId: row.blockId,
            blockRowId: row.id
          }
        });
      }
      remaining -= take;
    }

    // Secondary cleanup of Detail Inventory (FIFO)
    let remT = qty - (qty - remaining); // what's left to deduct from details
    if (remT > 0) {
      const details = await client.transitInventory.findMany({ 
        where: { materialName: material }, 
        orderBy: { createdAt: 'asc' } 
      });
      for (const i of details) {
        if (remT <= 0) break;
        const take = Math.min(i.palletsAvailable, remT);
        if (take >= i.palletsAvailable) await client.transitInventory.delete({ where: { id: i.id } });
        else await client.transitInventory.update({ where: { id: i.id }, data: { palletsAvailable: i.palletsAvailable - take } });
        remT -= take;
      }
    }
  }

  if (remaining > 0) {
    broadcastEvent('transit_stock_updated', { source: 'takeFromTransit', material, warning: 'Insufficient' });
    return { success: false, message: `Stok ${material} kurang ${remaining} pallet.` };
  }

  broadcastEvent('transit_stock_updated', { source: 'takeFromTransit', material });
  return { success: true, message: `Diambil ${qty} pallet ${material}.` };
}

export async function markBarcodeUsed(barcode: string, tx?: any) {
  const client = tx || db;
  // Try to insert cleanly
  const existing = await client.usedBarcode.findUnique({ where: { barcode } });
  if (!existing) {
    await client.usedBarcode.create({ data: { barcode } }).catch(() => {});
  }
}
export async function isBarcodeUsed(barcode: string) {
  const e = await db.usedBarcode.findUnique({ where: { barcode } });
  return !!e;
}
export async function getUsedBarcodes() { return db.usedBarcode.findMany(); }

export async function getStockCheck(date: string) {
  const check = await db.stockCheck.findFirst({
    where: { checkDate: new Date(date) },
    include: { entries: true }
  });
  return check;
}

export async function saveStockCheck(date: string, entries: Array<{ blockRowId: string; palletIndex: number; quantity: string | null }>, checkedBy?: string) {
  let check = await db.stockCheck.findFirst({
    where: { checkDate: new Date(date) },
  });

  if (check) {
    // If exists, clear old entries
    await db.stockCheckEntry.deleteMany({ where: { stockCheckId: check.id } });
    // Optional: update checkedBy
    if (checkedBy) {
      await db.stockCheck.update({ where: { id: check.id }, data: { checkedBy } });
    }
  } else {
    // If not exists, create new
    check = await db.stockCheck.create({ data: { checkDate: new Date(date), checkedBy } });
  }

  // Insert new entries
  if (entries.length > 0) {
    await db.stockCheckEntry.createMany({
      data: entries.map(e => ({
        stockCheckId: check!.id,
        blockRowId: e.blockRowId,
        palletIndex: e.palletIndex,
        quantity: e.quantity
      }))
    });
  }
  
  // Sync to Live DB if check is for today
  if (date === todayStr()) {
    // 1. Calculate old totals for provided rows before deleting
    const targetRowIds = Array.from(new Set(entries.map(e => e.blockRowId)));
    const oldLive = await db.transitStockLive.findMany({ where: { blockRowId: { in: targetRowIds } } });
    const oldTotals: Record<string, number> = {};
    oldLive.forEach(l => {
      if (l.materialName) {
        oldTotals[l.materialName] = (oldTotals[l.materialName] || 0) + parseFloat(String(l.pcs || "0"));
      }
    });

    // ONLY DELETE RECORDS FOR THE TARGET ROWS
    await db.transitStockLive.deleteMany({ where: { blockRowId: { in: targetRowIds } } });
    await db.transitInventory.deleteMany({ where: { blockRowId: { in: targetRowIds } } });
    
    const allRows = await db.blockRow.findMany();
    const agg: Record<string, { pcs: number, pallets: number, material: string }> = {};
    
    // 2. Aggregate new entries
    for (const e of entries) {
       if (!e.quantity) continue;
       const val = parseFloat(e.quantity);
       if (isNaN(val) || val <= 0) continue; // Skip empty/zero pallets

       const rowDef = allRows.find(r => r.id === e.blockRowId);
       const matName = rowDef?.materialName;
       if (!matName) continue;

       if (!agg[e.blockRowId]) agg[e.blockRowId] = { pcs: 0, pallets: 0, material: matName };
       agg[e.blockRowId].pcs += val;
       agg[e.blockRowId].pallets += 1;
    }
    
    // 3. Insert new live stock and inventory
    for (const [rid, data] of Object.entries(agg)) {
       const rowDef = allRows.find(r => r.id === rid)!;
       
       await db.transitStockLive.create({
          data: {
            blockRowId: rid,
            materialName: data.material,
            qtyPallets: data.pallets,
            pcs: String(parseFloat(data.pcs.toFixed(4))) // Ensure no floating point mess
          }
       });
       
       // Lookup supplier name to avoid "-" if possible
       let resolvedSupplier = "-";
       const lastInv = await db.warehouseInventory.findFirst({
         where: { materialName: data.material },
         orderBy: { createdAt: 'desc' },
         select: { supplierName: true }
       });
       if (lastInv?.supplierName) {
         resolvedSupplier = lastInv.supplierName;
       } else {
         const lastTransit = await db.transitInventory.findFirst({
           where: { materialName: data.material, NOT: { supplier: "-" } },
           orderBy: { createdAt: 'desc' },
           select: { supplier: true }
         });
         if (lastTransit?.supplier) resolvedSupplier = lastTransit.supplier;
       }

       const timeInStr = nowTimeStr();
       for (let i = 0; i < data.pallets; i++) {
         await db.transitInventory.create({
           data: {
             materialName: data.material,
             barcode: "INV-" + date.replace(/-/g, "") + "-" + Date.now().toString(36).toUpperCase() + "-" + i,
             mid: "-",
             dateInGudang: new Date(date),
             dateInTransit: new Date(date),
             timeInTransit: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
             palletsAvailable: 1,
             pcs: String(data.pcs / data.pallets),
             supplier: resolvedSupplier,
             blockId: rowDef.blockId,
             blockRowId: rid
           }
         });
       }
    }

    // 4. Calculate NEW totals PER ROW and record adjustments
    const newTotalsByRow: Record<string, Record<string, number>> = {}; // rowId -> material -> qty
    for (const [rid, data] of Object.entries(agg)) {
       if (!newTotalsByRow[rid]) newTotalsByRow[rid] = {};
       newTotalsByRow[rid][data.material] = (newTotalsByRow[rid][data.material] || 0) + data.pcs;
    }

    // 5. Calculate OLD totals PER ROW
    const oldTotalsByRow: Record<string, Record<string, number>> = {};
    for (const l of oldLive) {
      if (!l.materialName || !l.blockRowId) continue;
      if (!oldTotalsByRow[l.blockRowId]) oldTotalsByRow[l.blockRowId] = {};
      oldTotalsByRow[l.blockRowId][l.materialName] = (oldTotalsByRow[l.blockRowId][l.materialName] || 0) + parseFloat(String(l.pcs || "0"));
    }

    const allRowIds = new Set([...Object.keys(oldTotalsByRow), ...Object.keys(newTotalsByRow)]);
    const allRowsMap = Object.fromEntries(allRows.map(r => [r.id, r]));

    for (const rid of allRowIds) {
      const oldMatMap = oldTotalsByRow[rid] || {};
      const newMatMap = newTotalsByRow[rid] || {};
      const allMats = new Set([...Object.keys(oldMatMap), ...Object.keys(newMatMap)]);
      const rowDef = allRowsMap[rid];

      for (const material of allMats) {
        const oldQty = oldMatMap[material] || 0;
        const newQty = newMatMap[material] || 0;
        const delta = Math.round((newQty - oldQty) * 10000) / 10000;

        if (Math.abs(delta) > 0.0001) {
          const uom = await masterService.getMaterialUOM(material);
          const timeInStr = nowTimeStr();
          await db.stockMutation.create({
            data: {
              date: new Date(todayStr()),
              time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
              type: "ADJUST",
              source: "STOCK_CHECK",
              materialName: material,
              qty: String(delta), // USE SIGNED DELTA
              uom,
              line: "Stock Check Adjustment",
              skuId: "-",
              barcode: "ADJUSTMENT",
              blockId: rowDef?.blockId || null,
              blockRowId: rid
            }
          });
        }
      }
    }
  }

  return check;
}

export async function getMutationReport(filters: { material?: string; startDate?: string; endDate?: string; line?: string; blockId?: string; blockRowId?: string } = {}, page: number = 1, limit: number = 50) {
  const where: any = {};
  if (filters?.material && filters.material !== "ALL") where.materialName = filters.material;
  if (filters?.line && filters.line !== "ALL") where.line = filters.line;
  if (filters?.blockId && filters.blockId !== "ALL") where.blockId = filters.blockId;
  if (filters?.blockRowId && filters.blockRowId !== "ALL") where.blockRowId = filters.blockRowId;
  
  // Exclude line-specific mutations from transit mutation report
  where.source = { notIn: ['PROD_BPP', 'LINE_REJECT', 'LINE_OPNAME'] };
  
  if (filters?.startDate && filters?.endDate) {
    where.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate)
    };
  } else if (filters?.startDate) {
    where.date = { gte: new Date(filters.startDate) };
  } else if (filters?.endDate) {
    where.date = { lte: new Date(filters.endDate) };
  }

  const skip = (page - 1) * limit;

  const [data, totalCount] = await Promise.all([
    db.stockMutation.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ],
      skip,
      take: limit
    }),
    db.stockMutation.count({ where })
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

export async function requestTransitOutbound(barcode: string, destination: string, targetLine?: string) {
  const inv = await db.transitInventory.findFirst({ where: { barcode } });
  if (!inv) return { success: false, message: `Barcode ${barcode} tidak di Transit.` };
  await db.transitInventory.delete({ where: { id: inv.id } });
  const defPQ = await masterService.getPalletQty(inv.materialName);
  const pcs = inv.pcs ? parseFloat(String(inv.pcs)) : (inv.palletsAvailable * defPQ);
  const uom = await masterService.getMaterialUOM(inv.materialName);
  const timeInStr = nowTimeStr();
  await db.stockMutation.create({
    data: { 
      date: new Date(todayStr()), 
      time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`), 
      type: "OUT", 
      source: "OUTBOUND",
      materialName: inv.materialName, 
      qty: String(pcs), 
      uom, 
      line: `Transit -> ${destination}`, 
      skuId: "-", 
      barcode,
      blockId: inv.blockId,
      blockRowId: inv.blockRowId
    }
  });
  await db.transitOutboundPending.create({
    data: { 
      barcode, materialName: inv.materialName, supplier: inv.supplier, pcs: String(pcs), 
      destination, targetLine, date: new Date(todayStr()), time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`), 
      blockId: inv.blockId, blockRowId: inv.blockRowId, status: "pending" 
    }
  });
  return { success: true, message: `Dikirim ke ${destination}. Menunggu verifikasi.` };
}

export async function getTransitOutboundPending() { return db.transitOutboundPending.findMany({ where: { status: "pending" } }); }

export async function verifyTransitOutbound(id: string, action: "accept" | "reject") {
  const outb = await db.transitOutboundPending.findUnique({ where: { id } });
  if (!outb) return { success: false, message: "Tidak ditemukan" };
  if (action === "accept") {
    await db.transitOutboundPending.update({ where: { id }, data: { status: "accepted" }});
    return { success: true, message: `Confirmed barcode ${outb.barcode}.` };
  }
  const pcs = parseFloat(String(outb.pcs || "0"));
  await receiveToTransit(outb.materialName, 1, outb.barcode, pcs, `Ditolak dari ${outb.destination}`);
  const timeInStr = nowTimeStr();
  await db.transitInventory.create({
    data: { materialName: outb.materialName, barcode: outb.barcode, mid: "-", dateInGudang: new Date(todayStr()), dateInTransit: new Date(todayStr()), timeInTransit: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`), palletsAvailable: 1, pcs: outb.pcs ? String(outb.pcs) : null, supplier: outb.supplier || "-", blockId: outb.blockId, blockRowId: outb.blockRowId }
  });
  await db.transitOutboundPending.update({ where: { id }, data: { status: "rejected" } });
  return { success: true, message: `Barcode ${outb.barcode} dikembalikan.` };
}

export async function relocateTransitPallet(barcode: string, targetBlockRowId: string, user?: string) {
  return await db.$transaction(async (client) => {
    const inv = await client.transitInventory.findFirst({
      where: { barcode },
      include: { blockLayout: true, blockRow: true }
    });

    if (!inv) throw new Error("Barcode tidak ditemukan di Area Transit.");
    if (inv.blockRowId === targetBlockRowId) throw new Error("Barcode sudah berada di blok tujuan.");

    const targetRow = await client.blockRow.findUnique({
      where: { id: targetBlockRowId },
      include: { blockLayout: true }
    });

    if (!targetRow) throw new Error("Baris tujuan tidak ditemukan.");

    // Validate capacity (sum of all materials in this row)
    const rowLiveStock = await client.transitStockLive.findMany({
      where: { blockRowId: targetBlockRowId }
    });
    const totalCurrentQty = rowLiveStock.reduce((sum: number, l: any) => sum + (l.qtyPallets || 0), 0);
    
    if (totalCurrentQty + inv.palletsAvailable > targetRow.maxPallets) {
      throw new Error(`Kapasitas blok tujuan (${targetRow.blockLayout.blockNumber}.${targetRow.rowNumber}) penuh.`);
    }

    // Check material restriction for non-flexible rows
    if (!targetRow.isFlexible && totalCurrentQty > 0) {
       const existingMat = rowLiveStock[0].materialName;
       if (existingMat !== inv.materialName) {
          throw new Error(`Blok tujuan sudah berisi material lain (${existingMat}).`);
       }
    }

    const liveTargetForThisMaterial = rowLiveStock.find((l: any) => l.materialName === inv.materialName);

    const defPQ = await masterService.getPalletQty(inv.materialName, client as any);
    const pcsMove = inv.pcs ? parseFloat(String(inv.pcs)) : (inv.palletsAvailable * defPQ);

    // Deduct old row
    if (inv.blockRowId) {
      const oldLive = await client.transitStockLive.findFirst({
        where: { blockRowId: inv.blockRowId, materialName: inv.materialName }
      });
      if (oldLive) {
        if (oldLive.qtyPallets <= inv.palletsAvailable) {
          await client.transitStockLive.delete({ where: { id: oldLive.id } });
        } else {
          await client.transitStockLive.update({
            where: { id: oldLive.id },
            data: { 
              qtyPallets: oldLive.qtyPallets - inv.palletsAvailable,
              pcs: String(parseFloat(String(oldLive.pcs || "0")) - pcsMove)
            }
          });
        }
      }
    }

    // Add to new row
    if (liveTargetForThisMaterial) {
      await client.transitStockLive.update({
        where: { id: liveTargetForThisMaterial.id },
        data: { 
          qtyPallets: liveTargetForThisMaterial.qtyPallets + inv.palletsAvailable,
          pcs: String(parseFloat(String(liveTargetForThisMaterial.pcs || "0")) + pcsMove)
        }
      });
    } else {
      await client.transitStockLive.create({
        data: {
          blockRowId: targetBlockRowId,
          materialName: inv.materialName,
          qtyPallets: inv.palletsAvailable,
          pcs: String(pcsMove)
        }
      });
    }

    // Update TransitInventory
    await client.transitInventory.update({
      where: { id: inv.id },
      data: {
        blockId: targetRow.blockId,
        blockRowId: targetRow.id
      }
    });

    const uom = await masterService.getMaterialUOM(inv.materialName, client as any);
    const timeInStr = nowTimeStr();

    const oldLocStr = inv.blockLayout && inv.blockRow ? `B${inv.blockLayout.blockNumber}.${inv.blockRow.rowNumber}` : 'Unknown';
    const newLocStr = targetRow.blockLayout ? `B${targetRow.blockLayout.blockNumber}.${targetRow.rowNumber}` : 'Unknown';

    // Mutation 1: OUT from Old Location
    if (inv.blockId && inv.blockRowId) {
      await client.stockMutation.create({
        data: {
          date: new Date(todayStr()),
          time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
          type: "OUT",
          source: "RELOKASI",
          materialName: inv.materialName,
          qty: String(pcsMove),
          uom: uom,
          line: `Relokasi Keluar (➔ ${newLocStr})`,
          skuId: "-",
          barcode: barcode,
          blockId: inv.blockId,
          blockRowId: inv.blockRowId
        }
      });
    }

    // Mutation 2: IN to New Location
    await client.stockMutation.create({
      data: {
        date: new Date(todayStr()),
        time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
        type: "IN",
        source: "RELOKASI",
        materialName: inv.materialName,
        qty: String(pcsMove),
        uom: uom,
        line: `Relokasi Masuk (⬅ ${oldLocStr})`, 
        skuId: "-",
        barcode: barcode,
        blockId: targetRow.blockId,
        blockRowId: targetRow.id
      }
    });
    return { 
      success: true, 
      message: `Berhasil merelokasi ${inv.palletsAvailable} pallet ${inv.materialName} ke B${targetRow.blockLayout.blockNumber}.${targetRow.rowNumber}.` 
    };
  });
}

// -------------------------------------------
//  TRANSIT OPNAME (STOCK CHECK BLOK)
// -------------------------------------------

export async function getTransitOpnames(filters: { blockId?: string } = {}) {
  const where: any = {};
  if (filters.blockId) where.blockId = filters.blockId;

  return await db.transitOpname.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true
    }
  });
}

export async function saveTransitOpname(payload: { date: string, type: string, blockId: string, checkedBy?: string, items: any[] }) {
  return await db.$transaction(async (tx) => {
    // 1. Create Opname record
    const opname = await tx.transitOpname.create({
      data: {
        date: new Date(payload.date),
        type: payload.type,
        blockId: payload.blockId,
        checkedBy: payload.checkedBy,
        items: {
          create: payload.items.map(item => ({
            blockRowId: item.blockRowId,
            materialName: item.materialName,
            qtyBook: String(item.qtyBook),
            qtyPhysical: String(item.qtyPhysical),
            delta: String(item.qtyPhysical - item.qtyBook),
            calculatorNotes: item.calculatorNotes
          }))
        }
      },
      include: { items: true }
    });

    const timeInStr = nowTimeStr();

    // 2. Process Delta and Update Live Stock & Log Mutations
    for (const item of payload.items) {
      const delta = item.qtyPhysical - item.qtyBook;

      if (Math.abs(delta) > 0.0001) {
        // Find Live Stock for this row and material
        const live = await tx.transitStockLive.findFirst({
          where: { blockRowId: item.blockRowId, materialName: item.materialName }
        });

        if (live) {
          // Update existing
          await tx.transitStockLive.update({
            where: { id: live.id },
            data: {
              pcs: String(item.qtyPhysical)
            }
          });
        } else if (item.qtyPhysical > 0) {
          // Create if physical is found but book was 0
          // For pallets, we make an estimate since it's blind pieces check
          const defPQ = await masterService.getPalletQty(item.materialName, tx as any);
          const p = Math.ceil(item.qtyPhysical / defPQ);
          await tx.transitStockLive.create({
             data: {
               blockRowId: item.blockRowId,
               materialName: item.materialName,
               qtyPallets: p,
               pcs: String(item.qtyPhysical)
             }
          });
        }

        const uom = await masterService.getMaterialUOM(item.materialName, tx as any);

        // Record stock mutation
        await tx.stockMutation.create({
          data: {
            date: new Date(payload.date),
            time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
            type: "ADJUST",
            source: "TRANSIT_OPNAME",
            materialName: item.materialName,
            qty: String(delta), // Save the delta for ADJUST
            uom,
            line: `Opname Blok ${payload.type}`,
            skuId: "-",
            barcode: "ADJUSTMENT",
            blockId: payload.blockId,
            blockRowId: item.blockRowId
          }
        });
      }
    }

    broadcastEvent('transit_stock_updated', { source: 'saveTransitOpname', blockId: payload.blockId });

    return { success: true, message: `Opname berhasil disimpan dan stok telah disesuaikan.` };
  });
}

export async function updateTransitOpnameItem(opnameId: string, itemId: string, newQtyPhysical: number, editedBy: string) {
  return await db.$transaction(async (tx) => {
    const item = await tx.transitOpnameItem.findUnique({
      where: { id: itemId },
      include: { opname: true }
    });
    if (!item) throw new Error("Item opname tidak ditemukan");

    const oldPhysical = parseFloat(String(item.qtyPhysical));
    const deltaCorrection = newQtyPhysical - oldPhysical;
    if (Math.abs(deltaCorrection) < 0.0001) {
      return { success: true, message: "Tidak ada perubahan qty." };
    }

    const newDelta = newQtyPhysical - parseFloat(String(item.qtyBook));
    const newNotes = item.calculatorNotes ? `${item.calculatorNotes} | [EDIT] => ${newQtyPhysical} (by ${editedBy})` : `[EDIT] => ${newQtyPhysical} (by ${editedBy})`;

    await tx.transitOpnameItem.update({
      where: { id: itemId },
      data: {
        qtyPhysical: String(newQtyPhysical),
        delta: String(newDelta),
        calculatorNotes: newNotes
      }
    });

    const live = await tx.transitStockLive.findFirst({
      where: { blockRowId: item.blockRowId, materialName: item.materialName }
    });

    if (live) {
      const newLivePcs = Math.max(0, parseFloat(String(live.pcs || "0")) + deltaCorrection);
      await tx.transitStockLive.update({
        where: { id: live.id },
        data: { pcs: String(newLivePcs) }
      });
    } else if (newQtyPhysical > 0) {
      const defPQ = await masterService.getPalletQty(item.materialName, tx as any);
      const p = Math.ceil(newQtyPhysical / defPQ);
      await tx.transitStockLive.create({
         data: {
           blockRowId: item.blockRowId,
           materialName: item.materialName,
           qtyPallets: p,
           pcs: String(newQtyPhysical)
         }
      });
    }

    const uom = await masterService.getMaterialUOM(item.materialName, tx as any);
    const timeInStr = nowTimeStr();

    await tx.stockMutation.create({
      data: {
        date: new Date(todayStr()),
        time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
        type: "ADJUST",
        source: "TRANSIT_OPNAME",
        materialName: item.materialName,
        qty: String(deltaCorrection),
        uom,
        line: `Koreksi Audit Opname`,
        skuId: "-",
        barcode: "ADJUSTMENT",
        blockId: item.opname.blockId,
        blockRowId: item.blockRowId
      }
    });

    broadcastEvent('transit_stock_updated', { source: 'updateTransitOpnameItem', blockId: item.opname.blockId });

    return { success: true, message: "Koreksi audit berhasil disimpan dan stok terupdate." };
  });
}
