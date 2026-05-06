/* ===== Material Requirement Page (Step 3) ===== */
const MaterialCalcPage = (() => {
  let selectedDate = '';
  let viewMode = 'grouped'; // 'grouped' or 'persku'
  const openSkus = new Set();

  async function render() {
    if (window.location.hash !== '#/materials') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    
    const dates = PMCStore.getUniqueDates();
    if (!selectedDate && dates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      selectedDate = dates.includes(today) ? today : dates[0];
    }

    if (selectedDate) {
      container.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; height:400px; color:var(--text-muted); flex-direction:column; gap:var(--sp-4);">
          <div class="spinner"></div>
          <p>⚖️ Menghitung kebutuhan material dari database...</p>
        </div>
      `;
    } else {
      container.innerHTML = '';
    }

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.innerHTML = '⬇ Export Excel';
    exportBtn.addEventListener('click', () => exportToExcel('all'));

    TopbarComponent.render('/materials', [exportBtn]);

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Step indicator ──
    const stepBadge = document.createElement('div');
    stepBadge.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:20px;';
    stepBadge.innerHTML = `
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Step 3</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Kebutuhan material dihitung otomatis dari BOM × Target Box</span>
    `;
    page.appendChild(stepBadge);

    // ── Header with date + view toggle ──
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

    // View toggle
    const toggle = document.createElement('div');
    toggle.className = 'view-toggle';
    const groupedBtn = document.createElement('button');
    groupedBtn.className = `view-toggle-btn ${viewMode === 'grouped' ? 'active' : ''}`;
    groupedBtn.textContent = '📦 Grouped';
    groupedBtn.addEventListener('click', () => { viewMode = 'grouped'; render(); });
    const perskuBtn = document.createElement('button');
    perskuBtn.className = `view-toggle-btn ${viewMode === 'persku' ? 'active' : ''}`;
    perskuBtn.textContent = '📋 Per SKU';
    perskuBtn.addEventListener('click', () => { viewMode = 'persku'; render(); });
    toggle.appendChild(groupedBtn);
    toggle.appendChild(perskuBtn);
    headerBar.appendChild(toggle);

    page.appendChild(headerBar);

    if (!selectedDate) {
      page.innerHTML += '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal.</div></div>';
      container.appendChild(page);
      return;
    }

    const { perSku, grouped } = selectedDate 
      ? await PMCStore.getMaterialRequirements(selectedDate)
      : { perSku: [], grouped: [] };
    
    if (selectedDate) container.innerHTML = '';

    // ── Grouped View: Warehouse Picklist with Pallet ──
    if (viewMode === 'grouped') {
      const picklistSection = document.createElement('div');
      picklistSection.className = 'picklist-section section';
      const picklistHeader = document.createElement('div');
      picklistHeader.className = 'section-header';
      picklistHeader.innerHTML = `<h3 class="section-title">📦 List Kebutuhan Bahan/hari</h3>`;
      picklistSection.appendChild(picklistHeader);

      // Build custom table with editable pallet qty
      const tableContainer = document.createElement('div');
      tableContainer.className = 'table-container';
      const table = document.createElement('table');
      table.className = 'data-table';

      // Header
      table.innerHTML = `
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:center">UOM</th>
            <th style="text-align:right">SH1</th>
            <th style="text-align:right">SH2</th>
            <th style="text-align:right">SH3</th>
            <th style="text-align:right;color:var(--accent-light)">Buffer 2J</th>
            <th style="text-align:right;color:var(--warning-color)">Sisa Stok</th>
            <th style="text-align:right">Total <i>(Netto)</i></th>
            <th style="text-align:center;width:100px" class="pallet-col-header">Qty/Pallet</th>
            <th style="text-align:center;width:90px" class="pallet-col-header">Jumlah Pallet</th>
            <th style="text-align:right;width:100px" class="pallet-col-header">Total SPB</th>
          </tr>
        </thead>
      `;

      const tbody = document.createElement('tbody');
      let totalPallets = 0;

      grouped.forEach((row, idx) => {
        const tr = document.createElement('tr');
        const palletCount = row.palletQty > 0 ? Math.ceil(row.total / row.palletQty) : 0;
        totalPallets += palletCount;

        tr.innerHTML = `
          <td>${row.name}</td>
          <td style="text-align:center"><span class="badge badge-accent">${row.uom}</span></td>
          <td style="text-align:right">${PMCStore.formatDecimal(row.sh1, 4)}</td>
          <td style="text-align:right">${PMCStore.formatDecimal(row.sh2, 4)}</td>
          <td style="text-align:right">${PMCStore.formatDecimal(row.sh3, 4)}</td>
          <td style="text-align:right;color:var(--accent-light)">+${PMCStore.formatDecimal(row.buffer, 4)}</td>
          <td style="text-align:right;color:var(--warning-color)">${PMCStore.formatDecimal(row.sisaStok, 4)}</td>
          <td style="text-align:right"><strong>${PMCStore.formatDecimal(row.total, 4)}</strong></td>
          <td style="text-align:center" class="pallet-input-cell"></td>
          <td style="text-align:center" class="pallet-result-cell"></td>
          <td style="text-align:right" class="spb-result-cell"></td>
        `;

        // Display pallet qty text only, removed editable input
        const inputCell = tr.querySelector('.pallet-input-cell');
        inputCell.innerHTML = `<strong>${row.palletQty ? PMCStore.formatNumber(row.palletQty) : '-'}</strong>`;

        // Pallet count result
        const resultCell = tr.querySelector('.pallet-result-cell');
        const spbCell = tr.querySelector('.spb-result-cell');
        if (row.palletQty > 0) {
          const badge = document.createElement('span');
          badge.className = 'pallet-count-badge';
          badge.textContent = `${palletCount} plt`;
          resultCell.appendChild(badge);
          spbCell.innerHTML = `<strong>${PMCStore.formatDecimal(row.totalSPB, 4)}</strong>`;
        } else {
          resultCell.innerHTML = '<span style="color:var(--text-muted);font-size:var(--fs-xs)">—</span>';
          spbCell.innerHTML = `<strong>${PMCStore.formatDecimal(row.totalSPB, 4)}</strong>`;
        }

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);

      // Footer with total pallets
      const tfoot = document.createElement('tfoot');
      tfoot.innerHTML = `
        <tr>
          <td colspan="8" style="font-weight:600;color:var(--accent-light)">TOTAL</td>
          <td style="text-align:center"></td>
          <td style="text-align:center">
            <span class="pallet-count-total">${totalPallets} pallet</span>
          </td>
          <td style="text-align:right"></td>
        </tr>
      `;
      table.appendChild(tfoot);

      tableContainer.appendChild(table);
      picklistSection.appendChild(tableContainer);
      page.appendChild(picklistSection);
    }

    // ── Per SKU View: Accordion Details ──
    if (viewMode === 'persku' || viewMode === 'grouped') {
      const detailSection = document.createElement('div');
      detailSection.className = 'section';
      const detailHeader = document.createElement('div');
      detailHeader.className = 'section-header';
      detailHeader.innerHTML = `<h3 class="section-title">📋 Detail Per SKU</h3>`;
      detailSection.appendChild(detailHeader);

      perSku.forEach(item => {
        const isOpen = openSkus.has(item.skuId);
        const accordion = document.createElement('div');
        accordion.className = `accordion-item ${isOpen ? 'open' : ''}`;

        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
          <span class="accordion-arrow">▶</span>
          <span class="accordion-title">${item.skuName}</span>
          <span class="accordion-badge" style="color:var(--text-muted);font-size:var(--fs-sm);">
            SH1: ${PMCStore.formatNumber(item.sh1)} / SH2: ${PMCStore.formatNumber(item.sh2)} / SH3: ${PMCStore.formatNumber(item.sh3)} Box
          </span>
        `;
        header.addEventListener('click', () => {
          if (openSkus.has(item.skuId)) openSkus.delete(item.skuId);
          else openSkus.add(item.skuId);
          render();
        });
        accordion.appendChild(header);

        const body = document.createElement('div');
        body.className = 'accordion-body';

        if (isOpen) {
          body.appendChild(DataTableComponent.create({
            columns: [
              { key: 'name', label: 'Komponen' },
              { key: 'coefficient', label: 'Rumus', align: 'center',
                render: v => `×${PMCStore.formatDecimal(v, 6)}` },
              { key: 'uom', label: 'UOM', align: 'center',
                render: v => `<span class="badge badge-accent">${v}</span>` },
              { key: 'sh1', label: 'SH1', align: 'right', render: v => PMCStore.formatDecimal(v, 4) },
              { key: 'sh2', label: 'SH2', align: 'right', render: v => PMCStore.formatDecimal(v, 4) },
              { key: 'sh3', label: 'SH3', align: 'right', render: v => PMCStore.formatDecimal(v, 4) },
              { key: 'buffer', label: 'Buffer 2J', align: 'right', render: v => `<span style="color:var(--accent-light)">+${PMCStore.formatDecimal(v, 4)}</span>` },
              { key: 'total', label: 'Total', align: 'right',
                render: (v, row) => `<strong>${PMCStore.formatDecimal(v, 4)} ${row.uom}</strong>` },
            ],
            data: item.materials,
          }));
        }

        accordion.appendChild(body);
        detailSection.appendChild(accordion);
      });

      page.appendChild(detailSection);
    }

    // ── Action Bar ──
    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary';
    backBtn.innerHTML = '← Kembali';
    backBtn.addEventListener('click', () => { window.location.hash = '/summary'; });

    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn btn-success btn-lg';
    doneBtn.innerHTML = '✅ Tandai Selesai';
    doneBtn.addEventListener('click', () => {
      PMCStore.markDateConverted(selectedDate);
      ToastComponent.show(`Tanggal ${PMCStore.formatDate(selectedDate)} ditandai selesai!`, 'success');
      render();
    });

    actionBar.appendChild(backBtn);
    actionBar.appendChild(doneBtn);
    page.appendChild(actionBar);

    container.appendChild(page);
  }

  async function exportToExcel(type = 'all') {
    if (!selectedDate) return;
    const { perSku, grouped } = await PMCStore.getMaterialRequirements(selectedDate);

    const wb = XLSX.utils.book_new();

    if (type === 'all') {
      // Grouped sheet with pallet info
      const groupData = [
        ['Material', 'UOM', 'SH1', 'SH2', 'SH3', 'Buffer 2J', 'Sisa Stok', 'Total Netto', 'Qty/Pallet', 'Jumlah Pallet', 'Total SPB'],
        ...grouped.map(r => [r.name, r.uom, r.sh1, r.sh2, r.sh3, r.buffer, r.sisaStok, r.total, r.palletQty || '-', r.palletCount || '-', r.totalSPB])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(groupData), 'List Kebutuhan Bahan');

      // Per SKU sheets
      perSku.forEach(item => {
        const skuData = [
          ['Komponen', 'Koefisien', 'UOM', 'SH1', 'SH2', 'SH3', 'Buffer 2J', 'Total'],
          ...item.materials.map(m => [m.name, m.coefficient, m.uom, m.sh1, m.sh2, m.sh3, m.buffer, m.total])
        ];
        const safeName = item.skuName.substring(0, 31).replace(/[\\/:*?[\]]/g, '_');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(skuData), safeName);
      });
    } else if (type === 'spb') {
      const spbData = [
        ['Material', 'Total SPB']
      ];
      grouped.forEach(r => {
        if (r.totalSPB > 0) {
          spbData.push([r.name, r.totalSPB]);
        }
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(spbData), 'Total SPB');
    }

    XLSX.writeFile(wb, `List_Kebutuhan_Bahan_${selectedDate}.xlsx`);
    ToastComponent.show('File Excel berhasil di-export!', 'success');
  }

  return { render };
})();

window.MaterialCalcPage = MaterialCalcPage;
export default MaterialCalcPage;
