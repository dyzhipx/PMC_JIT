/* ===== Master Blok Initialization Page ===== */
const MasterBlockPage = (() => {
  let availableMaterials = [];
  let layout = [];
  let filterLine = '';

  // Line color map for badges (consistent with Master Line per SKU)
  const lineColors = {
    'A': { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
    'B': { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    'C': { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    'D': { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    'E': { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
    'F': { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
    'G': { bg: 'rgba(234, 88, 12, 0.15)', color: '#fb923c', border: 'rgba(234, 88, 12, 0.3)' },
    'H': { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  };

  let _listening = false;

  function getLineColor(line) {
    return lineColors[line] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' };
  }

  function getLineBadgeHtml(line) {
    if (!line) return '';
    const c = getLineColor(line);
    return `<span style="display:inline-block;padding:2px 7px;border-radius:5px;font-size:0.7rem;font-weight:600;background:${c.bg};color:${c.color};border:1px solid ${c.border}">${line}</span>`;
  }

  function initData() {
    const matSet = new Set();
    if (PMCStore.bomData) {
      PMCStore.bomData.forEach(bom => {
        if (bom.components) {
          bom.components.forEach(comp => matSet.add(comp.name));
        }
      });
    }
    availableMaterials = [...matSet].sort();
    layout = PMCStore.getBlockLayout();
  }

  function render() {
    if (window.location.hash !== '#/master/block') return;

    if (!_listening) {
      PMCStore.on('layoutChanged', () => {
        if (window.location.hash === '#/master/block') {
          initData();
          render();
        }
      });
      _listening = true;
    }

    if (!layout || layout.length === 0) initData();

    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Header ──
    const headerBar = document.createElement('div');
    headerBar.className = 'page-header';
    headerBar.style.display = 'flex';
    headerBar.style.justifyContent = 'space-between';
    headerBar.style.alignItems = 'center';

    headerBar.innerHTML = `
      <div>
        <h2 class="page-title">🗺️ Master Layout Blok</h2>
        <p class="page-subtitle">Atur material dan line produksi pada setiap baris blok pabrik</p>
      </div>
    `;

    const saveBtnTop = document.createElement('button');
    saveBtnTop.className = 'btn btn-success btn-lg';
    saveBtnTop.innerHTML = '💾 Simpan Konfigurasi';
    saveBtnTop.addEventListener('click', saveConfig);
    headerBar.appendChild(saveBtnTop);
    page.appendChild(headerBar);

    // Info Alert
    const alertBox = document.createElement('div');
    alertBox.className = 'alert alert-info';
    alertBox.style.marginBottom = 'var(--sp-6)';
    alertBox.innerHTML = `
      <span class="alert-icon">ℹ️</span>
      <span>Pilih SKU per blok, lalu klik <strong>badge Line</strong> di setiap baris untuk mengaktifkan/menonaktifkan line. Jangan lupa klik <strong>Simpan</strong>.</span>
    `;
    page.appendChild(alertBox);

    // ── Helper: Get SKUs from Categories ──
    const getSkusByCategories = (cats) => {
      if (!cats || cats.length === 0) return [];
      return PMCStore.skuList.filter(sku => cats.includes(sku.category));
    };

    const getLinesByCategories = (cats) => {
      const skus = getSkusByCategories(cats);
      const lSet = new Set();
      skus.forEach(sku => {
        PMCStore.getLinesForSku(sku.id).forEach(l => lSet.add(l));
      });
      return [...lSet].sort();
    };

    const getMaterialsByCategories = (cats) => {
      const skus = getSkusByCategories(cats);
      const mSet = new Set();
      skus.forEach(sku => {
        const bom = PMCStore.getBOM(sku.id);
        if (bom && bom.components) {
          bom.components.forEach(c => mSet.add(c.name));
        }
      });
      return [...mSet].sort();
    };

    // ── Collect all unique lines from all blocks' SKU mappings ──
    const allLinesSet = new Set();
    layout.forEach(block => {
      if (block.skuCategories && block.skuCategories.length > 0) {
        getLinesByCategories(block.skuCategories).forEach(l => allLinesSet.add(l));
      }
    });
    const allLines = [...allLinesSet].sort();

    // ── Filter Toolbar ──
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.alignItems = 'center';
    toolbar.style.gap = '12px';
    toolbar.style.marginBottom = 'var(--sp-4)';
    toolbar.style.flexWrap = 'wrap';

    const filterLabel = document.createElement('span');
    filterLabel.style.fontSize = 'var(--fs-sm)';
    filterLabel.style.fontWeight = '600';
    filterLabel.style.color = 'var(--text-secondary)';
    filterLabel.textContent = '🏭 Filter Line:';
    toolbar.appendChild(filterLabel);

    const filterSelect = document.createElement('select');
    filterSelect.className = 'form-input';
    filterSelect.style.width = 'auto';
    filterSelect.style.minWidth = '160px';
    filterSelect.style.padding = '6px 10px';
    filterSelect.style.fontSize = 'var(--fs-sm)';
    filterSelect.innerHTML = `<option value="">-- Semua Line --</option>`;
    allLines.forEach(l => {
      filterSelect.innerHTML += `<option value="${l}" ${filterLine === l ? 'selected' : ''}>${l}</option>`;
    });
    filterSelect.addEventListener('change', (e) => {
      filterLine = e.target.value;
      render();
    });
    toolbar.appendChild(filterSelect);

    if (filterLine) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'btn btn-ghost btn-sm';
      clearBtn.style.fontSize = 'var(--fs-xs)';
      clearBtn.textContent = '✕ Reset';
      clearBtn.addEventListener('click', () => { filterLine = ''; render(); });
      toolbar.appendChild(clearBtn);
    }

    page.appendChild(toolbar);

    // ── Grid Container for Blocks ──
    const blocksContainer = document.createElement('div');
    blocksContainer.style.display = 'grid';
    blocksContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(380px, 1fr))';
    blocksContainer.style.gap = 'var(--sp-4)';

    // Filter: show blocks whose SKU mapping includes the selected line
    const filteredLayout = filterLine
      ? layout.filter(block => {
          if (!block.skuCategories || block.skuCategories.length === 0) return false;
          const lines = getLinesByCategories(block.skuCategories);
          return lines.includes(filterLine);
        })
      : layout;

    filteredLayout.forEach(block => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = 'var(--sp-3)';

      // Ensure block has skuCategories array initialized
      if (!block.skuCategories) block.skuCategories = [];

      // Lines available for this block's Categories (from Master Line per SKU mapping)
      const skuLines = block.skuCategories.length > 0 ? getLinesByCategories(block.skuCategories) : [];

      // Collect lines actually assigned to rows in this block (for header badge)
      const activeBlockLines = new Set();
      if (block.rows) {
        block.rows.forEach(row => {
          if (row.lines && Array.isArray(row.lines)) {
            row.lines.forEach(l => activeBlockLines.add(l));
          }
        });
      }

      // ── Card Header ──
      const cardHeader = document.createElement('div');
      cardHeader.style.display = 'flex';
      cardHeader.style.justifyContent = 'space-between';
      cardHeader.style.alignItems = 'center';
      cardHeader.style.borderBottom = '1px solid var(--border-color)';
      cardHeader.style.paddingBottom = 'var(--sp-2)';

      let headerHtml = `<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;"><h3 style="margin:0;color:var(--accent-color);">📍 Blok ${block.blockNumber || block.id}</h3>`;
      [...activeBlockLines].sort().forEach(l => { headerHtml += getLineBadgeHtml(l); });
      headerHtml += `</div>`;
      cardHeader.innerHTML = headerHtml;

      const delBlockBtn = document.createElement('button');
      delBlockBtn.className = 'btn btn-ghost btn-danger btn-sm';
      delBlockBtn.textContent = '❌';
      delBlockBtn.title = 'Hapus Blok';
      delBlockBtn.addEventListener('click', () => {
        if (confirm(`Yakin hapus Blok ${block.blockNumber || block.id}?`)) {
          layout = layout.filter(b => b.id !== block.id);
          render();
        }
      });
      cardHeader.appendChild(delBlockBtn);
      card.appendChild(cardHeader);

      // ── Content area ──
      const matList = document.createElement('div');
      matList.style.display = 'flex';
      matList.style.flexDirection = 'column';
      matList.style.gap = 'var(--sp-2)';
      matList.style.minHeight = '60px';

      if (!block.rows) {
        block.rows = [
          { id: 'nr-1', rowNumber: 1, maxPallets: 4 },
          { id: 'nr-2', rowNumber: 2, maxPallets: 4 },
          { id: 'nr-3', rowNumber: 3, maxPallets: 4 },
          { id: 'nr-4', rowNumber: 4, maxPallets: 4 }
        ];
      }

      // ── Category Selector UI ──
      const skuSelectorWrapper = document.createElement('div');
      skuSelectorWrapper.className = 'form-group';
      skuSelectorWrapper.style.marginBottom = 'var(--sp-2)';
      skuSelectorWrapper.innerHTML = `<label class="form-label" style="font-size:11px;margin-bottom:4px;">Setting Kategori SKU untuk Blok ini:</label>`;

      const categoryContainer = document.createElement('div');
      categoryContainer.style.display = 'flex';
      categoryContainer.style.flexDirection = 'column';
      categoryContainer.style.gap = 'var(--sp-2)';

      // Selected categories display
      const selectedCatsDiv = document.createElement('div');
      selectedCatsDiv.style.display = 'flex';
      selectedCatsDiv.style.flexWrap = 'wrap';
      selectedCatsDiv.style.gap = '6px';
      
      block.skuCategories.forEach(cat => {
        const catBadge = document.createElement('div');
        catBadge.style.display = 'flex';
        catBadge.style.alignItems = 'center';
        catBadge.style.background = 'var(--bg-secondary)';
        catBadge.style.border = '1px solid var(--border-color)';
        catBadge.style.padding = '2px 8px';
        catBadge.style.borderRadius = 'var(--radius-sm)';
        catBadge.style.fontSize = 'var(--fs-xs)';
        catBadge.style.fontWeight = '500';
        
        catBadge.innerHTML = `<span>${cat}</span>`;
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.style.background = 'none';
        removeBtn.style.border = 'none';
        removeBtn.style.color = 'var(--danger-color)';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.marginLeft = '4px';
        removeBtn.style.padding = '0 2px';
        removeBtn.addEventListener('click', () => {
          block.skuCategories = block.skuCategories.filter(c => c !== cat);
          block.rows.forEach(r => { r.lines = []; });
          render();
        });
        catBadge.appendChild(removeBtn);
        selectedCatsDiv.appendChild(catBadge);
      });
      categoryContainer.appendChild(selectedCatsDiv);

      // Unique Categories available globally
      const uniqueCats = [...new Set(PMCStore.skuList.map(s => s.category).filter(c => c))].sort();
      const availableCats = uniqueCats.filter(c => !block.skuCategories.includes(c));

      if (availableCats.length > 0) {
        const catSelectWrapper = document.createElement('div');
        catSelectWrapper.style.display = 'flex';
        catSelectWrapper.style.gap = '4px';
        
        const catSelect = document.createElement('select');
        catSelect.className = 'form-input';
        catSelect.style.fontSize = 'var(--fs-xs)';
        catSelect.style.padding = '4px 8px';
        catSelect.style.flex = '1';
        catSelect.innerHTML = `<option value="">-- Tambah Kategori SKU --</option>`;
        availableCats.forEach(cat => {
          catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        
        catSelect.addEventListener('change', (e) => {
          if (e.target.value) {
            block.skuCategories.push(e.target.value);
            block.rows.forEach(r => { r.lines = []; });
            render();
          }
        });
        
        catSelectWrapper.appendChild(catSelect);
        categoryContainer.appendChild(catSelectWrapper);
      }
      skuSelectorWrapper.appendChild(categoryContainer);

      // Show mapped lines info under category select
      if (skuLines.length > 0) {
        const lineInfo = document.createElement('div');
        lineInfo.style.marginTop = '6px';
        lineInfo.style.fontSize = '10px';
        lineInfo.style.color = 'var(--text-muted)';
        let infoHtml = `Line terpetakan: `;
        skuLines.forEach(l => { infoHtml += getLineBadgeHtml(l) + ' '; });
        lineInfo.innerHTML = infoHtml;
        skuSelectorWrapper.appendChild(lineInfo);
      } else if (block.skuCategories.length === 0) {
         const infoNode = document.createElement('div');
         infoNode.style.fontSize = '10px';
         infoNode.style.marginTop = '6px';
         infoNode.style.color = 'var(--text-muted)';
         infoNode.textContent = 'Menampilkan semua material karena kategori kosong (Tanpa Filter).';
         skuSelectorWrapper.appendChild(infoNode);
      }

      card.appendChild(skuSelectorWrapper);

      // Determine materials
      let blockMaterials = availableMaterials;
      if (block.skuCategories && block.skuCategories.length > 0) {
        const mtls = getMaterialsByCategories(block.skuCategories);
        if (mtls.length > 0) {
           blockMaterials = mtls;
        } else {
           blockMaterials = [];
        }
      }

      // Row count + Add row
      const rowHeader = document.createElement('div');
      rowHeader.style.display = 'flex';
      rowHeader.style.justifyContent = 'space-between';
      rowHeader.style.alignItems = 'center';
      rowHeader.style.marginTop = 'var(--sp-2)';
      rowHeader.innerHTML = `<span style="font-size:var(--fs-xs);color:var(--text-muted);font-weight:600;">Jumlah Baris: ${block.rows.length}</span>`;

      const addRowBtn = document.createElement('button');
      addRowBtn.className = 'btn btn-ghost btn-sm';
      addRowBtn.style.padding = '2px 8px';
      addRowBtn.style.fontSize = 'var(--fs-xs)';
      addRowBtn.textContent = '+ Tambah Baris';
      addRowBtn.addEventListener('click', () => {
        const nextRowNumber = block.rows.length > 0 ? Math.max(...block.rows.map(r => r.rowNumber || parseInt(r.id) || 0)) + 1 : 1;
        block.rows.push({ id: 'nr-' + Date.now(), rowNumber: nextRowNumber, maxPallets: 4, material: '', lines: [] });
        render();
      });
      rowHeader.appendChild(addRowBtn);
      matList.appendChild(rowHeader);

      // ── Render Rows ──
      const rowsContainer = document.createElement('div');
      rowsContainer.style.display = 'flex';
      rowsContainer.style.flexDirection = 'column';
      rowsContainer.style.gap = '6px';
      rowsContainer.style.border = '1px solid var(--border-color)';
      rowsContainer.style.padding = '8px';
      rowsContainer.style.borderRadius = 'var(--radius-md)';
      rowsContainer.style.background = 'var(--bg-main)';

      block.rows.forEach((row, rowIdx) => {
        // Ensure row.lines is an array
        if (!row.lines || !Array.isArray(row.lines)) row.lines = [];

        // Filter: if global filter active, only show rows that include the filtered line
        if (filterLine && !row.lines.includes(filterLine)) return;

        const rowDiv = document.createElement('div');
        rowDiv.style.background = row.isFlexible ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-secondary)';
        rowDiv.style.border = row.isFlexible ? '1.5px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent';
        rowDiv.style.padding = '8px';
        rowDiv.style.borderRadius = 'var(--radius-sm)';
        rowDiv.style.display = 'flex';
        rowDiv.style.flexDirection = 'column';
        rowDiv.style.gap = '6px';
        rowDiv.style.transition = 'all 0.2s ease';

        // ── Top part: Label + Material + Max + Delete ──
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.alignItems = 'center';
        topRow.style.gap = '8px';

        // Label
        const labelSpan = document.createElement('span');
        labelSpan.style.fontSize = 'var(--fs-sm)';
        labelSpan.style.fontWeight = '700';
        labelSpan.style.color = 'var(--primary-color)';
        labelSpan.style.whiteSpace = 'nowrap';
        labelSpan.textContent = `B.${block.blockNumber || block.id}.${row.rowNumber || row.id}`;
        topRow.appendChild(labelSpan);

        // Material Dropdown
        const matSelect = document.createElement('select');
        matSelect.className = 'form-input';
        matSelect.style.flex = '1';
        matSelect.style.padding = '2px 4px';
        matSelect.style.fontSize = 'var(--fs-xs)';
        matSelect.innerHTML = `<option value="">-- Kosong --</option>`;
        blockMaterials.forEach(m => {
          matSelect.innerHTML += `<option value="${m}" ${row.material === m ? 'selected' : ''}>${m}</option>`;
        });
        matSelect.addEventListener('change', (e) => { row.material = e.target.value; });
        topRow.appendChild(matSelect);

        // Max
        const qtyWrapper = document.createElement('div');
        qtyWrapper.style.display = 'flex';
        qtyWrapper.style.alignItems = 'center';
        qtyWrapper.style.gap = '4px';
        qtyWrapper.innerHTML = `<span style="font-size:10px;color:var(--text-muted);">Max:</span>`;
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'form-input';
        qtyInput.style.padding = '2px 4px';
        qtyInput.style.width = '45px';
        qtyInput.style.fontSize = 'var(--fs-sm)';
        qtyInput.style.textAlign = 'center';
        qtyInput.value = row.maxPallets;
        qtyInput.min = '1';
        qtyInput.addEventListener('change', (e) => { row.maxPallets = parseInt(e.target.value) || 4; });
        qtyWrapper.appendChild(qtyInput);
        topRow.appendChild(qtyWrapper);

        // Slow Moving Toggle
        const flexWrapper = document.createElement('div');
        flexWrapper.style.display = 'flex';
        flexWrapper.style.alignItems = 'center';
        flexWrapper.style.gap = '4px';
        flexWrapper.style.marginLeft = '4px';
        flexWrapper.title = 'Tandai sebagai Area Slow Moving (Bisa Campur Barang & Diabaikan Inbound Otomatis)';
        
        const flexCheck = document.createElement('input');
        flexCheck.type = 'checkbox';
        flexCheck.checked = row.isFlexible || false;
        flexCheck.style.cursor = 'pointer';
        flexCheck.addEventListener('change', (e) => { 
          row.isFlexible = e.target.checked; 
          render(); // Re-render to update color
        });
        
        const flexLabel = document.createElement('span');
        flexLabel.style.fontSize = '10px';
        flexLabel.style.fontWeight = '700';
        flexLabel.style.color = row.isFlexible ? '#7c3aed' : 'var(--text-muted)';
        flexLabel.textContent = '📦 Slow';
        
        flexWrapper.appendChild(flexCheck);
        flexWrapper.appendChild(flexLabel);
        topRow.appendChild(flexWrapper);

        // Delete
        const delRowBtn = document.createElement('button');
        delRowBtn.textContent = '✖';
        delRowBtn.style.background = 'none';
        delRowBtn.style.border = 'none';
        delRowBtn.style.color = 'var(--danger-color)';
        delRowBtn.style.cursor = 'pointer';
        delRowBtn.style.fontSize = '12px';
        delRowBtn.addEventListener('click', () => {
          if (confirm(`Hapus Baris B.${block.blockNumber || block.id}.${row.rowNumber || row.id}?`)) {
            block.rows.splice(rowIdx, 1);
            render();
          }
        });
        topRow.appendChild(delRowBtn);
        rowDiv.appendChild(topRow);

        // ── Bottom part: Line toggle pills ──
        if (skuLines.length > 0) {
          const lineRow = document.createElement('div');
          lineRow.style.display = 'flex';
          lineRow.style.alignItems = 'center';
          lineRow.style.gap = '5px';
          lineRow.style.flexWrap = 'wrap';

          const lineLabel = document.createElement('span');
          lineLabel.style.fontSize = '10px';
          lineLabel.style.color = 'var(--text-muted)';
          lineLabel.style.fontWeight = '600';
          lineLabel.style.marginRight = '2px';
          lineLabel.textContent = 'Line:';
          lineRow.appendChild(lineLabel);

          skuLines.forEach(line => {
            const isActive = row.lines.includes(line);
            const c = getLineColor(line);
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.style.display = 'inline-flex';
            pill.style.alignItems = 'center';
            pill.style.justifyContent = 'center';
            pill.style.padding = '3px 10px';
            pill.style.borderRadius = '6px';
            pill.style.fontSize = '0.75rem';
            pill.style.fontWeight = '600';
            pill.style.cursor = 'pointer';
            pill.style.transition = 'all 0.15s ease';
            pill.style.border = `1.5px solid ${isActive ? c.color : 'var(--border-color)'}`;
            pill.style.background = isActive ? c.bg : 'transparent';
            pill.style.color = isActive ? c.color : 'var(--text-muted)';
            pill.style.opacity = isActive ? '1' : '0.5';
            pill.textContent = line;
            pill.title = isActive ? `Klik untuk nonaktifkan Line ${line}` : `Klik untuk aktifkan Line ${line}`;

            pill.addEventListener('click', () => {
              if (row.lines.includes(line)) {
                row.lines = row.lines.filter(l => l !== line);
              } else {
                row.lines.push(line);
                row.lines.sort();
              }
              render();
            });

            lineRow.appendChild(pill);
          });

          rowDiv.appendChild(lineRow);
        } else if (block.skuCategories && block.skuCategories.length > 0) {
          const noLineMsg = document.createElement('div');
          noLineMsg.style.fontSize = '10px';
          noLineMsg.style.color = 'var(--text-muted)';
          noLineMsg.style.fontStyle = 'italic';
          noLineMsg.textContent = 'Belum ada line terpetakan untuk kategori SKU ini.';
          rowDiv.appendChild(noLineMsg);
        }

        rowsContainer.appendChild(rowDiv);
      });
      matList.appendChild(rowsContainer);
      card.appendChild(matList);
      blocksContainer.appendChild(card);
    });

    // Add Block Card
    if (!filterLine) {
      const addCard = document.createElement('div');
      addCard.className = 'card';
      addCard.style.display = 'flex';
      addCard.style.alignItems = 'center';
      addCard.style.justifyContent = 'center';
      addCard.style.minHeight = '150px';
      addCard.style.border = '2px dashed var(--border-color)';
      addCard.style.backgroundColor = 'transparent';
      addCard.style.boxShadow = 'none';
      addCard.style.cursor = 'pointer';
      addCard.innerHTML = `<div style="text-align:center;color:var(--text-secondary);">
        <div style="font-size:2rem;margin-bottom:var(--sp-2);">➕</div>
        <div style="font-weight:600;">Tambah Blok Baru</div>
      </div>`;
      addCard.addEventListener('click', () => {
        const nextBlockNumber = layout.length > 0 ? Math.max(...layout.map(b => b.blockNumber || parseInt(b.id) || 0)) + 1 : 1;
        layout.push({
          id: 'new-' + Date.now(),
          blockNumber: nextBlockNumber,
          skuCategories: [],
          rows: [
            { id: 'nr-1', rowNumber: 1, maxPallets: 4, material: '', lines: [] },
            { id: 'nr-2', rowNumber: 2, maxPallets: 4, material: '', lines: [] },
            { id: 'nr-3', rowNumber: 3, maxPallets: 4, material: '', lines: [] },
            { id: 'nr-4', rowNumber: 4, maxPallets: 4, material: '', lines: [] }
          ]
        });
        render();
        window.scrollTo(0, document.body.scrollHeight);
      });
      blocksContainer.appendChild(addCard);
    }

    page.appendChild(blocksContainer);
    container.appendChild(page);
    TopbarComponent.render('/master/block');
  }

  function saveConfig() {
    PMCStore.saveBlockLayout(layout);
    ToastComponent.show('Konfigurasi Master Blok berhasil disimpan!', 'success');
  }

  return { render };
})();

window.MasterBlockPage = MasterBlockPage;
export default MasterBlockPage;
