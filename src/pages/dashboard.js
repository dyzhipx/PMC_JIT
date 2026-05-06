/* ===== Dashboard Page (Indigo/Purple Edition) ===== */
const DashboardPage = (() => {
  let refreshTimer = null;
  let dashboardSelectedDate = null;
  let dashboardSelectedShift = 'LIVE';

  async function render() {
    const hash = window.location.hash;
    if (!hash.startsWith('#/dashboard') && hash !== '' && hash !== '#/') return;
    const isDeliveryView = hash.includes('view=delivery');

    if (window._dashboardSocketListener) {
      PMCStore.off('data_sync_required', window._dashboardSocketListener);
    }
    
    // Subscribe to reactive socket events for this page
    window._dashboardSocketListener = () => { render(true); };
    PMCStore.on('data_sync_required', window._dashboardSocketListener);

    if (window._dashboardClockTimer) clearInterval(window._dashboardClockTimer);
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    
    container.innerHTML = `
      <div style="padding:var(--sp-6);">
        <div class="alert alert-info">Memuat data dashboard...</div>
      </div>
    `;

    try {
      const stats = await PMCStore.getStats();
      const daily = await PMCStore.getDailyProduction();
      const recent = await PMCStore.getRecentSchedules();
      
      // Ensure priority alerts are calculated using fresh transit stock info
      await PMCStore.loadTransitInfoFromAPI();

      container.innerHTML = '';
      const page = document.createElement('div');
      page.className = 'animate-fade';
      page.style.padding = 'var(--sp-6)';

      // ── Header ──
      const header = document.createElement('div');
      header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-6); gap: var(--sp-4); flex-wrap: wrap;';
      
      const headerTitles = document.createElement('div');
      headerTitles.innerHTML = `
          <h1 style="font-size:var(--fs-xl); font-weight:700; color:var(--text-primary); display:flex; align-items:center;">
            <span class="live-pulse"></span>Pusat Kendali JIT
          </h1>
          <p style="color:var(--text-secondary); font-size:var(--fs-sm);">Sistem pemantauan operasional PMC secara real-time.</p>
      `;
      header.appendChild(headerTitles);

      const headerControls = document.createElement('div');
      headerControls.style.cssText = 'display:flex; gap:var(--sp-3); align-items:center;';

      const dates = PMCStore.getUniqueDates();
      const logicalToday = PMCStore.getLogicalDateStr();
      if (!dashboardSelectedDate) dashboardSelectedDate = dates.includes(logicalToday) ? logicalToday : (dates[0] || logicalToday);

      const dateContainer = document.createElement('div');
      dateContainer.style.cssText = 'display:flex; flex-direction:column; gap:4px;';
      dateContainer.innerHTML = `<label style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">Lihat Data Tanggal:</label>`;
      
      const dateSel = document.createElement('select');
      dateSel.className = 'filter-select';
      dateSel.style.minWidth = '130px';
      dates.forEach(d => {
        dateSel.innerHTML += `<option value="${d}" ${d === dashboardSelectedDate ? 'selected' : ''}>${PMCStore.formatDate(d)}</option>`;
      });
      dateSel.addEventListener('change', (e) => {
        dashboardSelectedDate = e.target.value;
        if (dashboardSelectedDate !== logicalToday && dashboardSelectedShift === 'LIVE') {
            dashboardSelectedShift = 'SH1'; // Beralih ke manual mode jika tanggal history dipilih
        } else if (dashboardSelectedDate === logicalToday && dashboardSelectedShift !== 'LIVE') {
            dashboardSelectedShift = 'LIVE'; // Kembali ke live jika memilih hari ini
        }
        render();
      });
      dateContainer.appendChild(dateSel);

      const shiftContainer = document.createElement('div');
      shiftContainer.style.cssText = 'display:flex; flex-direction:column; gap:4px;';
      shiftContainer.innerHTML = `<label style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">Shift:</label>`;
      
      const shiftSel = document.createElement('select');
      shiftSel.className = 'filter-select';
      shiftSel.style.minWidth = '120px';
      shiftSel.innerHTML = `
        <option value="LIVE" ${dashboardSelectedShift === 'LIVE' ? 'selected' : ''}>Real-time</option>
        <option value="SH1" ${dashboardSelectedShift === 'SH1' ? 'selected' : ''}>Shift 1</option>
        <option value="SH2" ${dashboardSelectedShift === 'SH2' ? 'selected' : ''}>Shift 2</option>
        <option value="SH3" ${dashboardSelectedShift === 'SH3' ? 'selected' : ''}>Shift 3</option>
      `;
      shiftSel.addEventListener('change', (e) => {
        dashboardSelectedShift = e.target.value;
        render();
      });
      shiftContainer.appendChild(shiftSel);

      const scheduleBtn = document.createElement('button');
      scheduleBtn.className = 'btn btn-primary';
      scheduleBtn.textContent = 'Jadwal Produksi';
      scheduleBtn.onclick = () => location.hash='#/schedule';

      headerControls.appendChild(dateContainer);
      headerControls.appendChild(shiftContainer);
      headerControls.appendChild(scheduleBtn);
      header.appendChild(headerControls);
      
      if (!isDeliveryView) {
        page.appendChild(header);
      }

      // ── MENGHITUNG DATA JIT METRICS ──
      const alerts = await PMCStore.getPriorityAlerts(dashboardSelectedDate);
      const dangerCount = alerts.filter(a => a.status === 'danger').length;

      // New: Calculate active material variants for the day
      const hourlyData = await PMCStore.getMergedHourlyDistribution(dashboardSelectedDate);
      const variantCount = hourlyData ? hourlyData.length : 0;
      
      // Calculate target box specifically for the selected date and shift
      const selectedDailyStats = daily.find(d => d.date === dashboardSelectedDate);
      let targetBox = selectedDailyStats ? selectedDailyStats.total : 0;
      if (dashboardSelectedShift !== 'LIVE' && selectedDailyStats) {
          targetBox = selectedDailyStats[dashboardSelectedShift.toLowerCase()] || 0;
      }

      const tInfo = PMCStore.getTransitInfo() || { blocks: [] };
      let totalMaxPallets = 0;
      let totalUsedPallets = 0;
      
      (tInfo.blocks || []).forEach(b => {
         b.rows.forEach(r => {
             // Hanya hitung kapasitas jika blok tersebut sudah di-assign material (bukan blok nganggur/unmapped)
             if (r.material && r.material.trim() !== '') {
                 totalMaxPallets += (r.maxPallets || 0);
                 totalUsedPallets += (r.qty || 0);
             }
         });
      });
      // Safety calculation for empty layout
      const transitPtg = totalMaxPallets > 0 ? Math.round((totalUsedPallets/totalMaxPallets)*100) : 0;
      const transitStatus = transitPtg > 85 ? 'danger' : (transitPtg > 70 ? 'warning' : 'success');

      // ── Fetch Anomaly Data ──
      let anomalyCount = 0;
      if (dashboardSelectedShift === 'LIVE' && (!dashboardSelectedDate || dashboardSelectedDate === logicalToday)) {
        try {
          const res = await fetch(`${PMCStore.API_BASE}/anomaly/unscanned-transit?hours=3`);
          const json = await res.json();
          if (json.success && json.data) {
            anomalyCount = json.data.filter(a => a.status === 'Lupa Scan').length;
          }
        } catch (err) { console.warn('Failed to load anomaly data', err); }
      }

      if (anomalyCount > 0 && !isDeliveryView) {
        const anomalyAlert = document.createElement('div');
        anomalyAlert.style.cssText = 'background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-color); padding: var(--sp-3) var(--sp-4); border-radius: var(--radius-md); margin-bottom: var(--sp-5); display: flex; justify-content: space-between; align-items: center; cursor: pointer; animation: pulse-red 2s infinite;';
        anomalyAlert.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.5rem;">⚠️</span>
            <div>
              <div style="color:var(--danger-color); font-weight:700; font-size:1.1rem;">${anomalyCount} Potensi Lupa Scan Transit</div>
              <div style="color:var(--text-secondary); font-size:0.85rem;">Terdeteksi material tertahan di Transit padahal mesin Line sedang produksi.</div>
            </div>
          </div>
          <button class="btn btn-primary" style="background:var(--danger-color); border:none; padding:8px 16px;">Lihat Detail</button>
        `;
        anomalyAlert.onclick = () => { window.location.hash = '#/transit/anomaly'; };
        
        if (!document.getElementById('pulse-red-style')) {
           const style = document.createElement('style');
           style.id = 'pulse-red-style';
           style.innerHTML = `@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }`;
           document.head.appendChild(style);
        }
        page.appendChild(anomalyAlert);
      }

      // ── Stat Cards (JIT Operational Edition) ──
      const statsGrid = document.createElement('div');
      statsGrid.className = 'grid-4 section';
      
      let targetLabel = 'Target Produksi (Harian)';
      if (dashboardSelectedShift !== 'LIVE') {
          targetLabel = `Target Produksi (${dashboardSelectedShift})`;
      }

      statsGrid.appendChild(StatCardComponent.create({ 
        icon: '🎯', 
        label: targetLabel, 
        value: targetBox, 
        colorType: 'accent' 
      }));
      statsGrid.appendChild(StatCardComponent.create({ 
        icon: '📦', 
        label: 'Varian Material Aktif', 
        value: `${variantCount} Jenis`, 
        colorType: 'info' 
      }));
      statsGrid.appendChild(StatCardComponent.create({ 
        icon: dangerCount > 0 ? '🚨' : '✅', 
        label: 'Radar Defisit Line', 
        value: dangerCount > 0 ? `${dangerCount} Kritis` : 'Aman', 
        colorType: dangerCount > 0 ? 'danger' : 'success' 
      }));
      statsGrid.appendChild(StatCardComponent.create({ 
        icon: '🏢', 
        label: 'Kapasitas Transit', 
        value: `\u200b${transitPtg}%`, 
        colorType: transitStatus 
      }));
      
      // Restoring glass-card wrapping for stats
      const statsCards = statsGrid.querySelectorAll('.stat-card');
      statsCards.forEach(card => card.classList.add('glass-card'));
      
      if (!isDeliveryView) {
        page.appendChild(statsGrid);
      }

      // ── Charts Row ──
      const chartsRow = document.createElement('div');
      chartsRow.className = 'dashboard-charts section';
      
      const trendChart = ChartWrapper.create('trendChart', {
        title: 'Tren Produksi Harian',
        chartConfig: {
          type: 'line',
          data: {
            labels: daily.map(d => PMCStore.formatDate(d.date)),
            datasets: [{
              label: 'Total Box',
              data: daily.map(d => d.total),
              borderColor: '#6c5ce7',
              backgroundColor: 'rgba(108, 92, 231, 0.1)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            color: '#f8fafc',
            scales: {
              x: { ticks: { color: '#f8fafc' }, grid: { color: 'rgba(255,255,255,0.1)' } },
              y: { ticks: { color: '#f8fafc' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            },
            plugins: {
              legend: { labels: { color: '#f8fafc' } }
            }
          }
        }
      });
      chartsRow.appendChild(trendChart);

      // Filter production specifically for the selected date
      const selectedDay = daily.find(d => d.date === dashboardSelectedDate) || { sh1: 0, sh2: 0, sh3: 0, total: 0 };
      const totalSH1 = selectedDay.sh1 || 0;
      const totalSH2 = selectedDay.sh2 || 0;
      const totalSH3 = selectedDay.sh3 || 0;
      const totalDaily = selectedDay.total || (totalSH1 + totalSH2 + totalSH3);

      const shiftChart = ChartWrapper.create('shiftChart', {
        title: 'Produksi per Shift',
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['Shift 1', 'Shift 2', 'Shift 3'],
            datasets: [{
              label: 'Produksi Box',
              data: [totalSH1, totalSH2, totalSH3],
              backgroundColor: ['#6c5ce7', '#00b894', '#0984e3'],
              borderRadius: 6
            }]
          },
          options: {
            color: '#f8fafc',
            layout: {
              padding: { top: 30 } // Give space for labels on top
            },
            scales: {
              x: { ticks: { color: '#f8fafc' }, grid: { color: 'rgba(255,255,255,0.1)' } },
              y: { 
                beginAtZero: true,
                ticks: { color: '#f8fafc' }, 
                grid: { color: 'rgba(255,255,255,0.1)' } 
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const val = context.raw;
                    const pct = totalDaily > 0 ? ((val / totalDaily) * 100).toFixed(1) + '%' : '0%';
                    return ` ${val} Box (${pct})`;
                  }
                }
              }
            }
          },
          plugins: [{
            id: 'topLabels',
            afterDatasetsDraw(chart) {
              const { ctx, data } = chart;
              ctx.save();
              ctx.fillStyle = '#f8fafc';
              ctx.font = 'bold 12px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              
              chart.getDatasetMeta(0).data.forEach((bar, index) => {
                const val = data.datasets[0].data[index];
                if (val > 0) {
                  const pct = totalDaily > 0 ? ((val / totalDaily) * 100).toFixed(1) + '%' : '0%';
                  ctx.fillText(pct, bar.x, bar.y - 8);
                }
              });
              ctx.restore();
            }
          }]
        }
      });
      chartsRow.appendChild(shiftChart);
      if (!isDeliveryView) {
        page.appendChild(chartsRow);
      }

      // ── Delivery Widget ──
      // Ensure fresh delivery data is loaded before rendering progress
      await PMCStore.loadActiveDeliveriesFromAPI();
      const deliverySection = document.createElement('div');
      deliverySection.className = 'section';
      await renderDeliveryWidget(deliverySection);
      
      const isIframe = window.self !== window.top;
      
      // Tampilkan delivery section jika di mode deliveryView ATAU bukan iframe
      if (isDeliveryView || !isIframe) {
        page.appendChild(deliverySection);
      }

      // ── Shift Deliveries Rings ──
      const ringsSection = document.createElement('div');
      ringsSection.className = 'glass-card section';
      ringsSection.style.padding = 'var(--sp-5)';
      
      const ringsHeader = document.createElement('h3');
      ringsHeader.style.cssText = 'margin-bottom:var(--sp-6); font-size:var(--fs-md); font-weight:700; color:var(--text-primary); text-align:center;';
      ringsHeader.innerHTML = 'Persentase Pengiriman Harian per Shift';
      ringsSection.appendChild(ringsHeader);

      const ringsWrapper = document.createElement('div');
      ringsWrapper.style.cssText = 'display:flex; justify-content:space-around; align-items:center; flex-wrap:wrap; gap:var(--sp-5);';
      
      const shifts = [
        { key: 'SH1', label: 'Shift 1', color: '#6c5ce7', glow: 'rgba(108, 92, 231, 0.7)' }, // Purple
        { key: 'SH2', label: 'Shift 2', color: '#00e0a3', glow: 'rgba(0, 224, 163, 0.7)' }, // Emerald
        { key: 'SH3', label: 'Shift 3', color: '#00d2ff', glow: 'rgba(0, 210, 255, 0.7)' }  // Cyan
      ];

      // We use a for-of loop so we can await calculateShiftProgress
      for (const sh of shifts) {
        const pct = await PMCStore.calculateShiftProgress(sh.key, dashboardSelectedDate);
        // Using conic-gradient to draw the dynamic percentage ring
        const conic = `conic-gradient(${sh.color} ${pct}%, transparent 0)`;
        
        ringsWrapper.innerHTML += `
          <div class="radial-ring-container">
            <div class="radial-ring" style="background:${conic}; --ring-glow:${sh.glow};">
              <span class="radial-ring-value">${pct}%</span>
            </div>
            <span class="radial-ring-label" style="color:${sh.color}; text-shadow:0 0 5px ${sh.glow};">${sh.label}</span>
          </div>
        `;
      }
      
      ringsSection.appendChild(ringsWrapper);
      if (!isIframe) {
        page.appendChild(ringsSection);
      }

      // ── Priority Request Gudang ──
      const prioritySection = document.createElement('div');
      prioritySection.className = 'glass-card section';
      prioritySection.style.padding = 'var(--sp-5)';
      prioritySection.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-5);">
          <div>
            <h3 style="font-size:var(--fs-md); font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">🚨</span> Status Prioritas Request ke Gudang
            </h3>
            <p style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:2px;">Monitor stok aktual vs buffer pengiriman per jam</p>
          </div>
        </div>
        <div id="priority-grid-container" class="priority-grid">
          <div class="priority-card priority-card--safe">
            <div style="font-size:1.8rem; margin-bottom:var(--sp-2);">✅</div>
            <div style="font-weight:700; font-size:var(--fs-base); color:#00e0a3;">Semua Level Material Aman</div>
            <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:4px;">Stok transit mencukupi kebutuhan buffer pengiriman</div>
          </div>
        </div>
      `;
      if (!isIframe) {
        page.appendChild(prioritySection);
      }

      // Async: try to load real priority data in the background
      (async () => {
        try {
          const dateStr = getLogicalDateStr();
          const alerts = await PMCStore.getPriorityAlerts(dateStr);
          const gridEl = document.getElementById('priority-grid-container');
          if (!gridEl || alerts.length === 0) return; // keep safe card

          gridEl.innerHTML = '';
          alerts.forEach(p => {
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
            gridEl.appendChild(card);
          });
        } catch (e) {
          console.warn('Priority alerts:', e.message);
        }
      })();

      // ── Recent Schedules (Solid Table) ──
      const recentSection = document.createElement('div');
      recentSection.className = 'glass-card section';
      recentSection.style.padding = 'var(--sp-5)';
      recentSection.innerHTML = `<h3 style="margin-bottom:var(--sp-4); font-size:var(--fs-md); font-weight:700;">Jadwal Produksi Terbaru</h3>`;
      recentSection.appendChild(DataTableComponent.create({
        columns: [
          { key: 'date', label: 'Tanggal', render: v => PMCStore.formatDate(v) },
          { key: 'skuCount', label: 'Total SKU', align: 'center' },
          { key: 'total', label: 'Total Qty', align: 'right', render: v => PMCStore.formatNumber(v) },
          { key: 'status', label: 'Status', align: 'center', render: v => v === 'converted' ? '<span class="badge badge-success">Selesai</span>' : '<span class="badge badge-warning">Draft</span>' }
        ],
        data: recent
      }));
      if (!isDeliveryView) {
        page.appendChild(recentSection);
      }

      container.appendChild(page);

      // No more interval polling here.
      // Socket.io 'data_sync_required' automatically handles updates via top listener.
    } catch (err) {
      console.error('Dashboard error:', err);
      container.innerHTML = `<div class="alert alert-danger" style="margin:20px;">Gagal memuat data: ${err.message}</div>`;
    }
    TopbarComponent.render('/dashboard');
  }

  function getLogicalDateStr() {
    if (dashboardSelectedDate) return dashboardSelectedDate;
    return PMCStore.getLogicalDateStr();
  }

  async function renderDeliveryWidget(container) {
    const { shiftKey, shiftLabel, currentSlot, nextSlot, now, slots } = getCurrentShiftAndSlot();
    const dateStr = getLogicalDateStr();
    // ✅ Hitung progress KHUSUS slot yang berjalan saat ini (berdasarkan target PCS & realisasi PCS)
    let progressPct = 0;
    if (currentSlot) {
      progressPct = await calculateSlotProgress(shiftKey, currentSlot.id);
    } else {
      progressPct = await PMCStore.calculateShiftProgress(shiftKey);
    }

    // Juga ambil info detail delivery slot aktif untuk ditampilkan di timeline
    const deliveryId = `${dateStr}_${shiftKey}_${currentSlot ? currentSlot.id : 1}`;
    const activeDelivery = PMCStore.activeDeliveries.find(d => d.compositeKey === deliveryId);

    // Format waktu live / manual
    const pad = n => String(n).padStart(2, '0');
    const liveTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    // Check if we are in live mode
    const logicalToday = PMCStore.getLogicalDateStr();
    const isLiveMode = dashboardSelectedShift === 'LIVE' && (!dashboardSelectedDate || dashboardSelectedDate === logicalToday);
    
    let liveDateHTML = isLiveMode ? 
      `<div id="dashboard-live-clock" style="font-family:'JetBrains Mono', 'Fira Code', monospace; font-size:1.6rem; font-weight:800; color:#00d2ff; text-shadow:0 0 15px rgba(0,210,255,0.5), 0 0 30px rgba(0,210,255,0.2); letter-spacing:2px;">${liveTime}</div>
       <div style="font-size:0.65rem; color:var(--text-secondary); margin-top:2px;" class="live-pulse">🔴 WAKTU SERVER LIVE</div>` :
      `<div style="font-family:'JetBrains Mono', 'Fira Code', monospace; font-size:1.6rem; font-weight:800; color:var(--text-secondary); text-shadow:0 0 15px rgba(255,255,255,0.1); letter-spacing:2px;">REKAPITULASI</div>
       <div style="font-size:0.65rem; color:var(--text-secondary); margin-top:2px;">MODE RIWAYAT HISTORIS</div>`;
    
    let displayDateStr = dateStr;
    try {
        const parts = dateStr.split('-');
        displayDateStr = `${parts[2]} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][parseInt(parts[1])-1]} ${parts[0]}`;
    } catch(e) {}

    // Generate timeline slots HTML
    const mins = now.getHours() * 60 + now.getMinutes();
    let slotsHtml = '';
    slots.forEach(s => {
      let status = 'upcoming';
      let icon = '⏳';
      if (currentSlot && s.id === currentSlot.id) {
        status = 'active';
        icon = '🔴';
      } else if (currentSlot && s.id < currentSlot.id) {
        status = 'completed';
        icon = '✅';
      }
      
      const bgMap = {
        active: 'linear-gradient(135deg, rgba(108,92,231,0.3), rgba(0,210,255,0.15))',
        completed: 'rgba(0,224,163,0.1)',
        upcoming: 'rgba(255,255,255,0.03)'
      };
      const borderMap = {
        active: '1.5px solid var(--accent)',
        completed: '1px solid rgba(0,224,163,0.3)',
        upcoming: '1px solid rgba(255,255,255,0.08)'
      };
      const glowMap = {
        active: '0 0 12px rgba(108,92,231,0.4)',
        completed: 'none',
        upcoming: 'none'
      };

      slotsHtml += `
        <div style="
          flex:1; min-width:120px; padding:10px 12px; border-radius:10px;
          background:${bgMap[status]}; border:${borderMap[status]};
          box-shadow:${glowMap[status]}; text-align:center;
          transition: all 0.3s ease;
          ${status === 'active' ? 'transform:scale(1.03);' : ''}
        ">
          <div style="font-size:0.75rem; margin-bottom:4px;">${icon} Group ${s.id}</div>
          <div style="font-weight:700; font-size:0.85rem; color:${status === 'active' ? 'var(--accent)' : status === 'completed' ? '#00e0a3' : 'var(--text-secondary)'};">${s.label}</div>
          <div style="font-size:0.65rem; margin-top:4px; color:var(--text-secondary);">${status === 'active' ? 'SEDANG BERJALAN' : status === 'completed' ? 'Selesai' : 'Menunggu'}</div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="delivery-track">
        <div class="track-endpoint track-left" title="Gudang Transit">
          <svg width="44" height="40" viewBox="0 0 44 40">
            <rect x="4" y="14" width="36" height="22" rx="2" fill="#0b1628" stroke="#00d2ff" stroke-width="1.2"/>
            <polygon points="22,2 2,14 42,14" fill="#0d1f35" stroke="#00d2ff" stroke-width="1.2"/>
            <rect x="14" y="22" width="16" height="14" rx="1" fill="#0a1929" stroke="#00d2ff" stroke-width="0.8"/>
            <line x1="14" y1="26" x2="30" y2="26" stroke="#00d2ff" opacity="0.3" stroke-width="0.6"/>
            <line x1="14" y1="30" x2="30" y2="30" stroke="#00d2ff" opacity="0.3" stroke-width="0.6"/>
            <line x1="14" y1="34" x2="30" y2="34" stroke="#00d2ff" opacity="0.3" stroke-width="0.6"/>
            <rect x="6" y="18" width="5" height="4" rx="1" fill="#00d2ff" opacity="0.2"/>
            <rect x="33" y="18" width="5" height="4" rx="1" fill="#00d2ff" opacity="0.2"/>
            <rect x="18" y="24" width="8" height="2" rx="0.5" fill="#00d2ff" opacity="0.15"/>
          </svg>
          <span class="track-label">Gudang</span>
        </div>
        <div class="track-road">
          <div class="aurora-trail"></div>
          <div class="animated-truck-wrapper">
            <svg class="truck-svg" width="48" height="32" viewBox="0 0 48 32">
              <rect x="0" y="4" width="28" height="18" rx="3" fill="#1e3a5f" stroke="#00d2ff" stroke-width="1.2"/>
              <rect x="2" y="6" width="24" height="14" rx="2" fill="#0d2137" opacity="0.8"/>
              <line x1="9" y1="6" x2="9" y2="20" stroke="#00d2ff" opacity="0.15" stroke-width="0.8"/>
              <line x1="18" y1="6" x2="18" y2="20" stroke="#00d2ff" opacity="0.15" stroke-width="0.8"/>
              <rect x="28" y="8" width="16" height="14" rx="3" fill="#2a4a6b" stroke="#00d2ff" stroke-width="1.2"/>
              <rect x="34" y="10" width="8" height="6" rx="2" fill="#0a1929" stroke="#38bdf8" stroke-width="0.8"/>
              <circle cx="45" cy="18" r="2" fill="#fbbf24"/>
              <circle cx="45" cy="18" r="4" fill="#fbbf24" opacity="0.15"/>
              <circle cx="8" cy="24" r="5" fill="#1a1a2e" stroke="#64748b" stroke-width="1.5"/>
              <circle cx="8" cy="24" r="2" fill="#334155"/>
              <circle cx="36" cy="24" r="5" fill="#1a1a2e" stroke="#64748b" stroke-width="1.5"/>
              <circle cx="36" cy="24" r="2" fill="#334155"/>
              <rect x="0" y="20" width="3" height="3" rx="1" fill="#475569"/>
            </svg>
            <div class="exhaust-container">
              <div class="exhaust-puff"></div>
              <div class="exhaust-puff"></div>
              <div class="exhaust-puff"></div>
              <div class="exhaust-puff"></div>
            </div>
          </div>
        </div>
        <div class="track-endpoint track-right" title="Line Produksi">
          <svg width="44" height="40" viewBox="0 0 44 40">
            <rect x="4" y="12" width="36" height="24" rx="2" fill="#0b1628" stroke="#00e0a3" stroke-width="1.2"/>
            <polygon points="4,12 12,4 12,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <polygon points="12,12 20,4 20,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <polygon points="20,12 28,4 28,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <polygon points="28,12 36,4 36,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <rect x="36" y="2" width="5" height="10" rx="1" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <circle cx="15" cy="24" r="5" fill="none" stroke="#00e0a3" stroke-width="1" opacity="0.6"/>
            <circle cx="15" cy="24" r="2" fill="#00e0a3" opacity="0.3"/>
            <line x1="15" y1="19" x2="15" y2="21" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <line x1="15" y1="27" x2="15" y2="29" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <line x1="10" y1="24" x2="12" y2="24" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <line x1="18" y1="24" x2="20" y2="24" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <rect x="24" y="28" width="14" height="3" rx="1" fill="#00e0a3" opacity="0.15"/>
            <circle cx="26" cy="31" r="2" fill="#0b1628" stroke="#00e0a3" stroke-width="0.8" opacity="0.4"/>
            <circle cx="36" cy="31" r="2" fill="#0b1628" stroke="#00e0a3" stroke-width="0.8" opacity="0.4"/>
            <rect x="27" y="20" width="6" height="8" rx="1" fill="#0a1929" stroke="#00e0a3" stroke-width="0.8"/>
          </svg>
          <span class="track-label" style="color:#00e0a3;">Produksi</span>
        </div>
      </div>
      <div class="glass-card" style="border-left:4px solid var(--accent); padding:var(--sp-5);">
        <!-- Live Clock & Date Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4); padding-bottom:var(--sp-3); border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>
            <div style="display:flex; align-items:center; gap:var(--sp-3); margin-bottom:4px;">
              <h3 style="color:var(--accent); font-size:var(--fs-base); font-weight:700; display:flex; align-items:center; margin: 0;">
                <span class="live-pulse" style="width:6px; height:6px; background-color:var(--accent);"></span> Aktual Pengiriman ${shiftLabel}
              </h3>
              <a href="#/distribution/hourly" style="background:rgba(108, 92, 231, 0.1); color:var(--accent); border:1px solid rgba(108, 92, 231, 0.3); padding: 3px 8px; font-size: 0.7rem; border-radius: 4px; text-decoration:none; transition:all 0.2s;">Detail ↗</a>
            </div>
            <div style="font-size:var(--fs-xs); color:var(--text-secondary);" id="dashboard-live-date">${displayDateStr}</div>
          </div>
          <div style="text-align:right;">
            ${liveDateHTML}
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-3);">
          <span style="font-size:var(--fs-sm); color:var(--text-secondary);">Progress Pengiriman</span>
          <span style="font-weight:700; font-size:var(--fs-lg); text-shadow: 0 0 10px var(--accent-glow);">${progressPct}%</span>
        </div>
        <div style="height:10px; background:var(--bg-surface-2); border-radius:5px; overflow:hidden; margin-bottom:var(--sp-5);">
          <div style="height:100%; width:${progressPct}%; background:var(--accent); transition: width 0.5s ease;"></div>
        </div>

        <!-- Slot Timeline -->
        <div style="margin-bottom:var(--sp-3);">
          <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-bottom:var(--sp-3); font-weight:600; text-transform:uppercase; letter-spacing:1px;">📋 Timeline Pengiriman ${shiftLabel}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${slotsHtml}
          </div>
        </div>

        <!-- Current & Next Info -->
        <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm); color:var(--text-secondary); padding-top:var(--sp-3); border-top:1px solid rgba(255,255,255,0.06);">
          <span>🟢 Aktif: ${currentSlot ? `Group ${currentSlot.id} (${currentSlot.label})` : 'N/A'}</span>
          <span>⏭️ Selanjutnya: ${nextSlot ? `Group ${nextSlot.id} (${nextSlot.label})` : 'Shift Selesai'}</span>
        </div>
      </div>
    `;

    // Live clock updater (setiap detik - HANYA JIKA MODE LIVE)
    if (window._dashboardClockTimer) clearInterval(window._dashboardClockTimer);
    if (isLiveMode) {
      window._dashboardClockTimer = setInterval(() => {
        const clockEl = document.getElementById('dashboard-live-clock');
        const dateEl = document.getElementById('dashboard-live-date');
        if (!clockEl) { clearInterval(window._dashboardClockTimer); return; }
        const n = new Date();
        const p = v => String(v).padStart(2, '0');
        clockEl.innerHTML = `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())} WAKTU SERVER LIVE`;
        const dNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const mNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        if (dateEl) dateEl.textContent = `${dNames[n.getDay()]}, ${n.getDate()} ${mNames[n.getMonth()]} ${n.getFullYear()}`;
      }, 1000);
    }
  }

  // ── Definisi slot per shift (dari ShiftConfig — auto Saturday/weekday) ──
  // Usage: const SHIFT_SLOTS = ShiftConfig.getSlots(dateStr);

  function getCurrentShiftAndSlot() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();

    const logicalToday = PMCStore.getLogicalDateStr();
    const isLiveMode = dashboardSelectedShift === 'LIVE' && (!dashboardSelectedDate || dashboardSelectedDate === logicalToday);

    const dateStr = getLogicalDateStr();

    // Deteksi shift aktif
    const SHIFT_SLOTS = ShiftConfig.getSlots(dateStr);
    let shiftKey = 'SH3'; let shiftLabel = 'Shift 3';
    
    if (isLiveMode) {
      shiftKey = ShiftConfig.detectCurrentShift(dateStr, mins);
      shiftLabel = shiftKey === 'SH1' ? 'Shift 1' : shiftKey === 'SH2' ? 'Shift 2' : 'Shift 3';
    } else {
      shiftKey = (dashboardSelectedShift !== 'LIVE') ? dashboardSelectedShift : 'SH1';
      shiftLabel = shiftKey === 'SH1' ? 'Shift 1' : shiftKey === 'SH2' ? 'Shift 2' : 'Shift 3';
    }

    const slots = SHIFT_SLOTS[shiftKey];
    let currentSlot = null;
    let nextSlot = null;

    if (isLiveMode) {
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        let isActive = false;
        if (shiftKey === 'SH3' && s.id === 1) {
          // Slot lintas tengah malam (23:30 - 00:30)
          isActive = mins >= s.startMins || mins < s.endMins;
        } else {
          isActive = mins >= s.startMins && mins < s.endMins;
        }
        if (isActive) {
          currentSlot = s;
          nextSlot = slots[i + 1] || null;
          break;
        }
      }
    } else {
       // Mode Riwayat: Tidak ada slot aktif yang berkedip "SEDANG BERJALAN". Semua Selesai/Menunggu.
       // Progress keseluruhan shift akan terhitung.
       currentSlot = null; 
    }

    // Jika tidak ada slot yang aktif (dan sedang live mode), cari slot berikutnya yang akan datang
    if (!currentSlot && isLiveMode) {
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        const startCheck = (shiftKey === 'SH3' && s.startMins < 420) ? s.startMins : s.startMins;
        if (mins < startCheck || (shiftKey === 'SH3' && s.id === 1 && mins < s.startMins)) {
          currentSlot = slots[Math.max(0, i - 1)];
          nextSlot = s;
          break;
        }
      }
      // Fallback: ambil slot terakhir jika semua sudah lewat
      if (!currentSlot) {
        currentSlot = slots[slots.length - 1];
        nextSlot = null;
      }
    }

    return { shiftKey, shiftLabel, currentSlot, nextSlot, now, slots };
  }

  async function calculateSlotProgress(shiftKey, slotId) {
    const dateStr = getLogicalDateStr();

    // 1. Total SPB Target (Pcs) spesifik untuk slot ini (Grup aktif)
    const hourlyData = await PMCStore.getHourlyDistribution(dateStr);
    let totalSPBPcs = 0;
    
    if (hourlyData && hourlyData.length > 0) {
      hourlyData.forEach(mat => {
        if (mat.slots && mat.slots[shiftKey] && mat.slots[shiftKey][slotId - 1]) {
           totalSPBPcs += (mat.slots[shiftKey][slotId - 1].pallets || 0); // Di struktur data ini, atribut 'pallets' menyimpan total PCS
        }
      });
    }

    let totalScannedPcs = 0;
    
    // Cari data pengiriman (delivery) yang sesuai dengan slot saat ini
    const deliveryId = `${dateStr}_${shiftKey}_${slotId}`;
    const slotDelivery = PMCStore.activeDeliveries.find(d => d.id === deliveryId || d.compositeKey === deliveryId);

    if (slotDelivery && slotDelivery.items) {
      slotDelivery.items.forEach(deliveryItem => {
         const matName = deliveryItem.materialName || deliveryItem.material;
         let scannedPalletsCnt = 0;
         if (deliveryItem.scans) {
           deliveryItem.scans.forEach(s => {
             scannedPalletsCnt += (s.qtyPallet || 1);
           });
         }
         
         if (scannedPalletsCnt > 0 && hourlyData) {
           const matData = hourlyData.find(m => m.name === matName);
           if (matData && matData.slots && matData.slots[shiftKey] && matData.slots[shiftKey][slotId - 1]) {
             const slotDetails = matData.slots[shiftKey][slotId - 1].details || [];
             let pcs = 0;
             for (let j = 0; j < Math.min(scannedPalletsCnt, slotDetails.length); j++) {
               pcs += (slotDetails[j].qty || 0);
             }
             if (scannedPalletsCnt > slotDetails.length && slotDetails.length > 0) {
               const avgPcs = (matData.slots[shiftKey][slotId - 1].pallets || 0) / slotDetails.length;
               pcs += (scannedPalletsCnt - slotDetails.length) * avgPcs;
             }
             totalScannedPcs += pcs;
           }
         }
      });
    }
    
    console.log(`[Dashboard] calculateSlotProgress(${shiftKey}, Slot ${slotId}):`, {
      deliveryId,
      foundDelivery: !!slotDelivery,
      deliveryStatus: slotDelivery?.status,
      itemCount: slotDelivery?.items?.length,
      items: slotDelivery?.items?.map(i => ({ mat: i.material || i.materialName, scansCount: i.scans?.length, scanned: i.scanned })),
      totalSPBPcs,
      totalScannedPcs: Math.round(totalScannedPcs),
      hourlyMaterials: hourlyData?.map(m => m.name),
    });
    return totalSPBPcs > 0 ? Math.round((totalScannedPcs / totalSPBPcs) * 100) : 0;
  }

  return { render };
})();

window.DashboardPage = DashboardPage;
export default DashboardPage;
