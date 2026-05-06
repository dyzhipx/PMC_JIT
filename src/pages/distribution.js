/* ===== Distribusi Bahan per Shift Page ===== */
const DistributionPage = (() => {
  let selectedDate = '';

  async function render() {
    if (!window.location.hash.startsWith('#/distribution')) return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';
    
    const isTVView = window.location.hash.includes('view=tv');
    const dates = PMCStore.getUniqueDates();
    if (!selectedDate && dates.length > 0) {
      // Default to today's date if available, otherwise first date
      const today = new Date().toISOString().split('T')[0];
      selectedDate = dates.includes(today) ? today : dates[0];
    }

    // Topbar
    const exportWrapper = document.createElement('div');
    exportWrapper.style.display = 'flex';
    exportWrapper.style.gap = '8px';
    exportWrapper.style.alignItems = 'center';

    const exportSelect = document.createElement('select');
    exportSelect.className = 'form-input';
    exportSelect.style.padding = '4px 8px';
    exportSelect.style.height = '36px';
    exportSelect.innerHTML = `<option value="spb">1. Total SPB</option><option value="all">2. Semua List Kebutuhan</option>`;

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.innerHTML = '⬇ Export Excel';
    exportBtn.style.height = '36px';
    exportBtn.addEventListener('click', () => exportToExcel(exportSelect.value));

    exportWrapper.appendChild(exportSelect);
    exportWrapper.appendChild(exportBtn);

    TopbarComponent.render('/distribution', [exportWrapper]);

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Step indicator ──
    const stepBadge = document.createElement('div');
    stepBadge.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:20px;';
    stepBadge.innerHTML = `
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">SPB Harian</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Pembagian pengiriman material per shift berdasarkan Total SPB dan Sisa Stok</span>
    `;
    if (!isTVView) {
      page.appendChild(stepBadge);
    }

    // ── Header with date ──
    const headerBar = document.createElement('div');
    headerBar.className = 'material-view-header';

    const leftControls = document.createElement('div');
    leftControls.className = 'toolbar';
    leftControls.style.marginBottom = '0';

    const dateLabel = document.createElement('span');
    dateLabel.style.cssText = 'color:var(--text-secondary);font-size:var(--fs-sm);';
    dateLabel.textContent = 'Tanggal:';
    leftControls.appendChild(dateLabel);

    const dateSelect = document.createElement('select');
    dateSelect.className = 'filter-select';
    dates.forEach(d => {
      dateSelect.innerHTML += `<option value="${d}" ${d === selectedDate ? 'selected' : ''}>${PMCStore.formatDate(d)}</option>`;
    });
    dateSelect.addEventListener('change', e => { selectedDate = e.target.value; render(); });
    leftControls.appendChild(dateSelect);
    headerBar.appendChild(leftControls);
    if (!isTVView) {
      page.appendChild(headerBar);
    }

    if (!selectedDate) {
      page.innerHTML += '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal.</div></div>';
      container.appendChild(page);
      return;
    }

    // Get data from store
    const reqData = await PMCStore.getMaterialRequirements(selectedDate);
    const hourlyData = await PMCStore.getHourlyDistribution(selectedDate);
    const grouped = reqData?.grouped || [];
    const distData = mergeDistributionData(grouped, hourlyData);
    
    if (isTVView) {
      const ringsSection = document.createElement('div');
      ringsSection.className = 'glass-card section';
      ringsSection.style.padding = 'var(--sp-5)';
      ringsSection.style.marginBottom = 'var(--sp-6)';
      
      const ringsHeader = document.createElement('h3');
      ringsHeader.style.cssText = 'margin-bottom:var(--sp-6); font-size:var(--fs-md); font-weight:700; color:var(--text-primary); text-align:center;';
      ringsHeader.innerHTML = 'Persentase Pengiriman Harian per Shift';
      ringsSection.appendChild(ringsHeader);

      const ringsWrapper = document.createElement('div');
      ringsWrapper.style.cssText = 'display:flex; justify-content:space-around; align-items:center; flex-wrap:wrap; gap:var(--sp-5);';
      
      const shifts = [
        { key: 'SH1', label: 'Shift 1', color: '#6c5ce7', glow: 'rgba(108, 92, 231, 0.7)' },
        { key: 'SH2', label: 'Shift 2', color: '#00e0a3', glow: 'rgba(0, 224, 163, 0.7)' },
        { key: 'SH3', label: 'Shift 3', color: '#00d2ff', glow: 'rgba(0, 210, 255, 0.7)' }
      ];

      for (const sh of shifts) {
        const pct = await PMCStore.calculateShiftProgress(sh.key, selectedDate);
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
      page.appendChild(ringsSection);
    }

    // ── Distribution Table ──
    const section = document.createElement('div');
    section.className = 'section';
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = `<h3 class="section-title">🚚 SPB HARIAN (Distribusi per Shift)</h3>`;
    section.appendChild(sectionHeader);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    const table = document.createElement('table');
    table.className = 'data-table';

    table.innerHTML = `
      <thead>
        <tr>
          <th>Material</th>
          <th style="text-align:center">UOM</th>
          <th style="text-align:right">Total SPB</th>
          <th style="text-align:right">Sisa Stok</th>
          <th style="text-align:right;color:var(--primary-color)">Kirim SH1</th>
          <th style="text-align:right;color:var(--primary-color)">Kirim SH2</th>
          <th style="text-align:right;color:var(--primary-color)">Kirim SH3</th>
          <th style="text-align:right">Total Kirim</th>
          <th style="text-align:center">% SH1</th>
          <th style="text-align:center">% SH2</th>
          <th style="text-align:center">% SH3</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');

    distData.forEach(row => {
      if (row.totalSPB <= 0) return; // Only show materials that need to be distributed

      const pctSH1 = row.totalSPB > 0 ? ((row.kirimSH1 / row.totalSPB) * 100).toFixed(1) : '0.0';
      const pctSH2 = row.totalSPB > 0 ? ((row.kirimSH2 / row.totalSPB) * 100).toFixed(1) : '0.0';
      const pctSH3 = row.totalSPB > 0 ? ((row.kirimSH3 / row.totalSPB) * 100).toFixed(1) : '0.0';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.name}</td>
        <td style="text-align:center"><span class="badge badge-accent">${row.uom}</span></td>
        <td style="text-align:right;font-weight:600">${PMCStore.formatDecimal(Math.ceil(row.totalSPB), 4)}</td>
        <td style="text-align:right;color:var(--warning-color)">${PMCStore.formatDecimal(Math.ceil(row.sisaStok), 4)}</td>
        <td style="text-align:right;color:var(--primary-color);font-weight:600">${PMCStore.formatDecimal(Math.ceil(row.kirimSH1), 4)}</td>
        <td style="text-align:right;color:var(--primary-color);font-weight:600">${PMCStore.formatDecimal(Math.ceil(row.kirimSH2), 4)}</td>
        <td style="text-align:right;color:var(--primary-color);font-weight:600">${PMCStore.formatDecimal(Math.ceil(row.kirimSH3), 4)}</td>
        <td style="text-align:right;font-weight:bold">${PMCStore.formatDecimal(Math.ceil(row.kirimSH1 + row.kirimSH2 + row.kirimSH3), 4)}</td>
        <td style="text-align:center">${renderPercentBadge(pctSH1)}</td>
        <td style="text-align:center">${renderPercentBadge(pctSH2)}</td>
        <td style="text-align:center">${renderPercentBadge(pctSH3)}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    section.appendChild(tableContainer);
    page.appendChild(section);

    // ── Visual Summary Cards ──
    const summarySection = document.createElement('div');
    summarySection.className = 'section';
    summarySection.style.marginTop = 'var(--sp-6)';
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'section-header';
    summaryHeader.innerHTML = `<h3 class="section-title">📊 Ringkasan Distribusi per Shift</h3>`;
    summarySection.appendChild(summaryHeader);

    const cardGrid = document.createElement('div');
    cardGrid.style.display = 'grid';
    cardGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    cardGrid.style.gap = 'var(--sp-4)';

    const shiftLabels = ['Shift 1', 'Shift 2', 'Shift 3'];
    const shiftKeys = ['kirimSH1', 'kirimSH2', 'kirimSH3'];
    const shiftColors = ['var(--primary-color)', 'var(--accent-color)', 'var(--success-color)'];

    shiftLabels.forEach((label, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.textAlign = 'center';
      
      let totalPcs = 0;
      let matCount = 0;
      distData.forEach(r => {
        if (r[shiftKeys[idx]] > 0) {
          totalPcs += r[shiftKeys[idx]];
          matCount++;
        }
      });

      card.innerHTML = `
        <h4 style="color:${shiftColors[idx]};margin-bottom:var(--sp-2)">${label}</h4>
        <div style="font-size:1.8rem;font-weight:bold;color:var(--text-main)">${matCount}</div>
        <div style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--sp-2)">Jenis Material Dikirim</div>
        <div style="font-size:var(--fs-sm);color:var(--text-muted)">Total item: ${PMCStore.formatDecimal(Math.ceil(totalPcs), 4)}</div>
      `;
      cardGrid.appendChild(card);
    });

    summarySection.appendChild(cardGrid);
    page.appendChild(summarySection);

    // ── Manual SPB Section ──
    const manualSpbs = await PMCStore.getManualSpbs();
    const manualSpbsToday = manualSpbs.filter(spb => {
      const spbDate = spb.targetDate ? spb.targetDate.split('T')[0] : spb.createdAt.split('T')[0];
      return spbDate === selectedDate;
    });

    if (manualSpbsToday.length > 0) {
      const manualSection = document.createElement('div');
      manualSection.className = 'section';
      manualSection.style.marginTop = 'var(--sp-6)';
      manualSection.style.border = '2px dashed var(--accent-color)';
      manualSection.style.background = 'rgba(108, 92, 231, 0.05)';
      
      const manualHeader = document.createElement('div');
      manualHeader.className = 'section-header';
      manualHeader.innerHTML = `<h3 class="section-title">📋 SPB Manual (Permintaan Tambahan di Luar Jadwal Otomatis)</h3>`;
      manualSection.appendChild(manualHeader);

      const mTableContainer = document.createElement('div');
      mTableContainer.className = 'table-container';
      const mTable = document.createElement('table');
      mTable.className = 'data-table';
      
      mTable.innerHTML = `
        <thead>
          <tr>
            <th>No SPB</th>
            <th>Peminta</th>
            <th>Material</th>
            <th style="text-align:right">Total Diminta</th>
            <th style="text-align:right">Sudah Disiapkan</th>
            <th>Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
      `;
      const mTbody = document.createElement('tbody');
      manualSpbsToday.forEach(spb => {
        spb.items.forEach((item, idx) => {
          const mTr = document.createElement('tr');
          const statusText = item.status === 'completed' ? '<span class="badge badge-success">Selesai</span>' : '<span class="badge badge-warning">Proses</span>';
          
          mTr.innerHTML = `
            ${idx === 0 ? `<td rowspan="${spb.items.length}" style="vertical-align:top;font-weight:600;color:var(--accent-color);">${spb.spbNumber}</td>` : ''}
            ${idx === 0 ? `<td rowspan="${spb.items.length}" style="vertical-align:top;">${spb.requestedBy}</td>` : ''}
            <td>${item.materialName}</td>
            <td style="text-align:right;font-weight:bold;">${item.qtyPallets} Palet</td>
            <td style="text-align:right;color:var(--primary-color);">${item.scannedPallets} Palet</td>
            <td>${statusText}</td>
            ${idx === 0 ? `<td rowspan="${spb.items.length}" style="vertical-align:top;color:var(--text-secondary);font-size:var(--fs-sm);">${spb.reason || '-'}</td>` : ''}
          `;
          mTbody.appendChild(mTr);
        });
      });
      mTable.appendChild(mTbody);
      mTableContainer.appendChild(mTable);
      manualSection.appendChild(mTableContainer);
      page.appendChild(manualSection);
    }

    container.appendChild(page);
  }

  /**
   * Merge raw requirements with actual backend hourly distribution plan
   * to ensure 100% sync between SPB and Distribution pages.
   */
  function mergeDistributionData(grouped, hourlyData) {
    const result = [];

    grouped.forEach(mat => {
      if (mat.totalSPB <= 0) {
        result.push({
          name: mat.name, uom: mat.uom,
          totalSPB: 0, sisaStok: mat.sisaStok,
          needSH1: mat.sh1, needSH2: mat.sh2, needSH3: mat.sh3,
          bufferPerShift: mat.buffer,
          kirimSH1: 0, kirimSH2: 0, kirimSH3: 0
        });
        return;
      }

      const hData = hourlyData.find(h => h.name === mat.name);
      
      const shiftNeeds = [mat.sh1, mat.sh2, mat.sh3];
      const activeShifts = shiftNeeds.filter(n => n > 0).length || 1;
      const bufferPerShift = mat.buffer / activeShifts;

      result.push({
        name: mat.name, uom: mat.uom,
        totalSPB: mat.totalSPB, sisaStok: mat.sisaStok,
        needSH1: mat.sh1, needSH2: mat.sh2, needSH3: mat.sh3,
        bufferPerShift,
        kirimSH1: hData ? hData.kirimSH1 : 0,
        kirimSH2: hData ? hData.kirimSH2 : 0,
        kirimSH3: hData ? hData.kirimSH3 : 0
      });
    });

    return result;
  }

  function renderPercentBadge(pct) {
    const num = parseFloat(pct);
    if (num <= 0) return '<span style="color:var(--text-muted);">0%</span>';
    let color = 'var(--accent-light)';
    if (num > 40) color = 'var(--primary-color)';
    return `<span style="font-weight:600;color:${color}">${pct}%</span>`;
  }

  async function exportToExcel(type = 'spb') {
    if (!selectedDate) return;
    const reqData = await PMCStore.getMaterialRequirements(selectedDate);
    const hourlyData = await PMCStore.getHourlyDistribution(selectedDate);
    const grouped = reqData?.grouped || [];
    const distData = mergeDistributionData(grouped, hourlyData);

    const wb = XLSX.utils.book_new();
    
    if (type === 'all') {
      const rows = [
        ['Material', 'UOM', 'Total SPB', 'Sisa Stok', 'Kirim SH1', 'Kirim SH2', 'Kirim SH3', 'Total Kirim', '% SH1', '% SH2', '% SH3']
      ];

      distData.forEach(row => {
        if (row.totalSPB <= 0) return;
        const total = Math.ceil(row.kirimSH1) + Math.ceil(row.kirimSH2) + Math.ceil(row.kirimSH3);
        const p1 = row.totalSPB > 0 ? ((Math.ceil(row.kirimSH1) / Math.ceil(row.totalSPB)) * 100).toFixed(1) + '%' : '0%';
        const p2 = row.totalSPB > 0 ? ((Math.ceil(row.kirimSH2) / Math.ceil(row.totalSPB)) * 100).toFixed(1) + '%' : '0%';
        const p3 = row.totalSPB > 0 ? ((Math.ceil(row.kirimSH3) / Math.ceil(row.totalSPB)) * 100).toFixed(1) + '%' : '0%';
        rows.push([row.name, row.uom, Math.ceil(row.totalSPB), Math.ceil(row.sisaStok), Math.ceil(row.kirimSH1), Math.ceil(row.kirimSH2), Math.ceil(row.kirimSH3), total, p1, p2, p3]);
      });

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Semua List Kebutuhan');
    } else if (type === 'spb') {
      const rows = [
        ['Kode Oracle', 'Nama Item', 'Total SPB', 'UOM']
      ];
      
      const getOracleCode = (materialName) => {
        for (const bom of PMCStore.bomData) {
          for (const comp of bom.components) {
            if (comp.name === materialName) {
              return comp.oracleCode || '-';
            }
          }
        }
        return '-';
      };

      distData.forEach(row => {
        if (row.totalSPB > 0) {
          const oracle = getOracleCode(row.name);
          rows.push([oracle, row.name, Math.ceil(row.totalSPB), row.uom]);
        }
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Total SPB');
    }

    XLSX.writeFile(wb, `SPB_HARIAN_${selectedDate}.xlsx`);
    ToastComponent.show('File Excel SPB Harian berhasil di-export!', 'success');
  }

  return { render };
})();

window.DistributionPage = DistributionPage;
export default DistributionPage;
