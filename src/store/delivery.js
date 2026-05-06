/* ===== PMC Store - Delivery ===== */
import './core.js';
((PMCStore) => {
  // Use direct PMCStore access to avoid destructuring closure bugs during modular load
  const API_BASE = PMCStore.API_BASE;
  const emit = PMCStore.emit;
  const safeFetch = PMCStore.safeFetch;
  // ── Transit Outbound System (Multi-Destination) ──
  async function loadTransitOutboundPendingFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/outbound/pending`);
      if (res.ok) {
        PMCStore.transitOutboundPending = await res.json();
        PMCStore.emit('outboundPendingChanged');
      }
    } catch (err) {
      console.warn('Error fetching transit outbound pending:', err);
    }
  }

  async function requestTransitOutbound(barcode, destination, targetLine = null) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/outbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, destination, targetLine })
      });
      const data = await res.json();
      
      if (data.success) {
         await PMCStore.loadTransitInfoFromAPI();
         await PMCStore.loadTransitOutboundPendingFromAPI();
         PMCStore.emit('stockChanged');
      }
      return data;
    } catch (err) {
       console.error('Request transit outbound error:', err);
       return { success: false, message: err.message };
    }
  }

  async function requestWarehouseOutbound(barcode, destination) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/warehouse/outbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, destination })
      });
      const data = await res.json();
      
      if (data.success) {
         await PMCStore.loadWarehouseStockFromAPI();
         await PMCStore.loadTransitOutboundPendingFromAPI();
         PMCStore.emit('stockChanged');
      }
      return data;
    } catch (err) {
       console.error('Request warehouse outbound error:', err);
       return { success: false, message: err.message };
    }
  }


  async function verifyTransitOutbound(id, action) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/outbound/${encodeURIComponent(id)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      if (data.success) {
         await PMCStore.loadTransitOutboundPendingFromAPI();
         await PMCStore.loadWarehouseStockFromAPI();
         await PMCStore.loadTransitInfoFromAPI();
         // Wait! We also need to emit external onhand change. The backend isn't sending events.
         // Usually we emit('storeDataChanged') or rely on reload. Let's just emit stockChanged.
         PMCStore.emit('stockChanged');
      }
      return data;
    } catch (err) {
       console.error('Verify transit outbound error:', err);
       return { success: false, message: err.message };
    }
  }

  function getExternalOnhand(dest) {
    return PMCStore.externalOnhand[dest] || { stock: {}, barcodes: [] };
  }

  // ── Line-Based Material Priority ──
  function getLineMaterialRequirements(date) {
    const filtered = PMCStore.schedules.filter(s => s.date === date);
    const agg = {};
    
    filtered.forEach(s => {
      const bom = PMCStore.getBOM(s.skuId);
      if (!bom) return;
      bom.components.forEach(comp => {
         const key = s.line + '_' + comp.name;
         if (!agg[key]) agg[key] = { line: s.line, material: comp.name, sh1: 0, sh2: 0, sh3: 0, buffer: 0 };
         
         const sh1 = PMCStore.applyRounding(s.sh1 * comp.coefficient, comp.rounding);
         const sh2 = PMCStore.applyRounding(s.sh2 * comp.coefficient, comp.rounding);
         const sh3 = PMCStore.applyRounding(s.sh3 * comp.coefficient, comp.rounding);
         
         const activeShifts = (s.sh1 > 0 ? 1 : 0) + (s.sh2 > 0 ? 1 : 0) + (s.sh3 > 0 ? 1 : 0);
         const shiftDivisor = activeShifts === 0 ? 1 : activeShifts;
         const avgShiftBox = (s.sh1 + s.sh2 + s.sh3) / shiftDivisor;
         const bufferBox = (avgShiftBox / 7) * 2;
         const buffer = PMCStore.applyRounding(bufferBox * comp.coefficient, comp.rounding);
         
         agg[key].sh1 += sh1;
         agg[key].sh2 += sh2;
         agg[key].sh3 += sh3;
         agg[key].buffer += buffer;
      });
    });
    return Object.values(agg);
  }

  function getTransitStockPerLine() {
     // Pastikan data transit info tersinkronisasi
     PMCStore.getTransitInfo();
     
     const stockPerLineMat = {}; 
     for (const bId in PMCStore.transitStock) {
        for (const rId in PMCStore.transitStock[bId]) {
           const rData = PMCStore.transitStock[bId][rId];
           if (!rData.material || rData.qty <= 0) continue;
           
           const layoutBlock = PMCStore.blockLayout.find(b => String(b.id) === String(bId));
           if (layoutBlock) {
             const row = layoutBlock.rows.find(r => String(r.id) === String(rId));
             if (row && row.lines && row.lines.length > 0) {
               row.lines.forEach(line => {
                 const key = line + '_' + rData.material;
                 if (!stockPerLineMat[key]) stockPerLineMat[key] = { qty: 0, pcs: 0 };
                 stockPerLineMat[key].qty += rData.qty;
                 stockPerLineMat[key].pcs += (rData.pcs || 0);
               });
             } else {
               const key = 'UNASSIGNED_' + rData.material;
               if (!stockPerLineMat[key]) stockPerLineMat[key] = { qty: 0, pcs: 0 };
               stockPerLineMat[key].qty += rData.qty;
               stockPerLineMat[key].pcs += (rData.pcs || 0);
             }
           }
        }
     }
     return stockPerLineMat;
  }

  function getLogicalDateStr() {
    const d = new Date();
    // If before 07:00 AM, consider it part of the previous day's production schedule
    if (d.getHours() * 60 + d.getMinutes() < 420) {
      d.setDate(d.getDate() - 1);
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Menghitung daftar prioritas request material ke gudang.
   * Membandingkan stok aktual di transit vs buffer kebutuhan pengiriman per jam.
   * @param {string} dateStr - format YYYY-MM-DD
   * @returns {Promise<Array>} array of { material, blockLabel, actual, incoming, bufferPallets, palletQty, status }
   */
  async function getPriorityAlerts(dateStrArg) {
    const dateStr = dateStrArg || getLogicalDateStr();
    let lineReqs = [];
    try { lineReqs = getLineMaterialRequirements(dateStr); } catch (e) { console.warn('Priority lineReqs error:', e); }
    
    // Also build a material-level buffer map (sum across all lines)
    const materialBufferMap = {};
    lineReqs.forEach(r => {
      if (!materialBufferMap[r.material]) materialBufferMap[r.material] = { buffer: 0, hasSchedule: false };
      materialBufferMap[r.material].buffer += r.buffer;
      if (r.sh1 > 0 || r.sh2 > 0 || r.sh3 > 0) materialBufferMap[r.material].hasSchedule = true;
    });
    
    const layout = PMCStore.getBlockLayout();
    const priorityData = [];

    layout.forEach(block => {
      block.rows.forEach(row => {
        if (!row.material) return;
        
        const lines = (row.lines && row.lines.length > 0) ? row.lines : (row.assignedLines && row.assignedLines.length > 0) ? row.assignedLines : [];
        
        let totalBuffer = 0;
        let hasSchedule = false;
        
        if (lines.length > 0) {
          // Match by specific line + material
          lines.forEach(line => {
            const req = lineReqs.find(r => r.line === line && r.material === row.material);
            if (req) {
              totalBuffer += req.buffer;
              if (req.sh1 > 0 || req.sh2 > 0 || req.sh3 > 0) hasSchedule = true;
            }
          });
        }
        
        // Fallback: if no lines assigned or no match found, use material-level buffer
        if (totalBuffer <= 0 && materialBufferMap[row.material]) {
          totalBuffer = materialBufferMap[row.material].buffer;
          hasSchedule = materialBufferMap[row.material].hasSchedule;
        }
        
        if (!hasSchedule || totalBuffer <= 0) return;

        const twoHourPcs = totalBuffer;
        const oneHourPcs = Math.ceil(twoHourPcs / 2);
        const palletQty = PMCStore.getPalletQty(row.material) || 1;

        const oneHourPallets = Math.ceil(oneHourPcs / palletQty);
        const twoHourPallets = Math.ceil(twoHourPcs / palletQty);
        const kritisPcs = oneHourPcs;
        const warningPcs = twoHourPcs;

        // Get actual stock from PMCStore.transitStock (hydrated from API)
        const ts = PMCStore.transitStock;
        const rData = ts[block.id] && ts[block.id][row.id];
        const stActPcs = rData ? (rData.pcs || (rData.qty || 0) * palletQty) : 0;

        let incomingPcs = 0;
        PMCStore.activeDeliveries.forEach(d => {
          if (d.status === 'delivering' || d.status === 'preparing') {
            const itm = d.items.find(i => i.material === row.material);
            if (itm) incomingPcs += (itm.scanned * palletQty);
          }
        });

        const isKritis = stActPcs < kritisPcs;
        const isWarning = stActPcs < warningPcs && !isKritis;

        if (isKritis || isWarning) {
          priorityData.push({
            material: row.material,
            blockLabel: `B${block.blockNumber || block.id}.${row.rowNumber || row.id}`,
            actual: Math.round(stActPcs),
            incoming: Math.round(incomingPcs),
            bufferPallets: isKritis ? oneHourPallets : twoHourPallets,
            palletQty,
            status: isKritis ? 'KRITIS' : 'WARNING'
          });
        }
      });
    });

    priorityData.sort((a, b) => (a.status === 'KRITIS' && b.status !== 'KRITIS' ? -1 : 1));
    return priorityData;
  }

  function getSupplierForMaterial(materialName) {
    if (!materialName) return '-';
    
    // 1. Cek dari riwayat stok gudang (Paling akurat)
    const fromWarehouse = PMCStore.warehouseInventory.find(w => (w.material === materialName || w.materialName === materialName) && w.supplier && w.supplier !== '-');
    if (fromWarehouse) return fromWarehouse.supplier;

    // 2. Cek dari Master SKU (Cari SKU yang menggunakan material ini di BOM)
    for (const bom of PMCStore.bomData) {
      if (bom.components && bom.components.some(c => c.name === materialName)) {
        const sku = PMCStore.getSKU(bom.skuId);
        if (sku && sku.supplierName) return sku.supplierName;
      }
    }
    
    // 3. Cek dari PMCStore.supplierList jika ada mapping langsung (opsional, jika ada)
    return '-';
  }

  function deleteTransitInventoryItem(id) {
    const idx = PMCStore.transitInventory.findIndex(t => t.id === id);
    if (idx === -1) return { success: false, message: 'Item tidak ditemukan' };
    const item = PMCStore.transitInventory[idx];
    if (PMCStore.transitStock[item.material] !== undefined) {
      PMCStore.transitStock[item.material] = Math.max(0, (PMCStore.transitStock[item.material] || 0) - (item.palletsAvailable || 1));
      if (PMCStore.transitStock[item.material] === 0) delete PMCStore.transitStock[item.material];
    }
    PMCStore.transitInventory.splice(idx, 1);
    PMCStore.emit('transitChanged');
    return { success: true, message: 'Item berhasil dihapus dari Transit' };
  }

  async function relocateTransitPallet(barcode, targetBlockRowId) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/relocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, targetBlockRowId })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Gagal menghubungi server: ' + err.message };
    }
  }

  function deleteAllTransitInventory() {
    PMCStore.transitInventory = [];
    PMCStore.transitStock = {};
    PMCStore.emit('transitChanged');
    return { success: true, message: 'Semua stok Transit berhasil dihapus' };
  }

  async function reconcileStock(material, actualPcs, blockId = null, rowId = null) {
    if (!blockId || !rowId) {
      throw new Error('Reconcile requires specific Block and Row.');
    }

    const today = new Date().toISOString().split('T')[0];
    
    // We create a minimal entries array for the target row
    // In our system, stock check is per-pallet. But since we just want to align the total PCS:
    // We treat it as 1 pallet with the total target PCS for that row.
    const entries = [{
      blockRowId: rowId,
      palletIndex: 0,
      quantity: String(actualPcs)
    }];

    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/stock-check/${today}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });
      const data = await res.json();
      if (res.ok) {
        await PMCStore.loadTransitInfoFromAPI();
        if (typeof PMCStore.loadStockMutationsFromAPI === 'function') {
          await PMCStore.loadStockMutationsFromAPI();
        }
        PMCStore.emit('transitChanged');
        PMCStore.emit('stockChanged');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Gagal sinkronisasi' };
      }
    } catch (err) {
      console.error('Reconcile error:', err);
      return { success: false, message: err.message };
    }
  }

   async function getManualSpbs(status, page = 1, limit = 50) {
    try {
      const url = new URL(`${PMCStore.API_BASE}/manual-spb`);
      if (status) url.searchParams.append('status', status);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      
      const res = await PMCStore.safeFetch(url);
      if (!res.ok) throw new Error('Gagal mengambil data SPB Manual');
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.error('getManualSpbs error:', err);
      return [];
    }
  }

  async function saveManualSpb(data) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/manual-spb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('saveManualSpb error:', err);
      return { success: false, message: err.message };
    }
  }

  async function deleteManualSpb(id) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/manual-spb/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      console.error('deleteManualSpb error:', err);
      return { success: false, message: err.message };
    }
  }

  async function scanManualSpbItem(itemId, barcode, pcs, supplier, targetBlockRowId) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/manual-spb/${itemId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, pcs, supplier, targetBlockRowId })
      });
      const data = await res.json();
      if (data.success) {
        PMCStore.emit('deliveryChanged');
      }
      return data;
    } catch (err) {
      console.error('scanManualSpbItem error:', err);
      return { success: false, message: err.message };
    }
  }

  async function isBarcodeInActiveManualSpb(barcode) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/manual-spb/receive?barcode=${encodeURIComponent(barcode)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('isBarcodeInActiveManualSpb error:', err);
      return null;
    }
  }

  async function receiveManualSpbScan(barcode, actualPcs) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/manual-spb/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, actualPcs })
      });
      const data = await res.json();
      if (data && data.success) {
         await PMCStore.loadTransitInfoFromAPI();
         PMCStore.emit('transitChanged');
         PMCStore.emit('stockChanged');
      }
      return data;
    } catch (err) {
      console.error('receiveManualSpbScan error:', err);
      return { success: false, message: err.message };
    }
  }

  async function calculateShiftProgress(shiftKey, dateStr) {
    if (!dateStr) dateStr = PMCStore.getLogicalDateStr();
    
    // 1. Dapatkan Total SPB Keseluruhan Shift (diukur dalam Pcs)
    const hourlyData = await PMCStore.getHourlyDistribution(dateStr);
    let totalSPBPcs = 0;
    
    if (hourlyData && hourlyData.length > 0) {
      hourlyData.forEach(mat => {
        if (mat.slots && mat.slots[shiftKey]) {
          mat.slots[shiftKey].forEach(slot => {
            totalSPBPcs += (slot.pallets || 0); // Menjumlahkan pcs dari seluruh slot di shift ini
          });
        }
      });
    }

    // 2. Dapatkan Total Scanned Pcs dari seluruh delivery grup di shift tersebut (masuk transit)
    const allDeliveries = PMCStore.activeDeliveries;
    const prefix = `${dateStr}_${shiftKey}`;
    const shiftDeliveries = allDeliveries.filter(d => {
      if (d.compositeKey && d.compositeKey.startsWith(prefix)) return true;
      if (d.date === dateStr && d.shiftKey === shiftKey) return true;
      return false;
    });
    
    let totalScannedPcs = 0;
    shiftDeliveries.forEach(d => {
      // Extrak nomor slot dari compositeKey (misal '2026-04-05_SH2_1' -> '1')
      let slotIdx = 1;
      if (d.compositeKey) {
        const parts = d.compositeKey.split('_');
        if (parts.length >= 3) slotIdx = parseInt(parts[2]) || 1;
      }
      
      (d.items || []).forEach(deliveryItem => {
         const matName = deliveryItem.materialName || deliveryItem.material;
         let scannedPalletsCnt = 0;
         if (deliveryItem.scans) {
           deliveryItem.scans.forEach(s => {
             scannedPalletsCnt += (s.qtyPallet || 1);
           });
         }
         
         if (scannedPalletsCnt > 0 && hourlyData) {
           const matData = hourlyData.find(m => m.name === matName);
           if (matData && matData.slots && matData.slots[shiftKey] && matData.slots[shiftKey][slotIdx - 1]) {
             const slotDetails = matData.slots[shiftKey][slotIdx - 1].details || [];
             let pcs = 0;
             for (let j = 0; j < Math.min(scannedPalletsCnt, slotDetails.length); j++) {
               pcs += (slotDetails[j].qty || 0);
             }
             if (scannedPalletsCnt > slotDetails.length && slotDetails.length > 0) {
               const avgPcs = (matData.slots[shiftKey][slotIdx - 1].pallets || 0) / slotDetails.length;
               pcs += (scannedPalletsCnt - slotDetails.length) * avgPcs;
             }
             totalScannedPcs += pcs;
           }
         }
      });
    });
    
    return totalSPBPcs > 0 ? Math.round((totalScannedPcs / totalSPBPcs) * 100) : 0;
  }

// Auto-Exports
  PMCStore.getManualSpbs = getManualSpbs;
  PMCStore.saveManualSpb = saveManualSpb;
  PMCStore.deleteManualSpb = deleteManualSpb;
  PMCStore.scanManualSpbItem = scanManualSpbItem;
  PMCStore.isBarcodeInActiveManualSpb = isBarcodeInActiveManualSpb;
  PMCStore.receiveManualSpbScan = receiveManualSpbScan;
  PMCStore.calculateShiftProgress = calculateShiftProgress;
  PMCStore.loadTransitOutboundPendingFromAPI = loadTransitOutboundPendingFromAPI;
  PMCStore.requestTransitOutbound = requestTransitOutbound;
  PMCStore.requestWarehouseOutbound = requestWarehouseOutbound;
  PMCStore.verifyTransitOutbound = verifyTransitOutbound;
  PMCStore.getExternalOnhand = getExternalOnhand;
  PMCStore.getLineMaterialRequirements = getLineMaterialRequirements;
  PMCStore.getTransitStockPerLine = getTransitStockPerLine;
  PMCStore.getLogicalDateStr = getLogicalDateStr;
  PMCStore.getPriorityAlerts = getPriorityAlerts;
  PMCStore.getSupplierForMaterial = getSupplierForMaterial;
  PMCStore.deleteTransitInventoryItem = deleteTransitInventoryItem;
  PMCStore.relocateTransitPallet = relocateTransitPallet;
  PMCStore.deleteAllTransitInventory = deleteAllTransitInventory;
  PMCStore.reconcileStock = reconcileStock;

})(window.PMCStore);