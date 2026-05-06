/* ===== Live Distribution Info Page ===== */
const LiveDistributionPage = (() => {
  let _isRendering = false;

  async function render() {
    if (!window.location.hash.startsWith('#/transit/info')) return;
    if (_isRendering) return; // prevent re-entrant render from event listeners
    _isRendering = true;

    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    
    // Initial Loading State
    container.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; height:400px; color:var(--text-muted); flex-direction:column; gap:var(--sp-4);">
        <div class="spinner"></div>
        <p style="font-size:1.1rem; font-weight:500; letter-spacing:1px;">🗺️ Menginisialisasi Sensor Grid Transit...</p>
      </div>
    `;

    const dateStr = PMCStore.getLogicalDateStr();
    
    try {
      // Refresh transit and delivery data for accurate priority alerts (like Dashboard does)
      await PMCStore.loadTransitInfoFromAPI();
      await PMCStore.loadActiveDeliveriesFromAPI();
      // Ensure schedules + BOM are available for priority buffer calculation
      if (!PMCStore.schedules || PMCStore.schedules.length === 0) {
        await PMCStore.loadSchedulesFromAPI();
      }
      if (!PMCStore.bomData || PMCStore.bomData.length === 0) {
        await PMCStore.loadMasterDataFromAPI();
      }

      // ── Dashboard Date Fallback Logic ──
      // Dashboard auto-selects dates[0] if today has no schedule. We must match this.
      let dateStr = PMCStore.getLogicalDateStr();
      if (PMCStore.schedules && PMCStore.schedules.length > 0) {
        const availableDates = [...new Set(PMCStore.schedules.map(s => s.date))].sort();
        if (availableDates.length > 0 && !availableDates.includes(dateStr)) {
          dateStr = availableDates[0];
        }
      }


      const lineReqs = await PMCStore.getLineMaterialRequirements(dateStr);
      const tInfo = await PMCStore.getTransitInfo();
      const stockPerLineMat = PMCStore.getTransitStockPerLine();

      container.innerHTML = '';
      const page = document.createElement('div');
      page.className = 'page-enter';

      // ── Header ──
      const headerBar = document.createElement('div');
      headerBar.className = 'page-header';
      headerBar.style.marginBottom = '2rem';
      headerBar.style.paddingBottom = '1.5rem';
      headerBar.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      headerBar.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <h2 class="page-title" style="font-size: 2rem; background: linear-gradient(90deg, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; letter-spacing: -0.5px;">
            <span style="-webkit-text-fill-color: initial;">📊</span> MONITOR DISTRIBUSI TRANSIT
          </h2>
          <p class="page-subtitle" style="font-size:1.05rem; color:var(--text-muted);">
            Ketersediaan Stok Aktual VS Buffer Pengiriman (Level Jam)
          </p>
        </div>
      `;
      page.appendChild(headerBar);

      // ── Table Priority Request (Unified with Dashboard) ──
      const alertSection = document.createElement('div');
      alertSection.className = 'section';
      alertSection.style.marginBottom = '3rem';
      alertSection.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
          <div style="width:4px; height:24px; background:var(--danger-color); border-radius:4px; box-shadow:0 0 10px var(--danger-color);"></div>
          <h3 class="section-title" style="margin:0; font-size:1.3rem;">Status Prioritas Panggil (Request)</h3>
        </div>
      `;
      
      const priorityData = await PMCStore.getPriorityAlerts(dateStr);

      if (priorityData.length > 0) {
        const pGrid = document.createElement('div');
        pGrid.className = 'priority-grid';
        
        priorityData.forEach(p => {
          const isKritis = p.status === 'KRITIS';
          const card = document.createElement('div');
          card.className = `priority-card ${isKritis ? 'priority-card--kritis' : 'priority-card--warning'}`;
          card.innerHTML = `
            <div class="priority-status ${isKritis ? 'priority-status--kritis' : 'priority-status--warning'}">
              ${isKritis ? '🔴' : '🟡'} STATUS: ${p.status}
            </div>
            <div class="priority-material">
              ${p.material}
              <span class="priority-block-badge">📍 ${p.blockLabel}</span>
            </div>
            <div class="priority-details">
              <div>Stok: <strong>${PMCStore.formatNumber(p.actual)} Pcs</strong></div>
              ${p.incoming > 0 ? `<div style="color:#00d2ff">OTW: <strong>${PMCStore.formatNumber(p.incoming)}</strong></div>` : ''}
            </div>
            <div class="priority-footer">
              Kirim: <strong>${p.bufferPallets} Palet</strong> (@ ${PMCStore.formatNumber(p.palletQty)} pcs)
            </div>
          `;
          pGrid.appendChild(card);
        });
        alertSection.appendChild(pGrid);
      } else {
        const safeCard = document.createElement('div');
        safeCard.className = 'priority-grid';
        safeCard.innerHTML = `
          <div class="priority-card priority-card--safe">
            <div style="font-size:1.8rem; margin-bottom:var(--sp-2);">✅</div>
            <div style="font-weight:700; font-size:var(--fs-base); color:#00e0a3;">Stok Buffer Aman Terkendali</div>
            <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:4px;">Tidak ada request prioritas yang memerlukan pengiriman segera saat ini.</div>
          </div>
        `;
        alertSection.appendChild(safeCard);
      }

      page.appendChild(alertSection);

      // ── Map Visual Blok ──
      const mapSection = document.createElement('div');
      mapSection.className = 'section';
      mapSection.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
          <div style="width:4px; height:24px; background:var(--primary-color); border-radius:4px; box-shadow:0 0 10px rgba(99, 102, 241, 0.5);"></div>
          <h3 class="section-title" style="margin:0; font-size:1.3rem;">🗺️ Pemetaan Stok Aktual per Blok</h3>
        </div>
      `;
      
      const blockGrid = document.createElement('div');
      blockGrid.style.display = 'grid';
      // Meringankan lebar kolom dari 300px agar card block terasa leluasa
      blockGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
      blockGrid.style.gap = '2rem';

      tInfo.blocks.forEach(b => {
        // Skip block completely if there are no mapped rows inside it
        const hasMappedRow = b.rows.some(r => r.material && r.material.trim() !== '');
        if (!hasMappedRow) return;

        const bCard = document.createElement('div');
        bCard.style.background = 'rgba(20, 25, 35, 0.4)';
        bCard.style.border = '1px solid rgba(255, 255, 255, 0.05)';
        bCard.style.borderRadius = '16px';
        bCard.style.padding = '1.5rem';
        bCard.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        bCard.style.backdropFilter = 'blur(10px)';
        bCard.style.position = 'relative';

        // Glowing node at top right
        const glowNode = document.createElement('div');
        glowNode.style.position = 'absolute';
        glowNode.style.top = '-2px';
        glowNode.style.right = '1.5rem';
        glowNode.style.width = '30px';
        glowNode.style.height = '4px';
        glowNode.style.background = 'rgba(99, 102, 241, 0.6)';
        glowNode.style.borderRadius = '4px';
        glowNode.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.5)';
        bCard.appendChild(glowNode);

        let html = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="display:inline-flex; width:24px; height:24px; background:var(--primary-color); color:white; align-items:center; justify-content:center; border-radius:6px; font-weight:800; font-size:0.9rem;  box-shadow:0 2px 8px rgba(99, 102, 241, 0.4);">B</span>
              <h4 style="margin:0; font-size:1.2rem; font-weight:700; color:var(--text-main); letter-spacing:0.5px;">Blok ${b.blockNumber || b.id}</h4>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted); background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:100px; font-weight:600;">Area Aktif</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
        `;
        
        b.rows.forEach(r => {
          // Skip unmapped rows entirely to match Dashboard capacity logic
          if (!r.material || r.material.trim() === '') return;

          const fillPct = r.maxPallets > 0 ? (r.qty / r.maxPallets) * 100 : 0;
          const rowLabel = `B.${b.blockNumber || b.id}.${r.rowNumber || r.id}`;
          
          if (r.qty === 0) {
            // Gaya rak dipetakan tapi kosong
            const emptyColor = r.isFlexible ? 'rgba(124, 58, 237, 0.4)' : 'var(--text-muted)';
            const emptyLabel = r.isFlexible ? '📦 Slow Moving' : `${r.material} (Kosong)`;
            html += `
              <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.02); opacity:0.6;">
                <span style="width:40px; font-size:0.75rem; color:${emptyColor}; font-weight:600;">${rowLabel}</span>
                <span style="flex:1; font-size:0.85rem; color:${emptyColor}; font-style:italic;">${emptyLabel}</span>
                <span style="font-size:0.75rem; color:var(--text-muted); font-variant-numeric:tabular-nums;">0 / ${r.maxPallets}</span>
              </div>
            `;
          } else {
            // Gaya rak terisi: slim kapsul, background ambient merepresentasikan kepenuhan
            let statusColorCode = fillPct > 80 ? '16, 185, 129' : fillPct > 40 ? '245, 158, 11' : '99, 102, 241';
            let statusColorHex = fillPct > 80 ? 'var(--success-color)' : fillPct > 40 ? 'var(--warning-color)' : 'var(--primary-color)';
            
            // Override for Slow Moving
            if (r.isFlexible) {
               statusColorCode = '124, 58, 237';
               statusColorHex = '#7c3aed';
            }

            const activeMat = r.material === 'MIXED STOCK' ? '📦 MIXED STOCK' : r.material;
            
            html += `
              <div style="position:relative; display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:6px; background:rgba(255,255,255,0.02); overflow:hidden; border:1px solid rgba(${statusColorCode}, 0.1);">
                <!-- Ambient Ambient Fill (sebagai pengganti bar kaku) -->
                <div style="position:absolute; top:0; left:0; height:100%; width:${fillPct}%; background:linear-gradient(90deg, rgba(${statusColorCode},0.15) 0%, rgba(${statusColorCode},0) 100%); z-index:0; border-left:3px solid ${statusColorHex};"></div>
                
                <!-- Konten Teks Rak -->
                <div style="position:relative; z-index:1; width:40px; font-size:0.8rem; color:${statusColorHex}; font-weight:800; text-shadow:0 0 10px rgba(${statusColorCode}, 0.5);">${rowLabel}</div>
                <div style="position:relative; z-index:1; flex:1; font-size:0.95rem; font-weight:600; color:#e0e7ff; letter-spacing:0.5px; text-shadow:0 0 5px rgba(224, 231, 255, 0.3); opacity:0.9;">${activeMat}</div>
                <div style="position:relative; z-index:1; display:flex; align-items:baseline; gap:4px;">
                  <span style="font-size:1.15rem; font-weight:800; color:${statusColorHex}; text-shadow:0 0 8px rgba(${statusColorCode}, 0.6); font-variant-numeric: tabular-nums;">${r.qty}</span>
                  <span style="font-size:0.75rem; color:rgba(255,255,255,0.4);">/ ${r.maxPallets}</span>
                </div>
              </div>
            `;
          }
        });
        
        bCard.innerHTML = html + `</div>`;
        blockGrid.appendChild(bCard);
      });
      mapSection.appendChild(blockGrid);
      // Hide Pemetaan Stok Aktual per Blok on TV dashboard (iframe)
      const isIframe = window.self !== window.top;
      if (!isIframe) {
        page.appendChild(mapSection);
      }

      container.appendChild(page);
      TopbarComponent.render('/transit/info');

    } catch (err) {
      console.error('Live distribution render error:', err);
      container.innerHTML = `
        <div style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:12px; padding:2rem; text-align:center; color:white; max-width:600px; margin:40px auto;">
          <div style="font-size:3rem; margin-bottom:1rem;">⚠️</div>
          <h3 style="font-size:1.5rem; color:var(--danger-color); margin-bottom:1rem;">Gagal Memuat Navigasi Transit</h3>
          <p style="color:var(--text-muted); font-size:1rem; margin-bottom:2rem;">Koneksi sensor terputus. Silakan hubungi tim Admin atau coba refresh modul ini.</p>
          <div style="font-family:monospace; background:rgba(0,0,0,0.3); padding:1rem; border-radius:8px; color:rgba(255,255,255,0.5); font-size:0.85rem; text-align:left;">
            [Log] ${err.message}
          </div>
        </div>
      `;
    } finally {
      _isRendering = false;
    }
  }

  PMCStore.on('transitChanged', render);
  PMCStore.on('stockChanged', render);
  PMCStore.on('deliveryChanged', render);

  return { render };
})();


window.LiveDistributionPage = LiveDistributionPage;
export default LiveDistributionPage;
