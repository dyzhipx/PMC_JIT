/* ===== PMC Auth Module — Role-Based Access Control ===== */

const Auth = (() => {
  const API_BASE = `${window.location.origin}/api/auth`;

  // ── Cached session state ──
  let _currentUser = null;
  let _sessionChecked = false;

  // ══════════════════════════════════════════════
  //  ROLE → MENU PERMISSION MAP
  // ══════════════════════════════════════════════
  // 'all' = admin sees everything.
  // Each role lists the sidebar item IDs they can access.
  const ROLE_PERMISSIONS = {
    admin: 'all',

    ppic: [
      // Group: Operasional PPIC
      'schedule', 'master-sku', 'master-bom', 'master-supplier', 'manual-spb', 'summary',
      // Group: Request Material & SPB
      'materials', 'distribution', 'distribution-hourly',
      // Individual
      'warehouse-stock',   // Stok Utama Gudang (WMS)
      'transit-info',      // Monitor Distribusi Transit
      'dashboard',         // Pusat Kendali JIT
      'master-line-sku',   // Master Line per SKU
    ],

    admin_transit: [
      // Group: Operasional Transit
      'stock', 'transit-inbound', 'transit-verify-reject', 'transit-outbound',
      'transit-stock-on-hand', 'transit-opname', 'transit-master-receh', 'tv-inbound',
      // Group: Request Material & SPB
      'materials', 'distribution', 'distribution-hourly',
      // Group: Pengaturan & Master
      'master-block', 'master-line-sku', 'master-kamus-opname', 'print-barcode',
      // Group: Monitoring & Analitik
      'dashboard', 'transit-info', 'transit-mutation', 'opname-recap',
      'transit-relocation', 'transit-anomaly', 'audit-log',
      // Individual
      'manual-spb',        // SPB Manual
    ],

    gudang: [
      // Group: Operasional Gudang
      'warehouse-stock', 'warehouse-delivery', 'warehouse-outbound',
      // Group: Request Material & SPB
      'materials', 'distribution', 'distribution-hourly',
      // Individual
      'transit-info',      // Monitor Distribusi Transit
      'dashboard',         // Pusat Kendali JIT
      'print-barcode',     // Cetak Barcode Kustom
      'tv-inbound',        // TV Dashboard
    ],

    operator_line: [
      // Group: Operasional Produksi
      'prod-inbound', 'prod-outbound', 'prod-reject', 'prod-onhand',
      'prod-bpp', 'prod-mutation', 'prod-opname', 'prod-3in1', 'pack-3in1',
      // Group: Request Material & SPB
      'materials', 'distribution', 'distribution-hourly',
      // Individual
      'transit-info',      // Monitor Distribusi Transit
    ],

    supervisor: [
      // Group: Operasional Produksi
      'prod-inbound', 'prod-outbound', 'prod-reject', 'prod-onhand',
      'prod-bpp', 'prod-mutation', 'prod-opname', 'prod-3in1', 'pack-3in1',
      // Group: Request Material & SPB
      'materials', 'distribution', 'distribution-hourly',
      // Individual
      'transit-info',      // Monitor Distribusi Transit
      'manual-spb',        // SPB Manual
      // Group: Monitoring & Analitik
      'dashboard', 'transit-mutation', 'opname-recap',
      'transit-relocation', 'transit-anomaly', 'audit-log',
    ],
  };

  // ── Role display labels ──
  const ROLE_LABELS = {
    admin: 'Administrator',
    ppic: 'PPIC',
    admin_transit: 'Admin Transit',
    gudang: 'Gudang',
    operator_line: 'Operator Line',
    supervisor: 'Supervisor Produksi',
    viewer: 'Viewer',
  };

  // ── Default route per role ──
  const DEFAULT_ROUTES = {
    admin: '#/dashboard',
    ppic: '#/dashboard',
    admin_transit: '#/stock',
    gudang: '#/warehouse/stock',
    operator_line: '#/produksi/inbound',
    supervisor: '#/produksi/inbound',
    viewer: '#/dashboard',
  };

  // ── Route → Menu Item ID mapping (for route guard) ──
  const ROUTE_TO_ITEM = {
    '/dashboard': 'dashboard',
    '/master/sku': 'master-sku',
    '/master/bom': 'master-bom',
    '/master/block': 'master-block',
    '/master/line-sku': 'master-line-sku',
    '/master/supplier': 'master-supplier',
    '/master/kamus-opname': 'master-kamus-opname',
    '/schedule': 'schedule',
    '/summary': 'summary',
    '/materials': 'materials',
    '/distribution': 'distribution',
    '/distribution/hourly': 'distribution-hourly',
    '/stock': 'stock',
    '/warehouse/stock': 'warehouse-stock',
    '/warehouse/delivery': 'warehouse-delivery',
    '/warehouse/outbound': 'warehouse-outbound',
    '/transit/inbound': 'transit-inbound',
    '/transit/outbound': 'transit-outbound',
    '/transit/stock-on-hand': 'transit-stock-on-hand',
    '/transit/info': 'transit-info',
    '/transit/mutation': 'transit-mutation',
    '/transit/manual-spb': 'manual-spb',
    '/tv/inbound': 'tv-inbound',
    '/transit/relocation': 'transit-relocation',
    '/transit/verify-reject': 'transit-verify-reject',
    '/transit/master-receh': 'transit-master-receh',
    '/transit/opname': 'transit-opname',
    '/transit/anomaly': 'transit-anomaly',
    '/audit': 'audit-log',
    '/produksi/inbound': 'prod-inbound',
    '/produksi/outbound': 'prod-outbound',
    '/produksi/reject': 'prod-reject',
    '/produksi/onhand': 'prod-onhand',
    '/produksi/bpp': 'prod-bpp',
    '/produksi/mutation': 'prod-mutation',
    '/produksi/opname': 'prod-opname',
    '/external/onhand-3p2': 'pack-3in1',
    '/external/onhand-3f2': 'prod-3in1',
    '/opname-recap': 'opname-recap',
    '/print-barcode': 'print-barcode',
  };

  // ══════════════════════════════════════════════
  //  AUTH API METHODS
  // ══════════════════════════════════════════════

  /**
   * Login with email + password via Better Auth.
   * @returns {{ user, session }} on success
   * @throws Error on failure
   */
  async function login(email, password) {
    const res = await fetch(`${API_BASE}/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || data?.error || 'Email atau password salah');
    }

    const data = await res.json();
    _currentUser = data.user || null;
    _sessionChecked = true;

    // Also cache to localStorage for quick UI rendering
    if (_currentUser) {
      localStorage.setItem('pmc_current_user', _currentUser.name || 'User');
      localStorage.setItem('pmc_current_role', _currentUser.role || 'viewer');
      localStorage.setItem('pmc_current_email', _currentUser.email || '');
    }

    return data;
  }

  /**
   * Logout — clears session cookie.
   */
  async function logout() {
    try {
      await fetch(`${API_BASE}/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    }
    _currentUser = null;
    _sessionChecked = false;
    localStorage.removeItem('pmc_current_user');
    localStorage.removeItem('pmc_current_role');
    localStorage.removeItem('pmc_current_email');
  }

  /**
   * Check current session from server.
   * Caches user if session is valid.
   * @returns {object|null} user object or null
   */
  async function getSession() {
    if (_sessionChecked && _currentUser) return _currentUser;

    try {
      const res = await fetch(`${API_BASE}/get-session`, {
        credentials: 'include',
      });

      if (!res.ok) {
        _currentUser = null;
        _sessionChecked = true;
        return null;
      }

      const data = await res.json();
      _currentUser = data?.user || null;
      _sessionChecked = true;

      if (_currentUser) {
        localStorage.setItem('pmc_current_user', _currentUser.name || 'User');
        localStorage.setItem('pmc_current_role', _currentUser.role || 'viewer');
        localStorage.setItem('pmc_current_email', _currentUser.email || '');
      }

      return _currentUser;
    } catch {
      // Network error — use cached localStorage if available
      const cachedRole = localStorage.getItem('pmc_current_role');
      if (cachedRole) {
        _currentUser = {
          name: localStorage.getItem('pmc_current_user') || 'User',
          role: cachedRole,
          email: localStorage.getItem('pmc_current_email') || '',
        };
        _sessionChecked = true;
        return _currentUser;
      }
      _currentUser = null;
      _sessionChecked = true;
      return null;
    }
  }

  /**
   * Get the cached current user (synchronous).
   * Returns null if not logged in.
   */
  function getCurrentUser() {
    if (_currentUser) return _currentUser;

    // Fallback to localStorage cache
    const cachedRole = localStorage.getItem('pmc_current_role');
    if (cachedRole) {
      return {
        name: localStorage.getItem('pmc_current_user') || 'User',
        role: cachedRole,
        email: localStorage.getItem('pmc_current_email') || '',
      };
    }
    return null;
  }

  /**
   * Check if current user has access to a specific menu item ID.
   * @param {string} itemId — the sidebar nav item id
   * @returns {boolean}
   */
  function hasAccess(itemId) {
    const user = getCurrentUser();
    if (!user) return false;

    const role = user.role || 'viewer';
    const perms = ROLE_PERMISSIONS[role];

    if (perms === 'all') return true;
    if (!perms) return false;

    return perms.includes(itemId);
  }

  /**
   * Check if current user can access a given route path.
   * @param {string} route — hash path like '/dashboard'
   * @returns {boolean}
   */
  function canAccessRoute(route) {
    const user = getCurrentUser();
    if (!user) return false;

    const role = user.role || 'viewer';
    if (ROLE_PERMISSIONS[role] === 'all') return true;

    const itemId = ROUTE_TO_ITEM[route];
    if (!itemId) return true; // Unknown routes are allowed (e.g. login)

    return hasAccess(itemId);
  }

  /**
   * Get the default route for the current user's role.
   */
  function getDefaultRoute() {
    const user = getCurrentUser();
    const role = user?.role || 'viewer';
    return DEFAULT_ROUTES[role] || '#/dashboard';
  }

  /**
   * Get the display label for a role.
   */
  function getRoleLabel(role) {
    return ROLE_LABELS[role] || role || 'Viewer';
  }

  /**
   * Check if user is logged in (synchronous, from cache).
   */
  function isLoggedIn() {
    return !!getCurrentUser();
  }

  /**
   * Force clear session cache (used when session expires).
   */
  function clearCache() {
    _currentUser = null;
    _sessionChecked = false;
  }

  return {
    login,
    logout,
    getSession,
    getCurrentUser,
    hasAccess,
    canAccessRoute,
    getDefaultRoute,
    getRoleLabel,
    isLoggedIn,
    clearCache,
    ROLE_PERMISSIONS,
    ROLE_LABELS,
  };
})();

window.Auth = Auth;
export default Auth;
