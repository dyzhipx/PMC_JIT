/* ===== Awal Shift Stock Check Page ===== */
const StockCheckPage = (() => {
  let selectedDate = new Date().toISOString().split('T')[0];
  let blocksData = [];
  let availableMaterials = [];

  function initData() {
    // Collect all unique material names from Master BOM
    const matSet = new Set();
    PMCStore.bomData.forEach(bom => {
      bom.components.forEach(comp => matSet.add(comp.name));
    });
    availableMaterials = [...matSet].sort();

    // Load data for the selected date
    const data = PMCStore.getStockCheck(selectedDate);
    blocksData = JSON.parse(JSON.stringify(data.blocks)); // deep copy for local editing
  }

  function render() {
    if (window.location.hash !== '#/stock') return;
    if (!availableMaterials.length) initData();

    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    container.innerHTML = '';
    
    // Get master layout mapping to resolve UUIDs to Block Numbers
    const layoutMap = PMCStore.getBlockLayout();

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Header & Date Selection ──
    const headerBar = document.createElement('div');
    headerBar.className = 'page-header';
    headerBar.style.display = 'flex';
    headerBar.style.justifyContent = 'space-between';
    headerBar.style.alignItems = 'center';

    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `
      <h2 class="page-title">📦 Cek Stok Awal Shift</h2>
      <p class="page-subtitle">Pengecekan stok fisik awal area pabrik per blok (per pallet)</p>
    `;
    headerBar.appendChild(titleDiv);

    const controls = document.createElement('div');
    controls.className = 'toolbar';
    controls.innerHTML = `<span style="color:var(--text-secondary);font-size:var(--fs-sm);">Tanggal:</span>`;
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'form-input';
    dateInput.value = selectedDate;
    dateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      initData();
      render();
    });
    controls.appendChild(dateInput);

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.innerHTML = '⬇ Export Excel';
    exportBtn.addEventListener('click', exportToExcel);
    controls.appendChild(exportBtn);

    headerBar.appendChild(controls);
    page.appendChild(headerBar);

    // ── Global Summary Section ──
    const globalSummaryContainer = document.createElement('div');
    globalSummaryContainer.className = 'card';
    globalSummaryContainer.style.marginBottom = 'var(--sp-6)';
    globalSummaryContainer.style.padding = 'var(--sp-4)';
    globalSummaryContainer.style.border = '1px solid var(--border-color)';
    globalSummaryContainer.style.backgroundColor = 'var(--bg-secondary)';
    
    const gsHeader = document.createElement('h3');
    gsHeader.textContent = '📈 Total Summary Keseluruhan Stok Awal';
    gsHeader.style.marginBottom = 'var(--sp-4)';
    gsHeader.style.color = 'var(--accent-color)';
    gsHeader.style.borderBottom = '1px solid var(--border-color)';
    gsHeader.style.paddingBottom = 'var(--sp-2)';
    globalSummaryContainer.appendChild(gsHeader);

    const gsContent = document.createElement('div');
    updateGlobalSummary(blocksData, gsContent);
    globalSummaryContainer.appendChild(gsContent);

    page.appendChild(globalSummaryContainer);

    // Info Alert
    const alertBox = document.createElement('div');
    const blocksContainer = document.createElement('div');
    blocksContainer.style.display = 'flex';
    blocksContainer.style.flexDirection = 'column';
    blocksContainer.style.gap = 'var(--sp-6)';

    if (blocksData.length === 0) {
      blocksContainer.innerHTML = '<div class="empty-state">Belum ada blok yang diinisialisasi. Atur di Master Layout Blok.</div>';
    }

    blocksData.forEach((block) => {
      const blockInfo = layoutMap.find(l => l.id === block.id) || { blockNumber: block.id, rows: [] };
      const blockDisp = blockInfo.blockNumber || block.id;
      
      const blockCard = document.createElement('div');
      blockCard.className = 'card';
      blockCard.style.padding = 'var(--sp-4)';
      blockCard.style.border = '1px solid var(--border-color)';

      // Block Header
      const bHeader = document.createElement('div');
      bHeader.style.marginBottom = 'var(--sp-4)';
      bHeader.style.paddingBottom = 'var(--sp-2)';
      bHeader.style.borderBottom = '1px solid var(--border-color)';
      bHeader.innerHTML = `<h3 style="margin:0;color:var(--accent-color);">📍 Blok ${blockDisp}</h3>`;
      blockCard.appendChild(bHeader);

      // Block Content Layout: Items on Left, Summary on Right
      const bContent = document.createElement('div');
      bContent.style.display = 'grid';
      bContent.style.gridTemplateColumns = '2fr 1fr';
      bContent.style.gap = 'var(--sp-6)';
      bContent.style.alignItems = 'flex-start';

      // ── List of Materials inside the Block ──
      const itemsWrapper = document.createElement('div');
      itemsWrapper.style.display = 'flex';
      itemsWrapper.style.flexDirection = 'column';
      itemsWrapper.style.gap = 'var(--sp-4)';

      if (!block.rows || block.rows.length === 0) {
        itemsWrapper.innerHTML = '<div style="color:var(--text-muted);font-size:var(--fs-sm);">Tidak ada baris material yang diinisialisasi untuk blok ini.</div>';
      }

      (block.rows || []).forEach((row) => {
        const rowInfo = blockInfo.rows.find(l => l.id === row.id) || { rowNumber: row.id };
        const rowDisp = rowInfo.rowNumber || row.id;
        
        const matSection = document.createElement('div');
        matSection.className = 'material-section';
        matSection.style.border = '1px dashed var(--border-color)';
        matSection.style.padding = 'var(--sp-4)';
        matSection.style.borderRadius = 'var(--radius-md)';
        matSection.style.backgroundColor = 'var(--bg-secondary)';

        // Material Header
        const matHeader = document.createElement('div');
        matHeader.style.marginBottom = 'var(--sp-3)';
        
        // Check if current live stock in this row matches the assigned material
        const liveMatch = (PMCStore.transitInfoCache.blocks || [])
          .flatMap(b => b.rows)
          .find(r => r.id === row.id);
        
        let relocateWarning = '';
        if (liveMatch && liveMatch.material && row.material && liveMatch.material !== row.material) {
           relocateWarning = `<div style="font-size:10px; color:var(--warning); margin-top:4px; font-style:italic;">⚠️ Lokasi Salah! Barang ini seharusnya di Blok khusus ${liveMatch.material}. Harap pindahkan!</div>`;
        }

        matHeader.innerHTML = `
          <div style="font-size:var(--fs-sm);font-weight:700;color:var(--primary-color);margin-bottom:2px;">B.${blockDisp}.${rowDisp}</div>
          <strong style="font-size:var(--fs-lg);color:var(--text-main);">${row.material}</strong>
          ${relocateWarning}
        `;
        matSection.appendChild(matHeader);

        // Grid (Dynamic based on maxPallets)
        const gridWrapper = document.createElement('div');
        gridWrapper.style.display = 'grid';
        gridWrapper.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
        gridWrapper.style.gap = 'var(--sp-2)';
        
        row.pallets.forEach((qtyVal, pIdx) => {
          const pItem = document.createElement('div');
          pItem.style.display = 'flex';
          pItem.style.alignItems = 'center';
          pItem.style.gap = 'var(--sp-1)';
          
          const label = document.createElement('span');
          label.style.fontWeight = '500';
          label.style.fontSize = 'var(--fs-xs)';
          label.style.color = 'var(--text-secondary)';
          label.style.minWidth = '20px';
          label.textContent = `#${pIdx + 1}`;
          pItem.appendChild(label);
          
          let lastVal = qtyVal !== undefined ? qtyVal : '';
          const inpQty = document.createElement('input');
          inpQty.type = 'text'; // Allow formulas
          inpQty.className = 'form-input';
          inpQty.style.width = '100%';
          inpQty.style.padding = '4px 6px';
          inpQty.style.fontSize = 'var(--fs-sm)';
          inpQty.style.textAlign = 'right';
          inpQty.value = lastVal;
          inpQty.placeholder = 'Qty/Rumus..';
          
          const evaluateMath = (e) => {
             const val = e.target.value.trim();
             if (!val) {
                row.pallets[pIdx] = '';
                updateSummaryDisplay(block, bSummaryContent);
                return;
             }
             try {
                // Evaluasi rumus yang aman (hanya angka dan operator dasar)
                if (/^[0-9+\-*/().\s]+$/.test(val)) {
                   const result = new Function(`return ${val}`)();
                   // Bulatkan untuk menghindari error float decimal yang panjang
                   const rounded = Math.round(parseFloat(result) * 1000) / 1000; 
                   e.target.value = rounded;
                   row.pallets[pIdx] = rounded;
                } else {
                   const parsed = parseFloat(val);
                   e.target.value = isNaN(parsed) ? '' : parsed;
                   row.pallets[pIdx] = isNaN(parsed) ? '' : parsed;
                }
             } catch(err) {
                 // Revert jika rumus tidak valid
                 e.target.value = lastVal || '';
                 row.pallets[pIdx] = lastVal || '';
             }
             lastVal = e.target.value;
             
             // ── PCS vs Pallet Validation ──
             const finalVal = parseFloat(lastVal);
             if (finalVal > 0 && finalVal < 15) {
                e.target.style.boxShadow = '0 0 10px var(--warning)';
                e.target.style.borderColor = 'var(--warning)';
             } else {
                e.target.style.boxShadow = '';
                e.target.style.borderColor = '';
             }

             updateSummaryDisplay(block, bSummaryContent);
          };

          inpQty.addEventListener('blur', evaluateMath);
          inpQty.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
          pItem.appendChild(inpQty);
          gridWrapper.appendChild(pItem);
        });
        
        matSection.appendChild(gridWrapper);
        itemsWrapper.appendChild(matSection);
      });

      bContent.appendChild(itemsWrapper);

      // ── Summary Section ──
      const bSummary = document.createElement('div');
      bSummary.className = 'summary-box';
      bSummary.style.backgroundColor = 'var(--bg-secondary)';
      bSummary.style.padding = 'var(--sp-4)';
      bSummary.style.borderRadius = 'var(--radius-md)';
      bSummary.style.position = 'sticky';
      bSummary.style.top = '20px';
      
      const sumHeader = document.createElement('h4');
      sumHeader.textContent = '📊 Summary Blok';
      sumHeader.style.marginBottom = 'var(--sp-3)';
      sumHeader.style.borderBottom = '1px solid var(--border-color)';
      sumHeader.style.paddingBottom = 'var(--sp-2)';
      bSummary.appendChild(sumHeader);

      const bSummaryContent = document.createElement('div');
      updateSummaryDisplay(block, bSummaryContent);
      bSummary.appendChild(bSummaryContent);

      bContent.appendChild(bSummary);
      
      blockCard.appendChild(bContent);
      blocksContainer.appendChild(blockCard);
    });

    page.appendChild(blocksContainer);

    // ── Action Buttons ──
    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';
    actionBar.style.marginTop = 'var(--sp-6)';
    actionBar.style.display = 'flex';
    actionBar.style.justifyContent = 'flex-end';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-success btn-lg';
    saveBtn.innerHTML = '💾 Simpan Data Stok';
    saveBtn.addEventListener('click', () => {
      PMCStore.saveStockCheck(selectedDate, blocksData);
      ToastComponent.show('Data Stok berhasil disimpan!', 'success');
    });

    actionBar.appendChild(saveBtn);
    page.appendChild(actionBar);

    container.appendChild(page);
    TopbarComponent.render('/stock');
  }

  function updateSummaryDisplay(block, containerEl) {
    if (!block.rows || block.rows.length === 0) {
      containerEl.innerHTML = '<div style="color:var(--text-muted);font-size:var(--fs-sm);">Belum ada data material di blok ini.</div>';
      return;
    }

    const map = {};
    let totalPalletsActive = 0;

    block.rows.forEach(row => {
      if (row.material) {
        if (!map[row.material]) map[row.material] = { plt: 0, pcs: 0 };
        
        row.pallets.forEach(qtyVal => {
          if (qtyVal !== '' && qtyVal !== null && qtyVal !== undefined) {
            const val = parseFloat(qtyVal);
            if (!isNaN(val)) {
              map[row.material].plt++;
              map[row.material].pcs += val;
              totalPalletsActive++;
            }
          }
        });
      }
    });

    if (Object.keys(map).length === 0) {
      containerEl.innerHTML = '<div style="color:var(--text-muted);font-size:var(--fs-sm);">Material belum diisi.</div>';
      return;
    }

    let html = `<table style="width:100%;font-size:var(--fs-sm);border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid var(--border-color);color:var(--text-secondary);">
          <th style="padding-bottom:4px;text-align:left;">Material</th>
          <th style="padding-bottom:4px;text-align:right;">Pallet</th>
          <th style="padding-bottom:4px;text-align:right;">Total Pcs</th>
        </tr>
      </thead>
      <tbody>`;
    
    Object.keys(map).sort().forEach(mat => {
      if (map[mat].plt > 0) {
        html += `
          <tr style="border-bottom:1px dashed var(--border-color);">
            <td style="padding:6px 0;">${mat}</td>
            <td style="padding:6px 0;text-align:right;"><span class="badge badge-accent">${map[mat].plt}</span></td>
            <td style="padding:6px 0;text-align:right;font-weight:600;">${PMCStore.formatNumber(map[mat].pcs)}</td>
          </tr>
        `;
      }
    });

    html += `</tbody></table>`;
    
    html += `<div style="margin-top:12px;font-weight:600;display:flex;justify-content:space-between;">
      <span>Total Seluruh Pallet:</span>
      <span style="color:var(--accent-light);">${totalPalletsActive}</span>
    </div>`;

    containerEl.innerHTML = html;
    
    // Trigger global summary update whenever any block triggers a summary update
    const gsContentNode = document.getElementById('global-summary-content');
    if (gsContentNode) {
        updateGlobalSummary(blocksData, gsContentNode);
    } else {
        // Find it in DOM since it might be re-rendered
        const domGs = document.querySelector('.page-enter > .card > div:last-child');
        if (domGs) {
            const prevText = domGs.previousElementSibling?.textContent || '';
            if (prevText.includes('Keseluruhan')) {
                updateGlobalSummary(blocksData, domGs);
            }
        }
    }
  }

  function updateGlobalSummary(allBlocks, containerEl) {
    const globalObj = {};
    let totalAllPcs = 0;
    let totalAllPallets = 0;

    allBlocks.forEach(b => {
      (b.rows || []).forEach(row => {
        if (row.material) {
          if (!globalObj[row.material]) globalObj[row.material] = { plt: 0, pcs: 0 };
          row.pallets.forEach(qtyVal => {
            if (qtyVal !== '' && qtyVal !== null && qtyVal !== undefined) {
              const val = parseFloat(qtyVal);
              if (!isNaN(val)) {
                globalObj[row.material].plt++;
                globalObj[row.material].pcs += val;
                totalAllPcs += val;
                totalAllPallets++;
              }
            }
          });
        }
      });
    });

    if (Object.keys(globalObj).length === 0) {
      containerEl.innerHTML = '<div style="color:var(--text-muted);font-size:var(--fs-sm);">Belum ada data dari blok manapun.</div>';
      return;
    }

    let html = `<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:var(--sp-4);">`;
    
    Object.keys(globalObj).sort().forEach(mat => {
      if (globalObj[mat].plt > 0) {
        html += `
          <div style="background:var(--bg-main);padding:var(--sp-3);border-radius:var(--radius-md);border:1px solid var(--border-color);">
            <div style="font-weight:600;margin-bottom:var(--sp-1);color:var(--text-main);">${mat}</div>
            <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);margin-bottom:4px;">
              <span style="color:var(--text-secondary);">Total Pcs:</span>
              <span style="font-weight:bold;">${PMCStore.formatNumber(globalObj[mat].pcs)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);">
              <span style="color:var(--text-secondary);">Total Pallet:</span>
              <span class="badge badge-accent">${globalObj[mat].plt}</span>
            </div>
          </div>
        `;
      }
    });

    html += `</div>`;
    html += `
      <div style="margin-top:var(--sp-4);padding-top:var(--sp-4);border-top:1px solid var(--border-color);display:flex;gap:var(--sp-6);">
        <div style="font-size:var(--fs-lg);font-weight:bold;">Total Semua Pcs: <span style="color:var(--primary-color);">${PMCStore.formatNumber(totalAllPcs)}</span></div>
        <div style="font-size:var(--fs-lg);font-weight:bold;">Total Semua Pallet: <span style="color:var(--accent-light);">${totalAllPallets}</span></div>
      </div>
    `;

    containerEl.innerHTML = html;
  }

  function exportToExcel() {
    const layoutMap = PMCStore.getBlockLayout();
    const wb = XLSX.utils.book_new();
    
    // Summary Data Sheet
    const summaryRows = [['Blok', 'Material', 'Jumlah Pallet', 'Total Pcs']];
    blocksData.forEach(b => {
      const blockInfo = layoutMap.find(l => l.id === b.id) || { blockNumber: b.id };
      const blockDisp = blockInfo.blockNumber || b.id;
      
      const bSum = {};
      (b.rows || []).forEach(row => {
        if (row.material) {
          if (!bSum[row.material]) bSum[row.material] = { plt: 0, pcs: 0 };
          row.pallets.forEach(qtyVal => {
            if (qtyVal !== '' && qtyVal !== null) {
              const val = parseFloat(qtyVal);
              if (!isNaN(val)) {
                bSum[row.material].plt++;
                bSum[row.material].pcs += val;
              }
            }
          });
        }
      });
      Object.keys(bSum).sort().forEach(mat => {
        if (bSum[mat].plt > 0) {
          summaryRows.push([`Blok ${blockDisp}`, mat, bSum[mat].plt, bSum[mat].pcs]);
        }
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary Stok');

    // Detailed Data Sheet
    const detailRows = [['Blok', 'No. Baris', 'No. Pallet', 'Material', 'Qty Pcs']];
    blocksData.forEach(b => {
      const blockInfo = layoutMap.find(l => l.id === b.id) || { blockNumber: b.id, rows: [] };
      const blockDisp = blockInfo.blockNumber || b.id;
      
      (b.rows || []).forEach(row => {
        const rowInfo = blockInfo.rows.find(l => l.id === row.id) || { rowNumber: row.id };
        const rowDisp = rowInfo.rowNumber || row.id;
        
        if (row.material) {
          row.pallets.forEach((qtyVal, idx) => {
            if (qtyVal !== '' && qtyVal !== null) {
              const val = parseFloat(qtyVal);
              if (!isNaN(val)) {
                detailRows.push([`Blok ${blockDisp}`, `B.${blockDisp}.${rowDisp}`, idx + 1, row.material, val]);
              }
            }
          });
        }
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailRows), 'Detail Pallet');

    XLSX.writeFile(wb, `Cek_Stok_Awal_${selectedDate}.xlsx`);
    ToastComponent.show('File Excel Stok berhasil di-export!', 'success');
  }

  return { render };
})();

window.StockCheckPage = StockCheckPage;
export default StockCheckPage;
