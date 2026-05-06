/* ===== Modal Component ===== */
const ModalComponent = (() => {
  function open({ title, body, onSave, saveText = 'Simpan', width }) {
    close(); // close any existing modal

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

    const modal = document.createElement('div');
    modal.className = 'modal';
    if (width) modal.style.maxWidth = width;

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<h3 class="modal-title">${title}</h3>`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', close);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Body
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'modal-body';
    if (typeof body === 'string') bodyDiv.innerHTML = body;
    else bodyDiv.appendChild(body);
    modal.appendChild(bodyDiv);

    // Footer
    if (onSave) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.textContent = 'Batal';
      cancelBtn.addEventListener('click', close);
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-primary';
      saveBtn.textContent = saveText;
      saveBtn.addEventListener('click', () => { onSave(); });
      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);
      modal.appendChild(footer);
    }

    backdrop.appendChild(modal);
    document.getElementById('modal-root').appendChild(backdrop);

    // Focus trap
    setTimeout(() => {
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 100);

    // ESC key
    const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
  }

  function close() {
    const root = document.getElementById('modal-root');
    root.innerHTML = '';
  }

  return { open, close };
})();

window.ModalComponent = ModalComponent;
export default ModalComponent;
