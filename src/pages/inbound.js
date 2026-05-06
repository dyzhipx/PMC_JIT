/* ===== Inbound Transit Page (Barcode Scanner) ===== */
const InboundTransitPage = (() => {
  let logs = [];
  let currentGroupLogId = null;
  let scannerInput = null;

  function render() {
    if (window.location.hash !== '#/transit/inbound') return;

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
        <h2 class="page-title">📥 Penerimaan Area Transit (Inbound)</h2>
        <p class="page-subtitle">Scan barcode muatan dari gudang untuk memasukkan stok ke area transit blok</p>
      </div>
    `;
    page.appendChild(headerBar);

    // Grid Layout
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '300px 1fr';
    grid.style.gap = 'var(--sp-6)';
    grid.style.alignItems = 'start';

    // ── Left: Scanner UI ──
    const scannerCard = document.createElement('div');
    scannerCard.className = 'card';
    scannerCard.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;">
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
    barcodeInput.placeholder = '100018273...';
    barcodeInput.autocomplete = 'off';
    barcodeInput.style.flex = '1';

    // Camera scan button (for mobile)
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
    scannerInput.placeholder = 'Karton Mocca...';
    scannerInput.autocomplete = 'off';
    scannerInput.readOnly = true;
    scannerInput.style.backgroundColor = 'var(--bg-secondary)';

    const labelSupplier = document.createElement('label');
    labelSupplier.className = 'form-label';
    labelSupplier.style.marginTop = 'var(--sp-3)';
    labelSupplier.textContent = 'Nama Supplier';

    const supplierInput = document.createElement('input');
    supplierInput.type = 'text';
    supplierInput.className = 'form-input';
    supplierInput.placeholder = 'PT. Sumber Jaya...';
    supplierInput.autocomplete = 'off';
    supplierInput.readOnly = true;
    supplierInput.style.backgroundColor = 'var(--bg-secondary)';

    const labelAllocation = document.createElement('label');
    labelAllocation.className = 'form-label';
    labelAllocation.style.marginTop = 'var(--sp-3)';
    labelAllocation.style.fontWeight = '800';
    labelAllocation.style.fontSize = '1.3rem';
    labelAllocation.style.color = 'var(--primary-color)';
    labelAllocation.textContent = 'Dialokasikan ke Blok per Baris (Otomatis)';
    
    const allocationDisplay = document.createElement('div');
    allocationDisplay.className = 'form-input';
    allocationDisplay.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
    allocationDisplay.style.border = '1px dashed rgba(108, 92, 231, 0.3)';
    allocationDisplay.style.display = 'flex';
    allocationDisplay.style.alignItems = 'center';
    allocationDisplay.style.minHeight = '60px'; 
    allocationDisplay.style.height = 'auto'; 
    allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';

    const labelQty = document.createElement('label');
    labelQty.className = 'form-label';
    labelQty.style.marginTop = 'var(--sp-3)';
    labelQty.textContent = 'Qty Aktual (Pcs / Roll)';
    
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'form-input';
    qtyInput.placeholder = 'Misal: 500';
    qtyInput.min = '1';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.width = '100%';
    submitBtn.style.marginTop = 'var(--sp-4)';
    submitBtn.textContent = 'Proses Penerimaan';
    
    // Auto-fill Logic — hanya barcode dari delivery aktif ('delivering') yang diterima
    barcodeInput.addEventListener('input', async (e) => {
      const val = e.target.value.trim();
      if (val.length >= 5) {
        // Cek apakah barcode sudah pernah diterima
        if (PMCStore.usedBarcodes.has(val)) {
          scannerInput.value = '';
          supplierInput.value = '';
          qtyInput.value = '';
          allocationDisplay.innerHTML = `<span class="badge badge-danger">🚫 Barcode sudah pernah diterima</span>`;
          return;
        }

        // Cek barcode di delivery aktif (yang sudah di-scan gudang & status 'delivering')
        const deliveryMatch = await PMCStore.isBarcodeInActiveDelivery(val);
        if (deliveryMatch && deliveryMatch.item) { // Pastikan deliveryMatch ada dan berstruktur benar
          // Note: Backend /barcode-check returns { delivery, scan, item }
          const material = deliveryMatch.item.materialName || deliveryMatch.item.material;
          const scan = deliveryMatch.scan;
          scannerInput.value = material;
          supplierInput.value = scan.supplier || '';
          qtyInput.value = ''; // Manual input requirement
          
          // Transit Inbound: Tampilkan destinasi dari Gudang (bukan prediksi ulang!)
          if (scan.targetBlockRowId) {
            // Cari nama blok & baris dari blockLayout berdasarkan targetBlockRowId
            const transitInfo = PMCStore.getTransitInfo();
            let blockLabel = '?', rowLabel = '?';
            if (transitInfo && transitInfo.blocks) {
              for (const blk of transitInfo.blocks) {
                for (const r of blk.rows) {
                  if (r.id === scan.targetBlockRowId) {
                    blockLabel = blk.blockNumber !== undefined ? blk.blockNumber : blk.id;
                    rowLabel = r.rowNumber !== undefined ? r.rowNumber : r.id;
                  }
                }
              }
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Proses Penerimaan';
            allocationDisplay.innerHTML = `<span class="badge badge-primary" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📍 BAWA KE B${blockLabel}.${rowLabel}</span>`;
          } else {
            // Fallback: tidak ada lock dari gudang, prediksi otomatis
            const alloc = PMCStore.predictTransitAllocation(material);
            if (alloc) {
              if (alloc.isFull) {
                 submitBtn.disabled = true;
                 submitBtn.textContent = 'Stock Over';
                 allocationDisplay.innerHTML = `<span class="badge badge-danger" style="font-size:1.2rem; padding:var(--sp-2); width:100%; text-align:center;">⚠️ Kapasitas Penuh (Dialokasikan ke B${alloc.blockId}.${alloc.rowId} - STOCK OVER)</span>`;
              } else {
                 submitBtn.disabled = false;
                 submitBtn.textContent = 'Proses Penerimaan';
                 allocationDisplay.innerHTML = `<span class="badge badge-primary" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📍 B${alloc.blockId}.${alloc.rowId}</span>`;
              }
            } else {
              submitBtn.disabled = true;
              allocationDisplay.innerHTML = `<span class="badge badge-danger">⚠️ Material tidak dikonfigurasi di Blok</span>`;
            }
          }
        } else {
          // ── FALLBACK: Cek Manual SPB Scan ──
          const manualMatch = await PMCStore.isBarcodeInActiveManualSpb(val);
          if (manualMatch && manualMatch.item) {
             const matName = manualMatch.item.materialName;
             scannerInput.value = matName;
             supplierInput.value = manualMatch.supplier || '-';
             qtyInput.value = '';
             submitBtn.disabled = false;
             submitBtn.textContent = 'Terima SPB Manual';
             
             // Transit Manual: Gunakan target yang ditentukan saat dispatch gudang
             if (manualMatch.targetBlockRowId) {
                const transitInfo = PMCStore.getTransitInfo();
                let bStr = '?', rStr = '?';
                (transitInfo.blocks || []).forEach(b => {
                   b.rows.forEach(r => {
                      if (r.id === manualMatch.targetBlockRowId) {
                         bStr = b.blockNumber || b.id;
                         rStr = r.rowNumber || r.id;
                      }
                   });
                });
                allocationDisplay.innerHTML = `<span class="badge badge-accent" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📋 SPB: B${bStr}.${rStr}</span>`;
             } else {
                allocationDisplay.innerHTML = `<span class="badge badge-accent" style="width:100%;text-align:center;">📋 SPB Manual (${manualMatch.item.spb.spbNumber})</span>`;
             }
          } else {
            scannerInput.value = '';
            supplierInput.value = '';
            qtyInput.value = '';
            allocationDisplay.innerHTML = `<span class="badge badge-danger">❌ Barcode tidak terdaftar (Delivery/Manual SPB)</span>`;
          }
        }
      } else {
        scannerInput.value = '';
        supplierInput.value = '';
        qtyInput.value = '';
        allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
      }
    });

    // Process Logic
    let isProcessing = false;
    
    const submitAction = async () => {
        if (isProcessing) return;
        
        const barcode = barcodeInput.value.trim();
        const material = scannerInput.value.trim();
        const qty = parseFloat(qtyInput.value) || 0;
        const supplier = supplierInput.value.trim();

        if (barcode && material && qty > 0) {
          isProcessing = true;
          submitBtn.disabled = true;
          barcodeInput.disabled = true;
          qtyInput.disabled = true;
          submitBtn.textContent = 'Memproses...';

          try {
            // Validasi barcode harus dari delivery aktif
            const deliveryMatch = await PMCStore.isBarcodeInActiveDelivery(barcode);
            if (deliveryMatch && deliveryMatch.delivery) {
               const delGroup = deliveryMatch.delivery.id;
               if (currentGroupLogId && currentGroupLogId !== delGroup) {
                   // Ganti grup pengiriman -> Hapus log sebelumnya
                   logs = [];
               }
               currentGroupLogId = delGroup;

               if (deliveryMatch.scan && deliveryMatch.scan.pcs && parseFloat(deliveryMatch.scan.pcs) !== qty) {
                 ToastComponent.show('Coba cek kembali jumlahnya sampai Qty nya sama dengan jumlah Qty dari gudang', 'warning');
                 qtyInput.value = '';
                 qtyInput.focus();
                 return;
               }

               await processBarcode(material, qty, barcode, 'delivery');
               barcodeInput.value = '';
               scannerInput.value = '';
               supplierInput.value = '';
               qtyInput.value = '';
               allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
               barcodeInput.focus();
            } else {
               // ── TRY MANUAL SPB RECEIPT ──
               const manualMatch = await PMCStore.isBarcodeInActiveManualSpb(barcode);
               if (manualMatch) {
                  if (manualMatch.pcs && parseFloat(manualMatch.pcs) !== qty) {
                     ToastComponent.show('Qty tidak sesuai dengan data dispatch gudang', 'warning');
                     qtyInput.value = '';
                     qtyInput.focus();
                     return;
                  }
                  const res = await PMCStore.receiveManualSpbScan(barcode, qty);
                  if (res.success) {
                     ToastComponent.show(res.message, 'success');
                     const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                     logs.unshift({
                       time: timeStr,
                       material: `${barcode} - ${material}`,
                       success: true,
                       message: `SPB Manual Diterima: ${res.message}`
                     });
                     barcodeInput.value = '';
                     scannerInput.value = '';
                     supplierInput.value = '';
                     qtyInput.value = '';
                     allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
                     barcodeInput.focus();
                  } else {
                     ToastComponent.show(res.message, 'danger');
                  }
                  renderLogs();
               } else {
                  ToastComponent.show('Barcode tidak ditemukan di pengiriman aktif maupun SPB Manual.', 'danger');
               }
            }
          } finally {
            isProcessing = false;
            submitBtn.disabled = false;
            barcodeInput.disabled = false;
            qtyInput.disabled = false;
            submitBtn.textContent = 'Proses Penerimaan';
          }
        } else {
          ToastComponent.show('Mohon lengkapi Barcode, Material dan Qty', 'warning');
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
    formGroup.appendChild(labelAllocation);
    formGroup.appendChild(allocationDisplay);
    formGroup.appendChild(labelQty);
    formGroup.appendChild(qtyInput);
    formGroup.appendChild(submitBtn);
    scannerCard.appendChild(formGroup);

    const helpText = document.createElement('div');
    helpText.style.fontSize = 'var(--fs-xs)';
    helpText.style.color = 'var(--text-muted)';
    helpText.style.marginTop = 'var(--sp-2)';
    helpText.innerHTML = `Scan ke No Barcode, lalu ketik Qty manual dan Enter.`;
    scannerCard.appendChild(helpText);

    grid.appendChild(scannerCard);

    // ── Right: Scan Logs ──
    const logsCard = document.createElement('div');
    logsCard.className = 'card';
    logsCard.style.minHeight = '650px';
    logsCard.style.display = 'flex';
    logsCard.style.flexDirection = 'column';

    logsCard.innerHTML = `<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📜 Log Sesi Scan</h3>`;

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
    
    const activeDeliveriesContainer = document.createElement('div');
    activeDeliveriesContainer.id = 'active-deliveries-container';
    activeDeliveriesContainer.style.gridColumn = '1 / -1';
    grid.appendChild(activeDeliveriesContainer);

    const pendingContainer = document.createElement('div');
    pendingContainer.id = 'pending-returns-container';
    pendingContainer.style.gridColumn = '1 / -1';
    grid.appendChild(pendingContainer);

    page.appendChild(grid);
    container.appendChild(page);

    renderLogs();
    renderActiveDeliveries();
    renderPendingReturns();

    PMCStore.off('returnsChanged', renderPendingReturns);
    PMCStore.on('returnsChanged', renderPendingReturns);
    PMCStore.off('deliveryChanged', renderActiveDeliveries);
    PMCStore.on('deliveryChanged', renderActiveDeliveries);
    PMCStore.off('warehouseStockChanged', renderActiveDeliveries);
    PMCStore.on('warehouseStockChanged', renderActiveDeliveries);
    

    // Auto focus the scanner
    setTimeout(() => {
      const firstInput = scannerCard.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);

    TopbarComponent.render('/transit/inbound');
  }

  async function processBarcode(material, inputQty, barcode = '-') {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const pQty = PMCStore.getPalletQty(material);
    
    if (!pQty) {
       logs.unshift({
         time: timeStr,
         material: material,
         success: false,
         message: "Material tidak valid atau kapasitas pallet belum diatur"
       });
       if (logs.length > 50) logs.pop();
       ToastComponent.show('Ditolak! Material tidak valid', 'danger');
       renderLogs();
       return;
    }

    const res = await PMCStore.receiveAndConsumeWMS(material, inputQty, barcode);
    
    let extraMsg = '';
    if (res.success && barcode !== '-') {
      if (res.deliveryCompleted) {
         extraMsg = '<br/><span style="color:var(--primary-color)"><b>📦 Pengiriman Selesai!</b> Semua pallet pada group aktif telah tercapai.</span>';
      } else if (res.remainingPallets !== undefined) {
         extraMsg = `<br/><span style="color:var(--warning-color)"><b>⏳ Sisa ${res.remainingPallets} Pallet</b> belum masuk.</span>`;
      }
    }

    logs.unshift({
      time: timeStr,
      material: barcode === '-' ? material : `${barcode} - ${material}`,
      success: res.success,
      message: res.success ? `Sesuai (${inputQty} ${PMCStore.getMaterialUOM(material)}). ${res.message}${extraMsg}` : res.message
    });

    if (logs.length > 50) logs.pop();

    if (res.success) {
      ToastComponent.show('Berhasil! ' + res.message, 'success');
    } else {
      ToastComponent.show('Ditolak! ' + res.message, 'danger');
    }

    renderLogs();
  }

  function renderLogs() {
    const container = document.getElementById('scan-logs-container');
    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas scan pada sesi ini.</div>`;
      return;
    }

    container.innerHTML = logs.map(log => `
      <div style="background:var(--bg-secondary);padding:var(--sp-2) var(--sp-3);border-left:4px solid ${log.success ? 'var(--success-color)' : 'var(--danger-color)'};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${log.time}</span>
          <span style="font-weight:600;color:${log.success ? 'var(--success-color)' : 'var(--danger-color)'}">${log.success ? '✅ ACCEPTED' : '❌ REJECTED'}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">Bcd: ${log.material}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${log.message}</div>
      </div>
    `).join('');
  }

  function renderActiveDeliveries() {
    const container = document.getElementById('active-deliveries-container');
    if (!container) return;

    const activeDelivs = PMCStore.getActiveDeliveries().filter(d => d.status === 'delivering');
    if (activeDelivs.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-top: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          <span style="font-size:1.2rem;">🚚</span> Progress Pengiriman Aktif (Inbound Transit)
        </h3>
        <div style="display:flex; flex-direction:column; gap:var(--sp-3);">
    `;

    activeDelivs.forEach(del => {
      let totalPalletsReq = 0;
      let totalReceived = 0;
      let matInfo = [];

      del.items.forEach(it => {
        let req = it.required || it.planned || 0;
        totalPalletsReq += req;
        
        let itRecv = 0;
        if (it.scans) {
          it.scans.forEach(s => {
             if (s.barcode && PMCStore.usedBarcodes.has(s.barcode)) {
               itRecv++;
             }
          });
        }
        totalReceived += itRecv;
        matInfo.push(`${it.materialName || it.material} (${itRecv}/${req})`);
      });

      let remaining = totalPalletsReq - totalReceived;
      let isDone = (totalPalletsReq > 0 && remaining <= 0);

      html += `
        <div style="background:var(--bg-card); padding:var(--sp-3); border:1px solid var(--border-color); border-radius:var(--radius-sm);">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <div style="font-weight:700;">Pengiriman: ${del.shiftKey ? del.shiftKey.toUpperCase() : ''} - Ke ${del.slotId || '?'} <span style="font-size:var(--fs-xs); color:var(--text-secondary); font-weight:normal;">/ ${PMCStore.formatDate(del.date)}</span></div>
            <div style="font-size:var(--fs-sm); font-weight:600; color:${isDone ? 'var(--success-color)' : 'var(--warning-color)'};">
              ${isDone ? '✅ Selesai' : `⏳ ${remaining} Pallet Belum Masuk`}
            </div>
          </div>
          <div style="font-size:var(--fs-sm); display:flex; justify-content:space-between; align-items:flex-end;">
            <div style="color:var(--text-secondary);">
              ${matInfo.join('<br>')}
            </div>
            <div style="font-weight:700; font-size:1.1rem; color:var(--primary-color);">
              <span style="font-size:var(--fs-xs); color:var(--text-muted); font-weight:normal;">Masuk:</span> 
              ${totalReceived} / ${totalPalletsReq}
            </div>
          </div>
          <div style="margin-top:8px; height:6px; background:var(--bg-secondary); border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${totalPalletsReq > 0 ? (totalReceived/totalPalletsReq)*100 : 0}%; background: ${isDone ? 'var(--success-color)' : 'var(--primary-color)'}; transition:width 0.3s;"></div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }


  function renderPendingReturns() {
    const container = document.getElementById('pending-returns-container');
    if (!container) return;
    
    const returns = PMCStore.pendingReturns || [];
    if (returns.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <div class="card" style="border: 2px solid var(--warning-color); background: rgba(253, 203, 110, 0.05); margin-top: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--warning-color);">
          🔔 Terdapat ${returns.length} Antrean Verifikasi Retur dari Line
        </h3>
        <div style="background:rgba(245,158,11,0.08); border-radius:var(--radius-sm); padding:var(--sp-2) var(--sp-3); margin-bottom:var(--sp-3); font-size:var(--fs-xs); color:var(--text-secondary);">
          ℹ️ Klik "Terima" untuk menerima barang ke transit. Klik "Tolak" untuk mengembalikan ke line produksi.
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Asal Line</th>
              <th>Kondisi</th>
              <th>Qty (Pcs)</th>
              <th>Tujuan Blok</th>
              <th style="width: 200px; text-align: center;">Aksi Verifikasi</th>
            </tr>
          </thead>
          <tbody>
    `;

    returns.forEach(r => {
      // Resolve target block label
      let targetLabel = '<span style="color:var(--text-muted);">Otomatis</span>';
      if (r.targetBlockRowId) {
        const tInfo = PMCStore.transitInfoCache;
        if (tInfo && tInfo.blocks) {
          for (const b of tInfo.blocks) {
            const row = (b.rows || []).find(rw => rw.id === r.targetBlockRowId);
            if (row) {
              const flexTag = row.isFlexible ? ' <span style="color:#7c3aed;font-weight:700;">[SLOW]</span>' : '';
              targetLabel = `B${b.blockNumber}.${row.rowNumber}${flexTag}`;
              break;
            }
          }
        }
      }

      const condBadge = r.condition === 'sisa' 
        ? '<span class="badge badge-warning" style="font-size:10px;padding:2px 8px;">⚠️ SISA</span>'
        : '<span class="badge badge-success" style="font-size:10px;padding:2px 8px;">✅ UTUH</span>';

      const pcsDisplay = r.pcs ? PMCStore.formatNumber(parseFloat(r.pcs)) : '-';

      html += `
        <tr>
          <td style="font-size:var(--fs-xs);">${r.date} ${r.time}</td>
          <td><strong style="font-family:monospace;">${r.barcode}</strong></td>
          <td>${r.material}</td>
          <td>Line ${r.line}</td>
          <td>${condBadge}</td>
          <td style="font-weight:700;">${pcsDisplay}</td>
          <td>${targetLabel}</td>
          <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm accept-btn" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.8rem;">✅ Terima</button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.8rem;">❌ Tolak</button>
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
        if (confirm('Verifikasi terima stok retur ini ke Transit?')) {
          const res = await PMCStore.verifyReturn(id, 'accept');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render(); // Refresh the page to update lists
        }
      });
    });

    container.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Tolak retur ini dan kembalikan stoknya ke Line?')) {
          const res = await PMCStore.verifyReturn(id, 'reject');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render(); // Refresh the page to update lists
        }
      });
    });
  }

  return { render };
})();

window.InboundTransitPage = InboundTransitPage;
export default InboundTransitPage;
