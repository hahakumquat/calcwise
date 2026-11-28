import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const LB_PER_FT: Record<string, number> = { '3': 0.376, '4': 0.668, '5': 1.043 };

export default defineCalculator({
  slug: 'rebar-slab-grid',
  title: 'Rebar Grid Calculator for a Concrete Slab',
  category: 'construction',
  description: 'Count the rebar bars, total feet, 20 ft sticks to buy and weight for one layer of a slab grid, from slab size, bar spacing, edge cover, bar size and waste.',
  keywords: ['rebar calculator', 'rebar grid calculator', 'how much rebar for a slab', 'rebar spacing 16 inches on center', 'rebar weight calculator', 'rebar sticks needed'],
  updated: '2026-11-28',
  inputs: [
    { id: 'length', label: 'Slab length', type: 'number', suffix: 'ft', default: 20, min: 0, step: 0.5, info: 'Longest side of the slab, in feet.' },
    { id: 'width', label: 'Slab width', type: 'number', suffix: 'ft', default: 10, min: 0, step: 0.5, info: 'Shorter side of the slab, in feet.' },
    { id: 'spacing', label: 'Bar spacing (on center)', type: 'number', suffix: 'in', default: 16, min: 1, step: 1, info: 'Distance between bar centres, in inches. Use what your plan or local code requires.' },
    { id: 'cover', label: 'Edge cover', type: 'number', suffix: 'in', default: 3, min: 0, step: 0.5, info: 'Gap between the slab edge and the end of each bar, in inches.' },
    { id: 'size', label: 'Bar size', type: 'select', default: '4', options: [{ value: '3', label: '#3 (3/8 in)' }, { value: '4', label: '#4 (1/2 in)' }, { value: '5', label: '#5 (5/8 in)' }], info: 'Rebar size. Weight per foot: #3 0.376 lb, #4 0.668 lb, #5 1.043 lb.' },
    { id: 'stick', label: 'Stick length', type: 'number', suffix: 'ft', default: 20, min: 1, step: 1, info: 'Length of the rebar sticks you buy. 20 ft is common.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'Extra for cuts, laps and mistakes. 10 percent is a common allowance.' },
  ],
  outputs: [
    { id: 'sticks', label: 'Sticks to buy', format: 'integer', primary: true, info: 'Total feet with waste divided by stick length, rounded up.' },
    { id: 'totalFt', label: 'Total bar length', format: 'number', precision: 1, suffix: 'ft', info: 'Sum of all bars in both directions, before waste.' },
    { id: 'withWaste', label: 'Length with waste', format: 'number', precision: 2, suffix: 'ft', info: 'Total bar length times (1 + waste %).' },
    { id: 'barsLen', label: 'Bars along the length', format: 'integer', info: 'Bars running parallel to the slab length.' },
    { id: 'barsWid', label: 'Bars across', format: 'integer', info: 'Bars running parallel to the slab width.' },
    { id: 'weight', label: 'Weight (before waste)', format: 'number', precision: 1, suffix: 'lb', info: 'Total bar length times pounds per foot.' },
  ],
  compute: (v) => {
    const L = num(v.length), W = num(v.width), sp = num(v.spacing), cov = num(v.cover) ?? 0;
    const st = num(v.stick), waste = num(v.waste) ?? 0;
    const lb = LB_PER_FT[String(v.size)];
    if (L === null || W === null || sp === null || st === null) return { sticks: null };
    if (L <= 0 || W <= 0 || sp <= 0 || st <= 0) return { sticks: null, error: 'Slab size, bar spacing and stick length must be greater than zero.' };
    if (cov < 0 || waste < 0) return { sticks: null, error: 'Cover and waste cannot be negative.' };
    if (!lb) return { sticks: null };
    const c = cov / 12;
    if (L - 2 * c <= 0 || W - 2 * c <= 0) return { sticks: null, error: 'Edge cover is too large for this slab.' };
    const barsLen = Math.floor((W * 12 - 2 * cov) / sp + 1e-9) + 1;
    const barsWid = Math.floor((L * 12 - 2 * cov) / sp + 1e-9) + 1;
    const eachLen = L - 2 * c;
    const eachWid = W - 2 * c;
    const lenFt = barsLen * eachLen;
    const widFt = barsWid * eachWid;
    const totalFt = lenFt + widFt;
    const withWaste = totalFt * (1 + waste / 100);
    const sticks = ceilSafe(withWaste / st);
    const weight = totalFt * lb;
    const r2 = (n: number) => +n.toFixed(2);
    return {
      sticks, totalFt, withWaste, barsLen, barsWid, weight,
      chart: {
        type: 'bar',
        title: 'Bar length by direction (ft)',
        categories: ['Along length', 'Across'],
        series: [{ name: 'Feet', values: [r2(lenFt), r2(widFt)] }],
        format: { format: 'number', suffix: ' ft' },
      },
      tone: 'ok',
      badge: `${sticks} × ${st} ft sticks`,
      note: 'This counts one layer only. Lap splices, chairs or supports, and the spacing and bar size your plan or local code requires are for you to check. Confirm with your building office or engineer.',
      steps: [
        `Bars along length = floor((${W} × 12 − 2 × ${cov}) ÷ ${sp}) + 1 = ${barsLen}, each ${r2(eachLen)} ft = ${r2(lenFt)} ft`,
        `Bars across = floor((${L} × 12 − 2 × ${cov}) ÷ ${sp}) + 1 = ${barsWid}, each ${r2(eachWid)} ft = ${r2(widFt)} ft`,
        `Total = ${r2(totalFt)} ft; with ${waste}% waste = ${r2(withWaste)} ft`,
        `Sticks = ceil(${r2(withWaste)} ÷ ${st}) = ${sticks}`,
        `Weight = ${r2(totalFt)} × ${lb} lb/ft = ${r2(weight)} lb`,
      ],
    };
  },
  content: {
    formula: [
      'Bars along the length = floor((width × 12 − 2 × cover) ÷ spacing) + 1, each length − 2 × cover ÷ 12 ft',
      'Bars across = floor((length × 12 − 2 × cover) ÷ spacing) + 1, each width − 2 × cover ÷ 12 ft',
      'Total feet = sum of both directions',
      'Sticks = ceil(total feet × (1 + waste % ÷ 100) ÷ stick length)',
      'Weight = total feet × pounds per foot (#3 0.376, #4 0.668, #5 1.043)',
    ],
    body: [
      'A slab reinforcing grid is a set of bars running one way crossed by a set running the other. Bars are placed at a set spacing, measured centre to centre, and kept back from the edge by a cover distance. Count the bars in each direction, multiply by the length of each bar, and add the two directions together.',
      'Because sticks are sold in fixed lengths, the calculator adds a waste allowance for cuts and laps, then rounds up to whole sticks. It also gives the weight, which helps if rebar is priced by the pound or you need to know what you are carrying.',
      'This is a one-layer estimate. Lap splices where bars overlap, chairs to hold the grid off the ground, and the spacing and bar size the plan or local code requires are your check. When in doubt, ask your building office or an engineer.',
    ],
    faq: [
      { q: 'How much rebar is in a 20 ft by 10 ft slab at 16 in spacing?', a: 'With 3 in cover and #4 bar, there are 8 bars along the length at 19.5 ft each (156 ft) and 15 bars across at 9.5 ft each (142.5 ft). That is 298.5 ft in total.' },
      { q: 'How many 20 ft sticks is that?', a: 'With 10 percent waste the length is 328.35 ft, which needs 17 sticks of 20 ft.' },
      { q: 'How much does it weigh?', a: '#4 rebar weighs 0.668 lb per foot, so 298.5 ft weighs about 199.4 lb before waste.' },
      { q: 'Does this include lap splices and chairs?', a: 'No. It counts one layer. Lap lengths, chairs and spacing depend on your plan and local code, so check those separately.' },
      { q: 'What spacing should I use?', a: 'Use what your plan or local code requires. 16 in on center is a common starting point but is not a rule for every slab.' },
    ],
    sources: [],
  },
  related: ['concrete', 'gravel'],
  examples: [
    // barsLen floor(114/16=7.125)+1 = 8 x 19.5 = 156; barsWid floor(234/16=14.625)+1 = 15 x 9.5 = 142.5; total 298.5; *1.1 = 328.35; /20 = 16.4 -> 17; weight 298.5*0.668 = 199.398
    { values: { length: 20, width: 10, spacing: 16, cover: 3, size: '4', stick: 20, waste: 10 }, expect: { sticks: 17, totalFt: 298.5, withWaste: 328.35, barsLen: 8, barsWid: 15, weight: 199.398 }, tolerance: 1e-3 },
    // 10 x 10, 12 in, 0 cover, #3, 10 ft sticks, 0 waste: 11 bars x 10 = 110 each way = 220 ft; 22 sticks; weight 220*0.376 = 82.72
    { values: { length: 10, width: 10, spacing: 12, cover: 0, size: '3', stick: 10, waste: 0 }, expect: { sticks: 22, totalFt: 220, barsLen: 11, barsWid: 11, weight: 82.72 }, tolerance: 1e-3 },
  ],
});
