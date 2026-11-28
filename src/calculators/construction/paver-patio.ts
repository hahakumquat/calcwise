import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'paver-patio',
  title: 'Paver Patio Calculator',
  category: 'construction',
  description: 'Estimate how many pavers, and how much base gravel and sand, a patio needs from its size, paver size, joint gap, waste and layer depths.',
  keywords: ['paver calculator', 'paver patio calculator', 'how many pavers do i need', 'paver base calculator', 'paver sand calculator', 'patio pavers'],
  updated: '2026-11-28',
  inputs: [
    { id: 'len', label: 'Patio length', type: 'number', suffix: 'ft', default: 12, min: 0, step: 0.5, info: 'The longer side of the patio in feet.' },
    { id: 'wid', label: 'Patio width', type: 'number', suffix: 'ft', default: 10, min: 0, step: 0.5, info: 'The shorter side of the patio in feet.' },
    { id: 'pl', label: 'Paver length', type: 'number', suffix: 'in', default: 9, min: 0, step: 0.25, info: 'Length of one paver in inches, from the product label.' },
    { id: 'pw', label: 'Paver width', type: 'number', suffix: 'in', default: 6, min: 0, step: 0.25, info: 'Width of one paver in inches.' },
    { id: 'gap', label: 'Joint gap', type: 'number', suffix: 'in', default: 0.125, min: 0, step: 0.0625, info: 'Space between pavers, filled with sand. 1/8 inch is 0.125. Use 0 for tight-fitting pavers.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'Extra pavers for cuts and breakage. 5% to 10% is common for simple layouts, more for curves or patterns.' },
    { id: 'baseDepth', label: 'Gravel base depth', type: 'number', suffix: 'in', default: 4, min: 0, step: 0.5, info: 'Compacted gravel layer under the pavers. It depends on soil and use: patios often use about 4 inches, driveways more.' },
    { id: 'sandDepth', label: 'Bedding sand depth', type: 'number', suffix: 'in', default: 1, min: 0, step: 0.25, info: 'Leveling sand layer between the base and the pavers. About 1 inch is typical.' },
  ],
  outputs: [
    { id: 'pavers', label: 'Pavers to buy (with waste)', format: 'integer', primary: true, info: 'Patio area ÷ paver footprint, plus the waste allowance, rounded up.' },
    { id: 'paversNet', label: 'Pavers without waste', format: 'integer', info: 'Patio area ÷ paver footprint, rounded up.' },
    { id: 'area', label: 'Patio area', format: 'number', precision: 1, suffix: 'sq ft', info: 'Length × width.' },
    { id: 'baseYd', label: 'Base gravel', format: 'number', precision: 2, suffix: 'cu yd', info: 'Area × base depth ÷ 12 gives cubic feet; ÷ 27 gives cubic yards.' },
    { id: 'baseFt', label: 'Base gravel (cubic feet)', format: 'number', precision: 1, suffix: 'cu ft', info: 'Area × base depth ÷ 12.' },
    { id: 'sandYd', label: 'Bedding sand', format: 'number', precision: 2, suffix: 'cu yd', info: 'Area × sand depth ÷ 12 ÷ 27.' },
    { id: 'sandFt', label: 'Bedding sand (cubic feet)', format: 'number', precision: 1, suffix: 'cu ft', info: 'Area × sand depth ÷ 12.' },
  ],
  compute: (v) => {
    const L = num(v.len), W = num(v.wid), pl = num(v.pl), pw = num(v.pw);
    const gap = num(v.gap), waste = num(v.waste), bd = num(v.baseDepth), sd = num(v.sandDepth);
    if (L === null || W === null || pl === null || pw === null || gap === null || waste === null || bd === null || sd === null) return { pavers: null };
    if (L <= 0 || W <= 0 || pl <= 0 || pw <= 0) return { pavers: null, error: 'Patio and paver dimensions must be greater than zero.' };
    if (gap < 0 || waste < 0 || bd < 0 || sd < 0) return { pavers: null, error: 'Joint gap, waste and depths cannot be negative.' };
    const area = L * W;
    const foot = ((pl + gap) * (pw + gap)) / 144;
    const raw = area / foot;
    const paversNet = Math.ceil(raw - 1e-9);
    const pavers = Math.ceil(raw * (1 + waste / 100) - 1e-9);
    const baseFt = (area * bd) / 12;
    const sandFt = (area * sd) / 12;
    const baseYd = baseFt / 27;
    const sandYd = sandFt / 27;
    return {
      pavers, paversNet, area, baseYd, baseFt, sandYd, sandFt,
      tone: 'ok',
      badge: `${pavers.toLocaleString('en-US')} pavers, ${fmt(baseYd)} cu yd base`,
      chart: {
        type: 'bar',
        title: 'Material volumes (cubic feet)',
        categories: ['Base gravel', 'Bedding sand'],
        series: [{ name: 'Volume', values: [baseFt, sandFt] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Area = ${fmt(L)} × ${fmt(W)} = ${fmt(area)} sq ft`,
        `Paver footprint = (${fmt(pl)} + ${fmt(gap, 4)}) × (${fmt(pw)} + ${fmt(gap, 4)}) ÷ 144 = ${fmt(foot, 4)} sq ft`,
        `Pavers = ${fmt(area)} ÷ ${fmt(foot, 4)} = ${fmt(raw, 1)}, so ${paversNet}; with ${fmt(waste)}% waste, ${pavers}`,
        `Base = ${fmt(area)} × ${fmt(bd)} ÷ 12 = ${fmt(baseFt)} cu ft = ${fmt(baseYd)} cu yd`,
        `Sand = ${fmt(area)} × ${fmt(sd)} ÷ 12 = ${fmt(sandFt)} cu ft = ${fmt(sandYd)} cu yd`,
      ],
      note: 'Base depth depends on your soil and how the patio will be used. Gravel compacts, so order a little extra. Local codes, frost depth and drainage rules may apply, so check them before you dig. Joint sand and edge restraints are not included.',
    };
  },
  content: {
    formula: [
      'Area = length × width',
      'Paver footprint = (paver length + gap) × (paver width + gap) ÷ 144 sq ft',
      'Pavers = area ÷ footprint × (1 + waste), rounded up',
      'Base or sand in cu ft = area × depth in inches ÷ 12; cu yd = cu ft ÷ 27',
    ],
    body: [
      'A paver patio has three things to buy: the pavers, a compacted gravel base, and a thin layer of bedding sand. This calculator works out all three from the patio size, the paver size, the joint gap, a waste allowance and the depth of each layer.',
      'The paver count divides the patio area by the footprint of one paver including its joint gap, then adds the waste allowance for cuts and breakage. Pavers are rounded up to whole units.',
      'Base depth depends on soil and use. Gravel compacts, so order a little extra. Local codes and frost conditions can change what is required.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A 12 × 10 ft patio is 120 sq ft. With 6 × 9 in pavers and no gap, each covers 0.375 sq ft, so 320 pavers, or 352 with 10% waste. A 4 in base is 120 × 4 ÷ 12 = 40 cu ft = 1.48 cu yd, and 1 in of sand is 10 cu ft = 0.37 cu yd.' },
      { q: 'How much waste should I allow?', a: 'About 5% to 10% for a simple layout and more for curves, diagonals or patterns. The default here is 10% and you can edit it.' },
      { q: 'How deep should the gravel base be?', a: 'It depends on your soil and the load. About 4 inches is common for a patio, and driveways need more. Follow your paver manufacturer and local guidance.' },
      { q: 'Why does the joint gap matter?', a: 'Each joint adds to the area one paver takes up, so a gap lowers the paver count slightly. At 1/8 inch (0.125) on 6 × 9 in pavers, the same 120 sq ft needs 310 pavers instead of 320, before waste.' },
    ],
    sources: [],
  },
  related: ['gravel', 'square-footage', 'concrete', 'tile'],
  examples: [
    // area 120; footprint 6*9/144=0.375; 120/0.375=320; *1.1=352; base 120*4/12=40 cu ft=1.481481 cu yd; sand 10 cu ft=0.370370 cu yd
    { values: { len: 12, wid: 10, pl: 9, pw: 6, gap: 0, waste: 10, baseDepth: 4, sandDepth: 1 }, expect: { pavers: 352, paversNet: 320, area: 120, baseFt: 40, baseYd: 1.481481, sandFt: 10, sandYd: 0.37037 }, tolerance: 1e-4 },
    // gap 0.125: footprint 6.125*9.125/144=0.388129; 120/0.388129=309.18 -> 310; *1.1=340.10 -> 341
    { values: { len: 12, wid: 10, pl: 9, pw: 6, gap: 0.125, waste: 10, baseDepth: 4, sandDepth: 1 }, expect: { pavers: 341, paversNet: 310 }, tolerance: 1e-6 },
  ],
});
