/* ===== Master Line per SKU Page ===== */
const MasterLineSKUPage = (() => {
  let searchQuery = '';
  let filterLine = '';
  let currentPage = 1;
  const perPage = 10;
  let selectedMappings = new Set();

  // Line color map for badges
  const lineColors = {
    'A': { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
    'B': { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    'C': { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    'D': { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    'E': { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
    'F': { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
    'G': { bg: 'rgba(234, 88, 12, 0.15)', color: '#fb923c', border: 'rgba(234, 88, 12, 0.3)' },
    'H': { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  };

  function getLineBadge(line) {
    const c = lineColors[line] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' };
    return `<span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:0.78rem;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border}">${line}</span>`;
  }

  function render() {
    if (window.location.hash !== '#/master/line-sku') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // Topbar with add button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = '+ Tambah Mapping';
    addBtn.addEventListener('click', () => openAddModal());
    TopbarComponent.render('/master/line-sku', [addBtn]);

    // ── Summary Cards ──
    const data = PMCStore.getLinePerSku();
    const uniqueLines = [...new Set(data.map(d => d.line))].sort();
    const uniqueSkus = [...new Set(data.map(d => d.skuId))];

    const summaryRow = document.createElement('div');
    summaryRow.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px;';

    // Total Mappings card
    summaryRow.appendChild(StatCardComponent.create({
      icon: '🔗', label: 'Total Mapping', value: data.length
    }));
    // Total Lines card
    summaryRow.appendChild(StatCardComponent.create({
      icon: '🏭', label: 'Total Line', value: uniqueLines.length
    }));
    // Total SKU Mapped card
    summaryRow.appendChild(StatCardComponent.create({
      icon: '📦', label: 'SKU Terpetakan', value: uniqueSkus.length
    }));
    page.appendChild(summaryRow);

    // ── Toolbar ──
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const search = document.createElement('div');
    search.className = 'search-input';
    search.innerHTML = `<span class="icon">🔍</span>`;
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Cari SKU...';
    searchInput.value = searchQuery;
    searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; render(); });
    search.appendChild(searchInput);
    toolbar.appendChild(search);

    const lineSelect = document.createElement('select');
    lineSelect.className = 'filter-select';
    lineSelect.innerHTML = `<option value="">Semua Line</option>`;
    uniqueLines.forEach(l => {
      lineSelect.innerHTML += `<option value="${l}" ${filterLine === l ? 'selected' : ''}>${l}</option>`;
    });
    lineSelect.addEventListener('change', e => { filterLine = e.target.value; currentPage = 1; render(); });
    toolbar.appendChild(lineSelect);

    if (selectedMappings.size > 0) {
       const delBtn = document.createElement('button');
       delBtn.className = 'btn btn-danger btn-sm';
       delBtn.style.marginLeft = 'auto';
       delBtn.innerHTML = `🗑 Hapus ${selectedMappings.size} Terpilih`;
       delBtn.addEventListener('click', () => {
          if (confirm(`Yakin hapus ${selectedMappings.size} mapping terpilih?`)) {
             selectedMappings.forEach(key => {
                const parts = key.split('||');
                PMCStore.deleteLinePerSku(parts[0], parts[1]);
             });
             selectedMappings.clear();
             ToastComponent.show('Mapping terpilih berhasil dihapus', 'success');
             render();
          }
       });
       toolbar.appendChild(delBtn);
    }

    page.appendChild(toolbar);

    // ── Filtered Data ──
    let filtered = data.filter(d => {
      const sku = PMCStore.getSKU(d.skuId);
      const skuName = sku ? sku.name : '';
      const skuCode = sku ? sku.code : d.skuId;
      const matchSearch = !searchQuery ||
        skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skuName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLine = !filterLine || d.line === filterLine;
      return matchSearch && matchLine;
    });

    const totalItems = filtered.length;
    const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    // ── Table ──
    const tableSection = document.createElement('div');
    tableSection.className = 'section';

    tableSection.appendChild(DataTableComponent.create({
      columns: [
        { width: '40px', align: 'center', labelHtml: `<input type="checkbox" id="selectAllCb" title="Pilih Semua di Halaman">`, render: (v, row) => {
           const key = `${row.skuId}||${row.line}`;
           return `<input type="checkbox" class="rowCb" data-key="${key}" ${selectedMappings.has(key) ? 'checked' : ''}>`;
        }},
        { key: 'skuId', label: 'Kode SKU', render: v => {
          const sku = PMCStore.getSKU(v);
          return sku ? `<strong>${sku.code}</strong>` : `<span style="color:var(--danger)">${v} ⚠️</span>`;
        }},
        { key: 'skuId', label: 'Nama SKU', render: v => {
          const sku = PMCStore.getSKU(v);
          return sku ? sku.name : '-';
        }},
        { key: 'line', label: 'Production Line', align: 'center', render: v => getLineBadge(v) },
      ],
      data: paged,
      actions: [
        { icon: '🗑', label: 'Hapus', onClick: (row) => {
          if (confirm(`Hapus mapping ${row.skuId} → ${row.line}?`)) {
            PMCStore.deleteLinePerSku(row.skuId, row.line);
            ToastComponent.show('Mapping berhasil dihapus', 'success');
            render();
          }
        }},
      ],
    }));
    page.appendChild(tableSection);

    // Bind checkbox events
    setTimeout(() => {
       const selectAllCb = document.getElementById('selectAllCb');
       if (selectAllCb) {
          const allSelected = paged.length > 0 && paged.every(row => selectedMappings.has(`${row.skuId}||${row.line}`));
          selectAllCb.checked = allSelected;

          selectAllCb.addEventListener('change', (e) => {
             const isChecked = e.target.checked;
             paged.forEach(row => {
                const key = `${row.skuId}||${row.line}`;
                if (isChecked) selectedMappings.add(key);
                else selectedMappings.delete(key);
             });
             render();
          });
       }

       const rowCbs = document.querySelectorAll('.rowCb');
       rowCbs.forEach(cb => {
          cb.addEventListener('change', (e) => {
             const key = e.target.getAttribute('data-key');
             if (e.target.checked) selectedMappings.add(key);
             else selectedMappings.delete(key);
             render();
          });
       });
    }, 0);

    // Pagination
    page.appendChild(PaginationComponent.create({
      totalItems, perPage, currentPage,
      onChange: (p) => { currentPage = p; render(); }
    }));

    // ── Line Summary Section ──
    const divider = document.createElement('div');
    divider.className = 'divider';
    page.appendChild(divider);

    const summarySection = document.createElement('div');
    summarySection.className = 'section';
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'section-header';
    summaryHeader.innerHTML = `<h3 class="section-title">🏭 Ringkasan per Line</h3>`;
    summarySection.appendChild(summaryHeader);

    // Build summary per line
    const lineSummaryData = uniqueLines.map(line => {
      const skuIds = PMCStore.getSkusForLine(line);
      const skuNames = skuIds.map(id => {
        const sku = PMCStore.getSKU(id);
        return sku ? sku.name : id;
      });
      return {
        line,
        count: skuIds.length,
        skus: skuNames.join(', ')
      };
    });

    summarySection.appendChild(DataTableComponent.create({
      columns: [
        { key: 'line', label: 'Line', render: v => getLineBadge(v) },
        { key: 'count', label: 'Jumlah SKU', align: 'center', render: v => `<strong>${v}</strong>` },
        { key: 'skus', label: 'SKU yang Diproduksi', render: v => `<span style="font-size:0.85rem;color:var(--text-secondary)">${v}</span>` },
      ],
      data: lineSummaryData,
    }));
    page.appendChild(summarySection);

    container.appendChild(page);
  }

  function openAddModal() {
    const form = document.createElement('div');

    // Build SKU options
    const skuOptions = PMCStore.skuList.map(s =>
      `<option value="${s.id}">${s.code} — ${s.name}</option>`
    ).join('');

    // Build Line options (A to Y, plus Produksi)
    const defaultLines = Array.from({length: 25}, (_, i) => String.fromCharCode(65 + i));
    defaultLines.push('Produksi');
    const lineOptions = defaultLines.map(l => `<option value="${l}">${l}</option>`).join('');

    form.innerHTML = `
      <div class="form-group">
        <label class="form-label">SKU</label>
        <select class="form-input" id="lps-sku">${skuOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Production Line</label>
        <select class="form-input" id="lps-line">${lineOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label" style="font-size:0.8rem;color:var(--text-secondary)">Atau ketik line baru:</label>
        <input class="form-input" id="lps-line-custom" placeholder="Contoh: Z" />
      </div>
    `;

    ModalComponent.open({
      title: 'Tambah Mapping Line per SKU',
      body: form,
      onSave: () => {
        const skuId = document.getElementById('lps-sku').value;
        const customLine = document.getElementById('lps-line-custom').value.trim();
        const line = customLine || document.getElementById('lps-line').value;

        if (!skuId || !line) {
          ToastComponent.show('SKU dan Line wajib diisi', 'error');
          return;
        }

        const added = PMCStore.addLinePerSku(skuId, line);
        if (!added) {
          ToastComponent.show('Mapping ini sudah ada!', 'error');
          return;
        }

        ToastComponent.show('Mapping berhasil ditambahkan', 'success');
        ModalComponent.close();
        render();
      }
    });
  }

  return { render };
})();

window.MasterLineSKUPage = MasterLineSKUPage;
export default MasterLineSKUPage;
