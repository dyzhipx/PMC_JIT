/* ===== Hash-based SPA Router ===== */
const Router = (() => {
  const routes = {
    '/': () => LoginPage.render(),
    '/dashboard': () => { TopbarComponent.render('/dashboard'); DashboardPage.render(); },
    '/master/sku': () => MasterSKUPage.render(),
    '/master/bom': () => MasterBOMPage.render(),
    '/master/block': () => MasterBlockPage.render(),
    '/master/line-sku': () => MasterLineSKUPage.render(),
    '/master/supplier': () => MasterSupplierPage.render(),
    '/master/kamus-opname': () => MasterKamusOpnamePage.render(),
    '/schedule': () => ScheduleImportPage.render(),
    '/summary': () => ShiftSummaryPage.render(),
    '/materials': () => MaterialCalcPage.render(),
    '/distribution': () => DistributionPage.render(),
    '/distribution/hourly': () => DistributionHourlyPage.render(),
    '/stock': () => StockCheckPage.render(),
    '/warehouse/stock': () => WarehouseStockPage.render(),
    '/warehouse/delivery': () => WarehouseDeliveryPage.render(),
    '/warehouse/outbound': () => WarehouseOutboundPage.render(),
    '/transit/inbound': () => InboundTransitPage.render(),
    '/transit/outbound': () => TransitOutboundPage.render(),
    '/transit/stock-on-hand': () => StockOnHandTransitPage.render(),
    '/transit/info': () => LiveDistributionPage.render(),
    '/transit/mutation': () => StockMutationPage.render(),
    '/transit/manual-spb': () => ManualSpbPage.render(),
    '/tv/inbound': () => TvDashboardPage.render(),
    '/transit/relocation': () => TransitRelocationPage.render(),
    '/transit/verify-reject': () => TransitRejectVerifyPage.render(),
    '/transit/master-receh': () => MasterRecehPage.render(),
    '/transit/opname': () => TransitOpnamePage.render(),
    '/transit/anomaly': () => TransitAnomalyReportPage.render(),
    '/audit': () => AuditLogPage.render(),
    '/produksi/inbound': () => ProduksiInboundPage.render(),
    '/produksi/outbound': () => ProduksiOutboundPage.render(),
    '/produksi/reject': () => ProduksiRejectPage.render(),
    '/produksi/onhand': () => ProduksiOnhandPage.render(),
    '/produksi/bpp': () => ProduksiBppPage.render(),
    '/produksi/mutation': () => ProduksiMutasiPage.render(),
    '/produksi/opname': () => ProduksiOpnamePage.render(),
    '/external/onhand-3p2': () => { ExternalOnhandPage.setDestination('3P2'); ExternalOnhandPage.render(); },
    '/external/onhand-3f2': () => { ExternalOnhandPage.setDestination('3F2'); ExternalOnhandPage.render(); },
    '/opname-recap': () => OpnameRecapPage.render(),
    '/print-barcode': () => PrintBarcodePage.render(),
    '/login': () => LoginPage.render(),
  };

  // Public routes that don't require authentication
  const PUBLIC_ROUTES = ['/', '/login'];

  function navigate() {
    const rawHash = window.location.hash.replace('#', '');
    const hash = rawHash.split('?')[0] || '/';
    const renderFn = routes[hash];

    const container = document.getElementById('page-content');
    
    // ── Auth Guard ──
    const isPublicRoute = PUBLIC_ROUTES.includes(hash);

    if (!isPublicRoute && window.Auth) {
      // Check if user is logged in
      if (!window.Auth.isLoggedIn()) {
        window.location.hash = '#/login';
        return;
      }

      // Check if user has permission for this route
      if (!window.Auth.canAccessRoute(hash)) {
        // Redirect to their default page
        const defaultRoute = window.Auth.getDefaultRoute();
        window.location.hash = defaultRoute.replace('#', '');
        
        // Show warning toast
        setTimeout(() => {
          if (window.ToastComponent) {
            ToastComponent.show('⛔ Akses ditolak — Anda tidak memiliki izin untuk halaman tersebut.', 'error');
          }
        }, 300);
        return;
      }
    }

    // If user is already logged in and tries to go to login page, redirect to dashboard
    if (isPublicRoute && hash !== '/' || hash === '/login') {
      if (window.Auth && window.Auth.isLoggedIn()) {
        const defaultRoute = window.Auth.getDefaultRoute();
        window.location.hash = defaultRoute.replace('#', '');
        return;
      }
    }

    // Smooth transition
    container.classList.remove('page-enter');
    // Trigger reflow
    void container.offsetWidth; 
    container.classList.add('page-enter');

    // Destroy any existing charts
    ChartWrapper.destroyAll();

    if (renderFn) {
      try {
        renderFn();
      } catch (err) {
        container.innerHTML = `
          <div class="empty-state" style="color:red;white-space:pre-wrap;text-align:left;padding:20px">
            <h3 style="color:red">⚠️ Error Rendering Halaman: ${hash}</h3>
            <pre style="background:#1a1a2e;padding:16px;border-radius:8px;overflow:auto;font-size:13px;color:#ff6b6b">${err.message}\n\n${err.stack}</pre>
          </div>
        `;
        console.error('Page render error:', err);
      }
    } else {
      // 404
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Halaman tidak ditemukan</div>
          <a href="#/" class="btn btn-primary">Kembali ke Dashboard</a>
        </div>
      `;
    }

    // Update sidebar active state
    SidebarComponent.render();

    // If loaded inside an iframe (like the TV screensaver), hide the layout
    if (window.self !== window.top) {
      const sidebar = document.getElementById('sidebar');
      const topbar = document.getElementById('topbar');
      const main = document.getElementById('main');
      if (sidebar) sidebar.style.display = 'none';
      if (topbar) topbar.style.display = 'none';
      if (main) {
        main.style.marginLeft = '0';
        main.style.paddingTop = '0';
      }
    }
  }

  function init() {
    window.addEventListener('hashchange', navigate);
    navigate();
  }

  return { init, navigate };
})();

window.Router = Router;
export default Router;
