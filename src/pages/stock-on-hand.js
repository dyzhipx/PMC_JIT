/* ===== Transit Stock On Hand Page — Premium WMS Style ===== */
const StockOnHandTransitPage = (() => {
  let fBarcode = '';
  let fMid = '';
  let fMaterial = '';
  let fSupplier = '';
  let fBlok = '';
  let fDateTransit = '';
  let selectedIds = new Set();

  function render() {
    if (window.location.hash !== '#/transit/stock-on-hand') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    let page = document.getElementById('stock-on-hand-page');
    const isNewPage = !page;

    if (isNewPage) {
      page = document.createElement('div');
      page.id = 'stock-on-hand-page';
      page.className = 'page-content';
      container.replaceChildren(page);
    }

    // ── Data ──
    const tInv = Array.isArray(PMCStore.transitInventory) ? PMCStore.transitInventory : [];
    const bLayout = PMCStore.getBlockLayout();
    
    // Build summary
    const invSummaryPallets = {};
    const invSummaryPcs = {};
    tInv.forEach(row => {
      const mat = row.material || row.materialName;
      if (!mat) return;
      invSummaryPallets[mat] = (invSummaryPallets[mat] || 0) + (row.palletsAvailable || 0);
      const pQty = PMCStore.getPalletQty(mat) || 1;
      const rowPcs = (row.pcs !== undefined && row.pcs !== null && parseFloat(row.pcs) > 0) ? parseFloat(row.pcs) : (row.palletsAvailable || 0) * pQty;
      invSummaryPcs[mat] = (invSummaryPcs[mat] || 0) + rowPcs;
    });

    const summaryMap = invSummaryPallets;
    const matCount = Object.keys(summaryMap).length;
    let totalPallets = 0;
    for (const mat in summaryMap) totalPallets += summaryMap[mat];

    // Build enhancedInv for filtering
    const enhancedInv = tInv.map(row => {
      let bText = '-';
      const block = bLayout.find(b => b.id === row.blockId || (row.rowId && b.rows.some(r => r.id === row.rowId)));
      if (block) {
        const r = block.rows.find(rx => rx.id === row.rowId);
        if (r) bText = `B${block.blockNumber !== undefined ? block.blockNumber : block.id}.${r.rowNumber !== undefined ? r.rowNumber : r.id}`;
      }
      return { ...row, _blockText: bText };
    });

    const filtered = enhancedInv.filter(row => {
      const bc = (row.barcode || '').toLowerCase();
      const rowMid = (row.mid || '').toLowerCase();
      const mat = (row.material || '');
      const sup = (row.supplier || '');
      return bc.includes(fBarcode.toLowerCase())
        && rowMid.includes(fMid.toLowerCase())
        && (fMaterial === '' || mat === fMaterial)
        && (fSupplier === '' || sup === fSupplier)
        && (fBlok === '' || row._blockText === fBlok)
        && (fDateTransit === '' || row.dateInTransit === fDateTransit);
    });

    // ── Render / Update UI ──
    if (isNewPage) {
      TopbarComponent.render('/transit/stock-on-hand');
      
      const header = document.createElement('div');
      header.className = 'page-header';
      header.innerHTML = `
        <div>
          <h2 class="page-title">📦 Stock On Hand (Area Transit)</h2>
          <p class="page-subtitle">Pantau & kelola stok material yang tersedia di area transit secara FIFO.</p>
        </div>
        <button id="btn-delete-all-transit" class="btn btn-danger" style="gap:6px;">
          <span>🗑️</span> Hapus Semua Stok Transit
        </button>
      `;
      page.appendChild(header);

      const statsRow = document.createElement('div');
      statsRow.className = 'dashboard-grid';
      statsRow.id = 'transit-stats-row';
      page.appendChild(statsRow);

      const summarySection = document.createElement('div');
      summarySection.className = 'section';
      summarySection.id = 'transit-summary-section';
      summarySection.style.marginTop = 'var(--sp-6)';
      page.appendChild(summarySection);

      const tableSection = document.createElement('div');
      tableSection.className = 'section';
      tableSection.id = 'transit-table-section';
      tableSection.style.marginTop = 'var(--sp-6)';
      page.appendChild(tableSection);
    }

    // Update Stats
    const statsRow = document.getElementById('transit-stats-row');
    if (statsRow) {
      statsRow.replaceChildren(
        StatCardComponent.create({ label: 'Total Batch Aktif', value: tInv.length, icon: '🏷️', color: 'rgba(108,92,231,0.12)', noAnim: !isNewPage }),
        StatCardComponent.create({ label: 'Material Tersedia', value: matCount, icon: '📦', color: 'rgba(0,184,148,0.12)', noAnim: !isNewPage }),
        StatCardComponent.create({ label: 'Total Pallet (Transit)', value: totalPallets, icon: '📋', color: 'rgba(253,203,110,0.12)', noAnim: !isNewPage })
      );
    }

    // Update Summary
    const summarySection = document.getElementById('transit-summary-section');
    if (summarySection) {
      if (matCount === 0) {
        summarySection.innerHTML = '';
      } else {
        summarySection.innerHTML = `
          <h3 style="margin-bottom:var(--sp-4); color:var(--text-primary); font-size:var(--fs-md); display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">📊</span> Summary per Material
          </h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:var(--sp-4);">
            ${Object.keys(summaryMap).sort().map(mat => {
              const pallets = summaryMap[mat];
              const pcs = invSummaryPcs[mat] || 0;
              const uom = PMCStore.getMaterialUOM(mat);
              return `
                <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:var(--sp-4); box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                  <div style="font-weight:700; color:var(--primary-color); font-size:var(--fs-base); margin-bottom:8px;">${mat}</div>
                  <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm); margin-bottom:4px;">
                    <span style="color:var(--text-secondary);">Total Stok:</span>
                    <span style="font-weight:700; color:var(--text-primary);">${PMCStore.formatNumber(pcs)} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">${uom}</span></span>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm);">
                    <span style="color:var(--text-secondary);">Jumlah Pallet:</span>
                    <span style="font-weight:700; color:var(--text-primary);">${pallets} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">plt</span></span>
                  </div>
                </div>`;
            }).join('')}
          </div>
        `;
      }
    }

    // Update Table
    const tableSection = document.getElementById('transit-table-section');
    if (tableSection) {
      if (tInv.length === 0) {
        tableSection.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Area transit saat ini kosong. Belum ada stok material yang tersedia.</div></div>`;
      } else {
        const uniqueMaterials = [...new Set(enhancedInv.map(r => r.material).filter(Boolean))].sort();
        const uniqueSuppliers = [...new Set(enhancedInv.map(r => r.supplier).filter(Boolean).filter(s => s !== '-'))].sort();
        const uniqueBloks = [...new Set(enhancedInv.map(r => r._blockText).filter(Boolean).filter(b => b !== '-'))].sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
        const uniqueDates = [...new Set(enhancedInv.map(r => r.dateInTransit).filter(Boolean))].sort((a, b) => b.localeCompare(a));

        const matOptions = uniqueMaterials.map(m => `<option value="${m}" ${fMaterial === m ? 'selected' : ''}>${m}</option>`).join('');
        const supOptions = uniqueSuppliers.map(s => `<option value="${s}" ${fSupplier === s ? 'selected' : ''}>${s}</option>`).join('');
        const blokOptions = uniqueBloks.map(b => `<option value="${b}" ${fBlok === b ? 'selected' : ''}>${b}</option>`).join('');

        tableSection.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4);">
            <h3 style="margin:0; font-size:var(--fs-md); color:var(--text-primary);">📋 Detail Inventori Transit (FIFO)</h3>
            <div>
              <button id="btn-delete-selected-transit" class="btn btn-danger btn-sm" style="display:${selectedIds.size > 0 ? 'inline-block' : 'none'}; transition:all 0.2s;">
                <span style="margin-right:4px;">🗑️</span> Hapus Terpilih (<span id="transit-delete-count">${selectedIds.size}</span>)
              </button>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px; text-align:center;"><input type="checkbox" id="chk-transit-all" ${filtered.length > 0 && filtered.every(r => selectedIds.has(r.id)) ? 'checked' : ''} style="cursor:pointer; accent-color:var(--primary-color);" /></th>
                <th>No Barcode</th>
                <th>No MID</th>
                <th>Tgl FIFO (Gudang)</th>
                <th>Tgl Masuk Transit</th>
                <th>Blok</th>
                <th>Material</th>
                <th>Supplier</th>
                <th style="text-align:right">Sisa Qty</th>
                <th style="text-align:center">Aksi</th>
              </tr>
              <tr style="background:rgba(108,92,231,0.05);">
                <th></th>
                <th><input type="text" id="flt-tr-barcode" value="${fBarcode}" placeholder="Cari barcode..." class="form-control" style="padding:4px;font-size:11px;height:24px;width:100%;"></th>
                <th><input type="text" id="flt-tr-mid" value="${fMid}" placeholder="Cari MID..." class="form-control" style="padding:4px;font-size:11px;height:24px;width:100%;"></th>
                <th></th>
                <th>
                  <select id="flt-tr-date" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Tgl</option>
                    ${uniqueDates.map(d => `<option value="${d}" ${fDateTransit === d ? 'selected' : ''}>${PMCStore.formatDate(d)}</option>`).join('')}
                  </select>
                </th>
                <th>
                  <select id="flt-tr-blok" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Blok</option>
                    ${blokOptions}
                  </select>
                </th>
                <th>
                  <select id="flt-tr-mat" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Material</option>
                    ${matOptions}
                  </select>
                </th>
                <th>
                  <select id="flt-tr-sup" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Supplier</option>
                    ${supOptions}
                  </select>
                </th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody id="transit-table-body">
              ${filtered.length === 0 ? '<tr><td colspan="9" style="text-align:center;padding:var(--sp-4);color:var(--text-secondary);">Data tidak ditemukan dengan filter yang dipilih.</td></tr>' : ''}
              ${filtered.map(row => {
                const isChecked = selectedIds.has(row.id);
                const dtGudang = row.dateInGudang && row.dateInGudang !== '-' ? PMCStore.formatDate(row.dateInGudang) : '-';
                const dtTransit = row.dateInTransit ? `${PMCStore.formatDate(row.dateInTransit)} <span style="font-size:var(--fs-xs);color:var(--text-muted);">${PMCStore.formatTime(row.timeInTransit)}</span>` : '-';
                const pQty = PMCStore.getPalletQty(row.material) || 1;
                const qtyPcs = (row.pcs !== undefined && row.pcs !== null && parseFloat(row.pcs) > 0) ? parseFloat(row.pcs) : (row.palletsAvailable || 0) * pQty;
                const uom = PMCStore.getMaterialUOM(row.material);
                return `
                  <tr>
                    <td style="text-align:center;"><input type="checkbox" class="chk-transit-row" data-id="${row.id}" ${isChecked ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);" /></td>
                    <td><span style="font-family:monospace;font-size:var(--fs-base);font-weight:700;background:rgba(108,92,231,0.10);padding:2px 8px;border-radius:4px;color:var(--primary-color);">${row.barcode || '-'}</span></td>
                    <td><span style="font-family:monospace;font-size:var(--fs-sm)">${row.mid || '-'}</span></td>
                    <td>${dtGudang}</td>
                    <td>${dtTransit}</td>
                    <td><span class="badge badge-primary" style="font-size:11px;">📍 ${row._blockText}</span></td>
                    <td><strong style="font-size:var(--fs-base);">${row.material}</strong></td>
                    <td><span style="font-size:var(--fs-sm);">${row.supplier || '-'}</span></td>
                    <td style="text-align:right">
                      <span class="badge ${qtyPcs > 0 ? 'badge-primary' : 'badge-danger'}">${PMCStore.formatNumber(qtyPcs)} ${uom}</span>
                      <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${row.palletsAvailable || 0} Plt</div>
                    </td>
                    <td style="text-align:center">
                      <button class="btn btn-secondary btn-sm" data-bc="${row.barcode || ''}" data-mid="${row.mid || ''}" data-qty="${qtyPcs || ''}" data-mat="${row.material || ''}" data-date="${row.dateInGudang || row.dateInTransit || ''}" onclick="if(window.BarcodePrinter) { window.BarcodePrinter.showModal({barcode: this.dataset.bc, mid: this.dataset.mid, qty: this.dataset.qty, materialName: this.dataset.mat, dateIn: this.dataset.date}); } else { alert('BarcodePrinter not loaded'); }">Print</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
    }
  }

    // ── Event Listeners ──
    document.getElementById('btn-delete-all-transit')?.addEventListener('click', () => {
      const count = (PMCStore.transitInventory || []).length;
      if (count === 0) { ToastComponent.show('Tidak ada stok di Transit untuk dihapus', 'info'); return; }
      if (confirm(`Yakin ingin menghapus SEMUA ${count} batch stok di Area Transit? Tindakan ini tidak bisa dibatalkan!`)) {
        const res = PMCStore.deleteAllTransitInventory();
        ToastComponent.show(res.message, res.success ? 'success' : 'error');
      }
    });

    if (tInv.length > 0) {
      setTimeout(() => {
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
        // Filters
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
        const wireDropdown = (id, setter) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener('change', e => { setter(e.target.value); render(); });
        };
        wireFilter('flt-tr-barcode', v => fBarcode = v);
        wireFilter('flt-tr-mid', v => fMid = v);
        wireDropdown('flt-tr-blok', v => fBlok = v);
        wireDropdown('flt-tr-mat', v => fMaterial = v);
        wireDropdown('flt-tr-sup', v => fSupplier = v);
        wireDropdown('flt-tr-date', v => fDateTransit = v);

        // Checkbox bulk delete
        const chkAll = document.getElementById('chk-transit-all');
        const chkRows = document.querySelectorAll('.chk-transit-row');
        const btnBulk = document.getElementById('btn-delete-selected-transit');
        const cntSpan = document.getElementById('transit-delete-count');

        const updateBulkBtn = () => {
          if (btnBulk && cntSpan) {
            btnBulk.style.display = selectedIds.size > 0 ? 'inline-block' : 'none';
            cntSpan.textContent = selectedIds.size;
          }
        };

        if (chkAll) {
          chkAll.addEventListener('change', e => {
            chkRows.forEach(cb => {
              cb.checked = e.target.checked;
              if (e.target.checked) selectedIds.add(cb.getAttribute('data-id'));
              else selectedIds.delete(cb.getAttribute('data-id'));
            });
            updateBulkBtn();
          });
        }

        chkRows.forEach(cb => {
          cb.addEventListener('change', e => {
            const id = e.target.getAttribute('data-id');
            if (e.target.checked) selectedIds.add(id); else selectedIds.delete(id);
            if (chkAll) {
              let cnt = 0; chkRows.forEach(c => { if (c.checked) cnt++; });
              chkAll.checked = cnt === chkRows.length && chkRows.length > 0;
            }
            updateBulkBtn();
          });
        });

        updateBulkBtn();

        if (btnBulk) {
          btnBulk.addEventListener('click', () => {
            if (confirm(`Yakin ingin menghapus ${selectedIds.size} batch stok yang dipilih dari Transit?`)) {
              Array.from(selectedIds).forEach(id => PMCStore.deleteTransitInventoryItem(id));
              selectedIds.clear();
              ToastComponent.show('Batch terpilih berhasil dihapus dari Transit', 'success');
            }
          });
        }
      }, 50);
    }
  }

  // Auto-refresh
  PMCStore.on('transitChanged', () => {
    if (window.location.hash === '#/transit/stock-on-hand') render();
  });

  return { render };
})();

window.StockOnHandTransitPage = StockOnHandTransitPage;
export default StockOnHandTransitPage;
