/* ===== PMC Global Store - Core ===== */

const PMCStore = (() => {
  // API base URL - always uses same origin via Vite proxy (/api → localhost:3000)
  // Works for: Vite dev (localhost:5137), ngrok (HTTPS), local network IP
  const API_BASE = `${window.location.origin}/api`;

  // Event system
  const listeners = {};

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(f => f !== fn);
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(fn => fn(data));
    }
  }

  // ── Network Reliability State ──
  let _apiConnected = true;

  // ── Offline Queue Processor ──
  async function processOfflineQueue() {
    try {
      const { get, set } = await import('idb-keyval');
      let queue = await get('offline_queue_pmc') || [];
      if (queue.length === 0) return;
      
      console.log(`[PWA] Processing ${queue.length} offline requests...`);
      const newQueue = [];
      let successCount = 0;
      
      for (const req of queue) {
        try {
          const res = await fetch(req.url, req.options);
          if (res.ok) {
            successCount++;
          } else {
            console.error(`[PWA] Background sync failed for URL: ${req.url}`, await res.text());
            newQueue.push(req);
          }
        } catch(e) {
          console.warn(`[PWA] Still offline, keeping request in queue`);
          newQueue.push(req);
        }
      }
      
      await set('offline_queue_pmc', newQueue);
      if (successCount > 0) {
        emit('data_sync_required', { source: 'background_sync' });
        emit('toast', { type: 'success', message: `${successCount} data mutasi yang tertunda berhasil diselaraskan.` });
      }
    } catch(err) {
      console.warn('[PWA] Offline queue processing skipped:', err.message);
    }
  }

  function updateApiStatus(status) {
    if (_apiConnected !== status) {
      _apiConnected = status;
      emit('apiStatusChanged', _apiConnected);
      _renderGlobalApiBanner(_apiConnected);
      
      if (status === true) {
        processOfflineQueue();
      }
    }
  }

  function _renderGlobalApiBanner(isConnected) {
    let banner = document.getElementById('global-api-banner');
    if (!isConnected) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'global-api-banner';
        banner.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:#f39c12; color:white; text-align:center; padding:8px; font-weight:bold; z-index:9999; box-shadow:0 2px 10px rgba(0,0,0,0.5); font-size:14px; display:flex; justify-content:center; align-items:center; gap:10px;';
        
        banner.innerHTML = `
          <div style="width:10px; height:10px; background:white; border-radius:50%; animation: pulse 1.5s infinite"></div>
          ⚠️ OFFLINE MODE - Sinyal Terputus. Pemotongan Barcode akan tersimpan otomatis di perangkat ini dan terkirim saat sinyal kembali.
        `;
        document.body.appendChild(banner);
        
        if (!document.getElementById('pulse-anim')) {
          const style = document.createElement('style');
          style.id = 'pulse-anim';
          style.innerHTML = `@keyframes pulse { 0% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.2); } 100% { opacity:1; transform:scale(1); } }`;
          document.head.appendChild(style);
        }
      }
      banner.style.display = 'flex';
    } else if (banner) {
      banner.style.display = 'none';
    }
  }

  // Wrapper for fetch to auto-detect offline
  async function safeFetch(url, options = {}) {
    try {
      // Always include credentials so Better Auth session cookies are sent
      const res = await fetch(url, { ...options, credentials: 'include' });
      if (!_apiConnected) updateApiStatus(true);
      return res;
    } catch (err) {
      updateApiStatus(false);
      
      // If it's a POST/PUT/DELETE request, enqueue it automatically
      const method = options.method ? options.method.toUpperCase() : 'GET';
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
        try {
          const { get, set } = await import('idb-keyval');
          console.warn(`[PWA] Network error, queuing request: ${method} ${url}`);
          
          let queue = await get('offline_queue_pmc') || [];
          queue.push({ url, options, timestamp: Date.now() });
          await set('offline_queue_pmc', queue);
          
          return {
            ok: true, 
            json: async () => ({ success: true, message: "⚠️ Tersimpan Offline (Menunggu Sinyal Wi-Fi)", offlineQueued: true }),
            text: async () => "Offline Queued"
          };
        } catch(idbErr) {
          console.warn('[PWA] IndexedDB unavailable, cannot queue offline');
        }
      }
      
      throw err;
    }
  }


  // Expose internal state variables explicitly
  const state = {
    apiConnected: true,
    skuList: [], uomConversions: [
      { uom: 'ROL', unit: '1 Roll', conversion: '1000 meter' },
      { uom: 'PCS', unit: '1 Pieces', conversion: '-' },
      { uom: 'KG', unit: '1 Kilogram', conversion: '1000 gram' },
      { uom: 'LBR', unit: '1 Lembar', conversion: '-' }
    ], supplierList: [], bomData: [], palletQtyMap: {}, linePerSku: [],
    schedules: [], warehouseInventory: [], transitInventory: [], blockLayout: [],
    transitStock: {}, usedBarcodes: new Set(), stockMutations: [], activeDeliveries: [],
    lineStock: [], lineBarcodes: [], pendingReturns: [], transitOutboundPending: [],
    transitInfoCache: { blocks: [] }, materialReceh: [], lineMutations: [], lineMutationReportRaw: { reportList: [] },
    stockChecks: {},
    externalOnhand: { '3P2': { stock: {}, barcodes: [] }, '3F2': { stock: {}, barcodes: [] } },
    _schedulesLoaded: false, _barcodeCounter: 0, _midCounter: 0
  };

  const store = { API_BASE, on, off, emit, safeFetch };
  
  Object.keys(state).forEach(key => {
    Object.defineProperty(store, key, {
      get: () => state[key],
      set: (val) => { state[key] = val; }
    });
  });

  // ── WebSockets Real-Time Sync Setup ──
  setTimeout(() => { // ensure window.io is loaded from script tag
    if (window.io) {
      const socket = window.io(window.location.origin);
      
      socket.on('connect', () => {
        console.log('[Socket] Connected to real-time server:', socket.id);
      });

      socket.on('transit_stock_updated', (payload) => {
        console.log('[Socket] Transit Stock Updated:', payload);
        emit('data_sync_required', payload);
      });

      socket.on('line_stock_updated', (payload) => {
        console.log('[Socket] Line Stock Updated:', payload);
        emit('data_sync_required', payload);
      });

      socket.on('warehouse_stock_updated', (payload) => {
        console.log('[Socket] Warehouse Stock Updated:', payload);
        emit('data_sync_required', payload);
      });
      
      socket.on('disconnect', () => {
        console.log('[Socket] Disconnected from server');
      });
    } else {
      console.warn('[Socket] socket.io client not found. Real-time updates disabled.');
    }
  }, 1000);

  return store;
})();

window.PMCStore = PMCStore;
export default PMCStore;