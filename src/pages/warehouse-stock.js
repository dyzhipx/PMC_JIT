/* ===== Warehouse Stock (WMS) Page ===== */
const WarehouseStockPage = (() => {
  let fMaterial = '';
  let fSupplier = '';
  let fBarcode = '';
  let selectedIds = new Set();

  function render() {
    if (window.location.hash !== '#/warehouse/stock') return;
    
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    let page = document.getElementById('warehouse-stock-page');
    const isNewPage = !page;

    if (isNewPage) {
      page = document.createElement('div');
      page.id = 'warehouse-stock-page';
      page.className = 'page-content';
      container.replaceChildren(page);
    }

    // Header
    if (isNewPage) {
      TopbarComponent.render('/warehouse/stock');
      const header = document.createElement('div');
      header.className = 'page-header';
      header.innerHTML = `
        <div>
          <h2 class="page-title">📦 Stok Utama Gudang (WMS)</h2>
          <p class="page-subtitle">Pencatatan kedatangan inventaris gudang secara FIFO berdasarkan kemasan supplier.</p>
        </div>
        <button id="btn-add-stock" class="btn btn-primary">+ Terima Stok Baru</button>
      `;
      page.appendChild(header);

      const pendingContainer = document.createElement('div');
      pendingContainer.id = 'ws-pending-container';
      pendingContainer.style.marginBottom = 'var(--sp-6)';
      page.appendChild(pendingContainer);

      const statsRow = document.createElement('div');
      statsRow.className = 'dashboard-grid';
      statsRow.id = 'ws-stats-row';
      page.appendChild(statsRow);

      const summarySection = document.createElement('div');
      summarySection.className = 'section';
      summarySection.id = 'ws-summary-section';
      summarySection.style.marginTop = 'var(--sp-6)';
      page.appendChild(summarySection);

      const tableSection = document.createElement('div');
      tableSection.className = 'section';
      tableSection.id = 'ws-table-section';
      tableSection.style.marginTop = 'var(--sp-6)';
      page.appendChild(tableSection);
    }

    // ── Pending Verifications ──
    const pendingContainer = document.getElementById('ws-pending-container');
    if (pendingContainer) renderPendingVerifications(pendingContainer);

    const wStock = PMCStore.getWarehouseStock();
    const filteredStock = wStock.filter(row => {
      const matMatch = row.material.toLowerCase().includes(fMaterial.toLowerCase());
      const supMatch = row.supplier.toLowerCase().includes(fSupplier.toLowerCase());
      const barcodeList = (row.barcodes ? row.barcodes.join(' ') : '') + ' ' + (row.barcodeStart || '') + ' ' + (row.barcodeEnd || '');
      const barMatch = barcodeList.toLowerCase().includes(fBarcode.toLowerCase());
      return matMatch && supMatch && barMatch;
    });

    // Cleanup selectedIds
    const validIds = new Set(filteredStock.map(w => w.id));
    const newSelected = new Set();
    selectedIds.forEach(id => { if (validIds.has(id)) newSelected.add(id); });
    selectedIds = newSelected;

    // Summary calculation
    const summaryMap = {};
    wStock.forEach(w => {
      if (!summaryMap[w.material]) summaryMap[w.material] = { pallets: 0, pcs: 0 };
      summaryMap[w.material].pallets += w.palletsAvailable;
      summaryMap[w.material].pcs += (w.palletsAvailable * w.qtyPerPallet);
    });

    const matCount = Object.keys(summaryMap).length;
    const totalPallet = wStock.reduce((s, w) => s + w.palletsAvailable, 0);

    // Update Stats
    const statsRow = document.getElementById('ws-stats-row');
    if (statsRow) {
      statsRow.replaceChildren(
        StatCardComponent.create({ label: 'Total Batch Aktif', value: wStock.length, icon: '🏷️', color: 'rgba(108,92,231,0.12)', noAnim: !isNewPage }),
        StatCardComponent.create({ label: 'Material Tersedia', value: matCount, icon: '📦', color: 'rgba(0,184,148,0.12)', noAnim: !isNewPage }),
        StatCardComponent.create({ label: 'Total Pallet', value: totalPallet, icon: '📋', color: 'rgba(253,203,110,0.12)', noAnim: !isNewPage })
      );
    }

    // Update Summary
    const summarySection = document.getElementById('ws-summary-section');
    if (summarySection) {
      if (matCount === 0) {
        summarySection.innerHTML = '';
      } else {
        summarySection.innerHTML = `
          <h3 style="margin-bottom:var(--sp-4); color:var(--text-primary); font-size:var(--fs-md); display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">📊</span> Summary per Material
          </h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:var(--sp-4);">
            ${Object.keys(summaryMap).sort().map(mat => `
              <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:var(--sp-4); box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                <div style="font-weight:700; color:var(--primary-color); font-size:var(--fs-base); margin-bottom:8px;">${mat}</div>
                <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm); margin-bottom:4px;">
                  <span style="color:var(--text-secondary);">Total Stok:</span>
                  <span style="font-weight:700; color:var(--text-primary);">${PMCStore.formatNumber(summaryMap[mat].pcs)} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">pcs</span></span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm);">
                  <span style="color:var(--text-secondary);">Jumlah Pallet:</span>
                  <span style="font-weight:700; color:var(--text-primary);">${summaryMap[mat].pallets} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">plt</span></span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    // Update Table
    const tableSection = document.getElementById('ws-table-section');
    if (tableSection) {
      if (wStock.length === 0) {
        tableSection.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada stok fisik terdaftar di gudang. Klik "+ Terima Stok Baru" untuk memulai.</div></div>`;
      } else {
        tableSection.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4);">
            <h3 style="margin:0; font-size:var(--fs-md); color:var(--text-primary);">Daftar Detail Stok WMS</h3>
            <div>
              <button id="btn-delete-selected" class="btn btn-danger btn-sm" style="display:${selectedIds.size > 0 ? 'inline-block' : 'none'}; transition:all 0.2s;">
                <span style="margin-right:4px;">🗑️</span> Hapus Terpilih (<span id="delete-count">${selectedIds.size}</span>)
              </button>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;"><input type="checkbox" id="chk-selectAll" ${selectedIds.size === filteredStock.length && filteredStock.length > 0 ? 'checked' : ''} style="cursor:pointer; accent-color:var(--primary-color);" /></th>
                <th>No MID</th>
                <th>No Barcode</th>
                <th>Tgl & Jam Masuk (FIFO)</th>
                <th>Material</th>
                <th>Supplier</th>
                <th style="text-align:right">Qty/Pallet</th>
                <th style="text-align:right">Sisa Pallet</th>
                <th style="text-align:center">Aksi</th>
              </tr>
              <tr style="background: rgba(108, 92, 231, 0.05);">
                <th></th>
                <th></th>
                <th><input type="text" id="flt-barcode" value="${fBarcode}" placeholder="Cari barcode..." class="form-control" style="padding:4px; font-size:11px; height:24px; min-width:80px; width:100%;"></th>
                <th></th>
                <th><input type="text" id="flt-mat" value="${fMaterial}" placeholder="Cari material..." class="form-control" style="padding:4px; font-size:11px; height:24px; min-width:80px; width:100%;"></th>
                <th><input type="text" id="flt-sup" value="${fSupplier}" placeholder="Cari supplier..." class="form-control" style="padding:4px; font-size:11px; height:24px; min-width:80px; width:100%;"></th>
                <th colspan="3"></th>
              </tr>
            </thead>
            <tbody>
              ${filteredStock.length === 0 ? '<tr><td colspan="9" style="text-align:center; padding:var(--sp-4); color:var(--text-secondary);">Data tidak ditemukan dengan filter yang dipilih.</td></tr>' : ''}
              ${filteredStock.map(row => {
                const isChecked = selectedIds.has(row.id);
                const barcodeDisplay = row.barcodeStart && row.barcodeEnd
                  ? `<span style="font-family:monospace;font-size:var(--fs-xs);background:rgba(108,92,231,0.10);padding:2px 6px;border-radius:4px;">${row.barcodeStart === row.barcodeEnd ? row.barcodeStart : row.barcodeStart + ' - ' + row.barcodeEnd}</span>`
                  : '<span style="color:var(--text-muted)">-</span>';
                const midDisplay = row.mid ? `<span style="font-family:monospace;font-size:var(--fs-xs)">${row.mid}</span>` : '<span style="color:var(--text-muted)">-</span>';
                const timeDisplay = row.timeIn ? ` <span style="color:var(--text-secondary);font-size:var(--fs-xs)">${PMCStore.formatTime(row.timeIn)}</span>` : '';
                return `
                  <tr>
                    <td style="text-align:center;"><input type="checkbox" class="chk-row" data-id="${row.id}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:var(--primary-color);" /></td>
                    <td>${midDisplay}</td>
                    <td>${barcodeDisplay}</td>
                    <td>${PMCStore.formatDate(row.dateIn)}${timeDisplay}</td>
                    <td><strong>${row.material}</strong></td>
                    <td>${row.supplier}</td>
                    <td style="text-align:right"><strong>${row.qtyPerPallet}</strong></td>
                    <td style="text-align:right"><span class="badge ${row.palletsAvailable > 0 ? 'badge-primary' : 'badge-danger'}">${row.palletsAvailable} Plt</span></td>
                    <td style="text-align:center; display:flex; gap:4px; justify-content:center;">
                      <button class="btn btn-secondary btn-sm" data-bc="${row.barcodeStart || ''}" data-bc-end="${row.barcodeEnd || ''}" data-mid="${row.mid || ''}" data-qty="${row.qtyPerPallet || ''}" data-mat="${row.material || ''}" data-date="${row.dateIn || ''}" onclick="if(window.BarcodePrinter) { window.BarcodePrinter.showModal({barcodeStart: this.dataset.bc, barcodeEnd: this.dataset.bcEnd, mid: this.dataset.mid, qty: this.dataset.qty, materialName: this.dataset.mat, dateIn: this.dataset.date}); } else { alert('BarcodePrinter not loaded'); }">Print</button>
                      <button class="btn btn-danger btn-sm action-del-btn" data-del-id="${row.id}">Hapus</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }
    }

    // Event listeners for Add Button & Filters
    document.getElementById('btn-add-stock')?.addEventListener('click', showAddModal);

    if (wStock.length > 0) {
      setTimeout(() => {
        // Single delete binding
        document.querySelectorAll('.action-del-btn').forEach(btn => {
          btn.addEventListener('click', () => delStock(btn.getAttribute('data-del-id')));
        });
        
        document.querySelectorAll('.action-print-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            if (window.BarcodePrinter) {
              window.BarcodePrinter.showModal({
                barcode: e.target.dataset.bc,
                mid: e.target.dataset.mid,
                qty: e.target.dataset.qty,
                materialName: e.target.dataset.mat,
                dateIn: e.target.dataset.date
              });
            }
          });
        });

        // Filter bindings
        const bindFilter = (id, setter) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener('input', (e) => {
              setter(e.target.value);
              render(); 
            });
          }
        };

        const wireFilter = (id, setter) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener('input', e => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            setter(e.target.value);
            render();
            setTimeout(() => {
              const newEl = document.getElementById(id);
              if (newEl) {
                newEl.focus();
                newEl.setSelectionRange(start, end);
              }
            }, 10);
          });
          el.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              render();
            }
          });
        };
        wireFilter('flt-barcode', v => fBarcode = v);
        wireFilter('flt-mat', v => fMaterial = v);
        wireFilter('flt-sup', v => fSupplier = v);

        // Checkbox bindings
        const chkAll = document.getElementById('chk-selectAll');
        const chkRows = document.querySelectorAll('.chk-row');
        const btnBulkDel = document.getElementById('btn-delete-selected');
        const delCountSpan = document.getElementById('delete-count');

        const updateBulkDeleteBtn = () => {
          if (btnBulkDel && delCountSpan) {
            if (selectedIds.size > 0) {
              btnBulkDel.style.display = 'inline-block';
              delCountSpan.textContent = selectedIds.size;
            } else {
              btnBulkDel.style.display = 'none';
            }
          }
        };

        if (chkAll) {
          chkAll.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            chkRows.forEach(cb => {
              cb.checked = isChecked;
              const id = cb.getAttribute('data-id');
              if (isChecked) selectedIds.add(id);
              else selectedIds.delete(id);
            });
            updateBulkDeleteBtn();
          });
        }

        chkRows.forEach(cb => {
          cb.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const id = e.target.getAttribute('data-id');
            if (isChecked) selectedIds.add(id); else selectedIds.delete(id);
            if (chkAll) {
                let checkCount = 0;
                chkRows.forEach(el => { if (el.checked) checkCount++; });
                chkAll.checked = (checkCount === chkRows.length && chkRows.length > 0);
            }
            updateBulkDeleteBtn();
          });
        });

        updateBulkDeleteBtn();

        if (btnBulkDel) {
          btnBulkDel.addEventListener('click', () => {
            if (confirm(`Yakin ingin menghapus ${selectedIds.size} rekam stok yang dipilih?`)) {
              deleteSelectedStock();
            }
          });
        }

      }, 50);
    }

    // Event hooks
    PMCStore.off('warehouseStockChanged', render);
    PMCStore.on('warehouseStockChanged', render);
    PMCStore.off('outboundPendingChanged', render);
    PMCStore.on('outboundPendingChanged', render);
  }

  function showAddModal() {
    // ── Kategori SKU options ──
    const categories = new Set();
    PMCStore.skuList.forEach(sku => {
      if (sku.category) categories.add(sku.category);
    });
    let catOptions = '<option value="">-- Semua Kategori --</option>';
    Array.from(categories).sort().forEach(c => { catOptions += `<option value="${c}">${c}</option>`; });

    // ── Material options ──
    let matOptions = '<option value="">-- Pilih Material --</option>';
    const mats = new Set();
    PMCStore.bomData.forEach(b => b.components.forEach(c => mats.add(c.name)));
    Array.from(mats).sort().forEach(m => { matOptions += `<option value="${m}">${m}</option>`; });

    // ── Supplier options from Master Supplier ──
    let supplierOptions = '<option value="">-- Pilih Supplier --</option>';
    PMCStore.supplierList.forEach(s => {
      supplierOptions += `<option value="${s.name}">${s.code} - ${s.name}</option>`;
    });

    const today = new Date().toISOString().split('T')[0];

    const formHtml = `
      <div class="form-group">
        <label class="form-label">Tanggal Masuk (FIFO)</label>
        <input type="date" id="form-ws-date" class="form-control" value="${today}" required />
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Barang tertua akan dialokasikan lebih dulu untuk produksi. Jam masuk akan dicatat otomatis.</div>
      </div>
      <div class="form-group">
        <label class="form-label">Filter Kategori SKU</label>
        <select id="form-ws-cat" class="form-control">${catOptions}</select>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Opsional: Filter daftar material berdasarkan kategori SKU asal.</div>
      </div>
      <div class="form-group">
        <label class="form-label">Material</label>
        <select id="form-ws-mat" class="form-control" required>${matOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Supplier</label>
        <div style="position:relative;">
          <input type="text" id="form-ws-supp-search" class="form-control" placeholder="Ketik untuk mencari supplier..." autocomplete="off" />
          <select id="form-ws-supp" class="form-control" style="margin-top:4px;" required>${supplierOptions}</select>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Pilih supplier dari Master Supplier, atau ketik untuk filter.</div>
      </div>

      <div class="form-group">
        <label class="form-label">Mode Satuan Penerimaan</label>
        <div id="unit-mode-selector" style="display:flex;gap:8px;margin-bottom:8px;">
          <label style="display:flex;align-items:center;gap:6px;padding:8px 16px;border:2px solid var(--primary-color);border-radius:var(--radius-sm);cursor:pointer;background:rgba(108,92,231,0.08);font-weight:600;font-size:var(--fs-sm);">
            <input type="radio" name="unitMode" value="pallet" checked style="accent-color:var(--primary-color);" />
            📦 Satuan / Pallet
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:8px 16px;border:2px solid var(--border-color);border-radius:var(--radius-sm);cursor:pointer;font-size:var(--fs-sm);">
            <input type="radio" name="unitMode" value="truk" style="accent-color:var(--primary-color);" />
            🚛 Per Truk
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Kapasitas Qty per Pallet</label>
        <input type="number" id="form-ws-qty" class="form-control" min="1" placeholder="Contoh: 1000" required />
      </div>
      <div class="form-group">
        <label class="form-label">Jumlah Pallet Diterima</label>
        <input type="number" id="form-ws-pallets" class="form-control" min="1" required />
      </div>

      <div id="truk-total-section" style="display:none;padding:12px;background:rgba(0,184,148,0.08);border:1px solid rgba(0,184,148,0.3);border-radius:var(--radius-sm);margin-bottom:12px;">
        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">📊 Total Qty Diterima (Otomatis)</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--primary-color);" id="truk-total-display">0 pcs</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">= Qty per Pallet × Jumlah Pallet</div>
      </div>

      <div id="barcode-preview-section" style="padding:12px;background:rgba(108,92,231,0.06);border:1px solid rgba(108,92,231,0.2);border-radius:var(--radius-sm);margin-bottom:8px;">
        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">🏷️ Preview Barcode</div>
        <div style="font-family:monospace;font-size:1.1rem;font-weight:700;color:var(--primary-color);" id="barcode-preview-display">Masukkan jumlah pallet untuk melihat preview barcode</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Barcode otomatis di-generate berurutan per pallet.</div>
      </div>
    `;

    ModalComponent.open({
      title: 'Terima Stok Baru (Inbound Eksternal)',
      body: formHtml,
      saveText: 'Simpan',
      onSave: () => {
        const dateIn = document.getElementById('form-ws-date').value;
        const material = document.getElementById('form-ws-mat').value;
        const supplier = document.getElementById('form-ws-supp').value.trim();
        const qtyPerPallet = parseInt(document.getElementById('form-ws-qty').value);
        const palletsAvailable = parseInt(document.getElementById('form-ws-pallets').value);
        const unitMode = document.querySelector('input[name="unitMode"]:checked')?.value || 'pallet';

        if (!dateIn || !material || !supplier || isNaN(qtyPerPallet) || isNaN(palletsAvailable)) {
          ToastComponent.show('Harap isi semua kolom dengan benar', 'error');
          return;
        }

        PMCStore.addWarehouseStock({ dateIn, material, supplier, qtyPerPallet, palletsAvailable, unitMode });
        ToastComponent.show('Stok berhasil didaftarkan ke WMS', 'success');
        ModalComponent.close();
        render(); // Optimistic update trigger
      }
    });

    // ── Wire up interactive behaviors after modal opens ──
    setTimeout(() => {
      // ── Kategori SKU filter logic ──
      const catSelect = document.getElementById('form-ws-cat');
      const matSelect = document.getElementById('form-ws-mat');
      if (catSelect && matSelect) {
        catSelect.addEventListener('change', () => {
          const selectedCat = catSelect.value;
          let matsToShow = new Set();
          if (selectedCat) {
            const matchingSkus = PMCStore.skuList.filter(s => s.category === selectedCat).map(s => s.id);
            PMCStore.bomData.forEach(bom => {
              if (matchingSkus.includes(bom.skuId)) {
                bom.components.forEach(comp => matsToShow.add(comp.name));
              }
            });
          } else {
            PMCStore.bomData.forEach(bom => bom.components.forEach(comp => matsToShow.add(comp.name)));
          }
          let newMatOptions = '<option value="">-- Pilih Material --</option>';
          Array.from(matsToShow).sort().forEach(m => { newMatOptions += `<option value="${m}">${m}</option>`; });
          matSelect.innerHTML = newMatOptions;
        });
      }

      // Supplier search/filter
      const searchInput = document.getElementById('form-ws-supp-search');
      const selectEl = document.getElementById('form-ws-supp');
      if (searchInput && selectEl) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.toLowerCase();
          const opts = selectEl.querySelectorAll('option');
          opts.forEach(opt => {
            if (!opt.value) { opt.style.display = ''; return; }
            const text = opt.textContent.toLowerCase();
            opt.style.display = text.includes(q) ? '' : 'none';
          });
          // Auto-select if only one match
          const visible = Array.from(opts).filter(o => o.value && o.style.display !== 'none');
          if (visible.length === 1) {
            selectEl.value = visible[0].value;
          }
        });
      }

      // Unit mode radio styling & logic
      const radios = document.querySelectorAll('input[name="unitMode"]');
      const trukSection = document.getElementById('truk-total-section');
      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          // Update label styling
          radios.forEach(r => {
            const lbl = r.closest('label');
            if (r.checked) {
              lbl.style.borderColor = 'var(--primary-color)';
              lbl.style.background = 'rgba(108,92,231,0.08)';
              lbl.style.fontWeight = '600';
            } else {
              lbl.style.borderColor = 'var(--border-color)';
              lbl.style.background = 'transparent';
              lbl.style.fontWeight = '400';
            }
          });
          // Show/hide total display for Per Truk
          if (radio.value === 'truk' && radio.checked) {
            trukSection.style.display = 'block';
            updateTrukTotal();
          } else if (radio.value === 'pallet' && radio.checked) {
            trukSection.style.display = 'none';
          }
        });
      });

      // Auto-calc total for Per Truk mode
      const qtyInput = document.getElementById('form-ws-qty');
      const palletInput = document.getElementById('form-ws-pallets');

      function updateTrukTotal() {
        const qty = parseInt(qtyInput.value) || 0;
        const pallets = parseInt(palletInput.value) || 0;
        const total = qty * pallets;
        const totalDisplay = document.getElementById('truk-total-display');
        if (totalDisplay) {
          totalDisplay.textContent = PMCStore.formatNumber(total) + ' pcs';
        }
      }

      function updateBarcodePreview() {
        const pallets = parseInt(palletInput.value) || 0;
        const previewEl = document.getElementById('barcode-preview-display');
        if (!previewEl) return;
        if (pallets <= 0) {
          previewEl.textContent = 'Masukkan jumlah pallet untuk melihat preview barcode';
          previewEl.style.color = 'var(--text-muted)';
          return;
        }
        // Preview: show what barcodes WILL be generated (peek without consuming)
        const nextStart = (PMCStore._barcodeCounterPeek || 0) + 1;
        const nextEnd = nextStart + pallets - 1;
        previewEl.textContent = String(nextStart).padStart(5, '0') + ' — ' + String(nextEnd).padStart(5, '0') + '  (' + pallets + ' barcode)';
        previewEl.style.color = 'var(--primary-color)';
      }

      if (qtyInput) {
        qtyInput.addEventListener('input', () => { updateTrukTotal(); });
      }
      if (palletInput) {
        palletInput.addEventListener('input', () => { updateTrukTotal(); updateBarcodePreview(); });
      }

      // Initial barcode preview
      updateBarcodePreview();
    }, 100);
  }

  function delStock(id) {
    if (confirm('Yakin ingin menghapus rekam stok (batch) ini?')) {
      PMCStore.deleteWarehouseStock(id);
      ToastComponent.show('Stok berhasil dihapus', 'success');
      // The store emits warehouseStockChanged on delete which will trigger render()
    }
  }

  function deleteSelectedStock() {
    ToastComponent.show(`Sedang menghapus ${selectedIds.size} baris stok...`, 'info');
    Array.from(selectedIds).forEach(id => {
      PMCStore.deleteWarehouseStock(id); // Fire all
    });
    selectedIds.clear();
  }

  function renderPendingVerifications(container) {
    const pendings = PMCStore.transitOutboundPending.filter(p => p.destination === '3P1');
    
    if (pendings.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-bottom: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          <span style="font-size:1.2rem;">📥</span> Terdapat ${pendings.length} Antrean Penerimaan dari Area Transit (Outbound ke Gudang Packing 3P1)
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu Pengiriman</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Qty (Pcs)</th>
              <th style="width: 200px; text-align: center;">Aksi Penerimaan</th>
            </tr>
          </thead>
          <tbody>
    `;

    pendings.forEach(p => {
      html += `
        <tr>
          <td>${p.date} ${p.time}</td>
          <td><strong>${p.barcode}</strong></td>
          <td>${p.material}</td>
          <td>${p.pcs}</td>
          <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm accept-btn" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem;">Terima Barang</button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem;">Tolak</button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Konfirmasi penerimaan barang ke Gudang Packing (WMS)?')) {
          const res = await PMCStore.verifyTransitOutbound(id, 'accept');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render(); // Refresh the list
        }
      });
    });

    container.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Tolak barang ini dan kembalikan truk ke Transit?')) {
          const res = await PMCStore.verifyTransitOutbound(id, 'reject');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render(); // Refresh the list
        }
      });
    });
  }

  return { render, delStock };
})();

window.WarehouseStockPage = WarehouseStockPage;
export default WarehouseStockPage;
