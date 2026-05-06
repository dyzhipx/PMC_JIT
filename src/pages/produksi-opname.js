/* ===== Produksi Opname (Stock Check Line) Page ===== */
const ProduksiOpnamePage = (() => {
  let opnameHistory = [];
  let currentLine = '';
  let currentType = 'DAILY';
  let materialsForOpname = [];
  
  // Kamus State for Conversions
  let kamusOpnameData = [];
  let convMaterial = '';
  let showSisa = true;
  let showUtuh = false;
  let convRows = [{ kg: '', sachet: '' }];
  let utuhRows = [{ pcs: '' }];

  async function loadHistory() {
    opnameHistory = await PMCStore.getLineOpnames({ line: currentLine || undefined });
    renderHistory();
  }

  async function loadKamusOpname() {
    try {
      const res = await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/kamus-opname`);
      if (res.ok) kamusOpnameData = await res.json();
    } catch (err) { console.warn('Gagal memuat kamus opname', err); }
  }

  function render() {
    if (window.location.hash !== '#/produksi/opname') return;
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
        <h2 class="page-title">📋 Opname Stok Produksi (Line)</h2>
        <p class="page-subtitle">Stock check harian, mingguan, atau bulanan untuk lini produksi. Selisih akan otomatis dicatat sebagai mutasi penyesuaian.</p>
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
    TopbarComponent.render('/produksi/opname');
  }

  function renderForm() {
    const card = document.getElementById('opname-form-card');
    if (!card) return;

    const today = new Date().toISOString().split('T')[0];

    // Get available lines
    const linesSet = new Set();
    const ls = PMCStore.lineStock;
    if (ls && typeof ls === 'object') {
      Object.keys(ls).forEach(ln => linesSet.add(ln));
    }
    const schedules = Array.isArray(PMCStore.schedules) ? PMCStore.schedules : [];
    schedules.forEach(s => { if (s.line) linesSet.add(s.line); });
    const mappings = typeof PMCStore.getLinePerSku === 'function' ? PMCStore.getLinePerSku() : [];
    mappings.forEach(m => { if (m.line) linesSet.add(m.line); });
    const allLines = [...linesSet].sort();

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
          <label class="form-label">Line Produksi</label>
          <select id="opname-line" class="form-input">
            <option value="">-- Pilih Line --</option>
            ${allLines.map(l => `<option value="${l}" ${currentLine === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Tipe Opname</label>
          <select id="opname-type" class="form-input">
            <option value="DAILY" ${currentType === 'DAILY' ? 'selected' : ''}>Harian</option>
            <option value="WEEKLY" ${currentType === 'WEEKLY' ? 'selected' : ''}>Mingguan</option>
            <option value="MONTHLY" ${currentType === 'MONTHLY' ? 'selected' : ''}>Bulanan</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Diperiksa Oleh</label>
        <input type="text" id="opname-checked-by" class="form-input" placeholder="Nama pemeriksa...">
      </div>

      <div id="opname-conversion-container"></div>
      <div id="opname-materials-container" style="margin-bottom:var(--sp-4);">
        ${currentLine ? '' : '<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Pilih Line terlebih dahulu untuk memuat data material.</div>'}
      </div>

      <button id="btn-save-opname" class="btn btn-primary" style="width:100%; font-weight:bold;" ${!currentLine ? 'disabled' : ''}>
        💾 Simpan Opname & Sinkronkan Stok
      </button>
    `;

    // Line change -> load materials
    const lineEl = document.getElementById('opname-line');
    lineEl.addEventListener('change', (e) => {
      currentLine = e.target.value;
      if (currentLine) {
        loadMaterialsForLine(currentLine);
      }
    });

    document.getElementById('opname-type').addEventListener('change', (e) => {
      currentType = e.target.value;
    });

    if (currentLine) {
      loadMaterialsForLine(currentLine);
    }

    // Save button
    document.getElementById('btn-save-opname').addEventListener('click', handleSave);
  }

  function loadMaterialsForLine(line) {
    const ls = PMCStore.lineStock;
    const lineData = (ls && typeof ls === 'object') ? (ls[line] || {}) : {};
    materialsForOpname = Object.keys(lineData).map(matName => ({
      materialName: matName,
      qtyBook: parseFloat(String(lineData[matName].pcs || '0')),
      qtyPhysical: parseFloat(String(lineData[matName].pcs || '0'))
    }));

    // Reset conversion state
    convMaterial = '';
    showSisa = true;
    showUtuh = false;
    convRows = [{ kg: '', sachet: '' }];
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

    let trsSisa = '';
    convRows.forEach((row, i) => {
      trsSisa += `
        <tr>
          <td style="text-align:center;">${i+1}</td>
          <td><input type="number" step="any" class="form-input conv-kg" data-idx="${i}" value="${row.kg}" placeholder="Contoh: 2.5"></td>
          <td><input type="number" step="any" class="form-input conv-sachet" data-idx="${i}" value="${row.sachet}" placeholder="Contoh: 5"></td>
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
        <div style="margin-bottom:var(--sp-4); display:flex; gap:var(--sp-4); align-items:center; padding:var(--sp-2); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); width:fit-content;">
          <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:bold;">Mode Hitung:</span>
          <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
            <input type="checkbox" id="cb-sisa" ${showSisa ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--primary);">
            <strong style="color:var(--text-primary);">Totalan / Konversi Sisa</strong>
          </label>
          <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
            <input type="checkbox" id="cb-utuh" ${showUtuh ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--success);">
            <strong style="color:var(--text-primary);">Totalan Utuh (Pcs)</strong>
          </label>
        </div>
        ` : ''}
        
        <div id="conv-calc-area" style="${convMaterial ? 'display:block;' : 'display:none;'}">
          <div style="display:flex; flex-direction:column; gap:var(--sp-4); margin-bottom:var(--sp-4);">
            
            <!-- FORM SISA -->
            <div style="${showSisa ? 'display:block;' : 'display:none;'} background:var(--bg-main); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(108, 92, 231, 0.2);">
              <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border-color); padding-bottom:var(--sp-2);">Tabel Sisa</h5>
              <div style="margin-bottom:var(--sp-2); padding:var(--sp-2) var(--sp-3); background:#fff; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-secondary);" id="conv-kamus-info"></div>
              
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
                       <td id="conv-total-hasil" style="text-align:right; font-weight:bold; color:var(--primary-color);">0</td>
                       <td></td>
                     </tr>
                  </tfoot>
                </table>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-conv-add" style="width:100%;">➕ Tambah Baris Sisa</button>
            </div>

            <!-- FORM UTUH -->
            <div style="${showUtuh ? 'display:block;' : 'display:none;'} background:var(--bg-main); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(16, 185, 129, 0.2);">
              <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border-color); padding-bottom:var(--sp-2);">Tabel Utuh</h5>
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
                       <td id="utuh-total-hasil" style="text-align:left; font-weight:bold; color:var(--success-color);">0</td>
                       <td></td>
                     </tr>
                  </tfoot>
                </table>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-utuh-add" style="width:100%;">➕ Tambah Baris Utuh</button>
            </div>

          </div>
          
          <div style="display:flex; flex-direction:column; gap:var(--sp-3); padding-top:var(--sp-3); border-top:2px dashed var(--border-color);">
             <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge badge-error" style="font-size:1.1rem; padding:8px 16px;">GRAND TOTAL FISIK (SISA + UTUH):</span>
                <span id="grand-total-hasil" style="font-size:1.5rem; font-weight:900; color:var(--text-primary);">0</span>
             </div>
             <button class="btn btn-primary" id="btn-grand-apply" style="padding:12px; font-weight:bold; font-size:1.05rem;">
               ⬇️ Terapkan Sub-Total Ke Kolom Stok Fisik Bawah
             </button>
          </div>
        </div>
      </div>
    `;

    // Events
    const materialSelect = document.getElementById('conv-material-select');
    if (materialSelect) {
      materialSelect.addEventListener('change', (e) => {
         convMaterial = e.target.value;
         convRows = [{ kg: '', sachet: '' }];
         utuhRows = [{ pcs: '' }];
         renderConversionTool();
      });
    }

    if (convMaterial) {
       document.getElementById('cb-sisa').addEventListener('change', (e) => {
         showSisa = e.target.checked;
         renderConversionTool();
       });
       document.getElementById('cb-utuh').addEventListener('change', (e) => {
         showUtuh = e.target.checked;
         renderConversionTool();
       });

       const kamus = kamusOpnameData.find(k => k.materialName === convMaterial);
       const infoEl = document.getElementById('conv-kamus-info');
       if (infoEl) {
         if (!kamus) {
            infoEl.innerHTML = `<span style="color:var(--danger-color);">⚠️ Material ini belum ada di Kamus Opname. Sisa tidak bisa dihitung.</span>`;
         } else {
            infoEl.innerHTML = `Berat Utuh = ${kamus.beratRollUtuh != null ? parseFloat(kamus.beratRollUtuh) : '-'}kg &nbsp;|&nbsp; Berat Core = ${kamus.beratCore != null ? parseFloat(kamus.beratCore) : '-'}kg`;
         }
       }

       // Calculations
       const calculateRowSisa = (idx) => {
          if (!kamus || !showSisa) return 0;
          const r = convRows[idx];
          const kgRaw = r.kg.toString().trim();
          const sachetRaw = r.sachet.toString().trim();
          
          const kg = kgRaw === '' ? 0 : parseFloat(kgRaw);
          const sachet = sachetRaw === '' ? 0 : parseFloat(sachetRaw);
          
          if (isNaN(kg) || isNaN(sachet)) {
             const el = document.getElementById(`conv-hasil-${idx}`);
             if(el) el.textContent = '0';
             return 0;
          }
          
          const wUtuh = parseFloat(kamus.beratRollUtuh) || 1; 
          const wCore = parseFloat(kamus.beratCore) || 0;
          
          let result = (kg - (sachet * wCore)) / wUtuh;
          result = Math.max(0, result); 
          
          const finalResult = Number(result.toFixed(2));
          const el = document.getElementById(`conv-hasil-${idx}`);
          if(el) el.textContent = finalResult.toLocaleString('id-ID', { maximumFractionDigits: 2 });
          return finalResult;
       };

       const calculateAll = () => {
          // Sisa
          let totalSisa = 0;
          if (showSisa) {
            convRows.forEach((r, i) => { totalSisa += calculateRowSisa(i); });
          }
          const elSisa = document.getElementById('conv-total-hasil');
          if (elSisa) elSisa.textContent = totalSisa.toLocaleString('id-ID', { maximumFractionDigits: 2 });

          // Utuh
          let totalUtuh = 0;
          if (showUtuh) {
            utuhRows.forEach((r) => {
              const val = r.pcs.toString().trim() === '' ? 0 : parseFloat(r.pcs);
              if (!isNaN(val)) totalUtuh += val;
            });
          }
          const elUtuh = document.getElementById('utuh-total-hasil');
          if (elUtuh) elUtuh.textContent = totalUtuh.toLocaleString('id-ID', { maximumFractionDigits: 2 });

          // Grand Total
          const grandTotal = totalSisa + totalUtuh;
          const elGrand = document.getElementById('grand-total-hasil');
          if (elGrand) elGrand.textContent = grandTotal.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Pcs';

          return grandTotal;
       };

       // Event bindings for Sisa
       wrapper.querySelectorAll('.conv-kg, .conv-sachet').forEach(el => {
          el.addEventListener('input', calculateAll);
          el.addEventListener('change', (e) => {
             const idx = parseInt(e.target.dataset.idx);
             if (e.target.classList.contains('conv-kg')) convRows[idx].kg = e.target.value;
             else convRows[idx].sachet = e.target.value;
          });
       });
       wrapper.querySelectorAll('.btn-conv-del').forEach(el => {
          el.addEventListener('click', (e) => {
             const idx = parseInt(e.currentTarget.dataset.idx);
             convRows.splice(idx, 1);
             renderConversionTool();
          });
       });
       const btnSisaAdd = document.getElementById('btn-conv-add');
       if (btnSisaAdd) {
         btnSisaAdd.addEventListener('click', () => {
            convRows.push({ kg: '', sachet: '' });
            renderConversionTool();
         });
       }

       // Event bindings for Utuh
       wrapper.querySelectorAll('.conv-utuh-pcs').forEach(el => {
          el.addEventListener('input', calculateAll);
          el.addEventListener('change', (e) => {
             const idx = parseInt(e.target.dataset.idx);
             utuhRows[idx].pcs = e.target.value;
          });
       });
       wrapper.querySelectorAll('.btn-utuh-del').forEach(el => {
          el.addEventListener('click', (e) => {
             const idx = parseInt(e.currentTarget.dataset.idx);
             utuhRows.splice(idx, 1);
             renderConversionTool();
          });
       });
       const btnUtuhAdd = document.getElementById('btn-utuh-add');
       if (btnUtuhAdd) {
         btnUtuhAdd.addEventListener('click', () => {
            utuhRows.push({ pcs: '' });
            renderConversionTool();
         });
       }

       // Apply Button
       const btnApply = document.getElementById('btn-grand-apply');
       if (btnApply) {
         btnApply.addEventListener('click', () => {
            const total = calculateAll();
            const matIdx = materialsForOpname.findIndex(m => m.materialName === convMaterial);
            if (matIdx !== -1) {
               materialsForOpname[matIdx].qtyPhysical = total;

               // Build calculator notes for audit trail
               let notes = '';
               if (showSisa && convRows.length > 0) {
                 const sisaParts = convRows.map((r, i) => {
                   const kg = r.kg.toString().trim() || '0';
                   const roll = r.sachet.toString().trim() || '0';
                   const hasilEl = document.getElementById(`conv-hasil-${i}`);
                   const hasil = hasilEl ? hasilEl.textContent : '?';
                   return `Baris${i+1}: ${kg}kg, ${roll}roll = ${hasil}pcs`;
                 });
                 notes += `[SISA] ${sisaParts.join(' | ')}`;
               }
               if (showUtuh && utuhRows.length > 0) {
                 const utuhParts = utuhRows.map((r, i) => {
                   const pcs = r.pcs.toString().trim() || '0';
                   return `Baris${i+1}: ${pcs}pcs`;
                 });
                 if (notes) notes += ' ++ ';
                 notes += `[UTUH] ${utuhParts.join(' | ')}`;
               }
               notes += ` => TOTAL: ${total}`;
               materialsForOpname[matIdx].calculatorNotes = notes;

               const inputEl = document.querySelector(`.opname-physical-input[data-idx="${matIdx}"]`);
               if (inputEl) {
                  inputEl.value = total;
                  inputEl.dispatchEvent(new Event('input', { bubbles: true })); 
               }
               ToastComponent.show(`Berhasil memasukkan total ${total.toLocaleString('id-ID', { maximumFractionDigits: 2 })} pcs ke Stok Fisik tabel bawah!`, 'success');
            }
         });
       }

       calculateAll(); // Initial calculation trigger
    }
  }

  function renderMaterialsTable() {
    const container = document.getElementById('opname-materials-container');
    if (!container) return;

    if (materialsForOpname.length === 0) {
      container.innerHTML = `<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Tidak ada stok material di line ini.</div>`;
      return;
    }

    let html = `
      <div style="margin-bottom:var(--sp-2);"><strong>Material di Line ${currentLine}:</strong></div>
      <table class="data-table" style="font-size:0.85rem;">
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:right; width:100px;">Stok Buku</th>
            <th style="text-align:right; width:120px;">Stok Fisik</th>
            <th style="text-align:right; width:100px;">Selisih</th>
          </tr>
        </thead>
        <tbody>
    `;

    materialsForOpname.forEach((m, idx) => {
      const delta = m.qtyPhysical - m.qtyBook;
      const deltaColor = delta > 0 ? 'color:#00e676;' : delta < 0 ? 'color:#ff3d71;' : 'color:var(--text-muted);';
      const deltaText = delta > 0 ? `+${delta.toLocaleString('id-ID')}` : delta.toLocaleString('id-ID');

      html += `
        <tr>
          <td style="font-weight:600;">${m.materialName}</td>
          <td style="text-align:right; font-family:monospace;">${m.qtyBook.toLocaleString('id-ID')}</td>
          <td style="text-align:right;">
            <input type="number" class="form-input opname-physical-input" data-idx="${idx}" value="${m.qtyPhysical}" style="width:100px; text-align:right; padding:4px 8px; font-size:0.85rem;">
          </td>
          <td style="text-align:right; font-weight:bold; ${deltaColor}" id="delta-${idx}">${deltaText}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    // Attach change listeners for physical inputs
    container.querySelectorAll('.opname-physical-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const val = parseFloat(e.target.value) || 0;
        materialsForOpname[idx].qtyPhysical = val;

        const delta = val - materialsForOpname[idx].qtyBook;
        const deltaEl = document.getElementById(`delta-${idx}`);
        if (deltaEl) {
          deltaEl.textContent = delta > 0 ? `+${delta.toLocaleString('id-ID')}` : delta.toLocaleString('id-ID');
          deltaEl.style.color = delta > 0 ? '#00e676' : delta < 0 ? '#ff3d71' : 'var(--text-muted)';
        }
      });
    });
  }

  async function handleSave() {
    const date = document.getElementById('opname-date').value;
    const line = currentLine;
    const type = currentType;
    const checkedBy = document.getElementById('opname-checked-by').value;

    if (!date || !line) {
      ToastComponent.show('Pilih tanggal dan line terlebih dahulu.', 'warning');
      return;
    }

    if (materialsForOpname.length === 0) {
      ToastComponent.show('Tidak ada material untuk diopname.', 'warning');
      return;
    }

    const btn = document.getElementById('btn-save-opname');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    const payload = {
      date,
      type,
      line,
      checkedBy: checkedBy || undefined,
      items: materialsForOpname.map(m => ({
        materialName: m.materialName,
        qtyBook: m.qtyBook,
        qtyPhysical: m.qtyPhysical,
        calculatorNotes: m.calculatorNotes || null
      }))
    };

    const res = await PMCStore.saveLineOpname(payload);

    btn.disabled = false;
    btn.textContent = '💾 Simpan Opname & Sinkronkan Stok';

    if (res.success) {
      ToastComponent.show(`Opname ${type} berhasil disimpan! Stok line telah disinkronkan.`, 'success');
      // Reload materials to reflect new stock
      loadMaterialsForLine(line);
      loadHistory();
    } else {
      ToastComponent.show('Gagal: ' + res.message, 'danger');
    }
  }

  function renderHistory() {
    const container = document.getElementById('opname-history-container');
    if (!container) return;

    if (opnameHistory.length === 0) {
      container.innerHTML = `<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Belum ada riwayat opname.</div>`;
      return;
    }

    let html = `
      <table class="data-table" style="font-size:0.85rem;">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tipe</th>
            <th>Line</th>
            <th>Diperiksa</th>
            <th>Items</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;

    opnameHistory.forEach(op => {
      const dateStr = op.date ? op.date.split('T')[0] : '-';
      const typeLabel = op.type === 'DAILY' ? '📅 Harian' : op.type === 'WEEKLY' ? '📆 Mingguan' : '🗓️ Bulanan';
      const typeBadge = op.type === 'DAILY' ? 'badge-accent' : op.type === 'WEEKLY' ? 'badge-warning' : 'badge-success';
      const itemsCount = op.items ? op.items.length : 0;
      const hasDiscrepancy = op.items ? op.items.some(i => Math.abs(parseFloat(i.delta)) > 0.0001) : false;

      html += `
        <tr>
          <td>${dateStr}</td>
          <td><span class="badge ${typeBadge}">${typeLabel}</span></td>
          <td><span class="badge badge-accent">${op.line}</span></td>
          <td>${op.checkedBy || '-'}</td>
          <td>${itemsCount} material ${hasDiscrepancy ? '⚠️' : '✅'}</td>
          <td>
            <button class="btn btn-sm btn-secondary view-opname-btn" data-opname-id="${op.id}" data-items='${JSON.stringify(op.items || [])}' style="font-size:12px; padding:4px 8px;">Detail</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    // Attach detail button events
    container.querySelectorAll('.view-opname-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const items = JSON.parse(e.target.getAttribute('data-items'));
        const opnameId = e.target.getAttribute('data-opname-id');
        showDetailModal(items, opnameId);
      });
    });
  }

  function showDetailModal(items, opnameId) {
    let tbody = '';
    items.forEach((it, idx) => {
      const book = parseFloat(it.qtyBook);
      const phys = parseFloat(it.qtyPhysical);
      const delta = parseFloat(it.delta);
      const deltaColor = delta > 0 ? 'color:#00e676;' : delta < 0 ? 'color:#ff3d71;' : '';
      const hasNotes = it.calculatorNotes && it.calculatorNotes.trim();
      tbody += `<tr>
        <td>${it.materialName}</td>
        <td style="text-align:right;">${book.toLocaleString('id-ID')}</td>
        <td style="text-align:right;">
          <input type="number" step="any" class="form-input edit-phys-input" data-idx="${idx}" data-item-id="${it.id}" value="${phys}" style="width:100px; text-align:right; font-size:0.85rem; padding:4px 6px;">
        </td>
        <td style="text-align:right; font-weight:bold; ${deltaColor}" id="edit-delta-${idx}">${delta > 0 ? '+' : ''}${delta.toLocaleString('id-ID')}</td>
        <td style="text-align:center;">
          <button class="btn btn-sm btn-primary btn-edit-save" data-idx="${idx}" data-item-id="${it.id}" style="font-size:11px; padding:3px 8px;" title="Simpan koreksi untuk material ini">💾</button>
        </td>
      </tr>`;
      if (hasNotes) {
        tbody += `<tr>
          <td colspan="5" style="padding:4px 8px 12px 16px; border-top:none;">
            <div style="background:rgba(108,92,231,0.08); border-left:3px solid rgba(108,92,231,0.5); padding:6px 10px; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.78rem; color:var(--text-secondary);">
              <strong>📝 Riwayat Input:</strong><br>
              ${it.calculatorNotes.replace(/\[SISA\]/g, '<span style="color:#6c5ce7;font-weight:bold;">[SISA]</span>').replace(/\[UTUH\]/g, '<span style="color:#10b981;font-weight:bold;">[UTUH]</span>').replace(/\[EDIT/g, '<br><span style="color:#ff6b6b;font-weight:bold;">[EDIT</span>').replace(/=>/g, '→')}
            </div>
          </td>
        </tr>`;
      }
    });

    const modalHtml = `
      <div id="opname-detail-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div style="background:#1a1d2e; padding:var(--sp-5); border-radius:var(--radius-lg); width:90%; max-width:750px; max-height:80vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1);">
          <h3 style="margin-bottom:var(--sp-3);">📋 Detail Opname (Audit)</h3>
          <table class="data-table" style="margin-bottom:var(--sp-4); font-size:0.85rem;">
            <thead><tr><th>Material</th><th style="text-align:right;">Buku</th><th style="text-align:right;">Fisik</th><th style="text-align:right;">Selisih</th><th style="width:50px; text-align:center;">Edit</th></tr></thead>
            <tbody>${tbody}</tbody>
          </table>
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label" style="font-size:0.8rem;">Nama Editor / Auditor (untuk catatan koreksi)</label>
            <input class="form-input" id="edit-auditor-name" placeholder="Contoh: Pak Budi" style="max-width:300px;">
          </div>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:var(--sp-3);">ℹ️ Ubah angka Fisik lalu klik 💾 untuk menyimpan koreksi. Perubahan akan langsung tersinkronisasi ke stok Line.</p>
          <button id="close-opname-modal" class="btn btn-secondary" style="width:100%;">Tutup</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Live delta recalculation
    document.querySelectorAll('.edit-phys-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const newPhys = parseFloat(e.target.value) || 0;
        const book = parseFloat(items[idx].qtyBook);
        const newDelta = newPhys - book;
        const deltaEl = document.getElementById(`edit-delta-${idx}`);
        if (deltaEl) {
          deltaEl.textContent = (newDelta > 0 ? '+' : '') + newDelta.toLocaleString('id-ID');
          deltaEl.style.color = newDelta > 0 ? '#00e676' : newDelta < 0 ? '#ff3d71' : 'var(--text-muted)';
        }
      });
    });

    // Save individual item edit
    document.querySelectorAll('.btn-edit-save').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        const itemId = e.currentTarget.dataset.itemId;
        const inputEl = document.querySelector(`.edit-phys-input[data-idx="${idx}"]`);
        const newVal = parseFloat(inputEl.value);
        const auditorName = document.getElementById('edit-auditor-name').value.trim() || 'Auditor';
        
        if (isNaN(newVal)) {
          ToastComponent.show('Angka fisik tidak valid.', 'warning');
          return;
        }

        e.currentTarget.disabled = true;
        e.currentTarget.textContent = '⏳';
        
        const res = await PMCStore.updateOpnameItem(opnameId, itemId, newVal, auditorName);
        
        if (res.success) {
          ToastComponent.show(`✅ Koreksi berhasil disimpan untuk ${items[idx].materialName}!`, 'success');
          e.currentTarget.textContent = '✔️';
          // Reload history to reflect changes
          loadHistory();
        } else {
          ToastComponent.show('Gagal: ' + (res.message || 'Unknown error'), 'danger');
          e.currentTarget.disabled = false;
          e.currentTarget.textContent = '💾';
        }
      });
    });

    document.getElementById('close-opname-modal').addEventListener('click', () => {
      document.getElementById('opname-detail-modal').remove();
    });
  }

  // ── Event Listeners for Store Updates ──
  PMCStore.on('linePerSkuChanged', () => { if (window.location.hash === '#/produksi/opname' && !currentLine) renderForm(); });
  PMCStore.on('stockChanged', () => { if (window.location.hash === '#/produksi/opname' && !currentLine) renderForm(); });
  PMCStore.on('layoutChanged', () => { if (window.location.hash === '#/produksi/opname' && !currentLine) renderForm(); });
  PMCStore.on('scheduleChanged', () => { if (window.location.hash === '#/produksi/opname' && !currentLine) renderForm(); });

  return { render };
})();

window.ProduksiOpnamePage = ProduksiOpnamePage;
export default ProduksiOpnamePage;
