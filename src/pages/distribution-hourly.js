/* ===== Distribusi Bahan per Jam Page ===== */
const DistributionHourlyPage = (() => {
  let selectedDate = '';

  // Time slots now come from ShiftConfig (auto Saturday/weekday)
  // Usage: const SHIFT_SLOTS = ShiftConfig.getSlots(selectedDate);

  const PALLET_PER_RITASE = 10;

  async function render() {
    if (!window.location.hash.startsWith('#/distribution/hourly')) return;
    ChartWrapper.destroyAll();
    const container = document.getElementById('page-content');
    
    const dates = PMCStore.getUniqueDates();
    if (!selectedDate && dates.length > 0) selectedDate = dates[0];

    if (selectedDate) {
      container.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; height:400px; color:var(--text-muted); flex-direction:column; gap:var(--sp-4);">
          <div class="spinner"></div>
          <p>🕐 Menyusun jadwal distribusi per jam dari database...</p>
        </div>
      `;
    } else {
      container.innerHTML = '';
    }

    // Topbar
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.innerHTML = '⬇ Export Excel';
    exportBtn.addEventListener('click', () => exportToExcel());
    TopbarComponent.render('/distribution/hourly', [exportBtn]);

    const page = document.createElement('div');
    page.className = 'page-enter';

    // ── Step indicator ──
    const stepBadge = document.createElement('div');
    stepBadge.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:20px;';
    const groupCount = ShiftConfig.getGroupCount(selectedDate);
    const dayLabel = ShiftConfig.isSaturday(selectedDate) ? ' (Jadwal Sabtu)' : '';
    stepBadge.innerHTML = `
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Distribusi / Jam${dayLabel}</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Jadwal pengiriman material per jam (${groupCount} group/shift) — 1 Ritase = ${PALLET_PER_RITASE} Pallet</span>
    `;
    page.appendChild(stepBadge);

    // ── Header with date ──
    const headerBar = document.createElement('div');
    headerBar.className = 'material-view-header';

    const leftControls = document.createElement('div');
    leftControls.className = 'toolbar';
    leftControls.style.marginBottom = '0';

    const dateLabel = document.createElement('span');
    dateLabel.style.cssText = 'color:var(--text-secondary);font-size:var(--fs-sm);';
    dateLabel.textContent = 'Tanggal:';
    leftControls.appendChild(dateLabel);

    const dateSelect = document.createElement('select');
    dateSelect.className = 'filter-select';
    dates.forEach(d => {
      dateSelect.innerHTML += `<option value="${d}" ${d === selectedDate ? 'selected' : ''}>${PMCStore.formatDate(d)}</option>`;
    });
    dateSelect.addEventListener('change', e => { selectedDate = e.target.value; render(); });
    leftControls.appendChild(dateSelect);
    headerBar.appendChild(leftControls);
    page.appendChild(headerBar);

    if (!selectedDate) {
      page.innerHTML += '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal.</div></div>';
      container.appendChild(page);
      return;
    }

    // Get data
    const hourlyData = selectedDate ? await PMCStore.getMergedHourlyDistribution(selectedDate) : [];
    
    if (selectedDate) container.innerHTML = '';

    // Render each shift as a section
    const shiftNames = ['SH1', 'SH2', 'SH3'];
    const shiftTitles = ['Shift 1', 'Shift 2', 'Shift 3'];
    const shiftColors = ['var(--primary-color)', 'var(--accent-color)', 'var(--success-color)'];

    shiftNames.forEach((shKey, sIdx) => {
      const shiftSection = document.createElement('div');
      shiftSection.className = 'section';
      shiftSection.style.marginTop = sIdx > 0 ? 'var(--sp-6)' : '0';

      const shHeader = document.createElement('div');
      shHeader.className = 'section-header';
      shHeader.innerHTML = `<h3 class="section-title" style="color:${shiftColors[sIdx]}">🕐 ${shiftTitles[sIdx]}</h3>`;
      shiftSection.appendChild(shHeader);

      const tableContainer = document.createElement('div');
      tableContainer.className = 'table-container';
      const table = document.createElement('table');
      table.className = 'data-table';

      // Build header
      const SHIFT_SLOTS = ShiftConfig.getSlots(selectedDate);
      let thSlots = '';
      SHIFT_SLOTS[shKey].forEach(slot => {
        thSlots += `<th style="text-align:center;font-size:var(--fs-xs)">Group ${slot.id}<br><span style="color:var(--text-muted);font-weight:400">${slot.label}</span></th>`;
      });

      table.innerHTML = `
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:right">SPB Shift</th>
            ${thSlots}
            <th style="text-align:right">Total Qty</th>
          </tr>
        </thead>
      `;

      const tbody = document.createElement('tbody');
      const shiftKey = `kirim${shKey}`;

      const materialsForShift = hourlyData.filter(m => m[shiftKey] > 0);

      if (materialsForShift.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="${2 + SHIFT_SLOTS[shKey].length + 1}" style="text-align:center;color:var(--text-muted);padding:var(--sp-4)">Tidak ada pengiriman di shift ini.</td>`;
        tbody.appendChild(emptyRow);
      }

      materialsForShift.forEach(mat => {
        const tr = document.createElement('tr');
        const slotData = mat.slots[shKey] || [];

        let slotCells = '';
        SHIFT_SLOTS[shKey].forEach((_, gi) => {
          const slot = mat.slots && mat.slots[shKey] ? mat.slots[shKey][gi] : undefined;
          
          if (!slot) {
            slotCells += '<td style="text-align:center;vertical-align:top;padding-top:8px"><span style="color:var(--text-muted)">—</span></td>';
            return;
          }

          const statusColor = slot.pending ? 'var(--warning-color)' : (slot.pallets > 0 ? 'var(--primary-color)' : 'var(--text-muted)');
          const pendingLabel = slot.pending ? ' <span style="font-size:9px;color:var(--warning-color)" title="Pending: stok masih cukup">⏸</span>' : '';

          let detailsHtml = '';
          if (slot.details && slot.details.length > 0) {
            const batchCounts = {};
            slot.details.forEach(p => {
              const key = `${p.supplier}|${p.qty}`;
              if (!batchCounts[key]) batchCounts[key] = { supplier: p.supplier, qty: p.qty, count: 0 };
              batchCounts[key].count++;
            });

            detailsHtml = '<div style="display:flex;flex-direction:column;gap:2px;margin-top:4px">';
            Object.values(batchCounts).forEach(b => {
              const isFallback = b.supplier === 'Master Data';
              const isActual = b.supplier === 'Aktual Gudang';
              const badgeColor = isActual ? 'var(--success-color)' : (isFallback ? 'var(--text-muted)' : 'var(--accent-color)');
              detailsHtml += `<span style="font-size:10px;padding:2px 4px;border-radius:4px;background:var(--bg-secondary);color:${badgeColor};border:1px solid var(--border-color);white-space:nowrap">${b.count}x ${b.supplier} (${b.qty})</span>`;
            });
            detailsHtml += '</div>';
          }

          slotCells += `
            <td style="text-align:center;vertical-align:top;padding-top:8px">
              <span style="color:${statusColor};font-weight:${slot.pallets > 0 ? '600' : '400'}">${slot.pallets > 0 ? PMCStore.formatDecimal(slot.pallets, 4) : '—'}${pendingLabel}</span>
              ${detailsHtml}
            </td>
          `;
        });

        tr.innerHTML = `
          <td>${mat.name}${mat.isManualRow ? ' <span class="badge badge-accent" style="font-size:9px;padding:2px 6px;">Manual</span>' : ''}</td>
          <td style="text-align:right;font-weight:600">${PMCStore.formatDecimal(mat[shiftKey], 4)}</td>
          ${slotCells}
          <td style="text-align:right;font-weight:bold">${PMCStore.formatDecimal(mat[shiftKey], 4)}</td>
        `;
        tbody.appendChild(tr);
      });

      // Footer: Total Qty, Total Pallet, Ritase
      const tfoot = document.createElement('tfoot');
      let totalQtyShift = 0;
      materialsForShift.forEach(m => { totalQtyShift += m[shiftKey]; });

      // Row 1: Total Qty per group
      let qtyFooterCells = '';
      SHIFT_SLOTS[shKey].forEach((_, gi) => {
        let gQty = 0;
        materialsForShift.forEach(m => {
          const s = m.slots && m.slots[shKey] ? m.slots[shKey][gi] : undefined;
          if (s) gQty += s.pallets;
        });
        qtyFooterCells += `<td style="text-align:center;font-weight:600">${gQty > 0 ? PMCStore.formatDecimal(gQty, 4) : '—'}</td>`;
      });

      // Row 2: Total Physical Pallet per group (count from assigned physical pallets array)
      let palletFooterCells = '';
      let totalPalletShift = 0;
      SHIFT_SLOTS[shKey].forEach((_, gi) => {
        let gPallets = 0;
        materialsForShift.forEach(m => {
          const s = m.slots && m.slots[shKey] ? m.slots[shKey][gi] : undefined;
          if (s && s.details && s.details.length > 0) {
            gPallets += s.details.length;
          } else if (s && s.pallets > 0) {
            const pQty = PMCStore.getPalletQty(m.name);
            gPallets += pQty > 0 ? Math.ceil(s.pallets / pQty) : 0;
          }
        });
        totalPalletShift += gPallets;
        palletFooterCells += `<td style="text-align:center;font-weight:600;color:var(--accent-color)">${gPallets > 0 ? gPallets : '—'}</td>`;
      });

      // Row 3: Ritase per group (1 ritase = 10 pallet)
      let ritaseFooterCells = '';
      let totalRitaseShift = 0;
      SHIFT_SLOTS[shKey].forEach((_, gi) => {
        let gPallets = 0;
        materialsForShift.forEach(m => {
          const s = m.slots && m.slots[shKey] ? m.slots[shKey][gi] : undefined;
          if (s && s.details && s.details.length > 0) {
            gPallets += s.details.length;
          } else if (s && s.pallets > 0) {
            const pQty = PMCStore.getPalletQty(m.name);
            gPallets += pQty > 0 ? Math.ceil(s.pallets / pQty) : 0;
          }
        });
        const rit = gPallets > 0 ? Math.ceil(gPallets / PALLET_PER_RITASE) : 0;
        totalRitaseShift += rit;
        ritaseFooterCells += `<td style="text-align:center;font-weight:bold;color:var(--primary-color)">${rit > 0 ? rit : '—'}</td>`;
      });

      tfoot.innerHTML = `
        <tr>
          <td colspan="2" style="font-weight:bold;color:${shiftColors[sIdx]}">Total Qty</td>
          ${qtyFooterCells}
          <td style="text-align:right;font-weight:bold">${PMCStore.formatDecimal(totalQtyShift, 4)}</td>
        </tr>
        <tr style="background:var(--bg-secondary)">
          <td colspan="2" style="font-weight:bold;color:var(--accent-color)">Total Pallet</td>
          ${palletFooterCells}
          <td style="text-align:right;font-weight:bold;color:var(--accent-color)">${totalPalletShift}</td>
        </tr>
        <tr style="background:var(--bg-secondary)">
          <td colspan="2" style="font-weight:bold;color:var(--primary-color)">Ritase <span style="font-weight:400;font-size:var(--fs-xs)">(1 rit = ${PALLET_PER_RITASE} plt)</span></td>
          ${ritaseFooterCells}
          <td style="text-align:right;font-weight:bold;font-size:var(--fs-lg);color:var(--primary-color)">${totalRitaseShift}</td>
        </tr>
      `;
      table.appendChild(tbody);
      table.appendChild(tfoot);
      tableContainer.appendChild(table);
      shiftSection.appendChild(tableContainer);
      page.appendChild(shiftSection);
    });

    // ── Qty Summary per Shift ──
    const rSection = document.createElement('div');
    rSection.className = 'section';
    rSection.style.marginTop = 'var(--sp-6)';
    const rHeader = document.createElement('div');
    rHeader.className = 'section-header';
    rHeader.innerHTML = '<h3 class="section-title">📦 Ringkasan Total Qty per Shift</h3>';
    rSection.appendChild(rHeader);

    const rGrid = document.createElement('div');
    rGrid.style.display = 'grid';
    rGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    rGrid.style.gap = 'var(--sp-4)';

    let grandTotalQty = 0;
    shiftNames.forEach((shKey, sIdx) => {
      let shiftQty = 0;
      const shiftKey = `kirim${shKey}`;
      hourlyData.filter(m => m[shiftKey] > 0).forEach(mat => {
        shiftQty += mat[shiftKey];
      });
      grandTotalQty += shiftQty;

      const card = document.createElement('div');
      card.className = 'card';
      card.style.textAlign = 'center';
      card.innerHTML = `
        <h4 style="color:${shiftColors[sIdx]};margin-bottom:var(--sp-2)">${shiftTitles[sIdx]}</h4>
        <div style="font-size:1.6rem;font-weight:bold">${PMCStore.formatDecimal(shiftQty, 4)}</div>
        <div style="color:var(--text-secondary);font-size:var(--fs-sm)">Total Qty SPB</div>
      `;
      rGrid.appendChild(card);
    });

    const grandCard = document.createElement('div');
    grandCard.className = 'card';
    grandCard.style.textAlign = 'center';
    grandCard.style.borderColor = 'var(--primary-color)';
    grandCard.innerHTML = `
      <h4 style="color:var(--primary-color);margin-bottom:var(--sp-2)">Total Hari Ini</h4>
      <div style="font-size:1.6rem;font-weight:bold;color:var(--primary-color)">${PMCStore.formatDecimal(grandTotalQty, 4)}</div>
      <div style="color:var(--text-secondary);font-size:var(--fs-sm)">Total Qty SPB</div>
    `;
    rGrid.appendChild(grandCard);

    rSection.appendChild(rGrid);
    page.appendChild(rSection);


    container.appendChild(page);
  }



  async function exportToExcel() {
    if (!selectedDate) return;
    const hourlyData = await PMCStore.getMergedHourlyDistribution(selectedDate);

    const wb = XLSX.utils.book_new();

    // One sheet per shift
    const shiftNames = ['SH1', 'SH2', 'SH3'];
    const shiftTitles = ['Shift 1', 'Shift 2', 'Shift 3'];

    shiftNames.forEach((shKey, sIdx) => {
      const SHIFT_SLOTS = ShiftConfig.getSlots(selectedDate);
      const slots = SHIFT_SLOTS[shKey];
      const header = ['Material', 'SPB Shift'];
      slots.forEach(slot => {
        header.push(`G${slot.id} Qty (${slot.label})`);
      });
      header.push('Total Qty');

      const rows = [header];
      const shiftKey = `kirim${shKey}`;

      hourlyData.filter(m => m[shiftKey] > 0).forEach(mat => {
        const row = [mat.name, mat[shiftKey]];
        (mat.slots[shKey] || []).forEach(slot => {
          row.push(slot.pallets || 0);
        });
        row.push(mat[shiftKey]);
        rows.push(row);
      });

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), shiftTitles[sIdx]);
    });

    XLSX.writeFile(wb, `Distribusi_Per_Jam_${selectedDate}.xlsx`);
    ToastComponent.show('File Excel Distribusi per Jam berhasil di-export!', 'success');
  }

  return { render };
})();

window.DistributionHourlyPage = DistributionHourlyPage;
export default DistributionHourlyPage;
