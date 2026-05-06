/* ===== PMC Store - Production ===== */
import './core.js';
((PMCStore) => {
  // Use direct PMCStore access to avoid destructuring closure bugs during modular load
  const API_BASE = PMCStore.API_BASE;
  const emit = PMCStore.emit;
  // ── Line Production State ──
  // Format: { 'A': { 'Karton Mocca': { qty: 2, pcs: 1000 } } } // qty in pallets, pcs in base unit
  
  
  // Track barcodes moved to a line
  // Format: { barcode: '12345', material: 'Material', line: 'A', pcs: 500, dateIn: 'YYYY-MM-DD', timeIn: 'HH:MM:SS' }
  

  // Track pending returns from Production Line to Transit
  

  async function loadLineStockFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/stock`);
      if (res.ok) {
        const data = await res.json();
        // Transform [{ line, materialName, qtyPallets, pcs }] to nested object expected by frontend
        let newStock = {};
        data.forEach(item => {
           if(!newStock[item.line]) newStock[item.line] = {};
           newStock[item.line][item.materialName] = { 
               qty: item.qtyPallets, 
               pcs: parseFloat(item.pcs || 0) 
           };
        });
        PMCStore.lineStock = newStock;
        PMCStore.emit('stockChanged');
      }
    } catch(err) { console.warn('Failed to load line stock', err); }
  }

  async function loadLineBarcodesFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/barcodes`);
      if (res.ok) {
        const data = await res.json();
        PMCStore.lineBarcodes = data.map(d => ({
          ...d,
          material: d.materialName // map to legacy property name
        }));
      }
    } catch(err) { console.warn('Failed to load line barcodes', err); }
  }

  async function loadPendingReturnsFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/returns/pending`);
      if (res.ok) {
        const data = await res.json();
        PMCStore.pendingReturns = data.map(d => ({
          ...d,
          material: d.materialName // map to legacy property name
        }));
        PMCStore.emit('returnsChanged');
      }
    } catch(err) { console.warn('Failed to load pending returns', err); }
  }

  async function loadTransitInventoryFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/inventory`);
      if (res.ok) {
        const data = await res.json();
        PMCStore.transitInventory = (data || []).map(d => ({
          ...d,
          material: d.materialName, // map to legacy property name
          rowId: d.blockRowId       // map to legacy property name
        }));
        PMCStore.emit('transitChanged');
      }
    } catch (err) {
      console.warn('Failed to load transit inventory', err);
    }
  }

  // Track pending outbound from Transit to various destinations
  
  
  // Track specific on-hand stock for External Destinations (3P2, 3F2)

  // ── Active Delivery State ──
  // Format: { id: 'YYYY-MM-DD_SH1_1', date: 'YYYY-MM-DD', shiftKey: 'SH1', slotId: 1, status: 'preparing'|'delivering'|'completed', items: [{ material: 'Mat A', required: 10, scanned: 2 }] }
  

  function getBlockLayout() {
    return JSON.parse(JSON.stringify(PMCStore.blockLayout));
  }

  function saveBlockLayout(layout) {
    PMCStore.blockLayout = JSON.parse(JSON.stringify(layout));
    PMCStore.emit('layoutChanged');

    // Map frontend keys to backend expectations
    const payload = layout.map(b => ({
      blockNumber: b.blockNumber || b.id, // fallback if blockNumber isn't populated
      skuCategories: b.skuCategories || [],
      rows: b.rows.map(r => ({
        rowNumber: r.rowNumber || r.id,
        materialName: r.material,
        maxPallets: r.maxPallets,
        assignedLines: r.lines || r.assignedLines || [],
        isFlexible: r.isFlexible || false
      }))
    }));

    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/block-layout`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: payload })
    })
    .then(res => {
      if(!res.ok) throw new Error('Failed to save layout to DB');
      return PMCStore.loadTransitLayoutFromAPI();
    })
    .catch(err => { console.error(err); alert('Opsi simpan gagal ke database: ' + err.message); });
  }

  function getStockCheck(date) {
    if (!PMCStore.stockChecks[date]) {
      // Build fresh from PMCStore.blockLayout mapping per row
      PMCStore.stockChecks[date] = {
        blocks: PMCStore.blockLayout.map(b => {
          return {
            id: b.id,
            rows: b.rows.filter(r => r.material !== '').map(r => ({
              id: r.id,
              material: r.material,
              maxPallets: r.maxPallets,
              pallets: Array.from({ length: r.maxPallets }, () => '')
            }))
          };
        })
      };
    } else {
      // Sync missing blocks or rows from Layout to existing record
      // without overwriting existing quantities.
      const existing = PMCStore.stockChecks[date].blocks;

      PMCStore.blockLayout.forEach(layoutBlock => {
        let exBlock = existing.find(eb => eb.id === layoutBlock.id);
        if (!exBlock) {
          exBlock = { id: layoutBlock.id, rows: [] };
          existing.push(exBlock);
        }

        // Convert existing item-based structure to row-based structure if it's old
        if (exBlock.items && !exBlock.rows) {
          exBlock.rows = [];
          delete exBlock.items;
        }
        if (!exBlock.rows) exBlock.rows = [];

        layoutBlock.rows.forEach(lRow => {
          if (lRow.material !== '') {
            let exRow = exBlock.rows.find(er => er.id === lRow.id);
            if (!exRow) {
              // Add missing row
              exBlock.rows.push({
                id: lRow.id,
                material: lRow.material,
                maxPallets: lRow.maxPallets,
                pallets: Array.from({ length: lRow.maxPallets }, () => '')
              });
            } else {
              // Update row maxPallets and material definition if it changed
              exRow.material = lRow.material;
              exRow.maxPallets = lRow.maxPallets;
              // Adjust array length if maxPallets changed
              if (exRow.pallets.length < lRow.maxPallets) {
                const diff = lRow.maxPallets - exRow.pallets.length;
                exRow.pallets.push(...Array.from({ length: diff }, () => ''));
              } else if (exRow.pallets.length > lRow.maxPallets) {
                exRow.pallets.length = lRow.maxPallets;
              }
            }
          }
        });

        // Remove rows that no longer have assigned material
        exBlock.rows = exBlock.rows.filter(er => layoutBlock.rows.some(lr => lr.id === er.id && lr.material !== ''));
        exBlock.rows.sort((a, b) => a.id - b.id);
      });
      
      // Clean up deleted layout blocks and old mock data (ids not present in active PMCStore.blockLayout)
      PMCStore.stockChecks[date].blocks = existing.filter(eb => PMCStore.blockLayout.some(lb => lb.id === eb.id));
      PMCStore.stockChecks[date].blocks.sort((a, b) => {
        // Safe numerical sorting for UI if blockNumbers are present
        const lb_a = PMCStore.blockLayout.find(lb => lb.id === a.id);
        const lb_b = PMCStore.blockLayout.find(lb => lb.id === b.id);
        const bnA = lb_a && lb_a.blockNumber ? lb_a.blockNumber : 999;
        const bnB = lb_b && lb_b.blockNumber ? lb_b.blockNumber : 999;
        return bnA - bnB;
      });
    }
    return PMCStore.stockChecks[date];
  }

  function saveStockCheck(date, blocksData) {
    PMCStore.stockChecks[date] = { blocks: JSON.parse(JSON.stringify(blocksData)) };

    // Format for backend
    const entries = [];
    blocksData.forEach(b => {
      (b.rows || []).forEach(r => {
        if (r.id && r.pallets) {
          r.pallets.forEach((qtyVal, idx) => {
            if (qtyVal !== '' && qtyVal !== null && qtyVal !== undefined) {
              entries.push({
                blockRowId: r.id,
                palletIndex: idx,
                quantity: String(qtyVal)
              });
            }
          });
        }
      });
    });

    PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/stock-check/${date}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries })
    })
    .then(async res => {
      if (res.ok) {
        await PMCStore.loadTransitInfoFromAPI();
        if (typeof PMCStore.loadStockMutationsFromAPI === 'function') {
          await PMCStore.loadStockMutationsFromAPI();
        }
        PMCStore.emit('transitChanged');
        PMCStore.emit('stockChanged');
      } else {
        const error = await res.json();
        console.warn('Failed to save stock check to API:', error);
      }
    })
    .catch(err => console.error('Error saving stock check:', err));
  }

  

  async function loadTransitInfoFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/info?t=${Date.now()}`);
      if (res.ok) {
        PMCStore.transitInfoCache = await res.json();
        
        // Hydrate the legacy PMCStore.transitStock object so unmigrated features don't break during Phase 1
        PMCStore.transitStock = {};
        if (PMCStore.transitInfoCache.blocks) {
           PMCStore.transitInfoCache.blocks.forEach(b => {
             PMCStore.transitStock[b.id] = {};
             b.rows.forEach(r => {
               PMCStore.transitStock[b.id][r.id] = { material: r.material, qty: r.qty, pcs: (r.qty * PMCStore.getPalletQty(r.material)) };
             });
           });
        }
      }
      const resUsed = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/used-barcodes`);
      if (resUsed.ok) {
        const dataUsed = await resUsed.json();
        Array.isArray(dataUsed) && dataUsed.forEach(b => PMCStore.usedBarcodes.add(b.barcode));
      }
    } catch (err) {
      console.warn('Error fetching transit info/used barcodes:', err);
    }
    // Always sync barcodes too
    await PMCStore.loadTransitInventoryFromAPI();
  }

  let materialRecehList = [];

  async function loadMaterialRecehFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/material-receh`);
      if (res.ok) {
        const data = await res.json();
        PMCStore.materialReceh = data.map(d => d.materialName);
        PMCStore.emit('configChanged');
      }
    } catch (err) {
      console.warn('Error fetching material receh list:', err);
    }
  }

  async function receiveToTransit(material, qtyPallet = 1, barcode = '-', actualPcs = null, source = 'Gudang -> Transit', supplier = '-') {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material, qtyPallet, barcode, actualPcs, source, supplier })
      });
      const data = await res.json();
      
      if (data.success) {
         await PMCStore.loadTransitInfoFromAPI();
         // Update PMCStore.usedBarcodes in case UI needs to block double scanning immediately
         PMCStore.usedBarcodes.add(barcode);
         PMCStore.emit('transitChanged');
         return data;
      } else {
         return { success: false, message: data.message || 'Gagal tersimpan di database' };
      }
    } catch (err) {
      console.error('Transit API error:', err);
      return { success: false, message: err.message };
    }
  }

  function predictTransitAllocation(material, qtyPallet = 1) {
    // Ghost Capacity Prevention: Tally reserved slots from active deliveries
    const reservedSlots = {}; // { rowId: qty }
    const activeDelivs = PMCStore.activeDeliveries.filter(d => d.status === 'preparing' || d.status === 'delivering');
    for (const d of activeDelivs) {
      if (d.scans) {
        for (const scan of d.scans) {
          if (scan.targetBlockRowId && !PMCStore.usedBarcodes.has(scan.barcode)) {
             const qty = scan.qtyPallet || 1;
             reservedSlots[scan.targetBlockRowId] = (reservedSlots[scan.targetBlockRowId] || 0) + qty;
          }
        }
      }
    }

    let candidates = [];
    for (const block of PMCStore.blockLayout) {
      for (const row of block.rows) {
        // Skip Slowmoving (Flexible) rows from automatic prediction
        if (row.isFlexible) continue;

        if (row.material === material) {
          if (!PMCStore.transitStock[block.id]) PMCStore.transitStock[block.id] = {};
          if (!PMCStore.transitStock[block.id][row.id]) {
            PMCStore.transitStock[block.id][row.id] = { material: null, qty: 0 };
          }
          const rowData = PMCStore.transitStock[block.id][row.id];
          const physicalQty = rowData.qty;
          const reservedQty = reservedSlots[row.id] || 0;
          const totalEffectiveQty = physicalQty + reservedQty;

          if (rowData.material === material || rowData.material === null || rowData.qty === 0) {
            candidates.push({ block, row, qty: totalEffectiveQty, physicalQty, reservedQty, maxPallets: row.maxPallets });
          }
        }
      }
    }
    if (candidates.length === 0) return null;
    
    // Sort by effective quantity (Least-Loaded Load Balancing)
    candidates.sort((a, b) => a.qty - b.qty);
    
    const formatAllocation = (c) => {
      const bNum = (c.block.blockNumber !== undefined && c.block.blockNumber !== null) ? c.block.blockNumber : (c.block.id ? c.block.id.split('-')[0] : '?');
      const rNum = (c.row.rowNumber !== undefined && c.row.rowNumber !== null) ? c.row.rowNumber : (c.row.id ? c.row.id.split('-')[0] : '?');
      return { blockId: bNum, rowId: rNum, _originalBlockId: c.block.id, _originalRowId: c.row.id };
    };

    for (const c of candidates) {
        if (c.qty + qtyPallet <= c.maxPallets) {
          return { ...formatAllocation(c), isFull: false };
        }
    }
    // All rows are conceptually full (Physical + Reserved), lock to the one with the lowest effective load
    return { ...formatAllocation(candidates[0]), isFull: true };
  }

  async function takeFromTransit(material, qty = 1, line = null, skuId = null) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material, qty, line, skuId })
      });
      const data = await res.json();
      
      if (data.success) {
         await PMCStore.loadTransitInfoFromAPI();
         PMCStore.emit('transitChanged');
         return data;
      } else {
         return { success: false, message: data.message || 'Gagal tersimpan di database' };
      }
    } catch (err) {
      console.error('Take API error:', err);
      return { success: false, message: err.message };
    }
  }

  function getTransitInfo() {
    return PMCStore.transitInfoCache;
  }

  function getMutationReport(filters = {}) {
    return PMCStore.transitMutationReportRaw || { reportList: [], summary: {} };
  }

  function getLineMutationReport() {
    return PMCStore.lineMutationReportRaw || { reportList: [] };
  }

  function _mapBackendDelivery(d) {
    if (!d) return d;
    
    // Construct compositeKey if missing so that dashboard can filter correctly
    let cKey = d.compositeKey;
    if (!cKey && d.date && d.shiftKey && d.slotId) {
      cKey = `${d.date}_${d.shiftKey}_${d.slotId}`;
    }

    const mappedItems = (d.items || []).map(i => {
       const mappedScans = (d.scans || []).filter(s => s.deliveryItemId === i.id).map(s => ({
         ...s,
         barcode: s.barcode,
         pcs: parseFloat(s.pcs) || 0,
         qtyPallet: parseFloat(s.qtyPallet) || 0
       }));

       return {
         ...i,
         material: i.materialName || i.material,
         required: parseFloat(i.requiredPallets || i.required || 0),
         scanned: parseFloat(i.scannedPallets || i.scanned || 0),
         scans: mappedScans,
         details: [] // In a real scenario, this might need fetching hourly details if used by UI. For now it satisfies the frontend loop.
       };
    });
    return { ...d, compositeKey: cKey, items: mappedItems };
  }

  async function loadActiveDeliveriesFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/delivery`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
           PMCStore.activeDeliveries = data.map(_mapBackendDelivery);
        } else {
           PMCStore.activeDeliveries = [];
        }
        PMCStore.emit('deliveryChanged');
      }
    } catch (err) {
      console.warn('Error fetching active deliveries', err);
    }
  }

  async function getOrCreateDelivery(date, shiftKey, slotId, forceRefresh = false) {
    const id = `${date}_${shiftKey}_${slotId}`;
    let d = PMCStore.activeDeliveries.find(x => x.compositeKey === id);

    // Force refresh: handled by refreshDelivery API internally if no scans yet
    if (d && !forceRefresh) {
      return d;
    }

    const hourlyData = await PMCStore.getHourlyDistribution(date);
    const initialItems = [];
    (Array.isArray(hourlyData) ? hourlyData : []).forEach(mat => {
      const slotData = mat.slots[shiftKey] && mat.slots[shiftKey][slotId - 1];
      if (slotData && (slotData.details && slotData.details.length > 0 || slotData.pallets > 0)) {
        let reqPallets = 0;
        if (slotData.details && slotData.details.length > 0) {
          reqPallets = slotData.details.length;
        } else {
          const pQty = PMCStore.getPalletQty(mat.name);
          reqPallets = pQty > 0 ? Math.ceil(slotData.pallets / pQty) : 0;
        }
        if (reqPallets > 0) {
          initialItems.push({ material: mat.name, required: reqPallets });
        }
      }
    });

    try {
      const endpoint = forceRefresh ? `/delivery/${encodeURIComponent(id)}/refresh` : '/delivery/create';
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, shiftKey, slotId: parseInt(slotId), items: initialItems })
      });
      if (res.ok) {
        const data = await res.json();
        await loadActiveDeliveriesFromAPI(); // sync state
        return PMCStore.activeDeliveries.find(x => x.compositeKey === id) || _mapBackendDelivery(data); // returns the fully formed latest delivery
      }
    } catch (err) {
      console.error('Delivery API Error:', err);
    }

    return null;
  }

  async function refreshDelivery(date, shiftKey, slotId) {
    return getOrCreateDelivery(date, shiftKey, slotId, true);
  }

  function getActiveDeliveries() {
    return PMCStore.activeDeliveries;
  }

  async function scanDeliveryItem(deliveryId, material, barcode = '-', inputQty = 1, supplier = '', targetBlockRowId = null) {
    try {
      let calcQtyPallet = 0;
      if (barcode && barcode !== '-') {
        calcQtyPallet = 1;
      } else {
        const alloc = PMCStore._allocateFromWMS(material, inputQty);
        calcQtyPallet = alloc.batches.reduce((sum, b) => sum + b.pallets, 0);
        if (calcQtyPallet === 0) calcQtyPallet = 1;
      }

      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/delivery/${encodeURIComponent(deliveryId)}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material, barcode, qtyPallet: calcQtyPallet, pcs: inputQty, supplier, targetBlockRowId })
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadActiveDeliveriesFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Scan delivery error:', err);
      return { success: false, message: err.message };
    }
  }

  function _consumeFromWMSActual(material, qtyPallet, barcode) {
    if (qtyPallet <= 0) return [];
    
    let consumed = [];

    // If a specific barcode was scanned (not manual '-')
    if (barcode && barcode !== '-') {
      // Find the specific pallet by barcode
      const idx = PMCStore.warehouseInventory.findIndex(w => w.material === material && w.palletsAvailable > 0 && (w.barcodes && w.barcodes.includes(barcode) || w.barcodeStart === barcode || w.barcode === barcode));
      if (idx !== -1) {
        let take = Math.min(PMCStore.warehouseInventory[idx].palletsAvailable, qtyPallet);
        consumed.push({ ...PMCStore.warehouseInventory[idx], palletsAvailable: take, id: null });

        // Decrease pallets available
        PMCStore.warehouseInventory[idx].palletsAvailable -= take;
        if (PMCStore.warehouseInventory[idx].palletsAvailable <= 0) {
          PMCStore.warehouseInventory.splice(idx, 1);
        }
      }
    } else {
      // FIFO fallback for manual input ('-')
      let remaining = qtyPallet;
      for (let i = 0; i < PMCStore.warehouseInventory.length && remaining > 0; i++) {
        let w = PMCStore.warehouseInventory[i];
        if (w.material === material && w.palletsAvailable > 0) {
          let take = Math.min(w.palletsAvailable, remaining);
          consumed.push({ ...w, palletsAvailable: take, id: null });

          remaining -= take;
          w.palletsAvailable -= take;
        }
      }
      // cleanup empty pallets
      PMCStore.warehouseInventory = PMCStore.warehouseInventory.filter(w => w.palletsAvailable > 0);
    }
    PMCStore.emit('warehouseStockChanged');
    return consumed;
  }

  async function validateDelivery(deliveryId) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/delivery/${encodeURIComponent(deliveryId)}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadActiveDeliveriesFromAPI();
        await PMCStore.loadWarehouseStockFromAPI();
        await PMCStore.loadTransitInfoFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Validate delivery error:', err);
      return { success: false, message: err.message };
    }
  }

  // Helper: cek apakah barcode ada di delivery aktif yang statusnya 'delivering'
  async function isBarcodeInActiveDelivery(barcode) {
    if (!barcode || barcode === '-') return false;
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/delivery/barcode-check/${encodeURIComponent(barcode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.data) {
           return data.data; // { delivery, scan }
        }
      }
    } catch (err) {
      console.error('Barcode check fail:', err);
    }
    return false;
  }

  async function receiveAndConsumeWMS(material, inputQty, barcode = '-') {
    // Cegah barcode yang sudah pernah diterima di area transit
    if (barcode && barcode !== '-' && PMCStore.usedBarcodes.has(barcode)) {
      return { success: false, message: `Barcode ${barcode} sudah pernah diterima di area transit. Tidak bisa digunakan lagi.` };
    }

    let supplier = '-';
    let qtyPallet = 0;
    if (barcode && barcode !== '-') {
      const deliveryMatch = await isBarcodeInActiveDelivery(barcode);
      if (!deliveryMatch) {
        return { success: false, message: `Barcode ${barcode} tidak ada di pengiriman aktif dari gudang.` };
      }
      qtyPallet = 1;
      if (deliveryMatch.scan && deliveryMatch.scan.supplier) {
        supplier = deliveryMatch.scan.supplier;
      }
    } else {
      const alloc = _allocateFromWMS(material, inputQty);
      qtyPallet = alloc.batches.reduce((sum, b) => sum + b.pallets, 0);
      if (qtyPallet === 0) qtyPallet = 1;
      if (alloc.batches.length > 0) {
        supplier = alloc.batches[0].supplier;
      }
    }

    const res = await PMCStore.receiveToTransit(material, qtyPallet, barcode, inputQty, 'Gudang -> Transit', supplier);
    if (res.success) {
      // 1. Eksekusi pemotongan di Backend melalui Endpoint API
      try {
        await PMCStore.safeFetch(`${PMCStore.API_BASE}/warehouse/consume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ material, qtyPallet, barcode })
        });
      } catch (err) {
        console.warn('Gagal memotong stok WMS di backend', err);
      }

      // 2. Pemotongan di State Lokal JS untuk refresh UI seketika
      const consumed = _consumeFromWMSActual(material, qtyPallet, barcode);
      const now = new Date();
      const dateInTrans = now.toISOString().split('T')[0];
      const timeInTrans = now.toLocaleTimeString('id-ID', { hour12: false });
      consumed.forEach(c => {
         PMCStore.transitInventory.push({
           id: 'TI-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
           material: c.material,
           barcode: c.barcode || c.barcodeStart || barcode || '-',
           mid: c.mid || '-',
           dateInGudang: c.dateIn || '-',
           dateInTrans: dateInTrans,
           timeInTrans: timeInTrans,
           palletsAvailable: c.palletsAvailable,
           supplier: c.supplier || '-',
           blockId: res.blockId || null,
           rowId: res.rowId || null
         });
      });
      res.qtyPallet = qtyPallet;

      // Tandai barcode sebagai sudah digunakan
      if (barcode && barcode !== '-') {
        PMCStore.usedBarcodes.add(barcode);

        const deliveryMatch = await isBarcodeInActiveDelivery(barcode);
        let deliveryCompleted = false;
        let remainingPallets = 0;
        
        if (deliveryMatch && deliveryMatch.delivery) {
          const d = PMCStore.activeDeliveries.find(x => x.id === deliveryMatch.delivery.id);
          if (d && d.items) {
            let totalScans = 0;
            let usedScans = 0;
            let totalPalletsReq = 0;
            
            d.items.forEach(item => {
              totalPalletsReq += (item.required || item.planned || 0);
              if (item.scans) {
                item.scans.forEach(s => {
                  if (s.barcode && s.barcode !== '-') {
                    totalScans++;
                    if (PMCStore.usedBarcodes.has(s.barcode)) usedScans++;
                  }
                });
              }
            });
            
            remainingPallets = totalPalletsReq - usedScans;
            
            if (totalPalletsReq > 0 && usedScans >= totalPalletsReq) {
              d.status = 'completed';
              deliveryCompleted = true;
              PMCStore.emit('deliveryChanged');
            }
          }
        }
        
        res.deliveryCompleted = deliveryCompleted;
        res.remainingPallets = remainingPallets;
      }
    }
    return res;
  }

  // ── Produksi Line Methods ──
  function getLineStock() {
    return PMCStore.lineStock;
  }

  function getLineBarcodes(line) {
    if (line) return PMCStore.lineBarcodes.filter(b => b.line === line);
    return PMCStore.lineBarcodes;
  }

  async function receiveToLine(line, material, barcode, inputPcs) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, material, barcode, pcs: inputPcs })
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadTransitInfoFromAPI();
        await PMCStore.loadLineStockFromAPI();
        await PMCStore.loadLineBarcodesFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Receive to line error:', err);
      return { success: false, message: err.message };
    }
  }

  async function receivePartialToLine(line, material, barcode, partialPcs) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/receive-partial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, material, barcode, pcs: partialPcs })
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadTransitInfoFromAPI();
        await PMCStore.loadLineStockFromAPI();
        await PMCStore.loadLineBarcodesFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Receive partial to line error:', err);
      return { success: false, message: err.message };
    }
  }

  async function returnFromLine(barcode, pcs, targetBlockRowId, condition) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, pcs, targetBlockRowId, condition })
      });
      const data = await res.json();
      if (data.success) {
        // Remove barcode from PMCStore.usedBarcodes so it can be re-scanned at transit
        PMCStore.usedBarcodes.delete(barcode);
        await PMCStore.loadLineStockFromAPI();
        await PMCStore.loadLineBarcodesFromAPI();
        await PMCStore.loadPendingReturnsFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Return from line error:', err);
      return { success: false, message: err.message };
    }
  }

  async function rejectFromLine(line, materialName, pcs, reason) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, materialName, pcs, reason })
      });
      const data = await res.json();
      if (data.success) {
        // Just reload stock since it doesn't immediately truncate lines yet, 
        // but maybe we don't need to load because it's pending.
      }
      return data;
    } catch (err) {
      console.error('Reject from line error:', err);
      return { success: false, message: err.message };
    }
  }

  async function getLineOpnames(filters = {}) {
    try {
      const query = new URLSearchParams();
      if (filters.line) query.append('line', filters.line);
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/opname?${query.toString()}`);
      if (!res.ok) throw new Error('API fetch error');
      return await res.json();
    } catch (err) {
      console.error('Get line opnames error:', err);
      return [];
    }
  }

  async function saveLineOpname(payload) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/opname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadLineStockFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Save line opname error:', err);
      return { success: false, message: err.message };
    }
  }

  async function updateOpnameItem(opnameId, itemId, newQtyPhysical, editedBy) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/opname/${encodeURIComponent(opnameId)}/item/${encodeURIComponent(itemId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newQtyPhysical, editedBy })
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadLineStockFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Update opname item error:', err);
      return { success: false, message: err.message };
    }
  }

  async function getLineRejects(dateStr = '') {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/reject?date=${dateStr}`);
      if (!res.ok) throw new Error('API fetch error');
      return await res.json();
    } catch (err) {
      console.error('Get line rejects error:', err);
      return [];
    }
  }
  async function verifyLineReject(id, action, finalPcs) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/reject/${encodeURIComponent(id)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, finalPcs })
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadLineStockFromAPI();
        await PMCStore.loadLineBarcodesFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Verify line reject error:', err);
      return { success: false, message: err.message };
    }
  }

  async function verifyReturn(returnId, action) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/returns/${encodeURIComponent(returnId)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadPendingReturnsFromAPI();
        await PMCStore.loadTransitInfoFromAPI();
        await PMCStore.loadLineStockFromAPI();
        await PMCStore.loadLineBarcodesFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Verify return error:', err);
      return { success: false, message: err.message };
    }
  }

  async function loadLineMutationsFromAPI(filters = {}, page = 1, limit = 50) {
    try {
      const query = new URLSearchParams();
      if (filters.material) query.append('material', filters.material);
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);
      if (filters.line) query.append('line', filters.line);
      query.append('page', String(page));
      query.append('limit', String(limit));

      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/mutations?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        PMCStore.lineMutations = json.data || json || [];
        PMCStore.emit('lineMutationsLoaded');
      }
    } catch (err) {
      console.error('Failed to load line mutations from API', err);
    }
  }

  async function loadLineMutationReportFromAPI(filters = {}) {
    try {
      const query = new URLSearchParams();
      if (filters.material) query.append('material', filters.material);
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);
      if (filters.line) query.append('line', filters.line);

      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/report/mutation?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        PMCStore.lineMutationReportRaw = data || { reportList: [] };
        PMCStore.emit('lineMutationReportLoaded');
      }
    } catch (err) {
      console.error('Failed to load line mutation report:', err);
      PMCStore.lineMutationReportRaw = { reportList: [] };
    }
  }

  async function returnSisaFromLine(line, material, pcs, targetBlockRowId) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/production/return-sisa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, materialName: material, pcs, targetBlockRowId })
      });
      const data = await res.json();
      if (data.success) {
        await PMCStore.loadLineStockFromAPI();
        await PMCStore.loadLineBarcodesFromAPI();
        await PMCStore.loadPendingReturnsFromAPI();
      }
      return data;
    } catch (err) {
      console.error('Return sisa from line error:', err);
      return { success: false, message: err.message };
    }
  }

  // --- TRANSIT OPNAME ---
  async function saveTransitOpname(payload) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/opname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.error('Save transit opname error:', err);
      return { success: false, message: err.message };
    }
  }

  async function getTransitOpnames(filters = {}) {
    try {
      const query = new URLSearchParams();
      if (filters.blockId) query.append('blockId', filters.blockId);
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/opname?${query.toString()}`);
      if (!res.ok) throw new Error('API fetch error');
      return await res.json();
    } catch (err) {
      console.error('Get transit opnames error:', err);
      return [];
    }
  }

  async function updateTransitOpnameItem(opnameId, itemId, newQtyPhysical) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/opname/${encodeURIComponent(opnameId)}/item/${encodeURIComponent(itemId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newQtyPhysical })
      });
      return await res.json();
    } catch (err) {
      console.error('Update transit opname item error:', err);
      return { success: false, message: err.message };
    }
  }

  async function getOpnameRecap(filters = {}) {
    try {
      const query = new URLSearchParams();
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);
      if (filters.area) query.append('area', filters.area);

      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/opname/recap?${query.toString()}`);
      if (!res.ok) throw new Error('API fetch error');
      return await res.json();
    } catch (err) {
      console.error('Get opname recap error:', err);
      return { lines: [], rows: [] };
    }
  }

// Auto-Exports
  PMCStore.loadLineMutationsFromAPI = loadLineMutationsFromAPI;
  PMCStore.loadLineMutationReportFromAPI = loadLineMutationReportFromAPI;
  PMCStore.loadLineStockFromAPI = loadLineStockFromAPI;
  PMCStore.loadLineBarcodesFromAPI = loadLineBarcodesFromAPI;
  PMCStore.loadPendingReturnsFromAPI = loadPendingReturnsFromAPI;
  PMCStore.loadTransitInventoryFromAPI = loadTransitInventoryFromAPI;
  PMCStore.getBlockLayout = getBlockLayout;
  PMCStore.saveBlockLayout = saveBlockLayout;
  PMCStore.getStockCheck = getStockCheck;
  PMCStore.saveStockCheck = saveStockCheck;
  PMCStore.loadTransitInfoFromAPI = loadTransitInfoFromAPI;
  PMCStore.loadMaterialRecehFromAPI = loadMaterialRecehFromAPI;
  PMCStore.receiveToTransit = receiveToTransit;
  PMCStore.predictTransitAllocation = predictTransitAllocation;
  PMCStore.takeFromTransit = takeFromTransit;
  PMCStore.getTransitInfo = getTransitInfo;
  PMCStore.getMutationReport = getMutationReport;
  PMCStore.getLineMutationReport = getLineMutationReport;
  PMCStore.loadActiveDeliveriesFromAPI = loadActiveDeliveriesFromAPI;
  PMCStore.getOrCreateDelivery = getOrCreateDelivery;
  PMCStore.refreshDelivery = refreshDelivery;
  PMCStore.getActiveDeliveries = getActiveDeliveries;
   PMCStore.loadActiveDeliveriesFromAPI = loadActiveDeliveriesFromAPI;
   PMCStore.scanDeliveryItem = scanDeliveryItem;
   PMCStore.validateDelivery = validateDelivery;
   PMCStore.isBarcodeInActiveDelivery = isBarcodeInActiveDelivery;
   PMCStore.receiveAndConsumeWMS = receiveAndConsumeWMS;
  PMCStore.getLineStock = getLineStock;
  PMCStore.getLineBarcodes = getLineBarcodes;
  PMCStore.receiveToLine = receiveToLine;
  PMCStore.receivePartialToLine = receivePartialToLine;
  PMCStore.returnFromLine = returnFromLine;
  PMCStore.returnSisaFromLine = returnSisaFromLine;
  PMCStore.rejectFromLine = rejectFromLine;
  PMCStore.getLineRejects = getLineRejects;
  PMCStore.verifyLineReject = verifyLineReject;
  PMCStore.verifyReturn = verifyReturn;
  PMCStore.saveLineOpname = saveLineOpname;
  PMCStore.getLineOpnames = getLineOpnames;
  PMCStore.updateOpnameItem = updateOpnameItem;

  PMCStore.saveTransitOpname = saveTransitOpname;
  PMCStore.getTransitOpnames = getTransitOpnames;
  PMCStore.updateTransitOpnameItem = updateTransitOpnameItem;
  PMCStore.getOpnameRecap = getOpnameRecap;

})(window.PMCStore);