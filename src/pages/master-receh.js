/* ===== Master Material Receh Page ===== */
const MasterRecehPage = (() => {
  const API_BASE = `http://${window.location.hostname}:3000/api`;
  let materials = [];
  let availableMaterials = [];

  async function loadData() {
    try {
      const res = await fetch(`${API_BASE}/master/material-receh`);
      if (res.ok) materials = await res.json();
      
      // Load all BOM components to use as options
      if (!PMCStore.bomData || PMCStore.bomData.length === 0) {
        // Fallback: request a fetch but don't heavily rely on it right away
        PMCStore.loadMasterDataFromAPI();
      } else {
        updateAvailableMaterials('');
      }

      renderTable();
      renderSkuDropdown();
      renderDropdown();
    } catch (err) {
      console.error('Failed to load material receh:', err);
    }
  }

  function updateAvailableMaterials(filterSkuId = '') {
      const matSet = new Set();
      (PMCStore.bomData || []).forEach(b => {
         if (!filterSkuId || b.skuId === filterSkuId) {
            (b.components || []).forEach(c => matSet.add(c.name));
         }
      });
      availableMaterials = Array.from(matSet).sort();
  }

  // Subscribe to store changes so if API responds slow, dropdown catches up
  if (window.PMCStore && typeof window.PMCStore.on === 'function') {
      window.PMCStore.on('bomChanged', () => {
          if (window.location.hash === '#/transit/master-receh') {
              const skuSel = document.getElementById('receh-sku-select');
              updateAvailableMaterials(skuSel ? skuSel.value : '');
              renderSkuDropdown();
              renderDropdown();
          }
      });
      window.PMCStore.on('skuChanged', () => {
          if (window.location.hash === '#/transit/master-receh') {
              renderSkuDropdown();
          }
      });
  }

  function render() {
    if (window.location.hash !== '#/transit/master-receh') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <div>
        <h2 class="page-title">⚙️ Master Material Receh (Parsial)</h2>
        <p class="page-subtitle">Daftar material stok Transit yang DIISINKAN ditarik secara parsial (recehan) ke Line Produksi.</p>
      </div>
    `;
    page.appendChild(header);

    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1fr 2fr';
    layout.style.gap = 'var(--sp-6)';
    layout.style.alignItems = 'start';

    // Form
    const formCard = document.createElement('div');
    formCard.className = 'card';
    formCard.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3);">➕ Tambah Material Receh</h3>
      <div class="form-group" style="margin-bottom:var(--sp-2);">
        <label class="form-label">Pilih SKU (Opsional)</label>
        <select id="receh-sku-select" class="form-input"></select>
      </div>
      <div class="form-group">
        <label class="form-label">Pilih Material</label>
        <select id="receh-select" class="form-input"></select>
      </div>
      <button id="btn-add-receh" class="btn btn-primary" style="width:100%; margin-top:var(--sp-2);">Simpan ke Daftar</button>

      <div class="alert alert-info" style="margin-top:var(--sp-5);">
        <h4 style="margin-bottom:var(--sp-2);">ℹ️ Info</h4>
        <p style="font-size:0.85rem;">Hanya material yang didaftarkan di sini yang dapat diambil secara "receh" (jumlah tidak penuh per pallet) dari Transit ke Line Produksi.</p>
      </div>
    `;
    layout.appendChild(formCard);

    // Table
    const tableCard = document.createElement('div');
    tableCard.className = 'card';
    tableCard.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3);">📋 Daftar Material Tersimpan</h3>
      <div id="receh-table-container">Menunggu data...</div>
    `;
    layout.appendChild(tableCard);

    page.appendChild(layout);
    container.appendChild(page);

    setTimeout(() => {
      document.getElementById('receh-sku-select').addEventListener('change', (e) => {
         updateAvailableMaterials(e.target.value);
         renderDropdown();
      });

      document.getElementById('btn-add-receh').addEventListener('click', async () => {
        const materialName = document.getElementById('receh-select').value;
        if (!materialName) return ToastComponent.show('Pilih material', 'warning');
        
        try {
          const res = await fetch(`${API_BASE}/master/material-receh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ materialName })
          });
          const data = await res.json();
          ToastComponent.show(data.message, data.success ? 'success' : 'danger');
          if (data.success) {
             await loadData();
             // trigger update in store
             PMCStore.loadMaterialRecehFromAPI();
          }
        } catch (err) {
          ToastComponent.show('Gagal menyimpan', 'danger');
        }
      });
    }, 0);

    loadData();
    TopbarComponent.render('/transit/master-receh');
  }

  function renderTable() {
    const container = document.getElementById('receh-table-container');
    if (!container) return;

    if (materials.length === 0) {
      container.innerHTML = `<div class="empty-state">Belum ada material yang didaftarkan.</div>`;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Di Input Pada</th>
            <th width="100">Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;

    materials.forEach(m => {
      const d = m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '-';
      html += `
        <tr>
          <td><strong>${m.materialName}</strong></td>
          <td>${d}</td>
          <td>
            <button class="btn btn-sm btn-danger btn-delete-receh" data-mat="${m.materialName}">Hapus</button>
          </td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    container.querySelectorAll('.btn-delete-receh').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const mat = e.target.getAttribute('data-mat');
        if (confirm(`Hapus ${mat} dari daftar Material Receh?`)) {
          try {
            const res = await fetch(`${API_BASE}/master/material-receh/${encodeURIComponent(mat)}`, { method: 'DELETE' });
            const data = await res.json();
            ToastComponent.show(data.message, data.success ? 'success' : 'danger');
            if (data.success) {
               await loadData();
               PMCStore.loadMaterialRecehFromAPI();
            }
          } catch (err) {
            ToastComponent.show('Gagal menghapus', 'danger');
          }
        }
      });
    });
  }

  function renderSkuDropdown() {
    const sel = document.getElementById('receh-sku-select');
    if (!sel) return;
    
    // Find all SKU IDs that are actually in the BOM Data to prevent empty options
    const skusWithBoms = new Set((PMCStore.bomData || []).map(b => b.skuId));
    
    let html = `<option value="">-- Tampilkan Semua SKU --</option>`;
    (PMCStore.skuList || []).filter(s => skusWithBoms.has(s.id)).forEach(sku => {
        // Store current value to preserve it
        html += `<option value="${sku.id}">${sku.code} - ${sku.name}</option>`;
    });
    
    const currValue = sel.value;
    sel.innerHTML = html;
    if (currValue) sel.value = currValue;
  }

  function renderDropdown() {
    const sel = document.getElementById('receh-select');
    if (!sel) {
       console.error("Select not found");
       return;
    }
    
    // Filter out already added materials
    const addedSet = new Set(materials.map(m => m.materialName));
    const toAdd = availableMaterials.filter(a => !addedSet.has(a));

    if (toAdd.length === 0 && availableMaterials.length === 0) {
       sel.innerHTML = `<option value="">-- Master BOM Kosong/Belum Terload --</option>`;
       return;
    }

    sel.innerHTML = `<option value="">-- Pilih Material BOM --</option>` + 
      toAdd.map(a => `<option value="${a}">${a}</option>`).join('');
  }

  return { render };
})();

window.MasterRecehPage = MasterRecehPage;
export default MasterRecehPage;
