// 从原始schema属性出发计算特征向量，测试不同权重策略
const fs = require('fs');
const path = require('path');

// ============ 1. 读取数据 ============
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema.json'), 'utf8'));
const vectorData = JSON.parse(fs.readFileSync(path.join(__dirname, 'vector.json'), 'utf8'));

// 收集所有COMPONENT节点（直接子节点）
const components = schema.node.children
  .filter(c => c.type === 'COMPONENT')
  .map(c => ({
    id: c.id,
    name: c.name,
    width: c.width,
    height: c.height,
    layoutMode: c.layoutMode || 'NONE',
    fills: c.fills,
    strokes: c.strokes,
    strokeWeight: c.strokeWeight,
    cornerRadius: c.cornerRadius,
    children: (c.children || []).map(ch => ({
      name: ch.name,
      type: ch.type,
      width: ch.width,
      height: ch.height,
    })),
  }));

console.log(`共 ${components.length} 个组件节点`);
console.log('');

// ============ 2. 解析名称分组 ============
function parseName(name) {
  const btnMatch = name.match(/按钮模式=(true|false)/);
  const stateMatch = name.match(/状态=(默认|禁用|悬停|聚焦)/);
  const sizeMatch = name.match(/尺寸=(小|中|大)/);
  return {
    btnMode: btnMatch ? btnMatch[1] : 'unknown',
    state: stateMatch ? stateMatch[1] : 'unknown',
    size: sizeMatch ? sizeMatch[1] : 'unknown',
  };
}

// 按期望的8组分组: btnMode(2) x state(4)
const groups = {};
components.forEach(c => {
  const p = parseName(c.name);
  const key = `${p.btnMode}_${p.state}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(c);
});

console.log('=== 当前分组情况 ===');
Object.keys(groups).sort().forEach(k => {
  console.log(`  ${k}: ${groups[k].length} 个`);
});
console.log('');

// ============ 3. 特征提取（模拟embedding逻辑） ============

function rgbToLuma(color) {
  if (!color) return 0.5;
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function extractFeatures(comp) {
  // 几何特征
  const w = comp.width;
  const h = comp.height;
  const aspectRatio = h > 0 ? w / h : 0;
  const area = w * h;

  // 填充色
  let fillLuma = 0.5, fillAlpha = 1, fillVisible = 0;
  if (comp.fills && comp.fills.length > 0 && comp.fills[0]) {
    fillLuma = rgbToLuma(comp.fills[0].color);
    fillAlpha = comp.fills[0].opacity ?? 1;
    fillVisible = comp.fills[0].visible ? 1 : 0;
  }

  // 描边
  let strokeLuma = 0.5, strokeAlpha = 1, strokeVisible = 0, sw = comp.strokeWeight || 0;
  if (comp.strokes && comp.strokes.length > 0 && comp.strokes[0]) {
    strokeLuma = rgbToLuma(comp.strokes[0].color);
    strokeAlpha = comp.strokes[0].opacity ?? 1;
    strokeVisible = comp.strokes[0].visible ? 1 : 0;
  }

  // 子结构特征
  const childNames = (comp.children || []).map(ch => ch.name).sort().join(',');
  const childTypes = (comp.children || []).map(ch => ch.type).sort().join(',');

  // 返回命名特征（与dimension-weights.ts对齐）
  return {
    // geometry
    'geo:norm_width': w / 1000,
    'geo:norm_height': h / 1000,
    'geo:aspect_ratio': Math.min(aspectRatio / 10, 1),
    
    // color - 最关键的区别维度
    'color:fill_luma': fillLuma,
    'color:fill_alpha': fillAlpha,
    'color:fill_visible': fillVisible,
    'color:primary_luma': fillLuma, // primary fill luma
    
    // stroke
    'stroke:visible': strokeVisible,
    'stroke:weight_norm': sw / 10,
    'stroke:alpha': strokeAlpha,
    'stroke:primary_luma': strokeLuma,

    // layout
    'layout:mode_H': comp.layoutMode === 'HORIZONTAL' ? 1 : 0,
    'layout:mode_V': comp.layoutMode === 'VERTICAL' ? 1 : 0,
    'layout:cornerRadius': (comp.cornerRadius || 0) / 20,

    // 结构特征 - 区分按钮模式的关键！
    'struct:child_count': (comp.children || []).length,
    'struct:has_wrapper': childNames.includes('wrapper') ? 1 : 0,
    'struct:has_step_layer': childNames.includes('.input-number-step-layer') ? 1 : 0,
    'struct:child_types_hash': childTypes,
  };
}

// ============ 4. 构建维度定义（与features.ts对齐） ============
const DIM_NAMES = [
  // node_type one-hot (简化为前几个维度占位)
  'nt:COMPONENT', 'nt:FRAME', 'nt:INSTANCE', 'nt:TEXT', 'nt:VECTOR', 
  'nt:GROUP', 'nt:RECTANGLE', 'nt:ELLIPSE', 'nt:LINE', 'nt:REGULAR_POLYGON',
  'nt:STAR', 'nt:OTHER',
  // geometry
  'geo:norm_width', 'geo:norm_height', 'geo:aspect_ratio',
  // fill color
  'color:fill_visible', 'color:fill_luma', 'color:fill_alpha', 'color:primary_luma',
  // stroke  
  'stroke:visible', 'stroke:weight_norm', 'stroke:alpha', 'stroke:primary_luma',
  // layout
  'layout:H', 'layout:V', 'layout:cornerRadius',
  // children structure
  'struct:child_count_norm', 'struct:has_Button', 'struct:has_wrapper', 'struct:has_step_layer',
];

// 当前权重（来自dimension-weights.ts）
const CURRENT_WEIGHTS = {
  'nodeType': 5,
  'geometry': 2,
  'color': 3,
  'color.luma': 3,
  'stroke': 3,
  'stroke.luma': 3,
  'layout': 2,
  'children': 2,
};

function buildVector(features, weights) {
  const vec = [];
  
  // node_type: COMPONENT=1
  vec.push(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); // 12 dims
  
  // geometry (weight: 2)
  const gw = weights.geometry || 2;
  vec.push(
    features['geo:norm_width'] * gw,
    features['geo:norm_height'] * gw,
    features['geo:aspect_ratio'] * gw
  ); // 3 dims

  // color (weight: 3, luma: 3)
  const cw = weights.color || 3;
  const clw = weights['color.luma'] || 3;
  vec.push(
    features['color:fill_visible'] * cw,
    features['color:fill_luma'] * clw,
    features['color:fill_alpha'] * cw,
    features['color:primary_luma'] * clw
  ); // 4 dims

  // stroke (weight: 3, luma: 3)  
  const sw_w = weights.stroke || 3;
  const slw = weights['stroke.luma'] || 3;
  vec.push(
    features['stroke:visible'] * sw_w,
    features['stroke:weight_norm'] * sw_w,
    features['stroke:alpha'] * sw_w,
    features['stroke:primary_luma'] * slw
  ); // 4 dims

  // layout (weight: 2)
  const lw = weights.layout || 2;
  vec.push(
    features['layout:mode_H'] * lw,
    features['layout:mode_V'] * lw,
    features['layout:cornerRadius'] * lw
  ); // 3 dims

  // children structure (weight: 2)
  const chw = weights.children || 2;
  vec.push(
    features['struct:child_count'] / 5 * chw,  // normalized child count
    features['struct:has_wrapper'] * chw,
    features['struct:has_step_layer'] * chw
  ); // 3 dims
  
  return vec;
}

function cos(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// ============ 5. 计算并分析 ============
console.log('=== 各组代表性节点的原始特征值 ===');
const groupReps = {};
Object.keys(groups).sort().forEach(k => {
  const members = groups[k];
  const rep = members[0]; // 取第一个作为代表
  const feat = extractFeatures(rep);
  groupReps[k] = { feat, name: rep.name };
  
  const p = parseName(rep.name);
  console.log(`\n[${k}] ${rep.name}`);
  console.log(`  填充亮度(fill_luma): ${feat['color:fill_luma'].toFixed(4)}`);
  console.log(`  主亮度(primary_luma): ${feat['color:primary_luma'].toFixed(4)}`);
  console.log(`  描边亮度(stroke_luma): ${feat['stroke:primary_luma'].toFixed(4)}`);
  console.log(`  描边可见(stroke_vis):   ${feat['stroke:visible']}`);
  console.log(`  描边宽度(stroke_w):     ${feat['stroke:weight_norm'].toFixed(4)}`);
  console.log(`  子节点数(child_count):  ${feat['struct:child_count']}`);
  console.log(`  有wrapper:              ${feat['struct:has_wrapper']}`);
  console.log(`  有step_layer:           ${feat['struct:has_step_layer']}`);
});

// ============ 6. 测试不同权重策略 ============
console.log('\n\n========================================');
console.log('=== 权重策略对比测试 ===');
console.log('========================================\n');

const strategies = {
  '当前权重': CURRENT_WEIGHTS,
  '颜色强化(6)': { ...CURRENT_WEIGHTS, color: 6, 'color.luma': 8, stroke: 6, 'stroke.luma': 8 },
  '颜色超强(10)': { ...CURRENT_WEIGHTS, color: 10, 'color.luma': 15, stroke: 10, 'stroke.luma': 15 },
  '结构增强(5)': { ...CURRENT_WEIGHTS, children: 5 },
  '颜色+结构组合': { ...CURRENT_WEIGHTS, color: 6, 'color.luma': 10, stroke: 6, 'stroke.luma': 10, children: 5 },
  '降低几何(0.5)': { ...CURRENT_WEIGHTS, geometry: 0.5, layout: 0.5 },
  '极端策略-几何归零': { ...CURRENT_WEIGHTS, geometry: 0, layout: 0, nodeType: 0 },
  '极端策略-只看颜色+结构': { geometry: 0, layout: 0, nodeType: 0, color: 10, 'color.luma': 15, stroke: 10, 'stroke.luma': 15, children: 8 },
};

const groupKeys = Object.keys(groupReps).sort();

for (const [stratName, weights] of Object.entries(strategies)) {
  console.log(`\n--- 策略: ${stratName} ---`);
  
  // 为每组代表构建向量
  const vecs = {};
  for (const k of groupKeys) {
    vecs[k] = buildVector(groupReps[k].feat, weights);
  }
  
  // 组间相似度矩阵
  let minSim = 1, maxSim = 0, totalSim = 0, count = 0;
  const pairs = [];
  
  for (let i = 0; i < groupKeys.length; i++) {
    for (let j = i + 1; j < groupKeys.length; j++) {
      const s = cos(vecs[groupKeys[i]], vecs[groupKeys[j]]);
      pairs.push({ pair: `${groupKeys[i]} vs ${groupKeys[j]}`, sim: s });
      minSim = Math.min(minSim, s);
      maxSim = Math.max(maxSim, s);
      totalSim += s;
      count++;
    }
  }
  
  pairs.sort((a, b) => a.sim - b.sim);
  
  console.log(`  组间cos范围: [${minSim.toFixed(6)}, ${maxSim.toFixed(6)}]`);
  console.log(`  平均组间cos: ${(totalSim / count).toFixed(6)}`);
  console.log(`  分离度(max-min): ${(maxSim - minSim).toFixed(6)}`);
  console.log(`  最相似的5对:`);
  pairs.slice(0, 5).forEach(p => console.log(`    ${p.pair}: ${p.sim.toFixed(6)}`));
  console.log(`  最疏远的5对:`);
  pairs.slice(-5).reverse().forEach(p => console.log(`    ${p.pair}: ${p.sim.toFixed(6)}`));
}

// ============ 7. 维度贡献分析 ============
console.log('\n\n========================================');
console.log('=== 单维度区分度分析 ===');
console.log('========================================\n');

const featureKeys = [
  'color:fill_luma', 'color:primary_luma',
  'stroke:primary_luma', 'stroke:visible', 'stroke:weight_norm',
  'struct:child_count', 'struct:has_wrapper', 'struct:has_step_layer',
  'geo:norm_width', 'geo:norm_height'
];

featureKeys.forEach(fk => {
  const vals = groupKeys.map(k => groupReps[k].feat[fk]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min;
  const cv = (max > 0) ? ((max - min) / max) : 0; // coefficient of variation
  console.log(`  ${fk.padEnd(28)} 范围:[${min.toFixed(4)}, ${max.toFixed(4)}]  变化幅度:${range.toFixed(4)}  CV:${cv.toFixed(4)}`);
});

// ============ 8. 关键发现：结构差异 ============
console.log('\n\n========================================');
console.log('=== 结构差异分析 (按钮模式区分关键) ===');
console.log('========================================\n');

groupKeys.forEach(k => {
  const g = groupReps[k];
  const children = groups[k][0].children.map(ch => `${ch.name}(${ch.type})`).join(', ');
  console.log(`  ${k}: [${children}]`);
});
