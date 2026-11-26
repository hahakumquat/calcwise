import { defineCalculator, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

// Water weighs 62.4 lb/ft3; one inch of water over one ft2 is 62.4 / 12 = 5.2 lb.
const LB_PER_FT2_PER_IN = 5.2;

export default defineCalculator({
  slug: 'snow-water-equivalent',
  title: 'Snow Depth to Water and Weight',
  category: 'everyday',
  description: 'Turn snow depth into inches of water and pounds per square foot, and total weight over an area. Set the snow-to-liquid ratio for wet or powder snow.',
  keywords: ['snow water equivalent calculator', 'snow depth to water', 'how much does snow weigh', 'snow to liquid ratio', 'weight of snow per square foot', 'snow load estimate'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'depth', label: 'Snow depth', type: 'number', default: 12, min: 0, step: 1, suffix: 'in', info: 'Depth of snow on the surface, in inches.' },
    { id: 'ratio', label: 'Snow-to-liquid ratio', type: 'number', default: 10, min: 1, max: 50, step: 1, suffix: ': 1', info: 'Inches of snow that melt to 1 inch of water. 10 is a common rule of thumb. Wet, heavy snow is nearer 5 to 8, dry powder 15 or more.' },
    { id: 'area', label: 'Area (optional)', type: 'number', default: 1000, min: 0, step: 50, suffix: 'ft²', info: 'Surface area, such as a roof or deck, in square feet. Leave blank or 0 to skip the total weight.' },
  ],
  outputs: [
    { id: 'water', label: 'Water in the snow', format: 'number', precision: 2, suffix: 'in', primary: true, info: 'Snow depth ÷ snow-to-liquid ratio.' },
    { id: 'load', label: 'Weight per square foot', format: 'number', precision: 2, suffix: 'lb/ft²', info: 'Inches of water × 5.2 lb/ft² (62.4 lb/ft³ ÷ 12).' },
    { id: 'total', label: 'Total weight over the area', format: 'number', precision: 0, suffix: 'lb', info: 'Weight per square foot × area. Shown only when an area is entered.' },
  ],
  compute: (v) => {
    const depth = num(v.depth);
    const ratio = num(v.ratio);
    const area = num(v.area) ?? 0;
    if (depth === null || ratio === null || depth < 0 || ratio < 1 || area < 0) return { water: null };
    const water = depth / ratio;
    const load = water * LB_PER_FT2_PER_IN;
    const steps = [
      `Water = ${fmt(depth)} in ÷ ${fmt(ratio)} = ${fmt(water)} in`,
      `Weight per ft² = ${fmt(water)} × 5.2 = ${fmt(load)} lb/ft²`,
    ];
    const maxDepth = Math.max(depth, 1) * 1.5;
    const xs = Array.from({ length: 13 }, (_, i) => +((maxDepth * i) / 12).toFixed(2));
    const chart = {
      type: 'line' as const,
      title: `Weight per square foot at ${fmt(ratio, 0)}:1`,
      x: xs,
      xLabel: 'Snow depth (in)',
      yFormat: { format: 'number' as const },
      series: [{ name: 'lb/ft²', values: xs.map((d) => (d / ratio) * LB_PER_FT2_PER_IN) }],
    };
    const caveat = 'This is a rough estimate of the snow\'s weight, not structural advice. It does not check what a roof can carry.';
    const out: ComputeResult = {
      water,
      load,
      tone: 'ok',
      badge: `${fmt(load)} lb per square foot`,
      chart,
      steps,
    };
    if (area > 0) {
      const total = load * area;
      steps.push(`Total = ${fmt(load)} lb/ft² × ${fmt(area, 0)} ft² = ${fmt(total, 0)} lb`);
      out.total = total;
      out.note = `${fmt(depth)} in of snow at ${fmt(ratio, 0)}:1 holds ${fmt(water)} in of water, about ${fmt(load)} lb on every square foot and ${fmt(total, 0)} lb over ${fmt(area, 0)} ft². ${caveat}`;
    } else {
      out.note = `${fmt(depth)} in of snow at ${fmt(ratio, 0)}:1 holds ${fmt(water)} in of water, about ${fmt(load)} lb on every square foot. ${caveat}`;
    }
    return out;
  },
  content: {
    formula: [
      'Water (in) = snow depth (in) ÷ snow-to-liquid ratio',
      'Weight per ft² (lb) = water (in) × 5.2, because water is 62.4 lb/ft³ and 62.4 ÷ 12 = 5.2',
      'Total weight (lb) = weight per ft² × area (ft²)',
    ],
    body: [
      'Snow is mostly air, so its depth says little about its weight. What counts is the water it holds, called snow water equivalent. The snow-to-liquid ratio links the two: at 10:1, ten inches of snow melt to one inch of water. This calculator converts depth to water, then to pounds per square foot, and, if you give an area, to a total weight.',
      'Example: 12 in of snow at 10:1 holds 12 ÷ 10 = 1.2 in of water. At 5.2 lb per square foot for each inch of water, that is 1.2 × 5.2 = 6.24 lb/ft², or 6,240 lb over 1,000 ft². Fluffy snow at 15:1 and 6 in deep holds only 6 ÷ 15 = 0.4 in of water, about 2.08 lb/ft².',
      'The ratio matters a lot. Dry powder can be 15:1 or higher, while wet, heavy snow, or snow packed down by rain, can be 5:1 to 8:1 and weigh two or three times as much for the same depth. Measure a real sample if you can: melt a known depth of snow and measure the water. The 10:1 default is only a rule of thumb.',
      'This is an estimate of the snow\'s weight only. It is not structural advice. It does not compute what any roof, deck or structure can safely carry, and it ignores drifting, sliding, ice and rain on snow. If you are worried about a roof, ask a qualified structural engineer or your local building authority. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does snow weigh per square foot?', a: 'It depends on the water it holds. Each inch of water weighs 5.2 lb per square foot. At the common 10:1 ratio, 12 inches of snow holds 1.2 in of water, so 6.24 lb/ft².' },
      { q: 'What is the snow-to-liquid ratio?', a: 'It is how many inches of snow melt to one inch of water. 10:1 is a rule of thumb. Wet snow is nearer 5:1 to 8:1 and dry powder 15:1 or more, so the same depth can weigh very different amounts.' },
      { q: 'How do I convert snow depth to water?', a: 'Divide the depth by the ratio. For 6 in at 15:1, 6 ÷ 15 = 0.4 in of water. Multiply by 5.2 to get pounds per square foot, here 2.08.' },
      { q: 'How much does the snow on my roof weigh in total?', a: 'Multiply pounds per square foot by the area. For 12 in at 10:1 over 1,000 ft², 6.24 × 1,000 = 6,240 lb. Leave the area blank to skip this.' },
      { q: 'Can this tell me if my roof is safe?', a: 'No. It is not structural advice and does not compute roof load capacity. It only estimates the snow\'s weight. For safety questions about a roof, ask a qualified structural engineer or your local building authority.' },
    ],
    sources: [],
  },
  related: ['snow-removal-payback', 'ice-melt-coverage', 'heating-cost'],
  examples: [
    // water 12/10 = 1.2; load 1.2*5.2 = 6.24; total 6.24*1000 = 6240
    { values: { depth: 12, ratio: 10, area: 1000 }, expect: { water: 1.2, load: 6.24, total: 6240 } },
    // water 6/15 = 0.4; load 0.4*5.2 = 2.08; no area -> no total
    { values: { depth: 6, ratio: 15, area: 0 }, expect: { water: 0.4, load: 2.08 } },
  ],
});
