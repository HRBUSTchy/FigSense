// 验证：为什么调权重不影响 cos 相似度？
// 核心原因：vector.json 里的值已经是加权后的，而 cos 是尺度不变的（对所有向量统一乘以某维度的权重，角度不变）

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test/vector.json', 'utf8'));

const group1 = ['123397:109755','123397:111206','123397:112078','123397:110334'];
const group2 = ['123397:109762','123397:111221','123397:112093','123397:110349'];
const group3 = ['123397:109769','123397:111236','123397:112108','123397:110364'];
const group4 = ['123397:109776','123397:111252','123397:112124','123397:110380'];

function cos(a,b){let d=0,nA=0,nB=0;for(let i=0;i<a.length;i++){d+=a[i]*b[i];nA+=a[i]*a[i];nB+=b[i]*b[i];}return d/(Math.sqrt(nA)*Math.sqrt(nB));}

// 取两个不同组的代表节点
const v1 = data.vectors[group1[0]]; // 默认状态
const v2 = data.vectors[group2[0]]; // 禁用状态

console.log('=== 验证：cos 对均匀缩放的不变性 ===');
console.log(`原始相似度: ${cos(v1,v2).toFixed(10)}`);

// 将 color:primary_luma (index 38) 放大 100 倍
const v1_scaled = [...v1]; v1_scaled[38] *= 100;
const v2_scaled = [...v2]; v2_scaled[38] *= 100;
console.log(`放大 luma 维度 100 倍后: ${cos(v1_scaled, v2_scaled).toFixed(10)}`);

// 同时缩放多个颜色维度
const multiScale = (v, factor) => {
  const r = [...v];
  [38,39,44,45].forEach(i => r[i] *= factor); // luma, luma_area, stroke_luma, stroke_luma_area
  return r;
};
console.log(`放大所有luma维度 100倍后: ${cos(multiScale(v1,100), multiScale(v2,100)).toFixed(10)}`);
console.log(`放大所有luma维度 1000倍后: ${cos(multiScale(v1,1000), multiScale(v2,1000)).toFixed(10)}`);

console.log('\n=== 关键洞察 ===\n');

// 计算每个维度在向量范数中的占比
const avgNorm = Object.values(data.vectors).reduce((s,v)=>s+Math.sqrt(v.reduce((a,b)=>a+b*b,0)),0)/32;
console.log(`平均向量范数: ${avgNorm.toFixed(6)}`);

// 各维度对范数的贡献
const dimContrib = [];
for(let d=0;d<v1.length;d++){
  const avgVal = Object.values(data.vectors).reduce((s,v)=>s+Math.abs(v[d]),0)/32;
  dimContrib.push({dim:d,val:avgVal});
}
dimContrib.sort((a,b)=>b.val-a.val);
console.log('\nTop 15 贡献最大的维度:');
dimContrib.slice(0,15).forEach(c=>console.log(`  dim ${c.dim}: avg|value|=${c.val.toFixed(5)}, 占比=${(c.val/avgNorm*100).toFixed(2)}%`));

// 差异维度排名
console.log('\n=== 组间差异最大的维度（按标准差）===');
for(let d=0;d<v1.length;d++){
  const g1m = group1.map(id=>data.vectors[id][d]).reduce((a,b)=>a+b,0)/4;
  const g2m = group2.map(id=>data.vectors[id][d]).reduce((a,b)=>a+b,0)/4;
  const g3m = group3.map(id=>data.vectors[id][d]).reduce((a,b)=>a+b,0)/4;
  const g4m = group4.map(id=>data.vectors[id][d]).reduce((a,b)=>a+b,0)/4;
  const overall = (g1m+g2m+g3m+g4m)/4;
  const std = Math.sqrt(((g1m-overall)**2+(g2m-overall)**2+(g3m-overall)**2+(g4m-overall)**2)/4);
  if(std > 0.0001){
    console.log(`  dim ${d}: std=${std.toFixed(6)}, 均值=[${g1m.toFixed(5)},${g2m.toFixed(5)},${g3m.toFixed(5)},${g4m.toFixed(5)}], 贡献≈${dimContrib.find(c=>c.dim===d)?.val.toFixed(5)}`);
  }
}

console.log('\n\n=== 解决方案测试 ===\n');

// 方案1：将非差异维度归零或大幅降低
// 先找出哪些维度在四组之间几乎无差异
const zeroDims = [];
const keepDims = [];
for(let d=0;d<v1.length;d++){
  const vals = [...group1,...group2,...group3,...group4].map(id=>data.vectors[id][d]);
  const mean = vals.reduce((a,b)=>a+b,0)/16;
  const std = Math.sqrt(vals.reduce((s,v)=>s+(v-mean)**2,0)/16);
  const cv = std/Math.max(1e-10,mean);
  if(cv < 0.01) zeroDims.push(d); // 变异系数<1% → 视为无差异
  else keepDims.push(d);
}

console.log(`无差异维度数(zero): ${zeroDims.length}`);
console.log(`有差异维度数(keep): ${keepDims.length}`);

// 方案1a: 只保留有差异的维度
function maskedCos(a,b,mask){
  let d=0,nA=0,nB=0;
  for(const i of mask){d+=a[i]*b[i];nA+=a[i]*a[i];nB+=b[i]*b[b];}
  return d/(Math.sqrt(nA)*Math.sqrt(nB));
}

// 方案1b: 将无差异维度设为0
const zeroedVecs = {};
for(const id of Object.keys(data.vectors)){
  const v = [...data.vectors[id]];
  zeroDims.forEach(d => { v[d] = 0; });
  zeroedVecs[id]=v;
}

const gmZeroed = [group1,group2,group3,group4].map(g=>{
  const gv=g.map(id=>zeroedVecs[id]);
  return gv[0].map((_,i)=>gv.reduce((s,v)=>s+v[i],0)/gv.length);
});

console.log('--- 方案1b: 归零无差异维度 ---');
let tbZ=0,cZ=0,minZ=1;
for(let i=0;i<4;i++){for(let j=i+1;j<4;j++){const s=cos(gmZeroed[i],gmZeroed[j]);tbZ+=s;cZ++;minZ=Math.min(minZ,s);console.log(`${['默认','禁用','悬停','聚焦'][i]} vs ${['默认','禁用','悬停','聚焦'][j]}: ${s.toFixed(6}`)}}
console.log(`组间平均:${(tbZ/cZ).toFixed(6)}, 最小:${minZ.toFixed(6)}`);

// 组内
let twZ=0,cwZ=0;
[[group1,'默认'],[group2,'禁用'],[group3,'悬停'],[group4,'聚焦']].forEach(([g,name])=>{
  const gv=g.map(id=>zeroedVecs[id]);
  let ts=0,tc=0;
  for(let i=0;i<gv.length;i++)for(let j=i+1;j<gv.length;j++){ts+=cos(gv[i],gv[j]);tc++;}
  console.log(`${name} 组内: ${(ts/tc).toFixed(6)}`);
  twZ+=ts;cwZ+=tc;
});
console.log(`分离度: ${((twZ/cwZ)-(tbZ/cZ)).toFixed(6)}`);

// 方案2: 大幅降低公共维度的权重（相当于降权而非归零）
console.log('\n--- 方案2: 降低公共维度权重到 0.01x ---');
const reducedVecs = {};
for(const id of Object.keys(data.vectors)){
  const v = [...data.vectors[id]];
  zeroDims.forEach(d => { v[d] *= 0.01; }); // 公共维度降到1%
  reducedVecs[id]=v;
}

const gmReduced = [group1,group2,group3,group4].map(g=>{
  const gv=g.map(id=>reducedVecs[id]);
  return gv[0].map((_,i)=>gv.reduce((s,v)=>s+v[i],0)/gv.length);
});

tbR=0;cR=0;minR=1;
for(let i=0;i<4;i++){for(let j=i+1;j<4;j++){const s=cos(gmReduced[i],gmReduced[j]);tbR+=s;cR++;minR=Math.min(minR,s);console.log(`${['默认','禁用','悬停','聚焦'][i]} vs ${['默认','禁用','悬停','聚焦'][j]}: ${s.toFixed(6)}`)}}
console.log(`组间平均:${(tbR/cR).toFixed(6)}, 最小:${minR.toFixed(6)}`);
twR=0;cwR=0;
[[group1,'默认'],[group2,'禁用'],[group3,'悬停'],[group4,'聚焦']].forEach(([g,name])=>{
  const gv=g.map(id=>reducedVecs[id]);
  let ts=0,tc=0;
  for(let i=0;i<gv.length;i++)for(let j=i+1;j<gv.length;j++){ts+=cos(gv[i],gv[j]);tc++;}
  console.log(`${name} 组内: ${(ts/tc).toFixed(6)}`);
  twR+=ts;cwR+=tc;
});
console.log(`分离度: ${((twR/cwR)-(tbR/cR)).toFixed(6)}`);

// 方案3: 只提升差异维度的权重 + 降低公共维度
console.log('\n--- 方案3: 差异维度 x10 + 公共维度 x0.05 ---');
const hybridVecs = {};
for(const id of Object.keys(data.vectors)){
  const v = [...data.vectors[id]];
  zeroDims.forEach(d => { v[d] *= 0.05; });
  keepDims.forEach(d => { v[d] *= 10; });
  hybridVecs[id]=v;
}

const gmHybrid = [group1,group2,group3,group4].map(g=>{
  const gv=g.map(id=>hybridVecs[id]);
  return gv[0].map((_,i)=>gv.reduce((s,v)=>s+v[i],0)/gv.length);
});

tbH=0;cH=0;minH=1;
for(let i=0;i<4;i++){for(let j=i+1;j<4;j++){const s=cos(gmHybrid[i],gmHybrid[j]);tbH+=s;cH++;minH=Math.min(minH,s);console.log(`${['默认','禁用','悬停','聚焦'][i]} vs ${['默认','禁用','悬停','聚焦'][j]}: ${s.toFixed(6)}`)}}
console.log(`组间平均:${(tbH/cH).toFixed(6)}, 最小:${minH.toFixed(6)}`);
twH=0;cwH=0;
[[group1,'默认'],[group2,'禁用'],[group3,'悬停'],[group4,'聚焦']].forEach(([g,name])=>{
  const gv=g.map(id=>hybridVecs[id]);
  let ts=0,tc=0;
  for(let i=0;i<gv.length;i++)for(let j=i+1;j<gv.length;j++){ts+=cos(gv[i],gv[j]);tc++;}
  console.log(`${name} 组内: ${(ts/tc).toFixed(6)}`);
  twH+=ts;cwH+=tc;
});
console.log(`分离度: ${((twH/cwH)-(tbH/cH)).toFixed(6)}`);
