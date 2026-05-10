const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test/schema.json', 'utf8'));

function traverse(node, depth = 0) {
  const indent = '  '.repeat(depth);
  const info = {
    id: node.id,
    name: node.name,
    type: node.type,
    fills: node.fills,
    strokes: node.strokes,
    opacity: node.opacity,
    effects: node.effects,
  };
  
  console.log(`${indent}${node.name} (${node.type}) [${node.id}]`);
  
  if (node.fills && node.fills.length > 0) {
    node.fills.forEach((f, i) => {
      if (f.visible !== false) {
        const color = f.color ? `rgb(${(f.color.r * 255).toFixed(0)}, ${(f.color.g * 255).toFixed(0)}, ${(f.color.b * 255).toFixed(0)})` : 'no-color';
        console.log(`${indent}  fill[${i}]: ${f.type}, opacity=${f.opacity}, color=${color}`);
      }
    });
  }
  
  if (node.strokes && node.strokes.length > 0) {
    node.strokes.forEach((s, i) => {
      if (s.visible !== false) {
        const color = s.color ? `rgb(${(s.color.r * 255).toFixed(0)}, ${(s.color.g * 255).toFixed(0)}, ${(s.color.b * 255).toFixed(0)})` : 'no-color';
        console.log(`${indent}  stroke[${i}]: ${s.type}, opacity=${s.opacity}, color=${color}`);
      }
    });
  }
  
  if (node.effects && node.effects.length > 0) {
    node.effects.forEach((e, i) => {
      console.log(`${indent}  effect[${i}]: ${e.type}, visible=${e.visible}`);
    });
  }
  
  if (node.children) {
    node.children.forEach(c => traverse(c, depth + 1));
  }
}

console.log('=== 分析 COMPONENT_SET 结构 ===\n');
console.log(`根节点: ${data.node.name} (${data.node.type})`);
console.log(`子节点数: ${data.node.children?.length || 0}\n`);

const components = data.node.children || [];
console.log(`共 ${components.length} 个 COMPONENT\n`);

const stateGroups = {};
components.forEach(c => {
  const nameMatch = c.name.match(/状态=([^,]+)/);
  const state = nameMatch ? nameMatch[1] : 'unknown';
  if (!stateGroups[state]) stateGroups[state] = [];
  stateGroups[state].push(c);
});

console.log('=== 按状态分组 ===');
Object.entries(stateGroups).forEach(([state, nodes]) => {
  console.log(`\n${state} (${nodes.length} 个):`);
  nodes.slice(0, 2).forEach(n => {
    console.log(`  - ${n.name} [${n.id}]`);
    if (n.fills?.[0]?.color) {
      const c = n.fills[0].color;
      console.log(`    fill: rgb(${(c.r * 255).toFixed(0)}, ${(c.g * 255).toFixed(0)}, ${(c.b * 255).toFixed(0)})`);
    }
  });
});

console.log('\n\n=== 详细分析每个状态的样式差异 ===\n');

Object.entries(stateGroups).forEach(([state, nodes]) => {
  console.log(`\n--- ${state} ---`);
  
  const fills = [];
  const strokes = [];
  const opacities = [];
  const effects = [];
  
  nodes.forEach(n => {
    if (n.fills) fills.push(...n.fills.filter(f => f.visible !== false));
    if (n.strokes) strokes.push(...n.strokes.filter(s => s.visible !== false));
    opacities.push(n.opacity);
    if (n.effects) effects.push(...n.effects.filter(e => e.visible !== false));
  });
  
  console.log(`  平均 opacity: ${(opacities.reduce((a, b) => a + b, 0) / opacities.length).toFixed(3)}`);
  console.log(`  fills 数量: ${fills.length}`);
  
  const fillColors = fills.map(f => {
    if (f.color) {
      const luma = 0.299 * f.color.r + 0.587 * f.color.g + 0.114 * f.color.b;
      return { luma: luma.toFixed(4), r: f.color.r.toFixed(3), g: f.color.g.toFixed(3), b: f.color.b.toFixed(3) };
    }
    return null;
  }).filter(Boolean);
  
  if (fillColors.length > 0) {
    const avgLuma = fillColors.reduce((a, b) => a + parseFloat(b.luma), 0) / fillColors.length;
    console.log(`  fill 平均 luma: ${avgLuma.toFixed(4)}`);
  }
  
  console.log(`  strokes 数量: ${strokes.length}`);
  const strokeColors = strokes.map(s => {
    if (s.color) {
      const luma = 0.299 * s.color.r + 0.587 * s.color.g + 0.114 * s.color.b;
      return { luma: luma.toFixed(4), r: s.color.r.toFixed(3), g: s.color.g.toFixed(3), b: s.color.b.toFixed(3) };
    }
    return null;
  }).filter(Boolean);
  
  if (strokeColors.length > 0) {
    const avgLuma = strokeColors.reduce((a, b) => a + parseFloat(b.luma), 0) / strokeColors.length;
    console.log(`  stroke 平均 luma: ${avgLuma.toFixed(4)}`);
  }
  
  console.log(`  effects 数量: ${effects.length}`);
  effects.forEach(e => {
    console.log(`    - ${e.type}`);
  });
});

console.log('\n\n=== 分析子节点结构差异 ===\n');

Object.entries(stateGroups).forEach(([state, nodes]) => {
  console.log(`\n--- ${state} ---`);
  
  nodes.slice(0, 1).forEach(n => {
    console.log(`  ${n.name}:`);
    if (n.children) {
      n.children.forEach(c => {
        console.log(`    - ${c.name} (${c.type})`);
        if (c.fills?.[0]?.color) {
          const fc = c.fills[0].color;
          const luma = 0.299 * fc.r + 0.587 * fc.g + 0.114 * fc.b;
          console.log(`      fill luma: ${luma.toFixed(4)}`);
        }
      });
    }
  });
});
