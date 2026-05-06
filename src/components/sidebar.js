/* ===== Sidebar Component ===== */
const SidebarComponent = (() => {
  const NAV_ITEMS = [
    {
      group: '🎯 Operasional PPIC',
      items: [
        { id: 'schedule', icon: '🗓️', text: 'Schedule Import', route: '#/schedule' },
        { id: 'master-sku', icon: '📦', text: 'Master SKU', route: '#/master/sku' },
        { id: 'master-bom', icon: '🧾', text: 'Master BOM', route: '#/master/bom' },
        { id: 'master-supplier', icon: '🏢', text: 'Master Supplier', route: '#/master/supplier' },
        { id: 'manual-spb', icon: '📋', text: 'SPB Manual', route: '#/transit/manual-spb' },
        { id: 'summary', icon: '📊', text: 'Shift Summary', route: '#/summary' },
      ]
    },
    {
      group: '📝 Request Material & SPB',
      items: [
        { id: 'materials', icon: '🏭', text: 'Material Calc', route: '#/materials' },
        { id: 'distribution', icon: '🚚', text: 'SPB Harian', route: '#/distribution' },
        { id: 'distribution-hourly', icon: '⏰', text: 'Distribusi / Jam', route: '#/distribution/hourly' },
      ]
    },
    {
      group: '📊 Monitoring & Analitik',
      items: [
        { id: 'dashboard', icon: '📡', text: 'Pusat Kendali JIT', route: '#/dashboard' },
        { id: 'transit-info', icon: '📊', text: 'Info Distribusi', route: '#/transit/info' },
        { id: 'transit-mutation', icon: '📝', text: 'Mutasi Stok', route: '#/transit/mutation' },
        { id: 'opname-recap', icon: '📈', text: 'Hasil Rekap Opname', route: '#/opname-recap' },
        { id: 'transit-relocation', icon: '🔄', text: 'Relokasi Internal', route: '#/transit/relocation' },
        { id: 'transit-anomaly', icon: '⚠️', text: 'Laporan Anomali', route: '#/transit/anomaly' },
        { id: 'audit-log', icon: '🔍', text: 'Log Aktivitas', route: '#/audit' },
      ]
    },
    {
      group: '📦 Operasional Transit',
      items: [
        { id: 'stock', icon: '📋', text: 'Cek Stok Awal', route: '#/stock' },
        { id: 'transit-inbound', icon: '📥', text: 'Penerimaan', route: '#/transit/inbound' },
        { id: 'transit-verify-reject', icon: '♻️', text: 'Verifikasi Rijek', route: '#/transit/verify-reject' },
        { id: 'transit-outbound', icon: '📤', text: 'Pengeluaran', route: '#/transit/outbound' },
        { id: 'transit-stock-on-hand', icon: '📦', text: 'Stock On Hand', route: '#/transit/stock-on-hand' },
        { id: 'transit-opname', icon: '📋', text: 'Opname Blok Transit', route: '#/transit/opname' },
        { id: 'transit-master-receh', icon: '⚙️', text: 'Master Receh', route: '#/transit/master-receh' },
        { id: 'tv-inbound', icon: '🖥️', text: 'TV Dashboard', route: '#/tv/inbound' },
      ]
    },
    {
      group: '🏢 Operasional Gudang',
      items: [
        { id: 'warehouse-stock', icon: '📦', text: 'Stok Utama/WMS', route: '#/warehouse/stock' },
        { id: 'warehouse-delivery', icon: '🚚', text: 'Req. Pengiriman', route: '#/warehouse/delivery' },
        { id: 'warehouse-outbound', icon: '📤', text: 'Outbound Gudang', route: '#/warehouse/outbound' },
      ]
    },
    {
      group: '⚙️ Operasional Produksi',
      items: [
        { id: 'prod-inbound', icon: '📥', text: 'Line Inbound', route: '#/produksi/inbound' },
        { id: 'prod-outbound', icon: '📤', text: 'Line Outbound', route: '#/produksi/outbound' },
        { id: 'prod-reject', icon: '🗑️', text: 'Reject Out', route: '#/produksi/reject' },
        { id: 'prod-onhand', icon: '📦', text: 'Line On Hand', route: '#/produksi/onhand' },
        { id: 'prod-bpp', icon: '📝', text: 'BPP (Hasil Produksi)', route: '#/produksi/bpp' },
        { id: 'prod-mutation', icon: '📊', text: 'Mutasi Stok Produksi', route: '#/produksi/mutation' },
        { id: 'prod-opname', icon: '📋', text: 'Opname Line', route: '#/produksi/opname' },
        { id: 'prod-3in1', icon: '🔄', text: '3F2 Produksi', route: '#/external/onhand-3f2' },
        { id: 'pack-3in1', icon: '🔄', text: '3P2 Packing', route: '#/external/onhand-3p2' },
      ]
    },
    {
      group: '🛠️ Pengaturan & Master',
      items: [
        { id: 'master-block', icon: '🗺️', text: 'Master Blok', route: '#/master/block' },
        { id: 'master-line-sku', icon: '🔗', text: 'Line per SKU', route: '#/master/line-sku' },
        { id: 'master-kamus-opname', icon: '📖', text: 'Kamus Opname', route: '#/master/kamus-opname' },
        { id: 'print-barcode', icon: '🖨️', text: 'Cetak Barcode', route: '#/print-barcode' },
      ]
    },
  ];

  let collapsed = false;
  const openMenus = new Set(['master', 'calc', 'warehouse', 'transit', 'produksi', 'produksi-3in1']);

  function render() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';

    // Logo
    const logo = document.createElement('div');
    logo.className = 'sidebar-logo';
    logo.innerHTML = `
      <div class="sidebar-logo-icon">P</div>
      <div class="sidebar-logo-text">
        <span class="logo-title">PMC App</span>
        <span class="logo-subtitle">Material Calculator</span>
      </div>
    `;
    sidebar.appendChild(logo);

    const santosBrand = document.createElement('div');
    santosBrand.className = 'santos-brand';
    santosBrand.style.cssText = 'padding:0 var(--sp-4) var(--sp-4) var(--sp-4); text-align:center;';
    santosBrand.innerHTML = `
      <img src="public/santos-logo.png" alt="PT. Santos Jaya Abadi" style="width:100px;height:auto;margin:0 auto -20px auto;display:block;" />
      <div style="font-family:'Segoe UI', Arial, sans-serif;font-size:20px;color:#ffffff;font-size:12px;font-weight:1000;letter-spacing:0.0px;">PT. SANTOS JAYA ABADI</div>
    `;
    sidebar.appendChild(santosBrand);

    // Nav
    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';

    NAV_ITEMS.forEach(cat => {
      // Filter items based on role permissions
      const allowedItems = cat.items.filter(item => {
        // Use Auth module if available, otherwise show all (fallback for loading)
        if (window.Auth && window.Auth.isLoggedIn()) {
          return window.Auth.hasAccess(item.id);
        }
        return true; // Show all if Auth not ready yet
      });

      // Skip entire group if no items are accessible
      if (allowedItems.length === 0) return;

      // Category Header
      const catLabel = document.createElement('div');
      catLabel.className = 'nav-section-label';
      catLabel.style.marginTop = 'var(--sp-4)';
      catLabel.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
      catLabel.style.paddingTop = 'var(--sp-4)';
      catLabel.textContent = cat.group;
      nav.appendChild(catLabel);

      allowedItems.forEach(item => {
        const a = document.createElement('a');
        a.className = 'nav-item';
        a.href = item.route;
        a.innerHTML = `
          <span class="nav-item-icon">${item.icon}</span>
          <span class="nav-item-text">${item.text}</span>
        `;
        const hash = window.location.hash || '#/';
        if (hash === item.route || (item.route === '#/' && hash === '#/')) {
          a.classList.add('active');
        }
        a.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.hash = item.route.replace('#', '');
          closeMobile();
        });
        nav.appendChild(a);
      });
    });

    sidebar.appendChild(nav);

    // Footer with logout
    const footer = document.createElement('div');
    footer.className = 'sidebar-footer';
    footer.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

    // Logout button
    if (window.Auth && window.Auth.isLoggedIn()) {
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'sidebar-collapse-btn';
      logoutBtn.style.cssText = 'color:#ff6b6b; border-top: 1px solid rgba(255,255,255,0.05);';
      logoutBtn.innerHTML = `<span>🚪</span><span class="nav-item-text">Logout</span>`;
      logoutBtn.addEventListener('click', async () => {
        const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
        if (confirmLogout) {
          await window.Auth.logout();
          window.location.hash = '#/login';
        }
      });
      footer.appendChild(logoutBtn);
    }

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'sidebar-collapse-btn';
    collapseBtn.innerHTML = `<span>${collapsed ? '▶' : '◀'}</span><span class="nav-item-text">${collapsed ? '' : 'Kecilkan'}</span>`;
    collapseBtn.addEventListener('click', toggleCollapse);
    footer.appendChild(collapseBtn);
    sidebar.appendChild(footer);

    if (collapsed) sidebar.classList.add('collapsed');
    else sidebar.classList.remove('collapsed');
  }

  function toggleCollapse() {
    collapsed = !collapsed;
    render();
  }

  function closeMobile() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('mobile-open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('visible');
  }

  function openMobile() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('mobile-open');
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.getElementById('app').appendChild(overlay);
      overlay.addEventListener('click', closeMobile);
    }
    overlay.classList.add('visible');
    overlay.style.display = 'block';
  }

  return { render, openMobile, closeMobile };
})();

window.SidebarComponent = SidebarComponent;
export default SidebarComponent;
