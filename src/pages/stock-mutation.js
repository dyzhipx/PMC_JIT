/* ===== Stock Mutation Page ===== */
const StockMutationPage = (() => {
  let currentFilters = {
    startDate: '',
    endDate: '',
    material: 'ALL',
    line: 'ALL',
    sku: 'ALL',
    block: 'ALL',
    row: 'ALL'
  };

  let _mutationListenerAttached = false;
  const cachedLines = new Set();
  async function render() {
    if (window.location.hash !== '#/transit/mutation') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    try {
      // Header
      const header = document.createElement('div');
      header.className = 'page-header';
      header.innerHTML = `
        <div>
          <h2 class="page-title">📝 Mutasi Stok Area Transit</h2>
          <p class="page-subtitle">Laporan riwayat pergerakan stok beserta Saldo Awal, Inbound, Outbound, dan Saldo Akhir.</p>
        </div>
        <div style="display:flex; gap: 8px;">
          <button id="btn-export-excel" class="btn btn-success">⬇️ Export Excel</button>
          <button id="btn-export-pdf" class="btn btn-danger">⬇️ Export PDF</button>
        </div>
      `;
      page.appendChild(header);

      // Fetch mutations from Backend API based on active filters
      await PMCStore.loadStockMutationsFromAPI(currentFilters);

      // Filters Sections
      const filterSection = document.createElement('div');
      filterSection.className = 'section';
      filterSection.style.display = 'flex';
      filterSection.style.gap = 'var(--sp-4)';
      filterSection.style.flexWrap = 'wrap';
      filterSection.style.alignItems = 'end';
      
      // Populate lines and SKUs from master data
      const skuMap = new Map();
      if (PMCStore.bomData) {
        PMCStore.bomData.forEach(b => {
          if (b.skuId) {
            const skuObj = PMCStore.getSKU(b.skuId);
            skuMap.set(b.skuId, skuObj ? skuObj.name : b.skuId);
          }
        });
      }
      if (PMCStore.lineStock) Object.keys(PMCStore.lineStock).forEach(ln => cachedLines.add(ln));
      if (PMCStore.linePerSku) PMCStore.linePerSku.forEach(l => { if (l.line) cachedLines.add(l.line); });
      // Fallback: Selalu tampilkan Line produksi utama
      ['A', 'B', 'C', 'D', 'E', 'Produksi'].forEach(l => cachedLines.add(l));
      
      const lines = ['ALL', 'Gudang -> Transit', 'Transit -> Gudang', ...Array.from(cachedLines).sort(), 'Koreksi Saldo Awal', 'Stock Check Adjustment', 'BPP Adjustment'];
      const sortedSkus = Array.from(skuMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([id, name]) => ({ id, name }));
      // Select Start Date
      const selDateStart = document.createElement('div');
      selDateStart.className = 'form-group';
      selDateStart.style.flex = '1';
      selDateStart.style.minWidth = '150px';
      selDateStart.innerHTML = `<label class="form-label">Dari Tanggal</label><input type="date" id="filter-date-start" class="form-control" value="${currentFilters.startDate}">`;

      // Select End Date
      const selDateEnd = document.createElement('div');
      selDateEnd.className = 'form-group';
      selDateEnd.style.flex = '1';
      selDateEnd.style.minWidth = '150px';
      selDateEnd.innerHTML = `<label class="form-label">Sampai Tanggal</label><input type="date" id="filter-date-end" class="form-control" value="${currentFilters.endDate}">`;

      // Select Material
      const selMat = document.createElement('div');
      selMat.className = 'form-group';
      selMat.style.flex = '1';
      selMat.style.minWidth = '180px';
      let matOpts = `<option value="ALL">Semua Material</option>`;
      const matSet = new Set();
      PMCStore.bomData.forEach(b => b.components.forEach(c => matSet.add(c.name)));
      Array.from(matSet).sort().forEach(m => {
        matOpts += `<option value="${m}" ${currentFilters.material === m ? 'selected' : ''}>${m}</option>`;
      });
      selMat.innerHTML = `<label class="form-label">Material</label><select id="filter-mat" class="form-control">${matOpts}</select>`;
      
      // Select Line
      const selLine = document.createElement('div');
      selLine.className = 'form-group';
      selLine.style.flex = '1';
      selLine.style.minWidth = '150px';
      let lineOpts = '';
      lines.forEach(l => {
        lineOpts += `<option value="${l}" ${currentFilters.line === l ? 'selected' : ''}>${l === 'ALL' ? 'Semua Line/Sumber' : l}</option>`;
      });
      selLine.innerHTML = `<label class="form-label">Line / Sumber</label><select id="filter-line" class="form-control">${lineOpts}</select>`;

      // Select SKU
      const selSku = document.createElement('div');
      selSku.className = 'form-group';
      selSku.style.flex = '1';
      selSku.style.minWidth = '150px';
      let skuOpts = `<option value="ALL" ${currentFilters.sku === 'ALL' ? 'selected' : ''}>Semua SKU</option>`;
      sortedSkus.forEach(s => {
        skuOpts += `<option value="${s.id}" ${currentFilters.sku === s.id ? 'selected' : ''}>${s.name}</option>`;
      });
      selSku.innerHTML = `<label class="form-label">SKU</label><select id="filter-sku" class="form-control">${skuOpts}</select>`;

      // Select Block
      const selBlock = document.createElement('div');
      selBlock.className = 'form-group';
      selBlock.style.flex = '1';
      selBlock.style.minWidth = '150px';
      let blockOpts = `<option value="ALL">Semua Blok</option>`;
      // Dynamically get blocks from transit cache
      if (!PMCStore.transitInfoCache.blocks || PMCStore.transitInfoCache.blocks.length === 0) {
        await PMCStore.loadTransitInfoFromAPI();
      }
      (PMCStore.transitInfoCache.blocks || []).forEach(b => {
        blockOpts += `<option value="${b.id}" ${currentFilters.block === b.id ? 'selected' : ''}>Blok ${b.blockNumber}</option>`;
      });
      selBlock.innerHTML = `<label class="form-label">Blok</label><select id="filter-block" class="form-control">${blockOpts}</select>`;
      
      // Select Row (Baris) - Cascading from Block
      const selRow = document.createElement('div');
      selRow.className = 'form-group';
      selRow.style.flex = '1';
      selRow.style.minWidth = '150px';
      let rowOpts = `<option value="ALL">Semua Baris</option>`;
      
      if (currentFilters.block !== 'ALL') {
        const selectedBlock = (PMCStore.transitInfoCache.blocks || []).find(b => b.id === currentFilters.block);
        if (selectedBlock && selectedBlock.rows) {
          selectedBlock.rows.forEach(r => {
            const label = `B.${selectedBlock.blockNumber}.${r.rowNumber}`;
            rowOpts += `<option value="${r.id}" ${currentFilters.row === r.id ? 'selected' : ''}>${label}</option>`;
          });
        }
      }
      selRow.innerHTML = `<label class="form-label">Baris</label><select id="filter-row" class="form-control" ${currentFilters.block === 'ALL' ? 'disabled' : ''}>${rowOpts}</select>`;

      filterSection.appendChild(selDateStart);
      filterSection.appendChild(selDateEnd);
      filterSection.appendChild(selMat);
      filterSection.appendChild(selLine);
      filterSection.appendChild(selSku);
      filterSection.appendChild(selBlock);
      filterSection.appendChild(selRow);
      page.appendChild(filterSection);

      // Filter Change Listeners
      setTimeout(() => {
        ['date-start', 'date-end', 'mat', 'line', 'sku', 'block', 'row'].forEach(f => {
          const el = document.getElementById(`filter-${f}`);
          if(el) {
            el.addEventListener('change', (e) => {
              if (f === 'date-start') currentFilters.startDate = e.target.value;
              else if (f === 'date-end') currentFilters.endDate = e.target.value;
              else if (f === 'block') {
                currentFilters.block = e.target.value;
                currentFilters.row = 'ALL'; // Reset row filter when block changes
              }
              else currentFilters[f === 'mat' ? 'material' : f] = e.target.value;
              render(); // re-render layout
            });
          }
        });
        
        const btnExcel = document.getElementById('btn-export-excel');
        if(btnExcel) btnExcel.addEventListener('click', exportExcel);
        
        const btnPdf = document.getElementById('btn-export-pdf');
        if(btnPdf) btnPdf.addEventListener('click', exportPDF);
      }, 0);

      // Table Data
      const { reportList, summary } = PMCStore.getMutationReport(currentFilters);
      

      
      const tableSection = document.createElement('div');
      tableSection.className = 'section';
      tableSection.style.overflowX = 'auto';

      if (reportList.length === 0) {
        tableSection.innerHTML = `<div class="empty-state">Belum ada data mutasi yang sesuai dengan filter.</div>`;
      } else {
        const formatNum = (v) => typeof v === 'number' ? v.toLocaleString('id-ID') : v;
        
        // Calculate total discrepancies
        const discrepancyCount = reportList.filter(r => r.selisih !== null && Math.abs(r.selisih) > 0.0001).length;
      if (discrepancyCount > 0) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-warning';
        alert.style.marginBottom = 'var(--sp-4)';
        alert.innerHTML = `⚠️ Terdeteksi <strong>${discrepancyCount} item</strong> dengan selisih antara Saldo Akhir dan Stok Aktual.`;
        tableSection.appendChild(alert);
      }

      const tableStyles = `
        <style>
          .table-premium {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: rgba(16, 25, 45, 0.4);
            backdrop-filter: blur(12px);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(0, 195, 255, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            margin-top: 10px;
          }
          .table-premium thead th {
            background: rgba(0, 195, 255, 0.08);
            color: #00c3ff;
            font-weight: 600;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            font-size: 0.7rem;
            padding: 12px 14px;
            border-bottom: 2px solid rgba(0, 195, 255, 0.2);
            white-space: nowrap;
          }
          .table-premium tbody td {
            padding: 10px 14px;
            font-size: 0.85rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            vertical-align: middle;
            color: #e0e5ec;
            transition: all 0.2s ease;
          }
          .table-premium tbody tr:last-child td {
            border-bottom: none;
          }
          .table-premium tbody tr {
            transition: all 0.2s ease;
          }
          .table-premium tbody tr:hover {
            background: rgba(0, 195, 255, 0.05);
            transform: scale(1.002);
          }
          .table-premium tbody tr:hover td {
            color: #fff;
          }
          .align-right { text-align: right; }
          .align-center { text-align: center; }
          .pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 0.8rem;
            min-width: 50px;
            text-align: center;
          }
          .pill-in { background: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.2); }
          .pill-out { background: rgba(255, 61, 113, 0.1); color: #ff3d71; border: 1px solid rgba(255, 61, 113, 0.2); }
          .pill-adj { background: rgba(156, 39, 176, 0.1); color: #e040fb; border: 1px solid rgba(156, 39, 176, 0.2); }
          .pill-neutral { background: rgba(255, 255, 255, 0.05); color: #a0aec0; border: 1px solid rgba(255, 255, 255, 0.1); }
          .col-highlight { background: rgba(0, 195, 255, 0.04); font-weight: bold; color: #00c3ff !important; }
          .col-actual { background: rgba(255, 255, 255, 0.02); font-weight: bold; color: #fff; }
          .badge-danger-glow { background: rgba(255, 61, 113, 0.15); color: #ff3d71; border: 1px solid #ff3d71; box-shadow: 0 0 10px rgba(255, 61, 113, 0.3); }
          .badge-success-glow { background: rgba(0, 230, 118, 0.15); color: #00e676; border: 1px solid #00e676; }
        </style>
      `;

      const thead = `
        <thead>
          <tr>
            <th>Material / Produk</th>
            <th class="align-center">UOM</th>
            <th class="align-right">Saldo Awal</th>
            <th class="align-right">Masuk (Gudang)</th>
            <th class="align-right">Retur (Line)</th>
            <th class="align-right">Keluar (OUT)</th>
            <th class="align-center">Relokasi</th>
            <th class="align-right" style="width: 80px;">ADJ</th>
            <th class="align-right col-highlight">Saldo Akhir</th>
            <th class="align-right col-actual">Stok Aktual</th>
            <th class="align-right">Selisih</th>
          </tr>
        </thead>
      `;

      const tbody = `
        <tbody>
          ${reportList.map(r => {
            const hasSelisih = r.selisih !== null && Math.abs(r.selisih) > 0.0001;
            const rowStyle = hasSelisih ? 'background: rgba(255, 61, 113, 0.05); border-left: 3px solid #ff3d71;' : '';
            
            let selisihHtml = '<span class="pill pill-neutral">0</span>';
            if (hasSelisih) {
              const prefix = r.selisih > 0 ? '+' : '';
              selisihHtml = `
                <div style="display:flex; align-items:center; gap: 8px; justify-content: flex-end;">
                  <span class="pill ${r.selisih > 0 ? 'badge-danger-glow' : 'badge-warning'}">${prefix}${formatNum(r.selisih)}</span>
                  <button class="btn-sync" data-mat="${r.material}" data-actual="${r.actualStock || 0}" title="Sinkronkan Saldo Buku dengan Stok Aktual">🔄 Fix</button>
                </div>
              `;
            }

            const inWarehouseHtml = r.inboundWarehouse > 0 
              ? `<span class="pill pill-in">+${formatNum(r.inboundWarehouse)}</span>` 
              : `<span class="pill pill-neutral">-</span>`;

            const inReturnHtml = r.inboundReturn > 0 
              ? `<span class="pill pill-in" style="background: rgba(253, 203, 110, 0.1); color: #fdcb6e; border-color: rgba(253, 203, 110, 0.2);">+${formatNum(r.inboundReturn)}</span>` 
              : `<span class="pill pill-neutral">-</span>`;
              
            const outHtml = r.outbound > 0 
              ? `<span class="pill pill-out">-${formatNum(r.outbound)}</span>` 
              : `<span class="pill pill-neutral">-</span>`;
              
            let relocHtml = `<span class="pill pill-neutral">-</span>`;
            if (r.netReloc > 0) relocHtml = `<span class="pill pill-in">+${formatNum(r.netReloc)}</span>`;
            else if (r.netReloc < 0) relocHtml = `<span class="pill pill-out">${formatNum(r.netReloc)}</span>`;

            const adjHtml = r.adjust !== 0 
              ? `<span class="pill pill-adj">${r.adjust > 0 ? '+' : ''}${formatNum(r.adjust)}</span>` 
              : `<span class="pill pill-neutral">-</span>`;

            return `
              <tr style="${rowStyle}">
                <td style="font-weight:600; letter-spacing: 0.3px;">${r.material}</td>
                <td class="align-center" style="color: #a0aec0; font-size: 0.75rem;">${r.uom}</td>
                <td class="align-right font-monospace">${formatNum(r.initial)}</td>
                <td class="align-right">${inWarehouseHtml}</td>
                <td class="align-right">${inReturnHtml}</td>
                <td class="align-right">${outHtml}</td>
                <td class="align-center">${relocHtml}</td>
                <td class="align-right">${adjHtml}</td>
                <td class="align-right col-highlight font-monospace" style="font-size: 0.95rem;">${formatNum(r.final)}</td>
                <td class="align-right col-actual font-monospace" style="font-size: 0.95rem;">${r.actualStock !== null ? formatNum(r.actualStock) : '-'}</td>
                <td class="align-right">${selisihHtml}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      `;
      
      const table = document.createElement('table');
      table.className = 'table table-premium';
      table.id = 'mutation-table';
      table.innerHTML = `
        <style>
          .btn-sync {
            background: rgba(0, 195, 255, 0.15);
            border: 1px solid #00c3ff;
            color: #00c3ff;
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: bold;
          }
          .btn-sync:hover {
            background: #00c3ff;
            color: #000;
            box-shadow: 0 0 10px rgba(0, 195, 255, 0.5);
          }
        </style>
        ${tableStyles}${thead}${tbody}
      `;
      tableSection.appendChild(table);

      // Attach sync button events
      setTimeout(() => {
        table.querySelectorAll('.btn-sync').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const mat = e.target.getAttribute('data-mat');
            const actual = parseFloat(e.target.getAttribute('data-actual'));
            
            if (confirm(`Apakah Anda yakin ingin menyelaraskan saldo buku ${mat} menjadi ${actual} PCS (sesuai stok fisil aktual)?`)) {
              e.target.disabled = true;
              e.target.innerText = '...';
              
              const res = await PMCStore.reconcileStock(mat, actual, currentFilters.block, currentFilters.row);
              if (res.success) {
                ToastComponent.show(`Saldo ${mat} berhasil disinkronkan.`, 'success');
                render();
              } else {
                ToastComponent.show(res.message, 'error');
                e.target.disabled = false;
                e.target.innerText = '🔄 Fix';
              }
            }
          });
        });
      }, 0);
    }
    
    page.appendChild(tableSection);

    // Export Excel
    function exportExcel() {
      if (typeof XLSX === 'undefined') {
        ToastComponent.show('Library Excel belum dimuat!', 'error');
        return;
      }
      
      const dateText = (currentFilters.startDate || currentFilters.endDate) 
        ? `${currentFilters.startDate || 'Awal'} s/d ${currentFilters.endDate || 'Akhir'}`
        : 'Semua Waktu';

      // We will create a fresh worksheet array from reportList
      const wsData = [
        ['Laporan Mutasi Stok Area Transit'],
        ['Filter Tanggal:', dateText],
        ['Filter Material:', currentFilters.material],
        ['Filter Line:', currentFilters.line],
        ['Filter SKU:', currentFilters.sku],
        ['Filter Blok:', currentFilters.block !== 'ALL' ? `Blok ${ (PMCStore.transitInfoCache.blocks || []).find(b => b.id === currentFilters.block)?.blockNumber || '' }` : 'Semua Blok'],
        [],
        ['Material / Produk', 'UOM', 'Saldo Awal', 'Masuk (Gudang)', 'Retur (Line)', 'Pengeluaran (OUT)', 'Penyesuaian (ADJ)', 'Saldo Akhir', 'Stok Aktual', 'Selisih']
      ];

      reportList.forEach(r => {
         wsData.push([
          r.material, 
          r.uom, 
          r.initial, 
          r.inboundWarehouse, 
          r.inboundReturn,
          r.outbound,
          r.adjust,
          r.final, 
          r.actualStock !== null ? r.actualStock : '-', 
          r.selisih !== null ? r.selisih : 0
         ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mutasi Stok");
      XLSX.writeFile(wb, "Laporan_Mutasi_Stok.xlsx");
      ToastComponent.show('Berhasil diekspor ke Excel', 'success');
    }

    // Export PDF
    function exportPDF() {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        ToastComponent.show('Library PDF belum dimuat. Mengunduh...', 'warning');
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4'); // Use landscape for more columns
      
      doc.setFontSize(16);
      doc.text("Laporan Mutasi Stok Area Transit", 14, 20);
      
      const dateText = (currentFilters.startDate || currentFilters.endDate) 
        ? `${currentFilters.startDate || 'Awal'} s/d ${currentFilters.endDate || 'Akhir'}`
        : 'Semua Waktu';

      doc.setFontSize(10);
      doc.text(`Filter Tanggal: ${dateText}`, 14, 30);
      doc.text(`Filter Material: ${currentFilters.material}`, 14, 36);
      doc.text(`Filter Line: ${currentFilters.line} | Filter SKU: ${currentFilters.sku}`, 14, 42);
      const blockText = currentFilters.block !== 'ALL' ? `Blok ${ (PMCStore.transitInfoCache.blocks || []).find(b => b.id === currentFilters.block)?.blockNumber || '' }` : 'Semua Blok';
      doc.text(`Filter Blok: ${blockText}`, 14, 48);

      const tableCol = ["Material / Produk", "UOM", "Awal", "Msk Gdg", "Retur", "Out", "ADJ", "Book", "Act", "Sel"];
      const tableRows = [];

      reportList.forEach(r => {
        tableRows.push([
          r.material,
          r.uom,
          r.initial.toString(),
          r.inboundWarehouse.toString(),
          r.inboundReturn.toString(),
          r.outbound.toString(),
          r.adjust.toString(),
          r.final.toString(),
          r.actualStock !== null ? r.actualStock.toString() : '-',
          r.selisih !== null ? r.selisih.toString() : '0'
        ]);
      });

      doc.autoTable({
        head: [tableCol],
        body: tableRows,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [108, 92, 231] },
        styles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 40 },
          9: { fontStyle: 'bold' }
        },
        didParseCell: function(data) {
           if (data.column.index === 9 && data.cell.text[0] !== '0') {
              data.cell.styles.textColor = [231, 76, 60]; 
           }
        }
      });

      doc.save('Laporan_Mutasi_Stok.pdf');
      ToastComponent.show('Berhasil diekspor ke PDF', 'success');
    }

    } catch (err) {
      console.error('Render Error:', err);
      const errBox = document.createElement('div');
      errBox.className = 'section alert alert-danger';
      errBox.innerHTML = `⚠️ <strong>Sistem Error:</strong> ${err.message}. Mohon hubungi IT atau refresh halaman.`;
      page.appendChild(errBox);
    }

    container.appendChild(page);
    TopbarComponent.render('/transit/mutation');
  }

  return { render };
})();

window.StockMutationPage = StockMutationPage;
export default StockMutationPage;
