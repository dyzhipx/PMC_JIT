/* ===== Master Supplier Page ===== */
const MasterSupplierPage = (() => {
  let searchQuery = '';
  let currentPage = 1;
  const perPage = 10;
  let _listening = false;

  function render() {
    if (window.location.hash !== '#/master/supplier') return;

    if (!_listening) {
      PMCStore.on('supplierChanged', () => {
        if (window.location.hash === '#/master/supplier') render();
      });
      _listening = true;
    }

    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // Add button in topbar
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = '+ Tambah Supplier';
    addBtn.addEventListener('click', () => openSupplierModal());
    TopbarComponent.render('/master/supplier', [addBtn]);

    // ── Toolbar ──
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const search = document.createElement('div');
    search.className = 'search-input';
    search.innerHTML = `<span class="icon">🔍</span>`;
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Cari supplier...';
    searchInput.value = searchQuery;
    searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; render(); });
    search.appendChild(searchInput);
    toolbar.appendChild(search);

    page.appendChild(toolbar);

    // ── Filtered Data ──
    let filtered = PMCStore.supplierList.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || (s.contact || '').toLowerCase().includes(q);
    });

    const totalItems = filtered.length;
    const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    // ── Summary Cards ──
    const summaryRow = document.createElement('div');
    summaryRow.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;';
    summaryRow.appendChild(StatCardComponent.create({
      icon: '🏢', label: 'Total Supplier', value: PMCStore.supplierList.length,
      sub: 'Supplier terdaftar', color: 'rgba(108, 92, 231, 0.12)'
    }));
    page.appendChild(summaryRow);

    // ── Table ──
    const tableSection = document.createElement('div');
    tableSection.className = 'section';

    tableSection.appendChild(DataTableComponent.create({
      columns: [
        { key: 'code', label: 'Kode Supplier' },
        { key: 'name', label: 'Nama Supplier' },
        { key: 'contact', label: 'Kontak', render: v => v || '<span style="color:var(--text-muted)">-</span>' },
        { key: 'address', label: 'Alamat', render: v => v || '<span style="color:var(--text-muted)">-</span>' },
      ],
      data: paged,
      actions: [
        { icon: '✏️', label: 'Edit', onClick: (row) => openSupplierModal(row) },
        {
          icon: '🗑', label: 'Hapus', onClick: (row) => {
            if (confirm(`Hapus supplier ${row.name}?`)) {
              PMCStore.deleteSupplier(row.id);
              ToastComponent.show('Supplier berhasil dihapus', 'success');
              render();
            }
          }
        },
      ],
    }));
    page.appendChild(tableSection);

    // Pagination
    page.appendChild(PaginationComponent.create({
      totalItems, perPage, currentPage,
      onChange: (p) => { currentPage = p; render(); }
    }));

    container.appendChild(page);
  }

  function openSupplierModal(existing) {
    const isEdit = !!existing;
    const form = document.createElement('div');
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label">Kode Supplier</label>
        <input class="form-input" id="sup-code" value="${existing?.code || ''}" placeholder="Contoh: SUP001" />
      </div>
      <div class="form-group">
        <label class="form-label">Nama Supplier</label>
        <input class="form-input" id="sup-name" value="${existing?.name || ''}" placeholder="Contoh: PT. Sumber Jaya" />
      </div>
      <div class="form-group">
        <label class="form-label">Kontak (Telp/Email)</label>
        <input class="form-input" id="sup-contact" value="${existing?.contact || ''}" placeholder="Contoh: 08123456789" />
      </div>
      <div class="form-group">
        <label class="form-label">Alamat</label>
        <input class="form-input" id="sup-address" value="${existing?.address || ''}" placeholder="Contoh: Jl. Industri No. 10" />
      </div>
    `;

    ModalComponent.open({
      title: isEdit ? 'Edit Supplier' : 'Tambah Supplier Baru',
      body: form,
      onSave: () => {
        const code = document.getElementById('sup-code').value.trim();
        const name = document.getElementById('sup-name').value.trim();
        const contact = document.getElementById('sup-contact').value.trim();
        const address = document.getElementById('sup-address').value.trim();
        if (!code || !name) { ToastComponent.show('Kode dan Nama wajib diisi', 'error'); return; }
        if (isEdit) {
          PMCStore.updateSupplier(existing.id, { code, name, contact, address });
          ToastComponent.show('Supplier berhasil diperbarui', 'success');
        } else {
          if (PMCStore.supplierList.find(s => s.code === code)) { ToastComponent.show('Kode Supplier sudah ada', 'error'); return; }
          PMCStore.addSupplier({ code, name, contact, address });
          ToastComponent.show('Supplier berhasil ditambahkan', 'success');
        }
        ModalComponent.close();
        render();
      }
    });
  }

  return { render };
})();

window.MasterSupplierPage = MasterSupplierPage;
export default MasterSupplierPage;
