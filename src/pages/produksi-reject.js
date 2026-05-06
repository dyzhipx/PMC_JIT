/* ===== Produksi Reject Page (Line Scrap / Afkir) ===== */
const ProduksiRejectPage = (() => {
  let logs = [];
  let selectedLine = '';
  let selectedMaterial = '';
  let selectedReason = 'Handling'; // Default
  const REASONS = ['Handling', '3M', 'Lantech', 'Gantry', 'Afkir'];

  function render() {
    if (window.location.hash !== '#/produksi/reject') return;
    
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
        <h2 class="page-title">🗑️ Reject Out (Afkir Line)</h2>
        <p class="page-subtitle">Pilih line dan material untuk mengajukan pembuangan (Rijek). Pemotongan stok memerlukan verifikasi Transit.</p>
      </div>
    `;
    page.appendChild(headerBar);

    // Grid Layout
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '380px 1fr';
    grid.style.gap = 'var(--sp-6)';
    grid.style.alignItems = 'start';

    // ── Left: Form Pengajuan ──
    const formCard = document.createElement('div');
    formCard.className = 'card';
    
    formCard.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;">
        <span>📝</span> Form Pengajuan Rijek
      </h3>
    `;

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    // Line Dropdown
    const labelLine = document.createElement('label');
    labelLine.className = 'form-label';
    labelLine.textContent = 'Pilih Line Produksi';

    const lineSelect = document.createElement('select');
    lineSelect.className = 'form-input';
    lineSelect.style.color = '#fff';
    lineSelect.style.background = 'rgba(0,0,0,0.2)';
    
    // Populate Lines based on active stock
    const activeLines = Object.keys(PMCStore.lineStock || {}).sort();
    lineSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line --</option>' + 
      activeLines.map(l => `<option value="${l}" style="background:#1a1a2e;color:#fff;">Line ${l}</option>`).join('');

    // Material Dropdown
    const labelMaterial = document.createElement('label');
    labelMaterial.className = 'form-label';
    labelMaterial.style.marginTop = 'var(--sp-3)';
    labelMaterial.textContent = 'Pilih Material';

    const materialSelect = document.createElement('select');
    materialSelect.className = 'form-input';
    materialSelect.style.color = '#fff';
    materialSelect.style.background = 'rgba(0,0,0,0.2)';
    materialSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>';
    materialSelect.disabled = true;

    // ── QTY PCS Input ──
    const labelPcs = document.createElement('label');
    labelPcs.className = 'form-label';
    labelPcs.style.marginTop = 'var(--sp-3)';
    labelPcs.innerHTML = 'Qty Barang Rijek / Afkir (<span id="max-pcs-label" style="color:var(--warning-color);">Max: - PCS</span>)';

    const pcsInput = document.createElement('input');
    pcsInput.type = 'number';
    pcsInput.className = 'form-input';
    pcsInput.placeholder = 'Jumlah pcs yang di-reject...';
    pcsInput.autocomplete = 'off';
    pcsInput.style.color = '#fff';
    pcsInput.style.fontSize = '1.1rem';
    pcsInput.style.fontWeight = '700';
    pcsInput.min = '1';

    // ── Kriteria Rijek ──
    const labelReason = document.createElement('label');
    labelReason.className = 'form-label';
    labelReason.style.marginTop = 'var(--sp-3)';
    labelReason.textContent = 'Kriteria Rijek';

    const reasonSelect = document.createElement('select');
    reasonSelect.className = 'form-input';
    reasonSelect.style.color = '#fff';
    reasonSelect.style.background = 'rgba(0,0,0,0.2)';
    REASONS.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      opt.style.background = '#1a1a2e';
      opt.style.color = '#fff';
      reasonSelect.appendChild(opt);
    });
    reasonSelect.value = selectedReason;
    reasonSelect.addEventListener('change', (e) => selectedReason = e.target.value);

    // Dynamic Updating
    let maxPcsAvailable = 0;

    lineSelect.addEventListener('change', (e) => {
      selectedLine = e.target.value;
      selectedMaterial = '';
      pcsInput.value = '';
      maxPcsAvailable = 0;
      document.getElementById('max-pcs-label').innerText = 'Max: - PCS';
      
      if (!selectedLine) {
        materialSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>';
        materialSelect.disabled = true;
        submitBtn.disabled = true;
        return;
      }
      
      const matsInLine = Object.keys(PMCStore.lineStock[selectedLine] || {});
      materialSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>' + 
        matsInLine.map(m => `<option value="${m}" style="background:#1a1a2e;color:#fff;">${m}</option>`).join('');
      materialSelect.disabled = false;
      submitBtn.disabled = true;
    });

    materialSelect.addEventListener('change', (e) => {
      selectedMaterial = e.target.value;
      if (selectedMaterial) {
        const stockData = (PMCStore.lineStock[selectedLine] || {})[selectedMaterial];
        maxPcsAvailable = stockData ? parseFloat(stockData.pcs || 0) : 0;
        document.getElementById('max-pcs-label').innerText = `Max: ${PMCStore.formatNumber(maxPcsAvailable)} PCS`;
        submitBtn.disabled = false;
      } else {
        maxPcsAvailable = 0;
        document.getElementById('max-pcs-label').innerText = 'Max: - PCS';
        submitBtn.disabled = true;
      }
    });

    // Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.cssText = 'width:100%; padding:14px; font-size:1.05rem; margin-top:var(--sp-4); font-weight:bold; background:linear-gradient(45deg, #ec4899, #ef4444); border:none; box-shadow:0 4px 15px rgba(236,72,153,0.3); color:#fff;';
    submitBtn.textContent = '📤 Ajukan Verifikasi Rijek';
    submitBtn.disabled = true;

    // Process Logic
    const submitAction = async () => {
      const qtyPcs = parseFloat(pcsInput.value);

      if (!selectedLine || !selectedMaterial || submitBtn.disabled) {
        ToastComponent.show('Mohon pilih Line dan Material', 'warning');
        return;
      }
      if (!qtyPcs || qtyPcs <= 0 || qtyPcs > maxPcsAvailable) {
        ToastComponent.show(`Mohon isi Qty PCS yang valid (Maks: ${maxPcsAvailable})`, 'warning');
        pcsInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Mengajukan...';

      await processReject(selectedLine, selectedMaterial, qtyPcs, selectedReason);
      
      pcsInput.value = '';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '📤 Ajukan Verifikasi Rijek';
      loadAndRenderRejects();
    };

    submitBtn.addEventListener('click', submitAction);

    // Build form
    formGroup.appendChild(labelLine);
    formGroup.appendChild(lineSelect);
    formGroup.appendChild(labelMaterial);
    formGroup.appendChild(materialSelect);
    formGroup.appendChild(labelPcs);
    formGroup.appendChild(pcsInput);
    formGroup.appendChild(labelReason);
    formGroup.appendChild(reasonSelect);
    formGroup.appendChild(submitBtn);
    formCard.appendChild(formGroup);

    grid.appendChild(formCard);

    // ── Right: Scan Logs & Summary ──
    const logsCard = document.createElement('div');
    logsCard.className = 'card';
    logsCard.style.minHeight = '650px';
    logsCard.style.display = 'flex';
    logsCard.style.flexDirection = 'column';

    logsCard.innerHTML = `<h3 style="margin-bottom:var(--sp-4);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📊 Laporan Rijek Hari Ini</h3>`;

    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'reject-summary-container';
    summaryContainer.style.display = 'flex';
    summaryContainer.style.gap = 'var(--sp-2)';
    summaryContainer.style.flexWrap = 'wrap';
    summaryContainer.style.marginBottom = 'var(--sp-4)';
    logsCard.appendChild(summaryContainer);

    logsCard.innerHTML += `<h4 style="margin-bottom:var(--sp-2);color:var(--text-secondary);">📜 Log Rijek Terakhir</h4>`;

    const logsContainer = document.createElement('div');
    logsContainer.id = 'reject-logs-container';
    logsContainer.style.flex = '1';
    logsContainer.style.display = 'flex';
    logsContainer.style.flexDirection = 'column';
    logsContainer.style.gap = 'var(--sp-2)';
    logsContainer.style.overflowY = 'auto';
    logsContainer.style.maxHeight = '450px';

    logsCard.appendChild(logsContainer);
    grid.appendChild(logsCard);
    page.appendChild(grid);
    container.appendChild(page);

    loadAndRenderRejects();

    TopbarComponent.render('/produksi/reject');
  }

  async function processReject(line, material, pcs, reason) {
    const res = await PMCStore.rejectFromLine(line, material, pcs, reason);
    if (res.success) {
      ToastComponent.show(`Rijek berhasil diajukan ke Transit.`, 'success');
    } else {
      ToastComponent.show('Gagal: ' + res.message, 'danger');
    }
  }

  async function loadAndRenderRejects() {
    const container = document.getElementById('reject-logs-container');
    const summaryBox = document.getElementById('reject-summary-container');
    if (!container || !summaryBox) return;

    const rejects = await PMCStore.getLineRejects(''); // Get today's rejects
    
    // Calculate summary (approved or pending ones, whatever makes sense. let's just count all that aren't rejected)
    const summary = {};
    REASONS.forEach(r => summary[r] = 0);
    let totalPcs = 0;
    
    rejects.filter(r => r.status !== 'rejected').forEach(r => {
      if (summary[r.reason] !== undefined) summary[r.reason] += parseFloat(r.pcs || 0);
      else summary[r.reason] = parseFloat(r.pcs || 0);
      totalPcs += parseFloat(r.pcs || 0);
    });

    summaryBox.innerHTML = REASONS.map(r => `
      <div style="flex:1; min-width:80px; background:rgba(236, 72, 153, 0.1); border:1px solid rgba(236,72,153,0.3); padding:var(--sp-2); border-radius:var(--radius-sm); text-align:center;">
        <div style="font-size:var(--fs-xs); color:var(--text-secondary);">${r}</div>
        <div style="font-size:1.1rem; font-weight:700; color:#ec4899;">${PMCStore.formatNumber(summary[r])}</div>
      </div>
    `).join('') + `
      <div style="flex:1; min-width:80px; background:rgba(255, 61, 113, 0.2); border:1px solid rgba(255,61,113,0.5); padding:var(--sp-2); border-radius:var(--radius-sm); text-align:center;">
        <div style="font-size:var(--fs-xs); color:var(--text-primary);">Total Hari Ini</div>
        <div style="font-size:1.1rem; font-weight:800; color:#ff3d71;">${PMCStore.formatNumber(totalPcs)}</div>
      </div>
    `;

    if (rejects.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada pengajuan rijek hari ini.</div>`;
      return;
    }

    container.innerHTML = rejects.map(r => {
      const timeStr = r.time ? r.time.substring(11, 19) : '?';
      let statuColor = 'var(--warning-color)';
      let statusBg = 'rgba(245,158,11,0.12)';
      let statusText = '⏳ Menunggu Verifikasi';
      if (r.status === 'approved') {
        statuColor = 'var(--success-color)';
        statusBg = 'rgba(16,185,129,0.12)';
        statusText = '✅ Disetujui (Terpotong)';
      } else if (r.status === 'rejected') {
        statuColor = 'var(--danger-color)';
        statusBg = 'rgba(239,68,68,0.12)';
        statusText = '❌ Ditolak';
      }

      return `
      <div style="background:var(--bg-secondary);padding:var(--sp-3);border-left:4px solid ${statuColor};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${timeStr} | Line ${r.line}</span>
          <span style="font-weight:600;color:${statuColor};">${statusText}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">${r.materialName}</div>
        <div style="display:flex;gap:8px;font-size:var(--fs-xs);flex-wrap:wrap;">
          <span style="background:rgba(236,72,153,0.12);color:#ec4899;padding:2px 8px;border-radius:100px;font-weight:600;">${r.reason}</span>
          <span style="background:rgba(245,158,11,0.12);color:var(--warning-color);padding:2px 8px;border-radius:100px;font-weight:600;">${PMCStore.formatNumber(r.pcs)} pcs</span>
        </div>
      </div>
    `}).join('');
  }

  return { render };
})();

window.ProduksiRejectPage = ProduksiRejectPage;
export default ProduksiRejectPage;
