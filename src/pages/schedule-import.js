/* ===== Schedule Import Page (Step 1) ===== */
const ScheduleImportPage = (() => {
  let importedRows = [];
  let validationErrors = [];
  let selectedDate = new Date().toISOString().split('T')[0];

  function render() {
    if (window.location.hash !== '#/schedule') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    TopbarComponent.render('/schedule');

    // ── Step indicator ──
    const stepBadge = document.createElement('div');
    stepBadge.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:20px;';
    stepBadge.innerHTML = `
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Step 1</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Upload jadwal produksi dan validasi data</span>
    `;
    page.appendChild(stepBadge);

    // ── Drag & Drop ──
    const dropSection = document.createElement('div');
    dropSection.className = 'section';
    dropSection.appendChild(DragDropComponent.create({
      onFile: (data, fileName) => processExcelData(data, fileName)
    }));
    page.appendChild(dropSection);

    // ── Manual Input ──
    const divText = document.createElement('div');
    divText.className = 'divider-text';
    divText.textContent = 'Atau Input Manual';
    page.appendChild(divText);

    const manualRow = document.createElement('div');
    manualRow.className = 'import-manual-row';
    manualRow.innerHTML = `
      <div class="form-group">
        <label class="form-label">Tanggal</label>
        <input class="form-input" type="date" id="manual-date" value="${selectedDate}" />
      </div>
      <div class="form-group">
        <label class="form-label">Line</label>
        <select class="form-input" id="manual-line">
          ${Array.from({length: 25}, (_, i) => String.fromCharCode(65 + i)).map(l => `<option>${l}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">SKU</label>
        <select class="form-input" id="manual-sku">
          ${PMCStore.skuList.map(s => `<option value="${s.id}">${s.code} — ${s.name}</option>`).join('')}
        </select>
      </div>
    `;
    page.appendChild(manualRow);

    const shiftRow = document.createElement('div');
    shiftRow.className = 'import-manual-row';
    shiftRow.innerHTML = `
      <div class="form-group">
        <label class="form-label">Target SH1</label>
        <input class="form-input" type="number" id="manual-sh1" placeholder="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Target SH2</label>
        <input class="form-input" type="number" id="manual-sh2" placeholder="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Target SH3</label>
        <input class="form-input" type="number" id="manual-sh3" placeholder="0" />
      </div>
      <div class="form-group" style="display:flex;align-items:flex-end;">
        <button class="btn btn-secondary" id="manual-add-btn">+ Tambah</button>
      </div>
    `;
    page.appendChild(shiftRow);

    // ── Validation Alerts ──
    if (validationErrors.length > 0) {
      const valPanel = document.createElement('div');
      valPanel.className = 'validation-panel section';
      valPanel.innerHTML = `<div class="validation-panel-header">⚠️ Validation Alerts (${validationErrors.length})</div>`;
      validationErrors.forEach(err => {
        const alert = document.createElement('div');
        alert.className = `alert alert-${err.type}`;
        alert.innerHTML = `<span class="alert-icon">${err.type === 'error' ? '❌' : '⚠️'}</span><span>${err.message}</span>`;
        valPanel.appendChild(alert);
      });
      page.appendChild(valPanel);
    }

    // ── Current Schedule Data (Mapping Table) ──
    const existingSchedules = PMCStore.schedules.filter(s => {
      return true; // show all for now
    });

    if (existingSchedules.length > 0 || importedRows.length > 0) {
      const tableSection = document.createElement('div');
      tableSection.className = 'section';
      const tableHeader = document.createElement('div');
      tableHeader.className = 'section-header';
      tableHeader.innerHTML = `<h3 class="section-title">📊 Mapping Table Preview</h3>`;
      tableSection.appendChild(tableHeader);

      const tableActions = document.createElement('div');
      tableActions.style.display = 'flex';
      tableActions.style.gap = '12px';
      tableActions.style.alignItems = 'center';
      tableActions.style.marginBottom = 'var(--sp-4)';
      
      const selectAllLabel = document.createElement('label');
      selectAllLabel.style.display = 'flex';
      selectAllLabel.style.alignItems = 'center';
      selectAllLabel.style.gap = '6px';
      selectAllLabel.style.cursor = 'pointer';
      selectAllLabel.style.fontWeight = '600';
      selectAllLabel.innerHTML = `<input type="checkbox" id="select-all-cb" /> Pilih Semua`;
      
      const bulkDeleteBtn = document.createElement('button');
      bulkDeleteBtn.className = 'btn btn-danger btn-sm';
      bulkDeleteBtn.id = 'bulk-delete-btn';
      bulkDeleteBtn.innerHTML = '🗑️ Hapus Terpilih';
      
      tableActions.appendChild(selectAllLabel);
      tableActions.appendChild(bulkDeleteBtn);
      
      tableSection.appendChild(tableActions);

      const displayData = importedRows.length > 0 ? importedRows : existingSchedules;

      tableSection.appendChild(DataTableComponent.create({
        columns: [
          { key: '_idx', label: '', width: '40px', align: 'center', render: (v, row, idx) => `<input type="checkbox" class="row-cb" data-idx="${idx}" />` },
          { key: 'date', label: 'Tanggal', render: v => PMCStore.formatDate(v) },
          { key: 'line', label: 'Line' },
          { key: 'skuId', label: 'SKU', render: (v) => {
            const sku = PMCStore.getSKU(v);
            return sku ? `${sku.code}` : `<span style="color:var(--danger)">${v} ⚠️</span>`;
          }},
          { key: 'sh1', label: 'SH1', align: 'right', editable: true, type: 'number' },
          { key: 'sh2', label: 'SH2', align: 'right', editable: true, type: 'number' },
          { key: 'sh3', label: 'SH3', align: 'right', editable: true, type: 'number' },
          { key: 'total', label: 'Total', align: 'right',
            render: (v, row) => `<strong>${PMCStore.formatNumber((row.sh1 || 0) + (row.sh2 || 0) + (row.sh3 || 0))}</strong>` },
        ],
        data: displayData,
        editable: true,
        onCellEdit: (rowIdx, field, value) => {
          if (importedRows.length > 0) {
            importedRows[rowIdx][field] = value;
          } else {
            PMCStore.updateScheduleCell(rowIdx, field, value);
          }
          render();
        },
        footer: displayData.length > 0 ? [
          { value: 'TOTAL', colspan: 4 },
          { value: PMCStore.formatNumber(displayData.reduce((s, r) => s + (r.sh1 || 0), 0)), align: 'right' },
          { value: PMCStore.formatNumber(displayData.reduce((s, r) => s + (r.sh2 || 0), 0)), align: 'right' },
          { value: PMCStore.formatNumber(displayData.reduce((s, r) => s + (r.sh3 || 0), 0)), align: 'right' },
          { value: PMCStore.formatNumber(displayData.reduce((s, r) => s + (r.sh1 || 0) + (r.sh2 || 0) + (r.sh3 || 0), 0)), align: 'right' },
        ] : undefined,
        actions: [
          {
            label: 'Hapus',
            icon: '🗑️',
            onClick: (row, rowIdx) => {
              if (confirm('Yakin ingin menghapus jadwal ini?')) {
                if (importedRows.length > 0) {
                  importedRows.splice(rowIdx, 1);
                } else if (row.id) {
                  PMCStore.deleteSchedule(row.id);
                } else {
                  PMCStore.deleteSchedule(rowIdx);
                }
                ToastComponent.show('Jadwal berhasil dihapus', 'success');
                render();
              }
            }
          }
        ]
      }));
      page.appendChild(tableSection);

      // Attach bulk action listeners after rendering
      setTimeout(() => {
        const selectAllCb = document.getElementById('select-all-cb');
        if (selectAllCb) {
          selectAllCb.addEventListener('change', (e) => {
            document.querySelectorAll('.row-cb').forEach(cb => cb.checked = e.target.checked);
          });
        }
        
        const bDelBtn = document.getElementById('bulk-delete-btn');
        if (bDelBtn) {
          bDelBtn.addEventListener('click', () => {
            const checked = Array.from(document.querySelectorAll('.row-cb:checked'));
            if (checked.length === 0) {
              ToastComponent.show('Pilih minimal 1 data', 'warning');
              return;
            }
            if (confirm(`Yakin ingin menghapus ${checked.length} data terpilih?`)) {
              if (importedRows.length > 0) {
                const indices = checked.map(cb => parseInt(cb.getAttribute('data-idx'))).sort((a,b) => b-a);
                indices.forEach(idx => importedRows.splice(idx, 1));
              } else {
                checked.forEach(cb => {
                   const idx = parseInt(cb.getAttribute('data-idx'));
                   const row = existingSchedules[idx];
                   if (row && row.id) PMCStore.deleteSchedule(row.id);
                   else PMCStore.deleteSchedule(idx);
                });
              }
              ToastComponent.show(`${checked.length} data dihapus`, 'success');
              render();
            }
          });
        }
      }, 50);
    }

    // ── Action Bar ──
    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';
    actionBar.innerHTML = `<div></div>`;
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary btn-lg';
    nextBtn.innerHTML = 'Simpan & Lanjut ke Step 2 →';
    nextBtn.addEventListener('click', () => {
      if (importedRows.length > 0) {
        PMCStore.addSchedules(importedRows);
        importedRows = [];
        ToastComponent.show('Data berhasil disimpan!', 'success');
      }
      window.location.hash = '/summary';
    });
    actionBar.appendChild(nextBtn);
    page.appendChild(actionBar);

    container.appendChild(page);

    // Manual add handler
    setTimeout(() => {
      const addBtn = document.getElementById('manual-add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const date = document.getElementById('manual-date').value;
          const line = document.getElementById('manual-line').value;
          const skuId = document.getElementById('manual-sku').value;
          const sh1 = parseInt(document.getElementById('manual-sh1').value) || 0;
          const sh2 = parseInt(document.getElementById('manual-sh2').value) || 0;
          const sh3 = parseInt(document.getElementById('manual-sh3').value) || 0;
          if (!date || !skuId) { ToastComponent.show('Tanggal dan SKU wajib diisi', 'error'); return; }
          PMCStore.addSchedules([{ date, line, skuId, sh1, sh2, sh3, status: 'pending' }]);
          ToastComponent.show('Data berhasil ditambahkan', 'success');
          render();
        });
      }
    }, 50);
  }

  function processExcelData(data) {
    validationErrors = [];
    importedRows = [];

    data.forEach((row, idx) => {
      const date = row.Tanggal || row.Date || row.date || selectedDate;
      const line = row.Line || row.line || 'A';
      const skuId = row.SKU || row.sku || row['Oracle Code'] || '';
      const sh1 = parseInt(row.SH1 || row.sh1 || 0);
      const sh2 = parseInt(row.SH2 || row.sh2 || 0);
      const sh3 = parseInt(row.SH3 || row.sh3 || 0);

      // Validations
      if (!skuId) {
        validationErrors.push({ type: 'warning', message: `Row ${idx + 1}: Kolom SKU kosong` });
        return;
      }
      if (!PMCStore.getSKU(skuId)) {
        validationErrors.push({ type: 'error', message: `Row ${idx + 1}: SKU "${skuId}" tidak ditemukan di Master Data` });
      }
      if (sh1 === 0 && sh2 === 0 && sh3 === 0) {
        validationErrors.push({ type: 'warning', message: `Row ${idx + 1}: Semua target shift kosong` });
      }

      importedRows.push({ date: String(date), line, skuId, sh1, sh2, sh3, status: 'pending' });
    });

    render();
  }

  return { render };
})();

window.ScheduleImportPage = ScheduleImportPage;
export default ScheduleImportPage;
