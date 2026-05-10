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
  'child_sig:component_count', 'child_sig:frame_count', 'child_sig:instance_count',
  'child_sig:text_count', 'child_sig:other_count', 'child_sig:total_visible',
  'child_sig:type_diversity', 'child_sig:positional_hash',
  'subtree:min_fill_luma', 'subtree:max_fill_luma', 'subtree:luma_range',
  'subtree:stroke_node_count', 'subtree:non_full_opacity_count',
  'subtree:max_depth', 'subtree:leaf_count', 'subtree:visual_entropy',
  'rotation', 'blend_mode', 'effects:shadow_count', 'effects:blur_count',
];

const nodeIds = Object.keys(data.vectors);
const vectors = nodeIds.map(id => data.vectors[id]);

console.log(`总节点数: ${nodeIds.length}`);
console.log(`向量维度: ${vectors[0].length}\n`);

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

console.log('=== 分析每个维度的区分度 ===\n');

const dimAnalysis = DIMENSION_KEYS.map((key, idx) => {
  const values = vectors.map(v => v[idx]);
  const variance = getVariance(values);
  const uniqueValues = [...new Set(values.map(v => v.toFixed(6)))];
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { key, idx, variance, uniqueCount: uniqueValues.length, min, max };
});

dimAnalysis.sort((a, b) => b.variance - a.variance);

console.log('方差最大的维度 (最有区分度):');
dimAnalysis.slice(0, 20).forEach(d => {
  console.log(`  ${d.key}: variance=${d.variance.toFixed(6)}, unique=${d.uniqueCount}, range=[${d.min.toFixed(4)}, ${d.max.toFixed(4)}]`);
});

console.log('\n唯一值最多的维度:');
dimAnalysis.sort((a, b) => b.uniqueCount - a.uniqueCount);
dimAnalysis.slice(0, 15).forEach(d => {
  console.log(`  ${d.key}: unique=${d.uniqueCount}, variance=${d.variance.toFixed(6)}`);
});

console.log('\n=== 尝试基于高方差维度聚类 ===\n');

const highVarDims = dimAnalysis.filter(d => d.variance > 0.1).slice(0, 10);
console.log('选择的高方差维度:', highVarDims.map(d => d.key).join(', '));

function clusterByDimensions(nodeIds, vectors, dimIndices, threshold) {
  const visited = new Set();
  const clusters = [];
  
  for (const seedNodeId of nodeIds) {
    if (visited.has(seedNodeId)) continue;
    
    const cluster = [];
    const queue = [seedNodeId];
    visited.add(seedNodeId);
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      cluster.push(currentId);
      
      const currentIdx = nodeIds.indexOf(currentId);
      const currentVec = dimIndices.map(i => vectors[currentIdx][i]);
      const currentNorm = Math.sqrt(currentVec.reduce((s, v) => s + v * v, 0));
      
      for (const candidateNodeId of nodeIds) {
        if (visited.has(candidateNodeId)) continue;
        const candidateIdx = nodeIds.indexOf(candidateNodeId);
        const candidateVec = dimIndices.map(i => vectors[candidateIdx][i]);
        const candidateNorm = Math.sqrt(candidateVec.reduce((s, v) => s + v * v, 0));
        
        if (currentNorm === 0 || candidateNorm === 0) continue;
        
        const dot = currentVec.reduce((s, v, i) => s + v * candidateVec[i], 0);
        const similarity = dot / (currentNorm * candidateNorm);
        
        if (similarity >= threshold) {
          visited.add(candidateNodeId);
          queue.push(candidateNodeId);
        }
      }
    }
    clusters.push(cluster);
  }
  
  return clusters;
}

const dimIndices = highVarDims.map(d => d.idx);
console.log('\n使用高方差维度聚类:');
[0.9, 0.95, 0.97, 0.98, 0.99, 0.995].forEach(threshold => {
  const clusters = clusterByDimensions(nodeIds, vectors, dimIndices, threshold);
  console.log(`  阈值 ${threshold}: ${clusters.length} clusters, sizes: [${clusters.map(c => c.length).sort((a, b) => b - a).join(', ')}]`);
});

console.log('\n=== 分析完全相同的节点 ===\n');

const identicalGroups = [];
const processed = new Set();

for (let i = 0; i < nodeIds.length; i++) {
  if (processed.has(nodeIds[i])) continue;
  
  const group = [nodeIds[i]];
  for (let j = i + 1; j < nodeIds.length; j++) {
    if (cosineSimilarity(vectors[i], vectors[j]) === 1.0) {
      group.push(nodeIds[j]);
      processed.add(nodeIds[j]);
    }
  }
  if (group.length > 1) {
    identicalGroups.push(group);
  }
  processed.add(nodeIds[i]);
}

console.log(`完全相同的节点组数: ${identicalGroups.length}`);
identicalGroups.forEach((g, i) => {
  console.log(`\n组 ${i + 1} (${g.length} 个节点):`);
  g.forEach(id => console.log(`  ${id}`));
});

console.log('\n=== 检查 geometry:y 的分布 ===\n');

const yIdx = DIMENSION_KEYS.indexOf('geometry:y');
const yValues = vectors.map((v, i) => ({ id: nodeIds[i], y: v[yIdx] }));
yValues.sort((a, b) => a.y - b.y);

console.log('按 y 坐标排序:');
yValues.forEach((p, i) => {
  const prevY = i > 0 ? yValues[i - 1].y : null;
  const gap = prevY !== null ? (p.y - prevY).toFixed(6) : '-';
  console.log(`  ${p.id}: y=${p.y.toFixed(6)}, gap=${gap}`);
});
