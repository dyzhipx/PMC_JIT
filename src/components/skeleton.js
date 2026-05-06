/* ===== Skeleton Loader Component ===== */
const SkeletonComponent = (() => {
  function createCard() {
    const el = document.createElement('div');
    el.className = 'glass-card animate-fade';
    el.style.padding = 'var(--sp-5)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.gap = 'var(--sp-4)';
    el.style.borderRadius = 'var(--radius-lg)';
    el.innerHTML = `
      <div class="skeleton-bone" style="width:54px; height:54px; border-radius:var(--radius-md);"></div>
      <div style="flex-grow:1; display:flex; flex-direction:column; gap:8px;">
        <div class="skeleton-bone" style="width:40%; height:10px;"></div>
        <div class="skeleton-bone" style="width:60%; height:20px;"></div>
      </div>
    `;
    return el;
  }

  function createChart() {
    const el = document.createElement('div');
    el.className = 'glass-card animate-fade';
    el.style.padding = 'var(--sp-5)';
    el.style.height = '300px';
    el.style.borderRadius = 'var(--radius-lg)';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.gap = '15px';
    el.innerHTML = `
      <div class="skeleton-bone" style="width:30%; height:15px; margin-bottom:10px;"></div>
      <div style="flex-grow:1; display:flex; align-items:flex-end; gap:10px;">
        <div class="skeleton-bone" style="width:10%; height:40%;"></div>
        <div class="skeleton-bone" style="width:10%; height:70%;"></div>
        <div class="skeleton-bone" style="width:10%; height:50%;"></div>
        <div class="skeleton-bone" style="width:10%; height:90%;"></div>
        <div class="skeleton-bone" style="width:10%; height:60%;"></div>
        <div class="skeleton-bone" style="width:10%; height:80%;"></div>
        <div class="skeleton-bone" style="width:10%; height:30%;"></div>
      </div>
    `;
    return el;
  }

  function createTable(rows = 5) {
    const el = document.createElement('div');
    el.className = 'glass-card animate-fade';
    el.style.padding = 'var(--sp-5)';
    el.style.borderRadius = 'var(--radius-lg)';
    let rowsHtml = '';
    for(let i=0; i<rows; i++) {
        rowsHtml += `
          <div style="display:flex; gap:15px; padding:12px 0; border-bottom:1px solid var(--border);">
            <div class="skeleton-bone" style="width:20%; height:12px;"></div>
            <div class="skeleton-bone" style="width:40%; height:12px;"></div>
            <div class="skeleton-bone" style="width:15%; height:12px;"></div>
            <div class="skeleton-bone" style="width:25%; height:12px;"></div>
          </div>
        `;
    }
    el.innerHTML = `
      <div class="skeleton-bone" style="width:20%; height:15px; margin-bottom:20px;"></div>
      ${rowsHtml}
    `;
    return el;
  }

  return { createCard, createChart, createTable };
})();

window.SkeletonComponent = SkeletonComponent;
export default SkeletonComponent;
