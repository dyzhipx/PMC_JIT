/* ===== Transit Anomaly Report Page ===== */
const TransitAnomalyReportPage = (() => {
  let isFetching = false;

  async function fetchAnomalies() {
    if (isFetching) return;
    isFetching = true;
    
    const tbody = document.getElementById('anomaly-tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;"><div class="spinner"></div> Memuat data anomali...</td></tr>';
    }

    try {
      // Default to 3 hours based on user preference
      const res = await fetch(`${PMCStore.API_BASE}/anomaly/unscanned-transit?hours=3`);
      const json = await res.json();

      if (json.success) {
        renderTable(json.data);
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--danger-color);">Gagal memuat data: ${err.message}</td></tr>`;
      }
      ToastComponent.show('Gagal memuat laporan anomali', 'error');
    } finally {
      isFetching = false;
    }
  }

  function renderTable(data) {
    const tbody = document.getElementById('anomaly-tbody');
    if (!tbody) return;

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--success-color); font-weight:bold;">🎉 Tidak ada anomali lupa scan saat ini. Semua data tersinkronisasi.</td></tr>';
      return;
    }

    let html = '';
    data.forEach(item => {
      const isAnomaly = item.status === 'Lupa Scan';
      const statusColor = isAnomaly ? 'var(--danger-color)' : 'var(--warning-color)';
      const statusIcon = isAnomaly ? '🚨' : '⏳';
      const bgStyle = isAnomaly ? 'background: rgba(239, 68, 68, 0.05);' : '';
      
      const timeIn = new Date(item.timeInTransit).toLocaleString('id-ID', { hour: '2-digit', minute:'2-digit', day:'2-digit', month:'short' });

      html += `
        <tr style="${bgStyle}">
          <td style="font-family:monospace; font-weight:bold; color:var(--accent-color);">${item.barcode}</td>
          <td style="font-weight:600;">${item.materialName}</td>
          <td>
            <div style="font-weight:600;">Shift ${item.shift || '-'}</div>
            <div style="font-size:0.85rem; color:var(--text-secondary);">${timeIn}</div>
          </td>
          <td><span style="font-weight:bold; color:${item.waitingHours > 4 ? 'var(--danger-color)' : 'inherit'};">${item.waitingHours} Jam</span></td>
          <td style="text-align:center;">
            ${item.bppQtyDeducted > 0 ? 
              `<span style="color:var(--success-color); font-weight:bold;">Aktif (${item.bppQtyDeducted} pcs)</span>` : 
              `<span style="color:var(--text-secondary);">Idle (0 pcs)</span>`
            }
          </td>
          <td>
            <div style="display:inline-flex; align-items:center; gap:8px; padding:4px 12px; border-radius:20px; background:rgba(0,0,0,0.2); border:1px solid ${statusColor}40;">
              <span>${statusIcon}</span>
              <span style="color:${statusColor}; font-weight:bold; font-size:0.9rem;">${item.status}</span>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function render() {
    if (window.location.hash !== '#/transit/anomaly') return;
    if (window.ChartWrapper) window.ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(20, 20, 40, 0) 100%); padding: var(--sp-6); border-radius: var(--radius-lg); border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: var(--sp-6); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div>
            <h2 class="page-title" style="font-size:2rem; font-weight:800; background: linear-gradient(to right, #f87171, #fca5a5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); margin-bottom: 8px;">⚠️ Laporan Anomali Transit</h2>
            <p class="page-subtitle" style="color:var(--text-secondary); max-width:700px; line-height:1.5;">Deteksi pintar material yang tertahan di Transit melebihi batas waktu (3 Jam), disilangkan dengan data Hasil Produksi (BPP) untuk mencegah salah deteksi akibat mesin mati (trouble).</p>
          </div>
          <div>
            <button id="btn-refresh-anomaly" class="btn btn-secondary" style="display:flex; align-items:center; gap:8px;">
              <span>🔄</span> Refresh Data
            </button>
          </div>
        </div>

        <div class="glass-card" style="padding: 0; overflow:hidden;">
          <div style="padding: var(--sp-4); border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2);">
            <h3 style="font-weight:700; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
              <span style="color:var(--accent-color);">📋</span> Detail Potensi Lupa Scan
            </h3>
            <div style="font-size:0.85rem; color:var(--text-secondary);">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--danger-color); margin-right:4px;"></span> Lupa Scan (Ada Produksi)
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--warning-color); margin-left:12px; margin-right:4px;"></span> Idle / Trouble (Tidak Ada Produksi)
            </div>
          </div>
          <div class="table-container" style="margin:0; padding:0;">
            <table class="data-table" style="width:100%; min-width:800px;">
              <thead style="background: rgba(255,255,255,0.02);">
                <tr>
                  <th style="padding:16px;">Barcode Palet</th>
                  <th style="padding:16px;">Nama Material</th>
                  <th style="padding:16px;">Shift Kejadian & Waktu</th>
                  <th style="padding:16px;">Lama Menunggu</th>
                  <th style="padding:16px; text-align:center;">Status BPP Line (Hari Ini)</th>
                  <th style="padding:16px;">Kesimpulan Sistem</th>
                </tr>
              </thead>
              <tbody id="anomaly-tbody">
                <tr><td colspan="6" style="text-align:center; padding:20px;">Menyiapkan data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-refresh-anomaly').addEventListener('click', fetchAnomalies);
    fetchAnomalies();
  }

  return { render };
})();

window.TransitAnomalyReportPage = TransitAnomalyReportPage;
export default TransitAnomalyReportPage;
