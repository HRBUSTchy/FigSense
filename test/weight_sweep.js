const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test/vector.json', 'utf8'));

const DIMENSION_KEYS = [
  'node_type:DOCUMENT', 'node_type:PAGE', 'node_type:FRAME', 'node_type:GROUP',
  'node_type:COMPONENT', 'node_type:INSTANCE', 'node_type:BOOLEAN_OPERATION',
  'node_type:VECTOR', 'node_type:STAR', 'node_type:LINE', 'node_type:ELLIPSE',
  'node_type:POLYGON', 'node_type:RECTANGLE', 'node_type:TEXT', 'node_type:SLICE',
  'node_type:COMPONENT_SET', 'node_type:SECTION',
  'geometry:x', 'geometry:y', 'geometry:width', 'geometry:height', 'geometry:aspect_ratio',
  'layout_mode:NONE', 'layout_mode:HORIZONTAL', 'layout_mode:VERTICAL', 'layout_mode:GRID',
  'layout_align:MIN', 'layout_align:CENTER', 'layout_align:MAX', 'layout_align:SPACE_BETWEEN',
  'layout:item_spacing', 'layout:child_horizontal_bias', 'layout:child_horizontal_flag', 'layout:child_vertical_flag',
  'color:has_visible_paint', 'color:solid_count', 'color:gradient_count', 'color:image_count',
  'color:primary_luma', 'color:primary_luma_area',
  'stroke:has_visible_paint', 'stroke:solid_count', 'stroke:gradient_count', 'stroke:image_count',
  'stroke:primary_luma', 'stroke:primary_luma_area',
  'stroke_weight', 'corner_radius', 'opacity', 'visible', 'locked',
  'text:length', 'text:has_newline', 'text:has_uppercase', 'text:has_digit', 'text:has_cjk',
  'text:word_count', 'text:unicode_avg', 'text:unicode_weighted_sum', 'text:unicode_min', 'text:unicode_max',
  'name:length', 'name:starts_with_uppercase', 'name:has_separator', 'name:hash',
  'hierarchy:depth', 'hierarchy:child_count', 'hierarchy:visible_child_ratio',
  'rotation', 'blend_mode', 'effects:shadow_count', 'effects:blur_count',
];

// 从 dimension-weights.ts 提取的当前权重
function getCurrentWeights() {
  const baseWeights = {};
  DIMENSION_KEYS.forEach(k => baseWeights[k] = 1);
  
  // Layout dims
  const layoutKeys = DIMENSION_KEYS.filter(k => k.startsWith('layout_') || k.startsWith('layout:'));
  layoutKeys.forEach(k => { baseWeights[k] = 1.5; });
  baseWeights['layout_mode:NONE'] = 0.9;
  baseWeights['layout_mode:HORIZONTAL'] = 2.0;
  baseWeights['layout_mode:VERTICAL'] = 1.05;
  baseWeights['layout_mode:GRID'] = 0.9;
  baseWeights['layout_align:MIN'] = 0.95;
  baseWeights['layout_align:CENTER'] = 1.05;
  baseWeights['layout_align:MAX'] = 1.05;
  baseWeights['layout_align:SPACE_BETWEEN'] = 2.0;
  baseWeights['layout:item_spacing'] = 1.2;
  baseWeights['layout:child_horizontal_bias'] = 0.65;
  baseWeights['layout:child_horizontal_flag'] = 0.65;
  baseWeights['layout:child_vertical_flag'] = 0.45;

  // Node type
  baseWeights['node_type:COMPONENT'] = 0.6;
  baseWeights['node_type:INSTANCE'] = 0.6;

  // Geometry
  baseWeights['geometry:x'] = 0.1;
  baseWeights['geometry:y'] = 0.1;
  baseWeights['geometry:width'] = 0.45;
  baseWeights['geometry:height'] = 0.5;
  baseWeights['geometry:aspect_ratio'] = 0.25;

  // Hierarchy
  baseWeights['hierarchy:child_count'] = 0.8;
  baseWeights['hierarchy:visible_child_ratio'] = 0.55;

  // Style dims (color + stroke + effects + stroke_weight + corner_radius)
  const styleKeys = DIMENSION_KEYS.filter(k => 
    k.startsWith('color:') || k.startsWith('stroke:') ||
    k === 'stroke_weight' || k === 'corner_radius' ||
    k.startsWith('effects:')
  );
  styleKeys.forEach(k => { baseWeights[k] = 1.2; });

  baseWeights['color:primary_luma'] = 3.0;
  baseWeights['color:primary_luma_area'] = 2.5;
  baseWeights['stroke:primary_luma'] = 2.5;
  baseWeights['stroke:primary_luma_area'] = 2.0;
  baseWeights['opacity'] = 0.5;
  baseWeights['visible'] = 0.07;

  baseWeights['effects:shadow_count'] = 2.0;
  baseWeights['effects:blur_count'] = 2.0;

  return baseWeights;
}

const group1 = ['123397:109755','123397:111206','123397:112078','123397:110334'];
const group2 = ['123397:109762','123397:111221','123397:112093','123397:110349'];
const group3 = ['123397:109769','123397:111236','123397:112108','123397:110364'];
const group4 = ['123397:109776','123397:111252','123397:112124','123397:110380'];

const groups = [group1, group2, group3, group4];
const groupNames = ['默认状态', '禁用状态', '悬停状态', '聚焦状态'];

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 获取原始特征值（除以权重）
function getRawFeature(id, dimIdx) {
  const vec = data.vectors[id];
  return vec[dimIdx]; // 已经是加权后的值，需要反推原始值
}

// 用新权重重新计算向量并计算相似度
function computeWithNewWeights(weightOverrides) {
  const weights = getCurrentWeights();
  Object.assign(weights, weightOverrides);
  
  const weightArr = DIMENSION_KEYS.map(k => weights[k]);
  
  const reweighted = {};
  for (const id of Object.keys(data.vectors)) {
    const vec = data.vectors[id];
    // 反推原始值: raw = weighted / weight
    const raw = vec.map((v, i) => v / weightArr[i]);
    // 重新加权
    reweighted[id] = raw.map((v, i) => v * (weightOverrides[DIMENSION_KEYS[i]] ?? weightArr[i]));
  }
  
  return reweighted;
}

function evaluate(weightOverrides) {
  const vecs = computeWithNewWeights(weightOverrides);
  
  const groupMeans = groups.map(g => {
    const gv = g.map(id => vecs[id]);
    return gv[0].map((_, i) => gv.reduce((s, v) => s + v[i], 0) / gv.length);
  });
  
  let totalBetween = 0, betweenCount = 0;
  let minBetween = 1;
  for (let i = 0; i < 4; i++) {
    for (let j = i+1; j < 4; j++) {
      const sim = cosineSimilarity(groupMeans[i], groupMeans[j]);
      totalBetween += sim;
      betweenCount++;
      minBetween = Math.min(minBetween, sim);
    }
  }
  
  const avgBetween = totalBetween / betweenCount;
  
  // 组内平均
  let totalWithin = 0, withinCount = 0;
  groups.forEach(g => {
    const gv = g.map(id => vecs[id]);
    for (let i = 0; i < gv.length; i++) {
      for (let j = i+1; j < gv.length; j++) {
        totalWithin += cosineSimilarity(gv[i], gv[j]);
        withinCount++;
      }
    }
  });
  const avgWithin = totalWithin / withinCount;
  
  return { avgBetween, minBetween, avgWithin, separation: avgWithin - avgBetween };
}

console.log('=== 当前权重基线 ===');
const baseline = evaluate({});
console.log(`组间平均: ${baseline.avgBetween.toFixed(6)}, 组间最小: ${baseline.minBetween.toFixed(6)}, 组内: ${baseline.avgWithin.toFixed(6)}, 分离度: ${(baseline.separation).toFixed(6)}`);

console.log('\n=== 各维度组间方差分析（找差异维度） ===\n');

// 分析每个维度在四组之间的变异程度
for (let d = 0; d < DIMENSION_KEYS.length; d++) {
  const groupMeans_d = groups.map(g => {
    const vals = g.map(id => data.vectors[id][d]);
    return vals.reduce((a,b)=>a+b,0)/vals.length;
  });
  const overallMean = groupMeans_d.reduce((a,b)=>a+b,0)/4;
  const variance = groupMeans_d.reduce((s,m) => s + (m-overallMean)**2, 0)/4;
  const range = Math.max(...groupMeans_d) - Math.min(...groupMeans_d);
  const meanAbs = Math.max(1e-10, Math.abs(overallMean));
  const cv = range / meanAbs; // 变异系数
  
  if (cv > 0.02 || variance > 1e-8) { // 只显示有显著差异的
    console.log(`${DIMENSION_KEYS[d]} (idx ${d}): 均值=[${groupMeans_d.map(v=>v.toFixed(5)).join(', ')}], 方差=${variance.toExponential(2)}, 范围=${range.toFixed(5)}, CV=${cv.toFixed(4)}`);
  }
}

console.log('\n\n=== 权重扫描测试 ===\n');

// 测试不同的 luma 权重组合
const testCases = [
  { name: '基线', overrides: {} },
  { name: 'luma=5', overrides: { 'color:primary_luma': 5.0 } },
  { name: 'luma=8', overrides: { 'color:primary_luma': 8.0 } },
  { name: 'luma=12', overrides: { 'color:primary_luma': 12.0 } },
  { name: 'luma=15', overrides: { 'color:primary_luma': 15.0 } },
  { name: 'luma=20', overrides: { 'color:primary_luma': 20.0 } },
  { name: 'luma=30', overrides: { 'color:primary_luma': 30.0 } },
  { name: 'luma=8,lArea=5,sLuma=8', overrides: { 'color:primary_luma': 8.0, 'color:primary_luma_area': 5.0, 'stroke:primary_luma': 8.0, 'stroke:primary_luma_area': 5.0 } },
  { name: 'luma=12,lArea=8,sLuma=12', overrides: { 'color:primary_luma': 12.0, 'color:primary_luma_area': 8.0, 'stroke:primary_luma': 12.0, 'stroke:primary_luma_area': 8.0 } },
  { name: 'luma=15,lArea=10,sLuma=15', overrides: { 'color:primary_luma': 15.0, 'color:primary_luma_area': 10.0, 'stroke:primary_luma': 15.0, 'stroke:primary_luma_area': 10.0 } },
  { name: 'luma=20,lArea=15,sLuma=20', overrides: { 'color:primary_luma': 20.0, 'color:primary_luma_area': 15.0, 'stroke:primary_luma': 20.0, 'stroke:primary_luma_area': 15.0 } },
  { name: 'all_color=10', overrides: { 'color:primary_luma': 10.0, 'color:primary_luma_area': 10.0, 'stroke:primary_luma': 10.0, 'stroke:primary_luma_area': 10.0, 'color:solid_count': 5.0, 'color:gradient_count': 5.0, 'color:image_count': 5.0, 'color:has_visible_paint': 5.0, 'stroke:solid_count': 5.0, 'stroke:gradient_count': 5.0, 'stroke:image_count': 5.0, 'stroke:has_visible_paint': 5.0 } },
];

testCases.forEach(tc => {
  const r = evaluate(tc.overrides);
  console.log(`${tc.name.padEnd(35)} → 组间:${r.avgBetween.toFixed(6)} 最小:${r.minBetween.toFixed(6)} 组内:${r.avgWithin.toFixed(6)} 分离度:${r.separation.toFixed(6)}${r.separation > baseline.separation ? ' ✅' : ''}`);
});

// 详细展示最佳方案的组间两两对比
console.log('\n=== 最佳方案详细组间对比 ===\n');
const bestOverride = testCases.sort((a,b) => evaluate(b.overrides).separation - evaluate(a.overrides).separation)[0].overrides;
const vecsBest = computeWithNewWeights(bestOverride);
const gmBest = groups.map(g => {
  const gv = g.map(id => vecsBest[id]);
  return gv[0].map((_,i) => gv.reduce((s,v)=>s+v[i],0)/gv.length);
});

for (let i = 0; i < 4; i++) {
  for (let j = i+1; j < 4; j++) {
    console.log(`${groupNames[i]} vs ${groupNames[j]}: ${cosineSimilarity(gmBest[i], gmBest[j]).toFixed(6)}`);
  }
}
