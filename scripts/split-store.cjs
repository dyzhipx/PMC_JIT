const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('src/store.js', 'utf8');
const lines = code.split('\n');

function getChunk(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

const globalVars = [
  'skuList', 'uomConversions', 'supplierList', 'bomData', 'palletQtyMap', 
  'linePerSku', 'schedules', 'warehouseInventory', 'transitInventory', 
  'blockLayout', 'transitStock', 'usedBarcodes', 'stockMutations', 
  'activeDeliveries', 'lineStock', 'lineBarcodes', 'pendingReturns', 
  'transitOutboundPending', 'transitInfoCache', 'materialReceh',
  'apiConnected', 'lineMutations', '_schedulesLoaded', '_barcodeCounter', '_midCounter', 'lineMutationReportRaw'
];

function transformCode(codeChunk) {
  let transformed = codeChunk;
  // Replace references. E.g., \bskuList\b -> PMCStore.skuList
  // But ignore `let skuList` or `PMCStore.skuList` or `{ skuList: ... }`
  
  // Actually, to make it extremely safe, we will manually define them inside each file closure,
  // pointing to PMCStore.
  // Example prefix for each file:
  /*
    const PMCStore = window.PMCStore;
    // getter/setter maps
  */
  
  return transformed;
}

function wrapModule(name, codeChunk) {
  // Instead of replacing every string, we can inject GETTERS and SETTERS at the top of the closure!
  // This is GENIUS. We don't touch the source code body, we just proxy the missing variables to window.PMCStore!
  
  // Find which variables are NOT declared in this chunk using simple regex
  const declarations = Array.from(codeChunk.matchAll(/(let|const|var)\s+([a-zA-Z0-9_]+)/g)).map(m => m[2]);
  
  let proxyVars = '';
  globalVars.forEach(v => {
    if (!declarations.includes(v)) {
       // It's used but not declared here, create a proxy
       proxyVars += `  const get_${v} = () => window.PMCStore.${v};\n`;
       proxyVars += `  const set_${v} = (val) => { window.PMCStore.${v} = val; };\n`;
    }
  });

  // Wait, JS doesn't support macros. If the code says `skuList.push(x)`, `get_skuList().push(x)` would require rewriting.
  // But we CAN use `with(window.PMCStore)`! No, `with` is strictly forbidden in strict mode, but we're not strict mode unless specified. Still discouraged.
  
  // Okay, the regex replace is better.
  let modCode = codeChunk;
  globalVars.forEach(v => {
    // Only replace if it's not a `let ` or `const ` declaration.
    // Replace \bskuList\b with PMCStore.skuList
    // Exception: { skuList: ... } (Object property)
    // Exception: .skuList (Property access)
    // RegExp: /(?<!let\s+|const\s+|var\s+|[.])\b(skuList)\b(?!:)/g
    const regex = new RegExp(`(?<!let\\s+|const\\s+|var\\s+|[.])\\b(${v})\\b(?!:)`, 'g');
    modCode = modCode.replace(regex, `PMCStore.$1`);
  });

  // Remove the `let PMCStore.skuList = ...` if the regex messed it up, but the lookbehind prevents it.
  // Actually, let's just make the regex: replace any `let skuList` with `PMCStore.skuList`.
  // Wait, we need to remove the `let ` keyword entirely!
  // Remove dead declarations
  globalVars.forEach(v => {
    const letRegex = new RegExp(`let\\s+${v}\\s*(?:=\\s*.*?)?;`, 'g');
    modCode = modCode.replace(letRegex, '');
    const constRegex = new RegExp(`const\\s+${v}\\s*(?:=\\s*.*?)?;`, 'g');
    modCode = modCode.replace(constRegex, '');
  });

  return `/* ===== PMC Store - ${name} ===== */\n((PMCStore) => {\n${modCode}\n})(window.PMCStore);`;
}

// 1. Write the core store (Manually crafted since it defines the object)
const coreStart = getChunk(1, 62); // API_BASE to safeFetch
fs.writeFileSync('src/store/core.js', `/* ===== PMC Global Store - Core ===== */
window.PMCStore = (() => {
${getChunk(3, 62).replace(/let apiConnected/g, 'let _apiConnected')}

  // Expose internal state variables explicitly
  const state = {
    apiConnected: true,
    skuList: [], uomConversions: [
      { uom: 'ROL', unit: '1 Roll', conversion: '1000 meter' },
      { uom: 'PCS', unit: '1 Pieces', conversion: '-' },
      { uom: 'KG', unit: '1 Kilogram', conversion: '1000 gram' },
      { uom: 'LBR', unit: '1 Lembar', conversion: '-' }
    ], supplierList: [], bomData: [], palletQtyMap: {}, linePerSku: [],
    schedules: [], warehouseInventory: [], transitInventory: [], blockLayout: [],
    transitStock: {}, usedBarcodes: [], stockMutations: [], activeDeliveries: [],
    lineStock: [], lineBarcodes: [], pendingReturns: [], transitOutboundPending: [],
    transitInfoCache: null, materialReceh: [], lineMutations: [], lineMutationReportRaw: { reportList: [] },
    _schedulesLoaded: false, _barcodeCounter: 0, _midCounter: 0
  };

  const store = { API_BASE, on, off, emit, safeFetch };
  
  // Create getters and setters for all state variables on the main PMCStore object
  Object.keys(state).forEach(key => {
    Object.defineProperty(store, key, {
      get: () => state[key],
      set: (val) => { state[key] = val; }
    });
  });

  return store;
})();`);

const masterCode = getChunk(64, 316).replace(/let uomConversions/g, '// uomConversions defined in core');
fs.writeFileSync('src/store/master.js', wrapModule('Master', masterCode));
fs.writeFileSync('src/store/inventory.js', wrapModule('Inventory', getChunk(317, 1135)));
fs.writeFileSync('src/store/production.js', wrapModule('Production', getChunk(1136, 1980)));
fs.writeFileSync('src/store/delivery.js', wrapModule('Delivery', getChunk(1981, 2303)));

// 3. Init module (the exports block is no longer needed since everything sits on PMCStore, but we need the API loaders)
// The API loaders are part of the chunks above, we just need to call them at the end.
fs.writeFileSync('src/store/init.js', `/* ===== PMC Global Store - Auto Init ===== */
(() => {
  const PMCStore = window.PMCStore;
${getChunk(2521, 2533)}
})();`);

console.log('Successfully split store into modular files.');
