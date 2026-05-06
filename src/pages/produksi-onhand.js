/* ===== Produksi Onhand Page (Stok per Line) ===== */
const ProduksiOnhandPage = (() => {
  let selectedLine = '';

  function render() {
    if (window.location.hash !== '#/produksi/onhand') return;
    
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Header ──
    const headerBar = document.createElement('div');
    headerBar.className = 'page-header';
    headerBar.innerHTML = `
      <div>
        <h2 class="page-title">📦 Stock On Hand (Produksi Line)</h2>
        <p class="page-subtitle">Pantau ketersediaan material per line produksi secara real-time</p>
      </div>
    `;
    page.appendChild(headerBar);

    // ── Get all active lines ──
    const allLinesSet = new Set();
    
    // 1. Add all registered lines from Master Data (Line per SKU)
    (PMCStore.linePerSku || []).forEach(mapping => {
        if (mapping && mapping.line) allLinesSet.add(mapping.line);
    });

    // 2. Add any lines that exist in the active Schedules
    (PMCStore.schedules || []).forEach(sched => {
        if (sched && sched.line) allLinesSet.add(sched.line);
    });

    // 3. Add any lines that are specifically mapped in the Transit Layout block rows
    (PMCStore.getBlockLayout() || []).forEach(block => {
        (block.rows || []).forEach(row => {
            if (row.assignedLines && Array.isArray(row.assignedLines)) {
                row.assignedLines.forEach(l => allLinesSet.add(l));
            } else if (row.lines && Array.isArray(row.lines)) {
                row.lines.forEach(l => allLinesSet.add(l));
            }
        });
    });

    // 4. Include any active barcodes that might belong to an unmapped line
    const activeBcds = PMCStore.lineBarcodes || [];
    activeBcds.forEach(b => {
        if (b && b.line) allLinesSet.add(b.line);
    });

    // 5. Ensure lines with stock also appear, even if barcode is empty (e.g. leftover pieces)
    Object.keys(PMCStore.lineStock || {}).forEach(l => allLinesSet.add(l));

    const allLines = [...allLinesSet].sort();
    
    if (!selectedLine && allLines.length > 0) {
       selectedLine = allLines[0]; // Auto select first
    }

    // ── Filter Toolbar ──
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.alignItems = 'center';
    toolbar.style.gap = '12px';
    toolbar.style.marginBottom = 'var(--sp-4)';

    const filterLabel = document.createElement('span');
    filterLabel.style.fontSize = 'var(--fs-sm)';
    filterLabel.style.fontWeight = '600';
    filterLabel.textContent = '🏢 Pilih Line Produksi:';
    toolbar.appendChild(filterLabel);

    const filterSelect = document.createElement('select');
    filterSelect.className = 'form-input';
    filterSelect.style.width = 'auto';
    filterSelect.style.minWidth = '200px';
    if (allLines.length === 0) {
      filterSelect.innerHTML = `<option value="">-- Tidak ada data --</option>`;
    } else {
      allLines.forEach(l => {
        filterSelect.innerHTML += `<option value="${l}" ${selectedLine === l ? 'selected' : ''}>Line ${l}</option>`;
      });
    }
    filterSelect.addEventListener('change', (e) => {
      selectedLine = e.target.value;
      render();
    });
    toolbar.appendChild(filterSelect);

    page.appendChild(toolbar);

    if (!selectedLine) {
       page.appendChild(document.createElement('br'));
       const empty = document.createElement('div');
       empty.className = 'alert alert-info';
       empty.textContent = 'Belum ada data line atau material dialokasikan.';
       page.appendChild(empty);
       container.appendChild(page);
       TopbarComponent.render('/produksi/onhand');
       return;
    }

    // ── Summary Cards ──
    const lineStk = PMCStore.lineStock[selectedLine] || {};
    const bcds = PMCStore.getLineBarcodes(selectedLine);

    const totalPallets = Object.values(lineStk).reduce((sum, item) => sum + item.qty, 0);
    const totalBcds = bcds.length;

    const summaryGrid = document.createElement('div');
    summaryGrid.style.display = 'grid';
    summaryGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    summaryGrid.style.gap = 'var(--sp-4)';
    summaryGrid.style.marginBottom = 'var(--sp-6)';

    summaryGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(108, 92, 231, 0.1);color:var(--primary-color);">📦</div>
        <div>
          <div class="stat-value">${totalPallets}</div>
          <div class="stat-label">Total Material (Pallet)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(16, 185, 129, 0.1);color:var(--success-color);">📋</div>
        <div>
          <div class="stat-value">${totalBcds}</div>
          <div class="stat-label">Total Barcode Aktif</div>
        </div>
      </div>
    `;
    page.appendChild(summaryGrid);

    // ── Table Data ──
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3 style="margin-bottom:var(--sp-4);">Tabel Stok Line ${selectedLine}</h3>`;

    const table = document.createElement('div');
    table.className = 'data-table';
    table.style.width = '100%';

    let rowsHtml = '';
    const materials = Object.keys(lineStk).sort();

    if (materials.length === 0) {
      rowsHtml = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:var(--sp-4);">Tidak ada stok di Line ${selectedLine}</td></tr>`;
    } else {
      materials.forEach(mat => {
        const item = lineStk[mat];
        const matBcds = bcds.filter(b => b.material === mat);
        const bcdTags = matBcds.map(b => `<span class="badge badge-primary" style="font-size:10px;" title="Supplier: ${b.supplier}\nIn: ${b.timeIn} (${b.dateIn})">${b.barcode}</span>`).join(' ');

        rowsHtml += `
          <tr>
            <td style="font-weight:600;">${mat}</td>
            <td><strong>${item.qty}</strong> Pallet</td>
            <td><strong>${PMCStore.formatNumber(item.pcs)}</strong> ${PMCStore.getMaterialUOM(mat)}</td>
            <td>${bcdTags || '-'}</td>
          </tr>
        `;
      });
    }

    table.innerHTML = `
      <table style="width:100%;border-collapse:collapse;text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-color);color:var(--text-secondary);font-size:var(--fs-sm);">
            <th style="padding:var(--sp-3) var(--sp-2);">Material</th>
            <th style="padding:var(--sp-3) var(--sp-2);">Qty (Pallet)</th>
            <th style="padding:var(--sp-3) var(--sp-2);">Qty (Pcs)</th>
            <th style="padding:var(--sp-3) var(--sp-2);">Barcode Aktif (Hover for info)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    card.appendChild(table);
    page.appendChild(card);
    container.appendChild(page);

    TopbarComponent.render('/produksi/onhand');
  }

  // ── Event Listeners for Store Updates ──
  PMCStore.on('linePerSkuChanged', () => { if (window.location.hash === '#/produksi/onhand') render(); });
  PMCStore.on('stockChanged', () => { if (window.location.hash === '#/produksi/onhand') render(); });
  PMCStore.on('layoutChanged', () => { if (window.location.hash === '#/produksi/onhand') render(); });
  PMCStore.on('scheduleChanged', () => { if (window.location.hash === '#/produksi/onhand') render(); });

  return { render };
})();

window.ProduksiOnhandPage = ProduksiOnhandPage;
export default ProduksiOnhandPage;
