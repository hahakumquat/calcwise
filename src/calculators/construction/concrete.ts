import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const FT3 = 0.028316846592;
const YD3 = 0.764554857984;
/** Typical yield of premixed concrete bags, in cubic feet. */
const BAG_YIELD = { 40: 0.3, 60: 0.45, 80: 0.6 };

export default defineCalculator({
  slug: 'concrete',
  title: 'Concrete Calculator',
  category: 'construction',
  description: 'Work out how many cubic yards of concrete — or how many 40, 60 or 80 lb bags — you need for a slab, footing or round column.',
  keywords: ['cubic yards of concrete', 'concrete bags', 'slab calculator', 'footing', 'sonotube', 'quikrete', 'how much concrete'],
  popular: true,
  inputs: [
    {
      id: 'shape',
      label: 'Pour type',
      type: 'select',
      segmented: true,
      default: 'slab',
      info: 'Slab for patios and floors, footing for long narrow foundations, round column for post holes and Sonotubes.',
      options: [
        { value: 'slab', label: 'Slab' },
        { value: 'footing', label: 'Footing' },
        { value: 'column', label: 'Round column' },
      ],
    },
    { id: 'length', label: 'Length', type: 'number', unit: 'length', units: ['ft', 'in', 'yd', 'm', 'cm'], defaultUnit: 'ft', default: 10, min: 0, info: 'The long dimension of the slab or the total run of the footing.', showWhen: { input: 'shape', is: ['slab', 'footing'] } },
    { id: 'width', label: 'Width', type: 'number', unit: 'length', units: ['ft', 'in', 'yd', 'm', 'cm'], defaultUnit: 'ft', default: 10, min: 0, info: 'The short dimension of the slab, or how wide the footing trench is (often 16–24 in).', showWhen: { input: 'shape', is: ['slab', 'footing'] } },
    { id: 'depth', label: 'Thickness / depth', type: 'number', unit: 'length', units: ['in', 'ft', 'cm', 'm'], defaultUnit: 'in', default: 4, min: 0, info: 'How thick the pour is. 4 in is standard for patios and walks; footings are often 8–12 in deep.', showWhen: { input: 'shape', is: ['slab', 'footing'] } },
    { id: 'diameter', label: 'Diameter', type: 'number', unit: 'length', units: ['in', 'ft', 'cm', 'm'], defaultUnit: 'in', default: 12, min: 0, info: 'The inside diameter of the hole or form tube. Common Sonotube sizes are 8, 10, 12 and 16 in.', showWhen: { input: 'shape', is: 'column' } },
    { id: 'colHeight', label: 'Height / depth', type: 'number', unit: 'length', units: ['ft', 'in', 'm', 'cm'], defaultUnit: 'ft', default: 4, min: 0, info: 'How tall the column is, or how deep the post hole goes. Footings for decks usually go below the frost line.', showWhen: { input: 'shape', is: 'column' } },
    { id: 'qty', label: 'Quantity', type: 'number', default: 1, min: 1, step: 1, optional: true, info: 'Number of identical pours, such as the number of post holes.' },
    { id: 'waste', label: 'Extra for waste and spillage', type: 'number', suffix: '%', default: 10, min: 0, max: 100, optional: true, info: 'Extra concrete to cover uneven ground, form bulge and spills. 5–10% is typical.' },
  ],
  outputs: [
    { id: 'volume', label: 'Concrete needed', unit: 'volume', units: ['yd3', 'm3', 'ft3'], defaultUnit: 'yd3', precision: 2, primary: true, info: 'Total volume including waste. Ready-mix is ordered in cubic yards (US) or cubic meters.' },
    { id: 'bags80', label: '80 lb bags', format: 'integer', help: 'About 0.60 ft³ each', info: 'Number of 80 lb premix bags, each yielding about 0.60 ft³ of concrete.' },
    { id: 'bags60', label: '60 lb bags', format: 'integer', help: 'About 0.45 ft³ each', info: 'Number of 60 lb premix bags, each yielding about 0.45 ft³.' },
    { id: 'bags40', label: '40 lb bags', format: 'integer', help: 'About 0.30 ft³ each', info: 'Number of 40 lb premix bags, each yielding about 0.30 ft³.' },
  ],
  compute: (v) => {
    const qty = num(v.qty) ?? 1;
    const waste = num(v.waste) ?? 0;
    if (qty < 0 || waste < 0) return { volume: null };
    let one: number;
    if (v.shape === 'column') {
      const d = num(v.diameter);
      const h = num(v.colHeight);
      if (d === null || h === null || d < 0 || h < 0) return { volume: null, error: 'Enter the column diameter and height.' };
      one = Math.PI * (d / 2) ** 2 * h;
    } else {
      const L = num(v.length);
      const W = num(v.width);
      const D = num(v.depth);
      if (L === null || W === null || D === null || L < 0 || W < 0 || D < 0) return { volume: null, error: 'Enter the length, width and thickness.' };
      one = L * W * D;
    }
    const volume = one * qty * (1 + waste / 100);
    const ft3 = volume / FT3;
    const bags80 = ceilSafe(ft3 / BAG_YIELD[80]);
    const bags60 = ceilSafe(ft3 / BAG_YIELD[60]);
    const bags40 = ceilSafe(ft3 / BAG_YIELD[40]);
    return {
      volume,
      bags80,
      bags60,
      bags40,
      chart: {
        type: 'bar',
        title: 'Bags needed by bag size',
        categories: ['80 lb', '60 lb', '40 lb'],
        series: [{ name: 'Bags', values: [bags80, bags60, bags40] }],
        format: { format: 'integer', suffix: 'bags' },
      },
      note: volume / YD3 >= 1 ? 'Over a cubic yard: ready-mix delivery is usually cheaper and easier than mixing bags.' : undefined,
      steps: [
        `One pour = ${(one / FT3).toFixed(3)} ft³`,
        `× ${qty} × (1 + ${waste}%) = ${ft3.toFixed(2)} ft³ = ${(volume / YD3).toFixed(3)} yd³ = ${volume.toFixed(3)} m³`,
        `80 lb bags = ${ft3.toFixed(2)} ÷ 0.60 → ${bags80}`,
      ],
    };
  },
  content: {
    formula: ['Slab / footing: V = length × width × thickness', 'Round column: V = π × (diameter ÷ 2)² × height', '1 yd³ = 27 ft³ = 0.7646 m³', 'Bags = V (ft³) ÷ bag yield, rounded up'],
    body: [
      'Concrete is ordered by volume — cubic yards in the US, cubic metres elsewhere. Multiply the three dimensions in the same unit and convert: a 10 × 10 ft patio slab 4 inches thick is 10 × 10 × ⅓ = 33.3 ft³, or about 1.23 yd³.',
      'Always order a little extra. Uneven sub-grade, form bulges and spillage easily eat 5–10%, and running short in the middle of a pour leaves a weak cold joint. The waste box adds that margin before bags are counted.',
      'Premixed bags yield roughly 0.30 ft³ (40 lb), 0.45 ft³ (60 lb) and 0.60 ft³ (80 lb) of placed concrete; check the bag for the exact figure. For anything over about a cubic yard, a ready-mix truck is usually cheaper and far less work than mixing 45+ bags by hand.',
    ],
    faq: [
      { q: 'How thick should a concrete slab be?', a: 'Four inches is standard for patios, walkways and shed floors. Driveways and garage floors carrying cars are usually 4–6 inches, and heavier loads need an engineer’s spec.' },
      { q: 'How many 80 lb bags make a cubic yard?', a: 'About 45, because a cubic yard is 27 ft³ and each bag yields about 0.6 ft³.' },
      { q: 'What about a footing?', a: 'A continuous footing is just a long, narrow slab: enter its length, width and depth. For round post holes or Sonotubes, use the column option.' },
    ],
  },
  related: ['gravel', 'square-footage', 'volume-converter', 'mulch'],
  examples: [
    // 10 × 10 ft × 4 in = 33.333 ft³ = 1.2346 yd³ = 0.943894877 m³
    { values: { shape: 'slab', length: 3.048, width: 3.048, depth: 0.1016, diameter: null, colHeight: null, qty: 1, waste: 0 }, expect: { volume: 0.9438948775, bags80: 56, bags60: 75, bags40: 112 }, tolerance: 1e-8 },
    // 12 in diameter × 10 ft column = 7.854 ft³ → 14 × 80 lb bags
    { values: { shape: 'column', length: null, width: null, depth: null, diameter: 0.3048, colHeight: 3.048, qty: 1, waste: 0 }, expect: { bags80: 14, bags40: 27 } },
  ],
});
