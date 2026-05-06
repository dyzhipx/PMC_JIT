/* ===== Topbar Component ===== */
const TopbarComponent = (() => {
  const ROUTE_META = {
    '/dashboard': { title: 'Pusat Kendali JIT', breadcrumb: 'Pusat Kendali', icon: '📡' },
    '/master/sku': { title: 'Master SKU', breadcrumb: 'Master Data / SKU', icon: '📦' },
    '/master/bom': { title: 'Master BOM', breadcrumb: 'Master Data / BOM', icon: '🧾' },
    '/master/supplier': { title: 'Master Supplier', breadcrumb: 'Master Data / Supplier', icon: '🏢' },
    '/schedule': { title: 'Smart Schedule Importer', breadcrumb: 'Perhitungan / Schedule', icon: '📋' },
    '/summary': { title: 'Shift-Production Summary', breadcrumb: 'Perhitungan / Summary', icon: '📊' },
    '/materials': { title: 'Material Requirement', breadcrumb: 'Perhitungan / Material', icon: '🏭' },
  };

  // Role badge color map
  const ROLE_COLORS = {
    admin: '#ef4444',
    ppic: '#8b5cf6',
    admin_transit: '#f59e0b',
    gudang: '#10b981',
    operator_line: '#3b82f6',
    supervisor: '#ec4899',
    viewer: '#6b7280',
  };

  function render(route, actionButtons = []) {
    const topbar = document.getElementById('topbar');
    const meta = ROUTE_META[route] || ROUTE_META['/dashboard'];

    topbar.innerHTML = '';

    const left = document.createElement('div');
    left.className = 'topbar-left';

    // Hamburger for mobile
    const hamburger = document.createElement('button');
    hamburger.className = 'topbar-hamburger';
    hamburger.innerHTML = '☰';
    hamburger.addEventListener('click', () => SidebarComponent.openMobile());
    left.appendChild(hamburger);

    // Breadcrumb + Title
    const titleWrap = document.createElement('div');
    titleWrap.innerHTML = `
      <div class="topbar-breadcrumb">${meta.icon} ${meta.breadcrumb}</div>
      <div class="topbar-page-title">${meta.title}</div>
    `;
    left.appendChild(titleWrap);

    topbar.appendChild(left);

    // Right actions (Account & Logout)
    const right = document.createElement('div');
    right.className = 'topbar-right';

    // Account Info — use Auth module
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const currentUser = user?.name || localStorage.getItem('pmc_current_user') || 'Admin';
    const currentRole = user?.role || localStorage.getItem('pmc_current_role') || 'viewer';
    const roleLabel = window.Auth ? window.Auth.getRoleLabel(currentRole) : currentRole;
    const roleColor = ROLE_COLORS[currentRole] || '#6b7280';

    const accountInfo = document.createElement('div');
    accountInfo.className = 'topbar-account';
    accountInfo.innerHTML = `
      <div class="account-avatar">👨‍💻</div>
      <div class="account-details">
        <span class="account-name">${currentUser}</span>
        <span class="account-role" style="
          background: ${roleColor}22;
          color: ${roleColor};
          padding: 1px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 1px solid ${roleColor}44;
        ">${roleLabel}</span>
      </div>
    `;
    right.appendChild(accountInfo);

    // Logout Button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn-logout';
    logoutBtn.innerHTML = '🚪 Logout';
    logoutBtn.addEventListener('click', async () => {
      const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar sekarang?");
      if (confirmLogout) {
        if (window.Auth) {
          await window.Auth.logout();
        }
        localStorage.removeItem('pmc_current_user');
        localStorage.removeItem('pmc_current_role');
        localStorage.removeItem('pmc_current_email');
        window.location.hash = '#/login';
      }
    });
    right.appendChild(logoutBtn);

    if (actionButtons.length > 0) {
      actionButtons.forEach(btn => right.appendChild(btn));
    }
    
    topbar.appendChild(right);
  }

  return { render };
})();

window.TopbarComponent = TopbarComponent;
export default TopbarComponent;
