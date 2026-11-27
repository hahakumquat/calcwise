import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;

export default defineCalculator({
  slug: 'tree-light-strands',
  title: 'Christmas Tree Light Strands Calculator',
  category: 'everyday',
  description: 'How many light sets for your Christmas tree? Enter height, base width and strand spacing to get strands, total feet of lights and sets to buy.',
  keywords: ['how many christmas lights for a tree', 'christmas tree light calculator', 'how many strands of lights for 7 foot tree', 'tree lights per foot', 'how many light sets for christmas tree', 'christmas tree lighting length'],
  updated: '2026-11-27',
  popular: false,
  inputs: [
    { id: 'height', label: 'Tree height', type: 'number', default: 84, min: 1, step: 1, suffix: 'in', info: 'Top to bottom in inches. A 7 ft tree is 84 in.' },
    { id: 'base', label: 'Width across the base', type: 'number', default: 48, min: 1, step: 1, suffix: 'in', info: 'Diameter of the lowest branches in inches.' },
    { id: 'spacing', label: 'Gap between strands at the base', type: 'number', default: 6, min: 0.5, step: 0.5, suffix: 'in', info: 'Distance around the bottom from one vertical strand to the next. Smaller gaps look fuller.' },
    { id: 'setLength', label: 'Length of one light set', type: 'number', default: 17, min: 1, step: 1, suffix: 'ft', info: 'Lit length printed on the box, in feet. Do not count the plug-end lead wire.' },
  ],
  outputs: [
    { id: 'sets', label: 'Light sets to buy', format: 'integer', primary: true, info: 'Total length divided by one set, rounded up.' },
    { id: 'strands', label: 'Vertical strands', format: 'integer', info: 'Circumference of the base divided by the gap, rounded up.' },
    { id: 'feet', label: 'Total length needed', precision: 1, suffix: 'ft', info: 'Strands times the slant length of the tree.' },
    { id: 'slant', label: 'Slant length of one strand', precision: 1, suffix: 'in', info: 'Square root of height squared plus half the base squared.' },
    { id: 'spare', label: 'Spare light length', precision: 1, suffix: 'ft', info: 'Length in the sets you buy beyond what the tree needs.' },
  ],
  compute: (v) => {
    const h = num(v.height);
    const d = num(v.base);
    const gap = num(v.spacing);
    const set = num(v.setLength);
    if (h === null || d === null || gap === null || set === null) return { sets: null };
    if (h <= 0 || d <= 0 || gap <= 0 || set <= 0) return { sets: null, error: 'Enter values above zero for every field.' };

    const strands = Math.ceil((Math.PI * d) / gap - 1e-9);
    const slant = Math.sqrt(h * h + (d / 2) * (d / 2));
    const inches = strands * slant;
    const feet = inches / 12;
    const sets = Math.ceil(feet / set - 1e-9);
    const spare = sets * set - feet;
    return {
      sets,
      strands,
      feet,
      slant,
      spare,
      tone: 'ok' as const,
      badge: `${strands} strands, ${r1(feet)} ft`,
      note: `Strands run from the top down to the base, ${strands} of them about ${r1(slant)} in long, for ${r1(feet)} ft in total. That needs ${sets} set${sets === 1 ? '' : 's'} of ${set} ft. Real trees are denser near the top where branches are closer together, and a gap for the trunk is ignored, so treat this as a planning estimate.`,
      chart: {
        type: 'bar',
        title: 'Lights needed vs bought (ft)',
        categories: ['Needed', 'In sets bought'],
        series: [{ name: 'Feet', values: [feet, sets * set] }],
        format: { format: 'number' },
        highlight: 0,
      },
      steps: [
        `Strands = ⌈π × ${d} ÷ ${gap}⌉ = ⌈${r2((Math.PI * d) / gap)}⌉ = ${strands}`,
        `Slant = √(${h}² + (${d} ÷ 2)²) = ${r2(slant)} in`,
        `Total = ${strands} × ${r2(slant)} in = ${r1(inches)} in = ${r1(feet)} ft`,
        `Sets = ⌈${r1(feet)} ÷ ${set}⌉ = ${sets}`,
      ],
    };
  },
  content: {
    formula: [
      'Strands = ⌈π × base diameter ÷ gap at the base⌉',
      'Slant = √(height² + (base diameter ÷ 2)²)',
      'Total length = strands × slant',
      'Sets = ⌈total length ÷ length of one set⌉',
    ],
    body: [
      'This calculator plans lights that run straight down the tree from the top to the base, like the ribs of an umbrella. Strands are spaced evenly around the bottom, so the number of strands is the distance around the base divided by the gap you want between them, rounded up. Each strand is as long as the slant from the tip to the edge of the base.',
      'The gap is your choice. The 6 inch default is a starting point, not a standard: a smaller gap looks fuller and needs more strands, and a wider one looks lighter. Branches bunch together near the top, so the lights will look denser there than at the bottom.',
      'The result ignores the trunk gap and any wrapping in and out of the branches. Wrapping around the branches rather than straight down uses more wire, so buy an extra set if you like a very full look. Check the box for the lit length of a set, and plan around the maximum number of sets you can safely connect end to end as printed on the packaging. For the electricity side, see the Christmas lights cost calculator.',
    ],
    faq: [
      { q: 'How many Christmas lights do I need for a 7 foot tree?', a: 'For an 84 in tree with a 48 in base, 6 in gaps and 17 ft sets, you need 26 vertical strands about 87.4 in long. That is 189.3 ft in total, so 12 sets.' },
      { q: 'How is the number of strands worked out?', a: 'The distance around the base (π × diameter) divided by the gap, rounded up. For a 48 in base and 6 in gaps, that is 150.8 ÷ 6 = 25.13, so 26 strands.' },
      { q: 'Does it include wrapping the lights around branches?', a: 'No. It assumes each strand runs straight from top to bottom. Weaving along the branches takes more length, so add a set if you want that look.' },
      { q: 'Why is the top denser than the bottom?', a: 'All the strands meet at the tip and spread out toward the base, so they are closer together near the top.' },
      { q: 'Can I use feet for the tree size?', a: 'Enter inches. Multiply feet by 12, so a 6.5 ft tree is 78 in.' },
    ],
    sources: [],
  },
  related: ['holiday-lights', 'christmas-tree-cost', 'wrapping-paper', 'holiday-spending-total'],
  examples: [
    // pi x 48 / 6 = 25.13 -> 26 strands; slant sqrt(84^2 + 24^2) = sqrt(7632) = 87.3613; 26 x 87.3613 = 2271.39 in = 189.28 ft; 189.28 / 17 = 11.13 -> 12 sets; spare 204 - 189.28 = 14.72
    { values: { height: 84, base: 48, spacing: 6, setLength: 17 }, expect: { strands: 26, slant: 87.3613, feet: 189.2823, sets: 12, spare: 14.7177 }, tolerance: 1e-3 },
    // pi x 36 / 4 = 28.27 -> 29; slant sqrt(72^2 + 18^2) = sqrt(5508) = 74.2158; 29 x 74.2158 = 2152.26 in = 179.355 ft; / 25 = 7.17 -> 8 sets
    { values: { height: 72, base: 36, spacing: 4, setLength: 25 }, expect: { strands: 29, slant: 74.2158, sets: 8 }, tolerance: 1e-3 },
    // pi x 60 / 8 = 23.56 -> 24; slant sqrt(120^2 + 30^2) = sqrt(15300) = 123.6932; 24 x 123.6932 = 2968.64 in = 247.39 ft; / 50 = 4.95 -> 5 sets
    { values: { height: 120, base: 60, spacing: 8, setLength: 50 }, expect: { strands: 24, slant: 123.6932, sets: 5 }, tolerance: 1e-3 },
  ],
});
