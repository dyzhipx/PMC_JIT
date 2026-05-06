/* ===== Warehouse Delivery Page (Request Pengiriman ke Produksi) ===== */
const WarehouseDeliveryPage = (() => {
  let selectedDate = '';
  let selectedShift = 'SH1';
  let selectedSlot = 1;
  let activeDelivery = null;

  const SHIFTS = [
    { id: 'SH1', label: 'Shift 1' },
    { id: 'SH2', label: 'Shift 2' },
    { id: 'SH3', label: 'Shift 3' },
  ];

  // Time slots now come from ShiftConfig (auto Saturday/weekday)

  function getSlotLabel(shiftId, slotId, dateStr) {
    const slots = ShiftConfig.getSlots(dateStr)[shiftId];
    if (!slots) return `Group ${slotId}`;
    const slot = slots.find(s => s.id === slotId);
    return slot ? `Group ${slotId} (${slot.label})` : `Group ${slotId}`;
  }

  function initData() {
    const dates = PMCStore.getUniqueDates();
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      selectedDate = dates.includes(today) ? today : (dates[0] || today);
      
      // Auto-detect current shift & slot using dashboard logic equivalent
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const mins = h * 60 + m;

      selectedShift = ShiftConfig.detectCurrentShift(selectedDate, mins);

      // Auto-slot based on time within shift
      const SHIFT_SLOTS = ShiftConfig.getSlots(selectedDate);
      const slots = SHIFT_SLOTS[selectedShift] || [];
      selectedSlot = 1;
      for (let i = slots.length - 1; i >= 0; i--) {
        if (mins >= slots[i].startMins) { selectedSlot = slots[i].id; break; }
      }
    }
  }

  async function render() {
    try {
      if (window.location.hash !== '#/warehouse/delivery') return;
      initData();
      ChartWrapper.destroyAll();
      
      // Always refresh delivery object from store
      activeDelivery = await PMCStore.getOrCreateDelivery(selectedDate, selectedShift, selectedSlot);
      const manualSpbs = await PMCStore.getManualSpbs();
      const manualSpbsToday = manualSpbs.filter(spb => {
        if (spb.status === 'completed') return false;
        const spbDate = spb.targetDate ? spb.targetDate.split('T')[0] : spb.createdAt.split('T')[0];
        const spbShift = spb.targetShift;
        
        // Show if:
        // 1. Matches today's date and shift (OR shift not specified)
        // 2. OR matches today's date but no shift specified
        // 3. OR it was scheduled for the PAST and is still active (need to clear backlog)
        const isToday = spbDate === selectedDate;
        const isPast = spbDate < selectedDate;
        
        if (isToday) {
          const spbShiftId = spbShift ? `SH${spbShift}` : null;
          return !spbShiftId || spbShiftId === selectedShift;
        }
        return isPast; // Backlog maintenance
      });
      console.log(`[WarehouseDelivery] Filtered ${manualSpbsToday.length} manual SPBs for ${selectedDate} Shift ${selectedShift}`);

      // Normalize delivery items: map DB fields to frontend fields
      if (activeDelivery && activeDelivery.items) {
        activeDelivery.items = activeDelivery.items.map(item => ({
          ...item,
          material: item.material || item.materialName || 'Unknown',
          required: parseFloat(item.required ?? item.requiredPallets ?? 0),
          scanned: parseFloat(item.scanned ?? item.scannedPallets ?? 0),
          scans: item.scans || [],
          details: item.details || []
        }));
      }
      if (!activeDelivery) {
        activeDelivery = { id: null, status: 'preparing', items: [] };
      }

      const container = document.getElementById('page-content');
      container.innerHTML = '';

      const page = document.createElement('div');
      page.className = 'page-enter';

      // ── Header ──
      const headerBar = document.createElement('div');
      headerBar.className = 'page-header';
      headerBar.style.display = 'flex';
      headerBar.style.justifyContent = 'space-between';
      headerBar.style.alignItems = 'flex-start';

      const titleSec = document.createElement('div');
      titleSec.innerHTML = `
        <h2 class="page-title">🚚 Request Pengiriman (Gudang -> Produksi)</h2>
        <p class="page-subtitle">Scan item untuk mempersiapkan pengiriman material ke area transit produksi</p>
      `;

      const filterSec = document.createElement('div');
      filterSec.style.display = 'flex';
      filterSec.style.gap = 'var(--sp-2)';
      filterSec.style.alignItems = 'center';
      filterSec.style.flexWrap = 'wrap';

      // Date Select
      const dates = PMCStore.getUniqueDates();
      const dateSel = document.createElement('select');
      dateSel.className = 'filter-select';
      dates.forEach(d => {
        dateSel.innerHTML += `<option value="${d}" ${d === selectedDate ? 'selected' : ''}>${PMCStore.formatDate(d)}</option>`;
      });
      dateSel.addEventListener('change', async e => { 
        selectedDate = e.target.value; 
        activeDelivery = await PMCStore.refreshDelivery(selectedDate, selectedShift, selectedSlot);
        await render(); 
      });

      // Shift Select
      const shiftSel = document.createElement('select');
      shiftSel.className = 'filter-select';
      SHIFTS.forEach(s => {
        shiftSel.innerHTML += `<option value="${s.id}" ${s.id === selectedShift ? 'selected' : ''}>${s.label}</option>`;
      });
      shiftSel.addEventListener('change', async e => { 
        selectedShift = e.target.value; 
        activeDelivery = await PMCStore.refreshDelivery(selectedDate, selectedShift, selectedSlot);
        await render(); 
      });

      // Slot Select (with time range labels)
      const slotSel = document.createElement('select');
      slotSel.className = 'filter-select';
      const currentSlots = ShiftConfig.getSlots(selectedDate)[selectedShift] || [];
      currentSlots.forEach(s => {
        slotSel.innerHTML += `<option value="${s.id}" ${s.id === selectedSlot ? 'selected' : ''}>Group ${s.id} (${s.label})</option>`;
      });
      slotSel.addEventListener('change', async e => { 
        selectedSlot = parseInt(e.target.value); 
        activeDelivery = await PMCStore.refreshDelivery(selectedDate, selectedShift, selectedSlot);
        await render(); 
      });

      filterSec.appendChild(dateSel);
      filterSec.appendChild(shiftSel);
      filterSec.appendChild(slotSel);

      headerBar.appendChild(titleSec);
      headerBar.appendChild(filterSec);
      page.appendChild(headerBar);

      // ── Info Bar: current slot time range ──
      const slotLabel = getSlotLabel(selectedShift, selectedSlot, selectedDate);
      const infoBanner = document.createElement('div');
      infoBanner.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-bottom:var(--sp-4);border-left:4px solid var(--accent-color);';
      infoBanner.innerHTML = `
        <span style="font-size:1.2rem">🕐</span>
        <div>
          <div style="font-weight:600;color:var(--text-main)">${slotLabel}</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary)">
            Sinkron dengan jadwal Distribusi Bahan per Jam — ${PMCStore.formatDate(selectedDate)}
          </div>
        </div>
      `;
      page.appendChild(infoBanner);

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
          <span>🔍</span> Scan Barcode Pallet
        </h3>
        <div style="background:#000;border-radius:var(--radius-md);height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);">
          <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
          <div style="color:rgba(255,255,255,0.3);font-size:3rem;">[|||]</div>
        </div>
      `;

      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      // Status Logic
      const isCompleted = activeDelivery.status !== 'preparing';
      
      let totalReq = 0;
      let totalReceived = 0;
      (activeDelivery.items || []).forEach(it => {
        totalReq += (it.required || it.planned || 0);
        if (it.scans) {
          it.scans.forEach(s => {
            if (s.barcode && PMCStore.usedBarcodes.has(s.barcode)) {
              totalReceived++;
            }
          });
        }
      });
      const isFullyReceived = (totalReq > 0 && totalReceived >= totalReq) || activeDelivery.status === 'completed';

      if (isCompleted) {
        let msg = '';
        if (isFullyReceived) {
          msg = '<div class="alert alert-success" style="text-align:center">Pengiriman Selesai & Diterima Transit ✅</div>';
        } else {
          msg = `<div class="alert alert-warning" style="text-align:center">
                   Barang Sedang Dikirim 🚛<br>
                   <small>Menunggu Penerimaan Area Transit (${totalReceived}/${totalReq} Pallet)</small>
                 </div>`;
        }
        formGroup.innerHTML = msg;
      } else {
        const labelBarcode = document.createElement('label');
        labelBarcode.className = 'form-label';
        labelBarcode.textContent = 'No Barcode (Scan)';
        
        const barcodeInput = document.createElement('input');
        barcodeInput.type = 'text';
        barcodeInput.className = 'form-input';
        barcodeInput.placeholder = '100018273...';
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
        
        const scannerInput = document.createElement('input');
        scannerInput.type = 'text';
        scannerInput.className = 'form-input';
        scannerInput.placeholder = 'Karton Mocca...';
        scannerInput.autocomplete = 'off';
        
        const labelQty = document.createElement('label');
        labelQty.className = 'form-label';
        labelQty.style.marginTop = 'var(--sp-3)';
        labelQty.textContent = 'Qty (Pcs / Roll)';
        
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'form-input';
        qtyInput.value = '';
        qtyInput.placeholder = 'Misal: 500';
        qtyInput.min = '1';

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
        labelAllocation.textContent = 'Dialokasikan ke Blok per Baris';
        
        const allocationDisplay = document.createElement('div');
        allocationDisplay.className = 'form-input';
        allocationDisplay.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
        allocationDisplay.style.border = '1px dashed rgba(108, 92, 231, 0.3)';
        allocationDisplay.style.display = 'flex';
        allocationDisplay.style.alignItems = 'center';
        allocationDisplay.style.minHeight = '60px';
        allocationDisplay.style.height = 'auto';
        allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-primary';
        submitBtn.style.width = '100%';
        submitBtn.style.marginTop = 'var(--sp-4)';
        submitBtn.textContent = 'Proses Scan / Input Manual';
        
        barcodeInput.addEventListener('input', (e) => {
          const val = e.target.value.trim();
          if (val.length >= 5) {
            // Cek apakah barcode sudah pernah diterima transit
            if (PMCStore.usedBarcodes.has(val)) {
              scannerInput.value = '';
              supplierInput.value = '';
              qtyInput.value = '';
              allocationDisplay.innerHTML = `<span class="badge badge-danger">🚫 Barcode sudah pernah diterima oleh Transit</span>`;
              return;
            }

            const wStock = PMCStore.getWarehouseStock();
            const found = wStock.find(w => w.barcode === val || w.barcodeStart === val || (w.barcodes && w.barcodes.includes(val)));
            if (found) {
              scannerInput.value = found.material;
              qtyInput.value = found.qtyPerPallet;
              supplierInput.value = found.supplier;
              
              // Prediksi alokasi blok
              const alloc = PMCStore.predictTransitAllocation(found.material);
              if (alloc) {
                if (alloc.isFull) {
                  submitBtn.disabled = true;
                  submitBtn.textContent = 'Stock Over';
                  allocationDisplay.innerHTML = `<span class="badge badge-danger" style="font-size:1.2rem; padding:var(--sp-2); width:100%; text-align:center;">⚠️ Transit Penuh (Dialokasikan ke B${alloc.blockId}.${alloc.rowId} - STOCK OVER)</span>`;
                } else {
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Proses Scan / Input Manual';
                  allocationDisplay.innerHTML = `<span class="badge badge-primary" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📍 B${alloc.blockId}.${alloc.rowId}</span>`;
                }
              } else {
                submitBtn.disabled = true;
                allocationDisplay.innerHTML = `<span class="badge badge-danger">⚠️ Material tidak dikonfigurasi di Blok</span>`;
              }
            } else {
              scannerInput.value = '';
              supplierInput.value = '';
              qtyInput.value = '';
              allocationDisplay.innerHTML = `<span class="badge badge-warning">⚠️ Barcode tidak ditemukan di stok gudang</span>`;
            }
          } else {
            scannerInput.value = '';
            supplierInput.value = '';
            qtyInput.value = '';
            allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
          }
        });

        const processInput = async () => {
          if (submitBtn.disabled) return;
          const barcode = barcodeInput.value.trim() || '-';
          const mat = scannerInput.value.trim();
          const qty = parseFloat(qtyInput.value) || 0;
          const supplier = supplierInput.value.trim();
          
          if (mat && qty > 0) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';
            barcodeInput.disabled = true;
            scannerInput.disabled = true;
            
            try {
              // Get current live prediction at exact moment of submit to lock it into DB
              const alloc = PMCStore.predictTransitAllocation(mat, 1);
              if (alloc && alloc.isFull) {
                 submitBtn.disabled = false;
                 submitBtn.textContent = 'Proses Scan / Input Manual';
                 barcodeInput.disabled = false;
                 scannerInput.disabled = false;
                 ToastComponent.show(`Kapasitas Transit Penuh (Stock Over) untuk B${alloc.blockId}.${alloc.rowId}. Pallet tidak dapat diproses.`, 'danger', 5000);
                 return;
              }
              const targetRowId = alloc ? alloc._originalRowId : null;

              const res = await PMCStore.scanDeliveryItem(activeDelivery.id, mat, barcode, qty, supplier, targetRowId);
              if (res.success) {
                // Notifikasi alokasi hanya untuk scan barcode (per pallet)
                if (barcode !== '-') {
                  let allocMsg = '';
                  if (alloc) {
                    allocMsg = `\n📍 Alokasi: B${alloc.blockId}.${alloc.rowId}`;
                  }
                  ToastComponent.show(
                    `${res.message}\n🏷️ Barcode: ${barcode}${allocMsg}`,
                    'success',
                    6000
                  );
                } else {
                  ToastComponent.show(res.message, 'success');
                }

                if (res.isCompleted) {
                  ToastComponent.show('Semua item telah siap! Barang sedang dikirim.', 'success', 5000);
                }
                await render();
              } else {
                ToastComponent.show(res.message, 'danger');
              }
            } catch (err) {
              ToastComponent.show('Gagal menghubungi server', 'danger');
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Proses Scan / Input Manual';
              barcodeInput.disabled = false;
              scannerInput.disabled = false;
              barcodeInput.value = '';
              scannerInput.value = '';
              qtyInput.value = '';
              supplierInput.value = '';
              allocationDisplay.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';
              barcodeInput.focus();
            }
          } else if (mat) {
             ToastComponent.show('Masukkan Qty (Pcs/Roll) yang valid', 'warning');
          }
        };


        barcodeInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') scannerInput.focus();
        });
        scannerInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') processInput();
        });
        submitBtn.addEventListener('click', processInput);
        
        formGroup.appendChild(labelBarcode);
        formGroup.appendChild(barcodeRow);
        formGroup.appendChild(labelMat);
        formGroup.appendChild(scannerInput);
        formGroup.appendChild(labelQty);
        formGroup.appendChild(qtyInput);
        formGroup.appendChild(labelSupplier);
        formGroup.appendChild(supplierInput);
        formGroup.appendChild(labelAllocation);
        formGroup.appendChild(allocationDisplay);
        formGroup.appendChild(submitBtn);

        const helpText = document.createElement('div');
        helpText.style.fontSize = 'var(--fs-xs)';
        helpText.style.color = 'var(--text-muted)';
        helpText.style.marginTop = 'var(--sp-2)';
        helpText.innerHTML = `Scan ke No Barcode, lalu arahkan kursor ke Nama Material dan enter.`;
        formGroup.appendChild(helpText);

        // Auto focus
        setTimeout(() => barcodeInput.focus(), 100);
      }
      
      scannerCard.appendChild(formGroup);
      grid.appendChild(scannerCard);

      // ── Right: Requested Items List ──
      const itemsCard = document.createElement('div');
      itemsCard.className = 'card';
      itemsCard.style.minHeight = '400px';
      
      itemsCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);border-bottom:1px solid var(--border-color);padding-bottom:var(--sp-2);">
          <h3 style="margin:0;">📦 Daftar Kebutuhan Pengiriman</h3>
          <span class="badge badge-primary">${slotLabel}</span>
        </div>
      `;

      if (activeDelivery.items.length === 0) {
        itemsCard.innerHTML += `<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">Tidak ada kebutuhan pengiriman untuk jadwal / grup ini.</div></div>`;
      } else {
        const listGrid = document.createElement('div');
        listGrid.style.display = 'flex';
        listGrid.style.flexDirection = 'column';
        listGrid.style.gap = 'var(--sp-3)';

        activeDelivery.items.forEach(item => {
          const isFulfilled = item.scanned >= item.required;
          const pct = Math.min(100, Math.round((item.scanned / item.required) * 100));
          
          const rowDiv = document.createElement('div');
          rowDiv.style.background = 'var(--bg-secondary)';
          rowDiv.style.padding = '12px';
          rowDiv.style.borderRadius = 'var(--radius-md)';
          rowDiv.style.borderLeft = `4px solid ${isFulfilled ? 'var(--success-color)' : 'var(--accent-color)'}`;
          
          const pQty = item.details && item.details.length > 0 ? item.details[0].qty : (PMCStore.getPalletQty(item.material) || 1);
          const uom = PMCStore.getMaterialUOM(item.material);
          let actualScanned = 0;
          if (item.scans && item.scans.length > 0) {
             actualScanned = item.scans.reduce((sum, s) => sum + (s.pcs || 0), 0);
          } else {
             actualScanned = Math.round(item.scanned * pQty);
          }

          
          let requiredPcsHtml = '';
          if (item.details && item.details.length > 0) {
             const actualReq = item.details.reduce((s, p) => s + p.qty, 0);
             const batchCounts = {};
             item.details.forEach(p => {
               const key = `${p.supplier}|${p.qty}`;
               if (!batchCounts[key]) batchCounts[key] = { supplier: p.supplier, qty: p.qty, count: 0 };
               batchCounts[key].count++;
             });
             
             requiredPcsHtml = `<div><div style="font-size:var(--fs-xs);color:var(--primary-color);margin-top:2px;">Target: ${actualReq} ${uom} (${actualScanned} Scanned)</div>`;
             requiredPcsHtml += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;justify-content:flex-end;">';
             Object.values(batchCounts).forEach(b => {
                 const badgeColor = b.supplier === 'Aktual Gudang' ? 'var(--success-color)' : (b.supplier === 'Master Data' ? 'var(--text-muted)' : 'var(--accent-color)');
                 requiredPcsHtml += `<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg-secondary);color:${badgeColor};border:1px solid ${badgeColor};white-space:nowrap">Tarik ${b.count} Plt - <strong>${b.supplier}</strong> (@${b.qty})</span>`;
             });
             requiredPcsHtml += '</div></div>';
          } else {
             const actualReq = Math.round(item.required * pQty);
             requiredPcsHtml = `<div style="font-size:var(--fs-xs);color:var(--primary-color);margin-top:2px;">Target: ${actualReq} ${uom} (${actualScanned} Scanned)</div>`;
          }
          
          let displayPalletScanned = PMCStore.formatDecimal(item.scanned, 2);
          if (displayPalletScanned.endsWith('.00')) displayPalletScanned = parseInt(displayPalletScanned);

          let scansHtml = '';
          if (item.scans && item.scans.length > 0) {
             const badges = item.scans.map(s => 
               `<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg-main);color:var(--text-secondary);border:1px solid var(--border-color);white-space:nowrap;">🏷️ ${s.barcode}</span>`
             ).join('');
             scansHtml = `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">${badges}</div>`;
          }

          rowDiv.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div style="flex:1;">
                <div style="font-weight:600;font-size:var(--fs-lg);">${item.material}</div>
                ${(() => {
                  // Tampilkan informasi supplier secara jelas
                  if (item.details && item.details.length > 0) {
                    const supplierMap = {};
                    item.details.forEach(p => {
                      if (!supplierMap[p.supplier]) supplierMap[p.supplier] = { count: 0, qty: p.qty };
                      supplierMap[p.supplier].count++;
                    });
                    const supplierBadges = Object.entries(supplierMap).map(([name, info]) => {
                      const color = name === 'Aktual Gudang' ? '#00e676' : (name === 'Master Data' ? '#a0aec0' : '#00c3ff');
                      return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,0.3);color:${color};border:1px solid ${color};margin-right:4px;">🏢 <strong>${name}</strong> (${info.count} plt × ${info.qty} pcs)</span>`;
                    }).join('');
                    return `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">${supplierBadges}</div>`;
                  } else {
                    // Fallback: cari supplier dari stok gudang
                    const sup = PMCStore.getSupplierForMaterial(item.material);
                    if (sup && sup !== '-') {
                      return `<div style="margin-top:4px;"><span style="font-size:0.75rem;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,0.3);color:#00c3ff;border:1px solid rgba(0,195,255,0.3);">🏢 <strong>${sup}</strong></span></div>`;
                    }
                    return '';
                  }
                })()}
              </div>
              <div style="font-size:var(--fs-sm);color:var(--text-secondary);text-align:right;min-width:120px;">
                ${isFulfilled ? '<span style="color:var(--success-color)">✅ Lengkap</span>' : `${displayPalletScanned} / ${item.required} Pallet`}
                ${requiredPcsHtml}
              </div>
            </div>
            <div style="height:6px;background:var(--bg-main);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${isFulfilled ? 'var(--success-color)' : 'var(--accent-color)'};transition:width 0.3s ease;"></div>
            </div>
            ${scansHtml}
          `;
          listGrid.appendChild(rowDiv);
        });
        itemsCard.appendChild(listGrid);
      }

      grid.appendChild(itemsCard);

      // ── New: Manual SPB Requests Section ──
      const manualCard = document.createElement('div');
      manualCard.className = 'card';
      manualCard.style.gridColumn = '1 / -1';
      manualCard.style.border = '2px dashed var(--accent-color)';
      manualCard.style.background = 'rgba(108, 92, 231, 0.05)';
      
      manualCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);border-bottom:1px solid var(--accent-color);padding-bottom:var(--sp-2);">
          <h3 style="margin:0;">📋 Permintaan Manual (PPIC) — Perlu Disiapkan</h3>
          <span class="badge badge-accent">Prioritas Manual</span>
        </div>
      `;

      if (manualSpbsToday.length === 0) {
        manualCard.innerHTML += `<div class="empty-state" style="padding:var(--sp-4);"><div class="empty-state-text">Tidak ada permintaan manual aktif untuk tanggal ini.</div></div>`;
      } else {
        const mGrid = document.createElement('div');
        mGrid.style.display = 'grid';
        mGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(400px, 1fr))';
        mGrid.style.gap = 'var(--sp-4)';

        manualSpbsToday.forEach(spb => {
          spb.items.forEach(item => {
            if (item.status === 'completed') return;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'glass-card';
            itemDiv.style.padding = '16px';
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.borderLeft = '4px solid var(--accent-color)';

            itemDiv.innerHTML = `
              <div style="flex:1;">
                <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-bottom:4px;">${spb.spbNumber} — ${spb.requestedBy}</div>
                <div style="font-weight:700; font-size:1.1rem; color:var(--text-main);">${item.materialName}</div>
                <div style="font-size:var(--fs-sm); color:var(--accent-light);">Diminta: <strong>${item.qtyPallets} Palet</strong> ${item.qtyPcs ? `(@${item.qtyPcs} pcs)` : ''}</div>
                <div style="font-size:var(--fs-xs); color:var(--text-muted); margin-top:4px;">Alasan: ${spb.reason || '-'}</div>
              </div>
              <button class="btn btn-primary btn-process-manual" data-item-id="${item.id}" data-material="${item.materialName}" data-pcs="${item.qtyPcs || ''}">🔍 Scan & Kirim</button>
            `;
            mGrid.appendChild(itemDiv);
          });
        });
        manualCard.appendChild(mGrid);
      }

      page.appendChild(grid);
      page.appendChild(manualCard);
      container.appendChild(page);

      // Event listeners for Manual SPB
      document.querySelectorAll('.btn-process-manual').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-item-id');
          const mat = btn.getAttribute('data-material');
          const pcs = btn.getAttribute('data-pcs');
          openManualScanModal(itemId, mat, pcs);
        });
      });

      TopbarComponent.render('/warehouse/delivery');
    } catch(err) {
      console.error('WarehouseDeliveryPage render error:', err);
      const container = document.getElementById('page-content');
      container.innerHTML = `<div style="padding:40px;text-align:center;">
        <div style="font-size:2rem;margin-bottom:16px;">⚠️</div>
        <div style="color:var(--danger-color);font-weight:600;margin-bottom:8px;">Terjadi Kesalahan</div>
        <div style="color:var(--text-muted);font-size:var(--fs-sm);">${err.message}</div>
      </div>`;
    }
  }

  // Bind to store changes
  PMCStore.on('deliveryChanged', () => {
    const pageTitle = document.getElementById('page-content').querySelector('.page-header h2')?.textContent || '';
    if (pageTitle.includes('Request Pengiriman')) {
      // Small delay if we triggered it internally so we don't double render unnecessarily, but safe to call
    }
  });

  function openManualScanModal(itemId, materialName, defaultPcs) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';

    const modal = document.createElement('div');
    modal.className = 'card';
    modal.style.cssText = 'width:420px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.5); border:1px solid var(--accent-color);';

    modal.innerHTML = `
      <h3 style="margin-bottom:var(--sp-4);display:flex;align-items:center;gap:8px;">
        <span>🔍</span> Scan Barcode — SPB Manual
      </h3>
      <div style="background:var(--bg-secondary);padding:12px;border-radius:var(--radius-md);margin-bottom:var(--sp-4);border-left:3px solid var(--accent-color);">
        <div style="font-weight:700;font-size:1.1rem;">${materialName}</div>
      </div>
      <div class="form-group">
        <label class="form-label">No Barcode</label>
        <input type="text" id="modal-barcode" class="form-input" placeholder="Scan barcode pallet..." autofocus />
      </div>
      <div class="form-group">
        <label class="form-label">Qty (Pcs)</label>
        <input type="number" id="modal-pcs" class="form-input" value="${defaultPcs}" placeholder="Jumlah pcs per pallet" />
      </div>
      <div class="form-group">
        <label class="form-label">Supplier</label>
        <input type="text" id="modal-supplier" class="form-input" placeholder="Nama supplier" readonly style="background:var(--bg-secondary);" />
      </div>
      <div id="modal-allocation" style="margin-top:var(--sp-2); margin-bottom:var(--sp-4);"></div>
      <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;">
        <button id="modal-cancel" class="btn btn-secondary">Batal</button>
        <button id="modal-submit" class="btn btn-primary" disabled>✅ Proses & Kirim</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const barcodeInput = modal.querySelector('#modal-barcode');
    const pcsInput = modal.querySelector('#modal-pcs');
    const supplierInput = modal.querySelector('#modal-supplier');
    const allocationDiv = modal.querySelector('#modal-allocation');
    const submitBtn = modal.querySelector('#modal-submit');

    barcodeInput.addEventListener('input', () => {
      const val = barcodeInput.value.trim();
      if (val.length >= 5) {
        if (PMCStore.usedBarcodes.has(val)) {
          allocationDiv.innerHTML = `<span class="badge badge-danger">🚫 Barcode sudah pernah dipakai</span>`;
          submitBtn.disabled = true;
          return;
        }

        const wStock = PMCStore.getWarehouseStock();
        const found = wStock.find(w => w.barcode === val || w.barcodeStart === val);
        if (found) {
          if (!pcsInput.value) pcsInput.value = found.qtyPerPallet || '';
          supplierInput.value = found.supplier || '';
          
          const alloc = PMCStore.predictTransitAllocation(materialName);
          if (alloc) {
            allocationDiv.innerHTML = `<div class="badge badge-primary" style="width:100%; text-align:center; font-size:1.2rem;">📍 B${alloc.blockId}.${alloc.rowId}</div>`;
            submitBtn.disabled = false;
          } else {
            allocationDiv.innerHTML = `<div class="badge badge-danger">⚠️ Mapping Line tidak ditemukan</div>`;
            submitBtn.disabled = true;
          }
        } else {
          allocationDiv.innerHTML = `<span class="badge badge-warning">⚠️ Barcode tidak ditemukan di WMS</span>`;
          submitBtn.disabled = true;
        }
      }
    });

    const processAction = async () => {
      if (submitBtn.disabled) return;
      const barcode = barcodeInput.value.trim();
      const pcs = parseFloat(pcsInput.value) || 0;
      const supplier = supplierInput.value.trim();

      if (pcs <= 0) {
        ToastComponent.show('Masukkan qty yang valid', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';

      try {
        const res = await PMCStore.scanManualSpbItem(itemId, barcode, pcs, supplier);
        if (res.success) {
          ToastComponent.show(res.message, 'success');
          document.body.removeChild(overlay);
          await render();
        } else {
          ToastComponent.show(res.message, 'danger');
          submitBtn.disabled = false;
          submitBtn.textContent = '✅ Proses & Kirim';
        }
      } catch (err) {
        ToastComponent.show('Gagal menghubungi server', 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Proses & Kirim';
      }
    };

    barcodeInput.addEventListener('keydown', e => { if(e.key === 'Enter') pcsInput.focus(); });
    pcsInput.addEventListener('keydown', e => { if(e.key === 'Enter') processAction(); });
    submitBtn.addEventListener('click', processAction);
    modal.querySelector('#modal-cancel').addEventListener('click', () => document.body.removeChild(overlay));

    setTimeout(() => barcodeInput.focus(), 100);
  }

  return { render };
})();

window.WarehouseDeliveryPage = WarehouseDeliveryPage;
export default WarehouseDeliveryPage;
