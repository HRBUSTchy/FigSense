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

console.log('=== 分析当前权重配置的问题 ===\n');

const dimAnalysis = DIMENSION_KEYS.map((key, idx) => {
  const values = vectors.map(v => v[idx]);
  const variance = getVariance(values);
  return { key, idx, variance };
});

dimAnalysis.sort((a, b) => b.variance - a.variance);

console.log('方差排名:');
dimAnalysis.forEach((d, i) => {
  console.log(`${i + 1}. ${d.key}: variance=${d.variance.toFixed(6)}`);
});

console.log('\n=== 测试不同权重策略 ===\n');

function applyWeights(vectors, weights) {
  return vectors.map(v => v.map((val, i) => val * (weights[i] || 1)));
}

function clusterByConnectedComponents(nodeIds, vectors, threshold) {
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
      const currentVector = vectors[currentIdx];
      
      for (const candidateNodeId of nodeIds) {
        if (visited.has(candidateNodeId)) continue;
        const candidateIdx = nodeIds.indexOf(candidateNodeId);
        const candidateVector = vectors[candidateIdx];
        const similarity = cosineSimilarity(currentVector, candidateVector);
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

const strategies = [
  {
    name: '当前权重 (subtree=12, color=5)',
    getWeights: () => {
      const w = new Array(88).fill(1);
      DIMENSION_KEYS.forEach((key, i) => {
        if (key.startsWith('subtree:')) w[i] = 12;
        else if (key === 'color:primary_luma') w[i] = 5;
        else if (key === 'color:primary_luma_area') w[i] = 3;
        else if (key === 'stroke:primary_luma') w[i] = 4;
        else if (key.startsWith('child_sig:')) w[i] = 6;
        else if (key === 'geometry:x' || key === 'geometry:y') w[i] = 0.02;
      });
      return w;
    }
  },
  {
    name: '策略2: 只保留高方差维度',
    getWeights: () => {
      const w = new Array(88).fill(0.01);
      const highVarKeys = ['subtree:min_fill_luma', 'subtree:luma_range', 'subtree:visual_entropy', 
                          'color:primary_luma', 'subtree:stroke_node_count', 'subtree:max_fill_luma'];
      highVarKeys.forEach(key => {
        const idx = DIMENSION_KEYS.indexOf(key);
        if (idx >= 0) w[idx] = 10;
      });
      return w;
    }
  },
  {
    name: '策略3: 方差加权',
    getWeights: () => {
      return dimAnalysis.map(d => Math.sqrt(d.variance) * 5 + 0.1);
    }
  },
  {
    name: '策略4: 高方差维度权重放大',
    getWeights: () => {
      const w = new Array(88).fill(0.1);
      dimAnalysis.slice(0, 10).forEach(d => {
        w[d.idx] = 20;
      });
      dimAnalysis.slice(10, 20).forEach(d => {
        w[d.idx] = 5;
      });
      return w;
    }
  },
  {
    name: '策略5: subtree维度权重=50',
    getWeights: () => {
      const w = new Array(88).fill(1);
      DIMENSION_KEYS.forEach((key, i) => {
        if (key.startsWith('subtree:')) w[i] = 50;
        else if (key === 'color:primary_luma') w[i] = 20;
        else if (key.startsWith('child_sig:')) w[i] = 10;
        else if (key === 'geometry:x' || key === 'geometry:y') w[i] = 0.01;
        else if (key.startsWith('geometry:') || key.startsWith('layout_')) w[i] = 0.1;
      });
      return w;
    }
  }
];

strategies.forEach(strategy => {
  console.log(`\n--- ${strategy.name} ---`);
  const weights = strategy.getWeights();
  const weightedVectors = applyWeights(vectors, weights);
  
  [0.95, 0.97, 0.98, 0.99].forEach(threshold => {
    const clusters = clusterByConnectedComponents(nodeIds, weightedVectors, threshold);
    console.log(`  阈值 ${threshold}: ${clusters.length} clusters, sizes: [${clusters.map(c => c.length).sort((a, b) => b - a).join(', ')}]`);
  });
});

console.log('\n\n=== 寻找最佳权重配置 ===\n');

function findOptimalWeights() {
  const best = { score: 0, weights: null, threshold: 0 };
  
  for (let subtreeWeight = 10; subtreeWeight <= 100; subtreeWeight += 10) {
    for (let colorWeight = 5; colorWeight <= 30; colorWeight += 5) {
      const w = new Array(88).fill(0.5);
      DIMENSION_KEYS.forEach((key, i) => {
        if (key.startsWith('subtree:')) w[i] = subtreeWeight;
        else if (key === 'color:primary_luma') w[i] = colorWeight;
        else if (key === 'geometry:x' || key === 'geometry:y') w[i] = 0.01;
      });
      
      const weightedVectors = applyWeights(vectors, w);
      const clusters = clusterByConnectedComponents(nodeIds, weightedVectors, 0.98);
      
      if (clusters.length === 5) {
        const sizes = clusters.map(c => c.length).sort((a, b) => b - a);
        if (sizes[0] <= 12) {
          console.log(`✅ subtree=${subtreeWeight}, color=${colorWeight}: ${clusters.length} clusters, sizes: [${sizes.join(', ')}]`);
        }
      }
    }
  }
}

findOptimalWeights();
