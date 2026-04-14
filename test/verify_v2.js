const data = require('/Users/chiyao/Desktop/FigSense/test/schema.json');

// Simulate the NEW serialization with nested children (depth=3)
function serializeChildRecursive(node, depth) {
  const obj = {
    id: node.id,
    type: node.type,
    name: node.name || '',
    visible: node.visible !== false
  };
  if (typeof node.x === 'number') obj.x = node.x;
  if (typeof node.y === 'number') obj.y = node.y;
  if (typeof node.width === 'number') obj.width = node.width;
  if (typeof node.height === 'number') obj.height = node.height;
  if (Array.isArray(node.fills)) {
    const f = node.fills.map(p => p && p.visible !== false ? { type: p.type, opacity: p.opacity ?? 1, color: p.color ? { r:p.color.r, g:p.color.g, b:p.color.b } : null } : null).filter(Boolean);
    if (f.length) obj.fills = f;
  }
  if (Array.isArray(node.strokes)) {
    const s = node.strokes.map(p => p && p.visible !== false ? { type: p.type, opacity: p.opacity ?? 1, color: p.color ? { r:p.color.r, g:p.color.g, b:p.color.b } : null } : null).filter(Boolean);
    if (s.length) obj.strokes = s;
  }
  if (typeof node.opacity === 'number') obj.opacity = node.opacity;

  // Recursively serialize nested children
  if (depth > 1 && Array.isArray(node.children)) {
    const gc = node.children.filter(c => c && c.visible !== false).map(c => serializeChildRecursive(c, depth - 1));
    if (gc.length) obj.children = gc;
  }
  return obj;
}

// Build snapshot for each component node
function buildSnapshot(node) {
  const snap = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible !== false,
    x: node.x || 0, y: node.y || 0,
    width: node.width || 0, height: node.height || 0,
    children: Array.isArray(node.children)
      ? node.children.filter(c => c && c.visible !== false).map(c => serializeChildRecursive(c, 3))
      : []
  };
  // Add top-level style fields
  if (Array.isArray(node.fills)) {
    const f = node.fills.map(p => p && p.visible!==false && p.color 
      ? {type:p.type, opacity:p.opacity??1, color:{r:p.color.r,g:p.color.g,b:p.color.b}} : null).filter(Boolean);
    if (f.length) snap.fills = f;
  }
  if (Array.isArray(node.strokes)) {
    const s = node.strokes.map(p => p && p.visible!==false && p.color 
      ? {type:p.type, opacity:p.opacity??1, color:{r:p.color.r,g:p.color.g,b:p.color.b}} : null).filter(Boolean);
    if (s.length) snap.strokes = s;
  }
  return snap;
}

const nodes = data.node.children.filter(n => n.type === 'COMPONENT');
console.log('Total components:', nodes.length);

// Extract features matching the actual embedding logic
function norm(v, lo=0, hi=1) { return Math.max(0, Math.min(1, (v-lo)/(hi-lo))); }

function lumaFromPaints(paints) {
  if (!Array.isArray(paints)) return 0.5;
  let totalLuma = 0, count = 0;
  for (const p of paints) {
    if (!p || !p.color || p.visible === false) continue;
    const op = p.opacity ?? 1;
    totalLuma += (0.299 * p.color.r + 0.587 * p.color.g + 0.114 * p.color.b) * op;
    count++;
  }
  return count > 0 ? totalLuma / count : 0.5;
}

// Child signature features (8 dims): [comp_cnt, frame_cnt, inst_cnt, text_cnt, other, total_vis, diversity, pos_hash]
function childSig(children) {
  const f = new Array(8).fill(0);
  if (!children || !children.length) return f;
  
  const buckets = { COMPONENT: 0, FRAME: 0, INSTANCE: 0, TEXT: 0 };
  let other = 0;
  const seq = [];
  for (const c of children) {
    if (!c || c.visible === false) continue;
    const t = c.type || '';
    if (t in buckets) buckets[t]++; else other++;
    seq.push(t);
  }
  
  f[0] = norm(buckets.COMPONENT, 0, 10);
  f[1] = norm(buckets.FRAME, 0, 10);
  f[2] = norm(buckets.INSTANCE, 0, 10);
  f[3] = norm(buckets.TEXT, 0, 10);
  f[4] = norm(other, 0, 10);
  f[5] = norm(seq.length, 0, 20);
  f[6] = seq.length > 0 ? new Set(seq).size / Math.min(seq.length, 5) : 0;
  
  let h = 0;
  for (let i = 0; i < seq.length; i++) h = ((h << 5) - h + seq[i].length * (i+1)) | 0;
  f[7] = (Math.abs(h) % 10000) / 10000;
  return f;
}

// Subtree stats (8 dims): [min_luma, max_luma, luma_range, stroke_cnt, non_full_opac_cnt, max_depth, leaf_count, entropy]
function subtreeStats(node, depth=0) {
  const f = new Array(8).fill(0);
  const lumas = [];
  let strokes = 0, opaques = 0, maxD = 0, leaves = 0;
  
  function traverse(n, d) {
    maxD = Math.max(maxD, d);
    const hasCh = Array.isArray(n.children) && n.children.length > 0;
    if (!hasCh) leaves++;
    
    if (Array.isArray(n.fills)) {
      for (const p of n.fills) {
        if (!p || p.visible === false || !p.color) continue;
        const op = p.opacity ?? 1;
        lumas.push((0.299*p.color.r + 0.587*p.color.g + 0.114*p.color.b)*op);
      }
    }
    if (Array.isArray(n.strokes) && n.strokes.some(s => s && s.visible!==false)) strokes++;
    if (n.opacity !== undefined && typeof n.opacity === 'number' && n.opacity < 0.99) opaques++;
    
    if (Array.isArray(n.children)) {
      for (const c of n.children) if (c && c.visible !== false) traverse(c, d+1);
    }
  }
  traverse(node, depth);
  
  if (lumas.length) {
    const mn = Math.min(...lumas), mx = Math.max(...lumas);
    f[0] = mn; f[1] = mx; f[2] = mx - mn;
    const mean = lumas.reduce((a,b)=>a+b,0)/lumas.length;
    const var_ = lumas.reduce((s,v)=>s+(v-mean)**2,0)/lumas.length;
    f[7] = Math.sqrt(var_)/0.5;
  } else {
    f[0]=0.5; f[1]=0.5; f[2]=0;
  }
  f[3] = norm(strokes, 0, 10);
  f[4] = norm(opaques, 0, 10);
  f[5] = norm(maxD, 0, 15);
  f[6] = norm(leaves, 0, 50);
  return f;
}

// Hierarchy features
function hierarchy(node, d=0) {
  const visChildren = (node.children||[]).filter(c=>c&&c.visible!==false).length;
  return [
    norm(d, 0, 10),
    norm(visChildren, 0, 20),
    (node.children&&node.children.length)?visChildren/node.children.length:0
  ];
}

// Color / stroke from top-level fills/strokes (matching production code's areaScale)
function colorFeats(node) {
  const luma = lumaFromPaints(node.fills);
  const area = (node.width||0)*(node.height||0);
  const normArea = Math.min(1, area/(2000*2000));
  const areaScale = Math.sqrt(normArea);  // matches embedding.ts line 43
  const sl = lumaFromPaints(node.strokes);
  return [luma, luma*areaScale, sl, sl*areaScale];
}

function cos(a,b) {
  let dot=0,na=0,nb=0;
  for(let i=0;i<a.length;i++){dot+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}
  return dot/(Math.sqrt(na)*Math.sqrt(nb));
}

// Build vectors with new weights
const W_CHILD_SIG = 6.0;
const W_SUBTREE = 12.0;
W_HIERARCHY = 3.0;
W_COLOR_LUMA = 5.0;
W_STROKE_LUMA = 4.0;
W_GEOM_POS = 0.02;

function buildVec(snapshot) {
  const v = [];
  
  // geometry (pos weight very low)
  v.push(norm(snapshot.x||0,0,2000)*W_GEOM_POS, norm(snapshot.y||0,0,2000)*W_GEOM_POS,
         norm(snapshot.width||0,0,2000)*0.45, norm(snapshot.height||0,0,2000)*0.5);
  
  // hierarchy
  const hf = hierarchy(snapshot);
  hf.forEach(x => v.push(x*W_HIERARCHY));
  
  // color & stroke
  const cf = colorFeats(snapshot);
  v.push(cf[0]*W_COLOR_LUMA, cf[1]*3, cf[2]*W_STROKE_LUMA, cf[3]*3);
  
  // child signature (weight 4)
  const cs = childSig(snapshot.children);
  cs.forEach(x => v.push(x*W_CHILD_SIG));
  
  // subtree stats (weight 12) - THIS IS THE KEY: now sees depth=2+ nodes!
  const ss = subtreeStats(snapshot);
  ss.forEach(x => v.push(x*W_SUBTREE));
  
  // direct child style (weight 8) - captures wrapper fills, extra descendants like _cursor
  const dcs = directChildStyle(snapshot.children);
  dcs.forEach(x => v.push(x*8.0));
  
  return v;
}

// Classify each node
const groups = {};
for (const n of nodes) {
  // Parse name to get group info
  const name = n.name;
  const mode = name.includes('按钮模式=true') ? 'true' : 'false';
  const stateMatch = name.match(/状态=(\S+?)(?:,|$)/);
  const state = stateMatch ? stateMatch[1] : 'unknown';
  const key = `${mode}_${state}`;
  
  if (!groups[key]) groups[key] = [];
  const snap = buildSnapshot(n);
  groups[key].push({ id:n.id, name, vec:buildVec(snap), snap });
}

console.log('\n=== GROUPS ===');
for (const [k, items] of Object.entries(groups)) {
  console.log(`\n${k} (${items.length} nodes):`);
  for (const it of items) console.log(' ', it.name);
}

// Compute pairwise distances
console.log('\n=== PAIRWISE SIMILARITY MATRIX ===');
const groupKeys = Object.keys(groups);
const matrix = {};

for (const k1 of groupKeys) {
  matrix[k1] = {};
  for (const k2 of groupKeys) {
    const v1 = groups[k1][0].vec;
    const v2 = groups[k2][0].vec;
    matrix[k1][k2] = parseFloat(cos(v1,v2).toFixed(6));
  }
}

// Print header
let header = '                ';
for (const k of groupKeys) header += k.padEnd(18);
console.log(header);
for (const k1 of groupKeys) {
  let row = k1.padEnd(17) + ' ';
  for (const k2 of groupKeys) row += String(matrix[k1][k2]).padEnd(18);
  console.log(row);
}

// Focus on TRUE group internal separation
console.log('\n=== TRUE组内4态分离度 (关键指标) ===');
const trueStates = ['true_默认', 'true_禁用', 'true_悬停', 'true_聚焦'];

for (const s of trueStates) {
  const item = groups[s]?.[0];
  if (!item) continue;
  console.log(`\n${s} vec (len=${item.vec.length}):`);
  console.log('  ', item.vec.map(v=>v.toFixed(4)).join(' | '));
}

for (let i=0; i<trueStates.length; i++) {
  for (let j=i+1; j<trueStates.length; j++) {
    const a=groups[trueStates[i]][0], b=groups[trueStates[j]][0];
    const c=cos(a.vec,b.vec);
    const diff=c<0.99?'✓':'✗';
    console.log(` ${diff} ${trueStates[i]} vs ${trueStates[j]}: cos=${c.toFixed(6)}  dist=${(1-c).toFixed(4)}`);
  }
}

// Show key feature values for TRUE states
console.log('\n=== TRUE组各状态关键特征对比 ===');
for (const s of trueStates) {
  const item = groups[s]?.[0];
  if (!item) continue;
  const snap = item.snap;
  const cs = childSig(snap.children);
  const ss = subtreeStats(snap);
  const cf = colorFeats(snap);
  console.log(`\n--- ${s} ---`);
  console.log(`  TOP fill_luma=${cf[0].toFixed(4)}  wrapper_fills=${getWrapperFills(snap.children)}`);
  console.log(`  subtree luma_range=${ss[2].toFixed(4)}  strokes=${ss[3].toFixed(2)}  depth=${ss[5].toFixed(2)}  leaves=${ss[6].toFixed(0)}  entropy=${ss[7].toFixed(4)}`);
  console.log(`  child_sig: inst=${cs[2].toFixed(3)}  diversity=${cs[6].toFixed(3)}`);
  
  // Show TEXT luma at depth 2
  const textLumas = [];
  findTextLumas(snap.children, textLumas, 0);
  if (textLumas.length) console.log(`  depth2 TEXT lumas: ${textLumas.map(l=>l.toFixed(3)).join(', ')}`);
}

function getWrapperFills(children) {
  if (!children) return 0;
  const w = children.find(c => c.name === 'wrapper');
  if (!w) return -1;
  return Array.isArray(w.fills) ? w.fills.length : 0;
}

// Direct child style features (6 dims) - matches extractDirectChildStyleFeatures
function directChildStyle(children) {
  const f = new Array(6).fill(0);
  if (!children || !children.length) return f;
  
  let fillCnt=0, strokeCnt=0, extraDesc=0;
  const childLumas = [];
  
  for (const c of children) {
    if (!c || c.visible === false) continue;
    const fills = Array.isArray(c.fills) ? c.fills : null;
    if (fills && fills.length > 0 && fills.some(f => f)) { fillCnt++; }
    if (Array.isArray(c.strokes) && c.strokes.some(s => s)) { strokeCnt++; }
    
    // Collect luma from direct child
    if (fills) {
      for (const p of fills) {
        if (p && p.color) { childLumas.push(0.299*p.color.r + 0.587*p.color.g + 0.114*p.color.b); }
      }
    }
    
    // Count descendants (captures _cursor etc.)
    if (c.children) {
      for (const gc of c.children) { if (gc && gc.visible !== false) extraDesc++; 
        if (gc?.children) { for (const ggc of gc.children) { if (ggc && ggc.visible !== false) extraDesc++; }}
      }
    }
  }
  
  f[0] = fillCnt / 5;   // fill count normalized
  f[1] = strokeCnt / 5; // stroke count normalized
  if (childLumas.length) {
    f[2] = Math.min(...childLumas);
    f[3] = Math.max(...childLumas);
    f[4] = f[3] - f[2];
  } else { f[2]=0.5; f[3]=0.5; f[4]=0; }
  f[5] = extraDesc / 20;
  return f;
}

function findTextLumas(children, result, depth) {
  if (!children) return;
  for (const c of children) {
    if (c.type === 'TEXT' && Array.isArray(c.fills)) {
      result.push(lumaFromPaints(c.fills));
    }
    if (c.children) findTextLumas(c.children, result, depth+1);
  }
}
