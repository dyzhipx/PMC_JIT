/* ===== Produksi Mutation Report Page ===== */
const ProduksiMutasiPage = (() => {
  let currentFilters = {
    startDate: '',
    endDate: '',
    material: 'ALL',
    line: 'ALL'
  };

  async function render() {
    if (window.location.hash !== '#/produksi/mutation') return;
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
          <h2 class="page-title">📝 Mutasi Stok Produksi (Line)</h2>
          <p class="page-subtitle">Laporan pergerakan stok bahan baku di lini produksi: Penerimaan, Pemakaian (BPP), Retur, Rijek, dan Opname.</p>
        </div>
        <div style="display:flex; gap: 8px;">
          <button id="btn-export-line-excel" class="btn btn-success">⬇️ Export Excel</button>
        </div>
      `;
      page.appendChild(header);

      // Load mutations from API
      await PMCStore.loadLineMutationsFromAPI(currentFilters);
      if (PMCStore.loadLineMutationReportFromAPI) {
        await PMCStore.loadLineMutationReportFromAPI(currentFilters);
      }

      // Filters
      const filterSection = document.createElement('div');
      filterSection.className = 'section';
      filterSection.style.display = 'flex';
      filterSection.style.gap = 'var(--sp-4)';
      filterSection.style.flexWrap = 'wrap';
      filterSection.style.alignItems = 'end';

      // Date Start
      const selDateStart = document.createElement('div');
      selDateStart.className = 'form-group';
      selDateStart.style.flex = '1';
      selDateStart.style.minWidth = '150px';
      selDateStart.innerHTML = `<label class="form-label">Dari Tanggal</label><input type="date" id="filter-line-date-start" class="form-control" value="${currentFilters.startDate}">`;

      // Date End
      const selDateEnd = document.createElement('div');
      selDateEnd.className = 'form-group';
      selDateEnd.style.flex = '1';
      selDateEnd.style.minWidth = '150px';
      selDateEnd.innerHTML = `<label class="form-label">Sampai Tanggal</label><input type="date" id="filter-line-date-end" class="form-control" value="${currentFilters.endDate}">`;

      // Material
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
      selMat.innerHTML = `<label class="form-label">Material</label><select id="filter-line-mat" class="form-control">${matOpts}</select>`;

      // Line
      const selLine = document.createElement('div');
      selLine.className = 'form-group';
      selLine.style.flex = '1';
      selLine.style.minWidth = '150px';
      const linesSet = new Set();
      const lsObj = PMCStore.lineStock;
      if (lsObj && typeof lsObj === 'object') {
        Object.keys(lsObj).forEach(ln => linesSet.add(ln));
      }
      const schedules = Array.isArray(PMCStore.schedules) ? PMCStore.schedules : [];
      schedules.forEach(s => { if (s.line) linesSet.add(s.line); });
      ['A', 'B', 'C', 'D', 'E'].forEach(l => linesSet.add(l));
      const lines = ['ALL', ...Array.from(linesSet).sort()];
      let lineOpts = '';
      lines.forEach(l => {
        lineOpts += `<option value="${l}" ${currentFilters.line === l ? 'selected' : ''}>${l === 'ALL' ? 'Semua Line' : l}</option>`;
      });
      selLine.innerHTML = `<label class="form-label">Line Produksi</label><select id="filter-line-line" class="form-control">${lineOpts}</select>`;

      filterSection.appendChild(selDateStart);
      filterSection.appendChild(selDateEnd);
      filterSection.appendChild(selMat);
      filterSection.appendChild(selLine);
      page.appendChild(filterSection);

      // Filter listeners
      setTimeout(() => {
        ['line-date-start', 'line-date-end', 'line-mat', 'line-line'].forEach(f => {
          const el = document.getElementById(`filter-${f}`);
          if (el) {
            el.addEventListener('change', (e) => {
              if (f === 'line-date-start') currentFilters.startDate = e.target.value;
              else if (f === 'line-date-end') currentFilters.endDate = e.target.value;
              else if (f === 'line-mat') currentFilters.material = e.target.value;
              else if (f === 'line-line') currentFilters.line = e.target.value;
              render();
            });
          }
        });

        const btnExcel = document.getElementById('btn-export-line-excel');
        if (btnExcel) btnExcel.addEventListener('click', exportExcel);
      }, 0);

      // Table
      const { reportList } = PMCStore.getLineMutationReport(currentFilters);

      const tableSection = document.createElement('div');
      tableSection.className = 'section';
      tableSection.style.overflowX = 'auto';

      if (reportList.length === 0) {
        tableSection.innerHTML = `<div class="empty-state">Belum ada data mutasi produksi yang sesuai dengan filter.</div>`;
      } else {
        const formatNum = (v) => typeof v === 'number' ? v.toLocaleString('id-ID') : v;

        const discrepancyCount = reportList.filter(r => r.selisih !== null && Math.abs(r.selisih) > 0.0001).length;
        if (discrepancyCount > 0) {
          const alert = document.createElement('div');
          alert.className = 'alert alert-warning';
          alert.style.marginBottom = 'var(--sp-4)';
          alert.innerHTML = `⚠️ Terdeteksi <strong>${discrepancyCount} item</strong> dengan selisih antara Saldo Akhir (Buku) dan Stok Aktual (Line).`;
          tableSection.appendChild(alert);
        }

        const tableStyles = `
          <style>
            .table-line-premium {
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
            .table-line-premium thead th {
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
            .table-line-premium tbody td {
              padding: 10px 14px;
              font-size: 0.85rem;
              border-bottom: 1px solid rgba(255, 255, 255, 0.03);
              vertical-align: middle;
              color: #e0e5ec;
              transition: all 0.2s ease;
            }
            .table-line-premium tbody tr:last-child td { border-bottom: none; }
            .table-line-premium tbody tr { transition: all 0.2s ease; }
            .table-line-premium tbody tr:hover { background: rgba(0, 195, 255, 0.05); transform: scale(1.002); }
            .table-line-premium tbody tr:hover td { color: #fff; }
          </style>
        `;

        const thead = `
          <thead>
            <tr>
              <th>Material / Produk</th>
              <th class="align-center">UOM</th>
              <th class="align-right">Saldo Awal</th>
              <th class="align-right">Masuk (Transit)</th>
              <th class="align-right">Pakai (BPP)</th>
              <th class="align-right">Retur (Transit)</th>
              <th class="align-right">Rijek</th>
              <th class="align-right">Adj (Opname)</th>
              <th class="align-right col-highlight">Saldo Akhir</th>
              <th class="align-right col-actual">Stok Aktual</th>
              <th class="align-right">Selisih</th>
            </tr>
          </thead>
        `;

        const pillIn = (v) => v > 0 ? `<span class="pill pill-in">+${formatNum(v)}</span>` : `<span class="pill pill-neutral">-</span>`;
        const pillOut = (v) => v > 0 ? `<span class="pill pill-out">-${formatNum(v)}</span>` : `<span class="pill pill-neutral">-</span>`;
        const pillAdj = (v) => v !== 0 ? `<span class="pill pill-adj">${v > 0 ? '+' : ''}${formatNum(v)}</span>` : `<span class="pill pill-neutral">-</span>`;

        const tbody = `
          <tbody>
            ${reportList.map(r => {
              const hasSelisih = r.selisih !== null && Math.abs(r.selisih) > 0.0001;
              const rowStyle = hasSelisih ? 'background: rgba(255, 61, 113, 0.05); border-left: 3px solid #ff3d71;' : '';

              let selisihHtml = '<span class="pill pill-neutral">0</span>';
              if (hasSelisih) {
                const prefix = r.selisih > 0 ? '+' : '';
                selisihHtml = `<span class="pill ${r.selisih > 0 ? 'badge-danger-glow' : 'badge-warning'}">${prefix}${formatNum(r.selisih)}</span>`;
              }

              return `
                <tr style="${rowStyle}">
                  <td style="font-weight:600; letter-spacing: 0.3px;">${r.material}</td>
                  <td class="align-center" style="color: #a0aec0; font-size: 0.75rem;">${r.uom}</td>
                  <td class="align-right font-monospace">${formatNum(r.initial)}</td>
                  <td class="align-right">${pillIn(r.inbound)}</td>
                  <td class="align-right">${pillOut(r.consume)}</td>
                  <td class="align-right">${pillOut(r.returnOut)}</td>
                  <td class="align-right">${pillOut(r.reject)}</td>
                  <td class="align-right">${pillAdj(r.adjust)}</td>
                  <td class="align-right col-highlight font-monospace" style="font-size: 0.95rem;">${formatNum(r.final)}</td>
                  <td class="align-right col-actual font-monospace" style="font-size: 0.95rem;">${r.actualStock !== null ? formatNum(r.actualStock) : '-'}</td>
                  <td class="align-right">${selisihHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        `;

        const table = document.createElement('table');
        table.className = 'table table-line-premium';
        table.innerHTML = `${tableStyles}${thead}${tbody}`;
        tableSection.appendChild(table);
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

        const wsData = [
          ['Laporan Mutasi Stok Produksi (Line)'],
          ['Filter Tanggal:', dateText],
          ['Filter Material:', currentFilters.material],
          ['Filter Line:', currentFilters.line],
          [],
          ['Material', 'UOM', 'Saldo Awal', 'Masuk (Transit)', 'Pakai (BPP)', 'Retur', 'Rijek', 'Adj (Opname)', 'Saldo Akhir', 'Stok Aktual', 'Selisih']
        ];

        reportList.forEach(r => {
          wsData.push([
            r.material, r.uom, r.initial, r.inbound, r.consume, r.returnOut, r.reject, r.adjust, r.final,
            r.actualStock !== null ? r.actualStock : '-',
            r.selisih !== null ? r.selisih : 0
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mutasi Produksi");
        XLSX.writeFile(wb, "Mutasi_Stok_Produksi.xlsx");
        ToastComponent.show('Berhasil diekspor ke Excel', 'success');
      }

    } catch (err) {
      console.error('Render Error:', err);
      const errBox = document.createElement('div');
      errBox.className = 'section alert alert-danger';
      errBox.innerHTML = `⚠️ <strong>Sistem Error:</strong> ${err.message}`;
      page.appendChild(errBox);
    }

    container.appendChild(page);
    TopbarComponent.render('/produksi/mutation');
  }

  return { render };
})();

window.ProduksiMutasiPage = ProduksiMutasiPage;
export default ProduksiMutasiPage;
