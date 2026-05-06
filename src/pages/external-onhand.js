/* ===== External On-Hand Page (3P2 / 3F2) ===== */
const ExternalOnhandPage = (() => {
  let currentDest = '3F2';

  function setDestination(dest) {
    currentDest = dest;
  }

  function render() {
    if (window.location.hash !== `#/external/onhand-${currentDest.toLowerCase()}`) return;
    
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    const destName = currentDest === '3F2' ? 'Produksi 3IN1 (3F2)' : 'Gudang Packing 3IN1 (3P2)';

    // ── Header ──
    const headerBar = document.createElement('div');
    headerBar.className = 'page-header';
    headerBar.innerHTML = `
      <div>
        <h2 class="page-title">📦 Stock On-Hand — ${destName}</h2>
        <p class="page-subtitle">Penerimaan dari Transit dan Saldo Stok Aktual di area ${destName}</p>
      </div>
    `;
    page.appendChild(headerBar);

    // ── Pending Verifications (Penerimaan dari Transit Outbound) ──
    const pendingContainer = document.createElement('div');
    pendingContainer.style.marginBottom = 'var(--sp-6)';
    page.appendChild(pendingContainer);
    renderPendingVerifications(pendingContainer);

    // ── On Hand Stock Table ──
    const stockCard = document.createElement('div');
    stockCard.className = 'card';
    
    // Header
    const stockHeader = document.createElement('h3');
    stockHeader.style.marginBottom = 'var(--sp-4)';
    stockHeader.style.display = 'flex';
    stockHeader.style.alignItems = 'center';
    stockHeader.style.gap = '8px';
    stockHeader.innerHTML = `<span>📊</span> Total Stok Tersedia di ${currentDest}`;
    stockCard.appendChild(stockHeader);

    // Stock Data
    const onhandData = PMCStore.getExternalOnhand(currentDest).stock;
    const stockArr = Object.keys(onhandData).map(m => ({
      name: m,
      pallet: onhandData[m].qty,
      pcs: onhandData[m].pcs
    })).sort((a,b) => a.name.localeCompare(b.name));

    if (stockArr.length === 0) {
      stockCard.innerHTML += `<div class="empty-state">Belum ada stok barang di area ini.</div>`;
    } else {
      const table = DataTableComponent.create({
        columns: [
          { key: 'name', label: 'Nama Material' },
          { key: 'pallet', label: 'Jumlah Pallet', align: 'center', render: v => `<span class="badge badge-accent">${v}</span>` },
          { key: 'pcs', label: 'Total Pcs / Roll', align: 'right', render: v => `<strong>${PMCStore.formatNumber(v)}</strong>` }
        ],
        data: stockArr
      });
      stockCard.appendChild(table);
    }

    page.appendChild(stockCard);
    container.appendChild(page);

    // Event hooks
    PMCStore.off(`${currentDest}OnhandChanged`, render);
    PMCStore.on(`${currentDest}OnhandChanged`, render);
    
    PMCStore.off('outboundPendingChanged', render); // safe re-render
    PMCStore.on('outboundPendingChanged', render);

    TopbarComponent.render('/external/onhand');
  }

  function renderPendingVerifications(container) {
    const pendings = PMCStore.transitOutboundPending.filter(p => p.destination === currentDest);
    
    if (pendings.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-bottom: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          📥 Terdapat ${pendings.length} Antrean Penerimaan dari Area Transit
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu Pengiriman</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Qty (Pcs)</th>
              <th style="width: 200px; text-align: center;">Aksi Penerimaan</th>
            </tr>
          </thead>
          <tbody>
    `;

    pendings.forEach(p => {
      html += `
        <tr>
          <td>${p.date} ${p.time}</td>
          <td><strong>${p.barcode}</strong></td>
          <td>${p.material}</td>
          <td>${p.pcs}</td>
          <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm accept-btn" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem;">Terima Barang</button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem;">Tolak</button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm(`Konfirmasi penerimaan barang ke ${currentDest}?`)) {
          const res = await PMCStore.verifyTransitOutbound(id, 'accept');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render();
        }
      });
    });

    container.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Tolak barang ini dan kembalikan truk ke Transit?')) {
          const res = await PMCStore.verifyTransitOutbound(id, 'reject');
          ToastComponent.show(res.message, res.success ? 'success' : 'danger');
          render();
        }
      });
    });
  }

  return { render, setDestination };
})();

window.ExternalOnhandPage = ExternalOnhandPage;
export default ExternalOnhandPage;
