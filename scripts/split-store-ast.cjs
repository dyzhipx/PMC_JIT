const fs = require('fs');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const code = fs.readFileSync('src/store.js', 'utf8');

// Global vars that need to be proxied to PMCStore
const globalVars = new Set([
  'skuList', 'uomConversions', 'supplierList', 'bomData', 'palletQtyMap', 'linePerSku',
  'schedules', '_schedulesLoaded', '_demoSchedules', 'warehouseInventory', '_barcodeCounter',
  '_midCounter', 'transitInfoCache', 'blockLayout', 'transitInventory', 'transitStock',
  'usedBarcodes', 'stockMutations', 'activeDeliveries', 'lineStock', 'lineBarcodes',
  'pendingReturns', 'transitOutboundPending', '_today', '_yesterday', '_tomorrow',
  'apiConnected', 'lineMutations', 'lineMutationReportRaw', 'materialReceh'
]);

const ast = babel.parse(code, {
  sourceType: 'script',
  plugins: [],
});

const chunks = {
  core: [], master: [], inventory: [], production: [], delivery: [], init: []
};

// 1. Transform variables
traverse(ast, {
  Identifier(path) {
    const isGlobal = globalVars.has(path.node.name);
    // Only replace if it's a reference (not a declaration variable, object key, etc)
    if (isGlobal && path.isReferencedIdentifier()) {
      // If the parent is MemberExpression and we are the property, do not replace.
      // isReferencedIdentifier() already handles this for standard cases.
      // Ex: `item.skuList` -> `skuList` is not referenced, it's a property. `skuList.push` -> `skuList` is referenced.
      path.replaceWith(
        t.memberExpression(t.identifier('PMCStore'), t.identifier(path.node.name))
      );
    }
  },
  VariableDeclarator(path) {
    if (path.node.id.type === 'Identifier' && globalVars.has(path.node.id.name)) {
      // Convert `let skuList = [];` -> `PMCStore.skuList = [];`
      const assignObj = t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier('PMCStore'), t.identifier(path.node.id.name)),
        path.node.init || t.identifier('undefined')
      );
      path.parentPath.replaceWith(t.expressionStatement(assignObj));
    }
  }
});

// 2. Generate new code
const transformedCode = generate(ast, {}, code).code;
const lines = transformedCode.split('\n');

function getChunk(start, end) {
  // Line numbers in AST generation don't perfectly match original, but close.
  // Actually, AST generator completely destroys original formatting and comments.
  // To preserve formatting, we can't use AST generator for the entire file.
  // We should just use String.replace with careful word-boundary regex and exception for MemberExpressions.
}

// Since AST messes up comments and formatting, let's use the Babel approach ONLY for finding safe string replacements, OR we just accept the formatting loss since we are splitting it into modules!
// For a production app, formatting loss is bad. We must preserve comments.

// Let's use a simpler Regex approach but highly safe:
// We look for identifiers: \bVAR\b
// If preceded by a dot -> property access -> skip
// If followed by a colon -> object key -> skip
// If preceded by 'let ', 'const ', 'var ' -> declaration
// Else -> replace with PMCStore.VAR
