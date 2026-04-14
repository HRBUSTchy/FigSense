// 验证改进效果：用新的权重和特征计算8组分离度
const fs = require('fs');
const path = require('path');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema.json'), 'utf8'));

function rgbToLuma(c) { return c ? (0.299*c.r + 0.587*c.g + 0.114*c.b) : 0.5; }
function norm(v, lo, hi) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))); }
function cos(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na)*Math.sqrt(nb));
}

// 收集组件
function collectComponents(node, d=0) {
  let r = [];
  if (node.type === 'COMPONENT' && d > 0) r.push(node);
  if (node.children) node.children.forEach(c => r = r.concat(collectComponents(c, d+1)));
  return r;
}
const components = collectComponents(schema.node);

function parseName(name) {
  return {
    btnMode: (name.match(/按钮模式=(true|false)/) || [])[1] || 'unknown',
    state: (name.match(/状态=(默认|禁用|悬停|聚焦)/) || [])[1] || 'unknown',
    size: (name.match(/尺寸=(小|中|大)/) || [])[1] || 'unknown',
  };
}

const groups = {};
components.forEach(c => {
  const p = parseName(c.name);
  const key = `${p.btnMode}_${p.state}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(c);
});

// ==========================================
// 新的特征提取（与修改后的features.ts对齐）
// ==========================================

function extractColorFeatures(paints, areaScale=1) {
  const f = [0,0,0,0,0,0];
  if (!Array.isArray(paints)) return f;
  const vis = paints.filter(p => p.visible !== false);
  f[0] = vis.length > 0 ? 1 : 0;
  const solidCount = vis.filter(p => p.type === 'SOLID').length;
  f[1] = norm(solidCount, 0, 5);
  if (solidCount > 0 && vis[0].type === 'SOLID') {
    const c = vis[0].color;
    const op = vis[0].opacity ?? 1;
    f[4] = (0.299*c.r + 0.587*c.g + 0.114*c.b) * op;
    const packed = (Math.round(Math.max(0,Math.min(1,c.r))*255)*256*256 +
                    Math.round(Math.max(0,Math.min(1,c.g))*255)*256 +
                    Math.round(Math.max(0,Math.min(1,c.b))*255)) / 0xffffff;
    f[5] = packed * op * areaScale;
  }
  return f;
}

function extractChildSignature(node) {
  const f = new Array(8).fill(0);
  if (!node.children) return f;
  const buckets = { COMPONENT:0, FRAME:0, INSTANCE:0, TEXT:0 };
  let other = 0;
  const seq = [];
  for (const ch of node.children) {
    if (!ch || ch.visible === false) continue;
    const t = ch.type;
    if (t in buckets) buckets[t]++;
    else other++;
    seq.push(t);
  }
  const total = seq.length;
  f[0] = norm(buckets.COMPONENT, 0, 10);
  f[1] = norm(buckets.FRAME, 0, 10);
  f[2] = norm(buckets.INSTANCE, 0, 10);
  f[3] = norm(buckets.TEXT, 0, 10);
  f[4] = norm(other, 0, 10);
  f[5] = norm(total, 0, 20);
  f[6] = total > 0 ? new Set(seq).size / Math.min(total, 5) : 0;
  if (seq.length > 0) {
    let h = 0;
    for (let i = 0; i < seq.length; i++) h = ((h<<5)-h+seq[i].length*(i+1))|0;
    f[7] = norm(Math.abs(h), 0, 100000);
  }
  return f;
}

function extractSubtreeStats(node, depth=0) {
  const f = new Array(8).fill(0);
  const lumas = [];
  let strokeCnt = 0, opacityCnt = 0, maxDepth = 0, leafCnt = 0;

  function traverse(n, d) {
    maxDepth = Math.max(maxDepth, d);
    const hasKids = n.children && n.children.length > 0;
    if (!hasKids) leafCnt++;

    // fills
    if (Array.isArray(n.fills)) {
      for (const p of n.fills) {
        if (!p || p.visible !== false && p.type === 'SOLID' && p.color) {
          lumas.push((0.299*p.color.r + 0.587*p.color.g + 0.114*p.color.b)*(p.opacity??1));
        }
      }
    }
    // strokes
    if (Array.isArray(n.strokes)) {
      if (n.strokes.some(s => s && s.visible !== false && s.type === 'SOLID')) strokeCnt++;
    }
    if (typeof n.opacity === 'number' && n.opacity < 0.99) opacityCnt++;

    if (n.children) n.children.forEach(ch => { if (ch && ch.visible !== false) traverse(ch, d+1); });
  }

  traverse(node, depth);
  if (lumas.length > 0) {
    const minL = Math.min(...lumas), maxL = Math.max(...lumas);
    f[0] = minL; f[1] = maxL; f[2] = maxL - minL;
    const mean = lumas.reduce((a,b)=>a+b,0)/lumas.length;
    const var_ = lumas.reduce((s,v)=>s+(v-mean)**2,0)/lumas.length;
    f[7] = Math.sqrt(var_) / 0.5;
  } else { f[0]=0.5; f[1]=0.5; f[2]=0; }
  f[3] = norm(strokeCnt, 0, 10); f[4] = norm(opacityCnt, 0, 10);
  f[5] = norm(maxDepth, 0, 15); f[6] = norm(leafCnt, 0, 50);
  return f;
}

const NODE_TYPES = ['COMPONENT','FRAME','INSTANCE','TEXT','VECTOR','GROUP','RECTANGLE','ELLIPSE','LINE','REGULAR_POLYGON','STAR','OTHER'];
function oneHot(val, cats) { const v = cats.map(()=>0); const idx=cats.indexOf(val); if(idx>=0) v[idx]=1; return v; }

// 新权重配置（与修改后dimension-weights.ts一致）
const NEW_WEIGHTS = {};

// 维度构建顺序（与EMBEDDING_DIMENSION_KEYS完全对齐）
function buildVector(node) {
  const area = Math.max(0, node.width*node.height);
  const ar = node.height>0 ? node.width/node.height : 0;
  const areaScale = Math.sqrt(Math.min(1, norm(area, 0, 2000*2000)));

  const v = [];

  // node_type one-hot: 12 dims (weight: default=1)
  v.push(...oneHot(node.type, NODE_TYPES));

  // geometry: 5 dims
  v.push(norm(node.x||0,0,2000), norm(node.y||0,0,2000), 
         norm(node.width||0,0,2000), norm(node.height||0,0,2000),
         norm(ar, 0, 10));

  // layout: 12 dims
  v.push(...new Array(12).fill(0));

  // color fills: 6 dims
  v.push(...extractColorFeatures(node.fills, areaScale));

  // color strokes: 6 dims  
  v.push(...extractColorFeatures(node.strokes, areaScale));

  // stroke_weight: 1 dim
  v.push(norm(node.strokeWeight||0, 0, 20));

  // corner_radius: 1 dim
  let cr = 0;
  if (typeof node.cornerRadius === 'number') cr = node.cornerRadius;
  else if (node.topLeftRadius) cr = (node.topLeftRadius+node.topRightRadius+node.bottomLeftRadius+node.bottomRightRadius)/4;
  v.push(norm(cr, 0, 100));

  // opacity, visible, locked: 3 dims
  v.push(node.opacity ?? 1, node.visible ? 1 : 0, 0);

  // text: 10 dims
  v.push(...new Array(10).fill(0));

  // name: 4 dims
  v.push(...new Array(4).fill(0));

  // hierarchy: 3 dims
  v.push(norm(0,0,10), norm((node.children||[]).length,0,50),
         (node.children||[]).length>0 ? (node.children||[]).filter(c=>c.visible).length/(node.children||[]).length : 0);

  // NEW: child_signature: 8 dims
  v.push(...extractChildSignature(node));

  // NEW: subtree_stats: 8 dims
  v.push(...extractSubtreeStats(node, 0));

  // rotation, blend_mode, effects: 4 dims
  v.push(0, 0, 0, 0);

  return v;
}

// 应用新权重
function applyWeights(vec) {
  // 新权重配置
  const weights = [
    // node_type (12): default 1
    0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6,
    // geometry (5): x,y降权
    0.02, 0.02, 0.45, 0.5, 0.25,
    // layout (12): 1.5 base
    0.9, 2.0, 1.05, 0.9, 0.95, 1.05, 1.05, 2.0, 1.2, 0.65, 0.65, 0.45,
    // color fills (6): style base 1.2, luma 5.0
    1.2, 1.2, 1.2, 1.2, 5.0, 3.0,
    // color strokes (6): style base 1.2, luma 4.0
    1.2, 1.2, 1.2, 1.2, 4.0, 3.0,
    // stroke_weight (1): 1.2
    1.2,
    // corner_radius (1): 1.2
    1.2,
    // opacity, visible, locked (3)
    0.5, 0.07, 1,
    // text (10): default 1
    1,1,1,1,1,1,1,1,1,1,
    // name (4): default 1
    1,1,1,1,
    // hierarchy (3): child_count=3.0, ratio=2.0
    1, 3.0, 2.0,
    // child_signature (8): 4.0
    4, 4, 4, 4, 4, 4, 4, 4,
    // subtree_stats (8): 3.0
    3, 3, 3, 3, 3, 3, 3, 3,
    // rotation, blend, effects (4)
    1, 1, 2, 2,
  ];

  return vec.map((v, i) => v * (weights[i] ?? 1));
}

// Weighted merge with max-pooling for style dims
function weightedMerge(parentVec, childVecs, decayRate=0.5) {
  const result = [...parentVec];
  const weight = Math.max(0.45, Math.pow(decayRate, childVecs.length));
  
  // Style/subtree dimension indices (0-based in final vector)
  const STYLE_INDICES = new Set();
  // color fills start at 17 (12+5), end at 22 -> indices 17-22
  for(let i=17;i<=22;i++) STYLE_INDICES.add(i);
  // color strokes: 23-28
  for(let i=23;i<=28;i++) STYLE_INDICES.add(i);
  // stroke_weight: 29
  STYLE_INDICES.add(29);
  // corner_radius: 30
  STYLE_INDICES.add(30);
  // opacity: 31
  STYLE_INDICES.add(31);
  // child_sig: starts after text(10)+name(4)+hier(3)=46+12+5+12=... 
  // Let me recalculate:
  // nt(12) + geo(5) + lay(12) + cf(6) + cs(6) + sw(1) + cr(1) + op/vis/lock(3) + tx(10) + nm(4) + hier(3) = 63
  // child_sig: 63-70
  for(let i=63;i<=70;i++) STYLE_INDICES.add(i);
  // subtree_stats: 71-78
  for(let i=71;i<=78;i++) STYLE_INDICES.add(i);

  for (let i = 0; i < result.length; i++) {
    const parentW = Math.max(weight, STYLE_INDICES.has(i) ? 0.1 : 0.35);
    
    let childAgg;
    if (STYLE_INDICES.has(i)) {
      // Max-pooling for style dimensions
      childAgg = Math.max(...childVecs.map(v => v[i]));
    } else {
      childAgg = childVecs.reduce((s,v) => s+v[i], 0) / childVecs.length;
    }
    
    result[i] = parentVec[i] * parentW + childAgg * (1-parentW);
  }
  return result;
}

// ==========================================
// 构建所有组的向量
// ==========================================
console.log('='.repeat(80));
console.log('改进效果验证：新旧方案对比');
console.log('='.repeat(80));

const allKeys = Object.keys(groups).sort();
const groupReps = {};

allKeys.forEach(k => {
  const rep = groups[k][0];
  const rawVec = buildVector(rep);
  const weightedVec = applyWeights(rawVec);
  const childVecs = (rep.children || []).map(ch => applyWeights(buildVector(ch)));
  const mergedVec = weightedMerge(weightedVec, childVecs, 0.5);
  groupReps[k] = mergedVec;
});

// 计算组间相似度
console.log('\n=== 改进后的组间相似度矩阵 ===\n');
let minS=1, maxS=0, totalS=0, count=0;
const pairs = [];

for (let i = 0; i < allKeys.length; i++) {
  for (let j = i+1; j < allKeys.length; j++) {
    const s = cos(groupReps[allKeys[i]], groupReps[allKeys[j]]);
    pairs.push({ pair: `${allKeys[i]} vs ${allKeys[j]}`, sim: s });
    minS = Math.min(minS, s);
    maxS = Math.max(maxS, s);
    totalS += s;
    count++;
  }
}

pairs.sort((a,b) => a.sim - b.sim);

console.log(`  总维度数: ${groupReps[allKeys[0]].length}`);
console.log(`  组间cos范围: [${minS.toFixed(6)}, ${maxS.toFixed(6)}]`);
console.log(`  平均组间cos: ${(totalS/count).toFixed(6)}`);
console.log(`  分离度(max-min): ${(maxS-minS).toFixed(6)}`);
console.log(`\n  最相似的10对:`);
pairs.slice(0,10).forEach(p => console.log(`    ${p.pair}: ${p.sim.toFixed(6)}`));
console.log(`\n  最疏远的10对:`);
pairs.slice(-10).reverse().forEach(p => console.log(`    ${p.pair}: ${p.sim.toFixed(6)}`));

// 同按钮模式内的分离度
console.log('\n\n=== 按钮模式内部分离度 ===');
['false', 'true'].forEach(mode => {
  const modeKeys = allKeys.filter(k => k.startsWith(mode+'_'));
  let modeMin=1, modeMax=0;
  for (let i=0;i<modeKeys.length;i++)
    for (let j=i+1;j<modeKeys.length;j++) {
      const s = cos(groupReps[modeKeys[i]], groupReps[modeKeys[j]]);
      modeMin = Math.min(modeMin,s); modeMax=Math.max(modeMax,s);
    }
  console.log(`  ${mode}模式内: 范围=[${modeMin.toFixed(6)}, ${modeMax.toFixed(6)}] 分离度=${(modeMax-modeMin).toFixed(6)}`);
});

// 跨按钮模式的分离度
console.log('\n=== 跨按钮模式分离度 (对应状态对比) ===');
['默认','禁用','悬停','聚焦'].forEach(state => {
  const fk = `false_${state}`, tk = `true_${state}`;
  if (groupReps[fk] && groupReps[tk]) {
    const s = cos(groupReps[fk], groupReps[tk]);
    console.log(`  ${state}: false vs true → cos=${s.toFixed(6)}`);
  }
});

// 关键新特征的值展示
console.log('\n\n=== 新增特征的关键区分力验证 ===\n');
allKeys.forEach(k => {
  const rep = groups[k][0];
  const sig = extractChildSignature(rep);
  const stats = extractSubtreeStats(rep, 0);
  console.log(`  [${k.padEnd(14)}] child_sig: FRAME=${sig[1].toFixed(1)} INSTANCE=${sig[2].toFixed(1)} totalVis=${sig[5].toFixed(1)} diversity=${sig[6].toFixed(2)} | subtree: lumaRange=${stats[2].toFixed(3)} strokes=${stats[3].toFixed(1)} depth=${stats[5].toFixed(1)}`);
});
