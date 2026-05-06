/* ===== Outbound Transit Page (Pengambilan ke Line) ===== */
const OutboundTransitPage = (() => {
  let selectedLine = null;
  let activeSKUs = [];

  function initData() {
    // Determine active SKUs for the lines for the current date
    const d = new Date();
    const dateStr = d.toISOString().split('T')[0];
    const todays = PMCStore.schedules.filter(s => s.date === dateStr && (s.sh1 > 0 || s.sh2 > 0 || s.sh3 > 0));
    
    activeSKUs = todays;
  }

  function render() {
    if (window.location.hash !== '#/transit/outbound') return;
    initData();
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Header ──
    const headerBar = document.createElement('div');
    headerBar.className = 'page-header';
    headerBar.innerHTML = `
      <div>
        <h2 class="page-title">📤 Pengeluaran Area Transit (Outbound)</h2>
        <p class="page-subtitle">Pilih Line Produksi untuk mengambil material dari Area Transit</p>
      </div>
    `;
    page.appendChild(headerBar);

    // Grid: Controls left, Materials right
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '300px 1fr';
    grid.style.gap = 'var(--sp-6)';
    grid.style.alignItems = 'start';

    // ── Left: Line Selector ──
    const controlCard = document.createElement('div');
    controlCard.className = 'card';
    controlCard.innerHTML = `<h3 style="margin-bottom:var(--sp-4);">⚙️ Pilih Line</h3>`;

    const lines = [...new Set(activeSKUs.map(s => s.line))].sort();
    
    if (lines.length === 0) {
      controlCard.innerHTML += `<div class="alert alert-warning">Tidak ada jadwal produksi hari ini.</div>`;
    } else {
      const lineGroup = document.createElement('div');
      lineGroup.style.display = 'flex';
      lineGroup.style.flexDirection = 'column';
      lineGroup.style.gap = 'var(--sp-2)';

      lines.forEach(line => {
        const btn = document.createElement('button');
        btn.className = `btn ${selectedLine === line ? 'btn-primary' : 'btn-ghost'}`;
        btn.style.justifyContent = 'flex-start';
        btn.innerHTML = `<span>🏭</span> <span>${line}</span>`;
        btn.addEventListener('click', () => {
          selectedLine = line;
          render();
        });
        lineGroup.appendChild(btn);
      });
      controlCard.appendChild(lineGroup);
    }
    grid.appendChild(controlCard);

    // ── Right: Materials needed for selected line ──
    const matCard = document.createElement('div');
    matCard.className = 'card';
    matCard.style.minHeight = '400px';
    
    if (!selectedLine) {
      matCard.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);opacity:0.6;">
          <div style="font-size:3rem;margin-bottom:var(--sp-3);">👈</div>
          <div>Pilih Line produksi dari panel di sebelah kiri</div>
        </div>
      `;
    } else {
      matCard.innerHTML = `<h3 style="margin-bottom:var(--sp-4);border-bottom:1px solid var(--border-color);padding-bottom:var(--sp-2);">📦 Material untuk ${selectedLine}</h3>`;
      
      const lineSkus = activeSKUs.filter(s => s.line === selectedLine);
      const neededMats = new Set();
      lineSkus.forEach(s => {
        const bom = PMCStore.getBOM(s.skuId);
        if (bom) {
          bom.components.forEach(c => neededMats.add(c.name));
        }
      });
      
      const matArr = [...neededMats].sort();
      
      if (matArr.length === 0) {
        matCard.innerHTML += `<div class="alert alert-info">Belum ada material yang terdaftar di BOM untuk SKU di line ini.</div>`;
      } else {
        const listGrid = document.createElement('div');
        listGrid.style.display = 'flex';
        listGrid.style.flexDirection = 'column';
        listGrid.style.gap = 'var(--sp-3)';

        const transitInfo = PMCStore.getTransitInfo();

        matArr.forEach(matName => {
          const rowDiv = document.createElement('div');
          rowDiv.style.display = 'flex';
          rowDiv.style.alignItems = 'center';
          rowDiv.style.justifyContent = 'space-between';
          rowDiv.style.padding = '12px';
          rowDiv.style.background = 'var(--bg-secondary)';
          rowDiv.style.borderRadius = 'var(--radius-md)';
          rowDiv.style.borderLeft = '4px solid var(--accent-color)';
          
          const availableQty = transitInfo.materials[matName] || 0;
          
          rowDiv.innerHTML = `
            <div>
              <div style="font-weight:600;font-size:var(--fs-lg);">${matName}</div>
              <div style="font-size:var(--fs-sm);color:var(--text-muted);margin-top:4px;">Stok Transit: <strong style="color:${availableQty > 0 ? 'var(--success-color)' : 'var(--danger-color)'}">${availableQty} Pallet</strong></div>
            </div>
          `;
          
          const actionDiv = document.createElement('div');
          actionDiv.style.display = 'flex';
          actionDiv.style.gap = 'var(--sp-2)';
          actionDiv.style.alignItems = 'center';
          
          const qtyInput = document.createElement('input');
          qtyInput.type = 'number';
          qtyInput.min = '1';
          qtyInput.max = availableQty.toString();
          qtyInput.value = '1';
          qtyInput.className = 'form-input';
          qtyInput.style.width = '60px';
          qtyInput.disabled = availableQty === 0;

          const tkBtn = document.createElement('button');
          tkBtn.className = 'btn btn-primary';
          tkBtn.textContent = 'Ambil';
          tkBtn.disabled = availableQty === 0;
          tkBtn.addEventListener('click', async () => {
            const tkQty = parseInt(qtyInput.value) || 1;
            if (tkQty > availableQty) {
              ToastComponent.show('Jumlah ambil melebihi stok transit!', 'danger');
              return;
            }
            
            tkBtn.disabled = true;
            tkBtn.textContent = 'Memproses...';
            
            const res = await PMCStore.takeFromTransit(matName, tkQty, selectedLine);
            if (res.success) {
              ToastComponent.show(res.message, 'success');
              render(); // re-render to update quantities
            } else {
              tkBtn.disabled = false;
              tkBtn.textContent = 'Ambil';
              ToastComponent.show(res.message, 'danger');
            }
          });

          actionDiv.appendChild(qtyInput);
          actionDiv.appendChild(tkBtn);
          
          rowDiv.appendChild(actionDiv);
          listGrid.appendChild(rowDiv);
        });
        
        matCard.appendChild(listGrid);
      }
    }
    
    grid.appendChild(matCard);
    page.appendChild(grid);
    container.appendChild(page);

    TopbarComponent.render('/transit/outbound');
  }

  return { render };
})();

window.OutboundTransitPage = OutboundTransitPage;
export default OutboundTransitPage;
