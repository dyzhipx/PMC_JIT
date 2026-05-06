/* ===== Data Table Component (Pro UI) ===== */
const DataTableComponent = (() => {
  function create({ columns, data, actions, footer, editable, onCellEdit }) {
    const container = document.createElement('div');
    container.className = 'table-container';

    const table = document.createElement('table');
    table.className = 'data-table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    columns.forEach(col => {
      const th = document.createElement('th');
      if (col.labelHtml) th.innerHTML = col.labelHtml;
      else th.textContent = col.label;
      if (col.width) th.style.width = col.width;
      if (col.align) th.style.textAlign = col.align;
      headerRow.appendChild(th);
    });

    if (actions) {
      const th = document.createElement('th');
      th.textContent = 'AKSI';
      th.style.width = '100px';
      th.style.textAlign = 'center';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    if (data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = columns.length + (actions ? 1 : 0);
      td.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:var(--sp-2); color:var(--text-muted); padding:var(--sp-10);">
          <div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(255,255,255,0.1));">📭</div>
          <div style="font-size:var(--fs-xs); font-weight:700; letter-spacing:0.05em;">BELUM ADA DATA TERSEDIA</div>
        </div>
      `;
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        columns.forEach(col => {
          const td = document.createElement('td');
          if (col.align) td.style.textAlign = col.align;

          if (editable && col.editable) {
            const input = document.createElement('input');
            input.className = 'form-input';
            input.style.padding = '4px 8px';
            input.style.fontSize = 'var(--fs-sm)';
            input.type = col.type || 'text';
            input.value = row[col.key] ?? '';
            input.addEventListener('change', () => {
              const val = col.type === 'number' ? parseFloat(input.value) || 0 : input.value;
              if (onCellEdit) onCellEdit(rowIndex, col.key, val);
            });
            td.appendChild(input);
          } else if (col.render) {
            td.innerHTML = col.render(row[col.key], row, rowIndex);
          } else {
            td.textContent = row[col.key] ?? '';
          }
          tr.appendChild(td);
        });

        if (actions) {
          const td = document.createElement('td');
          td.style.textAlign = 'center';
          const actDiv = document.createElement('div');
          actDiv.className = 'table-actions';
          actDiv.style.justifyContent = 'center';
          actions.forEach(act => {
            const btn = document.createElement('button');
            btn.className = 'btn-icon sm btn-ghost';
            btn.innerHTML = act.icon;
            btn.title = act.label;
            btn.addEventListener('click', () => act.onClick(row, rowIndex));
            actDiv.appendChild(btn);
          });
          td.appendChild(actDiv);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      });
    }
    table.appendChild(tbody);

    container.appendChild(table);
    return container;
  }

  return { create };
})();


window.DataTableComponent = DataTableComponent;
export default DataTableComponent;
