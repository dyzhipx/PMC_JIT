const fs = require('fs');

const files = ['master.js', 'inventory.js', 'production.js', 'delivery.js'];

// 1. Collect all functions
const allExportedFunctions = {};

files.forEach(f => {
  let content = fs.readFileSync('src/store/' + f, 'utf8');
  let fns = [...content.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g)].map(m => m[1]);
  let arrowFns = [...content.matchAll(/(?:let|const|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\(.*?\)|\S+)\s*=>/g)].map(m => m[1]);
  
  const chunkFns = [...new Set([...fns, ...arrowFns])].filter(n => !n.startsWith('_'));
  allExportedFunctions[f] = chunkFns;
});

const allFns = Object.values(allExportedFunctions).flat();

// 2. Inject destructuring at top of each file
files.forEach(f => {
  let content = fs.readFileSync('src/store/' + f, 'utf8');
  
  // Find which functions are used in this file but NOT DECLARED in this file
  const declaredHere = allExportedFunctions[f];
  const usedNotDeclared = [];
  
  allFns.forEach(fn => {
    if (!declaredHere.includes(fn)) {
      // Check if it's used using word boundary regex
      const usageRegex = new RegExp(`(?<![a-zA-Z0-9_.])${fn}(?![a-zA-Z0-9_])`, 'g');
      if (usageRegex.test(content)) {
        usedNotDeclared.push(fn);
      }
    }
  });

  if (usedNotDeclared.length > 0) {
    const destructure = `  const { ${usedNotDeclared.join(', ')} } = PMCStore;`;
    
    // Inject right after ((PMCStore) => {
    content = content.replace(/\(\(PMCStore\)\s*=>\s*\{/, `((PMCStore) => {\n${destructure}`);
    fs.writeFileSync('src/store/' + f, content);
    console.log(`Injected into ${f}: ${usedNotDeclared.join(', ')}`);
  }
});
