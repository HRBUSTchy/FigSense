const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test/vector.json', 'utf8'));

const DIMENSION_KEYS = [
  'node_type:DOCUMENT',
  'node_type:PAGE',
  'node_type:FRAME',
  'node_type:GROUP',
  'node_type:COMPONENT',
  'node_type:INSTANCE',
  'node_type:BOOLEAN_OPERATION',
  'node_type:VECTOR',
  'node_type:STAR',
  'node_type:LINE',
  'node_type:ELLIPSE',
  'node_type:POLYGON',
  'node_type:RECTANGLE',
  'node_type:TEXT',
  'node_type:SLICE',
  'node_type:COMPONENT_SET',
  'node_type:SECTION',
  'geometry:x',
  'geometry:y',
  'geometry:width',
  'geometry:height',
  'geometry:aspect_ratio',
  'layout_mode:NONE',
  'layout_mode:HORIZONTAL',
  'layout_mode:VERTICAL',
  'layout_mode:GRID',
  'layout_align:MIN',
  'layout_align:CENTER',
  'layout_align:MAX',
  'layout_align:SPACE_BETWEEN',
  'layout:item_spacing',
  'layout:child_horizontal_bias',
  'layout:child_horizontal_flag',
  'layout:child_vertical_flag',
  'color:has_visible_paint',
  'color:solid_count',
  'color:gradient_count',
  'color:image_count',
  'color:primary_luma',
  'color:primary_luma_area',
  'stroke:has_visible_paint',
  'stroke:solid_count',
  'stroke:gradient_count',
  'stroke:image_count',
  'stroke:primary_luma',
  'stroke:primary_luma_area',
  'stroke_weight',
  'corner_radius',
  'opacity',
  'visible',
  'locked',
  'text:length',
  'text:has_newline',
  'text:has_uppercase',
  'text:has_digit',
  'text:has_cjk',
  'text:word_count',
  'text:unicode_avg',
  'text:unicode_weighted_sum',
  'text:unicode_min',
  'text:unicode_max',
  'name:length',
  'name:starts_with_uppercase',
  'name:has_separator',
  'name:hash',
  'hierarchy:depth',
  'hierarchy:child_count',
  'hierarchy:visible_child_ratio',
  'child_sig:component_count',
  'child_sig:frame_count',
  'child_sig:instance_count',
  'child_sig:text_count',
  'child_sig:other_count',
  'child_sig:total_visible',
  'child_sig:type_diversity',
  'child_sig:positional_hash',
  'subtree:min_fill_luma',
  'subtree:max_fill_luma',
  'subtree:luma_range',
  'subtree:stroke_node_count',
  'subtree:non_full_opacity_count',
  'subtree:max_depth',
  'subtree:leaf_count',
  'subtree:visual_entropy',
  'rotation',
  'blend_mode',
  'effects:shadow_count',
  'effects:blur_count',
];

const nodeIds = Object.keys(data.vectors);
console.log(`总节点数: ${nodeIds.length}\n`);

const cluster1 = [
  '117333:202721', '117333:213163', '117333:217803', '117333:227083',
  '117333:202729', '117333:213327', '117333:217967', '117333:227247',
  '117333:204285', '117333:213336', '117333:217976', '117333:227256',
  '117333:202737', '117333:213491', '117333:218131', '117333:227411',
  '117333:202745', '117333:213661', '117333:218301', '117333:227581'
];

const cluster2 = [
  '117333:204203', '117333:213172', '117333:217812', '117333:227092',
  '117333:204367', '117333:213500', '117333:218140', '117333:227420',
  '117333:204452', '117333:213670', '117333:218310', '117333:227590'
];

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getVariance(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

console.log('=== 分析所有维度的方差 ===\n');

const dimensionVariances = DIMENSION_KEYS.map((key, idx) => {
  const values = nodeIds.map(id => data.vectors[id][idx]);
  const variance = getVariance(values);
  return { key, idx, variance, mean: values.reduce((a, b) => a + b, 0) / values.length };
});

dimensionVariances.sort((a, b) => b.variance - a.variance);

console.log('方差最大的前20个维度:');
dimensionVariances.slice(0, 20).forEach(d => {
  console.log(`  ${d.key} (idx ${d.idx}): variance=${d.variance.toFixed(6)}, mean=${d.mean.toFixed(6)}`);
});

console.log('\n=== 分析 cluster1 内部差异 ===\n');
const cluster1Vecs = cluster1.map(id => data.vectors[id]);
const cluster1Variances = DIMENSION_KEYS.map((key, idx) => {
  const values = cluster1Vecs.map(v => v[idx]);
  return { key, idx, variance: getVariance(values) };
});
cluster1Variances.sort((a, b) => b.variance - a.variance);

console.log('cluster1 内部方差最大的维度:');
cluster1Variances.slice(0, 15).forEach(d => {
  console.log(`  ${d.key} (idx ${d.idx}): variance=${d.variance.toFixed(8)}`);
});

console.log('\n=== cluster1 vs cluster2 差异分析 ===\n');

const cluster1Mean = cluster1Vecs[0].map((_, i) => 
  cluster1Vecs.reduce((sum, v) => sum + v[i], 0) / cluster1Vecs.length
);
const cluster2Vecs = cluster2.map(id => data.vectors[id]);
const cluster2Mean = cluster2Vecs[0].map((_, i) => 
  cluster2Vecs.reduce((sum, v) => sum + v[i], 0) / cluster2Vecs.length
);

const clusterDiffs = DIMENSION_KEYS.map((key, idx) => ({
  key,
  idx,
  diff: Math.abs(cluster1Mean[idx] - cluster2Mean[idx]),
  c1: cluster1Mean[idx],
  c2: cluster2Mean[idx]
}));

clusterDiffs.sort((a, b) => b.diff - a.diff);

console.log('cluster1 vs cluster2 差异最大的维度:');
clusterDiffs.slice(0, 15).forEach(d => {
  console.log(`  ${d.key}: c1=${d.c1.toFixed(6)}, c2=${d.c2.toFixed(6)}, diff=${d.diff.toFixed(6)}`);
});

console.log('\n=== 尝试按名称特征分组 ===\n');

const nameHashIdx = DIMENSION_KEYS.indexOf('name:hash');
const nameLenIdx = DIMENSION_KEYS.indexOf('name:length');

const groups = {};
nodeIds.forEach(id => {
  const hash = data.vectors[id][nameHashIdx].toFixed(6);
  if (!groups[hash]) groups[hash] = [];
  groups[hash].push(id);
});

console.log(`按 name:hash 分组 (${Object.keys(groups).length} 组):`);
Object.entries(groups).forEach(([hash, ids]) => {
  console.log(`  hash=${hash}: ${ids.length} nodes`);
});

console.log('\n=== 检查 geometry:x 和 geometry:y ===\n');

const xIdx = DIMENSION_KEYS.indexOf('geometry:x');
const yIdx = DIMENSION_KEYS.indexOf('geometry:y');

const positions = nodeIds.map(id => ({
  id,
  x: data.vectors[id][xIdx],
  y: data.vectors[id][yIdx]
}));

const uniqueX = [...new Set(positions.map(p => p.x.toFixed(6)))];
const uniqueY = [...new Set(positions.map(p => p.y.toFixed(6)))];

console.log(`唯一 x 值: ${uniqueX.length} 个`);
console.log(`唯一 y 值: ${uniqueY.length} 个`);

positions.sort((a, b) => a.y - b.y || a.x - b.x);
console.log('\n节点位置分布:');
positions.forEach(p => {
  console.log(`  ${p.id}: x=${p.x.toFixed(6)}, y=${p.y.toFixed(6)}`);
});

console.log('\n=== 计算所有节点两两相似度分布 ===\n');

const allSims = [];
for (let i = 0; i < nodeIds.length; i++) {
  for (let j = i + 1; j < nodeIds.length; j++) {
    allSims.push(cosineSimilarity(data.vectors[nodeIds[i]], data.vectors[nodeIds[j]]));
  }
}

allSims.sort((a, b) => a - b);

console.log(`相似度统计:`);
console.log(`  最小: ${allSims[0].toFixed(6)}`);
console.log(`  最大: ${allSims[allSims.length - 1].toFixed(6)}`);
console.log(`  平均: ${(allSims.reduce((a, b) => a + b, 0) / allSims.length).toFixed(6)}`);
console.log(`  中位数: ${allSims[Math.floor(allSims.length / 2)].toFixed(6)}`);

console.log('\n相似度分布:');
const bins = [0.95, 0.96, 0.97, 0.98, 0.99, 0.995, 1.0];
bins.forEach((threshold, i) => {
  const prev = i === 0 ? 0 : bins[i - 1];
  const count = allSims.filter(s => s >= prev && s < threshold).length;
  console.log(`  [${prev.toFixed(3)}, ${threshold.toFixed(3)}): ${count} pairs`);
});
const count1 = allSims.filter(s => s === 1.0).length;
console.log(`  [1.0, 1.0]: ${count1} pairs (identical)`);
