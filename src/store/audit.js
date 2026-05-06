import PMCStore from './core.js';

PMCStore.logAuditActivity = async (module, action, details = null) => {
  try {
    // Get current user from localStorage (set during login)
    const userName = localStorage.getItem('pmc_current_user') || 'Sistem / Anonymous';
    
    await fetch(`${PMCStore.API_BASE}/audit/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: userName,
        module,
        action,
        details
      })
    });
  } catch (err) {
    console.error("Failed to push audit log:", err);
  }
};

export default {};
