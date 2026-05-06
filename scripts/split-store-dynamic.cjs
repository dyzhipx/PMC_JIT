const fs = require('fs');

const code = fs.readFileSync('src/store.js', 'utf8');

// Find all indices of "// ── "
const sections = [];
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// ──') || lines[i].includes('/* =====')) {
    sections.push({ line: i, text: lines[i] });
  }
}

// core: 1 to start of "Master SKU Data"
// master: "Master SKU Data" to "WMS Warehouse Inventory"
// inventory: "WMS Warehouse Inventory" to "Line Production State"
// production: "Line Production State" to "Transit Outbound System (Multi-Destination)"
// delivery: "Transit Outbound System (Multi-Destination)" to "BPP API" (which is actually inside exports)
// wait, the exports block doesn't start with // ──, it starts with "return {"
let coreEnd, masterEnd, inventoryEnd, prodEnd, deliveryEnd;

for (let i = 0; i < sections.length; i++) {
  if (sections[i].text.includes('Master SKU Data')) coreEnd = sections[i].line;
  if (sections[i].text.includes('WMS Warehouse Inventory')) masterEnd = sections[i].line;
  if (sections[i].text.includes('Line Production State')) inventoryEnd = sections[i].line;
  if (sections[i].text.includes('Transit Outbound System (Multi-Destination)')) prodEnd = sections[i].line;
  // Let's find "return {"
}

// Find "return {" manually by scanning backwards from bottom
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('return {')) {
    deliveryEnd = i;
    // but wait, is there another return { before this?
    // checking if it's the main export block
    break; 
  }
}

// Wait, the main export block is indeed at line 2304. Let's use 2303 as the boundary.
deliveryEnd = 2303;

console.table({
  core: `1 to ${coreEnd}`,
  master: `${coreEnd+1} to ${masterEnd}`,
  inventory: `${masterEnd+1} to ${inventoryEnd}`,
  production: `${inventoryEnd+1} to ${prodEnd}`,
  delivery: `${prodEnd+1} to ${deliveryEnd}`
});

const globalVars = [
  'skuList', 'uomConversions', 'supplierList', 'bomData', 'palletQtyMap', 
  'linePerSku', 'schedules', 'warehouseInventory', 'transitInventory', 
  'blockLayout', 'transitStock', 'usedBarcodes', 'stockMutations', 
  'activeDeliveries', 'lineStock', 'lineBarcodes', 'pendingReturns', 
  'transitOutboundPending', 'transitInfoCache', 'materialReceh',
  'apiConnected', 'lineMutations', '_schedulesLoaded', '_barcodeCounter', '_midCounter', 'lineMutationReportRaw'
];

function transformCode(codeStr) {
  let modCode = codeStr;
  globalVars.forEach(v => {
    const regex = new RegExp(`(?<!let\\s+|const\\s+|var\\s+|[.])\\b(${v})\\b(?!:)`, 'g');
    modCode = modCode.replace(regex, `PMCStore.$1`);
  });

  // Remove dead declarations
  globalVars.forEach(v => {
    const letRegex = new RegExp(`let\\s+${v}\\s*(?:=\\s*.*?)?;`, 'g');
    modCode = modCode.replace(letRegex, '');
    const constRegex = new RegExp(`const\\s+${v}\\s*(?:=\\s*.*?)?;`, 'g');
    modCode = modCode.replace(constRegex, '');
  });
  return modCode;
}

function wrapModule(name, text) {
  return `/* ===== PMC Store - ${name} ===== */\n((PMCStore) => {\n${transformCode(text)}\n})(window.PMCStore);`;
}

function getLines(start, end) {
  return lines.slice(start, end).join('\n');
}

// Overwrite 
fs.writeFileSync('src/store/core.js', `/* ===== PMC Global Store - Core ===== */
window.PMCStore = (() => {
${getLines(2, coreEnd).replace(/let apiConnected/g, 'let _apiConnected')}

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
  
  Object.keys(state).forEach(key => {
    Object.defineProperty(store, key, {
      get: () => state[key],
      set: (val) => { state[key] = val; }
    });
  });

  return store;
})();`);

// Remove uomConversions from master cleanly by slicing line 67-73 or so
let masterCode = getLines(coreEnd, masterEnd);
masterCode = masterCode.replace(/\s*\/\/ ── UOM Conversions ──[\s\S]*?\];/g, '');

fs.writeFileSync('src/store/master.js', wrapModule('Master', masterCode));
fs.writeFileSync('src/store/inventory.js', wrapModule('Inventory', getLines(masterEnd, inventoryEnd)));
fs.writeFileSync('src/store/production.js', wrapModule('Production', getLines(inventoryEnd, prodEnd)));
fs.writeFileSync('src/store/delivery.js', wrapModule('Delivery', getLines(prodEnd, deliveryEnd)));

// Initialization block
fs.writeFileSync('src/store/init.js', `/* ===== PMC Global Store - Auto Init ===== */
(() => {
  const PMCStore = window.PMCStore;
${getLines(2520, lines.length)}
})();`);

console.log('Successfully written dynamic chunks.');
