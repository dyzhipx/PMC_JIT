/* ===== Produksi Outbound Page (Retur ke Transit) - Redesigned ===== */
const ProduksiOutboundPage = (() => {
  let logs = [];
  let selectedLine = '';
  let selectedMaterial = '';
  let selectedCondition = 'utuh';

  // Sisa calculator state
  let kamusOpnameData = [];
  let convRows = [{ kg: '', sachet: '' }];
  let utuhRows = [{ pcs: '' }];
  let showSisa = true;
  let showUtuh = false;

  async function loadKamusOpname() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/kamus-opname`);
      if (res.ok) kamusOpnameData = await res.json();
    } catch (err) { console.warn('Gagal memuat kamus opname', err); }
  }

  function render() {
    if (window.location.hash !== '#/produksi/outbound') return;
    if (kamusOpnameData.length === 0) loadKamusOpname();

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
        <h2 class="page-title">📤 Retur ke Transit (Outbound Produksi)</h2>
        <p class="page-subtitle">Kembalikan material dari line produksi ke area transit. Pilih Line & Material terlebih dahulu.</p>
      </div>
    `;
    page.appendChild(headerBar);

    // Pending Returns Notification
    const pendingReturns = PMCStore.pendingReturns || [];
    if (pendingReturns.length > 0) {
      const notifBar = document.createElement('div');
      notifBar.style.cssText = 'background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:var(--sp-3) var(--sp-4); margin-bottom:var(--sp-4); display:flex; align-items:center; gap:12px;';
      notifBar.innerHTML = `
        <span style="font-size:1.5rem;">🔔</span>
        <div>
          <strong style="color:#f59e0b;">${pendingReturns.length} retur menunggu verifikasi Transit</strong>
          <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:2px;">Pihak transit perlu menerima barang ini di menu Inbound agar status berubah menjadi "Berhasil"</div>
        </div>
      `;
      page.appendChild(notifBar);
    }

    // Grid Layout
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1.3fr 1fr';
    grid.style.gap = 'var(--sp-6)';
    grid.style.alignItems = 'start';

    // ── Left: Form ──
    const scannerCard = document.createElement('div');
    scannerCard.className = 'card';
    scannerCard.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;">
        <span>📝</span> Form Retur Material
      </h3>
    `;

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    // ── 1. Line Dropdown ──
    const labelLine = document.createElement('label');
    labelLine.className = 'form-label';
    labelLine.textContent = '1. Pilih Line Produksi';

    const lineSelect = document.createElement('select');
    lineSelect.className = 'form-input';
    lineSelect.style.color = '#fff';
    lineSelect.style.background = 'rgba(0,0,0,0.2)';

    const allLinesSet = new Set();
    // 1. Master Data (Line per SKU)
    (PMCStore.linePerSku || []).forEach(mapping => {
      if (mapping && mapping.line) allLinesSet.add(mapping.line);
    });
    // 2. Schedules
    (PMCStore.schedules || []).forEach(sched => {
      if (sched && sched.line) allLinesSet.add(sched.line);
    });
    // 3. Block Layout assigned lines
    (PMCStore.getBlockLayout() || []).forEach(block => {
      (block.rows || []).forEach(row => {
        if (row.assignedLines && Array.isArray(row.assignedLines)) {
          row.assignedLines.forEach(l => allLinesSet.add(l));
        } else if (row.lines && Array.isArray(row.lines)) {
          row.lines.forEach(l => allLinesSet.add(l));
        }
      });
    });
    // 4. Active barcodes
    (PMCStore.lineBarcodes || []).forEach(b => {
      if (b && b.line) allLinesSet.add(b.line);
    });
    // 5. Lines with stock
    Object.keys(PMCStore.lineStock || {}).forEach(l => allLinesSet.add(l));
    const allLines = [...allLinesSet].sort();

    lineSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line --</option>' +
      allLines.map(l => `<option value="${l}" style="background:#1a1a2e;color:#fff;">Line ${l}</option>`).join('');

    // ── 2. Material Dropdown ──
    const labelMaterial = document.createElement('label');
    labelMaterial.className = 'form-label';
    labelMaterial.style.marginTop = 'var(--sp-3)';
    labelMaterial.textContent = '2. Pilih Material';

    const materialSelect = document.createElement('select');
    materialSelect.className = 'form-input';
    materialSelect.style.color = '#fff';
    materialSelect.style.background = 'rgba(0,0,0,0.2)';
    materialSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line dulu --</option>';
    materialSelect.disabled = true;

    // ── 3. Kondisi Toggle ──
    const labelCondition = document.createElement('label');
    labelCondition.className = 'form-label';
    labelCondition.style.marginTop = 'var(--sp-3)';
    labelCondition.textContent = '3. Kondisi Material';

    const conditionWrapper = document.createElement('div');
    conditionWrapper.style.cssText = 'display:flex; gap:8px; margin-bottom:4px;';

    const btnUtuh = document.createElement('button');
    btnUtuh.type = 'button';
    btnUtuh.textContent = '✅ Utuh (Ada Barcode)';
    btnUtuh.style.cssText = `flex:1; padding:10px; border-radius:var(--radius-md); font-weight:700; font-size:var(--fs-sm); cursor:pointer; transition:all 0.2s; border:2px solid var(--success); background:rgba(0,224,163,0.15); color:var(--success);`;

    const btnSisa = document.createElement('button');
    btnSisa.type = 'button';
    btnSisa.textContent = '⚠️ Sisa (Tanpa Barcode)';
    btnSisa.style.cssText = `flex:1; padding:10px; border-radius:var(--radius-md); font-weight:700; font-size:var(--fs-sm); cursor:pointer; transition:all 0.2s; border:2px solid transparent; background:rgba(245,158,11,0.05); color:var(--text-muted);`;

    conditionWrapper.appendChild(btnUtuh);
    conditionWrapper.appendChild(btnSisa);

    // ── Dynamic Form Container ──
    const dynamicFormContainer = document.createElement('div');
    dynamicFormContainer.id = 'dynamic-form-container';
    dynamicFormContainer.style.marginTop = 'var(--sp-4)';

    // ── Target Block Dropdown ──
    const labelTarget = document.createElement('label');
    labelTarget.className = 'form-label';
    labelTarget.style.marginTop = 'var(--sp-3)';
    labelTarget.innerHTML = 'Tujuan Blok Transit <span style="color:var(--text-muted);font-size:10px;">(opsional)</span>';

    const targetSelect = document.createElement('select');
    targetSelect.className = 'form-input';
    targetSelect.id = 'outbound-target-select';
    targetSelect.style.color = '#fff';
    targetSelect.style.background = 'rgba(0,0,0,0.2)';
    targetSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis (Blok Sesuai Material) --</option>';
    targetSelect.disabled = true;

    // Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.id = 'outbound-submit-btn';
    submitBtn.style.cssText = 'width:100%; padding:14px; font-size:1.05rem; margin-top:var(--sp-4); font-weight:bold; background:linear-gradient(45deg, #f59e0b, #ef4444); border:none; box-shadow:0 4px 15px rgba(245,158,11,0.3); color:#fff;';
    submitBtn.textContent = '📤 Proses Retur ke Transit';
    submitBtn.disabled = true;

    // ── Event Handlers ──
    function setCondition(cond) {
      selectedCondition = cond;
      // Reset sisa calculator state
      convRows = [{ kg: '', sachet: '' }];
      utuhRows = [{ pcs: '' }];
      showSisa = true;
      showUtuh = false;

      if (cond === 'utuh') {
        btnUtuh.style.border = '2px solid var(--success)';
        btnUtuh.style.background = 'rgba(0,224,163,0.15)';
        btnUtuh.style.color = 'var(--success)';
        btnSisa.style.border = '2px solid transparent';
        btnSisa.style.background = 'rgba(245,158,11,0.05)';
        btnSisa.style.color = 'var(--text-muted)';
      } else {
        btnSisa.style.border = '2px solid var(--warning)';
        btnSisa.style.background = 'rgba(245,158,11,0.15)';
        btnSisa.style.color = 'var(--warning)';
        btnUtuh.style.border = '2px solid transparent';
        btnUtuh.style.background = 'rgba(0,224,163,0.05)';
        btnUtuh.style.color = 'var(--text-muted)';
      }
      renderDynamicForm();
    }

    btnUtuh.addEventListener('click', () => setCondition('utuh'));
    btnSisa.addEventListener('click', () => setCondition('sisa'));

    // Line change → populate materials
    lineSelect.addEventListener('change', (e) => {
      selectedLine = e.target.value;
      selectedMaterial = '';
      submitBtn.disabled = true;
      targetSelect.disabled = true;
      targetSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis --</option>';

      if (!selectedLine) {
        materialSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line dulu --</option>';
        materialSelect.disabled = true;
        dynamicFormContainer.innerHTML = '';
        return;
      }

      const lineStk = PMCStore.lineStock[selectedLine] || {};
      const materials = Object.keys(lineStk).sort();
      materialSelect.disabled = false;
      materialSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>' +
        materials.map(m => {
          const pcs = parseFloat(lineStk[m].pcs || 0);
          return `<option value="${m}" style="background:#1a1a2e;color:#fff;">${m} (${PMCStore.formatNumber(pcs)} pcs)</option>`;
        }).join('');
      dynamicFormContainer.innerHTML = '';
    });

    // Material change → render dynamic form
    materialSelect.addEventListener('change', (e) => {
      selectedMaterial = e.target.value;
      if (!selectedMaterial) {
        dynamicFormContainer.innerHTML = '';
        submitBtn.disabled = true;
        targetSelect.disabled = true;
        return;
      }
      populateTargetBlocks(selectedMaterial);
      renderDynamicForm();
    });

    function populateTargetBlocks(material) {
      targetSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis (Blok Sesuai Material) --</option>';
      targetSelect.disabled = false;

      const tInfo = PMCStore.transitInfoCache;
      if (!tInfo || !tInfo.blocks) return;

      tInfo.blocks.forEach(block => {
        if (!block.rows) return;
        block.rows.forEach(row => {
          const currentQty = row.qty || 0;
          if (currentQty >= row.maxPallets) return;
          const isMatch = row.material === material || !row.material || currentQty === 0;
          const isFlex = row.isFlexible;
          if (!isMatch && !isFlex) return;
          if (!isFlex && row.material && row.material !== material && currentQty > 0) return;

          const flexLabel = isFlex ? ' [SLOW]' : '';
          const matLabel = row.material && row.material !== 'MIXED STOCK' ? ` (${row.material})` : (isFlex && currentQty > 0 ? ' (Mixed)' : '');
          const sisa = row.maxPallets - currentQty;

          const option = document.createElement('option');
          option.value = row.id;
          option.style.background = '#1a1a2e';
          option.style.color = '#fff';
          option.textContent = `B${block.blockNumber}.${row.rowNumber}${flexLabel}${matLabel} - Sisa ${sisa} Slot`;
          targetSelect.appendChild(option);
        });
      });
    }

    // ── Render dynamic form based on condition ──
    function renderDynamicForm() {
      if (!selectedMaterial || !selectedLine) {
        dynamicFormContainer.innerHTML = '';
        return;
      }

      if (selectedCondition === 'utuh') {
        renderUtuhForm();
      } else {
        renderSisaForm();
      }
    }

    // ═══ UTUH FORM (Barcode Scan) ═══
    function renderUtuhForm() {
      dynamicFormContainer.innerHTML = `
        <div style="border:1px solid rgba(0,224,163,0.2); border-radius:var(--radius-md); padding:var(--sp-4); background:rgba(0,224,163,0.03);">
          <h4 style="margin-bottom:var(--sp-3); color:var(--success); display:flex; align-items:center; gap:8px; font-size:0.95rem;">
            🔍 Scan Barcode Palet Utuh
          </h4>
          <div style="background:#000;border-radius:var(--radius-md);height:80px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-3);">
            <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
            <div style="color:rgba(255,255,255,0.3);font-size:2rem;">[|||]</div>
          </div>
          <style>
            @keyframes scanline { 0% { top: 20%; } 100% { top: 80%; } }
          </style>
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label">No Barcode (Scan)</label>
            <input type="text" id="utuh-barcode" class="form-input" placeholder="Scan barcode dari line..." autocomplete="off" style="color:#fff;" />
          </div>
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label">Qty PCS Aktual</label>
            <input type="number" id="utuh-pcs" class="form-input" placeholder="Otomatis terisi..." style="color:#fff; font-weight:700; font-size:1.1rem;" min="1" />
          </div>
          <div id="utuh-validation" class="form-input" style="background:rgba(108,92,231,0.05); border:1px dashed rgba(108,92,231,0.3); min-height:40px; display:flex; align-items:center;">
            <span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>
          </div>
        </div>
      `;

      const barcodeInput = document.getElementById('utuh-barcode');
      const pcsInput = document.getElementById('utuh-pcs');
      const validationDisplay = document.getElementById('utuh-validation');

      // Add camera scanner
      barcodeInput.style.flex = '1';
      const camBtn = CameraScanner.createScanButton(barcodeInput);
      const rowDiv = document.createElement('div');
      rowDiv.style.cssText = 'display:flex; gap:8px; align-items:stretch; width:100%;';
      barcodeInput.parentNode.insertBefore(rowDiv, barcodeInput);
      rowDiv.appendChild(barcodeInput);
      rowDiv.appendChild(camBtn);

      barcodeInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length >= 5) {
          // Only match barcodes for selected line + material
          const bcdMatch = PMCStore.lineBarcodes.find(b => b.barcode === val && b.line === selectedLine && b.material === selectedMaterial);
          if (!bcdMatch) {
            // Also try without material filter (maybe field name differs)
            const bcdAny = PMCStore.lineBarcodes.find(b => b.barcode === val && b.line === selectedLine);
            if (bcdAny) {
              validationDisplay.innerHTML = `<span class="badge badge-warning" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">⚠️ Barcode ditemukan di Line ${selectedLine}, tapi material-nya ${bcdAny.material} (bukan ${selectedMaterial}).</span>`;
              submitBtn.disabled = true;
              return;
            }
            const inTransit = (PMCStore.transitInventory || []).some(i => i.barcode === val);
            if (inTransit) {
              validationDisplay.innerHTML = `<span class="badge badge-warning" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">⚠️ Barcode ini ada di Area Transit, bukan di Line.</span>`;
            } else {
              validationDisplay.innerHTML = `<span class="badge badge-danger" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">❌ Barcode tidak ditemukan di Line ${selectedLine}.</span>`;
            }
            pcsInput.value = '';
            submitBtn.disabled = true;
          } else {
            pcsInput.value = parseFloat(bcdMatch.pcs || 0);
            validationDisplay.innerHTML = `<span class="badge badge-success" style="padding:var(--sp-2);font-weight:700;">✅ Ditemukan: ${bcdMatch.material} — ${PMCStore.formatNumber(bcdMatch.pcs)} pcs</span>`;
            submitBtn.disabled = false;
          }
        } else {
          pcsInput.value = '';
          validationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
          submitBtn.disabled = true;
        }
      });

      barcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !submitBtn.disabled) handleSubmitUtuh();
      });

      setTimeout(() => { if (barcodeInput) barcodeInput.focus(); }, 100);
    }

    // ═══ SISA FORM (Calculator like Opname) ═══
    function renderSisaForm() {
      const kamus = kamusOpnameData.find(k => k.materialName === selectedMaterial);
      const lineStk = PMCStore.lineStock[selectedLine] || {};
      const maxPcs = parseFloat(lineStk[selectedMaterial]?.pcs || 0);

      let trsSisa = '';
      convRows.forEach((row, i) => {
        trsSisa += `
          <tr>
            <td style="text-align:center;">${i+1}</td>
            <td><input type="number" step="any" class="form-input sisa-kg" data-idx="${i}" value="${row.kg}" placeholder="Contoh: 2.5"></td>
            <td><input type="number" step="any" class="form-input sisa-sachet" data-idx="${i}" value="${row.sachet}" placeholder="Contoh: 5"></td>
            <td style="text-align:right; font-weight:bold; font-size:1.1em;" class="sisa-hasil" id="sisa-hasil-${i}">0</td>
            <td style="text-align:center;">
               <button class="btn-icon sm btn-ghost btn-sisa-del" data-idx="${i}" ${convRows.length === 1 ? 'disabled' : ''} title="Hapus Baris">✕</button>
            </td>
          </tr>
        `;
      });

      let trsUtuh = '';
      utuhRows.forEach((row, i) => {
        trsUtuh += `
          <tr>
            <td style="text-align:center;">${i+1}</td>
            <td><input type="number" step="any" class="form-input sisa-utuh-pcs" data-idx="${i}" value="${row.pcs}" placeholder="Contoh: 50"></td>
            <td style="text-align:center;">
               <button class="btn-icon sm btn-ghost btn-utuh-row-del" data-idx="${i}" ${utuhRows.length === 1 ? 'disabled' : ''} title="Hapus Baris">✕</button>
            </td>
          </tr>
        `;
      });

      dynamicFormContainer.innerHTML = `
        <div style="border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:var(--sp-4); background:rgba(245,158,11,0.03);">
          <h4 style="margin-bottom:var(--sp-3); color:var(--warning); display:flex; align-items:center; gap:8px; font-size:0.95rem;">
            ⚖️ Alat Bantu Perhitungan Fisik Stok (Sisa)
          </h4>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:var(--sp-3); padding:var(--sp-2) var(--sp-3); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.05);">
            <strong>Material:</strong> ${selectedMaterial} &nbsp;|&nbsp; 
            <strong>Stok Line:</strong> ${PMCStore.formatNumber(maxPcs)} pcs
          </div>
          <div id="sisa-kamus-info" style="margin-bottom:var(--sp-3); padding:var(--sp-2) var(--sp-3); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-secondary);"></div>

          <div style="margin-bottom:var(--sp-3); display:flex; gap:var(--sp-4); align-items:center; padding:var(--sp-2); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); width:fit-content;">
            <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:bold;">Mode Hitung:</span>
            <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
              <input type="checkbox" id="cb-sisa-mode" ${showSisa ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent);">
              <strong style="color:var(--text-primary); font-size:0.85rem;">Totalan / Konversi Sisa</strong>
            </label>
            <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
              <input type="checkbox" id="cb-utuh-mode" ${showUtuh ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--success);">
              <strong style="color:var(--text-primary); font-size:0.85rem;">Totalan Utuh (Pcs)</strong>
            </label>
          </div>

          <!-- TABEL SISA -->
          <div id="sisa-table-wrapper" style="${showSisa ? 'display:block;' : 'display:none;'} background:var(--bg-surface); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(108,92,231,0.2); margin-bottom:var(--sp-3);">
            <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border); padding-bottom:var(--sp-2);">Tabel Sisa</h5>
            <div style="width:100%; overflow-x:auto; margin-bottom:var(--sp-3);">
              <table class="data-table" style="font-size:0.8rem; width:100%; min-width:350px;">
                <thead>
                  <tr>
                    <th style="width:30px; text-align:center;">#</th>
                    <th>Jumlah Berat (kg)</th>
                    <th>Jumlah Roll / Box</th>
                    <th style="text-align:right;">Hasil (Pcs)</th>
                    <th style="width:40px; text-align:center;">Del</th>
                  </tr>
                </thead>
                <tbody>${trsSisa}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right; font-weight:bold;">Total Sisa:</td>
                    <td id="sisa-total" style="text-align:right; font-weight:bold; color:var(--accent);">0</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-sisa-add" style="width:100%;">➕ Tambah Baris Sisa</button>
          </div>

          <!-- TABEL UTUH -->
          <div id="utuh-table-wrapper" style="${showUtuh ? 'display:block;' : 'display:none;'} background:var(--bg-surface); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(0,224,163,0.2); margin-bottom:var(--sp-3);">
            <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border); padding-bottom:var(--sp-2);">Tabel Utuh</h5>
            <div style="width:100%; overflow-x:auto; margin-bottom:var(--sp-3);">
              <table class="data-table" style="font-size:0.8rem; width:100%; min-width:200px;">
                <thead>
                  <tr>
                    <th style="width:30px; text-align:center;">#</th>
                    <th>Jumlah Utuh (Pcs / Roll)</th>
                    <th style="width:40px; text-align:center;">Del</th>
                  </tr>
                </thead>
                <tbody>${trsUtuh}</tbody>
                <tfoot>
                  <tr>
                    <td style="text-align:right; font-weight:bold;">Total Utuh:</td>
                    <td id="utuh-total" style="text-align:left; font-weight:bold; color:var(--success);">0</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-utuh-row-add" style="width:100%;">➕ Tambah Baris Utuh</button>
          </div>

          <!-- GRAND TOTAL -->
          <div style="display:flex; flex-direction:column; gap:var(--sp-3); padding-top:var(--sp-3); border-top:2px dashed var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge badge-warning" style="font-size:1rem; padding:8px 16px;">GRAND TOTAL FISIK (SISA + UTUH):</span>
              <span id="sisa-grand-total" style="font-size:1.5rem; font-weight:900; color:var(--text-primary);">0 Pcs</span>
            </div>
          </div>
        </div>
      `;

      // Kamus info
      const infoEl = document.getElementById('sisa-kamus-info');
      if (infoEl) {
        if (!kamus) {
          infoEl.innerHTML = `<span style="color:var(--danger);">⚠️ Material ini belum ada di Kamus Opname. Konversi sisa kg→pcs tidak bisa dilakukan. Gunakan mode "Totalan Utuh (Pcs)" saja.</span>`;
        } else {
          infoEl.innerHTML = `Berat Utuh = ${kamus.beratRollUtuh != null ? parseFloat(kamus.beratRollUtuh) : '-'}kg &nbsp;|&nbsp; Berat Core = ${kamus.beratCore != null ? parseFloat(kamus.beratCore) : '-'}kg`;
        }
      }

      // Mode checkboxes
      document.getElementById('cb-sisa-mode').addEventListener('change', (e) => {
        showSisa = e.target.checked;
        renderSisaForm();
      });
      document.getElementById('cb-utuh-mode').addEventListener('change', (e) => {
        showUtuh = e.target.checked;
        renderSisaForm();
      });

      // Calculator logic
      const calculateRowSisa = (idx) => {
        if (!kamus || !showSisa) return 0;
        const r = convRows[idx];
        const kg = r.kg === '' ? 0 : parseFloat(r.kg);
        const sachet = r.sachet === '' ? 0 : parseFloat(r.sachet);
        if (isNaN(kg) || isNaN(sachet)) return 0;

        const wUtuh = parseFloat(kamus.beratRollUtuh) || 1;
        const wCore = parseFloat(kamus.beratCore) || 0;
        let result = (kg - (sachet * wCore)) / wUtuh;
        result = Math.max(0, result);
        const finalResult = Number(result.toFixed(2));
        const el = document.getElementById(`sisa-hasil-${idx}`);
        if (el) el.textContent = finalResult.toLocaleString('id-ID', { maximumFractionDigits: 2 });
        return finalResult;
      };

      const calculateAll = () => {
        let totalSisa = 0;
        if (showSisa) {
          convRows.forEach((r, i) => { totalSisa += calculateRowSisa(i); });
        }
        const elSisa = document.getElementById('sisa-total');
        if (elSisa) elSisa.textContent = totalSisa.toLocaleString('id-ID', { maximumFractionDigits: 2 });

        let totalUtuh = 0;
        if (showUtuh) {
          utuhRows.forEach((r) => {
            const val = r.pcs === '' ? 0 : parseFloat(r.pcs);
            if (!isNaN(val)) totalUtuh += val;
          });
        }
        const elUtuh = document.getElementById('utuh-total');
        if (elUtuh) elUtuh.textContent = totalUtuh.toLocaleString('id-ID', { maximumFractionDigits: 2 });

        const grandTotal = totalSisa + totalUtuh;
        const elGrand = document.getElementById('sisa-grand-total');
        if (elGrand) elGrand.textContent = grandTotal.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Pcs';

        submitBtn.disabled = grandTotal <= 0;
        return grandTotal;
      };

      // Bind sisa inputs
      dynamicFormContainer.querySelectorAll('.sisa-kg, .sisa-sachet').forEach(el => {
        el.addEventListener('input', calculateAll);
        el.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          if (e.target.classList.contains('sisa-kg')) convRows[idx].kg = e.target.value;
          else convRows[idx].sachet = e.target.value;
        });
      });
      dynamicFormContainer.querySelectorAll('.btn-sisa-del').forEach(el => {
        el.addEventListener('click', (e) => {
          convRows.splice(parseInt(e.currentTarget.dataset.idx), 1);
          renderSisaForm();
        });
      });
      const btnSisaAdd = document.getElementById('btn-sisa-add');
      if (btnSisaAdd) btnSisaAdd.addEventListener('click', () => { convRows.push({ kg: '', sachet: '' }); renderSisaForm(); });

      // Bind utuh inputs
      dynamicFormContainer.querySelectorAll('.sisa-utuh-pcs').forEach(el => {
        el.addEventListener('input', calculateAll);
        el.addEventListener('change', (e) => {
          utuhRows[parseInt(e.target.dataset.idx)].pcs = e.target.value;
        });
      });
      dynamicFormContainer.querySelectorAll('.btn-utuh-row-del').forEach(el => {
        el.addEventListener('click', (e) => {
          utuhRows.splice(parseInt(e.currentTarget.dataset.idx), 1);
          renderSisaForm();
        });
      });
      const btnUtuhAdd = document.getElementById('btn-utuh-row-add');
      if (btnUtuhAdd) btnUtuhAdd.addEventListener('click', () => { utuhRows.push({ pcs: '' }); renderSisaForm(); });

      calculateAll();
    }

    // ── Submit Handlers ──
    async function handleSubmitUtuh() {
      const barcodeInput = document.getElementById('utuh-barcode');
      const pcsInput = document.getElementById('utuh-pcs');
      if (!barcodeInput || !pcsInput) return;

      const barcode = barcodeInput.value.trim();
      const qtyPcs = parseFloat(pcsInput.value);
      if (!barcode || !qtyPcs || qtyPcs <= 0) {
        ToastComponent.show('Mohon scan barcode dan isi Qty PCS valid.', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Memproses...';

      const targetBlockRowId = targetSelect.value || null;
      const res = await PMCStore.returnFromLine(barcode, qtyPcs, targetBlockRowId, 'utuh');

      addLog(barcode, selectedMaterial, selectedLine, qtyPcs, '✅ UTUH', targetSelect.value, res);
      resetForm();
    }

    async function handleSubmitSisa() {
      // Calculate grand total
      let totalSisa = 0;
      if (showSisa) {
        const kamus = kamusOpnameData.find(k => k.materialName === selectedMaterial);
        if (kamus) {
          convRows.forEach(r => {
            const kg = r.kg === '' ? 0 : parseFloat(r.kg);
            const sachet = r.sachet === '' ? 0 : parseFloat(r.sachet);
            if (!isNaN(kg) && !isNaN(sachet)) {
              const wUtuh = parseFloat(kamus.beratRollUtuh) || 1;
              const wCore = parseFloat(kamus.beratCore) || 0;
              totalSisa += Math.max(0, (kg - (sachet * wCore)) / wUtuh);
            }
          });
        }
      }
      let totalUtuh = 0;
      if (showUtuh) {
        utuhRows.forEach(r => {
          const val = r.pcs === '' ? 0 : parseFloat(r.pcs);
          if (!isNaN(val)) totalUtuh += val;
        });
      }
      const grandTotal = Number((totalSisa + totalUtuh).toFixed(2));

      if (grandTotal <= 0) {
        ToastComponent.show('Grand total harus lebih dari 0.', 'warning');
        return;
      }

      // Check vs max
      const lineStk = PMCStore.lineStock[selectedLine] || {};
      const maxPcs = parseFloat(lineStk[selectedMaterial]?.pcs || 0);
      if (grandTotal > maxPcs) {
        ToastComponent.show(`Grand total (${grandTotal}) melebihi stok line (${maxPcs}).`, 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Memproses...';

      const targetBlockRowId = targetSelect.value || null;
      const res = await PMCStore.returnSisaFromLine(selectedLine, selectedMaterial, grandTotal, targetBlockRowId);

      addLog('SISA (Virtual)', selectedMaterial, selectedLine, grandTotal, '⚠️ SISA', targetSelect.value, res);
      resetForm();
    }

    function addLog(barcode, material, line, pcs, condBadge, targetVal, res) {
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let targetLabel = 'Otomatis';
      if (targetVal) {
        const tInfo = PMCStore.transitInfoCache;
        if (tInfo && tInfo.blocks) {
          for (const b of tInfo.blocks) {
            const row = (b.rows || []).find(r => r.id === targetVal);
            if (row) { targetLabel = `B${b.blockNumber}.${row.rowNumber}${row.isFlexible ? ' [SLOW]' : ''}`; break; }
          }
        }
      }

      logs.unshift({
        time: timeStr,
        material: `${barcode} - ${material}`,
        pcs,
        condition: condBadge,
        target: targetLabel,
        success: res.success,
        message: res.success
          ? `Retur dari Line ${line} → ${targetLabel} | ${condBadge} | ${PMCStore.formatNumber(pcs)} pcs — Menunggu verifikasi Transit`
          : res.message
      });
      if (logs.length > 50) logs.pop();
      if (res.success) ToastComponent.show('Retur berhasil diajukan! Menunggu verifikasi transit.', 'success');
      else ToastComponent.show('Gagal: ' + res.message, 'danger');
      renderLogs();
    }

    function resetForm() {
      selectedCondition = 'utuh';
      convRows = [{ kg: '', sachet: '' }];
      utuhRows = [{ pcs: '' }];
      showSisa = true;
      showUtuh = false;
      dynamicFormContainer.innerHTML = '';
      targetSelect.innerHTML = '<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis --</option>';
      targetSelect.disabled = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '📤 Proses Retur ke Transit';
      setCondition('utuh');

      // Keep line & material selection for fast repeat
      if (selectedMaterial) {
        renderDynamicForm();
        populateTargetBlocks(selectedMaterial);
      }
    }

    // Submit dispatcher
    submitBtn.addEventListener('click', () => {
      if (selectedCondition === 'utuh') handleSubmitUtuh();
      else handleSubmitSisa();
    });

    // Build form
    formGroup.appendChild(labelLine);
    formGroup.appendChild(lineSelect);
    formGroup.appendChild(labelMaterial);
    formGroup.appendChild(materialSelect);
    formGroup.appendChild(labelCondition);
    formGroup.appendChild(conditionWrapper);
    formGroup.appendChild(dynamicFormContainer);
    formGroup.appendChild(labelTarget);
    formGroup.appendChild(targetSelect);
    formGroup.appendChild(submitBtn);
    scannerCard.appendChild(formGroup);

    grid.appendChild(scannerCard);

    // ── Right: Scan Logs ──
    const logsCard = document.createElement('div');
    logsCard.className = 'card';
    logsCard.style.minHeight = '650px';
    logsCard.style.display = 'flex';
    logsCard.style.flexDirection = 'column';

    logsCard.innerHTML = `<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border);">📜 Log Retur (Line ➔ Transit)</h3>`;

    const logsContainer = document.createElement('div');
    logsContainer.id = 'scan-logs-container';
    logsContainer.style.flex = '1';
    logsContainer.style.display = 'flex';
    logsContainer.style.flexDirection = 'column';
    logsContainer.style.gap = 'var(--sp-2)';
    logsContainer.style.overflowY = 'auto';
    logsContainer.style.maxHeight = '550px';

    logsCard.appendChild(logsContainer);
    grid.appendChild(logsCard);
    page.appendChild(grid);
    container.appendChild(page);

    renderLogs();
    TopbarComponent.render('/produksi/outbound');
  }

  function renderLogs() {
    const container = document.getElementById('scan-logs-container');
    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas retur pada sesi ini.</div>`;
      return;
    }

    container.innerHTML = logs.map(log => `
      <div style="background:var(--bg-surface-2);padding:var(--sp-3);border-left:4px solid ${log.success ? 'var(--warning)' : 'var(--danger)'};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${log.time}</span>
          <span style="font-weight:600;color:${log.success ? 'var(--warning)' : 'var(--danger)'}">${log.success ? '🔄 MENUNGGU VERIFIKASI' : '❌ GAGAL'}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">${log.material}</div>
        ${log.success ? `
          <div style="display:flex;gap:8px;font-size:var(--fs-xs);flex-wrap:wrap;">
            <span style="background:rgba(245,158,11,0.12);color:#f59e0b;padding:2px 8px;border-radius:100px;font-weight:600;">${log.condition}</span>
            <span style="background:rgba(0,210,255,0.12);color:var(--accent);padding:2px 8px;border-radius:100px;font-weight:600;">${PMCStore.formatNumber(log.pcs)} pcs</span>
            <span style="background:rgba(0,224,163,0.12);color:var(--success);padding:2px 8px;border-radius:100px;font-weight:600;">→ ${log.target}</span>
          </div>
        ` : ''}
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${log.message}</div>
      </div>
    `).join('');
  }

  return { render };
})();

window.ProduksiOutboundPage = ProduksiOutboundPage;
export default ProduksiOutboundPage;
