/* ===== Shift Summary Page (Step 2) ===== */
const ShiftSummaryPage = (() => {
  let selectedDate = '';

  async function render() {
    if (window.location.hash !== '#/summary') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const dates = PMCStore.getUniqueDates();
    if (!selectedDate && dates.length > 0) selectedDate = dates[0];

    // Topbar with export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.innerHTML = '⬇ Export Excel';
    exportBtn.addEventListener('click', () => exportToExcel());
    TopbarComponent.render('/summary', [exportBtn]);

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Step indicator ──
    const stepBadge = document.createElement('div');
    stepBadge.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:20px;';
    stepBadge.innerHTML = `
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Step 2</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Ringkasan produksi per shift (auto-aggregated)</span>
    `;
    page.appendChild(stepBadge);

    // ── Date Selector ──
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const dateSelect = document.createElement('select');
    dateSelect.className = 'filter-select';
    dates.forEach(d => {
      dateSelect.innerHTML += `<option value="${d}" ${d === selectedDate ? 'selected' : ''}>${PMCStore.formatDate(d)}</option>`;
    });
    dateSelect.addEventListener('change', e => { selectedDate = e.target.value; render(); });
    const dateLabel = document.createElement('span');
    dateLabel.style.cssText = 'color: var(--text-secondary); font-size: var(--fs-sm);';
    dateLabel.textContent = 'Tanggal:';
    toolbar.appendChild(dateLabel);
    toolbar.appendChild(dateSelect);
    page.appendChild(toolbar);

    if (!selectedDate) {
      page.innerHTML += '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal. Import di Step 1 terlebih dahulu.</div></div>';
      container.appendChild(page);
      return;
    }

    // ── Get aggregated data ──
    const summary = PMCStore.getShiftSummary(selectedDate);
    const totalSH1 = summary.reduce((s, r) => s + r.sh1, 0);
    const totalSH2 = summary.reduce((s, r) => s + r.sh2, 0);
    const totalSH3 = summary.reduce((s, r) => s + r.sh3, 0);
    const grandTotal = totalSH1 + totalSH2 + totalSH3;

    // ── Shift Cards ──
    const shiftCards = document.createElement('div');
    shiftCards.className = 'shift-cards';

    shiftCards.innerHTML = `
      <div class="shift-card sh1">
        <div class="shift-card-label">🟢 Shift 1</div>
        <div class="shift-card-value">${PMCStore.formatNumber(totalSH1)}</div>
        <div class="shift-card-unit">Box</div>
      </div>
      <div class="shift-card sh2">
        <div class="shift-card-label">🔵 Shift 2</div>
        <div class="shift-card-value">${PMCStore.formatNumber(totalSH2)}</div>
        <div class="shift-card-unit">Box</div>
      </div>
      <div class="shift-card sh3">
        <div class="shift-card-label">🟣 Shift 3</div>
        <div class="shift-card-value">${PMCStore.formatNumber(totalSH3)}</div>
        <div class="shift-card-unit">Box</div>
      </div>
    `;
    page.appendChild(shiftCards);

    // Total banner
    const totalBanner = document.createElement('div');
    totalBanner.className = 'total-banner';
    totalBanner.innerHTML = `<span>Total Harian:</span> ${PMCStore.formatNumber(grandTotal)} Box`;
    page.appendChild(totalBanner);

    // ── Summary Table ──
    const tableSection = document.createElement('div');
    tableSection.className = 'section';

    tableSection.appendChild(DataTableComponent.create({
      columns: [
        { key: 'skuName', label: 'SKU' },
        { key: 'sh1', label: 'SH1', align: 'right', render: v => PMCStore.formatNumber(v) },
        { key: 'sh2', label: 'SH2', align: 'right', render: v => PMCStore.formatNumber(v) },
        { key: 'sh3', label: 'SH3', align: 'right', render: v => PMCStore.formatNumber(v) },
        { key: 'total', label: 'Total', align: 'right',
          render: v => `<strong>${PMCStore.formatNumber(v)}</strong>` },
      ],
      data: summary,
      footer: [
        { value: 'GRAND TOTAL' },
        { value: PMCStore.formatNumber(totalSH1), align: 'right' },
        { value: PMCStore.formatNumber(totalSH2), align: 'right' },
        { value: PMCStore.formatNumber(totalSH3), align: 'right' },
        { value: PMCStore.formatNumber(grandTotal), align: 'right' },
      ],
    }));
    page.appendChild(tableSection);

    // ── Manual SPB Summary Section ──
    const manualSpbs = await PMCStore.getManualSpbs();
    const manualOnDate = manualSpbs.filter(s => {
      const sDate = s.targetDate ? s.targetDate.split('T')[0] : (s.createdAt ? s.createdAt.split('T')[0] : null);
      return sDate === selectedDate;
    });

    if (manualOnDate.length > 0) {
      const manualSection = document.createElement('div');
      manualSection.className = 'section';
      manualSection.style.marginTop = 'var(--sp-8)';
      
      const mHeader = document.createElement('div');
      mHeader.className = 'section-header';
      mHeader.innerHTML = '<h3 class="section-title">📋 Ringkasan Permintaan Manual (Tambahan)</h3>';
      manualSection.appendChild(mHeader);

      const manualSummaryData = [];
      manualOnDate.forEach(spb => {
        spb.items.forEach(item => {
          manualSummaryData.push({
            spbNumber: spb.spbNumber,
            requester: spb.requestedBy,
            material: item.materialName,
            shift: `SH${spb.targetShift || 1}`,
            qty: item.qtyPallets,
            status: item.status
          });
        });
      });

      manualSection.appendChild(DataTableComponent.create({
        columns: [
          { key: 'spbNumber', label: 'No SPB' },
          { key: 'requester', label: 'Peminta' },
          { key: 'material', label: 'Material' },
          { key: 'shift', label: 'Shift', align: 'center' },
          { key: 'qty', label: 'Qty (Plt)', align: 'right', render: v => `<strong>${v}</strong>` },
          { key: 'status', label: 'Status', render: v => v === 'completed' ? '<span class="badge badge-success">Selesai</span>' : '<span class="badge badge-warning">Proses</span>' },
        ],
        data: manualSummaryData
      }));
      page.appendChild(manualSection);
    }

    // ── Action Bar ──
    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary';
    backBtn.innerHTML = '← Kembali';
    backBtn.addEventListener('click', () => { window.location.hash = '/schedule'; });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary btn-lg';
    nextBtn.innerHTML = 'Lanjut ke Step 3 →';
    nextBtn.addEventListener('click', () => { window.location.hash = '/materials'; });

    actionBar.appendChild(backBtn);
    actionBar.appendChild(nextBtn);
    page.appendChild(actionBar);

    container.appendChild(page);
  }

  function exportToExcel() {
    if (!selectedDate) return;
    const summary = PMCStore.getShiftSummary(selectedDate);
    const wsData = [
      ['SKU', 'SH1', 'SH2', 'SH3', 'Total'],
      ...summary.map(r => [r.skuName, r.sh1, r.sh2, r.sh3, r.total])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shift Summary');
    XLSX.writeFile(wb, `shift_summary_${selectedDate}.xlsx`);
    ToastComponent.show('File berhasil di-export!', 'success');
  }

  return { render };
})();

window.ShiftSummaryPage = ShiftSummaryPage;
export default ShiftSummaryPage;
