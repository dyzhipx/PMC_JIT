/* ===== Chart Wrapper Component ===== */
const ChartWrapper = (() => {
  const instances = {};

  function create(id, config) {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.flex = '1';
    card.style.minWidth = '300px';
    card.style.padding = 'var(--sp-5)';
    card.style.borderRadius = 'var(--radius-lg)';

    if (config.title) {
      const header = document.createElement('div');
      header.style.marginBottom = 'var(--sp-4)';
      header.innerHTML = `<h3 style="font-size:var(--fs-base); font-weight:600; color:var(--text-primary);">${config.title}</h3>`;
      card.appendChild(header);
    }

    const chartContainer = document.createElement('div');
    chartContainer.style.position = 'relative';
    chartContainer.style.height = config.height || '260px';
    const canvas = document.createElement('canvas');
    canvas.id = id;
    chartContainer.appendChild(canvas);
    card.appendChild(chartContainer);

    // Reset Chart.js defaults
    if (window.Chart) {
      Chart.defaults.color = '#f8fafc';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
      Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    }

    setTimeout(() => {
      if (instances[id]) instances[id].destroy();
      instances[id] = new Chart(canvas, config.chartConfig);
    }, 50);

    return card;
  }


  function destroy(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  function destroyAll() {
    Object.keys(instances).forEach(destroy);
  }

  return { create, destroy, destroyAll };
})();

window.ChartWrapper = ChartWrapper;
export default ChartWrapper;
