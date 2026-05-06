/* ===== Produksi BPP (Bukti Penyerahan Produksi) Page ===== */
const ProduksiBppPage = (() => {
  let bppHistory = [];
  let isEditing = false;
  let editingId = null;

  let bppMetadata = { currentPage: 1, totalPages: 1 };

  async function loadHistory(page = 1) {
    const today = new Date().toISOString().split('T')[0];
    const res = await PMCStore.getBppHistory(today, page, 50);
    bppHistory = res.data || [];
    bppMetadata = res.metadata || { currentPage: 1, totalPages: 1 };
    renderTable();
  }

  function render() {
    if (window.location.hash !== '#/produksi/bpp') return;
    
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    const headerBar = document.createElement('div');
    headerBar.className = 'page-header';
    headerBar.innerHTML = `
      <div>
        <h2 class="page-title">📝 BPP (Verifikasi Hasil Produksi)</h2>
        <p class="page-subtitle">Input hasil produksi (BPP) untuk memotong otomatis stok raw material dari line produksi.</p>
      </div>
    `;
    page.appendChild(headerBar);

    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1fr 2fr';
    layout.style.gap = 'var(--sp-6)';
    layout.style.alignItems = 'start';

    const formCard = document.createElement('div');
    formCard.className = 'card';
    formCard.id = 'bpp-form-card';
    layout.appendChild(formCard);

    const tableCard = document.createElement('div');
    tableCard.className = 'card';
    tableCard.innerHTML = `
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">📜 Riwayat BPP Hari Ini</h3>
      <div id="bpp-table-container" style="overflow-x:auto;"></div>
    `;
    layout.appendChild(tableCard);

    page.appendChild(layout);
    container.appendChild(page);

    renderForm();
    loadHistory();
    TopbarComponent.render('/produksi/bpp');

    if (PMCStore.off) {
      PMCStore.off('skuChanged', renderForm);
      PMCStore.off('linePerSkuChanged', renderForm);
      PMCStore.off('scheduleChanged', renderForm);
    }
    if (PMCStore.on) {
      PMCStore.on('skuChanged', renderForm);
      PMCStore.on('linePerSkuChanged', renderForm);
      PMCStore.on('scheduleChanged', renderForm);
    }
  }

  function renderForm() {
    const card = document.getElementById('bpp-form-card');
    if (!card) return;

    const today = new Date().toISOString().split('T')[0];

    const allLinesSet = new Set();
    const mappings = typeof PMCStore.getLinePerSku === 'function' ? PMCStore.getLinePerSku() : [];
    mappings.forEach(m => { if (m.line) allLinesSet.add(m.line); });

    const schedules = Array.isArray(PMCStore.schedules) ? PMCStore.schedules : [];
    schedules.forEach(s => { if (s.line) allLinesSet.add(s.line); });

    const allLines = [...allLinesSet].sort();

    card.innerHTML = `
      <h3 id="form-title" style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2); display:flex; justify-content:space-between;">
        <span>${isEditing ? '✏️ Edit Data BPP' : '➕ Input BPP Baru'}</span>
        ${isEditing ? '<button id="btn-cancel-edit" class="btn btn-sm btn-danger">Batal Edit</button>' : ''}
      </h3>
      
      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Tanggal Produksi</label>
        <input type="date" id="bpp-date" class="form-input" value="${today}" ${isEditing ? 'disabled' : ''}>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Line Produksi</label>
        <select id="bpp-line" class="form-input" ${isEditing ? 'disabled' : ''}>
          <option value="">-- Pilih Line --</option>
          ${allLines.map(l => `<option value="${l}">${l}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">SKU Produk Jadi</label>
        <select id="bpp-sku" class="form-input">
          <option value="">-- Pilih Line Dahulu --</option>
        </select>
      </div>

      <div id="schedule-warning" style="display:none; padding:var(--sp-3); background:var(--danger-color); color:white; border-radius:var(--radius-sm); margin-bottom:var(--sp-3); font-size:14px; font-weight:bold;">
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Nomor BPP (Opsional)</label>
        <input type="text" id="bpp-number" class="form-input" placeholder="Otomatis jika kosong..." ${isEditing ? 'disabled' : ''}>
      </div>

      <div style="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-4);">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Shift</label>
          <select id="bpp-shift" class="form-input" ${isEditing ? 'disabled' : ''}>
            <option value="1">Shift 1</option>
            <option value="2">Shift 2</option>
            <option value="3">Shift 3</option>
          </select>
        </div>
        <div class="form-group" style="flex:2;">
          <label class="form-label">Transfer Qty (BOX)</label>
          <input type="number" id="bpp-qty" class="form-input" min="1" placeholder="Misal: 100">
        </div>
      </div>

      <button id="btn-submit" class="btn btn-primary" style="width:100%; font-weight:bold;">
        ${isEditing ? '💾 Simpan Perubahan' : '✔️ Proses Potong RM & Simpan BPP'}
      </button>
    `;

    if (isEditing) {
      document.getElementById('btn-cancel-edit').addEventListener('click', () => {
        isEditing = false;
        editingId = null;
        renderForm();
      });
    }

    const lineEl = document.getElementById('bpp-line');
    const skuEl = document.getElementById('bpp-sku');
    const dateEl = document.getElementById('bpp-date');
    const warningEl = document.getElementById('schedule-warning');

    const updateSkuOptions = () => {
      const line = lineEl.value;
      const date = dateEl.value;
      
      if (!line || !date) {
        skuEl.innerHTML = '<option value="">-- Pilih Line Dahulu --</option>';
        return;
      }

      const filteredSchedules = schedules.filter(s => s.date === date && s.line === line);
      const scheduledSkuIds = new Set(filteredSchedules.map(s => s.skuId));
      const allSkus = Array.isArray(PMCStore.skuList) ? PMCStore.skuList : [];
      const availableSkus = allSkus.filter(s => scheduledSkuIds.has(s.id));

      if (availableSkus.length === 0) {
        skuEl.innerHTML = '<option value="">-- Tidak ada SKU terjadwal --</option>';
      } else {
        skuEl.innerHTML = `
          <option value="">-- Pilih SKU (${availableSkus.length}) --</option>
          ${availableSkus.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join('')}
        `;
        if (availableSkus.length === 1) skuEl.value = availableSkus[0].id;
      }
    };

    const checkSchedule = async () => {
      const line = lineEl.value;
      const skuId = skuEl.value;
      const date = dateEl.value;
      if (line && skuId && date) {
        warningEl.style.display = 'none';
        const verify = await PMCStore.verifyBppSku(date, line, skuId);
        if (!verify.match) {
          warningEl.style.display = 'block';
          warningEl.innerHTML = `⚠️ PERINGATAN: ${verify.message}<br><small style="font-weight:normal;">Tetap dapat dilanjutkan jika memang diperlukan.</small>`;
        }
      }
    };

    lineEl.addEventListener('change', () => { updateSkuOptions(); checkSchedule(); });
    dateEl.addEventListener('change', () => { updateSkuOptions(); checkSchedule(); });
    skuEl.addEventListener('change', checkSchedule);

    if (lineEl.value) updateSkuOptions();
    if (isEditing && lineEl.value) {
      setTimeout(() => {
        updateSkuOptions();
        setTimeout(() => {
          const obj = bppHistory.find(h => h.id === editingId);
          if (obj) skuEl.value = obj.skuId;
        }, 50);
      }, 0);
    }

    document.getElementById('btn-submit').addEventListener('click', async () => {
      const line = lineEl.value;
      const skuId = skuEl.value;
      const date = dateEl.value;
      const bppNumber = document.getElementById('bpp-number').value;
      const qty = parseInt(document.getElementById('bpp-qty').value, 10);
      const shift = parseInt(document.getElementById('bpp-shift').value, 10);

      if (!line || !skuId || !date || !qty || qty <= 0) {
        ToastComponent.show('Mohon lengkapi semua data wajib', 'warning');
        return;
      }

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.textContent = 'Memproses...';

      let res;
      if (isEditing) {
        res = await PMCStore.editBpp(editingId, { qty, skuId });
      } else {
        res = await PMCStore.submitBpp({ line, skuId, date, qty, shift, bppNumber });
      }

      btn.disabled = false;
      btn.textContent = isEditing ? '💾 Simpan Perubahan' : '✔️ Proses Potong RM & Simpan BPP';

      if (res.success) {
        ToastComponent.show(isEditing ? 'BPP berhasil di-edit!' : 'BPP berhasil disimpan!', 'success');
        isEditing = false;
        editingId = null;
        renderForm();
        loadHistory();
      } else {
        ToastComponent.show('Gagal: ' + res.message, 'danger');
      }
    });
  }

  function renderTable() {
    const container = document.getElementById('bpp-table-container');
    if (!container) return;
    if (bppHistory.length === 0) {
      container.innerHTML = `<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Belum ada riwayat hari ini.</div>`;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>BPP Number</th>
            <th>Tgl / Shift</th>
            <th>Line</th>
            <th>Produk (SKU)</th>
            <th>Qty (BOX)</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;

    bppHistory.forEach(bpp => {
      const skuObj = PMCStore.skuList ? PMCStore.skuList.find(s => s.id === bpp.skuId) : null;
      const skuName = skuObj ? `${skuObj.code} - ${skuObj.name}` : bpp.skuId;
      const timestamp = new Date(bpp.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      html += `
        <tr>
          <td><strong>${bpp.bppNumber}</strong><br><small style="color:var(--text-muted);">${timestamp}</small></td>
          <td>${bpp.date.split('T')[0]} / Shift ${bpp.shift}</td>
          <td><span class="badge badge-accent">${bpp.line}</span></td>
          <td>${skuName}</td>
          <td>${bpp.qty}</td>
          <td><span class="badge ${bpp.status === 'edited' ? 'badge-warning' : 'badge-success'}">${bpp.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-sm btn-primary edit-bpp-btn" data-id="${bpp.id}" data-obj='${JSON.stringify(bpp)}' style="font-size:12px; padding:4px 8px;">Edit</button>
            <button class="btn btn-sm btn-secondary view-bpp-btn" data-id="${bpp.id}" data-obj='${JSON.stringify(bpp.items)}' style="font-size:12px; padding:4px 8px;">Audit BOM</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;

    // Add Pagination Controls
    if (bppMetadata && bppMetadata.totalPages > 1) {
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--sp-3);">
          <div style="font-size:14px; color:var(--text-muted);">
            Halaman ${bppMetadata.currentPage} dari ${bppMetadata.totalPages} (Total ${bppMetadata.totalCount} data)
          </div>
          <div style="display:flex; gap:var(--sp-2);">
            <button class="btn btn-sm btn-secondary" id="btn-prev-page" ${bppMetadata.currentPage <= 1 ? 'disabled' : ''}>&laquo; Sebelumnya</button>
            <button class="btn btn-sm btn-secondary" id="btn-next-page" ${bppMetadata.currentPage >= bppMetadata.totalPages ? 'disabled' : ''}>Selanjutnya &raquo;</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach Pagination Events
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    if (btnPrev) btnPrev.addEventListener('click', () => { if(bppMetadata.currentPage > 1) loadHistory(bppMetadata.currentPage - 1); });
    if (btnNext) btnNext.addEventListener('click', () => { if(bppMetadata.currentPage < bppMetadata.totalPages) loadHistory(bppMetadata.currentPage + 1); });

    container.querySelectorAll('.edit-bpp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const obj = JSON.parse(e.target.getAttribute('data-obj'));
        isEditing = true;
        editingId = obj.id;
        renderForm();
        setTimeout(() => {
          document.getElementById('bpp-date').value = obj.date.split('T')[0];
          document.getElementById('bpp-line').value = obj.line;
          document.getElementById('bpp-number').value = obj.bppNumber;
          document.getElementById('bpp-shift').value = obj.shift;
          document.getElementById('bpp-qty').value = obj.qty;
          document.getElementById('bpp-line').disabled = true;
          document.getElementById('bpp-date').disabled = true;
          document.getElementById('bpp-number').disabled = true;
          document.getElementById('bpp-shift').disabled = true;
        }, 100);
      });
    });

    container.querySelectorAll('.view-bpp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const items = JSON.parse(e.target.getAttribute('data-obj'));
        showAuditModal(items);
      });
    });
  }

  function showAuditModal(items) {
    let tbody = '';
    items.forEach(it => {
      tbody += `<tr><td>${it.materialName}</td><td style="text-align:right;">${parseFloat(it.qtyDeducted).toFixed(2)}</td></tr>`;
    });
    const modalHtml = `
      <div id="bpp-audit-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div style="background:var(--bg-main); padding:var(--sp-5); border-radius:var(--radius-lg); width:90%; max-width:500px;">
          <h3 style="margin-bottom:var(--sp-3);">📜 Audit Potongan Material BPP</h3>
          <p style="color:var(--text-muted); font-size:14px; margin-bottom:var(--sp-4);">Daftar raw material yang otomatis terpotong berdasarkan konversi BOM.</p>
          <table class="data-table" style="margin-bottom:var(--sp-4);">
            <thead><tr><th>Material</th><th style="text-align:right;">Qty Dipotong (PCS)</th></tr></thead>
            <tbody>${tbody}</tbody>
          </table>
          <button id="close-audit-modal" class="btn btn-secondary" style="width:100%;">Tutup</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('close-audit-modal').addEventListener('click', () => {
      document.getElementById('bpp-audit-modal').remove();
    });
  }

  return { render };
})();

window.ProduksiBppPage = ProduksiBppPage;
export default ProduksiBppPage;
