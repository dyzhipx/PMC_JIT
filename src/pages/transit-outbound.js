/* ===== Transit Outbound Page (Multi-Destination) ===== */
const TransitOutboundPage = (() => {
  let logs = [];
  let scannerInput = null;
  let selectedDestination = '3P1';
  let selectedLine = 'A';

  const DESTINATIONS = [
    { id: '3P1', label: 'Gudang Packing RNG (3P1)' },
    { id: '3F1', label: 'Line Produksi RNG (3F1)' },
    { id: '3F2', label: 'Produksi 3IN1 (3F2)' },
    { id: '3P2', label: 'Gudang Packing 3IN1 (3P2)' }
  ];

  function render() {
    if (window.location.hash !== '#/transit/outbound') return;
    
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
        <h2 class="page-title">📤 Pengeluaran Area Transit (Outbound Multi-Tujuan)</h2>
        <p class="page-subtitle">Scan barcode muatan dari transit untuk dikeluarkan ke tujuan Produksi / Packing</p>
      </div>
    `;
    page.appendChild(headerBar);

    // Grid Layout
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '320px 1fr';
    grid.style.gap = 'var(--sp-6)';
    grid.style.alignItems = 'start';

    // ── Left: Scanner UI ──
    const scannerCard = document.createElement('div');
    scannerCard.className = 'card';
    
    // Header
    const scannerHeader = document.createElement('h3');
    scannerHeader.style.marginBottom = 'var(--sp-3)';
    scannerHeader.style.display = 'flex';
    scannerHeader.style.alignItems = 'center';
    scannerHeader.style.gap = '8px';
    scannerHeader.innerHTML = '<span>🔍</span> Scan Barcode Keluar';
    scannerCard.appendChild(scannerHeader);

    // Destination Selector
    const destGroup = document.createElement('div');
    destGroup.className = 'form-group';
    destGroup.innerHTML = `<label class="form-label">Tujuan Retur / Pengeluaran</label>`;
    
    const destSelect = document.createElement('select');
    destSelect.className = 'form-input';
    destSelect.style.marginBottom = 'var(--sp-3)';
    DESTINATIONS.forEach(d => {
      destSelect.innerHTML += `<option value="${d.id}" ${d.id === selectedDestination ? 'selected' : ''}>${d.label}</option>`;
    });
    
    const lineGroup = document.createElement('div');
    lineGroup.style.display = selectedDestination === '3F1' ? 'block' : 'none';
    lineGroup.style.marginBottom = 'var(--sp-3)';
    lineGroup.className = 'form-group';
    lineGroup.innerHTML = `<label class="form-label" style="color:var(--accent-color)">Pilih Mesin / Line</label>`;
    
    const lineSelect = document.createElement('select');
    lineSelect.className = 'form-input';
    // Gunakan getUniqueLines jika ada, atau default mock
    // Generate A to Y
    const allLines = Array.from({length: 25}, (_, i) => String.fromCharCode(65 + i));
    allLines.forEach(l => {
      lineSelect.innerHTML += `<option value="${l}" ${l === selectedLine ? 'selected' : ''}>${l}</option>`;
    });

    destSelect.addEventListener('change', (e) => {
      selectedDestination = e.target.value;
      lineGroup.style.display = selectedDestination === '3F1' ? 'block' : 'none';
    });
    lineSelect.addEventListener('change', (e) => {
      selectedLine = e.target.value;
    });

    destGroup.appendChild(destSelect);
    lineGroup.appendChild(lineSelect);
    
    // Animation Box
    const scannerVisual = document.createElement('div');
    scannerVisual.style.cssText = 'background:#000;border-radius:var(--radius-md);height:120px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);';
    scannerVisual.innerHTML = `
      <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
      <div style="color:rgba(255,255,255,0.3);font-size:2.5rem;">[|||]</div>
    `;

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const labelBarcode = document.createElement('label');
    labelBarcode.className = 'form-label';
    labelBarcode.textContent = 'No Barcode Transit (Scan)';
        
    const barcodeInput = document.createElement('input');
    barcodeInput.type = 'text';
    barcodeInput.className = 'form-input';
    barcodeInput.placeholder = 'Scan barcode disini...';
    barcodeInput.autocomplete = 'off';
    barcodeInput.style.flex = '1';

    const camBtn = CameraScanner.createScanButton(barcodeInput);
    
    const barcodeRow = document.createElement('div');
    barcodeRow.style.cssText = 'display:flex; gap:8px; align-items:stretch;';
    barcodeRow.appendChild(barcodeInput);
    barcodeRow.appendChild(camBtn);

    const labelMat = document.createElement('label');
    labelMat.className = 'form-label';
    labelMat.style.marginTop = 'var(--sp-3)';
    labelMat.textContent = 'Nama Material';
    
    scannerInput = document.createElement('input');
    scannerInput.type = 'text';
    scannerInput.className = 'form-input';
    scannerInput.readOnly = true;
    scannerInput.style.backgroundColor = 'var(--bg-secondary)';

    const labelAllocation = document.createElement('label');
    labelAllocation.className = 'form-label';
    labelAllocation.style.marginTop = 'var(--sp-3)';
    labelAllocation.style.color = 'var(--warning-color)';
    labelAllocation.textContent = 'Diambil Dari Blok';
    
    const allocationDisplay = document.createElement('div');
    allocationDisplay.className = 'form-input';
    allocationDisplay.style.backgroundColor = 'rgba(253, 203, 110, 0.05)';
    allocationDisplay.style.border = '1px dashed rgba(253, 203, 110, 0.4)';
    allocationDisplay.style.display = 'flex';
    allocationDisplay.style.alignItems = 'center';
    allocationDisplay.style.minHeight = '50px'; 
    allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.width = '100%';
    submitBtn.style.marginTop = 'var(--sp-4)';
    submitBtn.textContent = 'Proses Pengeluaran';
    
    barcodeInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.length >= 5) {
        // Find in transit inventory
        const inv = PMCStore.transitInventory.find(i => i.barcode === val);
        if (inv) {
          scannerInput.value = inv.material;
          if (inv.blockId && inv.rowId) {
            allocationDisplay.innerHTML = `<span class="badge badge-warning" style="font-size:1.4rem; padding:var(--sp-2); font-weight:800; width:100%; text-align:center;">📍 B${inv.blockId}.${inv.rowId}</span>`;
          } else {
            allocationDisplay.innerHTML = `<span class="badge badge-secondary" style="font-size:1.1rem; padding:var(--sp-2); width:100%; text-align:center;">⚠️ Blok Tidak Diketahui</span>`;
          }
        } else {
          scannerInput.value = '';
          allocationDisplay.innerHTML = `<span class="badge badge-danger">❌ Barcode tidak ada di Transit</span>`;
        }
      } else {
        scannerInput.value = '';
        allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>';
      }
    });

    const submitAction = async () => {
        const barcode = barcodeInput.value.trim();
        const material = scannerInput.value.trim();

        if (barcode && material) {
          /* Notice: The physical verification in `store.js` against the legacy local cache `transitInventory` was safely handled natively by Postgres now. */
          submitBtn.disabled = true;
          submitBtn.textContent = 'Memproses...';

          const res = await PMCStore.requestTransitOutbound(barcode, selectedDestination, selectedDestination === '3F1' ? selectedLine : null);
          
          const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          logs.unshift({
            time: timeStr,
            barcode: barcode,
            material: material,
            destination: selectedDestination,
            success: res.success,
            message: res.message
          });
          if (logs.length > 50) logs.pop();

          if (res.success) ToastComponent.show(res.message, 'success');
          else ToastComponent.show(res.message, 'danger');

          barcodeInput.value = '';
          scannerInput.value = '';
          allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>';
          barcodeInput.focus();
          submitBtn.disabled = false;
          submitBtn.textContent = 'Proses Pengeluaran';
          renderLogs();
        } else {
          ToastComponent.show('Scan barcode terlebih dahulu', 'warning');
        }
    };

    barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitAction();
    });
    submitBtn.addEventListener('click', submitAction);

    formGroup.appendChild(destGroup);
    formGroup.appendChild(lineGroup);
    formGroup.appendChild(scannerVisual);
    formGroup.appendChild(labelBarcode);
    formGroup.appendChild(barcodeRow);
    formGroup.appendChild(labelMat);
    formGroup.appendChild(scannerInput);
    formGroup.appendChild(labelAllocation);
    formGroup.appendChild(allocationDisplay);
    formGroup.appendChild(submitBtn);
    
    scannerCard.appendChild(formGroup);
    grid.appendChild(scannerCard);

    // ── Right: Scan Logs ──
    const logsCard = document.createElement('div');
    logsCard.className = 'card';
    logsCard.style.minHeight = '600px';
    logsCard.style.display = 'flex';
    logsCard.style.flexDirection = 'column';

    logsCard.innerHTML = `<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📜 Log Pengeluaran Transit</h3>`;

    const logsContainer = document.createElement('div');
    logsContainer.id = 'scan-logs-container';
    logsContainer.style.flex = '1';
    logsContainer.style.display = 'flex';
    logsContainer.style.flexDirection = 'column';
    logsContainer.style.gap = 'var(--sp-2)';
    logsContainer.style.overflowY = 'auto';

    logsCard.appendChild(logsContainer);
    grid.appendChild(logsCard);
    
    page.appendChild(grid);
    container.appendChild(page);

    renderLogs();

    setTimeout(() => {
      if (barcodeInput) barcodeInput.focus();
    }, 100);

    TopbarComponent.render('/transit/outbound');
  }

  function renderLogs() {
    const container = document.getElementById('scan-logs-container');
    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas scan keluar pada sesi ini.</div>`;
      return;
    }

    container.innerHTML = logs.map(log => `
      <div style="background:var(--bg-secondary);padding:var(--sp-2) var(--sp-3);border-left:4px solid ${log.success ? 'var(--primary-color)' : 'var(--danger-color)'};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${log.time}</span>
          <span style="font-weight:600;color:${log.success ? 'var(--primary-color)' : 'var(--danger-color)'}">${log.success ? '✅ TERKIRIM' : '❌ GAGAL'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:600;font-size:var(--fs-sm);">${log.barcode} <span style="font-weight:normal;color:var(--text-secondary)">— ${log.material}</span></div>
            <span class="badge badge-accent" style="font-size:0.6rem">Ke: ${log.destination}</span>
        </div>
        <div style="font-size:var(--fs-xs);color:var(--success-color);">${log.message}</div>
      </div>
    `).join('');
  }

  return { render };
})();

window.TransitOutboundPage = TransitOutboundPage;
export default TransitOutboundPage;
