/* ===== Pagination Component ===== */
const PaginationComponent = (() => {
  function create({ totalItems, perPage = 10, currentPage = 1, onChange }) {
    const totalPages = Math.ceil(totalItems / perPage);
    if (totalPages <= 1) return document.createElement('div');

    const nav = document.createElement('div');
    nav.className = 'pagination';

    // Prev
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => onChange(currentPage - 1));
    nav.appendChild(prevBtn);

    // Pages
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      nav.appendChild(createPageBtn(1, currentPage, onChange));
      if (start > 2) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.style.color = 'var(--text-muted)';
        dots.style.padding = '0 4px';
        nav.appendChild(dots);
      }
    }

    for (let i = start; i <= end; i++) {
      nav.appendChild(createPageBtn(i, currentPage, onChange));
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.style.color = 'var(--text-muted)';
        dots.style.padding = '0 4px';
        nav.appendChild(dots);
      }
      nav.appendChild(createPageBtn(totalPages, currentPage, onChange));
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => onChange(currentPage + 1));
    nav.appendChild(nextBtn);

    return nav;
  }

  function createPageBtn(page, current, onChange) {
    const btn = document.createElement('button');
    btn.className = `pagination-btn ${page === current ? 'active' : ''}`;
    btn.textContent = page;
    btn.addEventListener('click', () => onChange(page));
    return btn;
  }

  return { create };
})();

window.PaginationComponent = PaginationComponent;
export default PaginationComponent;
