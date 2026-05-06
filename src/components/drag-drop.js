/* ===== Drag & Drop Component ===== */
const DragDropComponent = (() => {
  function create({ onFile, accept = '.xlsx,.xls' }) {
    const zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.innerHTML = `
      <div class="drop-zone-icon">📁</div>
      <div class="drop-zone-text">Drag & drop file Excel di sini<br>atau <strong>Browse File</strong></div>
      <div class="drop-zone-hint">Format: .xlsx, .xls</div>
    `;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept;
    fileInput.style.display = 'none';

    zone.appendChild(fileInput);

    zone.addEventListener('click', () => fileInput.click());

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file, onFile, zone);
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) handleFile(file, onFile, zone);
    });

    return zone;
  }

  function handleFile(file, callback, zone) {
    // Show loading state
    zone.innerHTML = `
      <div class="drop-zone-icon">⏳</div>
      <div class="drop-zone-text">Memproses <strong>${file.name}</strong>...</div>
    `;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        zone.innerHTML = `
          <div class="drop-zone-icon">✅</div>
          <div class="drop-zone-text">File <strong>${file.name}</strong> berhasil dimuat</div>
          <div class="drop-zone-hint">${data.length} baris data ditemukan</div>
        `;
        zone.style.borderColor = 'var(--success)';

        if (callback) callback(data, file.name);
      } catch (err) {
        zone.innerHTML = `
          <div class="drop-zone-icon">❌</div>
          <div class="drop-zone-text">Gagal membaca file</div>
          <div class="drop-zone-hint">${err.message}</div>
        `;
        zone.style.borderColor = 'var(--danger)';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  return { create };
})();

window.DragDropComponent = DragDropComponent;
export default DragDropComponent;
