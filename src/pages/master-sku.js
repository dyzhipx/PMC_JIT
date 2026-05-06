/* ===== Master SKU Page ===== */
const MasterSKUPage = (() => {
  let searchQuery = '';
  let filterUOM = '';
  let currentPage = 1;
  const perPage = 10;
  let _listening = false;

  function render() {
    if (window.location.hash !== '#/master/sku') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    // Listen for skuChanged events to auto-refresh UI after DB operations
    if (!_listening) {
      PMCStore.on('skuChanged', () => {
        if (window.location.hash === '#/master/sku') render();
      });
      _listening = true;
    }

    const page = document.createElement('div');
    page.className = 'page-enter';

    // Add button in topbar
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = '+ Tambah SKU';
    addBtn.addEventListener('click', () => openSKUModal());
    TopbarComponent.render('/master/sku', [addBtn]);

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

    const uomSelect = document.createElement('select');
    uomSelect.className = 'filter-select';
    uomSelect.innerHTML = `<option value="">Semua UOM</option>`;
    const uoms = [...new Set(PMCStore.skuList.map(s => s.uom))];
    uoms.forEach(u => { uomSelect.innerHTML += `<option value="${u}" ${filterUOM === u ? 'selected' : ''}>${u}</option>`; });
    uomSelect.addEventListener('change', e => { filterUOM = e.target.value; currentPage = 1; render(); });
    toolbar.appendChild(uomSelect);

    page.appendChild(toolbar);

    // ── Filtered Data ──
    let filtered = PMCStore.skuList.filter(s => {
      const matchSearch = !searchQuery || s.code.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchUOM = !filterUOM || s.uom === filterUOM;
      return matchSearch && matchUOM;
    });

    const totalItems = filtered.length;
    const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    // ── Table ──
    const tableSection = document.createElement('div');
    tableSection.className = 'section';

    tableSection.appendChild(DataTableComponent.create({
      columns: [
        { key: 'code', label: 'Oracle Code' },
        { key: 'name', label: 'Nama SKU' },
        { key: 'category', label: 'Kategori', render: v => v || '-' },
        { key: 'uom', label: 'UOM', align: 'center',
          render: v => `<span class="badge badge-accent">${v}</span>` },
      ],
      data: paged,
      actions: [
        { icon: '✏️', label: 'Edit', onClick: (row) => openSKUModal(row) },
        { icon: '🗑', label: 'Hapus', onClick: (row) => {
          if (confirm(`Hapus SKU ${row.code}?`)) {
            PMCStore.deleteSKU(row.id);
            ToastComponent.show('Menghapus SKU...', 'info');
          }
        }},
      ],
    }));
    page.appendChild(tableSection);

    // Pagination
    page.appendChild(PaginationComponent.create({
      totalItems, perPage, currentPage,
      onChange: (p) => { currentPage = p; render(); }
    }));

    // ── UOM Conversion Table ──
    const divider = document.createElement('div');
    divider.className = 'divider';
    page.appendChild(divider);

    const uomSection = document.createElement('div');
    uomSection.className = 'section';
    const uomHeader = document.createElement('div');
    uomHeader.className = 'section-header';
    uomHeader.innerHTML = `<h3 class="section-title">📐 Konversi Satuan (UOM Mapping)</h3>`;
    uomSection.appendChild(uomHeader);

    uomSection.appendChild(DataTableComponent.create({
      columns: [
        { key: 'uom', label: 'UOM' },
        { key: 'unit', label: 'Satuan' },
        { key: 'conversion', label: 'Konversi' },
      ],
      data: PMCStore.uomConversions,
    }));
    page.appendChild(uomSection);

    container.appendChild(page);
  }

  function openSKUModal(existing) {
    const isEdit = !!existing;
    const form = document.createElement('div');
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label">Oracle Code</label>
        <input class="form-input" id="sku-code" value="${existing?.code || ''}" placeholder="Contoh: SKU007" ${isEdit ? 'readonly' : ''} />
      </div>
      <div class="form-group">
        <label class="form-label">Nama SKU</label>
        <input class="form-input" id="sku-name" value="${existing?.name || ''}" placeholder="Contoh: ABC Mocca 250g" />
      </div>
      <div class="form-group">
        <label class="form-label">Kategori</label>
        <input class="form-input" id="sku-category" value="${existing?.category || ''}" placeholder="Contoh: Kopi / Susu" />
      </div>
      <div class="form-group">
        <label class="form-label">UOM</label>
        <select class="form-input" id="sku-uom">
          <option value="BOX" ${existing?.uom === 'BOX' ? 'selected' : ''}>BOX</option>
          <option value="PCS" ${existing?.uom === 'PCS' ? 'selected' : ''}>PCS</option>
          <option value="KG" ${existing?.uom === 'KG' ? 'selected' : ''}>KG</option>
        </select>
      </div>
    `;

    ModalComponent.open({
      title: isEdit ? 'Edit SKU' : 'Tambah SKU Baru',
      body: form,
      onSave: () => {
        const code = document.getElementById('sku-code').value.trim();
        const name = document.getElementById('sku-name').value.trim();
        const category = document.getElementById('sku-category').value.trim();
        const uom = document.getElementById('sku-uom').value;
        if (!code || !name) { ToastComponent.show('Kode dan Nama wajib diisi', 'error'); return; }
        
        console.log('DEBUG: Attempting to save SKU:', { code, name, category, uom });
        
        if (isEdit) {
          PMCStore.updateSKU(existing.id, { name, category, uom });
          ToastComponent.show('Memperbarui SKU...', 'info');
        } else {
          PMCStore.addSKU({ code, name, category, uom });
          ToastComponent.show('Menyimpan SKU baru...', 'info');
        }
        ModalComponent.close();
      }
    });
  }

  return { render };
})();

window.MasterSKUPage = MasterSKUPage;
export default MasterSKUPage;
