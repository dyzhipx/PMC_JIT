/* ===== Produksi Inbound Page (Penarikan dari Transit) ===== */
const ProduksiInboundPage = (() => {
  let logs = [];
  let scannerInput = null;
  let supplierInput = null;
  let selectedLine = '';

  function render() {
    if (window.location.hash !== '#/produksi/inbound') return;
    
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
        <h2 class="page-title">📥 Penarikan ke Line (Inbound Produksi)</h2>
        <p class="page-subtitle">Scan barcode dari area transit untuk dimasukkan ke line produksi</p>
      </div>
    `;
    page.appendChild(headerBar);

    // ── Pending Verifications (Penerimaan dari Transit Outbound) ──
    const pendingContainer = document.createElement('div');
    pendingContainer.style.marginBottom = 'var(--sp-6)';
    page.appendChild(pendingContainer);
    renderPendingVerifications(pendingContainer);

    // ── Manual SPB Items in Transit ──
    const manualTransitContainer = document.createElement('div');
    manualTransitContainer.style.marginBottom = 'var(--sp-6)';
    page.appendChild(manualTransitContainer);
    renderManualTransitItems(manualTransitContainer);

    // Grid Layout
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '300px 1fr';
    grid.style.gap = 'var(--sp-6)';
    grid.style.alignItems = 'start';

    // ── Left: Scanner UI ──
    const scannerCard = document.createElement('div');
    scannerCard.className = 'card';
    
    // Line Selector
    const lineWarningHtml = `<div id="line-warning" class="alert alert-warning" style="margin-bottom:var(--sp-3);display:${selectedLine ? 'none' : 'block'};">⚠️ Pilih Line Produksi terlebih dahulu sebelum melakukan scan!</div>`;
    
    // Get unique lines from all mapped SKUs in Master Line per SKU
    const allLinesSet = new Set();
    const lineMappings = PMCStore.getLinePerSku();
    lineMappings.forEach(mapping => {
      if (mapping.line) allLinesSet.add(mapping.line);
    });
    const allLines = [...allLinesSet].sort();

    let lineOptions = `<option value="">-- Pilih Line Produksi --</option>`;
    allLines.forEach(l => {
      lineOptions += `<option value="${l}" ${selectedLine === l ? 'selected' : ''}>${l}</option>`;
    });

    scannerCard.innerHTML = `
      ${lineWarningHtml}
      <div class="form-group" style="margin-bottom:var(--sp-4);">
        <label class="form-label" style="font-weight:700;color:var(--primary-color);">🏢 Line Produksi</label>
        <select id="line-selector" class="form-input" style="font-size:1.1rem;font-weight:bold;">
          ${lineOptions}
        </select>
      </div>

      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;border-top:1px solid var(--border-color);padding-top:var(--sp-3);">
        <span>🔍</span> Scan Barcode
      </h3>
      <div style="background:#000;border-radius:var(--radius-md);height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);">
        <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
        <div style="color:rgba(255,255,255,0.3);font-size:3rem;">[|||]</div>
      </div>
      <style>
        @keyframes scanline {
          0% { top: 20%; }
          100% { top: 80%; }
        }
      </style>
    `;

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const labelBarcode = document.createElement('label');
    labelBarcode.className = 'form-label';
    labelBarcode.textContent = 'No Barcode (Scan)';
        
    const barcodeInput = document.createElement('input');
    barcodeInput.type = 'text';
    barcodeInput.className = 'form-input';
    barcodeInput.placeholder = 'Scan barcode dari transit...';
    barcodeInput.autocomplete = 'off';
    barcodeInput.disabled = !selectedLine;
    barcodeInput.style.flex = '1';

    const camBtn = CameraScanner.createScanButton(barcodeInput);
    
    const barcodeRow = document.createElement('div');
    barcodeRow.style.cssText = 'display:flex; gap:8px; align-items:stretch;';
    barcodeRow.appendChild(barcodeInput);
    barcodeRow.appendChild(camBtn);

    const label = document.createElement('label');
    label.className = 'form-label';
    label.style.marginTop = 'var(--sp-3)';
    label.textContent = 'Nama Material';
    
    scannerInput = document.createElement('input');
    scannerInput.type = 'text';
    scannerInput.className = 'form-input';
    scannerInput.placeholder = 'Otomatis terisi...';
    scannerInput.autocomplete = 'off';
    scannerInput.readOnly = true;
    scannerInput.style.backgroundColor = 'var(--bg-secondary)';

    const labelSupplier = document.createElement('label');
    labelSupplier.className = 'form-label';
    labelSupplier.style.marginTop = 'var(--sp-3)';
    labelSupplier.textContent = 'Nama Supplier';

    supplierInput = document.createElement('input');
    supplierInput.type = 'text';
    supplierInput.className = 'form-input';
    supplierInput.placeholder = 'Otomatis terisi...';
    supplierInput.autocomplete = 'off';
    supplierInput.readOnly = true;
    supplierInput.style.backgroundColor = 'var(--bg-secondary)';

    const labelValidation = document.createElement('label');
    labelValidation.className = 'form-label';
    labelValidation.style.marginTop = 'var(--sp-3)';
    labelValidation.style.fontWeight = '800';
    labelValidation.style.color = 'var(--primary-color)';
    labelValidation.textContent = 'Validasi Mapping Line';
    
    const validationDisplay = document.createElement('div');
    validationDisplay.className = 'form-input';
    validationDisplay.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
    validationDisplay.style.border = '1px dashed rgba(108, 92, 231, 0.3)';
    validationDisplay.style.display = 'flex';
    validationDisplay.style.alignItems = 'center';
    validationDisplay.style.minHeight = '60px'; 
    validationDisplay.style.height = 'auto'; 
    validationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';

    const labelQty = document.createElement('label');
    labelQty.className = 'form-label';
    labelQty.style.marginTop = 'var(--sp-3)';
    labelQty.textContent = 'Qty Aktual (Pcs / Roll)';
    
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'form-input';
    qtyInput.placeholder = 'Misal: 500';
    qtyInput.min = '1';
    qtyInput.disabled = !selectedLine;

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.width = '100%';
    submitBtn.style.marginTop = 'var(--sp-4)';
    submitBtn.textContent = 'Proses Penarikan ke Line';
    submitBtn.disabled = !selectedLine;

    // Line Selector Logic
    setTimeout(() => {
      const selector = document.getElementById('line-selector');
      if (selector) {
        selector.addEventListener('change', (e) => {
          selectedLine = e.target.value;
          render(); // Re-render to enable inputs
        });
      }
    }, 0);
    
    // Auto-fill Logic
    barcodeInput.addEventListener('input', (e) => {
      if (!selectedLine) return;
      const val = e.target.value.trim();
      
      if (val.length >= 5) {
        // Cek barcode di transit inventory
        const invMatch = PMCStore.transitInventory.find(inv => inv.barcode === val);
        
        if (invMatch) {
          const material = invMatch.material;
          scannerInput.value = material;
          
          // Fallback: if record has "-", try to resolve from other sources
          const recordSupplier = invMatch.supplier || '';
          if (recordSupplier === '-' || !recordSupplier) {
            supplierInput.value = PMCStore.getSupplierForMaterial(material) || '-';
          } else {
            supplierInput.value = recordSupplier;
          }
          
          const isPartial = PMCStore.materialRecehList && PMCStore.materialRecehList.includes(material);
          const availablePcs = invMatch.pcs ? parseFloat(invMatch.pcs) : (invMatch.palletsAvailable * (PMCStore.getPalletQty ? PMCStore.getPalletQty(material) : 1));
          
          if (isPartial) {
             qtyInput.value = ''; // Biarkan kosong agar diisi manual
             qtyInput.placeholder = `Maks: ${availablePcs} Pcs`;
             qtyInput.disabled = false;
          } else {
             qtyInput.value = availablePcs; 
             qtyInput.disabled = true;
          }
          
          // --- Validasi Line Match ---
          let isMatch = false;
          let validLines = new Set(); // Lines that THIS material is allocated to

          const bLayout = PMCStore.getBlockLayout();
          
          if (invMatch.blockId && invMatch.rowId) {
             // Strict match based on exact placement
             const block = bLayout.find(b => b.id === invMatch.blockId);
             if (block && block.rows) {
                const row = block.rows.find(r => r.id === invMatch.rowId);
                if (row && row.lines && Array.isArray(row.lines)) {
                   row.lines.forEach(l => validLines.add(l));
                   if (row.lines.includes(selectedLine)) {
                      isMatch = true;
                   }
                }
             }
          } else {
            // Fallback for legacy items without blockId/rowId tracking
            for (const block of bLayout) {
               if (!block.rows) continue;
               for (const row of block.rows) {
                  if (row.material === material) {
                     if (row.lines && Array.isArray(row.lines)) {
                        row.lines.forEach(l => validLines.add(l));
                        if (row.lines.includes(selectedLine)) {
                           isMatch = true;
                        }
                     }
                  }
               }
            }
          }

          if (isMatch) {
            validationDisplay.innerHTML = `<span class="badge badge-success" style="padding:var(--sp-2);font-weight:700;">✅ Sesuai dengan Line ${selectedLine}</span>`;
            submitBtn.disabled = false;
          } else {
            const linesStr = [...validLines].sort().join(', ');
            const locText = (invMatch.blockId && invMatch.rowId) ? `di Blok ${invMatch.blockId} Baris ${invMatch.rowId}` : 'secara global';
            validationDisplay.innerHTML = `<span class="badge badge-danger" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">❌ Barang tidak sesuai dengan Line ${selectedLine}.\nLokasi barcode ${locText} dialokasikan ke Line [${linesStr || 'Tidak ada'}].</span>`;
            submitBtn.disabled = true; // Block submission
          }
        } else {
          // Cek apakah sudah di-scan ke line sebelumnya
          const isAtLine = PMCStore.lineBarcodes.some(b => b.barcode === val);
          if (isAtLine) {
            validationDisplay.innerHTML = `<span class="badge badge-warning">⚠️ Barcode sudah berada di area produksi line</span>`;
          } else {
            validationDisplay.innerHTML = `<span class="badge badge-danger">❌ Barcode tidak ditemukan di stok Transit</span>`;
          }
          scannerInput.value = '';
          supplierInput.value = '';
          qtyInput.value = '';
          submitBtn.disabled = true;
        }
      } else {
        scannerInput.value = '';
        supplierInput.value = '';
        qtyInput.value = '';
        if (qtyInput.disabled === true && selectedLine) {
           qtyInput.disabled = false; // reset when cleared
        }
        validationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
        submitBtn.disabled = !selectedLine;
      }
    });

    // Process Logic
    // Process Logic
    const submitAction = async () => {
        if (!selectedLine) {
           ToastComponent.show('Pilih Line Produksi terlebih dahulu!', 'warning');
           return;
        }

        const barcode = barcodeInput.value.trim();
        const material = scannerInput.value.trim();
        const qty = parseFloat(qtyInput.value) || 0;
        const isPartial = PMCStore.materialRecehList && PMCStore.materialRecehList.includes(material);

        if (barcode && material && qty > 0) {
          if (submitBtn.disabled) return; // Prevent if validation failed

          submitBtn.disabled = true;
          submitBtn.textContent = 'Memproses...';

          await processBarcode(material, qty, barcode, isPartial);
          
          barcodeInput.value = '';
          scannerInput.value = '';
          supplierInput.value = '';
          qtyInput.value = '';
          if (qtyInput.disabled === true) qtyInput.disabled = false;
          validationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
          barcodeInput.focus();
          
          submitBtn.disabled = false;
          submitBtn.textContent = 'Proses Penarikan ke Line';
        } else {
          ToastComponent.show('Mohon lengkapi Barcode dan pastikan Qty > 0', 'warning');
        }
    };

    barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') qtyInput.focus();
    });
    qtyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitAction();
    });
    submitBtn.addEventListener('click', submitAction);

    formGroup.appendChild(labelBarcode);
    formGroup.appendChild(barcodeRow);
    formGroup.appendChild(label);
    formGroup.appendChild(scannerInput);
    formGroup.appendChild(labelSupplier);
    formGroup.appendChild(supplierInput);
    formGroup.appendChild(labelValidation);
    formGroup.appendChild(validationDisplay);
    formGroup.appendChild(labelQty);
    formGroup.appendChild(qtyInput);
    formGroup.appendChild(submitBtn);
    scannerCard.appendChild(formGroup);

    grid.appendChild(scannerCard);

    // ── Right: Scan Logs ──
    const logsCard = document.createElement('div');
    logsCard.className = 'card';
    logsCard.style.minHeight = '650px';
    logsCard.style.display = 'flex';
    logsCard.style.flexDirection = 'column';

    logsCard.innerHTML = `<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📜 Log Penarikan (Transit ➔ Line)</h3>`;

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

    // Auto focus the scanner if line is selected
    if (selectedLine) {
      setTimeout(() => {
        if (barcodeInput) barcodeInput.focus();
      }, 100);
    }

    // Event hooks for auto-refresh
    PMCStore.off('outboundPendingChanged', render);
    PMCStore.on('outboundPendingChanged', render);

    TopbarComponent.render('/produksi/inbound');
  }

  async function processBarcode(material, inputQty, barcode, isPartialMode = false) {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const supplier = supplierInput.value.trim() || '-';
    let res;
    if (isPartialMode) {
       res = await PMCStore.receivePartialToLine(selectedLine, material, barcode, inputQty);
    } else {
       res = await PMCStore.receiveToLine(selectedLine, material, barcode, inputQty);
    }
    
    const modeBadge = isPartialMode ? ' <span class="badge badge-warning">Recehan</span>' : '';
    logs.unshift({
      time: timeStr,
      barcode,
      material,
      supplier,
      success: res.success,
      message: res.success ? `Berhasil ditarik ke Line ${selectedLine} (${inputQty} Pcs)${modeBadge}` : res.message
    });

    if (logs.length > 50) logs.pop();

    if (res.success) {
      ToastComponent.show('Berhasil ditarik ke line!', 'success');
    } else {
      ToastComponent.show('Gagal: ' + res.message, 'danger');
    }

    renderLogs();
  }

  function renderLogs() {
    const container = document.getElementById('scan-logs-container');
    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas penarikan pada sesi ini.</div>`;
      return;
    }

    container.innerHTML = logs.map(log => `
      <div style="background:var(--bg-secondary);padding:var(--sp-2) var(--sp-3);border-left:4px solid ${log.success ? 'var(--success-color)' : 'var(--danger-color)'};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${log.time}</span>
          <span style="font-weight:600;color:${log.success ? 'var(--success-color)' : 'var(--danger-color)'}">${log.success ? '✅ DITERIMA' : '❌ DITOLAK'}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">${log.barcode} - ${log.material}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);display:flex;justify-content:space-between;align-items:center;">
          <span>🏢 Supplier: <strong>${log.supplier}</strong></span>
        </div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${log.message}</div>
      </div>
    `).join('');
  }

  function renderPendingVerifications(container) {
    const pendings = PMCStore.transitOutboundPending.filter(p => p.destination === '3F1');
    
    if (pendings.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-bottom: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          📥 Terdapat ${pendings.length} Antrean Penerimaan dari Area Transit (Outbound ke 3F1)
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu Pengiriman</th>
              <th>Target Line</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Supplier</th>
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
          <td><span class="badge badge-accent">${p.targetLine || 'A'}</span></td>
          <td><strong>${p.barcode}</strong></td>
          <td>${p.material}</td>
          <td><span style="font-size:0.85rem; color:var(--text-secondary);">${p.supplier || '-'}</span></td>
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
        if (confirm('Konfirmasi penerimaan barang ke Line Produksi?')) {
          const res = await PMCStore.verifyTransitOutbound(id, 'accept');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render(); // Refresh the page to update pending cards
        }
      });
    });

    container.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Tolak barang ini dan kembalikan truk ke Transit?')) {
          const res = await PMCStore.verifyTransitOutbound(id, 'reject');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render(); // Refresh the page to update pending cards
        }
      });
    });
  }

  function renderManualTransitItems(container) {
    // Collect all unique barcodes in transit that originated from Manual SPB
    const manualItemsList = PMCStore.transitInventory.filter(item => 
      item.reference && item.reference.startsWith('SPB Manual:')
    );

    if (manualItemsList.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="card" style="border: 2px solid var(--accent-color); background: rgba(108, 92, 231, 0.05);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--accent-color);">
          📦 Material SPB Manual di Transit (Siap Ditarik ke Line)
        </h3>
        <p style="font-size:var(--fs-xs); color:var(--text-secondary); margin-bottom:var(--sp-3);">
          Berikut adalah material tambahan dari SPB Manual yang sudah disiapkan oleh Gudang. Scan barcode di bawah untuk memasukkannya ke line produksi.
        </p>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--sp-3);">
          ${manualItemsList.map(item => `
            <div style="background:var(--bg-secondary); padding:12px; border-radius:var(--radius-md); border-left:4px solid var(--accent-color); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:1rem;">${item.material}</div>
                <div style="font-family:monospace; color:var(--accent-light); font-size:0.9rem;">🏷️ ${item.barcode}</div>
                <div style="font-size:var(--fs-xs); color:var(--text-muted);">${item.reference}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:bold; color:var(--text-main);">${item.qty} Pcs</div>
                <div style="font-size:10px; color:var(--text-muted);">📍 B${item.blockId}.${item.rowId}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return { render };
})();

window.ProduksiInboundPage = ProduksiInboundPage;
export default ProduksiInboundPage;
