/* ===== PMC Store - Inventory ===== */
import './core.js';
((PMCStore) => {
  // Use direct PMCStore access to avoid destructuring closure bugs during modular load
  const API_BASE = PMCStore.API_BASE;
  const safeFetch = PMCStore.safeFetch;
  const emit = PMCStore.emit;
  // ── WMS Warehouse Inventory ──
  // Simulates FIFO physical stock
  
   // Global auto-increment barcode counter
       // Global auto-increment MID counter

  function getNextBarcodeRange(count) {
    const start = PMCStore._barcodeCounter + 1;
    const barcodes = [];
    for (let i = 0; i < count; i++) {
      PMCStore._barcodeCounter++;
      barcodes.push(String(PMCStore._barcodeCounter).padStart(5, '0'));
    }
    const end = PMCStore._barcodeCounter;
    return { start: String(start).padStart(5, '0'), end: String(end).padStart(5, '0'), barcodes };
  }

  function getNextMID() {
    PMCStore._midCounter++;
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    return 'MID-' + dateStr + '-' + String(PMCStore._midCounter).padStart(3, '0');
  }

  function getWarehouseStock() {
    // Return sorted by dateIn (oldest first for FIFO)
    return [...PMCStore.warehouseInventory].sort((a, b) => new Date(a.dateIn) - new Date(b.dateIn));
  }

  function addWarehouseStock(item) {
    const payload = {
      material: item.material,
      supplier: item.supplier,
      qtyPerPallet: item.qtyPerPallet,
      palletsTotal: item.palletsAvailable,
      dateIn: item.dateIn
    };

    PMCStore.safeFetch(`${PMCStore.API_BASE}/warehouse/stock`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    .then(res => { if(!res.ok) throw new Error('Gagal menambah stok gudang'); return PMCStore.loadWarehouseStockFromAPI(); })
    .catch(err => { console.error('Error adding warehouse stock', err); alert(err.message); });
  }

  function deleteWarehouseStock(id) {
    PMCStore.safeFetch(`${PMCStore.API_BASE}/warehouse/stock/${id}`, { method: 'DELETE' })
    .then(res => { if(!res.ok) throw new Error('Gagal menghapus stok'); return PMCStore.loadWarehouseStockFromAPI(); })
    .catch(err => { console.error('Error deleting warehouse stock', err); alert(err.message); });
  }

  // ── Helpers ──
  function getSKU(id) {
    return PMCStore.skuList.find(s => s.id === id || s.code === id);
  }

  function getBOM(skuId) {
    return PMCStore.bomData.find(b => b.skuId === skuId);
  }

  function getUniqueDates() {
    return [...new Set(PMCStore.schedules.map(s => s.date))].sort();
  }

  function getMaterialUOM(materialName) {
    for (const bom of PMCStore.bomData) {
      for (const comp of bom.components) {
        if (comp.name === materialName) return comp.uom;
      }
    }
    return 'PCS';
  }

  // Shift aggregation for a given date
  function getShiftSummary(date) {
    const filtered = PMCStore.schedules.filter(s => s.date === date);
    const agg = {};
    filtered.forEach(s => {
      const key = `${s.skuId}-${s.line || 'global'}`;
      if (!agg[key]) agg[key] = { skuId: s.skuId, line: s.line, sh1: 0, sh2: 0, sh3: 0 };
      agg[key].sh1 += s.sh1;
      agg[key].sh2 += s.sh2;
      agg[key].sh3 += s.sh3;
    });
    return Object.values(agg).map(a => ({
      ...a,
      total: a.sh1 + a.sh2 + a.sh3,
      skuName: getSKU(a.skuId)?.name || a.skuId
    }));
  }

  // Material calculation
  function applyRounding(value, rounding) {
    if (rounding === 'ceiling') return Math.ceil(value);
    if (rounding === '2decimal') return Math.round(value * 100) / 100;
    if (rounding === '3decimal') return Math.round(value * 1000) / 1000;
    if (rounding === '4decimal') return Math.round(value * 10000) / 10000;
    return value;
  }

  // ── Stock Balance Carry-Over ──
  // Computes stock from a saved stock check's blocks data
  function _sumStockFromBlocks(blocks) {
    const stockSum = {};
    (blocks || []).forEach(b => {
      (b.rows || []).forEach(row => {
        if (row.material) {
          if (!stockSum[row.material]) stockSum[row.material] = 0;
          
          if (Array.isArray(row.pallets)) {
            row.pallets.forEach(qtyVal => {
              if (qtyVal !== '' && qtyVal !== null && qtyVal !== undefined) {
                const val = parseFloat(qtyVal);
                if (!isNaN(val)) stockSum[row.material] += val;
              }
            });
          } else if (typeof row.pcs === 'number') {
            stockSum[row.material] += row.pcs;
          } else if (typeof row.qty === 'number') {
            stockSum[row.material] += row.qty;
          }
        }
      });
    });
    return stockSum;
  }

  function getStockBalanceForDate(date) {
    // check exactly that date
    if (PMCStore.stockChecks[date]) {
      return _sumStockFromBlocks(PMCStore.stockChecks[date].blocks);
    }

    // otherwise find the latest date before that
    const dates = Object.keys(PMCStore.stockChecks).sort();
    let prevDate = null;
    for (const d of dates) {
      if (d < date) prevDate = d;
      else break;
    }
    if (prevDate) {
      if (PMCStore.stockChecks[prevDate]) {
        return _sumStockFromBlocks(PMCStore.stockChecks[prevDate].blocks);
      }
    }
    return {};
  }

  // Helper to pre-allocate from FIFO WMS
  function _allocateFromWMS(material, requiredPcs) {
    if (requiredPcs <= 0) return { batches: [], totalAllocatedPcs: 0 };

    // Deep clone to simulate consumption without affecting real stock yet
    // SPB calculation is just a projection
    const availableStock = getWarehouseStock().filter(w => w.material === material && w.palletsAvailable > 0);

    let remainingPcs = requiredPcs;
    const allocatedBatches = [];
    let totalAllocatedPcs = 0;

    for (const batch of availableStock) {
      if (remainingPcs <= 0) break;
      const batchQtyPerPallet = batch.qtyPerPallet || getPalletQty(material) || 1;
      const batchPcs = batchQtyPerPallet * batch.palletsAvailable;

      let palletsToTake = 0;
      if (batchPcs <= remainingPcs) {
        // Take all pallets in this batch
        palletsToTake = batch.palletsAvailable;
      } else {
        // Take partial pallets needed to fulfill
        palletsToTake = Math.ceil(remainingPcs / batchQtyPerPallet);
      }

      const pcsTaken = palletsToTake * batchQtyPerPallet;
      allocatedBatches.push({
        supplier: batch.supplier,
        qtyPerPallet: batchQtyPerPallet,
        pallets: palletsToTake,
        pcs: pcsTaken
      });

      remainingPcs -= pcsTaken;
      totalAllocatedPcs += pcsTaken;
    }

    // Fallback if not enough physical stock found
    if (remainingPcs > 0) {
      const fallbackQty = getPalletQty(material) || 1;
      const fallbackPallets = Math.ceil(remainingPcs / fallbackQty);
      const fallbackPcs = fallbackPallets * fallbackQty;
      allocatedBatches.push({
        supplier: 'Master Data',
        qtyPerPallet: fallbackQty,
        pallets: fallbackPallets,
        pcs: fallbackPcs
      });
      totalAllocatedPcs += fallbackPcs;
    }

    return { batches: allocatedBatches, totalSPB: totalAllocatedPcs };
  }

  async function getMaterialRequirements(date) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/materials/requirements/${date}`);
      if (res.ok) {
         const data = await res.json();
         return data || { perSku: [], grouped: [] };
      }
    } catch (err) { console.error('Error fetching material requirements', err); }

    const summary = getShiftSummary(date);
    const perSku = [];
    const grouped = {};
    const stockSum = getStockBalanceForDate(date);

    summary.forEach(item => {
      const bom = getBOM(item.skuId);
      if (!bom) return;
      const skuMaterials = [];
      bom.components.forEach(comp => {
        if (comp.line && comp.line !== item.line) return;
        const sh1 = applyRounding(item.sh1 * comp.coefficient, comp.rounding);
        const sh2 = applyRounding(item.sh2 * comp.coefficient, comp.rounding);
        const sh3 = applyRounding(item.sh3 * comp.coefficient, comp.rounding);
        const activeShifts = (item.sh1 > 0 ? 1 : 0) + (item.sh2 > 0 ? 1 : 0) + (item.sh3 > 0 ? 1 : 0);
        const shiftDivisor = activeShifts === 0 ? 1 : activeShifts;
        const avgShiftBox = (item.sh1 + item.sh2 + item.sh3) / shiftDivisor;
        const bufferBox = (avgShiftBox / 7) * 2;
        const buffer = applyRounding(bufferBox * comp.coefficient, comp.rounding);
        const rawTotal = sh1 + sh2 + sh3 + buffer;
        skuMaterials.push({ ...comp, sh1, sh2, sh3, buffer, total: rawTotal });
        if (!grouped[comp.name]) grouped[comp.name] = { name: comp.name, uom: comp.uom, sh1: 0, sh2: 0, sh3: 0, buffer: 0, rawTotal: 0 };
        grouped[comp.name].sh1 += sh1;
        grouped[comp.name].sh2 += sh2;
        grouped[comp.name].sh3 += sh3;
        grouped[comp.name].buffer += buffer;
        grouped[comp.name].rawTotal += rawTotal;
      });
      perSku.push({ skuId: item.skuId, skuName: item.skuName, sh1: item.sh1, sh2: item.sh2, sh3: item.sh3, materials: skuMaterials });
    });

    const groupedArr = Object.values(grouped).map(g => {
      g.sisaStok = stockSum[g.name] || 0;
      g.total = Math.max(0, g.rawTotal - g.sisaStok);
      const allocation = PMCStore._allocateFromWMS(g.name, g.total);
      const palletQty = allocation.batches.length > 0 ? allocation.batches[0].qtyPerPallet : getPalletQty(g.name);
      const palletCount = allocation.batches.reduce((sum, b) => sum + b.pallets, 0);
      return { ...g, batches: allocation.batches, palletQty, palletCount, totalSPB: allocation.totalSPB };
    });
    return { perSku, grouped: groupedArr };
  }

  // ── Hourly Distribution ──
  async function getHourlyDistribution(date) {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/materials/hourly-distribution/${date}`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (err) { console.error('Error fetching hourly distribution', err); }

    try {
    const reqData = await getMaterialRequirements(date);
    const grouped = reqData?.grouped || [];
    const hourlyData = [];
    if (!grouped || grouped.length === 0) return hourlyData;
    const perShiftDist = {};
    grouped.forEach(mat => {
      if (mat.totalSPB <= 0) return;
      const needs = [mat.sh1, mat.sh2, mat.sh3];
      const active = needs.filter(n => n > 0).length || 1;
      const bufPS = mat.buffer / active;
      const palletQueue = [];
      mat.batches.forEach(b => {
        for (let i = 0; i < b.pallets; i++) palletQueue.push({ supplier: b.supplier, qty: b.qtyPerPallet });
      });
      let sisaR = mat.sisaStok;
      const k = [0, 0, 0];
      const shiftPallets = { 0: [], 1: [], 2: [] };
      for (let s = 0; s < 3; s++) {
        const grossNeed = needs[s] + (needs[s] > 0 ? bufPS : 0);
        if (sisaR >= grossNeed) { k[s] = 0; sisaR -= grossNeed; } 
        else {
          let req = grossNeed - sisaR; sisaR = 0;
          while (req > 0 && palletQueue.length > 0) {
            const p = palletQueue.shift(); shiftPallets[s].push(p); k[s] += p.qty; req -= p.qty;
          }
          if (req < 0) sisaR += Math.abs(req);
        }
      }
      perShiftDist[mat.name] = { kirimSH1: k[0], kirimSH2: k[1], kirimSH3: k[2], bufferPerShift: bufPS, sisaStok: mat.sisaStok, shiftPallets };
    });
    grouped.forEach(mat => {
      if (mat.totalSPB <= 0) return;
      const dist = perShiftDist[mat.name];
      if (!dist) return;
      const bufferPcs = dist.bufferPerShift;
      const entry = { name: mat.name, kirimSH1: dist.kirimSH1, kirimSH2: dist.kirimSH2, kirimSH3: dist.kirimSH3, slots: { SH1: [], SH2: [], SH3: [] } };
      let rs = dist.sisaStok;
      ['SH1', 'SH2', 'SH3'].forEach((sk, s) => {
        const needs = [mat.sh1, mat.sh2, mat.sh3];
        const sq = dist[`kirim${sk}`];
        const consumptionPerSlot = needs[s] / 4;
        if (sq <= 0) {
          for (let g = 0; g < 4; g++) { entry.slots[sk].push({ pallets: 0, details: [] }); rs = Math.max(0, rs - consumptionPerSlot); }
          return;
        }
        const sPallets = dist.shiftPallets[s]; // Array of physical pallets
        const P = sPallets.length;
        const basePalletsPerSlot = Math.floor(P / 4);
        let remPallets = P % 4;

        let pIndex = 0;
        for (let g = 0; g < 4; g++) {
          let count = basePalletsPerSlot + (remPallets > 0 ? 1 : 0);
          if (remPallets > 0) remPallets--;

          const slotDetails = [];
          let slotPcsTotal = 0;

          while (count > 0 && pIndex < P) {
            const p = sPallets[pIndex];
            slotDetails.push({ supplier: p.supplier, qty: p.qty });
            slotPcsTotal += p.qty;
            pIndex++;
            count--;
          }

          entry.slots[sk].push({ pallets: slotPcsTotal, details: slotDetails });
        }
      });
      hourlyData.push(entry);
    });
    return hourlyData;
    } catch (fallbackErr) {
      console.error('Fallback hourly distribution error', fallbackErr);
      return [];
    }
  }

  async function getMergedHourlyDistribution(date) {
    const hourlyData = await getHourlyDistribution(date);
    let safeData = Array.isArray(hourlyData) ? hourlyData : [];

    // ── Integration: Fetch and Merge Manual SPB data for this date ──
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/manual-spb`);
      if (res.ok) {
        const manualSpbs = await res.json();
        const manualOnDate = manualSpbs.filter(s => {
          const sDate = s.targetDate ? s.targetDate.split('T')[0] : (s.createdAt ? s.createdAt.split('T')[0] : null);
          return sDate === date;
        });

        manualOnDate.forEach(spb => {
          const shKey = spb.targetShift ? `SH${spb.targetShift}` : 'SH1';
          spb.items.forEach(item => {
            let mat = safeData.find(m => m.name === item.materialName);
            if (!mat) {
              mat = { 
                name: item.materialName, 
                kirimSH1: 0, kirimSH2: 0, kirimSH3: 0, 
                slots: { SH1: [], SH2: [], SH3: [] },
                isManualRow: true
              };
              ['SH1', 'SH2', 'SH3'].forEach(k => {
                mat.slots[k] = Array.from({ length: 4 }, () => ({ pallets: 0, details: [] }));
              });
              safeData.push(mat);
            }

            const pQty = getPalletQty(item.materialName) || 1;
            const totalRequestedPcs = item.qtyPallets * pQty;
            
            // Add to shift total
            mat[`kirim${shKey}`] += totalRequestedPcs;
            
            // For visibility in the hourly table, we place manual items in Slot 1 of the shift
            if (mat.slots[shKey] && mat.slots[shKey][0]) {
              const slot = mat.slots[shKey][0];
              slot.pallets += totalRequestedPcs;
              if (!slot.details) slot.details = [];
              slot.details.push({ 
                supplier: `Manual (${spb.spbNumber})`, 
                qty: pQty,
                isManual: true
              });
            }
          });
        });
      }
    } catch (e) {
      console.warn('Failed to merge manual SPBs into distribution:', e);
    }

    safeData.forEach(mat => {
      ['SH1', 'SH2', 'SH3'].forEach(shKey => {
        let actualShiftTotal = 0;
        let isShiftModified = false;
        const slots = mat.slots[shKey];

        if (slots) {
          for (let slotId = 1; slotId <= slots.length; slotId++) {
            const deliveryId = `${date}_${shKey}_${slotId}`;
            const d = PMCStore.activeDeliveries.find(x => x.id === deliveryId);
            const slot = slots[slotId - 1];

            // Override planned slot with actual delivery results if any
            if (d && (d.status === 'delivering' || d.status === 'completed' || d.items.some(i => i.scanned > 0))) {
              const item = d.items.find(i => i.material === mat.name);
              if (item) {
                const pQty = getPalletQty(mat.name) || 1;
                const pcsScanned = item.scanned * pQty; // convert pallets back to pieces

                if (item.scanned > 0 || d.status !== 'preparing') {
                  slot.pallets = pcsScanned;
                  slot.pending = false; // it physically went out
                  // Buat array sepanjang jumlah pallet aktual untuk perhitungan akurat di footer
                  slot.details = Array.from({ length: item.scanned || 0 }).map(() => ({ 
                      supplier: 'Aktual Gudang', 
                      qty: pQty 
                  }));
                  isShiftModified = true;
                }
              }
            }
            if (slot && slot.pallets) {
              actualShiftTotal += slot.pallets;
            }
          }
        }

        if (isShiftModified) {
          mat[`kirim${shKey}`] = actualShiftTotal;
        }
      });
      // Recalculate Shift TotalSPB based on actuals
      mat.totalSPB = mat.kirimSH1 + mat.kirimSH2 + mat.kirimSH3;
    });

    return safeData;
  }

  // Dashboard stats
  async function getStats() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/dashboard/stats`);
      if (res.ok) return await res.json();
    } catch (err) { console.error('Error fetching stats', err); }
    
    // Fallback to local calculation if API fails
    const totalSKU = PMCStore.skuList.length;
    const totalBOM = PMCStore.bomData.reduce((sum, b) => sum + b.components.length, 0);
    const dates = getUniqueDates();
    const totalBox = PMCStore.schedules.reduce((sum, s) => sum + s.sh1 + s.sh2 + s.sh3, 0);
    const pending = PMCStore.schedules.filter(s => s.status === 'pending').length > 0
      ? [...new Set(PMCStore.schedules.filter(s => s.status === 'pending').map(s => s.date))].length
      : 0;
    return { totalSKU, totalBOM, totalBox, pending, dates };
  }

  // Daily production for charts
  async function getDailyProduction() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/dashboard/daily-production`);
      if (res.ok) return await res.json();
    } catch (err) { console.error('Error fetching daily production', err); }

    const byDate = {};
    PMCStore.schedules.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = { sh1: 0, sh2: 0, sh3: 0 };
      byDate[s.date].sh1 += s.sh1;
      byDate[s.date].sh2 += s.sh2;
      byDate[s.date].sh3 += s.sh3;
    });
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({
      date, sh1: d.sh1, sh2: d.sh2, sh3: d.sh3, total: d.sh1 + d.sh2 + d.sh3
    }));
  }

  // Recently scheduled
  async function getRecentSchedules() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/recent-PMCStore.schedules`);
      if (res.ok) return await res.json();
    } catch (err) { console.error('Error fetching recent PMCStore.schedules', err); }

    const byDate = {};
    PMCStore.schedules.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = { date: s.date, skus: new Set(), total: 0, status: s.status };
      byDate[s.date].skus.add(s.skuId);
      byDate[s.date].total += s.sh1 + s.sh2 + s.sh3;
      if (s.status === 'pending') byDate[s.date].status = 'pending';
    });
    return Object.values(byDate).map(d => ({ ...d, skuCount: d.skus.size })).sort((a, b) => b.date.localeCompare(a.date));
  }

  function addSKU(sku) {
    const { id, ...dbSku } = sku;
    console.log(`DEBUG: PMCStore.addSKU called with URL: ${API_BASE}/master/sku`, dbSku);
    window.alert(`MENYIMPAN KE API: ${API_BASE}/master/sku`);
    
    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/sku`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dbSku)
    })
    .then(res => res.json())
    .then(data => {
      if(data.error) throw new Error(data.error);
      return PMCStore.loadMasterDataFromAPI();
    })
    .catch(err => {
      console.error('Error adding SKU', err);
      alert(err.message);
    });
  }

  function updateSKU(id, data) {
    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/sku/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    })
    .then(res => { if(!res.ok) throw new Error('Gagal update SKU'); return PMCStore.loadMasterDataFromAPI(); })
    .catch(err => { console.error('Error updating SKU', err); alert(err.message); });
  }

  function deleteSKU(id) {
    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/sku/${id}`, { method: 'DELETE' })
    .then(res => { if(!res.ok) throw new Error('Gagal menghapus SKU'); return PMCStore.loadMasterDataFromAPI(); })
    .catch(err => { console.error('Error deleting SKU', err); alert(err.message); });
  }

  function addBOMComponent(skuId, comp) {
    const skuRecord = PMCStore.skuList.find(s => s.id === skuId || s.code === skuId);
    const dbSkuId = skuRecord ? skuRecord.id : skuId;

    // Map frontend field names to backend field names
    const dbComp = {
      materialName: comp.name,
      oracleCode: comp.oracleCode || '',
      coefficient: comp.coefficient,
      uom: comp.uom,
      rounding: comp.rounding || 'ceiling',
      line: comp.line || null,
    };

    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/bom/${dbSkuId}/component`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dbComp)
    })
    .then(res => { if(!res.ok) throw new Error('Gagal menambah komponen BOM'); return PMCStore.loadMasterDataFromAPI(); })
    .catch(err => { console.error('Error adding BOM', err); alert(err.message); });
  }

  function updateBOMComponent(skuId, idx, comp) {
    const bom = PMCStore.bomData.find(b => b.skuId === skuId);
    if (bom && bom.components[idx]) { 
      const compId = bom.components[idx].id;
      if (!compId) return;
      
      const dbComp = {
        materialName: comp.name,
        oracleCode: comp.oracleCode || '',
        coefficient: comp.coefficient,
        uom: comp.uom,
        rounding: comp.rounding || 'ceiling',
        line: comp.line || null,
      };

      PMCStore.safeFetch(`${PMCStore.API_BASE}/master/bom/component/${compId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dbComp)
      })
      .then(res => { if(!res.ok) throw new Error('Gagal update BOM'); return PMCStore.loadMasterDataFromAPI(); })
      .catch(err => { console.error('Error updating BOM', err); alert(err.message); });
    }
  }

  function deleteBOMComponent(skuId, idx) {
    const bom = PMCStore.bomData.find(b => b.skuId === skuId);
    if (bom) { 
      const compId = bom.components[idx].id;
      if (!compId) return;

      PMCStore.safeFetch(`${PMCStore.API_BASE}/master/bom/component/${compId}`, { method: 'DELETE' })
      .then(res => { if(!res.ok) throw new Error('Gagal menghapus BOM'); return PMCStore.loadMasterDataFromAPI(); })
      .catch(err => { console.error('Error deleting BOM', err); alert(err.message); });
    }
  }

  function addSchedules(newSchedules) {
    // Add to local store immediately
    PMCStore.schedules.push(...newSchedules);
    PMCStore.emit('scheduleChanged');

    // Persist to backend API
    PMCStore.safeFetch(`${PMCStore.API_BASE}/schedule/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: newSchedules })
    }).then(res => {
      if (res.ok) return res.json();
      throw new Error('Failed to save PMCStore.schedules');
    }).then(saved => {
      // Update local records with backend IDs for future delete/update
      if (saved && saved.length > 0) {
        const startIdx = PMCStore.schedules.length - newSchedules.length;
        saved.forEach((s, i) => {
          if (PMCStore.schedules[startIdx + i]) {
            PMCStore.schedules[startIdx + i].id = s.id;
          }
        });
      }
      console.log('✅ Schedules saved to database');
    }).catch(err => {
      console.warn('⚠️ Failed to persist PMCStore.schedules to DB:', err.message);
    });
  }

  function updateScheduleCell(index, field, value) {
    if (PMCStore.schedules[index]) {
      PMCStore.schedules[index][field] = value;
      PMCStore.emit('scheduleChanged');

      // Persist to backend if record has an ID
      const record = PMCStore.schedules[index];
      if (record.id) {
        PMCStore.safeFetch(`${PMCStore.API_BASE}/schedule/${record.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        }).catch(err => console.warn('⚠️ Failed to update schedule in DB:', err.message));
      }
    }
  }

  function deleteSchedule(idOrIndex) {
    let index = -1;
    if (typeof idOrIndex === 'string') {
        index = PMCStore.schedules.findIndex(s => s.id === idOrIndex);
    } else {
        index = idOrIndex;
    }
    
    if (index >= 0 && PMCStore.schedules[index]) {
      const record = PMCStore.schedules[index];
      PMCStore.schedules.splice(index, 1);
      PMCStore.emit('scheduleChanged');

      // Persist delete to backend if record has an ID
      if (record.id) {
        PMCStore.safeFetch(`${PMCStore.API_BASE}/schedule/${record.id}`, {
          method: 'DELETE'
        }).then(res => {
          if (res.ok) console.log('✅ Schedule deleted from database');
          else console.warn('⚠️ Failed to delete schedule from DB');
        }).catch(err => console.warn('⚠️ Failed to delete schedule from DB:', err.message));
      }
    }
  }

  function markDateConverted(date) {
    PMCStore.schedules.forEach(s => { if (s.date === date) s.status = 'converted'; });
    PMCStore.emit('scheduleChanged');
  }

  // Pallet Qty CRUD
  function getPalletQty(materialName) {
    // Sync: Cek konfigurasi Qty/Pallet aktual dari stok gudang WMS (Terbaru/FIFO)
    const wStock = PMCStore.warehouseInventory.find(w => w.material === materialName && w.palletsAvailable > 0);
    if (wStock && wStock.qtyPerPallet) {
      return wStock.qtyPerPallet;
    }
    
    // Fallback: Master Data / Konstanta sistem
    return PMCStore.palletQtyMap[materialName] || 1;
  }

  function setPalletQty(materialName, qty) {
    PMCStore.palletQtyMap[materialName] = qty;
    PMCStore.emit('palletChanged');
    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/pallet-qty/${encodeURIComponent(materialName)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qtyPerPallet: qty })
    }).catch(err => console.error('Error updating pallet qty', err));
  }

  function getAllPalletQty() {
    return { ...(PMCStore.palletQtyMap || {}) };
  }

  // ── Line per SKU CRUD ──
  function getLinePerSku() {
    return [...(PMCStore.linePerSku || [])];
  }

  function getLinesForSku(skuId) {
    return PMCStore.linePerSku.filter(l => l.skuId === skuId).map(l => l.line);
  }

  function getSkusForLine(line) {
    return PMCStore.linePerSku.filter(l => l.line === line).map(l => l.skuId);
  }

  function addLinePerSku(skuId, line) {
    const exists = PMCStore.linePerSku.find(l => l.skuId === skuId && l.line === line);
    if (exists) return false;
    PMCStore.linePerSku.push({ skuId, line });
    PMCStore.emit('linePerSkuChanged');

    // Persist to DB
    // Get actual SKU UUID if needed
    const skuRecord = PMCStore.skuList.find(s => s.id === skuId || s.code === skuId);
    const dbSkuId = skuRecord ? skuRecord.id : skuId;

    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/line-sku`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skuId: dbSkuId, line })
    }).catch(err => console.error('Error adding line mapping', err));

    return true;
  }

  function deleteLinePerSku(skuId, line) {
    const skuRecord = PMCStore.skuList.find(s => s.id === skuId || s.code === skuId);
    const dbSkuId = skuRecord ? skuRecord.id : skuId;

    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/line-sku/${dbSkuId}/${line}`, { method: 'DELETE' })
    .then(res => { if(!res.ok) throw new Error('Gagal menghapus line mapping'); return PMCStore.loadMasterDataFromAPI(); })
    .catch(err => { console.error('Error deleting line mapping', err); alert(err.message); });
  }

  // Format helpers
  function formatNumber(n) {
    if (n === undefined || n === null) return '0';
    return n.toLocaleString('id-ID');
  }

  function formatDate(dateInput) {
    if (!dateInput) return "-";
    let d;
    if (dateInput instanceof Date) {
      d = dateInput;
    } else if (typeof dateInput === 'string') {
      // If it's already an ISO string (has T), use it as is
      const finalDateStr = dateInput.includes('T') ? dateInput : dateInput + 'T00:00:00';
      d = new Date(finalDateStr);
    } else {
      d = new Date(dateInput);
    }
    
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatTime(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function formatDecimal(n, decimals = 2) {
    if (typeof n !== 'number') return '0';
    return n % 1 === 0 ? formatNumber(n) : n.toFixed(decimals);
  }

  // ── Stock Check Data ──


  // State transit tracking
  // Format: { blockId: { rowId: { material: 'Material', qty: 2, max: 4 } } } // qty is in pallets
  
  
  // Array to track individual batches/pallets in transit
  // Format: { id, material, barcode, mid, dateInGudang, dateInTrans, timeInTrans, palletsAvailable, supplier }
  


  // Array to log all transit stock mutaions
  // Format: { date: 'YYYY-MM-DD', time: 'HH:MM:SS', type: 'IN'/'OUT', material: 'Name', qty: 2, uom: 'Pallet', line: 'Line 1', skuId: 'SKU' }
  

  async function loadStockMutationsFromAPI(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.material && filters.material !== 'ALL') params.append('material', filters.material);
      if (filters.block && filters.block !== 'ALL') params.append('block', filters.block);
      if (filters.row && filters.row !== 'ALL') params.append('row', filters.row);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.line && filters.line !== 'ALL') params.append('line', filters.line);
      if (filters.sku && filters.sku !== 'ALL') params.append('sku', filters.sku);
      
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/transit/report/mutation${query}`);
      if (res.ok) {
        const data = await res.json();
        PMCStore.stockMutations = data.reportList || []; // Keep existing array format minimal or just store Raw
        PMCStore.transitMutationReportRaw = data;
        PMCStore.emit('mutationsLoaded');
      } else {
        PMCStore.transitMutationReportRaw = { reportList: [], summary: {} };
      }
    } catch (err) {
      console.warn('Failed to load stock mutations from API', err);
      PMCStore.transitMutationReportRaw = { reportList: [], summary: {} };
    }
  }

// Auto-Exports
  PMCStore.getNextBarcodeRange = getNextBarcodeRange;
  PMCStore.getNextMID = getNextMID;
  PMCStore.getWarehouseStock = getWarehouseStock;
  PMCStore.addWarehouseStock = addWarehouseStock;
  PMCStore.deleteWarehouseStock = deleteWarehouseStock;
  PMCStore.getSKU = getSKU;
  PMCStore.getBOM = getBOM;
  PMCStore.getUniqueDates = getUniqueDates;
  PMCStore.getMaterialUOM = getMaterialUOM;
  PMCStore.getShiftSummary = getShiftSummary;
  PMCStore.applyRounding = applyRounding;
  PMCStore.getStockBalanceForDate = getStockBalanceForDate;
  PMCStore.getMaterialRequirements = getMaterialRequirements;
  PMCStore.getHourlyDistribution = getHourlyDistribution;
  PMCStore.getMergedHourlyDistribution = getMergedHourlyDistribution;
  PMCStore.getStats = getStats;
  PMCStore.getDailyProduction = getDailyProduction;
  PMCStore.getRecentSchedules = getRecentSchedules;
  PMCStore.addSKU = addSKU;
  PMCStore.updateSKU = updateSKU;
  PMCStore.deleteSKU = deleteSKU;
  PMCStore.addBOMComponent = addBOMComponent;
  PMCStore.updateBOMComponent = updateBOMComponent;
  PMCStore.deleteBOMComponent = deleteBOMComponent;
  PMCStore.addSchedules = addSchedules;
  PMCStore.updateScheduleCell = updateScheduleCell;
  PMCStore.deleteSchedule = deleteSchedule;
  PMCStore.markDateConverted = markDateConverted;
  PMCStore.getPalletQty = getPalletQty;
  PMCStore.setPalletQty = setPalletQty;
  PMCStore.getAllPalletQty = getAllPalletQty;
  PMCStore.getLinePerSku = getLinePerSku;
  PMCStore.getLinesForSku = getLinesForSku;
  PMCStore.getSkusForLine = getSkusForLine;
  PMCStore.addLinePerSku = addLinePerSku;
  PMCStore.deleteLinePerSku = deleteLinePerSku;
  PMCStore.formatNumber = formatNumber;
  PMCStore.formatDate = formatDate;
  PMCStore.formatTime = formatTime;
  PMCStore.formatDecimal = formatDecimal;
  PMCStore.loadStockMutationsFromAPI = loadStockMutationsFromAPI;
  PMCStore._allocateFromWMS = _allocateFromWMS;

})(window.PMCStore);