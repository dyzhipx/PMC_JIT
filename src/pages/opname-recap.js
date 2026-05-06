/* ===== Hasil Rekap Opname Page (Pivot) ===== */
const OpnameRecapPage = (() => {
  let recapResult = { lines: [], rows: [] };

  async function loadData() {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate   = document.getElementById('filter-end-date').value;
    const area      = document.getElementById('filter-area').value;

    const btn = document.getElementById('btn-load-recap');
    btn.disabled = true;
    btn.innerHTML = '<span style="opacity:0.7;">⏳ Memuat...</span>';

    const tableWrap = document.getElementById('recap-table-wrap');
    tableWrap.innerHTML = `
      <div style="padding:40px; text-align:center; color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:12px;">⏳</div>
        <div>Sedang memuat data rekap opname...</div>
      </div>`;

    try {
      const data = await PMCStore.getOpnameRecap({ startDate, endDate, area });
      recapResult = data || { lines: [], rows: [] };
    } catch (err) {
      recapResult = { lines: [], rows: [] };
    }

    renderTable();

    btn.disabled = false;
    btn.innerHTML = '🔄 Tampilkan';
  }

  function render() {
    if (window.location.hash !== '#/opname-recap') return;
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Header ──
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <div>
        <h2 class="page-title">📊 Hasil Rekap Opname</h2>
        <p class="page-subtitle">Laporan rekap stock check per material — Line Produksi &amp; Gudang Transit.</p>
      </div>
    `;
    page.appendChild(header);

    // ── Filters Card ──
    const linesSet = new Set();
    const ls = PMCStore.lineStock;
    if (ls && typeof ls === 'object') Object.keys(ls).forEach(l => linesSet.add(l));
    const allLines = [...linesSet].sort();

    const filterCard = document.createElement('div');
    filterCard.className = 'card';
    filterCard.style.marginBottom = 'var(--sp-4)';
    filterCard.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:var(--sp-3); align-items:flex-end;">
        <div class="form-group" style="flex:1; min-width:140px;">
          <label class="form-label">📅 Tanggal Mulai</label>
          <input type="date" id="filter-start-date" class="form-input">
        </div>
        <div class="form-group" style="flex:1; min-width:140px;">
          <label class="form-label">📅 Tanggal Akhir</label>
          <input type="date" id="filter-end-date" class="form-input">
        </div>
        <div class="form-group" style="flex:1; min-width:160px;">
          <label class="form-label">🏭 Filter Area</label>
          <select id="filter-area" class="form-input">
            <option value="ALL">Semua Area (Line + Transit)</option>
            <option value="ALL_LINES">Semua Line Produksi</option>
            <option value="TRANSIT">Hanya Transit</option>
            ${allLines.map(l => `<option value="${l}">Hanya Line ${l}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex; gap:var(--sp-2); padding-bottom:2px;">
          <button id="btn-load-recap" class="btn btn-primary" style="font-weight:700;">🔄 Tampilkan</button>
          <button id="btn-export-excel" class="btn btn-success" style="font-weight:700;">📊 Excel</button>
          <button id="btn-export-pdf" class="btn" style="background:linear-gradient(135deg,#e74c3c,#c0392b); color:white; font-weight:700;">📄 PDF</button>
        </div>
      </div>
    `;
    page.appendChild(filterCard);

    // ── Summary Row ──
    const summaryRow = document.createElement('div');
    summaryRow.id = 'recap-summary';
    summaryRow.style.cssText = 'display:flex; gap:var(--sp-3); margin-bottom:var(--sp-4); flex-wrap:wrap;';
    page.appendChild(summaryRow);

    // ── Table Wrapper ──
    const tableOuter = document.createElement('div');
    tableOuter.className = 'card';
    tableOuter.style.cssText = 'padding:0; overflow:hidden;';

    const tableWrap = document.createElement('div');
    tableWrap.id = 'recap-table-wrap';
    tableWrap.style.cssText = 'overflow-x:auto; max-height:72vh; overflow-y:auto;';
    tableWrap.innerHTML = `
      <div style="padding:40px; text-align:center; color:var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:12px;">📋</div>
        <div>Klik <strong>"Tampilkan"</strong> untuk memuat rekap opname.</div>
      </div>`;
    tableOuter.appendChild(tableWrap);
    page.appendChild(tableOuter);

    container.appendChild(page);

    // ── Event Listeners ──
    document.getElementById('btn-load-recap').addEventListener('click', loadData);
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
    document.getElementById('btn-export-pdf').addEventListener('click', exportToPdf);

    // Default: today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filter-start-date').value = today;
    document.getElementById('filter-end-date').value   = today;

    loadData();
    TopbarComponent.render('Hasil Rekap Opname');
  }

  function renderTable() {
    const wrap = document.getElementById('recap-table-wrap');
    if (!wrap) return;

    const { lines, rows } = recapResult;

    // ── Summary cards ──
    const summaryEl = document.getElementById('recap-summary');
    if (summaryEl) {
      const totalMaterials = rows.length;
      const totalSelisihPos = rows.filter(r => r.selisih > 0).length;
      const totalSelisihNeg = rows.filter(r => r.selisih < 0).length;
      const totalOk         = rows.filter(r => r.selisih === 0).length;
      summaryEl.innerHTML = `
        ${_summaryCard('📦', 'Total Material', totalMaterials, 'var(--primary)')}
        ${_summaryCard('✅', 'Stok Sesuai', totalOk, 'var(--success)')}
        ${_summaryCard('⬆️', 'Lebih Fisik', totalSelisihPos, '#f39c12')}
        ${_summaryCard('⬇️', 'Kurang Fisik', totalSelisihNeg, 'var(--danger)')}
      `;
    }

    if (!rows || rows.length === 0) {
      wrap.innerHTML = `
        <div style="padding:60px; text-align:center; color:var(--text-muted);">
          <div style="font-size:2.5rem; margin-bottom:12px;">🔍</div>
          <div>Tidak ada data opname pada periode yang dipilih.</div>
        </div>`;
      return;
    }

    // Build pivot table: single column per line (Fisik only) + Transit (Fisik only)
    let thLines = '';
    lines.forEach(ln => {
      thLines += `<th style="text-align:right; background:rgba(108,92,231,0.12); min-width:90px; border-right:1px solid var(--border-color);">Line ${ln}</th>`;
    });

    let trs = '';
    rows.forEach((row, idx) => {
      const selColor = row.selisih > 0 ? 'color:#f39c12; font-weight:bold;'
                     : row.selisih < 0 ? 'color:var(--danger); font-weight:bold;'
                     : 'color:var(--text-muted);';
      const selText  = (row.selisih > 0 ? '+' : '') + row.selisih.toLocaleString('id-ID');
      const rowBg    = idx % 2 === 0 ? '' : 'background:rgba(255,255,255,0.02);';

      let tdLines = '';
      lines.forEach(ln => {
        const ld = row.lineValues[ln] || { qtyBook: 0, qtyPhysical: 0 };
        const physNum   = ld.qtyPhysical.toLocaleString('id-ID');
        const physColor = ld.qtyPhysical !== ld.qtyBook
          ? (ld.qtyPhysical > ld.qtyBook ? 'color:#f39c12;' : 'color:var(--danger);')
          : '';
        tdLines += `<td style="text-align:right; font-family:monospace; ${physColor} border-right:1px solid var(--border-color);">${ld.qtyPhysical > 0 ? physNum : '<span style="opacity:0.3;">-</span>'}</td>`;
      });

      const trPhysColor = row.transit.qtyPhysical !== row.transit.qtyBook
        ? (row.transit.qtyPhysical > row.transit.qtyBook ? 'color:#f39c12;' : 'color:var(--danger);')
        : '';

      trs += `
        <tr style="${rowBg}">
          <td style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary); white-space:nowrap;">${row.oracleCode || '-'}</td>
          <td style="font-weight:600; min-width:200px;">${row.materialName}</td>
          <td style="text-align:center;"><span class="badge badge-accent" style="font-size:0.75rem;">${row.uom}</span></td>
          ${tdLines}
          <td style="text-align:right; font-family:monospace; ${trPhysColor} border-right:1px solid var(--border-color);">${row.transit.qtyPhysical > 0 ? row.transit.qtyPhysical.toLocaleString('id-ID') : '<span style="opacity:0.3;">-</span>'}</td>
          <td style="text-align:right; font-family:monospace; font-weight:bold;">${row.totalBook.toLocaleString('id-ID')}</td>
          <td style="text-align:right; font-family:monospace; font-weight:bold;">${row.totalPhysical.toLocaleString('id-ID')}</td>
          <td style="text-align:right; ${selColor}">${selText}</td>
        </tr>`;
    });

    // ── Grand total footer ──
    const grandBook     = rows.reduce((s, r) => s + r.totalBook, 0);
    const grandPhysical = rows.reduce((s, r) => s + r.totalPhysical, 0);
    const grandSelisih  = grandPhysical - grandBook;
    const grandColor    = grandSelisih > 0 ? 'color:#f39c12;' : grandSelisih < 0 ? 'color:var(--danger);' : '';

    let tfLines = '';
    lines.forEach(ln => {
      const physSum = rows.reduce((s, r) => s + (r.lineValues[ln]?.qtyPhysical || 0), 0);
      tfLines += `<td style="text-align:right; font-weight:bold; font-family:monospace; border-right:1px solid var(--border-color);">${physSum.toLocaleString('id-ID')}</td>`;
    });
    const trPhys = rows.reduce((s, r) => s + r.transit.qtyPhysical, 0);

    const footerStyle = 'background:rgba(108,92,231,0.12); font-weight:bold;';

    // ── Not Yet Opname'd Section ──
    let notOpnamedHtml = '';
    if (recapResult.notOpnamed && recapResult.notOpnamed.length > 0) {
      let notOpTrs = '';
      recapResult.notOpnamed.forEach(row => {
        notOpTrs += `
          <tr>
            <td style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary); white-space:nowrap;">${row.oracleCode || '-'}</td>
            <td style="font-weight:600;">${row.materialName}</td>
            <td style="text-align:center;"><span class="badge badge-accent" style="font-size:0.75rem;">${row.uom}</span></td>
            <td style="text-align:right; font-family:monospace; color:var(--danger); font-weight:bold;">${row.lastKnownBook.toLocaleString('id-ID')}</td>
          </tr>`;
      });
      notOpnamedHtml = `
        <div style="margin-top:var(--sp-4); padding:var(--sp-3); border-radius:var(--radius-lg); background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.2);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <div style="font-size:1.5rem;">⚠️</div>
            <div>
              <h3 style="color:var(--danger); margin:0;">Material Belum Ter-Opname (${recapResult.notOpnamed.length})</h3>
              <div style="font-size:0.8rem; color:var(--text-muted);">Material di bawah ini tercatat memiliki stok buku di sistem namun belum dilakukan opname pada periode ini.</div>
            </div>
          </div>
          <table class="data-table" style="font-size:0.83rem; width:100%; border-collapse:collapse; background:var(--bg-card);">
            <thead>
              <tr style="background:rgba(231,76,60,0.1);">
                <th style="text-align:left;">Kode Oracle</th>
                <th style="text-align:left;">Nama Material</th>
                <th style="text-align:center;">UOM</th>
                <th style="text-align:right;">Stok Buku Terakhir</th>
              </tr>
            </thead>
            <tbody>${notOpTrs}</tbody>
          </table>
        </div>
      `;
    }

    wrap.innerHTML = `
      <table class="data-table" id="recap-table" style="font-size:0.83rem; width:100%; border-collapse:collapse;">
        <thead style="position:sticky; top:0; z-index:10; background:var(--bg-card);">
          <tr>
            <th style="min-width:120px; text-align:left;">Kode Oracle</th>
            <th style="min-width:200px; text-align:left;">Nama Material</th>
            <th style="text-align:center;">UOM</th>
            ${thLines}
            <th style="text-align:right; background:rgba(16,185,129,0.12); min-width:90px; border-right:1px solid var(--border-color);">Transit</th>
            <th style="text-align:right; min-width:90px;">Total Buku</th>
            <th style="text-align:right; min-width:90px;">Total Aktual</th>
            <th style="text-align:right; min-width:80px;">Selisih</th>
          </tr>
        </thead>
        <tbody>${trs}</tbody>
        <tfoot>
          <tr style="${footerStyle}">
            <td colspan="3" style="font-weight:bold; padding:8px 12px;">Grand Total (${rows.length} material)</td>
            ${tfLines}
            <td style="text-align:right; font-family:monospace; border-right:1px solid var(--border-color);">${trPhys.toLocaleString('id-ID')}</td>
            <td style="text-align:right; font-family:monospace;">${grandBook.toLocaleString('id-ID')}</td>
            <td style="text-align:right; font-family:monospace;">${grandPhysical.toLocaleString('id-ID')}</td>
            <td style="text-align:right; ${grandColor}">${(grandSelisih > 0 ? '+' : '') + grandSelisih.toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      </table>
      ${notOpnamedHtml}
    `;
  }

  function _summaryCard(icon, label, value, color) {
    return `
      <div style="flex:1; min-width:130px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:var(--sp-3) var(--sp-4); display:flex; flex-direction:column; gap:4px;">
        <div style="font-size:1.4rem;">${icon}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">${label}</div>
        <div style="font-size:1.6rem; font-weight:900; color:${color};">${value}</div>
      </div>`;
  }

  // ── Export Excel ──
  function exportToExcel() {
    const { lines, rows } = recapResult;
    if (!rows || rows.length === 0) { ToastComponent.show('Tidak ada data untuk diexport', 'warning'); return; }

    const exportArr = rows.map(row => {
      const obj = {
        'Kode Oracle': row.oracleCode || '-',
        'Nama Material': row.materialName,
        'UOM': row.uom,
      };
      lines.forEach(ln => {
        const ld = row.lineValues[ln] || { qtyBook: 0, qtyPhysical: 0 };
        obj[`Line ${ln} - Buku`]  = ld.qtyBook;
        obj[`Line ${ln} - Fisik`] = ld.qtyPhysical;
      });
      obj['Transit - Buku']  = row.transit.qtyBook;
      obj['Transit - Fisik'] = row.transit.qtyPhysical;
      obj['Total Stok Buku']   = row.totalBook;
      obj['Total Stok Aktual'] = row.totalPhysical;
      obj['Selisih']           = row.selisih;
      return obj;
    });

    try {
      const ws = XLSX.utils.json_to_sheet(exportArr);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Opname');
      const startDate = document.getElementById('filter-start-date').value;
      const endDate   = document.getElementById('filter-end-date').value;
      XLSX.writeFile(wb, `Rekap_Opname_${startDate}_sd_${endDate}.xlsx`);
      ToastComponent.show('Export Excel berhasil!', 'success');
    } catch (err) {
      console.error(err);
      ToastComponent.show('Gagal export Excel.', 'danger');
    }
  }

  // ── Export PDF ──
  function exportToPdf() {
    const { lines, rows } = recapResult;
    if (!rows || rows.length === 0) { ToastComponent.show('Tidak ada data untuk diexport', 'warning'); return; }

    try {
      if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        ToastComponent.show('Library PDF belum termuat. Coba muat ulang halaman.', 'danger'); return;
      }
      const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
      const startDate = document.getElementById('filter-start-date').value || '-';
      const endDate   = document.getElementById('filter-end-date').value   || '-';
      const areaEl    = document.getElementById('filter-area');
      const areaText  = areaEl.options[areaEl.selectedIndex].text;

      doc.setFontSize(16); doc.setFont('helvetica', 'bold');
      doc.text('Laporan Rekap Opname', 14, 18);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Periode : ${startDate} s/d ${endDate}`, 14, 25);
      doc.text(`Area    : ${areaText}`, 14, 30);
      doc.text(`Dicetak : ${new Date().toLocaleString('id-ID')}`, 14, 35);

      // Build head & body
      const lineHeads1 = [];
      const lineHeads2 = [];
      lines.forEach(ln => {
        lineHeads1.push({ content: `Line ${ln}`, colSpan: 2, styles: { halign: 'center', fillColor: [108, 92, 231] } });
        lineHeads2.push({ content: 'Buku', styles: { halign: 'right', fontSize: 7, fillColor: [80, 70, 160] } });
        lineHeads2.push({ content: 'Fisik', styles: { halign: 'right', fontSize: 7, fillColor: [80, 70, 160] } });
      });

      const head = [
        [
          { content: 'Kode Oracle', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Nama Material', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'UOM', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          ...lineHeads1,
          { content: 'Transit', colSpan: 2, styles: { halign: 'center', fillColor: [16, 185, 129] } },
          { content: 'Total Buku', rowSpan: 2, styles: { halign: 'right', valign: 'middle' } },
          { content: 'Total Aktual', rowSpan: 2, styles: { halign: 'right', valign: 'middle' } },
          { content: 'Selisih', rowSpan: 2, styles: { halign: 'right', valign: 'middle' } },
        ],
        [
          ...lineHeads2,
          { content: 'Buku', styles: { halign: 'right', fontSize: 7, fillColor: [10, 140, 100] } },
          { content: 'Fisik', styles: { halign: 'right', fontSize: 7, fillColor: [10, 140, 100] } },
        ]
      ];

      const body = rows.map(row => {
        const cells = [
          row.oracleCode || '-',
          row.materialName,
          row.uom,
        ];
        lines.forEach(ln => {
          const ld = row.lineValues[ln] || { qtyBook: 0, qtyPhysical: 0 };
          cells.push(ld.qtyBook > 0 ? ld.qtyBook.toLocaleString('id-ID') : '-');
          cells.push(ld.qtyPhysical > 0 ? ld.qtyPhysical.toLocaleString('id-ID') : '-');
        });
        cells.push(row.transit.qtyBook > 0 ? row.transit.qtyBook.toLocaleString('id-ID') : '-');
        cells.push(row.transit.qtyPhysical > 0 ? row.transit.qtyPhysical.toLocaleString('id-ID') : '-');
        cells.push(row.totalBook.toLocaleString('id-ID'));
        cells.push(row.totalPhysical.toLocaleString('id-ID'));
        cells.push((row.selisih > 0 ? '+' : '') + row.selisih.toLocaleString('id-ID'));
        return cells;
      });

      doc.autoTable({
        startY: 40,
        head,
        body,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [30, 30, 60], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 255] },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 40 },
          2: { cellWidth: 14, halign: 'center' },
        },
        didParseCell: (data) => {
          // Color selisih column
          const lastColIdx = 3 + lines.length * 2 + 2 + 3 - 1;
          if (data.section === 'body' && data.column.index === lastColIdx) {
            const val = parseFloat(String(data.cell.raw).replace(/[^0-9.-]/g, ''));
            if (val < 0) data.cell.styles.textColor = [231, 76, 60];
            else if (val > 0) data.cell.styles.textColor = [243, 156, 18];
          }
        }
      });

      const startDateStr = startDate.replace(/-/g, '');
      const endDateStr   = endDate.replace(/-/g, '');
      doc.save(`Rekap_Opname_${startDateStr}_sd_${endDateStr}.pdf`);
      ToastComponent.show('Export PDF berhasil!', 'success');
    } catch (err) {
      console.error(err);
      ToastComponent.show('Gagal export PDF: ' + err.message, 'danger');
    }
  }

  return { render };
})();

window.OpnameRecapPage = OpnameRecapPage;
export default OpnameRecapPage;
