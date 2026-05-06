const AuditLogPage = (() => {
  async function fetchAuditLogs() {
    try {
      const tbody = document.getElementById('audit-tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Memuat data...</td></tr>';
      
      const res = await fetch(`${PMCStore.API_BASE}/audit?limit=200`);
      const json = await res.json();
      
      if (json.success) {
        renderTable(json.data);
      }
    } catch (e) {
      console.error(e);
      ToastComponent.show('Gagal memuat audit log', 'error');
    }
  }

  function renderTable(data) {
    const tbody = document.getElementById('audit-tbody');
    if (!tbody) return;

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Belum ada catatan aktivitas.</td></tr>';
      return;
    }

    let html = '';
    data.forEach(log => {
      const timeStr = new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute:'2-digit', second:'2-digit', day:'2-digit', month:'short' });
      
      let moduleColor = 'var(--text-secondary)';
      if (log.module === 'TRANSIT') moduleColor = 'var(--primary)';
      else if (log.module === 'WAREHOUSE') moduleColor = 'var(--warning)';

      html += `
        <tr>
          <td style="font-family:monospace; color:var(--text-muted);">${timeStr}</td>
          <td style="font-weight:bold;">${log.user}</td>
          <td><span style="background:rgba(0,0,0,0.1); border:1px solid ${moduleColor}40; color:${moduleColor}; padding:2px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold;">${log.module}</span></td>
          <td style="color:var(--text-primary); font-weight:500;">
             ${log.action}
             ${log.details ? `<br><small style="color:var(--text-muted);">${log.details}</small>` : ''}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function render() {
    if (window.location.hash !== '#/audit') return;
    if (window.ChartWrapper) window.ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2 class="page-title">🔍 Log Aktivitas (Traceability)</h2>
            <p class="page-subtitle">Mencatat setiap aktivitas penting dalam sistem untuk keperluan audit dan keamanan.</p>
          </div>
          <div>
            <button id="btn-refresh-audit" class="btn btn-secondary">🔄 Refresh</button>
          </div>
        </div>

        <div class="card" style="padding:0; overflow:hidden;">
          <table class="data-table" style="width:100%;">
            <thead>
              <tr>
                <th style="padding:16px; width:150px;">Waktu</th>
                <th style="padding:16px; width:150px;">User</th>
                <th style="padding:16px; width:120px;">Modul</th>
                <th style="padding:16px;">Aktivitas & Detail</th>
              </tr>
            </thead>
            <tbody id="audit-tbody">
               <tr><td colspan="4" style="text-align:center;">Menyiapkan...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-refresh-audit').addEventListener('click', fetchAuditLogs);
    fetchAuditLogs();
    
    if (window.TopbarComponent) TopbarComponent.render('/audit');
  }

  return { render };
})();

window.AuditLogPage = AuditLogPage;
export default AuditLogPage;
