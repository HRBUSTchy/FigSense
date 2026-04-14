const data = require('/Users/chiyao/Desktop/FigSense/test/schema.json');
const nodes = data.node.children;

// Find all true-group nodes (4 states × 3 sizes = 12)
const trueNodes = nodes.filter(n => n.name.includes('按钮模式=true'));

for (const n of trueNodes) {
  console.log('\n=== ' + n.name + ' ===');
  console.log('TOP fills:', JSON.stringify((n.fills||[]).slice(0,1)));
  console.log('TOP strokes:', JSON.stringify((n.strokes||[]).slice(0,1)));
  if (n.children) {
    for (const c of n.children) {
      const cFills = Array.isArray(c.fills) ? c.fills.length : 0;
      const cStrokes = Array.isArray(c.strokes) ? c.strokes.length : 0;
      console.log('  CHILD:', c.type, c.name, 'fills:', cFills, 'strokes:', cStrokes);
      
      // Recurse 2 more levels
      function showChildren(prefix, node, depth) {
        if (!node.children || depth <= 0) return;
        for (const ch of node.children.slice(0, 6)) {
          const f = Array.isArray(ch.fills) ? ch.fills.length : 0;
          const s = Array.isArray(ch.strokes) ? ch.strokes.length : 0;
          // Show first fill color if exists
          let fillInfo = '';
          if (f > 0 && ch.fills[0] && ch.fills[0].color) {
            const {r,g,b} = ch.fills[0].color;
            fillInfo = ` luma=${(0.299*r+0.587*g+0.114*b).toFixed(3)}`;
          }
          console.log(prefix + ch.type.padEnd(10), (ch.name||'').padEnd(25), 'f:'+f+' s:'+s + fillInfo);
          showChildren(prefix + '    ', ch, depth-1);
        }
      }
      showChildren('    ', c, 2);
    }
  }
}
