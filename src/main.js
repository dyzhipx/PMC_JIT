/* ===== PMC App Entry Point (ES Module) ===== */

// ── Auth module (must load first) ──
import './lib/auth.js';

// ── Store layer (order matters: core → master → inventory → production → delivery → init) ──
import './store/init.js';

// ── Utility / Config ──
import './shift-config.js';
import './lib/barcode-printer.js';

// ── UI Components ──
import './components/sidebar.js';
import './components/topbar.js';
import './components/stat-card.js';
import './components/data-table.js';
import './components/modal.js';
import './components/drag-drop.js';
import './components/pagination.js';
import './components/toast.js';
import './components/chart-wrapper.js';
import './components/skeleton.js';
import './components/camera-scanner.js';

// ── Pages ──
import './pages/dashboard.js';
import './pages/master-sku.js';
import './pages/master-bom.js';
import './pages/master-block.js';
import './pages/master-line-sku.js';
import './pages/master-supplier.js';
import './pages/master-kamus-opname.js';
import './pages/schedule-import.js';
import './pages/shift-summary.js';
import './pages/material-calc.js';
import './pages/distribution.js';
import './pages/distribution-hourly.js';
import './pages/stock-check.js';
import './pages/warehouse-stock.js';
import './pages/warehouse-delivery.js';
import './pages/warehouse-outbound.js';
import './pages/inbound.js';
import './pages/transit-outbound.js';
import './pages/stock-on-hand.js';
import './pages/live-distribution.js';
import './pages/stock-mutation.js';
import './pages/manual-spb.js';
import './pages/tv-dashboard.js';
import './pages/transit-relocation.js';
import './pages/transit-reject-verify.js';
import './pages/master-receh.js';
import './pages/produksi-inbound.js';
import './pages/produksi-outbound.js';
import './pages/produksi-reject.js';
import './pages/produksi-onhand.js';
import './pages/produksi-bpp.js';
import './pages/produksi-mutation.js';
import './pages/produksi-opname.js';
import './pages/transit-opname.js';
import './pages/transit-anomaly-report.js';
import './pages/opname-recap.js';
import './pages/external-onhand.js';
import './pages/audit-log.js';
import './pages/outbound.js';
import './pages/print-barcode.js';
import './pages/login.js';

// ── Router ──
import './router.js';

// ── Initialize App ──
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth session before initializing the app
  try {
    await Auth.getSession();
  } catch {
    // Session check failed — user will be redirected to login by router
  }

  // If not logged in, force login route
  if (!Auth.isLoggedIn()) {
    if (!window.location.hash || window.location.hash === '#/' || window.location.hash !== '#/login') {
      window.location.hash = '#/login';
    }
  }

  SidebarComponent.render();
  Router.init();
  
  // Register PWA service worker (dynamic import so it never blocks the app)
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() { console.log('New content available, refreshing...'); },
      onOfflineReady() { console.log('App ready to work offline'); },
    });
  }).catch(() => {
    console.warn('[PWA] Service worker registration skipped (dev mode or unavailable).');
  });
});
