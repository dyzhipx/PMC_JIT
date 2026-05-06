/* ===== Master BOM Page ===== */
const MasterBOMPage = (() => {
  let searchQuery = '';
  const openItems = new Set();
  let _listening = false;

  function render() {
    if (window.location.hash !== '#/master/bom') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    if (!_listening) {
      PMCStore.on('bomChanged', () => {
        if (window.location.hash === '#/master/bom') render();
      });
      _listening = true;
    }

    const page = document.createElement('div');
    page.className = 'page-enter';

    // Topbar
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = '+ Tambah BOM';
    addBtn.addEventListener('click', () => openAddBOMModal());
    TopbarComponent.render('/master/bom', [addBtn]);

    // ── Search ──
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    const search = document.createElement('div');
    search.className = 'search-input';
    search.innerHTML = `<span class="icon">🔍</span>`;
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Cari SKU / Komponen...';
    searchInput.value = searchQuery;
    searchInput.addEventListener('input', e => { searchQuery = e.target.value; render(); });
    search.appendChild(searchInput);
    toolbar.appendChild(search);
    page.appendChild(toolbar);

    // ── BOM Accordions ──
    const filtered = PMCStore.bomData.filter(bom => {
      const sku = PMCStore.getSKU(bom.skuId);
      if (!sku) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return sku.code.toLowerCase().includes(q) || sku.name.toLowerCase().includes(q) ||
        bom.components.some(c => c.name.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      page.innerHTML += '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Tidak ada BOM ditemukan</div></div>';
    }

    filtered.forEach(bom => {
      const sku = PMCStore.getSKU(bom.skuId);
      const isOpen = openItems.has(bom.skuId);

      const accordion = document.createElement('div');
      accordion.className = `accordion-item ${isOpen ? 'open' : ''}`;

      // Header
      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.innerHTML = `
        <span class="accordion-arrow">▶</span>
        <span class="accordion-title">${sku?.code || bom.skuId} — ${sku?.name || 'Unknown'}</span>
        <span class="accordion-badge badge badge-accent">${bom.components.length} komponen</span>
      `;
      header.addEventListener('click', () => {
        if (openItems.has(bom.skuId)) openItems.delete(bom.skuId);
        else openItems.add(bom.skuId);
        render();
      });
      accordion.appendChild(header);

      // Body
      const body = document.createElement('div');
      body.className = 'accordion-body';

      if (isOpen) {
        body.appendChild(DataTableComponent.create({
          columns: [
            { key: 'name', label: 'Komponen' },
            { key: 'oracleCode', label: 'Kode Oracle', render: v => v || '<span style="color:var(--text-muted)">-</span>' },
            { key: 'coefficient', label: 'Koefisien', align: 'right',
              render: v => PMCStore.formatDecimal(v, 6) },
            { key: 'uom', label: 'UOM', align: 'center',
              render: v => `<span class="badge badge-accent">${v}</span>` },
            { key: 'line', label: 'Line', align: 'center',
              render: v => v ? `<span class="badge badge-primary">Line ${v}</span>` : '<span class="badge">Semua Line</span>' },
            { key: 'rounding', label: 'Pembulatan', align: 'center',
              render: v => v === 'ceiling' ? '⬆ Ceiling' : v },
          ],
          data: bom.components,
          actions: [
            { icon: '✏️', label: 'Edit', onClick: (row, idx) => openComponentModal(bom.skuId, idx, row) },
            { icon: '🗑', label: 'Hapus', onClick: (row, idx) => {
              if (confirm(`Hapus komponen ${row.name}?`)) {
                PMCStore.deleteBOMComponent(bom.skuId, idx);
                ToastComponent.show('Menghapus komponen...', 'info');
              }
            }},
          ],
        }));

        const addCompBtn = document.createElement('button');
        addCompBtn.className = 'btn btn-secondary btn-sm';
        addCompBtn.style.marginTop = 'var(--sp-3)';
        addCompBtn.innerHTML = '+ Tambah Komponen';
        addCompBtn.addEventListener('click', () => openComponentModal(bom.skuId));
        body.appendChild(addCompBtn);
      }

      accordion.appendChild(body);
      page.appendChild(accordion);
    });

    container.appendChild(page);
  }

  function openAddBOMModal() {
    const skusWithoutBOM = PMCStore.skuList.filter(s => !PMCStore.getBOM(s.id));
    if (skusWithoutBOM.length === 0) {
      ToastComponent.show('Semua SKU sudah memiliki BOM', 'info');
      return;
    }

    const form = document.createElement('div');
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label">Pilih SKU</label>
        <select class="form-input" id="bom-sku">
          ${skusWithoutBOM.map(s => `<option value="${s.id}">${s.code} — ${s.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Nama Komponen Pertama</label>
        <input class="form-input" id="bom-comp-name" placeholder="Contoh: Karton" />
      </div>
      <div class="form-group">
        <label class="form-label">Kode Oracle</label>
        <input class="form-input" id="bom-comp-oracle" placeholder="Contoh: ORC-123" />
      </div>
      <div class="form-group">
        <label class="form-label">Koefisien</label>
        <input class="form-input" id="bom-comp-coef" type="number" step="any" value="1" />
      </div>
      <div class="form-group">
        <label class="form-label">UOM</label>
        <select class="form-input" id="bom-comp-uom">
          <option value="PCS">PCS</option>
          <option value="ROL">ROL</option>
          <option value="KG">KG</option>
          <option value="LBR">LBR</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Pembulatan</label>
        <select class="form-input" id="bom-comp-round">
          <option value="ceiling">⬆ Ceiling</option>
          <option value="2decimal">2 Desimal</option>
          <option value="3decimal">3 Desimal</option>
          <option value="4decimal">4 Desimal</option>
        </select>
      </div>
    `;

    ModalComponent.open({
      title: 'Tambah BOM Baru',
      body: form,
      onSave: () => {
        const skuId = document.getElementById('bom-sku').value;
        const comp = {
          name: document.getElementById('bom-comp-name').value.trim(),
          oracleCode: document.getElementById('bom-comp-oracle').value.trim(),
          coefficient: parseFloat(document.getElementById('bom-comp-coef').value) || 0,
          uom: document.getElementById('bom-comp-uom').value,
          rounding: document.getElementById('bom-comp-round').value,
          line: '', // For the first component, keep it universal, they can edit later
        };
        if (!comp.name) { ToastComponent.show('Nama komponen wajib diisi', 'error'); return; }
        PMCStore.addBOMComponent(skuId, comp);
        openItems.add(skuId);
        ModalComponent.close();
        ToastComponent.show('Menyimpan BOM baru...', 'info');
      }
    });
  }

  function openComponentModal(skuId, idx, existing) {
    const isEdit = existing !== undefined;
    const lines = PMCStore.getLinesForSku(skuId) || [];
    const lineOptions = `<option value="">-- Berlaku Semua Line --</option>` + 
      lines.map(l => `<option value="${l}" ${existing?.line === l ? 'selected' : ''}>Line ${l}</option>`).join('');

    const form = document.createElement('div');
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label">Nama Komponen</label>
        <input class="form-input" id="comp-name" value="${existing?.name || ''}" placeholder="Contoh: Plastik Mocca" />
      </div>
      <div class="form-group">
        <label class="form-label">Kode Oracle</label>
        <input class="form-input" id="comp-oracle" value="${existing?.oracleCode || ''}" placeholder="Contoh: ORC-123" />
      </div>
      <div class="form-group">
        <label class="form-label">Koefisien (per 1 Box)</label>
        <input class="form-input" id="comp-coef" type="number" step="any" value="${existing?.coefficient || 1}" />
      </div>
      <div class="form-group">
        <label class="form-label">UOM</label>
        <select class="form-input" id="comp-uom">
          <option value="PCS" ${existing?.uom === 'PCS' ? 'selected' : ''}>PCS</option>
          <option value="ROL" ${existing?.uom === 'ROL' ? 'selected' : ''}>ROL</option>
          <option value="KG" ${existing?.uom === 'KG' ? 'selected' : ''}>KG</option>
          <option value="LBR" ${existing?.uom === 'LBR' ? 'selected' : ''}>LBR</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Terapkan pada Line (Opsional)</label>
        <select class="form-input" id="comp-line">
          ${lineOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Pembulatan</label>
        <select class="form-input" id="comp-round">
          <option value="ceiling" ${existing?.rounding === 'ceiling' ? 'selected' : ''}>⬆ Ceiling</option>
          <option value="2decimal" ${existing?.rounding === '2decimal' ? 'selected' : ''}>2 Desimal</option>
          <option value="3decimal" ${existing?.rounding === '3decimal' ? 'selected' : ''}>3 Desimal</option>
          <option value="4decimal" ${existing?.rounding === '4decimal' ? 'selected' : ''}>4 Desimal</option>
        </select>
      </div>
    `;

    ModalComponent.open({
      title: isEdit ? 'Edit Komponen' : 'Tambah Komponen',
      body: form,
      onSave: () => {
        const comp = {
          name: document.getElementById('comp-name').value.trim(),
          oracleCode: document.getElementById('comp-oracle').value.trim(),
          coefficient: parseFloat(document.getElementById('comp-coef').value) || 0,
          uom: document.getElementById('comp-uom').value,
          rounding: document.getElementById('comp-round').value,
          line: document.getElementById('comp-line').value || null,
        };
        if (!comp.name) { ToastComponent.show('Nama komponen wajib diisi', 'error'); return; }
        if (isEdit) PMCStore.updateBOMComponent(skuId, idx, comp);
        else PMCStore.addBOMComponent(skuId, comp);
        ModalComponent.close();
        ToastComponent.show(isEdit ? 'Menyimpan perubahan...' : 'Menambahkan komponen...', 'info');
      }
    });
  }

  return { render };
})();

window.MasterBOMPage = MasterBOMPage;
export default MasterBOMPage;
