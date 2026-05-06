/* ===== TV Dashboard - Transit Inbound Live Display ===== */
/* Gabungan: Kiri = Daftar Antrean, Kanan = Peta Blok Berkedip */
const TvDashboardPage = (() => {
  let refreshInterval = null;
  let clockInterval = null;
  let currentPage = 0;
  let autoPageInterval = null;
  let lastItems = [];

  // Screensaver State
  let isScreensaverActive = false;
  let screensaverTimer = null;
  let currentScreenIdx = 0;
  const SCREENSAVER_DELAY_MS = 15000;
  const screensaverSequence = [
    { url: '#/dashboard', id: 'rings' },
    { url: '#/transit/info', id: 'top' },
    { url: '#/dashboard?view=delivery', id: 'top' },
    { url: '#/distribution?view=tv', id: 'top' },
    { url: '#/dashboard', id: 'top' }
  ];

  const ITEMS_PER_PAGE = 12;
  const REFRESH_MS = 5000;
  const AUTO_PAGE_MS = 8000;

  function getLogicalDateStr() {
    const now = new Date();
    const h = now.getHours();
    // Shift 3 starts at 23:00 and ends at 07:00 next day.
    // If it's 00:00 - 06:59, we still consider it "yesterday" logically for production/delivery matching
    if (h < 7) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    return now.toISOString().split('T')[0];
  }

  function getBlockLabel(targetBlockRowId) {
    if (!targetBlockRowId) return { block: '?', row: '?' };
    const transitInfo = PMCStore.getTransitInfo();
    let block = '?', row = '?';
    (transitInfo.blocks || []).forEach(b => {
      b.rows.forEach(r => {
        if (r.id === targetBlockRowId) {
          block = b.blockNumber !== undefined ? b.blockNumber : b.id;
          row = r.rowNumber !== undefined ? r.rowNumber : r.id;
        }
      });
    });
    return { block, row };
  }

  async function fetchPendingInbound() {
    const items = [];
    let hasActiveProcess = false;

    // 1. Delivery Aktif (status: delivering atau preparing)
    try {
      const dateStr = getLogicalDateStr();
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const currentShift = ShiftConfig.detectCurrentShift(dateStr, mins);
      
      const deliveries = PMCStore.activeDeliveries || [];
      
      deliveries.forEach(d => {
        // Abaikan jam/shift, tampilkan semua yang statusnya 'preparing' atau 'delivering'
        if (d.status === 'preparing' || d.status === 'delivering') {
          
          // Hitung progres untuk menentukan apakah proses masih aktif
          let totalReq = 0;
          let totalReceived = 0;
          let pendingCountInGrup = 0;

          (d.items || []).forEach(it => {
            const req = parseFloat(it.requiredPallets || it.required || it.planned || 0);
            totalReq += req;
            (it.scans || []).forEach(scan => {
              if (scan.barcode && scan.barcode !== '-') {
                if (PMCStore.usedBarcodes.has(scan.barcode)) {
                  totalReceived++;
                } else {
                  pendingCountInGrup++;
                }
              }
            });
          });

          const isFullyDone = (totalReq > 0 && totalReceived >= totalReq);
          
          // JIKA GRUP SUDAH SELESAI SEMUA, ABAIKAN (JANGAN TAMPILKAN)
          if (isFullyDone) return;

          // Jika ada yang belum diterima, maka proses dianggap aktif
          if (pendingCountInGrup > 0) {
            hasActiveProcess = true;
          }

          // Tambahkan item ke list
          (d.items || []).forEach(item => {
            const scans = item.scans || [];
            scans.forEach(scan => {
              if (scan.barcode && scan.barcode !== '-') {
                const isReceived = PMCStore.usedBarcodes.has(scan.barcode);
                const loc = getBlockLabel(scan.targetBlockRowId);
                items.push({
                  type: 'delivery',
                  barcode: scan.barcode,
                  material: item.material || item.materialName,
                  pcs: scan.pcs || '-',
                  supplier: scan.supplier || '-',
                  blockLabel: `B${loc.block}.${loc.row}`,
                  targetBlockRowId: scan.targetBlockRowId,
                  spbNumber: null,
                  timestamp: scan.createdAt || d.createdAt,
                  displayStatus: d.status === 'preparing' ? 'Loading' : 'Otw',
                  isReceived: isReceived,
                  slotId: d.slotId
                });
              }
            });
          });
        }
      });
    } catch (e) {
      console.warn('[TVDashboard] Error fetching deliveries:', e);
    }

    // 2. Manual SPB (status: shipping)
    try {
      const res = await fetch(`${PMCStore.API_BASE}/manual-spb`);
      if (res.ok) {
        const spbList = await res.json();
        spbList.forEach(spb => {
          if (spb.status === 'completed') return;
          
          let pendingCountInSpb = 0;

          (spb.items || []).forEach(item => {
            (item.scans || []).forEach(scan => {
              const isReceived = scan.status === 'received' || PMCStore.usedBarcodes.has(scan.barcode);
              if (!isReceived) pendingCountInSpb++;

              const loc = getBlockLabel(scan.targetBlockRowId);
              items.push({
                type: 'manual',
                barcode: scan.barcode || '-',
                material: item.materialName,
                pcs: scan.pcs || '-',
                supplier: scan.supplier || '-',
                blockLabel: `B${loc.block}.${loc.row}`,
                targetBlockRowId: scan.targetBlockRowId,
                spbNumber: spb.spbNumber,
                timestamp: scan.createdAt,
                isReceived: isReceived
              });
            });
          });

          if (pendingCountInSpb > 0) {
            hasActiveProcess = true;
          }
        });
      }
    } catch (e) {
      console.warn('[TVDashboard] Error fetching manual SPB:', e);
    }

    items.sort((a, b) => {
      // Prioritaskan yang BELUM diterima (isReceived: false) ke atas
      if (a.isReceived !== b.isReceived) {
        return a.isReceived ? 1 : -1;
      }
      
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return { items, hasActiveProcess };
  }

  async function render() {
    if (window.location.hash !== '#/tv/inbound') return;
    ChartWrapper.destroyAll();
    cleanup();
    currentPage = 0;

    const container = document.getElementById('page-content');
    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');
    const main = document.getElementById('main');
    if (sidebar) sidebar.style.display = 'none';
    if (topbar) topbar.style.display = 'none';
    if (main) { main.style.marginLeft = '0'; main.style.paddingTop = '0'; }
    container.style.cssText = 'padding:0;max-width:100%;width:100vw;height:100vh;overflow:hidden;';

    container.innerHTML = `
      <div id="tv-screensaver-container" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; background:#060610;">
          <iframe id="tv-screensaver-iframe" src="about:blank" style="width:100%; height:100%; border:none;"></iframe>
      </div>
      <div id="tv-root" style="
        width:100vw; height:100vh; 
        background: #060610;
        display:flex; flex-direction:column;
        font-family: 'Outfit', 'Inter', sans-serif;
        color: #e6e6e6;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          padding: 16px 30px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 2px solid rgba(108, 92, 231, 0.3);
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.12), rgba(0,0,0,0));
          flex-shrink: 0;
        ">
          <div style="display:flex; align-items:center; gap:16px;">
            <span style="font-size:2rem;">📦</span>
            <div>
              <div style="font-size:1.6rem; font-weight:900; 
                background: linear-gradient(90deg, #a8c0ff, #3f2b96); 
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                letter-spacing: 1px;">KEDATANGAN BARANG — TRANSIT</div>
              <div style="font-size:0.85rem; color:rgba(255,255,255,0.35);">Panduan penempatan barang ke blok tujuan</div>
            </div>
          </div>
          <div id="tv-debug" style="font-size:0.6rem; color:rgba(255,255,255,0.1); max-width:200px; overflow:hidden;"></div>
          <div style="text-align:right;">
            <div id="tv-clock" style="font-size:2.2rem; font-weight:800; font-family:monospace; color:#a8c0ff; text-shadow: 0 0 10px rgba(168,192,255,0.4);"></div>
            <div id="tv-date" style="font-size:0.85rem; color:rgba(255,255,255,0.3);"></div>
          </div>
        </div>

        <!-- Main Split: Left List + Right Map -->
        <div style="flex:1; display:flex; overflow:hidden;">
          
          <!-- LEFT: Daftar Antrean (60%) -->
          <div style="flex:0 0 58%; display:flex; flex-direction:column; border-right: 2px solid rgba(108,92,231,0.15);">
            <!-- Table Header -->
            <div style="
              display: grid;
              grid-template-columns: 50px 220px 1fr 100px 80px 130px;
              padding: 10px 20px;
              background: rgba(108, 92, 231, 0.06);
              border-bottom: 1px solid rgba(255,255,255,0.06);
              font-size: 0.75rem;
              font-weight: 700;
              color: rgba(168,192,255,0.7);
              text-transform: uppercase;
              letter-spacing: 2px;
              flex-shrink: 0;
            ">
              <div>#</div>
              <div>BARCODE</div>
              <div>MATERIAL</div>
              <div style="text-align:center;">STATUS</div>
              <div style="text-align:center;">PCS</div>
              <div style="text-align:center;">BLOK</div>
            </div>
            <div id="tv-list" style="flex:1; overflow:hidden;"></div>
            <div id="tv-footer" style="
              padding: 8px 20px; display:flex; justify-content:space-between; align-items:center;
              border-top: 1px solid rgba(255,255,255,0.04); background:rgba(0,0,0,0.3); flex-shrink:0;
            ">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;animation:tvPulse 2s infinite;"></span>
                <span style="color:rgba(255,255,255,0.3);font-size:0.8rem;">Live</span>
              </div>
              <div id="tv-page-info" style="color:rgba(255,255,255,0.3);font-size:0.8rem;"></div>
              <div id="tv-total-info" style="color:rgba(255,255,255,0.4);font-size:0.85rem;font-weight:600;"></div>
            </div>
          </div>

          <!-- RIGHT: Peta Blok (42%) -->
          <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2);">
            <div style="padding:12px 20px; font-size:0.85rem; font-weight:700; color:rgba(168,192,255,0.6); text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid rgba(255,255,255,0.04); flex-shrink:0;">
              🗺️ DENAH BLOK TRANSIT
            </div>
            <div id="tv-map" style="flex:1; padding:16px; overflow:auto; display:flex; flex-wrap:wrap; align-content:flex-start; gap:10px;"></div>
          </div>
        </div>
      </div>

      <style>
        @keyframes tvPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes tvSlideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes tvGlow {
          0%,100% { box-shadow: 0 0 8px rgba(251,191,36,0.4), inset 0 0 6px rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.6); }
          50% { box-shadow: 0 0 20px rgba(251,191,36,0.8), inset 0 0 12px rgba(251,191,36,0.2); border-color: rgba(251,191,36,1); }
        }
        @keyframes tvGlowManual {
          0%,100% { box-shadow: 0 0 8px rgba(168,85,247,0.4), inset 0 0 6px rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.6); }
          50% { box-shadow: 0 0 20px rgba(168,85,247,0.8), inset 0 0 12px rgba(168,85,247,0.2); border-color: rgba(168,85,247,1); }
        }
        @keyframes tvTickPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.3); opacity: 1; text-shadow: 0 0 10px rgba(34,197,94,0.6); }
        }
      </style>
    `;

    // Clock
    function updateClock() {
      const now = new Date();
      const c = document.getElementById('tv-clock');
      const d = document.getElementById('tv-date');
      if (c) c.textContent = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
      if (d) d.textContent = now.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    }
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    await refreshData();
    refreshInterval = setInterval(refreshData, REFRESH_MS);
    autoPageInterval = setInterval(() => { currentPage++; renderList(lastItems); }, AUTO_PAGE_MS);

    window.addEventListener('hashchange', cleanup, { once: true });
  }

  async function refreshData() {
    try {
      await PMCStore.loadActiveDeliveriesFromAPI();
      await PMCStore.loadTransitInfoFromAPI(); // Refresh usedBarcodes!
      const { items, hasActiveProcess } = await fetchPendingInbound();
      lastItems = items;
      
      // Jika tidak ada data transit (items) DAN tidak ada proses aktif di gudang (request/loading)
      if (items.length === 0 && !hasActiveProcess) {
        if (!isScreensaverActive) {
          startScreensaver();
        }
      } else {
        if (isScreensaverActive) {
          stopScreensaver();
        }
        renderList(items);
        renderMap(items);
      }
    } catch (e) { console.warn('[TVDashboard] Refresh error:', e); }
  }

  function startScreensaver() {
    isScreensaverActive = true;
    currentScreenIdx = 0;
    
    const scContainer = document.getElementById('tv-screensaver-container');
    const scIframe = document.getElementById('tv-screensaver-iframe');
    const tvRoot = document.getElementById('tv-root');
    
    if (scContainer && scIframe && tvRoot) {
      scContainer.style.display = 'block';
      tvRoot.style.display = 'none';
      
      const loadStep = () => {
        const step = screensaverSequence[currentScreenIdx];
        scIframe.src = window.location.origin + window.location.pathname + step.url;
        
        scIframe.onload = () => {
          if (step.id === 'rings') {
            let attempts = 0;
            const scrollIt = setInterval(() => {
              try {
                const texts = scIframe.contentDocument.querySelectorAll('h3');
                for (let t of texts) {
                  if (t.textContent.includes('Persentase Pengiriman Harian per Shift')) {
                    t.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    clearInterval(scrollIt);
                    return;
                  }
                }
              } catch(e){}
              if (++attempts > 10) clearInterval(scrollIt);
            }, 300);
          }
        };
      };
      
      loadStep();
      screensaverTimer = setInterval(() => {
        currentScreenIdx = (currentScreenIdx + 1) % screensaverSequence.length;
        loadStep();
      }, SCREENSAVER_DELAY_MS);
    }
  }

  function stopScreensaver() {
    isScreensaverActive = false;
    if (screensaverTimer) {
      clearInterval(screensaverTimer);
      screensaverTimer = null;
    }
    
    const scContainer = document.getElementById('tv-screensaver-container');
    const tvRoot = document.getElementById('tv-root');
    if (scContainer && tvRoot) {
      scContainer.style.display = 'none';
      tvRoot.style.display = 'flex';
      
      const scIframe = document.getElementById('tv-screensaver-iframe');
      if (scIframe) scIframe.src = 'about:blank';
    }
  }

  // ── LEFT PANEL: Daftar Antrean ──
  function renderList(items) {
    const body = document.getElementById('tv-list');
    const pageInfo = document.getElementById('tv-page-info');
    const totalInfo = document.getElementById('tv-total-info');
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; height:100%;">
          <div style="font-size:4rem; animation:tvPulse 3s ease-in-out infinite;">✅</div>
          <div style="font-size:1.6rem; font-weight:800; color:#10b981;">SEMUA DITERIMA</div>
          <div style="font-size:0.95rem; color:rgba(255,255,255,0.3);">Menunggu pengiriman berikutnya...</div>
        </div>`;
      if (pageInfo) pageInfo.textContent = '';
      if (totalInfo) totalInfo.textContent = '';
      return;
    }

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    if (currentPage >= totalPages) currentPage = 0;
    const start = currentPage * ITEMS_PER_PAGE;
    const page = items.slice(start, start + ITEMS_PER_PAGE);

    // Prevent flicker: Check if content actually changed
    const contentHash = JSON.stringify(page.map(it => ({ b: it.barcode, r: it.isReceived, s: it.displayStatus })));
    if (body.getAttribute('data-hash') === contentHash) {
      // Just update footer/page info if needed
      if (pageInfo) pageInfo.textContent = totalPages > 1 ? `Hal ${currentPage+1}/${totalPages}` : '';
      if (totalInfo) totalInfo.textContent = `📦 ${items.length} palet`;
      return;
    }
    body.setAttribute('data-hash', contentHash);

    let html = '';
    page.forEach((item, idx) => {
      const num = start + idx + 1;
      const isManual = item.type === 'manual';
      const isReceived = item.isReceived;
      
      const rowOpacity = isReceived ? '0.4' : '1';
      const bg = idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.1)';
      
      const tag = isManual
        ? '<span style="background:rgba(168,85,247,0.25);color:#c4b5fd;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;">SPB</span>'
        : '';

      const statusColor = item.displayStatus === 'Loading' ? '#fbbf24' : (item.displayStatus === 'Wait' ? '#a0aec0' : '#10b981');
      const statusLabel = item.displayStatus || (isManual ? 'Manual' : 'Otw');

      const statusContent = isReceived 
        ? `<span style="font-size:1.8rem; color:#22c55e; animation: tvTickPulse 1.5s infinite alternate;">&#10004;</span>`
        : `<span style="font-size:0.7rem; font-weight:800; padding:4px 10px; border-radius:6px; background:rgba(0,0,0,0.3); color:${statusColor}; border:1px solid ${statusColor}; text-transform:uppercase;">${statusLabel}</span>`;

      html += `
        <div style="
          display:grid; grid-template-columns:50px 220px 1fr 100px 80px 130px;
          padding:6px 20px; background:${bg};
          border-bottom:1px solid rgba(255,255,255,0.03);
          align-items:center;
          opacity: ${rowOpacity};
          transition: opacity 0.5s ease;
          animation:tvSlideIn 0.3s ease ${idx*0.04}s both;
        ">
          <div style="font-size:1.1rem;font-weight:900;color:rgba(255,255,255,0.2);font-family:monospace;">${String(num).padStart(2,'0')}</div>
          <div>
            <div style="font-size:1.45rem;font-weight:900;color:#fff;font-family:monospace;letter-spacing:1px;text-shadow:0 0 10px rgba(255,255,255,0.1);">${item.barcode}</div>
            <div style="margin-top:2px;">${tag} ${item.spbNumber ? `<span style="font-size:0.65rem;color:rgba(255,255,255,0.25);">${item.spbNumber}</span>` : ''}</div>
          </div>
          <div>
            <div style="font-size:1.05rem;font-weight:800;color:#fff;">${item.material}</div>
          </div>
          <div style="text-align:center;">
             ${statusContent}
          </div>
          <div style="text-align:center;font-size:1.05rem;font-weight:800;color:#fbbf24;">${item.pcs}</div>
          <div style="text-align:center;">
            <span style="
              display:inline-block; font-size:1.3rem; font-weight:900; color:#fff;
              background:linear-gradient(135deg, rgba(108,92,231,0.35), rgba(59,130,246,0.25));
              padding:4px 14px; border-radius:8px;
              border:2px solid rgba(108,92,231,0.5);
              animation:${isManual ? 'tvGlowManual' : 'tvGlow'} 2s ease-in-out infinite;
              letter-spacing:1px; min-width:70px;
            ">${item.blockLabel}</span>
          </div>
        </div>`;
    });
    body.innerHTML = html;
    if (pageInfo) pageInfo.textContent = totalPages > 1 ? `Hal ${currentPage+1}/${totalPages}` : '';
    if (totalInfo) totalInfo.textContent = `📦 ${items.length} palet menunggu`;
  }

  // ── RIGHT PANEL: Peta Blok ──
  function renderMap(items) {
    const mapEl = document.getElementById('tv-map');
    if (!mapEl) return;

    const layout = PMCStore.getBlockLayout();
    if (!layout || layout.length === 0) {
      mapEl.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;">Belum ada konfigurasi blok.</div>';
      return;
    }

    // Build lookup: targetBlockRowId -> list of pending items
    const pendingByRow = {};
    items.forEach(item => {
      if (item.targetBlockRowId) {
        if (!pendingByRow[item.targetBlockRowId]) pendingByRow[item.targetBlockRowId] = [];
        pendingByRow[item.targetBlockRowId].push(item);
      }
    });

    // Also build block-level pending count
    const pendingByBlock = {};
    const transitInfo = PMCStore.getTransitInfo();
    (transitInfo.blocks || []).forEach(b => {
      b.rows.forEach(r => {
        if (pendingByRow[r.id]) {
          if (!pendingByBlock[b.id]) pendingByBlock[b.id] = { count: 0, materials: new Set() };
          pendingByBlock[b.id].count += pendingByRow[r.id].length;
          pendingByRow[r.id].forEach(p => pendingByBlock[b.id].materials.add(p.material));
        }
      });
    });

    let html = '';
    layout.forEach(block => {
      const bNum = block.blockNumber || block.id;
      const bp = pendingByBlock[block.id];
      const hasPending = bp && bp.count > 0;

      const borderStyle = hasPending
        ? 'border:2px solid rgba(251,191,36,0.6); animation:tvGlow 2s ease-in-out infinite;'
        : 'border:1px solid rgba(255,255,255,0.08);';
      const bgStyle = hasPending
        ? 'background:linear-gradient(135deg, rgba(251,191,36,0.08), rgba(0,0,0,0.3));'
        : 'background:rgba(255,255,255,0.02);';

      let rowsHtml = '';
      (block.rows || []).forEach(row => {
        if (!row.material) return;
        const rNum = row.rowNumber || row.id;
        const rowPending = pendingByRow[row.id];
        const rHasPending = rowPending && rowPending.length > 0;

        const rBg = rHasPending ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)';
        const rBorder = rHasPending ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.05)';
        const rColor = rHasPending ? '#fbbf24' : 'rgba(255,255,255,0.4)';

        // Truncate material name for map
        const matShort = row.material.length > 14 ? row.material.substring(0, 12) + '..' : row.material;

        rowsHtml += `
          <div style="
            padding:4px 6px; background:${rBg}; border:${rBorder}; border-radius:4px;
            display:flex; justify-content:space-between; align-items:center; gap:4px;
            ${rHasPending ? 'animation:tvGlow 2s ease-in-out infinite;' : ''}
          ">
            <span style="font-size:0.6rem; color:${rColor}; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:90px;" title="${row.material}">${matShort}</span>
            ${rHasPending 
              ? `<span style="background:rgba(251,191,36,0.3);color:#fbbf24;font-size:0.6rem;font-weight:900;padding:1px 5px;border-radius:3px;white-space:nowrap;">🚚 ${rowPending.length}</span>` 
              : ''}
          </div>`;
      });

      html += `
        <div style="
          ${bgStyle} ${borderStyle}
          border-radius:10px; padding:8px; min-width:150px; max-width:200px;
          flex: 1 1 150px;
          transition: all 0.3s;
        ">
          <div style="
            display:flex; justify-content:space-between; align-items:center;
            margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.06);
          ">
            <span style="font-size:1.1rem; font-weight:900; color:${hasPending ? '#fbbf24' : 'rgba(255,255,255,0.5)'};">B${bNum}</span>
            ${hasPending ? `<span style="background:rgba(251,191,36,0.25);color:#fbbf24;font-size:0.7rem;font-weight:800;padding:2px 8px;border-radius:6px;">📦 ${bp.count}</span>` : ''}
          </div>
          <div style="display:flex; flex-direction:column; gap:3px;">
            ${rowsHtml || '<div style="font-size:0.6rem;color:rgba(255,255,255,0.15);text-align:center;padding:4px;">Kosong</div>'}
          </div>
        </div>`;
    });

    mapEl.innerHTML = html;
  }

  function cleanup() {
    stopScreensaver();
    if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
    if (autoPageInterval) { clearInterval(autoPageInterval); autoPageInterval = null; }
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }

    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');
    const main = document.getElementById('main');
    const container = document.getElementById('page-content');
    if (sidebar) sidebar.style.display = '';
    if (topbar) topbar.style.display = '';
    if (main) { main.style.marginLeft = ''; main.style.paddingTop = ''; }
    if (container) container.style.cssText = '';
  }

  return { render };
})();

window.TvDashboardPage = TvDashboardPage;
export default TvDashboardPage;
