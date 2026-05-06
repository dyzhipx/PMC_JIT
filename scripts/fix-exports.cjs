const fs = require('fs');

const files = ['master.js', 'inventory.js', 'production.js', 'delivery.js'];
files.forEach(f => {
  let content = fs.readFileSync('src/store/' + f, 'utf8');
  
  // Find standard functions: function myFunction()
  let fns = [...content.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g)].map(m => m[1]);
  fns = [...new Set(fns)].filter(name => !name.startsWith('_'));
  
  // Find async arrow functions or const fn: const verifyBppSku = async (...) =>
  let arrowFns = [...content.matchAll(/(?:let|const|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\(.*?\)|\S+)\s*=>/g)].map(m => m[1]);
  arrowFns = [...new Set(arrowFns)].filter(name => !name.startsWith('_') && !['API_BASE', 'listeners'].includes(name));

  const allFns = [...new Set([...fns, ...arrowFns])];
  
  if (allFns.length > 0) {
    const exports = allFns.map(name => `  PMCStore.${name} = ${name};`).join('\n');
    content = content.replace(/\n\}\)\(window\.PMCStore\);/, '\n// Auto-Exports\n' + exports + '\n})(window.PMCStore);');
    fs.writeFileSync('src/store/' + f, content);
    console.log('Exported from', f, ':', allFns.join(', '));
  }
});
