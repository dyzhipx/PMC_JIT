const PrintBarcodePage = (() => {
  function render() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🖨️ Cetak Barcode Kustom</h2>
          <p class="text-secondary">Buat dan cetak rentang barcode secara bebas untuk kebutuhan operasional.</p>
        </div>
      </div>
      
      <div class="card" style="max-width: 600px; margin: 0 auto; margin-top: var(--sp-4);">
        <div class="card-header">
          <h3 class="card-title">Form Cetak Barcode</h3>
        </div>
        <div class="card-body">
          <div class="form-group mb-4" style="background: rgba(108, 92, 231, 0.05); padding: var(--sp-3); border-radius: 8px; border: 1px solid rgba(108, 92, 231, 0.1);">
            <label class="form-label" style="margin-bottom: 8px; font-weight: bold;">Pilih Sumber Data Barcode:</label>
            <div style="display: flex; gap: var(--sp-4);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_source" value="warehouse" checked style="accent-color: var(--primary-color);"> 🏭 Gudang Utama
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_source" value="transit" style="accent-color: var(--primary-color);"> 📦 Blok Transit
              </label>
            </div>
            <small class="text-secondary" style="font-size: 11px; margin-top: 4px; display: block;">Menentukan dari mana data material akan ditarik (autofill).</small>
          </div>

          <div style="display: flex; gap: var(--sp-4); margin-bottom: var(--sp-4);">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Mulai Barcode *</label>
              <input type="text" id="pb-start" list="pb-barcode-list" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color); transition: 0.3s;" placeholder="Ketik/Pilih barcode...">
              <datalist id="pb-barcode-list"></datalist>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Sampai Barcode</label>
              <input type="text" id="pb-end" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color);" placeholder="Misal: 00005">
              <small class="text-secondary" style="font-size: 11px; margin-top: 4px; display: block;">Kosongkan jika hanya cetak 1 barcode</small>
            </div>
          </div>
          
          <div class="form-group mb-4">
            <label class="form-label">Nama Material (Otomatis/Manual)</label>
            <input type="text" id="pb-mat" class="form-input" placeholder="Contoh: KARTON ABC SUSU 12 X 10 X 30 (R3)" style="transition: background-color 0.5s;">
          </div>
          
          <div style="display: flex; gap: var(--sp-4); margin-bottom: var(--sp-4);">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">MID / Nomor Batch</label>
              <input type="text" id="pb-mid" class="form-input" placeholder="MID-202604..." style="transition: background-color 0.5s;">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">QTY per Pallet</label>
              <input type="number" id="pb-qty" class="form-input" placeholder="1000" style="transition: background-color 0.5s;">
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: var(--sp-6);">
            <label class="form-label">Opsi QTY</label>
            <div style="display: flex; gap: var(--sp-4);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_qty_opt" value="show" checked> Tampilkan Angka QTY
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_qty_opt" value="hide"> Kosongkan QTY
              </label>
            </div>
          </div>
          
          <button id="btn-pb-print" class="btn btn-primary w-100" style="padding: 14px; font-size: 16px; justify-content: center;">
            🖨️ Generate PDF & Cetak Barcode (6x2.8 cm)
          </button>
        </div>
      </div>
    `;

    const startInput = document.getElementById('pb-start');
    const matInput = document.getElementById('pb-mat');
    const midInput = document.getElementById('pb-mid');
    const qtyInput = document.getElementById('pb-qty');
    const datalist = document.getElementById('pb-barcode-list');
    const sourceRadios = document.querySelectorAll('input[name="pb_source"]');

    function updateDatalist() {
      if (!window.PMCStore) return;
      const source = document.querySelector('input[name="pb_source"]:checked').value;
      datalist.innerHTML = '';
      
      let options = [];
      if (source === 'warehouse' && window.PMCStore.getWarehouseStock) {
        options = window.PMCStore.getWarehouseStock().map(i => i.barcodeStart || i.barcode);
      } else if (source === 'transit' && Array.isArray(window.PMCStore.transitInventory)) {
        options = window.PMCStore.transitInventory.map(i => i.barcode);
      }
      
      // Remove duplicates
      options = [...new Set(options.filter(Boolean))];
      
      options.forEach(bc => {
        const opt = document.createElement('option');
        opt.value = bc;
        datalist.appendChild(opt);
      });
    }

    sourceRadios.forEach(r => r.addEventListener('change', updateDatalist));
    // Delay slightly to ensure store is initialized if this renders very fast
    setTimeout(updateDatalist, 100);

    startInput.addEventListener('change', () => {
      const bc = startInput.value.trim();
      if (!bc || !window.PMCStore) return;

      const source = document.querySelector('input[name="pb_source"]:checked').value;
      let found = null;
      
      if (source === 'transit' && Array.isArray(window.PMCStore.transitInventory)) {
        found = window.PMCStore.transitInventory.find(i => i.barcode === bc);
      } else if (source === 'warehouse' && window.PMCStore.getWarehouseStock) {
        found = window.PMCStore.getWarehouseStock().find(i => i.barcodeStart === bc || i.barcode === bc);
      }

      if (found) {
        matInput.value = found.material || found.materialName || '';
        midInput.value = found.mid || '';
        qtyInput.value = found.qty || found.qtyPerPallet || '';
        
        // Highlight animation
        [matInput, midInput, qtyInput].forEach(el => {
          el.style.backgroundColor = 'var(--success-color)';
          el.style.color = '#fff';
          setTimeout(() => {
            el.style.backgroundColor = '';
            el.style.color = '';
          }, 500);
        });
      }
    });

    // Print logic
    document.getElementById('btn-pb-print').addEventListener('click', () => {
      const bStart = startInput.value.trim();
      const bEnd = document.getElementById('pb-end').value.trim();
      const mid = midInput.value.trim();
      const qty = qtyInput.value.trim();
      const mat = matInput.value.trim();
      const opt = document.querySelector('input[name="pb_qty_opt"]:checked').value;
      
      if (!bStart) {
        alert("Kolom 'Mulai Barcode' wajib diisi!");
        startInput.focus();
        return;
      }
      
      if (window.BarcodePrinter && window.BarcodePrinter.printLabel) {
        window.BarcodePrinter.printLabel({
          barcodeStart: bStart,
          barcodeEnd: bEnd || bStart,
          mid: mid,
          qty: qty,
          materialName: mat,
          dateIn: new Date().toISOString(),
          printQty: opt === 'show'
        });
      } else {
        alert("Sistem printer barcode belum siap. Harap tunggu beberapa detik atau muat ulang halaman.");
      }
    });
  }

  return { render };
})();

window.PrintBarcodePage = PrintBarcodePage;
export default PrintBarcodePage;
