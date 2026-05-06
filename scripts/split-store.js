const fs = require('fs');

const code = fs.readFileSync('src/store.js', 'utf8');
const lines = code.split('\n');

// Map line numbers based on our investigation
// 1 - 63: core
// 64 - 316: master
// 317 - 369: WMS warehouse
// 370 - 1135: helpers / priority (might go to transit or master)
// 1136 - 1980: production
// 1981 - 2084: delivery / transit outbound
// 2085 - 2518: exports

function getChunk(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

// Variables that were private but now must be accessed via PMCStore
const globalVars = [
  'skuList', 'uomConversions', 'supplierList', 'bomData', 'palletQtyMap', 
  'linePerSku', 'schedules', 'warehouseInventory', 'transitInventory', 
  'blockLayout', 'transitStock', 'usedBarcodes', 'stockMutations', 
  'activeDeliveries', 'lineStock', 'lineBarcodes', 'pendingReturns', 
  'transitOutboundPending', 'transitInfoCache', 'materialReceh', 'apiConnected',
  'lineMutations'
];

// Helper to wrap code in Mixin IIFE
function wrapModule(name, code, exportsObj) {
  // Replace internal variable access to PMCStore.var
  // This is a naive replace, might need careful regex to avoid replacing properties
  // e.g. item.skuList shouldn't be PMCStore.skuList
  let transformed = code;
  
  // We won't do AST, we'll just write it as Object.assign at the end.
  // Wait, if it's the SAME file, we don't even need to replace!
  // If we just attach properties to PMCStore and use "let" inside, they are protected.
  // But if File B needs File A's 'skuList', File B MUST use PMCStore.skuList.
  
  globalVars.forEach(v => {
    // Replace variable usages that are NOT preceded by a dot or quotation marks or let/const
    // Lookbehind is tricky. We'll rely on the fact that we can just use PMCStore...
  });

  return `/* ===== PMC Store - ${name} ===== */\n(() => {\n${transformed}\n\n  Object.assign(window.PMCStore, {\n    ${exportsObj}\n  });\n})();`;
}

// Write scripts
fs.writeFileSync('src/store/core.js', `/* ===== PMC Global Store - Core ===== */
window.PMCStore = (() => {
${getChunk(3, 62)}
  return { API_BASE, on, off, emit, safeFetch, get apiConnected() { return apiConnected; } };
})();`);

// Just generate the chunks, we'll manually fix them using VS Code / text editor
fs.writeFileSync('src/store/chunk-master.js', getChunk(64, 316));
fs.writeFileSync('src/store/chunk-inventory.js', getChunk(317, 1135));
fs.writeFileSync('src/store/chunk-production.js', getChunk(1136, 1980));
fs.writeFileSync('src/store/chunk-delivery.js', getChunk(1981, 2084));
fs.writeFileSync('src/store/chunk-exports.js', getChunk(2085, 2518));
fs.writeFileSync('src/store/chunk-init.js', getChunk(2519, 2533));

console.log('Split into chunks for manual processing.');
