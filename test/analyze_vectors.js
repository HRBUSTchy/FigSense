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
  'rotation',
  'blend_mode',
  'effects:shadow_count',
  'effects:blur_count',
];

const group1 = [
  '123397:109755',
  '123397:111206',
  '123397:112078',
  '123397:110334',
];
const group2 = [
  '123397:109762',
  '123397:111221',
  '123397:112093',
  '123397:110349',
];
const group3 = [
  '123397:109769',
  '123397:111236',
  '123397:112108',
  '123397:110364',
];
const group4 = [
  '123397:109776',
  '123397:111252',
  '123397:112124',
  '123397:110380',
];

const groups = [group1, group2, group3, group4];
const groupNames = ['默认状态', '禁用状态', '悬停状态', '聚焦状态'];

function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const groupMeans = groups.map((g) => {
  const vecs = g.map((id) => data.vectors[id]);
  return vecs[0].map(
    (_, i) => vecs.reduce((sum, v) => sum + v[i], 0) / vecs.length
  );
});

console.log('=== 新权重下的组间相似度（实际数据） ===\n');
for (let i = 0; i < 4; i++) {
  for (let j = i + 1; j < 4; j++) {
    const sim = cosineSimilarity(groupMeans[i], groupMeans[j]);
    console.log(`${groupNames[i]} vs ${groupNames[j]}: ${sim.toFixed(6)}`);
  }
}

console.log('\n=== 组内相似度 ===\n');
groups.forEach((g, gi) => {
  const vecs = g.map((id) => data.vectors[id]);
  let totalSim = 0;
  let count = 0;
  for (let i = 0; i < vecs.length; i++) {
    for (let j = i + 1; j < vecs.length; j++) {
      totalSim += cosineSimilarity(vecs[i], vecs[j]);
      count++;
    }
  }
  const avgSim = totalSim / count;
  console.log(`${groupNames[gi]} 组内平均相似度: ${avgSim.toFixed(6)}`);
});

console.log('\n=== 关键差异维度分析 ===\n');

const keyDimensions = [
  'color:primary_luma',
  'color:primary_luma_area',
  'stroke:primary_luma',
  'opacity',
  'geometry:x',
  'geometry:y',
];

keyDimensions.forEach((key) => {
  const idx = DIMENSION_KEYS.indexOf(key);
  console.log(`\n${key} (index ${idx}):`);
  groupNames.forEach((name, gi) => {
    const values = groups[gi].map((id) => data.vectors[id][idx]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    console.log(`  ${name}: ${mean.toFixed(6)}`);
  });
});

console.log('\n=== 聚类效果评估 ===\n');

const allSims = [];
for (let i = 0; i < 4; i++) {
  for (let j = i + 1; j < 4; j++) {
    allSims.push({
      pair: `${groupNames[i]} vs ${groupNames[j]}`,
      sim: cosineSimilarity(groupMeans[i], groupMeans[j]),
    });
  }
}

const avgBetweenSim =
  allSims.reduce((sum, s) => sum + s.sim, 0) / allSims.length;
const minBetweenSim = Math.min(...allSims.map((s) => s.sim));

console.log(`组间平均相似度: ${avgBetweenSim.toFixed(6)}`);
console.log(`组间最小相似度: ${minBetweenSim.toFixed(6)}`);

const avgWithinSims = groups.map((g, gi) => {
  const vecs = g.map((id) => data.vectors[id]);
  let totalSim = 0;
  let count = 0;
  for (let i = 0; i < vecs.length; i++) {
    for (let j = i + 1; j < vecs.length; j++) {
      totalSim += cosineSimilarity(vecs[i], vecs[j]);
      count++;
    }
  }
  return totalSim / count;
});

const avgWithinSim =
  avgWithinSims.reduce((sum, s) => sum + s, 0) / avgWithinSims.length;
console.log(`组内平均相似度: ${avgWithinSim.toFixed(6)}`);

const separationRatio = avgWithinSim / avgBetweenSim;
console.log(`\n分离度 (组内/组间): ${separationRatio.toFixed(4)}`);
console.log(
  separationRatio > 1.001
    ? '✅ 聚类效果良好，组内相似度高于组间'
    : '⚠️ 聚类效果需要进一步优化'
);

console.log('\n=== 最相似的组对 ===');
allSims.sort((a, b) => b.sim - a.sim);
allSims.slice(0, 3).forEach((s) => {
  console.log(`  ${s.pair}: ${s.sim.toFixed(6)}`);
});

console.log('\n=== 最不相似的组对 ===');
allSims.sort((a, b) => a.sim - b.sim);
allSims.slice(0, 3).forEach((s) => {
  console.log(`  ${s.pair}: ${s.sim.toFixed(6)}`);
});
