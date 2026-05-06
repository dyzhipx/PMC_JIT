/* ===== Master Kamus Opname Page ===== */
const MasterKamusOpnamePage = (() => {
  const API_BASE = `http://${window.location.hostname}:3000/api`;
  let kamusList = [];
  let searchQuery = '';
  let currentPage = 1;
  const perPage = 10;
  let selectedIds = new Set();

  // Excel import state
  let importedRows = [];
  let importErrors = [];

  async function loadData() {
    try {
      const res = await PMCStore.safeFetch(`${API_BASE}/master/kamus-opname`);
      if (res.ok) kamusList = await res.json();
    } catch (err) {
      console.error('Failed to load kamus opname:', err);
    }
    renderPage();
  }

  function render() {
    if (window.location.hash !== '#/master/kamus-opname') return;
    ChartWrapper.destroyAll();
    selectedIds.clear();
    importedRows = [];
    importErrors = [];
    loadData();
  }

  function renderPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // Add button in topbar
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = '+ Tambah Material';
    addBtn.addEventListener('click', () => openKamusModal());
    TopbarComponent.render('/master/kamus-opname', [addBtn]);

    // ═══════════════════════════════════════════
    //  IMPORT EXCEL SECTION
    // ═══════════════════════════════════════════
    const importSection = document.createElement('div');
    importSection.className = 'section';
    importSection.style.marginBottom = 'var(--sp-6)';

    const importHeader = document.createElement('div');
    importHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--sp-3);';
    importHeader.innerHTML = `
      <div style="display:flex; align-items:center; gap:var(--sp-3);">
        <span class="badge badge-accent" style="font-size:0.8rem; padding:4px 12px;">📥 Import</span>
        <span style="color:var(--text-secondary); font-size:var(--fs-sm);">Upload data Kamus Opname dari file Excel (.xlsx / .xls)</span>
      </div>
    `;
    importSection.appendChild(importHeader);

    // Drag & Drop zone
    importSection.appendChild(DragDropComponent.create({
      onFile: (data, fileName) => processExcelData(data, fileName)
    }));

    // Template hint
    const templateHint = document.createElement('div');
    templateHint.style.cssText = 'margin-top:var(--sp-3); padding:var(--sp-3) var(--sp-4); background:rgba(99,102,241,0.08); border-radius:var(--radius-md); border:1px dashed rgba(99,102,241,0.3);';
    templateHint.innerHTML = `
      <div style="display:flex; align-items:flex-start; gap:var(--sp-3);">
        <span style="font-size:1.2rem;">💡</span>
        <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
          <strong style="color:var(--text-primary);">Format Kolom Excel:</strong><br>
          File Excel harus memiliki header kolom sebagai berikut (urutan bebas):<br>
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">NAMA MATERIAL</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">KODE ORACLE</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">BERAT ROLL UTUH / SACHET</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">BERAT CORE/BOX</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">JUMLAH SACHET / ROLL</code>
          <br><button id="btn-download-template" class="btn btn-sm btn-secondary" style="margin-top:var(--sp-2); font-size:0.78rem; padding:4px 12px;">📄 Download Template Excel</button>
        </div>
      </div>
    `;
    importSection.appendChild(templateHint);

    page.appendChild(importSection);

    // ═══════════════════════════════════════════
    //  IMPORT PREVIEW TABLE (if data imported)
    // ═══════════════════════════════════════════
    if (importedRows.length > 0 || importErrors.length > 0) {
      const previewSection = document.createElement('div');
      previewSection.className = 'section';
      previewSection.style.marginBottom = 'var(--sp-6)';

      // Validation errors
      if (importErrors.length > 0) {
        const errPanel = document.createElement('div');
        errPanel.style.cssText = 'margin-bottom:var(--sp-4);';
        errPanel.innerHTML = `<div style="font-weight:700; margin-bottom:var(--sp-2); color:var(--warning);">⚠️ Peringatan Import (${importErrors.length})</div>`;
        importErrors.forEach(err => {
          const alert = document.createElement('div');
          alert.className = `alert alert-${err.type}`;
          alert.style.cssText = 'padding:var(--sp-2) var(--sp-3); margin-bottom:var(--sp-1); font-size:0.85rem;';
          alert.innerHTML = `<span>${err.type === 'error' ? '❌' : '⚠️'}</span> ${err.message}`;
          errPanel.appendChild(alert);
        });
        previewSection.appendChild(errPanel);
      }

      if (importedRows.length > 0) {
        const previewHeader = document.createElement('div');
        previewHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--sp-3);';
        previewHeader.innerHTML = `
          <div style="display:flex; align-items:center; gap:var(--sp-2);">
            <span style="font-size:1rem;">📋</span>
            <strong>Preview Data Import (${importedRows.length} baris)</strong>
          </div>
        `;

        const actionBtns = document.createElement('div');
        actionBtns.style.cssText = 'display:flex; gap:var(--sp-2);';

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn btn-secondary btn-sm';
        clearBtn.innerHTML = '✕ Batal Import';
        clearBtn.addEventListener('click', () => {
          importedRows = [];
          importErrors = [];
          renderPage();
        });
        actionBtns.appendChild(clearBtn);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary btn-sm';
        saveBtn.id = 'btn-save-import';
        saveBtn.innerHTML = `💾 Simpan ${importedRows.length} Data ke Database`;
        saveBtn.addEventListener('click', handleSaveImport);
        actionBtns.appendChild(saveBtn);

        previewHeader.appendChild(actionBtns);
        previewSection.appendChild(previewHeader);

        // Preview table
        const previewContainer = document.createElement('div');
        previewContainer.className = 'table-container';
        previewContainer.style.maxHeight = '400px';
        previewContainer.style.overflowY = 'auto';

        let previewHtml = `
          <table class="data-table" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">#</th>
                <th>Nama Material</th>
                <th>Kode Oracle</th>
                <th style="text-align:right;">Berat Roll Utuh / Sachet</th>
                <th style="text-align:right;">Berat Core / Box</th>
                <th style="text-align:right;">Jumlah Sachet / Roll</th>
                <th style="width:60px; text-align:center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
        `;

        importedRows.forEach((row, idx) => {
          previewHtml += `
            <tr>
              <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
              <td style="font-weight:600;">${row.materialName || '-'}</td>
              <td><span class="badge badge-accent">${row.oracleCode || '-'}</span></td>
              <td style="text-align:right; font-family:monospace;">${row.beratRollUtuh != null ? parseFloat(row.beratRollUtuh).toLocaleString('id-ID') : '-'}</td>
              <td style="text-align:right; font-family:monospace;">${row.beratCore != null ? parseFloat(row.beratCore).toLocaleString('id-ID') : '-'}</td>
              <td style="text-align:right; font-family:monospace;">${row.jumlahSachet != null ? row.jumlahSachet.toLocaleString('id-ID') : '-'}</td>
              <td style="text-align:center;">
                <button class="btn-icon sm btn-ghost btn-remove-import" data-idx="${idx}" title="Hapus baris">✕</button>
              </td>
            </tr>
          `;
        });

        previewHtml += `</tbody></table>`;
        previewContainer.innerHTML = previewHtml;
        previewSection.appendChild(previewContainer);
      }

      page.appendChild(previewSection);
    }

    // ═══════════════════════════════════════════
    //  DIVIDER
    // ═══════════════════════════════════════════
    const divider = document.createElement('div');
    divider.className = 'divider';
    divider.style.margin = 'var(--sp-2) 0';
    page.appendChild(divider);

    // ═══════════════════════════════════════════
    //  MAIN DATA TABLE
    // ═══════════════════════════════════════════

    // ── Toolbar ──
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const search = document.createElement('div');
    search.className = 'search-input';
    search.innerHTML = `<span class="icon">🔍</span>`;
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Cari material / kode oracle...';
    searchInput.value = searchQuery;
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderPage();
    });
    search.appendChild(searchInput);
    toolbar.appendChild(search);

    // Bulk delete button
    const bulkDeleteBtn = document.createElement('button');
    bulkDeleteBtn.className = 'btn btn-danger';
    bulkDeleteBtn.id = 'btn-bulk-delete';
    bulkDeleteBtn.innerHTML = '🗑 Hapus Terpilih';
    bulkDeleteBtn.style.display = 'none';
    bulkDeleteBtn.addEventListener('click', handleBulkDelete);
    toolbar.appendChild(bulkDeleteBtn);

    page.appendChild(toolbar);

    // ── Filtered Data ──
    let filtered = kamusList.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (item.materialName || '').toLowerCase().includes(q) ||
             (item.oracleCode || '').toLowerCase().includes(q);
    });

    const totalItems = filtered.length;
    const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    // ── Table Section ──
    const tableSection = document.createElement('div');
    tableSection.className = 'section';

    // Section header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.style.marginBottom = 'var(--sp-3)';
    sectionHeader.innerHTML = `<h3 class="section-title">📖 Data Kamus Opname (${totalItems} material)</h3>`;
    tableSection.appendChild(sectionHeader);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    const table = document.createElement('table');
    table.className = 'data-table';

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width:40px; text-align:center;">
          <input type="checkbox" id="select-all-kamus" title="Centang Semua" style="cursor:pointer; width:18px; height:18px; accent-color: var(--primary);" />
        </th>
        <th>Nama Material</th>
        <th>Kode Oracle</th>
        <th style="text-align:right;">Berat Roll Utuh / Sachet</th>
        <th style="text-align:right;">Berat Core / Box</th>
        <th style="text-align:right;">Jumlah Sachet / Roll</th>
        <th style="width:100px; text-align:center;">AKSI</th>
      </tr>
    `;
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    if (paged.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 7;
      td.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:var(--sp-2); color:var(--text-muted); padding:var(--sp-10);">
          <div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(255,255,255,0.1));">📭</div>
          <div style="font-size:var(--fs-xs); font-weight:700; letter-spacing:0.05em;">BELUM ADA DATA KAMUS OPNAME</div>
        </div>
      `;
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      paged.forEach(row => {
        const tr = document.createElement('tr');
        const isChecked = selectedIds.has(row.id);

        tr.innerHTML = `
          <td style="text-align:center;">
            <input type="checkbox" class="kamus-checkbox" data-id="${row.id}" ${isChecked ? 'checked' : ''} style="cursor:pointer; width:18px; height:18px; accent-color: var(--primary);" />
          </td>
          <td style="font-weight:600;">${row.materialName || '-'}</td>
          <td><span class="badge badge-accent">${row.oracleCode || '-'}</span></td>
          <td style="text-align:right; font-family:monospace;">${row.beratRollUtuh != null ? parseFloat(row.beratRollUtuh).toLocaleString('id-ID') : '-'}</td>
          <td style="text-align:right; font-family:monospace;">${row.beratCore != null ? parseFloat(row.beratCore).toLocaleString('id-ID') : '-'}</td>
          <td style="text-align:right; font-family:monospace;">${row.jumlahSachet != null ? row.jumlahSachet.toLocaleString('id-ID') : '-'}</td>
          <td style="text-align:center;">
            <div class="table-actions" style="justify-content:center;">
              <button class="btn-icon sm btn-ghost btn-edit-kamus" data-id="${row.id}" title="Edit">✏️</button>
              <button class="btn-icon sm btn-ghost btn-delete-kamus" data-id="${row.id}" title="Hapus">🗑</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tableSection.appendChild(tableContainer);
    page.appendChild(tableSection);

    // Pagination
    page.appendChild(PaginationComponent.create({
      totalItems, perPage, currentPage,
      onChange: (p) => { currentPage = p; renderPage(); }
    }));

    container.appendChild(page);

    // ═══════════════════════════════════════════
    //  EVENT LISTENERS (after DOM render)
    // ═══════════════════════════════════════════
    setTimeout(() => {
      // Download template button
      const dlBtn = document.getElementById('btn-download-template');
      if (dlBtn) dlBtn.addEventListener('click', downloadTemplate);

      // Select All checkbox
      const selectAllEl = document.getElementById('select-all-kamus');
      if (selectAllEl) {
        selectAllEl.addEventListener('change', (e) => {
          const checked = e.target.checked;
          document.querySelectorAll('.kamus-checkbox').forEach(cb => {
            cb.checked = checked;
            const id = cb.getAttribute('data-id');
            if (checked) selectedIds.add(id);
            else selectedIds.delete(id);
          });
          updateBulkButton();
        });
      }

      // Individual checkboxes
      document.querySelectorAll('.kamus-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const id = e.target.getAttribute('data-id');
          if (e.target.checked) selectedIds.add(id);
          else selectedIds.delete(id);
          const allCheckboxes = document.querySelectorAll('.kamus-checkbox');
          const allChecked = [...allCheckboxes].every(c => c.checked);
          const selectAll = document.getElementById('select-all-kamus');
          if (selectAll) selectAll.checked = allChecked;
          updateBulkButton();
        });
      });

      // Edit buttons
      document.querySelectorAll('.btn-edit-kamus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const item = kamusList.find(k => k.id === id);
          if (item) openKamusModal(item);
        });
      });

      // Delete buttons
      document.querySelectorAll('.btn-delete-kamus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const item = kamusList.find(k => k.id === id);
          if (item && confirm(`Hapus material "${item.materialName}" dari Kamus Opname?`)) {
            deleteItem(id);
          }
        });
      });

      // Remove import preview rows
      document.querySelectorAll('.btn-remove-import').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          importedRows.splice(idx, 1);
          renderPage();
        });
      });

      updateBulkButton();
    }, 0);
  }

  // ═══════════════════════════════════════════
  //  EXCEL PROCESSING
  // ═══════════════════════════════════════════
  function processExcelData(data, fileName) {
    importErrors = [];
    importedRows = [];

    if (!data || data.length === 0) {
      importErrors.push({ type: 'error', message: 'File tidak berisi data. Pastikan ada header dan baris data di sheet pertama.' });
      renderPage();
      return;
    }

    // Try to detect column headers (flexible matching)
    const sampleKeys = Object.keys(data[0] || {});
    const colMap = {
      materialName: findCol(sampleKeys, ['nama material', 'material', 'nama', 'material name', 'name']),
      oracleCode: findCol(sampleKeys, ['kode oracle', 'oracle code', 'oracle', 'kode', 'code']),
      beratRollUtuh: findCol(sampleKeys, ['berat roll utuh', 'berat roll', 'berat sachet', 'berat roll utuh / sachet', 'berat roll/sachet', 'roll utuh', 'sachet']),
      beratCore: findCol(sampleKeys, ['berat core', 'berat box', 'berat core/box', 'berat core / box', 'core', 'box']),
      jumlahSachet: findCol(sampleKeys, ['jumlah sachet', 'jumlah roll', 'jumlah sachet / roll', 'jumlah sachet/roll', 'sachet/roll', 'sachet / roll', 'qty sachet']),
    };

    if (!colMap.materialName) {
      importErrors.push({
        type: 'error',
        message: `Kolom "NAMA MATERIAL" tidak ditemukan. Header yang tersedia: ${sampleKeys.join(', ')}`
      });
      renderPage();
      return;
    }

    data.forEach((row, idx) => {
      const materialName = String(row[colMap.materialName] || '').trim();
      const oracleCode = colMap.oracleCode ? String(row[colMap.oracleCode] || '').trim() : '';
      const beratRollRaw = colMap.beratRollUtuh ? row[colMap.beratRollUtuh] : null;
      const beratCoreRaw = colMap.beratCore ? row[colMap.beratCore] : null;
      const jumlahSachetRaw = colMap.jumlahSachet ? row[colMap.jumlahSachet] : null;

      if (!materialName) {
        importErrors.push({ type: 'warning', message: `Baris ${idx + 1}: Nama Material kosong, baris dilewati.` });
        return;
      }

      const beratRollUtuh = beratRollRaw != null && beratRollRaw !== '' ? parseFloat(beratRollRaw) : null;
      const beratCore = beratCoreRaw != null && beratCoreRaw !== '' ? parseFloat(beratCoreRaw) : null;
      const jumlahSachet = jumlahSachetRaw != null && jumlahSachetRaw !== '' ? parseInt(jumlahSachetRaw, 10) : null;

      if (beratRollUtuh !== null && isNaN(beratRollUtuh)) {
        importErrors.push({ type: 'warning', message: `Baris ${idx + 1}: Berat Roll Utuh "${beratRollRaw}" bukan angka valid.` });
      }
      if (beratCore !== null && isNaN(beratCore)) {
        importErrors.push({ type: 'warning', message: `Baris ${idx + 1}: Berat Core "${beratCoreRaw}" bukan angka valid.` });
      }

      importedRows.push({
        materialName,
        oracleCode: oracleCode || null,
        beratRollUtuh: (beratRollUtuh !== null && !isNaN(beratRollUtuh)) ? beratRollUtuh : null,
        beratCore: (beratCore !== null && !isNaN(beratCore)) ? beratCore : null,
        jumlahSachet: (jumlahSachet !== null && !isNaN(jumlahSachet)) ? jumlahSachet : null,
      });
    });

    if (importedRows.length === 0) {
      importErrors.push({ type: 'error', message: 'Tidak ada data valid yang ditemukan di file.' });
    }

    renderPage();
  }

  function findCol(keys, candidates) {
    for (const key of keys) {
      const lower = key.toLowerCase().trim();
      for (const c of candidates) {
        if (lower === c || lower.includes(c)) return key;
      }
    }
    return null;
  }

  async function handleSaveImport() {
    if (importedRows.length === 0) return;

    const saveBtn = document.getElementById('btn-save-import');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Menyimpan...';
    }

    let successCount = 0;
    let failCount = 0;

    // Send all rows in parallel batches of 5
    const batchSize = 5;
    for (let i = 0; i < importedRows.length; i += batchSize) {
      const batch = importedRows.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(row =>
          PMCStore.safeFetch(`${API_BASE}/master/kamus-opname`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
          })
        )
      );
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.ok) successCount++;
        else failCount++;
      });
    }

    importedRows = [];
    importErrors = [];

    if (failCount > 0) {
      ToastComponent.show(`${successCount} data berhasil disimpan, ${failCount} gagal.`, 'warning');
    } else {
      ToastComponent.show(`✅ ${successCount} data berhasil diimport ke Kamus Opname!`, 'success');
    }

    await loadData();
  }

  function downloadTemplate() {
    // Generate a simple Excel template using SheetJS
    try {
      const templateData = [
        {
          'NAMA MATERIAL': 'Contoh: FILM OPP ABC 250G',
          'KODE ORACLE': 'MAT-001',
          'BERAT ROLL UTUH / SACHET': 1500,
          'BERAT CORE/BOX': 250,
          'JUMLAH SACHET / ROLL': 12
        },
        {
          'NAMA MATERIAL': 'Contoh: KARTON BOX ABC 10x12',
          'KODE ORACLE': 'MAT-002',
          'BERAT ROLL UTUH / SACHET': '',
          'BERAT CORE/BOX': 350,
          'JUMLAH SACHET / ROLL': ''
        },
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      // Set column widths
      ws['!cols'] = [
        { wch: 35 }, // NAMA MATERIAL
        { wch: 16 }, // KODE ORACLE
        { wch: 26 }, // BERAT ROLL UTUH / SACHET
        { wch: 18 }, // BERAT CORE/BOX
        { wch: 24 }, // JUMLAH SACHET / ROLL
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kamus Opname');
      XLSX.writeFile(wb, 'Template_Kamus_Opname.xlsx');
      ToastComponent.show('Template Excel berhasil didownload.', 'success');
    } catch (err) {
      ToastComponent.show('Gagal generate template: ' + err.message, 'danger');
    }
  }

  // ═══════════════════════════════════════════
  //  CRUD HELPERS
  // ═══════════════════════════════════════════
  function updateBulkButton() {
    const btn = document.getElementById('btn-bulk-delete');
    if (btn) {
      if (selectedIds.size > 0) {
        btn.style.display = 'inline-flex';
        btn.innerHTML = `🗑 Hapus Terpilih (${selectedIds.size})`;
      } else {
        btn.style.display = 'none';
      }
    }
  }

  async function deleteItem(id) {
    try {
      const res = await PMCStore.safeFetch(`${API_BASE}/master/kamus-opname/${id}`, { method: 'DELETE' });
      if (res.ok) {
        ToastComponent.show('Material berhasil dihapus dari Kamus Opname.', 'success');
        selectedIds.delete(id);
        await loadData();
      } else {
        ToastComponent.show('Gagal menghapus material.', 'danger');
      }
    } catch (err) {
      ToastComponent.show('Error: ' + err.message, 'danger');
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Hapus ${selectedIds.size} material yang dipilih dari Kamus Opname?`)) return;

    try {
      const res = await PMCStore.safeFetch(`${API_BASE}/master/kamus-opname/delete-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds] })
      });
      if (res.ok) {
        const data = await res.json();
        ToastComponent.show(data.message || `${selectedIds.size} material berhasil dihapus.`, 'success');
        selectedIds.clear();
        await loadData();
      } else {
        ToastComponent.show('Gagal menghapus data.', 'danger');
      }
    } catch (err) {
      ToastComponent.show('Error: ' + err.message, 'danger');
    }
  }

  function openKamusModal(existing) {
    const isEdit = !!existing;
    const form = document.createElement('div');
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label">Nama Material</label>
        <input class="form-input" id="kamus-material-name" value="${existing?.materialName || ''}" placeholder="Contoh: FILM OPP ABC 250G" />
      </div>
      <div class="form-group">
        <label class="form-label">Kode Oracle</label>
        <input class="form-input" id="kamus-oracle-code" value="${existing?.oracleCode || ''}" placeholder="Contoh: MAT-001" />
      </div>
      <div class="form-group">
        <label class="form-label">Berat Roll Utuh / Sachet (kg)</label>
        <input class="form-input" id="kamus-berat-roll" type="number" step="0.0001" value="${existing?.beratRollUtuh != null ? parseFloat(existing.beratRollUtuh) : ''}" placeholder="Contoh: 1.5" />
      </div>
      <div class="form-group">
        <label class="form-label">Berat Core / Box (kg)</label>
        <input class="form-input" id="kamus-berat-core" type="number" step="0.0001" value="${existing?.beratCore != null ? parseFloat(existing.beratCore) : ''}" placeholder="Contoh: 0.25" />
      </div>
      <div class="form-group">
        <label class="form-label">Jumlah Sachet / Roll</label>
        <input class="form-input" id="kamus-jumlah-sachet" type="number" step="1" value="${existing?.jumlahSachet || ''}" placeholder="Contoh: 12" />
      </div>
    `;

    ModalComponent.open({
      title: isEdit ? '✏️ Edit Kamus Opname' : '➕ Tambah Material Kamus Opname',
      body: form,
      onSave: async () => {
        const materialName = document.getElementById('kamus-material-name').value.trim();
        const oracleCode = document.getElementById('kamus-oracle-code').value.trim();
        const beratRollVal = document.getElementById('kamus-berat-roll').value;
        const beratCoreVal = document.getElementById('kamus-berat-core').value;
        const jumlahSachetVal = document.getElementById('kamus-jumlah-sachet').value;

        if (!materialName) {
          ToastComponent.show('Nama Material wajib diisi.', 'error');
          return;
        }

        const payload = {
          materialName,
          oracleCode: oracleCode || null,
          beratRollUtuh: beratRollVal ? parseFloat(beratRollVal) : null,
          beratCore: beratCoreVal ? parseFloat(beratCoreVal) : null,
          jumlahSachet: jumlahSachetVal ? parseInt(jumlahSachetVal, 10) : null,
        };

        try {
          let res;
          if (isEdit) {
            res = await PMCStore.safeFetch(`${API_BASE}/master/kamus-opname/${existing.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            ToastComponent.show('Memperbarui data Kamus Opname...', 'info');
          } else {
            res = await PMCStore.safeFetch(`${API_BASE}/master/kamus-opname`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            ToastComponent.show('Menyimpan material baru ke Kamus Opname...', 'info');
          }

          if (res.ok) {
            ToastComponent.show(isEdit ? 'Data berhasil diperbarui!' : 'Material berhasil ditambahkan!', 'success');
            ModalComponent.close();
            await loadData();
          } else {
            const errData = await res.json().catch(() => ({}));
            ToastComponent.show('Gagal: ' + (errData.message || 'Server error'), 'danger');
          }
        } catch (err) {
          ToastComponent.show('Error: ' + err.message, 'danger');
        }
      }
    });
  }

  return { render };
})();

window.MasterKamusOpnamePage = MasterKamusOpnamePage;
export default MasterKamusOpnamePage;
