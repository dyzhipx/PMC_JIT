/* ===== Toast Component ===== */
const ToastComponent = (() => {
  function show(message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.getElementById('toast-root').appendChild(container);
    }

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeft = `3px solid var(--${type === 'error' ? 'danger' : type})`;
    toast.innerHTML = `
      <span>${icons[type] || '📌'}</span>
      <span class="toast-message">${message}</span>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => removeToast(toast));
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    setTimeout(() => removeToast(toast), duration);
  }

  function removeToast(toast) {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 200);
  }

  return { show };
})();

window.ToastComponent = ToastComponent;
export default ToastComponent;
