const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test/vector.json', 'utf8'));

const nodeIds = Object.keys(data.vectors);

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

const vectors = nodeIds.map((id) => data.vectors[id]);

const pairs = [];
for (let i = 0; i < vectors.length; i++) {
  for (let j = i + 1; j < vectors.length; j++) {
    pairs.push(cosineSimilarity(vectors[i], vectors[j]));
  }
}

pairs.sort((a, b) => b - a);

console.log('=== 分析所有 gap ===\n');

const gaps = [];
for (let i = 0; i < pairs.length - 1; i++) {
  const high = pairs[i];
  const low = pairs[i + 1];
  if (high > 0.99 || low < 0.5) continue;
  const gap = high - low;
  gaps.push({ idx: i, high, low, gap });
}

console.log('所有 gap >= 0.02:');
gaps
  .filter((g) => g.gap >= 0.02)
  .forEach((g) => {
    console.log(
      `  idx ${g.idx}: [${g.low.toFixed(6)}, ${g.high.toFixed(6)}], gap=${g.gap.toFixed(6)}`
    );
  });

console.log('\n=== 分析相似度分布 ===');
console.log('\n前 20 个最高相似度:');
for (let i = 0; i < 20; i++) {
  console.log(`  ${i}: ${pairs[i].toFixed(6)}`);
}

console.log('\n相似度在 0.97-1.0 范围内的分布:');
const highSim = pairs.filter((p) => p >= 0.97);
console.log(`  总数: ${highSim.length}`);
console.log(
  `  范围: [${highSim[highSim.length - 1].toFixed(6)}, ${highSim[0].toFixed(6)}]`
);

console.log('\n=== 寻找最佳分割点 ===');

function findBestGap(pairs, minGap = 0.03) {
  const candidates = [];

  for (let i = 0; i < pairs.length - 1; i++) {
    const high = pairs[i];
    const low = pairs[i + 1];
    if (high > 0.99 || low < 0.5) continue;
    const gap = high - low;

    if (gap >= minGap) {
      const threshold = (high + low) / 2;
      const score = gap * (high + 0.5);
      candidates.push({
        idx: i,
        high,
        low,
        gap,
        threshold,
        score,
      });
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

const candidates = findBestGap(pairs, 0.02);
console.log('\n候选 gap (按得分排序):');
candidates.slice(0, 10).forEach((c, i) => {
  console.log(
    `  ${i + 1}. threshold=${c.threshold.toFixed(6)}, gap=${c.gap.toFixed(6)}, high=${c.high.toFixed(6)}, score=${c.score.toFixed(6)}`
  );
});

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

console.log('\n=== 测试不同阈值 ===');
candidates.slice(0, 5).forEach((c) => {
  const clusters = clusterByConnectedComponents(nodeIds, vectors, c.threshold);
  console.log(
    `\n阈值 ${c.threshold.toFixed(6)} (gap=${c.gap.toFixed(6)}, high=${c.high.toFixed(6)}):`
  );
  console.log(`  聚类数量: ${clusters.length}`);
  console.log(
    `  聚类大小: [${clusters
      .map((x) => x.length)
      .sort((a, b) => b - a)
      .join(', ')}]`
  );
});
