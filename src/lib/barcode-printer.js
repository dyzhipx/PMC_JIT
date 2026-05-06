const BarcodePrinter = (() => {
  function printLabel({ barcodeStart, barcodeEnd, mid, qty, materialName, dateIn, printQty = true }) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("Library jsPDF belum dimuat. Silakan muat ulang halaman.");
      return;
    }
    if (!window.JsBarcode) {
      alert("Library JsBarcode belum dimuat. Silakan muat ulang halaman.");
      return;
    }

    const startStr = barcodeStart || '';
    const endStr = barcodeEnd || startStr;
    
    // Parse prefixes and numbers to generate range
    const matchStart = startStr.match(/^(.*?)(\d+)$/);
    const matchEnd = endStr.match(/^(.*?)(\d+)$/);

    let barcodes = [];
    if (matchStart && matchEnd && matchStart[1] === matchEnd[1] && startStr !== endStr) {
      const prefix = matchStart[1];
      const startNum = parseInt(matchStart[2], 10);
      const endNum = parseInt(matchEnd[2], 10);
      const padLen = matchStart[2].length;
      
      const minNum = Math.min(startNum, endNum);
      const maxNum = Math.max(startNum, endNum);
      
      // Limit to 500 pages maximum to prevent browser crashing
      const maxLimit = Math.min(maxNum, minNum + 500); 
      for(let i = minNum; i <= maxLimit; i++) {
        barcodes.push(prefix + i.toString().padStart(padLen, '0'));
      }
    } else {
      barcodes.push(startStr);
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [60, 28]
    });

    const canvas = document.createElement('canvas');

    for (let i = 0; i < barcodes.length; i++) {
      if (i > 0) {
        doc.addPage([60, 28], 'landscape');
      }
      
      const bc = barcodes[i];
      
      // -- Dynamic Lookup for each barcode --
      let currentMat = materialName;
      let currentMid = mid;
      let currentQty = qty;
      let currentDate = dateIn;
      
      if (window.PMCStore) {
        let found = null;
        // 1. Check Transit
        if (Array.isArray(window.PMCStore.transitInventory)) {
          found = window.PMCStore.transitInventory.find(item => item.barcode === bc);
        }
        // 2. Check Warehouse
        if (!found && window.PMCStore.getWarehouseStock) {
          found = window.PMCStore.getWarehouseStock().find(item => {
            if (item.barcode === bc || item.barcodeStart === bc) return true;
            if (item.barcodeStart && item.barcodeEnd) {
              const mBc = bc.match(/^(.*?)(\d+)$/);
              const mStart = item.barcodeStart.match(/^(.*?)(\d+)$/);
              const mEnd = item.barcodeEnd.match(/^(.*?)(\d+)$/);
              if (mBc && mStart && mEnd && mBc[1] === mStart[1] && mStart[1] === mEnd[1]) {
                const nBc = parseInt(mBc[2], 10);
                const nStart = parseInt(mStart[2], 10);
                const nEnd = parseInt(mEnd[2], 10);
                return nBc >= Math.min(nStart, nEnd) && nBc <= Math.max(nStart, nEnd);
              }
            }
            return false;
          });
        }
        if (found) {
          currentMat = found.material || currentMat;
          currentMid = found.mid || currentMid;
          currentQty = found.qty || found.qtyPerPallet || currentQty;
          currentDate = found.dateIn || currentDate;
        }
      }
      
      // 1. Generate barcode
      JsBarcode(canvas, bc, {
        format: "CODE128",
        width: 3,        
        height: 120,     
        displayValue: false, 
        margin: 0
      });
      const barcodeDataUrl = canvas.toDataURL("image/png");

      // 2. Build the PDF Layout
      // Left side (Barcode & Material)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text("No. Barcode", 21, 3, { align: "center" });

      doc.addImage(barcodeDataUrl, 'PNG', 4, 4, 34, 10.5);
      
      // Barcode number text
      const bcLength = bc.length;
      let bcFontSize = 9.5; 
      if (bcLength > 20) bcFontSize = 6;
      else if (bcLength > 15) bcFontSize = 7.5;
      
      doc.setFontSize(bcFontSize);
      doc.text(bc, 21, 17.5, { align: "center" }); 

      // Material Name
      let matName = (currentMat || '').toUpperCase();
      let matFontSize = 8;
      doc.setFontSize(matFontSize);
      while(doc.getTextWidth(matName) > 41 && matFontSize > 3) {
        matFontSize -= 0.2;
        doc.setFontSize(matFontSize);
      }
      doc.text(matName, 21, 21.5, { align: "center" });

      // Right side (MID & QTY)
      doc.setFontSize(5.5);
      doc.text("MID:", 51.5, 3.5, { align: "center" });
      
      doc.setFontSize(5);
      const splitMid = doc.splitTextToSize(currentMid || '-', 16);
      doc.text(splitMid, 51.5, 6.5, { align: "center" });

      doc.setFontSize(5.5);
      doc.text("QTY:", 51.5, 13.5, { align: "center" });
      
      const qtyStr = printQty ? (currentQty || '0').toString() : ' ';
      doc.setFontSize(qtyStr.length > 5 ? 10 : 15);
      doc.text(qtyStr, 51.5, 19, { align: "center" });
      
      doc.setFontSize(6.5);
      doc.text(printQty ? 'PCS' : ' ', 51.5, 22.5, { align: "center" });

      // Footer
      const createdDateStr = currentDate ? new Date(currentDate).toLocaleString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}).replace(/\./g, ':') : '-';
      const printDateStr = new Date().toLocaleString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}).replace(/\./g, ':');
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(4.5);
      doc.text(`Created Date: ${createdDateStr}`, 2, 26.5);
      doc.text(`Print Date: ${printDateStr}`, 58, 26.5, { align: "right" });
    }

    doc.autoPrint();
    const pdfBlobUrl = doc.output('bloburl');
    const printWindow = window.open(pdfBlobUrl, '_blank');
    
    if (!printWindow) {
      alert("Pop-up diblokir. Harap izinkan pop-up untuk melihat dan mencetak label.");
    }
  }

  function renderPrintModal() {
    let m = document.getElementById('print-label-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'print-label-modal';
      m.className = 'modal-backdrop';
      m.style.display = 'none'; // Hidden by default
      m.style.zIndex = '9999'; // Ensure it's on top
      m.innerHTML = `
        <div class="modal" style="max-width: 450px; padding: var(--sp-4);">
          <h3 style="margin-bottom: var(--sp-3);">🖨️ Cetak Label Barcode Massal</h3>
          <p style="margin-bottom: var(--sp-4); font-size: 0.9rem; color: var(--text-secondary);">
            Cetak rentang barcode menjadi multi-halaman sekaligus.
          </p>
          
          <div class="form-group" style="margin-bottom: var(--sp-3);">
            <label class="form-label">Material</label>
            <input type="text" id="pl-material" class="form-input" readonly disabled style="background: var(--surface-color);">
          </div>
          
          <div style="display: flex; gap: var(--sp-3); margin-bottom: var(--sp-3);">
            <div class="form-group" style="flex: 1;">
              <label class="form-label" id="pl-label-start">Mulai Barcode</label>
              <input type="text" id="pl-barcode-start" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color);">
            </div>
            <div class="form-group" id="pl-group-end" style="flex: 1;">
              <label class="form-label">Sampai Barcode</label>
              <input type="text" id="pl-barcode-end" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color);">
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: var(--sp-3);">
            <label class="form-label">MID (Nomor Batch)</label>
            <input type="text" id="pl-mid" class="form-input" readonly disabled style="background: var(--surface-color);">
          </div>
          
          <div class="form-group" style="margin-bottom: var(--sp-4);">
            <label class="form-label">Opsi QTY</label>
            <div style="display: flex; gap: var(--sp-3);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pl_qty_option" value="show" checked> Tampilkan QTY (<span id="pl-qty-val"></span>)
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pl_qty_option" value="hide"> Kosongkan QTY
              </label>
            </div>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: var(--sp-3);">
            <button class="btn btn-secondary" onclick="document.getElementById('print-label-modal').style.display='none'">Batal</button>
            <button class="btn btn-primary" id="btn-do-print">🖨️ Generate PDF & Cetak</button>
          </div>
        </div>
      `;
      document.body.appendChild(m);

      document.getElementById('btn-do-print').addEventListener('click', () => {
        const option = document.querySelector('input[name="pl_qty_option"]:checked').value;
        const data = m.__data;
        const startVal = document.getElementById('pl-barcode-start').value;
        const endGroupStyle = document.getElementById('pl-group-end').style.display;
        const endVal = endGroupStyle === 'none' ? startVal : document.getElementById('pl-barcode-end').value;
        
        printLabel({
          barcodeStart: startVal,
          barcodeEnd: endVal,
          mid: document.getElementById('pl-mid').value,
          qty: data.qty,
          materialName: data.materialName,
          dateIn: data.dateIn,
          printQty: option === 'show'
        });
        m.style.display = 'none';
      });
    }
    return m;
  }

  function showModal(data) {
    const m = renderPrintModal();
    m.__data = data;
    
    document.getElementById('pl-material').value = data.materialName || '';
    
    // Support the old param 'barcode' or the new params 'barcodeStart' / 'barcodeEnd'
    const bStart = data.barcodeStart || data.barcode || '';
    const bEnd = data.barcodeEnd || data.barcode || '';
    
    document.getElementById('pl-barcode-start').value = bStart;
    document.getElementById('pl-barcode-end').value = bEnd;
    
    // Dynamically show/hide the "Sampai Barcode" field based on if it's a range
    const endGroup = document.getElementById('pl-group-end');
    const startLabel = document.getElementById('pl-label-start');
    if (bStart === bEnd || !bEnd) {
      endGroup.style.display = 'none';
      startLabel.textContent = 'No. Barcode';
    } else {
      endGroup.style.display = 'block';
      startLabel.textContent = 'Mulai Barcode';
    }
    
    document.getElementById('pl-mid').value = data.mid || '';
    document.getElementById('pl-qty-val').textContent = data.qty || '0';
    
    // reset to show
    document.querySelector('input[name="pl_qty_option"][value="show"]').checked = true;
    
    m.style.display = 'flex';
  }

  return { printLabel, showModal };
})();

window.BarcodePrinter = BarcodePrinter;
