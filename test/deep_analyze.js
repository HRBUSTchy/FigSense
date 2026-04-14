// 深度分析：子节点特征差异 + merge信息损失 + 系统性改进方案
const fs = require('fs');
const path = require('path');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema.json'), 'utf8'));

function rgbToLuma(c) { return c ? (0.299*c.r + 0.587*c.g + 0.114*c.b) : 0.5; }

// 收集所有组件
function collectComponents(node, depth = 0) {
  let results = [];
  if (node.type === 'COMPONENT' && depth > 0) {
    results.push(node);
  }
  if (node.children) {
    node.children.forEach(c => results = results.concat(collectComponents(c, depth + 1)));
  }
  return results;
}

const components = collectComponents(schema.node);

// 解析名称
function parseName(name) {
  return {
    btnMode: (name.match(/按钮模式=(true|false)/) || [])[1] || 'unknown',
    state: (name.match(/状态=(默认|禁用|悬停|聚焦)/) || [])[1] || 'unknown',
    size: (name.match(/尺寸=(小|中|大)/) || [])[1] || 'unknown',
  };
}

// 分组
const groups = {};
components.forEach(c => {
  const p = parseName(c.name);
  const key = `${p.btnMode}_${p.state}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(c);
});

console.log('='.repeat(80));
console.log('深度分析报告: 向量化鲁棒性');
console.log('='.repeat(80));

// ========================================
// PART 1: 子节点内部特征深度分析
// ========================================
console.log('\n\n### PART 1: TRUE组(按钮模式=true)的4个状态 - 子节点逐层展开 ###\n');

const trueGroups = Object.keys(groups).filter(k => k.startsWith('true_')).sort();

trueGroups.forEach(k => {
  const rep = groups[k][0]; // 取第一个（尺寸=中）
  console.log(`\n--- ${k}: ${rep.name} ---`);
  console.log(`  直接子节点(${rep.children.length}):`);
  
  rep.children.forEach((child, ci) => {
    console.log(`    [${ci}] ${child.name} (${child.type}) ${child.width}x${child.height}`);
    
    // 提取该子节点的关键视觉属性
    const fillLuma = child.fills && child.fills[0] ? rgbToLuma(child.fills[0].color).toFixed(4) : 'N/A';
    const strokeVis = child.strokes && child.strokes.length > 0 && child.strokes[0].visible !== false ? 1 : 0;
    const strokeLuma = child.strokes && child.strokes[0] ? rgbToLuma(child.strokes[0].color).toFixed(4) : 'N/A';
    const opacityVal = child.opacity ?? 1;
    
    console.log(`        fill_luma=${fillLuma}, stroke_vis=${strokeVis}, stroke_luma=${strokeLuma}, opacity=${opacityVal}`);
    
    // 再下一层
    if (child.children && child.children.length > 0) {
      child.children.forEach((gc, gi) => {
        const gFillLuma = gc.fills && gc.fills[0] ? rgbToLuma(gc.fills[0].color).toFixed(4) : 'N/A';
        const gStrokeVis = gc.strokes && gc.strokes.length > 0 && gc.strokes[0].visible !== false ? 1 : 0;
        const gOpacity = gc.opacity ?? 1;
        console.log(`          [${gi}] ${gc.name} (${gc.type}) ${gc.width}x${gc.height} fill=${gFillLuma} stroke=${gStrokeVis} op=${gOpacity}`);
        
        // 再下一层
        if (gc.children && gc.children.length > 0) {
          gc.children.forEach((ggc, ggi) => {
            const ggFillLuma = ggc.fills && ggc.fills[0] ? rgbToLuma(ggc.fills[0].color).toFixed(4) : 'N/A';
            console.log(`            [${ggi}] ${ggc.name} (${ggc.type}) ${ggc.width}x${ggc.height} fill=${ggFillLuma}`);
          });
        }
      });
    }
  });
});

// ========================================  
// PART 2: FALSE组的对比
// ========================================
console.log('\n\n### PART 2: FALSE组(按钮模式=false)的4个状态 - 子节点展开 ###\n');

const falseGroups = Object.keys(groups).filter(k => k.startsWith('false_')).sort();

falseGroups.forEach(k => {
  const rep = groups[k][0];
  console.log(`\n--- ${k}: ${rep.name} ---`);
  console.log(`  直接子节点(${rep.children.length}):`);
  
  rep.children.forEach((child, ci) => {
    const fillLuma = child.fills && child.fills[0] ? rgbToLuma(child.fills[0].color).toFixed(4) : 'N/A';
    const strokeVis = child.strokes && child.strokes.length > 0 && child.strokes[0].visible !== false ? 1 : 0;
    const strokeLuma = child.strokes && child.strokes[0] ? rgbToLuma(child.strokes[0].color).toFixed(4) : 'N/A';
    console.log(`    [${ci}] ${child.name} (${child.type}) ${child.width}x${child.height} fill=${fillLuma} stroke_vis=${strokeVis} stroke_luma=${strokeLuma}`);
    
    if (child.children && child.children.length > 0) {
      child.children.forEach((gc, gi) => {
        const gFillLuma = gc.fills && gc.fills[0] ? rgbToLuma(gc.fills[0].color).toFixed(4) : 'N/A';
        const gStrokeVis = gc.strokes && gc.strokes.length > 0 && gc.strokes[0].visible !== false ? 1 : 0;
        console.log(`      [${gi}] ${gc.name} (${gc.type}) ${gc.width}x${gc.height} fill=${gFillLuma} stroke=${gStrokeVis}`);
        
        if (gc.children && gc.children.length > 0) {
          gc.children.forEach((ggc, ggi) => {
            const ggFillLuma = ggc.fills && ggc.fills[0] ? rgbToLuma(ggc.fills[0].color).toFixed(4) : 'N/A';
            console.log(`        [${ggi}] ${ggc.name} (${ggc.type}) ${ggc.width}x${ggc.height} fill=${ggFillLuma}`);
          });
        }
      });
    }
  });
});

// ========================================
// PART 3: Merge过程模拟 + 信息损失分析
// ========================================
console.log('\n\n### PART 3: Merge过程模拟 - 信息损失量化 ###\n');

// 模拟 createNodeEmbedding 的核心逻辑
function normalizeValue(val, min, max) {
  return Math.max(0, Math.min(1, (val - min) / (max - min)));
}

function extractColorFeatures(paints, areaScale = 1) {
  const f = [0, 0, 0, 0, 0, 0];
  if (!Array.isArray(paints)) return f;
  const visible = paints.filter(p => p.visible !== false);
  f[0] = visible.length > 0 ? 1 : 0;
  f[1] = normalizeValue(visible.filter(p => p.type === 'SOLID').length, 0, 5);
  if (visible.length > 0 && visible[0].type === 'SOLID') {
    const c = visible[0].color;
    const op = visible[0].opacity ?? 1;
    f[4] = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) * op;
    f[5] = ((Math.round(Math.max(0, Math.min(1, c.r)) * 255) * 256 * 256 +
              Math.round(Math.max(0, Math.min(1, c.g)) * 255) * 256 +
              Math.round(Math.max(0, Math.min(1, c.b)) * 255)) / 0xffffff) * op * areaScale;
  }
  return f;
}

function oneHotEncode(val, categories) {
  const vec = categories.map(() => 0);
  const idx = categories.indexOf(val);
  if (idx !== -1) vec[idx] = 1;
  return vec;
}

const NODE_TYPES = ['COMPONENT', 'FRAME', 'INSTANCE', 'TEXT', 'VECTOR', 'GROUP', 
                    'RECTANGLE', 'ELLIPSE', 'LINE', 'REGULAR_POLYGON', 'STAR', 'OTHER'];

function buildNodeVector(node, depth = 0) {
  const area = Math.max(0, node.width * node.height);
  const normArea = Math.min(1, normalizeValue(area, 0, 2000*2000));
  const areaScale = Math.sqrt(normArea);
  const aspectRatio = node.height > 0 ? node.width / node.height : 0;
  
  const vec = [];
  // node_type one-hot
  vec.push(...oneHotEncode(node.type, NODE_TYPES));
  // geometry
  vec.push(normalizeValue(node.x||0, 0, 2000), normalizeValue(node.y||0, 0, 2000),
           normalizeValue(node.width||0, 0, 2000), normalizeValue(node.height||0, 0, 2000),
           normalizeValue(aspectRatio, 0, 10));
  // layout (simplified)
  vec.push(...Array(12).fill(0)); // 12 layout dims
  // color fills
  vec.push(...extractColorFeatures(node.fills, areaScale));
  // color strokes
  vec.push(...extractColorFeatures(node.strokes, areaScale));
  // stroke weight
  vec.push(normalizeValue(node.strokeWeight || 0, 0, 20));
  // corner radius
  let cr = 0;
  if (typeof node.cornerRadius === 'number') cr = node.cornerRadius;
  else if (node.topLeftRadius) cr = (node.topLeftRadius+node.topRightRadius+node.bottomLeftRadius+node.bottomRightRadius)/4;
  vec.push(normalizeValue(cr, 0, 100));
  // opacity, visible, locked
  vec.push(node.opacity ?? 1, node.visible ? 1 : 0, 0);
  // text (10), name (4), hierarchy (3)
  vec.push(...Array(10).fill(0), ...Array(4).fill(0),
           normalizeValue(depth, 0, 10),
           normalizeValue((node.children||[]).length, 0, 50),
           (node.children||[]).length > 0 ? (node.children||[]).filter(c=>c.visible).length/(node.children||[]).length : 0);
  // rotation, blend mode, effects
  vec.push(0, 0, 0, 0); // rotation, blend_mode, shadow, blur
  
  return vec;
}

// 模拟 weighted merge
function weightedMerge(parentVec, childVecs, decayRate = 0.5) {
  const result = [...parentVec];
  const weight = Math.max(0.45, Math.pow(decayRate, childVecs.length));
  
  for (let i = 0; i < result.length; i++) {
    // simplified: use uniform min parent weight
    const parentWeight = Math.max(weight, 0.35); // per-dimension min
    const childAvg = childVecs.reduce((sum, v) => sum + v[i], 0) / childVecs.length;
    result[i] = parentVec[i] * parentWeight + childAvg * (1 - parentWeight);
  }
  return result;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[b]*b[i]; }
  return dot / (Math.sqrt(na)*Math.sqrt(nb));
}

// 为每个组构建完整merge后的向量
console.log('构建各组的 merge 向量...\n');

const mergedVectors = {};
const leafVectors = {}; // 存储每个叶子的原始向量

Object.keys(groups).sort().forEach(k => {
  const rep = groups[k][0];
  
  // 构建父向量
  const parentVec = buildNodeVector(rep, 0);
  
  // 构建所有子节点向量
  const childVecs = (rep.children || []).map(ch => buildNodeVector(ch, 1));
  
  // 收集叶子信息
  leafVectors[k] = { parent: parentVec, children: childVecs };
  
  // 合并
  mergedVectors[k] = weightedMerge(parentVec, childVecs, 0.5);
});

// 计算合并前后的相似度变化
const allKeys = Object.keys(mergedVectors).sort();

console.log('=== 合并后组间相似度矩阵 ===');
allKeys.forEach((ki, i) => {
  allKeys.slice(i+1).forEach(kj => {
    const s = cosine(mergedVectors[ki], mergedVectors[kj]);
    const marker = s > 0.999 ? ' ⚠️SAME' : s > 0.99 ? ' ⚠CLOSE' : '';
    console.log(`  ${ki} vs ${kj}: ${s.toFixed(6)}${marker}`);
  });
});

// ========================================
// PART 4: 信息损失分析 - 哪些维度的差异被merge淹没了
// ========================================
console.log('\n\n### PART 4: 关键维度信息损失分析 ###\n');

// 找出在leaf层面有差异但在merge后消失的维度
const dimNames = [
  'nt:COMPONENT','nt:FRAME','nt:INSTANCE','nt:TEXT','nt:VECTOR','nt:GROUP',
  'nt:RECT','nt:ELLIPSE','nt:LINE','nt:POLY','nt:STAR','nt:OTHER',
  'geo:x','geo:y','geo:w','geo:h','geo:ar',
  ...Array.from({length:12}, (_,i)=>`layout[${i}]`),
  'cf:vis','cf:solid','cf:grad','cf:image','cf:luma','cf:area',
  'sf:vis','sf:solid','sf:grad','sf:image','sf:luma','sf:area',
  'sw','cr','op','vis','lock',
  ...Array.from({length:10}, (_,i)=>`text[${i}]`),
  ...Array.from({length:4}, (_,i)=>`name[${i}]`),
  'hier:depth','hier:count','hier:ratio',
  'rot','blend','shadow','blur'
];

console.log('TRUE组内4态 - 各关键维度值对比:');
console.log('(parent = 顶层component, children avg = 子节点平均, merged = 加权合并后)\n');

// 挑几个关键维度索引来分析
const keyDimIdx = [
  { name: 'color:primary_luma(fills)', idx: 12+5+4 }, // after nt(12)+geo(5)+layout(12)+color_start
  { name: 'stroke:primary_luma', idx: 12+5+12+6+4+1 },
  { name: 'stroke_weight', idx: 12+5+12+6+6+6 },
  { name: 'hierarchy:child_count', idx: 12+5+12+12+6+6+2+10+4+1 },
];

// 修正：重新计算正确的维度索引
// nt(12) + geo(5) + layout(12) = 29
// color_fills starts at 29: [vis,solid,grad,image,luma,area] = 6 dims -> ends at 34
// color_strokes starts at 35: [vis,solid,grad,image,luma,area] = 6 dims -> ends at 40
// stroke_weight at 41
// corner_radius at 42
// opacity at 43
// visible at 44
// locked at 45
// text[0-9] at 46-55
// name[0-3] at 56-59
// hier:depth at 60
// hier:count at 61
// hier:ratio at 62
// rotation at 63
// blend_mode at 64
// shadow at 65
// blur at 66

const correctedKeyDims = [
  { name: 'fills:luma(顶层)', idx: 33 },
  { name: 'strokes:luma(顶层)', idx: 39 },
  { name: 'stroke_weight(顶层)', idx: 41 },
  { name: 'child_count(hier)', idx: 61 },
];

trueGroups.forEach(k => {
  const lv = leafVectors[k];
  console.log(`\n[${k}]:`);
  correctedKeyDims.forEach(d => {
    const parentVal = lv.parent[d.idx]?.toFixed(4) || '?';
    if (lv.children.length > 0) {
      const childVals = lv.children.map(c => c[d.idx]?.toFixed(4) || '?');
      const childAvg = (lv.children.reduce((s,c) => s+(c[d.idx]||0),0)/lv.children.length).toFixed(4);
      const mergedVal = mergedVectors[k][d.idx]?.toFixed(4) || '?';
      console.log(`  ${d.name.padEnd(25)} parent=${String(parentVal).padEnd(8)} children=[${childVals.join(',')}] avg=${childAvg} merged=${mergedVal}`);
    } else {
      console.log(`  ${d.name.padEnd(25)} parent=${parentVal} (no children)`);
    }
  });
});

// ========================================
// PART 5: 系统性改进建议
// ========================================
console.log('\n\n### PART 5: 鲁棒性改进方案总结 ###\n');

console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                     问题根因 & 改进方案                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ 【问题1】结构区分力不足                                              ║
║   表现: true/false 组靠 child_count 和隐式类型组合区分，但权重太低   ║
║   根因: hierarchy:child_count 权重仅 0.8，且没有显式的子节点类型指纹 ║
║   方案: 新增 "子节点type签名" 维度                                   ║
║     例: false默认=[FRAME], false悬停=[FRAME,INSTANCE]               ║
║         true组=[INSTANCE,FRAME,INSTANCE]                            ║
║     这是最强的区分信号                                               ║
║                                                                      ║
║ 【问题2】颜色差异被几何噪声淹没                                      ║
║   表现: fill_luma 在不同状态间仅差 0.05~0.10                         ║
║   根因: geometry(x,y,width,height)占12维且权重0.3~0.5，              ║
║         所有同尺寸节点的geometry完全一致但贡献了大量内积              ║
║   方案: 对完全相同的维度做"去基"或降权                                ║
║     A) 降低 geometry 权重至 0.05~0.1                                 ║
║     B) 增加颜色luma权重差分: 高灵敏度模式 vs 低灵敏度模式             ║
║                                                                      ║
║ 【问题3】Merge时子节点细节被过度平滑                                  ║
║   表现: decayRate=0.5 + 多子节点时 parentWeight=0.45                 ║
║         导致 parent 占比 ~45%, children 平均只占 55%                   ║
║         且多个子节点的差异被平均操作抹平                               ║
║   根因: weighted merge 用的是均值(mean)，不是极值(max)                ║
║   方案:                                                              ║
║     A) 对关键style维度使用 max-pooling 而非 average                  ║
║     B) 降低 decayRate 让子节点有更大影响力                             ║
║     C) 引入"差异敏感"合并: 保留子节点间方差作为额外维度               ║
║                                                                      ║
║ 【问题4】缺少跨层语义特征                                            ║
║   表现: true聚焦 与 true默认 在顶层无法区分                           ║
║   根因: 差异藏在第2~3层子节点(Button实例)的内部属性中，               ║
║         但当前merge把这些深层差异平均掉了                             ║
║   方案: 新增"子树统计特征"                                          ║
║     - 子树中具有描边的节点数                                         ║
║     - 子树中最小/最大亮度                                             ║
║     - 子树中有可见变化的子节点数(opacity!=1)                         ║
║     - 子树的"视觉熵": 各子节点特征的方差总和                          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

// ========================================
// PART 6: 具体代码级改进建议
// ========================================
console.log('### 推荐的具体修改 (按优先级排序) ###\n');

console.log(`
优先级 P0 (必须):
─────────────────
1. dimension-weights.ts: 提升 hierarchy:child_count 权重 0.8 → 3.0
2. dimension-weights.ts: 降低 geometry:x/y 权重 0.1 → 0.01 (位置不应影响相似度)
3. features.ts: 新增 extractChildSignatureFeature() 函数
   
优先级 P1 (强烈推荐):
───────────────────
4. dimension-weights.ts: color:primary_luma 3.0 → 5.0
5. merge.ts: 对 style 相关维度(color/stroke) 使用 max 替代 mean
6. features.ts: 新增子树统计特征 (subtree stats)

优先级 P2 (锦上添花):
───────────────────
7. embedding.ts: 可选的"高灵敏度模式"配置
8. merge.ts: 引入 variance-preserving merge variant
`);
