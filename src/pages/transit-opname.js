/* ===== Transit Opname (Stock Check Blok) Page ===== */
const TransitOpnamePage = (() => {
  let opnameHistory = [];
  let currentBlockId = '';
  let currentBlockRowId = '';
  let currentType = 'DAILY';
  let materialsForOpname = [];
  
  // Kamus State for Conversions
  let kamusOpnameData = [];
  let convMaterial = '';
  let showSisa = true;
  let showUtuh = false;
  let convRows = [{ kg: '', sachet: '' }];
  let utuhRows = [{ pcs: '' }];
  let selectedCondition = 'utuh'; // 'utuh' | 'sisa'

  async function loadHistory() {
    opnameHistory = await PMCStore.getTransitOpnames({ blockId: currentBlockId || undefined });
    renderHistory();
  }

  async function loadKamusOpname() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/kamus-opname`);
      if (res.ok) kamusOpnameData = await res.json();
    } catch (err) { console.warn('Gagal memuat kamus opname', err); }
  }

  function render() {
    if (window.location.hash !== '#/transit/opname') return;
    if (kamusOpnameData.length === 0) loadKamusOpname();
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // Header
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <div>
        <h2 class="page-title">📋 Opname Stok Transit (Blok)</h2>
        <p class="page-subtitle">Pemeriksaan fisik stok di area transit. Selisih akan otomatis tercatat sebagai mutasi penyesuaian (ADJUST).</p>
      </div>
    `;
    page.appendChild(header);

    // Layout
    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1.3fr 1fr';
    layout.style.gap = 'var(--sp-6)';
    layout.style.alignItems = 'start';

    // Left: Form
    const formCard = document.createElement('div');
    formCard.className = 'card';
    formCard.id = 'opname-form-card';
    layout.appendChild(formCard);

    // Right: History
    const histCard = document.createElement('div');
    histCard.className = 'card';
    histCard.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">📜 Riwayat Opname</h3>
      <div id="opname-history-container" style="overflow-x:auto;"></div>
    `;
    layout.appendChild(histCard);

    page.appendChild(layout);
    container.appendChild(page);

    renderForm();
    loadHistory();
    TopbarComponent.render('/transit/opname');
  }

  function renderForm() {
    const card = document.getElementById('opname-form-card');
    if (!card) return;

    const today = new Date().toISOString().split('T')[0];
    const transitInfo = PMCStore.transitInfoCache || { blocks: [] };

    let blockOptions = `<option value="">-- Pilih Blok --</option>`;
    transitInfo.blocks.forEach(b => {
      blockOptions += `<option value="${b.id}" ${currentBlockId === b.id ? 'selected' : ''}>Blok ${b.blockNumber}</option>`;
    });

    let rowOptions = `<option value="">-- Pilih Baris --</option>`;
    if (currentBlockId) {
      const block = transitInfo.blocks.find(b => b.id === currentBlockId);
      if (block) {
        block.rows.forEach(r => {
          if (r.qty > 0 || r.pcs > 0 || r.material) {
            rowOptions += `<option value="${r.id}" ${currentBlockRowId === r.id ? 'selected' : ''}>Baris ${r.rowNumber} (${r.material || 'Kosong'})</option>`;
          }
        });
      }
    }

    card.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">
        ➕ Input Opname Baru
      </h3>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Tanggal Opname</label>
        <input type="date" id="opname-date" class="form-input" value="${today}">
      </div>

      <div style="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-3);">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Blok</label>
          <select id="opname-block" class="form-input">
            ${blockOptions}
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Baris</label>
          <select id="opname-row" class="form-input" ${!currentBlockId ? 'disabled' : ''}>
            ${rowOptions}
          </select>
        </div>
      </div>

      <div style="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-3);">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Tipe Opname</label>
          <select id="opname-type" class="form-input">
            <option value="DAILY" ${currentType === 'DAILY' ? 'selected' : ''}>Harian</option>
            <option value="WEEKLY" ${currentType === 'WEEKLY' ? 'selected' : ''}>Mingguan</option>
            <option value="MONTHLY" ${currentType === 'MONTHLY' ? 'selected' : ''}>Bulanan</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Diperiksa Oleh</label>
          <input type="text" id="opname-checked-by" class="form-input" placeholder="Nama pemeriksa...">
        </div>
      </div>

      <div id="opname-conversion-container"></div>
      <div id="opname-materials-container" style="margin-bottom:var(--sp-4);">
        ${currentBlockRowId ? '' : '<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Pilih Baris terlebih dahulu untuk memuat data material.</div>'}
      </div>

      <button id="btn-save-opname" class="btn btn-primary" style="width:100%; font-weight:bold;" ${!currentBlockRowId ? 'disabled' : ''}>
        💾 Simpan Opname & Sinkronkan Stok
      </button>
    `;

    document.getElementById('opname-block').addEventListener('change', (e) => {
      currentBlockId = e.target.value;
      currentBlockRowId = '';
      renderForm();
    });

    document.getElementById('opname-row').addEventListener('change', (e) => {
      currentBlockRowId = e.target.value;
      if (currentBlockRowId) {
        loadMaterialsForRow();
      } else {
        renderForm();
      }
    });

    document.getElementById('opname-type').addEventListener('change', (e) => {
      currentType = e.target.value;
    });

    if (currentBlockRowId) {
      loadMaterialsForRow();
    }

    document.getElementById('btn-save-opname').addEventListener('click', handleSave);
  }

  function loadMaterialsForRow() {
    const transitInfo = PMCStore.transitInfoCache;
    const block = transitInfo?.blocks.find(b => b.id === currentBlockId);
    const row = block?.rows.find(r => r.id === currentBlockRowId);

    materialsForOpname = [];

    if (row && row.contents && row.contents.length > 0) {
      // Collect unique materials from contents and calculate their current pcs
      const materialMap = {};
      row.contents.forEach(c => {
         if (c.material) {
           materialMap[c.material] = true;
         }
      });
      
      Object.keys(materialMap).forEach(matName => {
         // Fallback to row.pcs if contents are mixed but pcs is only at row level in API
         // but wait, in getTransitInfo, pcs is per row. So if mixed, we can't easily know pcs per material unless API exposes it.
         // Let's rely on row.pcs for the primary material, or 0.
         const isPrimary = matName === row.material;
         materialsForOpname.push({
            materialName: matName,
            qtyBook: isPrimary ? parseFloat(String(row.pcs || '0')) : 0,
            qtyPhysical: isPrimary ? parseFloat(String(row.pcs || '0')) : 0
         });
      });
    } else if (row && row.material) {
      materialsForOpname.push({
        materialName: row.material,
        qtyBook: parseFloat(String(row.pcs || '0')),
        qtyPhysical: parseFloat(String(row.pcs || '0'))
      });
    }

    convMaterial = '';
    showSisa = true;
    showUtuh = false;
    selectedCondition = 'utuh';
    convRows = [{ kg: '', roll: '' }];
    utuhRows = [{ pcs: '' }];

    renderConversionTool();
    renderMaterialsTable();
    document.getElementById('btn-save-opname').disabled = false;
  }

  function renderConversionTool() {
    const wrapper = document.getElementById('opname-conversion-container');
    if (!wrapper) return;

    if (materialsForOpname.length === 0) {
      wrapper.innerHTML = '';
      return;
    }

    let materialOptions = `<option value="">-- Kosong (Tidak pakai konversi) --</option>`;
    materialsForOpname.forEach(m => {
      materialOptions += `<option value="${m.materialName}" ${convMaterial === m.materialName ? 'selected' : ''}>${m.materialName}</option>`;
    });

    // Kondisi button styles
    const utuhActive = selectedCondition === 'utuh';
    const btnUtuhStyle = utuhActive
      ? `flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid var(--success);background:rgba(0,224,163,0.15);color:var(--success);`
      : `flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid transparent;background:rgba(0,224,163,0.05);color:var(--text-muted);`;
    const btnSisaStyle = !utuhActive
      ? `flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid var(--warning);background:rgba(245,158,11,0.15);color:var(--warning);`
      : `flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid transparent;background:rgba(245,158,11,0.05);color:var(--text-muted);`;

    let trsSisa = '';
    convRows.forEach((row, i) => {
      trsSisa += `
        <tr>
          <td style="text-align:center;">${i+1}</td>
          <td><input type="number" step="any" class="form-input conv-kg" data-idx="${i}" value="${row.kg}" placeholder="Contoh: 2.5"></td>
          <td><input type="number" step="any" class="form-input conv-roll" data-idx="${i}" value="${row.roll}" placeholder="Contoh: 5"></td>
          <td style="text-align:right; font-weight:bold; font-size:1.1em;" class="conv-hasil" id="conv-hasil-${i}">0</td>
          <td style="text-align:center;">
             <button class="btn-icon sm btn-ghost btn-conv-del" data-idx="${i}" ${convRows.length === 1 ? 'disabled' : ''} title="Hapus Baris">✕</button>
          </td>
        </tr>
      `;
    });

    let trsUtuh = '';
    utuhRows.forEach((row, i) => {
      trsUtuh += `
        <tr>
          <td style="text-align:center;">${i+1}</td>
          <td><input type="number" step="any" class="form-input conv-utuh-pcs" data-idx="${i}" value="${row.pcs}" placeholder="Contoh: 50"></td>
          <td style="text-align:center;">
             <button class="btn-icon sm btn-ghost btn-utuh-del" data-idx="${i}" ${utuhRows.length === 1 ? 'disabled' : ''} title="Hapus Baris">✕</button>
          </td>
        </tr>
      `;
    });

    wrapper.innerHTML = `
      <div class="card" style="margin-bottom:var(--sp-4); border:1px dashed rgba(108, 92, 231, 0.4); background:rgba(108, 92, 231, 0.02); box-shadow:none;">
        <h4 style="font-size:0.95rem; margin-bottom:var(--sp-3); display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.2em;">⚖️</span> Alat Bantu Perhitungan Fisik Stok
        </h4>
        <div class="form-group" style="margin-bottom:var(--sp-3);">
          <label class="form-label">Material Pilihan</label>
          <select id="conv-material-select" class="form-input" style="max-width:500px;">
            ${materialOptions}
          </select>
        </div>

        ${convMaterial ? `
        <div class="form-group" style="margin-bottom:var(--sp-3);">
          <label class="form-label">Kondisi Material</label>
          <div style="display:flex; gap:8px;">
            <button type="button" id="btn-cond-utuh" style="${btnUtuhStyle}">✅ Utuh (Ada Barcode)</button>
            <button type="button" id="btn-cond-sisa" style="${btnSisaStyle}">⚠️ Sisa (Tanpa Barcode)</button>
          </div>
        </div>
        ` : ''}
        
        <div id="conv-calc-area" style="${convMaterial ? 'display:block;' : 'display:none;'}">

           ${(convMaterial && selectedCondition === 'utuh') ? `
           <div style="border:1px solid rgba(0,224,163,0.2); border-radius:var(--radius-md); padding:var(--sp-4); background:rgba(0,224,163,0.03); margin-bottom:var(--sp-3);">
             <h4 style="margin-bottom:var(--sp-3); color:var(--success); display:flex; align-items:center; gap:8px; font-size:0.95rem;">🔍 Scan Barcode Palet Utuh</h4>
             <div class="form-group" style="margin-bottom:var(--sp-3);">
               <label class="form-label">No Barcode (Scan)</label>
               <input type="text" id="conv-barcode-input" class="form-input" placeholder="Scan barcode dari transit..." autocomplete="off" autofocus style="letter-spacing:2px; font-family:monospace;">
             </div>
             <div class="form-group" style="margin-bottom:var(--sp-3);">
               <label class="form-label">Qty PCS Aktual</label>
               <input type="number" id="conv-barcode-qty" class="form-input" placeholder="Otomatis terisi..." readonly style="background:rgba(0,0,0,0.15); color:var(--text-muted);">
               <div id="conv-barcode-info" style="margin-top:6px; font-size:0.82rem; color:var(--text-muted); font-style:italic;">Menunggu scan barcode...</div>
             </div>
             <div style="display:flex; gap:var(--sp-3);">
               <button id="btn-barcode-add" class="btn btn-secondary" style="flex:1;" disabled>➕ Tambah ke Daftar</button>
               <button id="btn-barcode-clear" class="btn" style="background:rgba(255,59,71,0.1); color:var(--danger); border:1px solid var(--danger); flex:0;">🗑️</button>
             </div>
             <div id="conv-barcode-list" style="margin-top:var(--sp-3);"></div>
             <div style="margin-top:var(--sp-3); padding-top:var(--sp-3); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
               <span style="font-size:0.9rem;">Total Barcode Terhitung: <strong id="conv-barcode-count">0</strong> palet | <strong id="conv-barcode-total-pcs">0</strong> Pcs</span>
               <button id="btn-conv-apply" class="btn btn-primary" disabled>⬇️ Terapkan ke Qty Fisik</button>
             </div>
           </div>
           ` : ''}

           ${(convMaterial && selectedCondition === 'sisa') ? `
           <div style="display:flex; flex-direction:column; gap:var(--sp-4);">
              <div class="calc-section">
                <h5 style="margin-bottom:var(--sp-2); display:flex; justify-content:space-between; align-items:center;">
                  <span style="color:var(--primary);">Bagian Sisa</span>
                  <button id="btn-conv-add" class="btn-icon sm btn-ghost" title="Tambah Baris">+ Baris</button>
                </h5>
                <div style="margin-bottom:var(--sp-2); padding:var(--sp-2) var(--sp-3); background:#fff; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-secondary);" id="conv-kamus-info"></div>
                <table class="data-table" style="font-size:0.85rem; margin-bottom:var(--sp-2);">
                  <thead>
                    <tr><th style="width:40px;">No</th><th>Berat (Kg)</th><th>Jumlah Roll / Box</th><th style="text-align:right;">Pcs</th><th style="width:40px;"></th></tr>
                  </thead>
                  <tbody id="conv-tbody">${trsSisa}</tbody>
                  <tfoot>
                    <tr><td colspan="3" style="text-align:right; font-weight:bold;">Total Pcs Sisa:</td><td style="text-align:right; font-weight:bold; color:var(--primary); font-size:1.1em;" id="conv-total-sisa">0</td><td></td></tr>
                  </tfoot>
                </table>
              </div>

              <div class="calc-section">
                <h5 style="margin-bottom:var(--sp-2); display:flex; justify-content:space-between; align-items:center;">
                  <span style="color:var(--success);">Bagian Utuh (Pcs)</span>
                  <button id="btn-utuh-add" class="btn-icon sm btn-ghost" title="Tambah Baris">+ Baris</button>
                </h5>
                <table class="data-table" style="font-size:0.85rem; margin-bottom:var(--sp-2);">
                  <thead>
                    <tr><th style="width:40px;">No</th><th>Jumlah Pcs</th><th style="width:40px;"></th></tr>
                  </thead>
                  <tbody id="utuh-tbody">${trsUtuh}</tbody>
                  <tfoot>
                    <tr><td colspan="1" style="text-align:right; font-weight:bold;">Total Pcs Utuh:</td><td style="text-align:center; font-weight:bold; color:var(--success); font-size:1.1em;" id="conv-total-utuh">0</td><td></td></tr>
                  </tfoot>
                </table>
              </div>
           </div>

           <div style="margin-top:var(--sp-4); text-align:right;">
             <div style="font-size:1.2rem; margin-bottom:var(--sp-3);">
               Total Keseluruhan (Sisa + Utuh): <strong style="color:var(--text-primary); font-size:1.4em;" id="conv-grand-total">0</strong> <small>Pcs</small>
             </div>
             <button id="btn-conv-apply" class="btn btn-secondary">
               Bawa Hasil Keseluruhan ke Input Physical Qty
             </button>
           </div>
           ` : ''}
      </div>
    `;

    const matSel = document.getElementById('conv-material-select');
    if (matSel) {
      matSel.addEventListener('change', (e) => {
        convMaterial = e.target.value;
        renderConversionTool();
        setTimeout(recalcConversion, 50);
      });
    }

    // Kondisi toggle handlers
    const btnCondUtuh = document.getElementById('btn-cond-utuh');
    const btnCondSisa = document.getElementById('btn-cond-sisa');
    if (btnCondUtuh) {
      btnCondUtuh.addEventListener('click', () => {
        selectedCondition = 'utuh';
        convRows = [{ kg: '', roll: '' }];
        utuhRows = [{ pcs: '' }];
        renderConversionTool();
      });
    }
    if (btnCondSisa) {
      btnCondSisa.addEventListener('click', () => {
        selectedCondition = 'sisa';
        convRows = [{ kg: '', roll: '' }];
        utuhRows = [{ pcs: '' }];
        renderConversionTool();
      });
    }

    // Barcode mode handlers
    if (selectedCondition === 'utuh' && convMaterial) {
      const barcodeInput = document.getElementById('conv-barcode-input');
      const barcodeQty = document.getElementById('conv-barcode-qty');
      const barcodeInfo = document.getElementById('conv-barcode-info');
      const btnBarcodeAdd = document.getElementById('btn-barcode-add');
      const btnBarcodeClear = document.getElementById('btn-barcode-clear');
      const barcodeList = document.getElementById('conv-barcode-list');
      const barcodeCount = document.getElementById('conv-barcode-count');
      const barcodeTotalPcs = document.getElementById('conv-barcode-total-pcs');
      const btnApplyBarcode = document.getElementById('btn-conv-apply');

      if (barcodeInput) {
        barcodeInput.style.flex = '1';
        const camBtn = CameraScanner.createScanButton(barcodeInput);
        const rowDiv = document.createElement('div');
        rowDiv.style.cssText = 'display:flex; gap:8px; align-items:stretch; width:100%;';
        barcodeInput.parentNode.insertBefore(rowDiv, barcodeInput);
        rowDiv.appendChild(barcodeInput);
        rowDiv.appendChild(camBtn);
      }

      let scannedBarcodes = [];

      function updateBarcodeList() {
        const total = scannedBarcodes.reduce((s, b) => s + b.pcs, 0);
        barcodeCount.textContent = scannedBarcodes.length;
        barcodeTotalPcs.textContent = total.toLocaleString();
        btnApplyBarcode.disabled = scannedBarcodes.length === 0;

        if (scannedBarcodes.length === 0) {
          barcodeList.innerHTML = '';
          return;
        }
        barcodeList.innerHTML = `
          <table class="data-table" style="font-size:0.82rem;">
            <thead><tr><th>#</th><th>Barcode</th><th style="text-align:right;">Pcs</th><th></th></tr></thead>
            <tbody>
              ${scannedBarcodes.map((b, i) => `
                <tr>
                  <td>${i+1}</td>
                  <td style="font-family:monospace;">${b.barcode}</td>
                  <td style="text-align:right; font-weight:bold;">${b.pcs.toLocaleString()}</td>
                  <td style="text-align:center;"><button class="btn-icon sm btn-ghost btn-rm-bc" data-i="${i}">✕</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>`;

        barcodeList.querySelectorAll('.btn-rm-bc').forEach(b => {
          b.addEventListener('click', e => {
            scannedBarcodes.splice(parseInt(e.currentTarget.dataset.i), 1);
            updateBarcodeList();
          });
        });
      }

      if (barcodeInput) {
        barcodeInput.addEventListener('keydown', async (e) => {
          if (e.key !== 'Enter') return;
          const bc = barcodeInput.value.trim();
          if (!bc) return;

          if (scannedBarcodes.find(s => s.barcode === bc)) {
            barcodeInfo.textContent = '⚠️ Barcode sudah discan!';
            barcodeInfo.style.color = 'var(--warning)';
            return;
          }

          barcodeInfo.textContent = 'Mencari data barcode...';
          barcodeInfo.style.color = 'var(--text-muted)';
          barcodeQty.value = '';
          btnBarcodeAdd.disabled = true;

          try {
            const tInfo = PMCStore.transitInfoCache;
            let found = null;
            if (tInfo && tInfo.blocks) {
              // Hanya cari di blok yang sedang diopname, pakai data barcodes (dari TransitInventory)
              const targetBlock = tInfo.blocks.find(b => b.id === currentBlockId);
              if (targetBlock) {
                for (const row of (targetBlock.rows || [])) {
                  for (const b of (row.barcodes || [])) {
                    if (b.barcode === bc) { found = b; break; }
                  }
                  if (found) break;
                }
              }
            }
            if (found) {
              // Validasi material: barcode harus milik material yang sedang dipilih
              const bcMaterial = found.material || '';
              if (bcMaterial && bcMaterial !== convMaterial) {
                barcodeInfo.textContent = `⚠️ Barcode milik material "${bcMaterial}", bukan "${convMaterial}".`;
                barcodeInfo.style.color = 'var(--warning)';
              } else {
                const pcs = parseFloat(String(found.actualPcs || found.pcs || 0));
                barcodeQty.value = pcs;
                barcodeInfo.textContent = `✅ Ditemukan: ${found.material || convMaterial} — ${pcs.toLocaleString()} Pcs`;
                barcodeInfo.style.color = 'var(--success)';
                btnBarcodeAdd.disabled = false;
                btnBarcodeAdd.dataset.bc = bc;
                btnBarcodeAdd.dataset.pcs = pcs;
              }
            } else {
              barcodeInfo.textContent = '❌ Barcode tidak ditemukan di blok ini.';
              barcodeInfo.style.color = 'var(--danger)';
            }
          } catch(err) {
            barcodeInfo.textContent = 'Error mencari barcode.';
          }
        });

        btnBarcodeAdd.addEventListener('click', () => {
          const bc = btnBarcodeAdd.dataset.bc;
          const pcs = parseFloat(btnBarcodeAdd.dataset.pcs) || 0;
          if (!bc) return;
          scannedBarcodes.push({ barcode: bc, pcs });
          barcodeInput.value = '';
          barcodeQty.value = '';
          barcodeInfo.textContent = 'Menunggu scan barcode...';
          barcodeInfo.style.color = 'var(--text-muted)';
          btnBarcodeAdd.disabled = true;
          updateBarcodeList();
          barcodeInput.focus();
        });

        btnBarcodeClear.addEventListener('click', () => {
          scannedBarcodes = [];
          barcodeInput.value = '';
          barcodeQty.value = '';
          barcodeInfo.textContent = 'Menunggu scan barcode...';
          barcodeInfo.style.color = 'var(--text-muted)';
          updateBarcodeList();
        });

        btnApplyBarcode.addEventListener('click', () => {
          const total = scannedBarcodes.reduce((s, b) => s + b.pcs, 0);
          const mIdx = materialsForOpname.findIndex(m => m.materialName === convMaterial);
          if (mIdx !== -1) {
            materialsForOpname[mIdx].qtyPhysical = total;
            const bcNotes = scannedBarcodes.map((b, i) => `BC${i+1}:${b.barcode}=${b.pcs}pcs`).join(' | ');
            materialsForOpname[mIdx].calculatorNotes = `UTUH-BARCODE[ ${bcNotes} ] => TOTAL:${total}`;
            renderMaterialsTable();
            ToastComponent.show(`${scannedBarcodes.length} barcode diterapkan: ${total.toLocaleString()} Pcs`);
          }
        });

        setTimeout(() => barcodeInput.focus(), 50);
      }
    }

    const cbSisa = document.getElementById('cb-sisa');
    if (cbSisa) cbSisa.addEventListener('change', (e) => { showSisa = e.target.checked; renderConversionTool(); setTimeout(recalcConversion, 50); });
    
    const cbUtuh = document.getElementById('cb-utuh');
    if (cbUtuh) cbUtuh.addEventListener('change', (e) => { showUtuh = e.target.checked; renderConversionTool(); setTimeout(recalcConversion, 50); });

    document.querySelectorAll('.conv-kg, .conv-roll').forEach(el => el.addEventListener('input', (e) => {
      const idx = e.target.dataset.idx;
      if (e.target.classList.contains('conv-kg')) convRows[idx].kg = e.target.value;
      if (e.target.classList.contains('conv-roll')) convRows[idx].roll = e.target.value;
      recalcConversion();
    }));

    document.querySelectorAll('.conv-utuh-pcs').forEach(el => el.addEventListener('input', (e) => {
      const idx = e.target.dataset.idx;
      utuhRows[idx].pcs = e.target.value;
      recalcConversion();
    }));

    document.querySelectorAll('.btn-conv-del').forEach(el => el.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.idx;
      convRows.splice(idx, 1);
      renderConversionTool();
      setTimeout(recalcConversion, 50);
    }));

    document.querySelectorAll('.btn-utuh-del').forEach(el => el.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.idx;
      utuhRows.splice(idx, 1);
      renderConversionTool();
      setTimeout(recalcConversion, 50);
    }));

    const btnAdd = document.getElementById('btn-conv-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        convRows.push({ kg: '', roll: '' });
        renderConversionTool();
        setTimeout(recalcConversion, 50);
      });
    }

    const btnUtuhAdd = document.getElementById('btn-utuh-add');
    if (btnUtuhAdd) {
      btnUtuhAdd.addEventListener('click', () => {
        utuhRows.push({ pcs: '' });
        renderConversionTool();
        setTimeout(recalcConversion, 50);
      });
    }

    const btnApply = document.getElementById('btn-conv-apply');
    if (btnApply) {
      btnApply.addEventListener('click', applyConversion);
    }

    if (convMaterial) setTimeout(recalcConversion, 50);
  }

  function recalcConversion() {
    if (!convMaterial) return;
    const dic = kamusOpnameData.find(d => d.materialName === convMaterial);
    
    let totalSisa = 0;
    if (showSisa) {
      const infoEl = document.getElementById('conv-kamus-info');
      if (infoEl) {
        if (!dic) {
           infoEl.innerHTML = `<span style="color:var(--danger);">⚠️ Material ini belum ada di Kamus Opname. Sisa tidak bisa dihitung.</span>`;
        } else {
           infoEl.innerHTML = `Berat Utuh = ${dic.beratRollUtuh != null ? parseFloat(dic.beratRollUtuh) : '-'}kg &nbsp;|&nbsp; Berat Core = ${dic.beratCore != null ? parseFloat(dic.beratCore) : '-'}kg`;
        }
      }

      convRows.forEach((row, i) => {
        let kg = parseFloat(row.kg) || 0;
        let roll = parseFloat(row.roll) || 0;
        let pcs = 0;
        if (dic) {
          const wUtuh = parseFloat(dic.beratRollUtuh) || 1;
          const wCore = parseFloat(dic.beratCore) || 0;
          let result = (kg - (roll * wCore)) / wUtuh;
          result = Math.max(0, result);
          pcs = Number(result.toFixed(2));
        }
        const cell = document.getElementById(`conv-hasil-${i}`);
        if (cell) cell.textContent = pcs.toLocaleString('id-ID', { maximumFractionDigits: 2 });
        totalSisa += pcs;
      });
    }

    let totalUtuh = 0;
    if (showUtuh) {
      utuhRows.forEach((row) => {
        totalUtuh += parseFloat(row.pcs) || 0;
      });
    }

    const grandTotal = totalSisa + totalUtuh;

    const elTotalSisa = document.getElementById('conv-total-sisa');
    if (elTotalSisa) elTotalSisa.textContent = totalSisa.toLocaleString('id-ID', { maximumFractionDigits: 2 });

    const elTotalUtuh = document.getElementById('conv-total-utuh');
    if (elTotalUtuh) elTotalUtuh.textContent = totalUtuh.toLocaleString('id-ID', { maximumFractionDigits: 2 });

    const elGrandTotal = document.getElementById('conv-grand-total');
    if (elGrandTotal) {
      elGrandTotal.textContent = grandTotal.toLocaleString('id-ID', { maximumFractionDigits: 2 });
      elGrandTotal.dataset.value = grandTotal;
    }

    // Attach raw log to the item for audit
    const tItem = materialsForOpname.find(m => m.materialName === convMaterial);
    if (tItem) {
      let notesParts = [];
      if (showSisa && totalSisa > 0) {
         let sisaLines = [];
         convRows.forEach((r, i) => {
            if (r.kg || r.roll) {
              sisaLines.push(`Baris ${i+1}: ${r.kg||'0'}kg + ${r.roll||'0'}rl => ${document.getElementById(`conv-hasil-${i}`)?.textContent||0}pcs`);
            }
         });
         if(sisaLines.length) notesParts.push("SISA[ " + sisaLines.join(' | ') + " ]");
      }
      if (showUtuh && totalUtuh > 0) {
         let utuhLines = [];
         utuhRows.forEach((r, i) => {
            if (r.pcs) utuhLines.push(`Baris ${i+1}: ${r.pcs}pcs`);
         });
         if(utuhLines.length) notesParts.push("UTUH[ " + utuhLines.join(' | ') + " ]");
      }
      tItem._rawCalcNotes = notesParts.join(' /// ');
    }
  }

  function applyConversion() {
    if (!convMaterial) return;
    const elGrandTotal = document.getElementById('conv-grand-total');
    if (!elGrandTotal) return;
    const val = parseFloat(elGrandTotal.dataset.value) || 0;

    const mIdx = materialsForOpname.findIndex(m => m.materialName === convMaterial);
    if (mIdx !== -1) {
      materialsForOpname[mIdx].qtyPhysical = val;
      if (materialsForOpname[mIdx]._rawCalcNotes) {
        materialsForOpname[mIdx].calculatorNotes = materialsForOpname[mIdx]._rawCalcNotes;
      }
      renderMaterialsTable();
      ToastComponent.show(`Hasil Konversi ${val} Pcs diterapkan ke ${convMaterial}`);
      
      // Auto-switch to next material in list if any
      const nextIdx = (mIdx + 1) % materialsForOpname.length;
      convMaterial = materialsForOpname[nextIdx].materialName;
      convRows = [{ kg: '', sachet: '' }];
      utuhRows = [{ pcs: '' }];
      renderConversionTool();
    }
  }

  function renderMaterialsTable() {
    const container = document.getElementById('opname-materials-container');
    if (!container) return;

    if (materialsForOpname.length === 0) {
      container.innerHTML = '<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Baris ini tidak memiliki stok tercatat.</div>';
      return;
    }

    let trs = '';
    materialsForOpname.forEach((m, i) => {
      const delta = m.qtyPhysical - m.qtyBook;
      let dColor = 'var(--text-primary)';
      if (delta > 0) dColor = 'var(--success)';
      if (delta < 0) dColor = 'var(--danger)';

      trs += `
        <tr>
          <td>${m.materialName}</td>
          <td style="text-align:right;">${m.qtyBook.toLocaleString()}</td>
          <td>
            <input type="number" class="form-input op-phys" data-idx="${i}" value="${m.qtyPhysical}" style="width:100px; text-align:right;">
          </td>
          <td style="text-align:right; font-weight:bold; color:${dColor};">
            ${delta > 0 ? '+' : ''}${delta.toLocaleString()}
          </td>
          <td style="text-align:center;">
             <span title="${m.calculatorNotes || 'Hitung manual tanpa kalkulator'}" style="cursor:help; font-size:1.2em; opacity:${m.calculatorNotes ? '1' : '0.2'}">📝</span>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:right; width:120px;">Qty System (Pcs)</th>
            <th style="width:120px;">Qty Fisik (Pcs)</th>
            <th style="text-align:right; width:100px;">Selisih</th>
            <th style="width:60px;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${trs}
        </tbody>
      </table>
    `;

    document.querySelectorAll('.op-phys').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = e.target.dataset.idx;
        materialsForOpname[idx].qtyPhysical = parseFloat(e.target.value) || 0;
        // if user types manually, clear calc notes
        materialsForOpname[idx].calculatorNotes = null;
        renderMaterialsTable();
      });
    });
  }

  async function handleSave() {
    if (!currentBlockId || !currentBlockRowId) {
      ToastComponent.show('Pilih Blok dan Baris terlebih dahulu.', 'error');
      return;
    }
    const dt = document.getElementById('opname-date').value;
    const cb = document.getElementById('opname-checked-by').value;

    const payload = {
      date: dt,
      type: currentType,
      blockId: currentBlockId,
      checkedBy: cb,
      items: materialsForOpname.map(m => ({
        blockRowId: currentBlockRowId,
        materialName: m.materialName,
        qtyBook: m.qtyBook,
        qtyPhysical: m.qtyPhysical,
        calculatorNotes: m.calculatorNotes || null
      }))
    };

    try {
      const res = await PMCStore.saveTransitOpname(payload);
      if (res.success) {
        ToastComponent.show(res.message);
        
        // --- AUDIT LOG ---
        if (PMCStore.logAuditActivity) {
          PMCStore.logAuditActivity(
            "TRANSIT", 
            `Koreksi Stok / Opname di Blok ${currentBlockId} (Oleh: ${cb})`, 
            { type: currentType, itemsCount: materialsForOpname.length }
          );
        }
        currentBlockId = '';
        currentBlockRowId = '';
        materialsForOpname = [];
        renderForm();
        loadHistory();
      } else {
        ToastComponent.show(res.message, 'error');
      }
    } catch (err) {
      ToastComponent.show('Terjadi kesalahan', 'error');
    }
  }

  function renderHistory() {
    const c = document.getElementById('opname-history-container');
    if (!c) return;

    if (opnameHistory.length === 0) {
      c.innerHTML = '<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Belum ada riwayat opname.</div>';
      return;
    }

    let html = '';
    opnameHistory.forEach(op => {
      let itemsHtml = '';
      if (op.items) {
        itemsHtml = `
          <table class="data-table" style="font-size:0.85rem; margin-top:var(--sp-2);">
            <thead>
              <tr>
                <th>Material</th>
                <th style="text-align:right;">Sistem</th>
                <th style="text-align:right;">Fisik</th>
                <th style="text-align:right;">Selisih</th>
                <th style="text-align:center;">Audit</th>
              </tr>
            </thead>
            <tbody>
              ${op.items.map(it => {
                const delta = parseFloat(String(it.delta));
                let dColor = 'var(--text-primary)';
                if (delta > 0) dColor = 'var(--success)';
                if (delta < 0) dColor = 'var(--danger)';
                return `
                  <tr>
                    <td>${it.materialName}</td>
                    <td style="text-align:right;">${parseFloat(String(it.qtyBook)).toLocaleString()}</td>
                    <td style="text-align:right; font-weight:bold;">
                       <span class="view-qty" id="txt-qty-${it.id}">${parseFloat(String(it.qtyPhysical)).toLocaleString()}</span>
                       <input type="number" class="form-input edit-qty" id="inp-qty-${it.id}" value="${parseFloat(String(it.qtyPhysical))}" style="display:none; width:80px; padding:2px; font-size:0.85rem;">
                    </td>
                    <td style="text-align:right; font-weight:bold; color:${dColor};">
                      ${delta > 0 ? '+' : ''}${delta.toLocaleString()}
                    </td>
                    <td style="text-align:center;">
                       <button class="btn-icon sm btn-ghost" title="${it.calculatorNotes || 'Hitung manual'}" style="opacity:${it.calculatorNotes ? '1' : '0.2'}; cursor:help;">📝</button>
                       <button class="btn-icon sm btn-ghost btn-edit-audit" data-op="${op.id}" data-it="${it.id}" title="Koreksi Fisik">✏️</button>
                       <button class="btn-icon sm btn-ghost btn-save-audit" data-op="${op.id}" data-it="${it.id}" title="Simpan Koreksi" style="display:none;">💾</button>
                       <button class="btn-icon sm btn-ghost btn-cancel-audit" data-it="${it.id}" title="Batal Koreksi" style="display:none; color:var(--danger);">✕</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }

      html += `
        <div style="padding:var(--sp-3); border:1px solid var(--border-color); border-radius:var(--radius-md); margin-bottom:var(--sp-3); background:var(--surface-color);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-2);">
            <div>
              <strong style="color:var(--text-primary); font-size:1.1rem;">📅 ${new Date(op.date).toLocaleDateString('id-ID')}</strong>
              <span class="badge badge-info" style="margin-left:var(--sp-2);">${op.type}</span>
            </div>
            <div style="text-align:right; font-size:0.85rem; color:var(--text-secondary);">
              <div>Blok ${(PMCStore.transitInfoCache?.blocks?.find(b => b.id === op.blockId)?.blockNumber) || '?'}</div>
              <div>Pemeriksa: ${op.checkedBy || '-'}</div>
            </div>
          </div>
          ${itemsHtml}
        </div>
      `;
    });

    c.innerHTML = html;

    // Attach Edit Event Listeners
    document.querySelectorAll('.btn-edit-audit').forEach(btn => {
       btn.addEventListener('click', (e) => {
          const itId = e.currentTarget.dataset.it;
          document.getElementById(`txt-qty-${itId}`).style.display = 'none';
          document.getElementById(`inp-qty-${itId}`).style.display = 'inline-block';
          e.currentTarget.style.display = 'none';
          document.querySelector(`.btn-save-audit[data-it="${itId}"]`).style.display = 'inline-block';
          document.querySelector(`.btn-cancel-audit[data-it="${itId}"]`).style.display = 'inline-block';
       });
    });

    document.querySelectorAll('.btn-cancel-audit').forEach(btn => {
       btn.addEventListener('click', (e) => {
          const itId = e.currentTarget.dataset.it;
          document.getElementById(`txt-qty-${itId}`).style.display = 'inline-block';
          document.getElementById(`inp-qty-${itId}`).style.display = 'none';
          e.currentTarget.style.display = 'none';
          document.querySelector(`.btn-save-audit[data-it="${itId}"]`).style.display = 'none';
          document.querySelector(`.btn-edit-audit[data-it="${itId}"]`).style.display = 'inline-block';
       });
    });

    document.querySelectorAll('.btn-save-audit').forEach(btn => {
       btn.addEventListener('click', async (e) => {
          const itId = e.currentTarget.dataset.it;
          const opId = e.currentTarget.dataset.op;
          const newQty = parseFloat(document.getElementById(`inp-qty-${itId}`).value);
          const editedBy = prompt("Masukkan nama Auditor untuk mencatat koreksi:", "");
          if (!editedBy) return;

          try {
             const res = await PMCStore.updateTransitOpnameItem(opId, itId, newQty, editedBy);
             if (res.success) {
                ToastComponent.show(res.message);
                loadHistory(); // Reload
             } else {
                ToastComponent.show(res.message, 'error');
             }
          } catch(err) {
             ToastComponent.show('Error update opname', 'error');
          }
       });
    });
  }

  return { render };
})();
window.TransitOpnamePage = TransitOpnamePage;
