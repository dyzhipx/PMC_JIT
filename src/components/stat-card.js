/* ===== Stat Card Component ===== */
const StatCardComponent = (() => {
  function create({ icon, label, value, colorType = 'accent', noAnim = false }) {
    const card = document.createElement('div');
    card.className = `stat-card ${noAnim ? '' : 'animate-slide-up'}`;
    
    // Dynamic glow color based on colorType
    const glowColor = `var(--${colorType}-glow, rgba(0, 210, 255, 0.2))`;
    card.style.setProperty('--accent-gradient', `linear-gradient(135deg, var(--${colorType}), var(--${colorType}-light, var(--${colorType})))`);

    card.innerHTML = `
      <div class="stat-card-icon" style="background:var(--${colorType}-bg); color:var(--${colorType}); box-shadow:0 0 15px ${glowColor};">
        ${icon}
      </div>
      <div class="stat-card-body">
        <div class="stat-card-label">${label}</div>
        <div class="stat-card-value">${value}</div>
      </div>
    `;

    // Handle number animation if value is numeric or contains numbers
    if (!noAnim) {
      const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        const valueDiv = card.querySelector('.stat-card-value');
        animateCount(valueDiv, numericValue);
      }
    }

    return card;
  }

  function animateCount(el, target) {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * target);
      
      el.textContent = PMCStore.formatNumber ? PMCStore.formatNumber(current) : current.toLocaleString();

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }


  return { create };
})();

window.StatCardComponent = StatCardComponent;
export default StatCardComponent;
