/* ===== Transit Reject Verify Page ===== */
const TransitRejectVerifyPage = (() => {

  function render() {
    if (window.location.hash !== '#/transit/verify-reject') return;
    
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Header ──
    const headerBar = document.createElement('div');
    headerBar.className = 'page-header';
    headerBar.innerHTML = `
      <div>
        <h2 class="page-title">♻️ Verifikasi Rijek Produksi</h2>
        <p class="page-subtitle">Pilih dan verifikasi komponen/material rijek dari Line Produksi. Stok akan otomatis terpotong saat persetujuan.</p>
      </div>
      <div>
        <button id="btn-refresh-rejects" class="btn btn-secondary">🔄 Segarkan Data</button>
      </div>
    `;
    page.appendChild(headerBar);

    // ── Content ──
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div id="reject-verify-table" style="overflow-x:auto;">
        <div style="text-align:center; padding:var(--sp-8); color:var(--text-muted);">Memuat rijek terbaru...</div>
      </div>
    `;

    page.appendChild(card);
    container.appendChild(page);

    document.getElementById('btn-refresh-rejects').addEventListener('click', loadPendingRejects);
    loadPendingRejects();
    
    TopbarComponent.render('/transit/verify-reject');
  }

  async function loadPendingRejects() {
    const tableContainer = document.getElementById('reject-verify-table');
    if (!tableContainer) return;

    // Get all rejects (you might want to filter only pending, but let's fetch today's or pending)
    // We will use standard getLineRejects and filter client-side for "pending" status, 
    // or all recent to show history.
    const rejects = await PMCStore.getLineRejects(''); 
    const pendings = rejects.filter(r => r.status === 'pending');

    if (pendings.length === 0) {
      tableContainer.innerHTML = `
        <div style="text-align:center; padding:var(--sp-8); border:2px dashed var(--border-color); border-radius:var(--radius-lg); margin-top:var(--sp-4);">
          <div style="font-size:3rem; margin-bottom:var(--sp-2);">🎉</div>
          <h3 style="color:var(--text-primary); margin-bottom:var(--sp-1);">Semua Rijek Terselesaikan</h3>
          <p style="color:var(--text-muted);">Tidak ada pengajuan rijek dari pihak Line Produksi yang menunggu verifikasi saat ini.</p>
        </div>
      `;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Waktu & Line</th>
            <th>Material Rijek</th>
            <th>Alasan</th>
            <th>Qty (PCS) diajukan</th>
            <th>Qty Aktual (Bisa Diedit)</th>
            <th>Aksi Verifikasi</th>
          </tr>
        </thead>
        <tbody>
    `;

    pendings.forEach(r => {
      const timeStr = r.time ? r.time.substring(11, 19) : '?';
      html += `
        <tr>
          <td>
            <div style="font-weight:700;">Line ${r.line}</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted);">${timeStr}</div>
          </td>
          <td style="font-weight:600; font-size:var(--fs-sm); max-width: 250px;">
            ${r.materialName}
          </td>
          <td><span class="badge" style="background:rgba(236,72,153,0.12);color:#ec4899;">${r.reason}</span></td>
          <td style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">${PMCStore.formatNumber(r.pcs)}</td>
          <td>
            <input type="number" id="edit-pcs-${r.id}" class="form-input" style="width:100px; padding:6px; font-weight:700; text-align:center;" value="${r.pcs}" min="0" step="1">
          </td>
          <td>
             <div style="display:flex; gap:8px;">
               <button class="btn btn-primary btn-accept" data-id="${r.id}" style="padding:6px 12px; background:var(--success-color); border:none; color:#ffffff; font-weight:800;">✔️ Setujui</button>
               <button class="btn btn-secondary btn-reject" data-id="${r.id}" style="padding:6px 12px; background:transparent; border:1px solid var(--danger-color); color:var(--danger-color);">❌ Tolak</button>
             </div>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;

    // Attach listeners
    document.querySelectorAll('.btn-accept').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const inputVal = document.getElementById('edit-pcs-' + id).value;
        const finalPcs = parseFloat(inputVal);
        
        if (isNaN(finalPcs) || finalPcs <= 0) {
          ToastComponent.show('Masukkan jumlah PCS aktual yang valid (>0)', 'warning');
          return;
        }

        e.currentTarget.disabled = true;
        e.currentTarget.innerHTML = 'Hapus...';
        await verify(id, 'accept', finalPcs);
      });
    });

    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Tolak pengajuan rijek ini? Tim Line harus menginput ulang.')) {
          e.currentTarget.disabled = true;
          await verify(id, 'reject');
        }
      });
    });
  }

  async function verify(id, action, finalPcs = 0) {
    const res = await PMCStore.verifyLineReject(id, action, finalPcs);
    if (res.success) {
      ToastComponent.show(res.message, 'success');
      loadPendingRejects(); // refresh UI
    } else {
      ToastComponent.show(`Gagal: ${res.message}`, 'danger');
      loadPendingRejects();
    }
  }

  return { render };
})();

window.TransitRejectVerifyPage = TransitRejectVerifyPage;
export default TransitRejectVerifyPage;
