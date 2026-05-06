/* ===== PMC Store - Master ===== */
import './core.js';
((PMCStore) => {
  // Use direct PMCStore access to avoid destructuring closure bugs during modular load
  const API_BASE = PMCStore.API_BASE;
  const safeFetch = PMCStore.safeFetch;
  const emit = PMCStore.emit;
  // ── Master SKU Data ──
  

  // ── Supplier Data ──
  

  function addSupplier(sup) {
    const { id, ...dbSup } = sup;
    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/supplier`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dbSup)
    })
    .then(res => {
      if(!res.ok) throw new Error("Gagal menyimpan Supplier. Pastikan Kode tidak duplikat.");
      return PMCStore.loadMasterDataFromAPI();
    })
    .catch(err => {
      console.error('Error adding supplier', err);
      alert(err.message);
    });
  }

  function updateSupplier(id, data) {
    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/supplier/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    })
    .then(res => { if(!res.ok) throw new Error('Gagal update supplier'); return PMCStore.loadMasterDataFromAPI(); })
    .catch(err => { console.error('Error updating supplier', err); alert(err.message); });
  }

  function deleteSupplier(id) {
    PMCStore.safeFetch(`${PMCStore.API_BASE}/master/supplier/${id}`, { method: 'DELETE' })
    .then(res => { if(!res.ok) throw new Error('Gagal menghapus supplier'); return PMCStore.loadMasterDataFromAPI(); })
    .catch(err => { console.error('Error deleting supplier', err); alert(err.message); });
  }

  // ── BOM Data ──
  

  // ── Pallet Qty Data (material name → qty per pallet) ──
  

  // ── Line per SKU Mapping ──
  

  // ── Schedules (imported data) ──
  // Helper: generate ISO date string offset from today
  function _demoDate(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }
  const _today = _demoDate(0);
  const _yesterday = _demoDate(-1);
  const _tomorrow = _demoDate(1);

  // Schedules loaded from backend API (starts empty, populated by loadSchedulesFromAPI)
  
  

  // Fallback demo data used when backend has no PMCStore.schedules yet
  const _demoSchedules = [
    { date: _yesterday, line: 'A', skuId: 'SKU001', sh1: 400, sh2: 350, sh3: 250, status: 'converted' },
    { date: _yesterday, line: 'A', skuId: 'SKU002', sh1: 200, sh2: 300, sh3: 200, status: 'converted' },
    { date: _yesterday, line: 'B', skuId: 'SKU001', sh1: 150, sh2: 200, sh3: 150, status: 'converted' },
    { date: _yesterday, line: 'B', skuId: 'SKU003', sh1: 300, sh2: 200, sh3: 250, status: 'converted' },
    { date: _today, line: 'A', skuId: 'SKU004', sh1: 350, sh2: 400, sh3: 300, status: 'pending' },
    { date: _today, line: 'A', skuId: 'SKU005', sh1: 250, sh2: 200, sh3: 180, status: 'pending' },
    { date: _today, line: 'B', skuId: 'SKU006', sh1: 500, sh2: 450, sh3: 400, status: 'pending' },
    { date: _tomorrow, line: 'A', skuId: 'SKU001', sh1: 600, sh2: 550, sh3: 500, status: 'pending' },
    { date: _tomorrow, line: 'B', skuId: 'SKU002', sh1: 300, sh2: 350, sh3: 250, status: 'pending' },
  ];

  // Master Data API Loader
  async function loadMasterDataFromAPI() {
    try {
      const endpoints = [
        PMCStore.safeFetch(`${PMCStore.API_BASE}/master/sku`),
        PMCStore.safeFetch(`${PMCStore.API_BASE}/master/supplier`),
        PMCStore.safeFetch(`${PMCStore.API_BASE}/master/bom`),
        PMCStore.safeFetch(`${PMCStore.API_BASE}/master/line-sku`),
        PMCStore.safeFetch(`${PMCStore.API_BASE}/master/pallet-qty`)
      ];

      const [skuRes, supRes, bomRes, lineRes, palRes] = await Promise.all(endpoints.map(p => p.catch(() => null)));

      if (skuRes && skuRes.ok) {
        const data = await skuRes.json();
        PMCStore.skuList = data || [];
        PMCStore.emit('skuChanged');
      }

      if (supRes && supRes.ok) {
        const data = await supRes.json();
        PMCStore.supplierList = data || [];
        PMCStore.emit('supplierChanged');
      }

      if (bomRes && bomRes.ok) {
        const rawBom = await bomRes.json();
        // API returns flat rows, group by skuId into { skuId, components: [...] }
        const grouped = {};
        (rawBom || []).forEach(row => {
          const sid = row.skuId || row.sku_id;
          if (!grouped[sid]) grouped[sid] = { skuId: sid, components: [] };
          grouped[sid].components.push({
            id: row.id,
            name: row.materialName || row.name,
            oracleCode: row.oracleCode || row.oracle_code || '',
            coefficient: parseFloat(row.coefficient) || 0,
            uom: row.uom,
            rounding: row.rounding || 'ceiling',
            line: row.line || null,
          });
        });
        PMCStore.bomData = Object.values(grouped);
        PMCStore.emit('bomChanged');
      }

      if (lineRes && lineRes.ok) {
        const data = await lineRes.json();
        PMCStore.linePerSku = data || [];
        PMCStore.emit('linePerSkuChanged');
      }

      if (palRes && palRes.ok) {
        const data = await palRes.json();
        if (data && Array.isArray(data)) {
           const map = {};
           data.forEach(p => { map[p.materialName] = p.qtyPerPallet; });
           PMCStore.palletQtyMap = map;
        }
        PMCStore.emit('palletQtyChanged');
      }

      console.log('✅ Master data loaded from database.');
    } catch (err) {
      console.warn('⚠️ Error loading master data:', err);
    }
    await PMCStore.loadWarehouseStockFromAPI();
    await PMCStore.loadTransitLayoutFromAPI();
  }

  async function loadTransitLayoutFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/block-layout`);
      if (res.ok) {
        const layout = await res.json();
        if (layout && layout.length > 0) {
          PMCStore.blockLayout = layout.map(b => ({
            id: b.id,
            blockNumber: b.blockNumber,
            skuCategories: b.skuCategories || [],
            rows: (b.rows || []).map(r => ({
              id: r.id,
              rowNumber: r.rowNumber,
              maxPallets: r.maxPallets,
              material: r.materialName || '',
              assignedLines: r.assignedLines || [],
              lines: r.assignedLines || [],
              isFlexible: r.isFlexible || false
            }))
          }));
          PMCStore.emit('layoutChanged');
        }
      }
    } catch (err) {
      console.warn('Error loading transit layout:', err);
    }
    await PMCStore.loadTransitInfoFromAPI();
    await PMCStore.loadActiveDeliveriesFromAPI();
    await PMCStore.loadTransitOutboundPendingFromAPI();
    await PMCStore.loadLineStockFromAPI();
    await PMCStore.loadLineBarcodesFromAPI();
    await PMCStore.loadPendingReturnsFromAPI();
  }

  // Load Warehouse (WMS) Stock from backend
  async function loadWarehouseStockFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/warehouse/stock`);
      if (res.ok) {
        const data = await res.json();
        // Map backend to frontend expectations
        PMCStore.warehouseInventory = data.map(item => ({
          ...item,
          material: item.materialName,
          supplier: item.supplierName,
          barcodeStart: item.barcode,
          barcodeEnd: item.barcode,
        }));
        PMCStore.emit('warehouseStockChanged');
        console.log('✅ Warehouse stock loaded from database.');
      }
      // Also sync counters
      await PMCStore.loadWarehouseCountersFromAPI();
    } catch (err) {
      console.warn('⚠️ Error loading warehouse stock:', err);
    }
  }

  async function loadWarehouseCountersFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/warehouse/counters`);
      if (res.ok) {
        const data = await res.json();
        PMCStore._barcodeCounter = data.barcodeCounter || 0;
        PMCStore._midCounter = data.midCounter || 0;
        console.log(`✅ System counters synced: Barcode=${PMCStore._barcodeCounter}, MID=${PMCStore._midCounter}`);
      }
    } catch (err) {
      console.warn('⚠️ Error syncing warehouse counters:', err);
    }
  }

  async function loadSchedulesFromAPI() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/schedule`);
      if (!res.ok) throw new Error('Failed to fetch PMCStore.schedules');
      const data = await res.json();
      if (data && data.length > 0) {
        // Map backend fields: sku_id -> skuId
        PMCStore.schedules = data.map(s => ({
          id: s.id,
          date: typeof s.date === 'string' ? s.date.split('T')[0] : s.date,
          line: s.line,
          skuId: s.skuId || s.sku_id || s.skuCode || s.skuid,
          sh1: s.sh1 || 0,
          sh2: s.sh2 || 0,
          sh3: s.sh3 || 0,
          status: s.status || 'pending'
        }));
      } else {
        // No data in DB yet, fallback to empty
        PMCStore.schedules = [];
      }
      PMCStore._schedulesLoaded = true;
      PMCStore.emit('scheduleChanged');
      console.log(`✅ Schedules loaded from API: ${PMCStore.schedules.length} records`);
    } catch (err) {
      console.warn('⚠️ Could not load PMCStore.schedules from API', err.message);
      PMCStore._schedulesLoaded = true;
      PMCStore.emit('scheduleChanged');
    }
  }

// Auto-Exports
  PMCStore.addSupplier = addSupplier;
  PMCStore.updateSupplier = updateSupplier;
  PMCStore.deleteSupplier = deleteSupplier;
  PMCStore.loadMasterDataFromAPI = loadMasterDataFromAPI;
  PMCStore.loadTransitLayoutFromAPI = loadTransitLayoutFromAPI;
  PMCStore.loadWarehouseStockFromAPI = loadWarehouseStockFromAPI;
  PMCStore.loadWarehouseCountersFromAPI = loadWarehouseCountersFromAPI;
  PMCStore.loadSchedulesFromAPI = loadSchedulesFromAPI;
})(window.PMCStore);