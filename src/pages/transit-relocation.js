/* ===== Transit Relocation Page ===== */
const TransitRelocationPage = (() => {
  let isProcessing = false;
  let scannedBarcode = '';
  let scannedMaterial = '';

  function render() {
    if (window.location.hash !== '#/transit/relocation') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(20, 20, 40, 0) 100%); padding: var(--sp-6); border-radius: var(--radius-lg); border: 1px solid rgba(236, 72, 153, 0.2); margin-bottom: var(--sp-6); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div>
            <h2 class="page-title" style="font-size:2rem; font-weight:800; background: linear-gradient(to right, #fbc2eb, #a6c1ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); margin-bottom: 8px;">🔄 Relokasi Internal Transit</h2>
            <p class="page-subtitle" style="color:var(--text-secondary); max-width:600px; line-height:1.5;">Pindahkan letak palet (barcode) antar blok dan baris di dalam area transit.</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--sp-6);">
          <!-- Kiri: Scan -->
          <div class="glass-card" style="padding: var(--sp-5);">
            <h3 style="margin-bottom: var(--sp-4); color: var(--text-primary); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">1. Validasi Barcode Palet</h3>
            <div class="form-group">
              <label class="form-label" style="font-weight:600;">Scan / Ketik Barcode</label>
              <input type="text" id="relocate-barcode" class="form-control" placeholder="Scan Barcode Palet..." autofocus style="font-size: 1.2rem; padding: 16px; background: rgba(0,0,0,0.2); font-family: monospace; color: #fff;" />
              <div id="barcode-info" style="margin-top: 16px; min-height: 80px; padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); font-size: 0.9rem;">
                 <span style="color:var(--text-secondary);">Silakan scan barcode untuk melihat lokasi saat ini...</span>
              </div>
            </div>
          </div>

          <!-- Kanan: Tujuan -->
          <div class="glass-card" style="padding: var(--sp-5);" id="target-section">
            <h3 style="margin-bottom: var(--sp-4); color: var(--text-primary); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">2. Tujuan Pindah Blok</h3>
            
            <div class="form-group">
              <label class="form-label" style="font-weight:600;">Pilih Blok & Baris Tujuan</label>
              <select id="relocate-target" class="form-control" disabled style="font-size: 1.1rem; padding: 12px; background: rgba(0,0,0,0.2); color: #fff;">
                <option value="" style="color:#fff; background:#1a1a2e;">-- Menunggu Scan Barcode --</option>
              </select>
            </div>

            <button id="btn-submit-relocate" class="btn btn-primary" disabled style="width: 100%; padding: 16px; font-size: 1.1rem; margin-top: var(--sp-4); font-weight: bold; background: linear-gradient(45deg, #ec4899, #8b5cf6); border: none; box-shadow: 0 4px 15px rgba(236,72,153,0.3);">
              🚀 Pindahkan Palet Secara Sistem
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(setupEvents, 0);
  }

  function setupEvents() {
    const barcodeInput = document.getElementById('relocate-barcode');
    const targetSelect = document.getElementById('relocate-target');
    const submitBtn = document.getElementById('btn-submit-relocate');
    const infoBox = document.getElementById('barcode-info');

    if (!barcodeInput || !targetSelect || !submitBtn || !infoBox) return;

    barcodeInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.length >= 5) {
        validateBarcode(val);
      } else {
        resetForm();
      }
    });

    submitBtn.addEventListener('click', async () => {
      if (isProcessing) return;
      
      const targetId = targetSelect.value;
      if (!targetId) {
        ToastComponent.show('Pilih blok & baris tujuan terlebih dahulu!', 'warning');
        return;
      }

      isProcessing = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Memproses...';
      submitBtn.disabled = true;

      try {
        const result = await PMCStore.relocateTransitPallet(scannedBarcode, targetId);
        
        if (result.success) {
          ToastComponent.show('Palet berhasil dipindahkan!', 'success');
          barcodeInput.value = '';
          resetForm();
          // Segarkan data global
          if (PMCStore.init) PMCStore.init();
          if (PMCStore.loadTransitInfoFromAPI) PMCStore.loadTransitInfoFromAPI();
          if (PMCStore.loadTransitInventoryFromAPI) PMCStore.loadTransitInventoryFromAPI();
        } else {
          ToastComponent.show(result.message || 'Gagal merelokasi.', 'error');
          submitBtn.innerHTML = '🚀 Pindahkan Palet Secara Sistem';
          submitBtn.disabled = false;
        }
      } catch (err) {
        ToastComponent.show(err.message || 'Terjadi kesalahan koneksi server.', 'error');
        submitBtn.innerHTML = '🚀 Pindahkan Palet Secara Sistem';
        submitBtn.disabled = false;
      } finally {
        isProcessing = false;
      }
    });

    function validateBarcode(code) {
      // Cari barcode di transit global
      const invMatch = PMCStore.transitInventory.find(inv => inv.barcode === code);
      if (!invMatch) {
         infoBox.innerHTML = '<span style="color:var(--danger-color); font-weight:bold;">❌ Barcode tidak ditemukan di Area Transit.</span>';
         resetForm(false);
         return;
      }

      scannedBarcode = code;
      scannedMaterial = invMatch.material;
      
      // Ambil nama block asal dari layouts
      let asalText = "Tidak diletakkan di Baris Spesifik";
      if (invMatch.blockId && invMatch.rowId) {
        const bLayout = PMCStore.getBlockLayout();
        const block = bLayout.find(b => b.id === invMatch.blockId);
        if (block) {
          const row = block.rows.find(r => r.id === invMatch.rowId);
          if (row) {
            asalText = `Blok B${block.blockNumber}.${row.rowNumber}`;
          }
        }
      }

      infoBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="color:var(--text-secondary);">Material</span>
          <span style="font-weight:700; color:var(--text-primary);">${scannedMaterial}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="color:var(--text-secondary);">Lokasi Saat Ini</span>
          <span style="font-weight:700; color:var(--accent-color);">${asalText}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-secondary);">Status Ketersediaan</span>
          <span style="font-weight:600; color:var(--success-color);">Tersedia untuk Dipindah</span>
        </div>
      `;

      populateTargets(invMatch);
    }

    function populateTargets(invInfo) {
       targetSelect.disabled = false;
       submitBtn.disabled = false;
       targetSelect.innerHTML = '<option value="" style="color:#fff; background:#1a1a2e;">-- Pilih Tujuan --</option>';

       const tInfo = PMCStore.transitInfoCache;
       if (!tInfo || !tInfo.blocks) return;

       tInfo.blocks.forEach(block => {
         if (!block.rows) return;
         block.rows.forEach(row => {
           // Skip blok asalnya
           // Note: invInfo fields in frontend store are blockId and rowId (or blockRowId)
           if (row.id === invInfo.rowId || row.id === invInfo.blockRowId) return;

           const currentQty = row.qty || 0;
           
           // Filter blok yang penuh
           if (currentQty >= row.maxPallets) return;
           
           // Filter blok yang saat ini diisi oleh material yang BERBEDA (Kecuali baris Flexible/Slowmoving)
           if (!row.isFlexible && row.material && row.material !== scannedMaterial && currentQty > 0) {
              return;
           }

           const option = document.createElement('option');
           option.value = row.id;
           option.style.background = '#1a1a2e';
           option.style.color = '#fff';
           
           // Highlight blok yang didekasikan (dedicated)
           // row.material is sometimes just what is currently there. But if we know it's dedicated...
           const flexLabel = row.isFlexible ? ' [SLOW]' : '';
           const matLabel = row.material && row.material !== 'MIXED STOCK' ? ` (${row.material})` : (row.isFlexible && currentQty > 0 ? ' (Mixed)' : ' (Kosong)');

           option.textContent = `B${block.blockNumber}.${row.rowNumber}${flexLabel}${matLabel} - Sisa ${row.maxPallets - currentQty} Slot`;
           targetSelect.appendChild(option);
         });
       });
    }

    function resetForm(clearInfo = true) {
      if (clearInfo) {
        infoBox.innerHTML = '<span style="color:var(--text-secondary);">Silakan scan barcode untuk melihat lokasi saat ini...</span>';
      }
      scannedBarcode = '';
      scannedMaterial = '';
      targetSelect.innerHTML = '<option value="">-- Menunggu Scan Barcode --</option>';
      targetSelect.disabled = true;
      submitBtn.disabled = true;
    }
  }

  return { render };
})();

window.TransitRelocationPage = TransitRelocationPage;
export default TransitRelocationPage;
