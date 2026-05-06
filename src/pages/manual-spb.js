/* ===== Manual SPB Page ===== */
const ManualSpbPage = (() => {
  let spbList = [];
  let spbMetadata = { currentPage: 1, totalPages: 1, totalCount: 0 };
  let allMaterials = [];

  async function loadData(page = 1) {
    try {
      const json = await PMCStore.getManualSpbs(null, page, 20);
      spbList = json.data || json || [];
      spbMetadata = json.metadata || { currentPage: 1, totalPages: 1, totalCount: 0 };
    } catch (e) { console.warn('Failed to load manual SPBs:', e); }

    // Ensure Master Data (BOM) is loaded
    if (!PMCStore.bomData || PMCStore.bomData.length === 0) {
      console.log("[ManualSPB] BOM Data empty, triggering load...");
      await PMCStore.loadMasterDataFromAPI();
    }

    // Gather unique material names from BOM
    const matSet = new Set();
    (PMCStore.bomData || []).forEach(b => {
      (b.components || []).forEach(c => matSet.add(c.name));
    });
    
    allMaterials = Array.from(matSet).sort();
    console.log(`[ManualSPB] Loaded ${allMaterials.length} materials from BOM`);
  }

  async function render() {
    if (window.location.hash !== '#/transit/manual-spb') return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:300px;color:var(--text-muted);">
        <div class="spinner"></div>
      </div>`;

    await loadData();

    container.innerHTML = '';
    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Header ──
    const header = document.createElement('div');
    header.className = 'page-header';
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(20, 20, 40, 0) 100%); padding: var(--sp-6); border-radius: var(--radius-lg); border: 1px solid rgba(108, 92, 231, 0.2); margin-bottom: var(--sp-6); box-shadow: 0 10px 30px rgba(0,0,0,0.2);';
    header.innerHTML = `
      <div>
        <h2 class="page-title" style="font-size:2rem; font-weight:800; background: linear-gradient(to right, #a8c0ff, #3f2b96); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); margin-bottom: 8px;">📋 SPB Manual</h2>
        <p class="page-subtitle" style="color:var(--text-secondary); max-width:600px; line-height:1.5;">Buat permintaan material tambahan di luar jadwal otomatis (untuk persiapan promo, H-1, darurat, dll.)</p>
      </div>
      <button id="btn-create-spb" class="btn btn-primary" style="white-space:nowrap; padding: 12px 24px; font-size: 1.05rem; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4); transition: transform 0.2s, box-shadow 0.2s;">✨ Buat SPB Manual</button>
    `;
    page.appendChild(header);

    // ── Create Form (initially hidden) ──
    const formSection = document.createElement('div');
    formSection.id = 'spb-form-section';
    formSection.className = 'section glass-card';
    formSection.style.padding = 'var(--sp-5)';
    formSection.style.display = 'none';
    formSection.style.marginBottom = 'var(--sp-5)';

    formSection.innerHTML = `
      <div style="position:absolute; top:-20px; left:-20px; right:-20px; bottom:-20px; background:linear-gradient(45deg, rgba(108, 92, 231, 0.1), transparent); border-radius:30px; z-index:-1; filter:blur(20px);"></div>
      <h3 style="margin-bottom:var(--sp-5);font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px;">
        <span style="background:rgba(108, 92, 231, 0.2); padding:8px 12px; border-radius:12px; border:1px solid rgba(108, 92, 231, 0.3);">📝</span> Formulir Permintaan Material (SPB)
      </h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-5);margin-bottom:var(--sp-6);">
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Nama Peminta (PPIC)</label>
          <input type="text" id="spb-requester" class="form-control" placeholder="Ketik nama PPIC..." style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white;" />
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Alasan / Keterangan</label>
          <input type="text" id="spb-reason" class="form-control" placeholder="Contoh: Persiapan promo besok..." style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white;" />
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Target Tanggal</label>
          <input type="date" id="spb-target-date" class="form-control" value="${new Date().toLocaleDateString('en-CA')}" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white;" />
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Shift</label>
          <select id="spb-target-shift" class="form-control" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white; height:48px;">
            <option value="1">Shift 1 (08:00 - 16:00)</option>
            <option value="2">Shift 2 (16:00 - 00:00)</option>
            <option value="3">Shift 3 (00:00 - 08:00)</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:var(--sp-6); background: rgba(0,0,0,0.15); padding: var(--sp-4); border-radius: var(--radius-md); border: 1px dashed rgba(255,255,255,0.1);">
        <label class="form-label" style="font-weight:800; font-size: 1.1rem; margin-bottom: 16px; display:block; color:var(--text-main);">🛒 Daftar Material yang Diminta</label>
        <div id="spb-items-list" style="display:flex;flex-direction:column;gap:var(--sp-3);"></div>
        <button id="btn-add-item" class="btn btn-outline" style="margin-top:var(--sp-4); width:100%; border-style:dashed; color:var(--text-secondary); background:rgba(255,255,255,0.02);">+ Tambah Baris Material</button>
      </div>
      <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;border-top:1px solid rgba(255,255,255,0.05);padding-top:var(--sp-5);">
        <button id="btn-cancel-spb" class="btn" style="background:var(--bg-surface-2);color:var(--text-secondary); padding: 10px 24px;">Batal</button>
        <button id="btn-submit-spb" class="btn btn-success" style="padding: 10px 32px; font-weight:bold; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">🚀 Simpan & Terbitkan SPB</button>
      </div>
    `;
    page.appendChild(formSection);

    // ── SPB List ──
    const listSection = document.createElement('div');
    listSection.className = 'section';

    if (spbList.length === 0) {
      listSection.innerHTML = `
        <div class="empty-state" style="padding:var(--sp-8); background: radial-gradient(circle at center, rgba(108, 92, 231, 0.1) 0%, transparent 70%); border: 1px dashed rgba(108, 92, 231, 0.3); border-radius: var(--radius-xl);">
          <div style="font-size:4rem;margin-bottom:var(--sp-4); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)); animation: float 3s ease-in-out infinite;">📭</div>
          <div style="font-weight:800;font-size:1.4rem;color:var(--text-primary);margin-bottom:var(--sp-2);">Belum Ada SPB Manual Aktif</div>
          <div style="color:var(--text-secondary); max-width:400px; margin: 0 auto;">Tidak ada permintaan material di luar jadwal saat ini. Klik tombol di atas jika ada kebutuhan mendesak.</div>
          <style>@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }</style>
        </div>
      `;
    } else {
      spbList.forEach(spb => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.padding = '0';
        card.style.marginBottom = 'var(--sp-5)';
        card.style.overflow = 'hidden';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        
        const isComplete = spb.status === 'completed';
        const borderColor = isComplete ? 'var(--success-color)' : 'var(--accent-color)';
        const headerBg = isComplete ? 'rgba(16, 185, 129, 0.1)' : 'rgba(108, 92, 231, 0.1)';
        
        card.onmouseover = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = `0 10px 30px ${headerBg}`; };
        card.onmouseout = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = 'none'; };

        const statusBadge = isComplete
          ? '<span class="badge badge-success" style="padding:6px 12px; font-weight:bold; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">✅ Selesai</span>'
          : '<span class="badge badge-primary" style="padding:6px 12px; font-weight:bold; background: linear-gradient(45deg, var(--accent-color), var(--primary-color)); box-shadow: 0 2px 8px rgba(108,92,231,0.3);">🔄 Sedang Diproses</span>';

        const dateStr = new Date(spb.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let itemsHtml = '';
        (spb.items || []).forEach((item, idx) => {
          const scanPct = item.qtyPallets > 0 ? Math.round((item.scannedPallets / item.qtyPallets) * 100) : 0;
          const recvPct = item.qtyPallets > 0 ? Math.round((item.receivedPallets / item.qtyPallets) * 100) : 0;
          
          const isScanned = item.scannedPallets >= item.qtyPallets;
          const isReceived = item.receivedPallets >= item.qtyPallets;
          const isShipping = item.scannedPallets > item.receivedPallets;

          let statusBadge = '';
          let barColor = 'var(--accent-color)';
          
          if (isReceived) {
            statusBadge = '<div style="background:rgba(16,185,129,0.1); color:var(--success-color); padding:8px 16px; border-radius:8px; font-weight:bold; border:1px solid rgba(16,185,129,0.2);">✅ Selesai</div>';
            barColor = 'var(--success-color)';
          } else if (isShipping) {
            statusBadge = '<div style="background:rgba(108, 92, 231, 0.1); color:var(--accent-light); padding:8px 16px; border-radius:8px; font-weight:bold; border:1px solid rgba(108, 92, 231, 0.3); animation: pulse 2s infinite;">🚚 Di Jalan</div>';
            barColor = 'var(--accent-color)';
          } else {
            statusBadge = '<div style="background:rgba(255,255,255,0.05); color:var(--text-muted); padding:8px 16px; border-radius:8px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">⏳ Antre Scan</div>';
            barColor = 'rgba(255,255,255,0.2)';
          }

          itemsHtml += `
            <div style="background: ${idx % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)'}; padding: 16px 20px; display:flex; align-items:center; gap:var(--sp-4); border-left: 4px solid ${barColor};">
              <div style="flex:1;">
                <div style="font-weight:800; font-size:1.05rem; color:var(--text-main); margin-bottom:4px;">${item.materialName}</div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:8px;">
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px;">
                      <span>1. Scan Gudang (Dispatch)</span>
                      <span>${item.scannedPallets}/${item.qtyPallets}</span>
                    </div>
                    <div style="height:4px; background:rgba(0,0,0,0.3); border-radius:2px; overflow:hidden;">
                      <div style="height:100%; width:${scanPct}%; background:${isScanned ? 'var(--success-color)' : 'var(--accent-color)'}; opacity:0.6;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px;">
                      <span>2. Terima Transit (Receipt)</span>
                      <span><strong>${item.receivedPallets}</strong>/${item.qtyPallets}</span>
                    </div>
                    <div style="height:4px; background:rgba(0,0,0,0.3); border-radius:2px; overflow:hidden;">
                      <div style="height:100%; width:${recvPct}%; background:${isReceived ? 'var(--success-color)' : 'var(--primary-color)'}; box-shadow: 0 0 5px ${isReceived ? 'var(--success-color)' : 'transparent'};"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="min-width:120px; text-align:right;">
                ${statusBadge}
              </div>
            </div>
          `;
        });

        card.innerHTML = `
          <div style="background: ${headerBg}; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; border-left: 4px solid ${borderColor};">
            <div>
              <div style="display:flex; align-items:center; gap: 16px; margin-bottom: 6px;">
                <span style="font-weight:900; font-size:1.25rem; color:var(--text-primary); text-shadow: 0 2px 4px rgba(0,0,0,0.5); font-family: monospace;">${spb.spbNumber}</span>
                ${statusBadge}
              </div>
              <div style="font-size:0.85rem; color:var(--accent-light); opacity:0.9; margin-bottom:4px; display:flex; gap:8px; flex-wrap:wrap;">
                <span style="background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:4px;">👤 ${spb.requestedBy}</span>
                <span style="background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:4px;">🕒 Dibuat: ${dateStr}</span>
                ${spb.targetDate ? `<span style="background:rgba(108,92,231,0.3); color:#fff; padding:2px 8px; border-radius:4px; border:1px solid rgba(108,92,231,0.5);">📅 Target: <strong>${new Date(spb.targetDate).toLocaleDateString('id-ID')}</strong></span>` : ''}
                ${spb.targetShift ? `<span style="background:rgba(108,92,231,0.3); color:#fff; padding:2px 8px; border-radius:4px; border:1px solid rgba(108,92,231,0.5);">⏱ Shift: <strong>${spb.targetShift}</strong></span>` : ''}
              </div>
              ${spb.reason ? `<div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:4px;">💬 "${spb.reason}"</div>` : ''}
            </div>
            ${!isComplete ? `<button class="btn btn-delete-spb" data-spb-id="${spb.id}" style="background:rgba(239,68,68,0.15); color:var(--danger-color); border:1px solid rgba(239,68,68,0.3); font-size:1rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.3)'" onmouseout="this.style.background='rgba(239,68,68,0.15)'" title="Batalkan SPB">🗑️</button>` : ''}
          </div>
          <div style="display:flex; flex-direction:column;">
            ${itemsHtml}
          </div>
        `;
        listSection.appendChild(card);
      });
    }

    // ── Pagination Controls ──
    if (spbMetadata && spbMetadata.totalPages > 1) {
      const paginationDiv = document.createElement('div');
      paginationDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-top:var(--sp-4); padding: var(--sp-3);';
      paginationDiv.innerHTML = `
        <div style="font-size:14px; color:var(--text-muted);">
          Halaman ${spbMetadata.currentPage} dari ${spbMetadata.totalPages} (Total ${spbMetadata.totalCount} SPB)
        </div>
        <div style="display:flex; gap:var(--sp-2);">
          <button class="btn btn-sm btn-secondary" id="spb-prev-page" ${spbMetadata.currentPage <= 1 ? 'disabled' : ''}>&laquo; Sebelumnya</button>
          <button class="btn btn-sm btn-secondary" id="spb-next-page" ${spbMetadata.currentPage >= spbMetadata.totalPages ? 'disabled' : ''}>Selanjutnya &raquo;</button>
        </div>
      `;
      listSection.appendChild(paginationDiv);
    }

    page.appendChild(listSection);
    container.appendChild(page);

    // ── Event Listeners ──
    setTimeout(() => {
      // Toggle create form
      const btnCreate = document.getElementById('btn-create-spb');
      const formSec = document.getElementById('spb-form-section');
      if (btnCreate && formSec) {
        btnCreate.addEventListener('click', () => {
          formSec.style.display = formSec.style.display === 'none' ? 'block' : 'none';
          if (formSec.style.display === 'block') {
            addItemRow();
          }
        });
      }

      // Cancel
      const btnCancel = document.getElementById('btn-cancel-spb');
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          formSec.style.display = 'none';
          document.getElementById('spb-items-list').innerHTML = '';
        });
      }

      // Add item row
      const btnAddItem = document.getElementById('btn-add-item');
      if (btnAddItem) btnAddItem.addEventListener('click', addItemRow);

      // Submit
      const btnSubmit = document.getElementById('btn-submit-spb');
      if (btnSubmit) btnSubmit.addEventListener('click', submitSpb);


      // Delete SPB buttons
      document.querySelectorAll('.btn-delete-spb').forEach(btn => {
        btn.addEventListener('click', async () => {
          const spbId = btn.getAttribute('data-spb-id');
          if (!confirm('Hapus SPB Manual ini?')) return;
          try {
            const data = await PMCStore.deleteManualSpb(spbId);
            if (data.success) {
              ToastComponent.show(data.message, 'success');
              await render();
            } else {
              ToastComponent.show(data.message, 'danger');
            }
          } catch (e) {
            ToastComponent.show('Gagal menghapus SPB', 'danger');
          }
        });
      });

      // Pagination event listeners
      const spbPrev = document.getElementById('spb-prev-page');
      const spbNext = document.getElementById('spb-next-page');
      if (spbPrev) spbPrev.addEventListener('click', async () => { await loadData(spbMetadata.currentPage - 1); render(); });
      if (spbNext) spbNext.addEventListener('click', async () => { await loadData(spbMetadata.currentPage + 1); render(); });
    }, 0);

    TopbarComponent.render('/transit/manual-spb');
  }

  function addItemRow() {
    const list = document.getElementById('spb-items-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'spb-item-row';
    row.style.cssText = 'display:grid; grid-template-columns: minmax(150px, 1fr) 100px 130px 44px; gap:16px; align-items:end; width:100%; background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); transition:background 0.2s; box-sizing:border-box;';
    row.onmouseover = () => row.style.background = 'rgba(255,255,255,0.06)';
    row.onmouseout = () => row.style.background = 'rgba(255,255,255,0.03)';

    let matOptions = '<option value="" style="color:#ffffff; background:#1a1a2e;">-- Pilih --</option>';
    allMaterials.forEach(m => {
      matOptions += `<option value="${m}" style="color:#ffffff; background:#1a1a2e;">${m}</option>`;
    });

    row.innerHTML = `
      <div class="form-group" style="margin:0;">
        <label class="form-label" style="font-size:0.75rem; color:var(--text-secondary);">Material</label>
        <select class="form-control spb-mat-select" style="width:100%; box-sizing:border-box; background:var(--bg-main); border:1px solid rgba(108,92,231,0.3); color:white;">${matOptions}</select>
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label" style="font-size:0.75rem; color:var(--text-secondary);">Jml Palet</label>
        <input type="number" class="form-control spb-qty-input" min="1" value="1" style="width:100%; box-sizing:border-box; background:var(--bg-main); text-align:center; font-weight:bold; color:var(--accent-light);" />
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label" style="font-size:0.75rem; color:var(--text-secondary);">Total Pcs (Opsi)</label>
        <input type="number" class="form-control spb-pcs-input" min="0" placeholder="Isi Pcs" style="width:100%; box-sizing:border-box; background:var(--bg-main); border:1px solid rgba(255,255,255,0.1); color:white;" />
      </div>
      <div style="padding-bottom:1px; display:flex; justify-content:flex-end;">
        <button class="btn" style="background:rgba(239,68,68,0.1);color:var(--danger-color);padding:0;width:44px;font-size:1.2rem;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'" title="Hapus Baris" onclick="this.closest('.spb-item-row').remove()">✖</button>
      </div>
    `;
    list.appendChild(row);
  }

  async function submitSpb() {
    const btnSubmit = document.getElementById('btn-submit-spb');
    const requester = document.getElementById('spb-requester').value.trim();
    const reason = document.getElementById('spb-reason').value.trim();
    const targetDate = document.getElementById('spb-target-date').value;
    const targetShift = parseInt(document.getElementById('spb-target-shift').value);

    if (!requester) {
      ToastComponent.show('Masukkan nama peminta (PPIC)', 'warning');
      return;
    }

    const rows = document.querySelectorAll('.spb-item-row');
    const items = [];
    rows.forEach(row => {
      const mat = row.querySelector('.spb-mat-select').value;
      const qty = parseInt(row.querySelector('.spb-qty-input').value) || 0;
      const pcs = parseInt(row.querySelector('.spb-pcs-input').value) || null;
      if (mat && qty > 0) {
        items.push({ materialName: mat, qtyPallets: qty, qtyPcs: pcs });
      }
    });

    if (items.length === 0) {
      ToastComponent.show('Tambahkan minimal 1 material', 'warning');
      return;
    }

    if (btnSubmit) {
      if (btnSubmit.disabled) return;
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Memproses...';
    }

    try {
      const data = await PMCStore.saveManualSpb({ requestedBy: requester, reason, items, targetDate, targetShift });
      if (data.success) {
        ToastComponent.show(data.message, 'success');
        await render();
      } else {
        ToastComponent.show(data.message, 'danger');
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = '🚀 Simpan & Terbitkan SPB';
        }
      }
    } catch (e) {
      ToastComponent.show('Gagal membuat SPB Manual', 'danger');
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '🚀 Simpan & Terbitkan SPB';
      }
    }
  }

  return { render };
})();

window.ManualSpbPage = ManualSpbPage;
export default ManualSpbPage;
