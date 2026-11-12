import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const YD3 = 0.764554857984;

export default defineCalculator({
  slug: 'mulch',
  title: 'Mulch Calculator',
  category: 'construction',
  description: 'Find how many cubic yards or bags of mulch, compost or topsoil you need to cover a garden bed to a given depth.',
  keywords: ['cubic yards of mulch', 'bags of mulch', 'topsoil', 'compost', 'landscaping', 'garden bed'],
  inputs: [
    { id: 'area', label: 'Bed area', type: 'number', unit: 'area', units: ['ft2', 'm2', 'yd2'], defaultUnit: 'ft2', default: 200, min: 0, info: 'The area of the bed to cover. Approximate odd shapes with rectangles and circles.' },
    { id: 'depth', label: 'Depth', type: 'number', unit: 'length', units: ['in', 'cm', 'ft'], defaultUnit: 'in', default: 3, min: 0, info: 'How thick the layer should be. 2–3 in for new mulch beds, about 1 in to top up.' },
    { id: 'bag', label: 'Bag size', type: 'number', unit: 'volume', units: ['ft3', 'l', 'yd3'], defaultUnit: 'ft3', default: 2, min: 0, help: 'Most US bags hold 2 or 3 ft³.', info: 'Volume of one bag, printed on the bag. US mulch bags are usually 2 or 3 ft³.' },
    { id: 'pricePerBag', label: 'Price per bag', type: 'number', prefix: '$', min: 0, step: 0.01, optional: true, placeholder: 'Optional', info: 'Price of one bag, to estimate the cost of buying bagged mulch.' },
  ],
  outputs: [
    { id: 'volume', label: 'Mulch needed', unit: 'volume', units: ['yd3', 'ft3', 'm3', 'l'], defaultUnit: 'yd3', precision: 2, primary: true, info: 'Total volume of material: area × depth. Bulk mulch is sold by the cubic yard.' },
    { id: 'bags', label: 'Bags', format: 'integer', info: 'Number of bags of the chosen size, rounded up.' },
    { id: 'cost', label: 'Cost in bags', format: 'currency', info: 'Number of bags × price per bag.' },
  ],
  compute: (v) => {
    const A = num(v.area);
    const d = num(v.depth);
    const bag = num(v.bag);
    if (A === null || d === null || A < 0 || d < 0) return { volume: null };
    const volume = A * d;
    const bags = bag && bag > 0 ? ceilSafe(volume / bag) : null;
    const price = num(v.pricePerBag);
    const FT3 = 0.028316846592;
    return {
      chart: {
        type: 'bar',
        title: 'Bags needed by bag size',
        categories: ['1.5 ft³ bags', '2 ft³ bags', '3 ft³ bags', 'Bulk (yd³)'],
        series: [{ name: 'Count', values: [ceilSafe(volume / (1.5 * FT3)), ceilSafe(volume / (2 * FT3)), ceilSafe(volume / (3 * FT3)), Math.ceil((volume / YD3) * 4 - 1e-9) / 4] }],
        format: { format: 'number' },
      },
      volume,
      bags,
      cost: bags !== null && price !== null ? bags * price : null,
      note: volume / YD3 >= 2 ? 'At 2 yd³ or more, bulk delivery is usually cheaper than bags.' : undefined,
      steps: [`Volume = ${(A / 0.09290304).toFixed(1)} ft² × ${(d / 0.3048).toFixed(3)} ft = ${(volume / 0.028316846592).toFixed(2)} ft³ = ${(volume / YD3).toFixed(3)} yd³`],
    };
  },
  content: {
    formula: ['Volume = area × depth', 'Cubic yards = cubic feet ÷ 27', 'Bags = volume ÷ bag size, rounded up'],
    body: [
      'Multiply the bed’s area by the depth you want, keeping the units consistent. 200 ft² at 3 inches deep is 200 × 0.25 = 50 ft³, which is 1.85 cubic yards or 25 two-cubic-foot bags.',
      'Two to three inches of mulch suppresses weeds and holds moisture without smothering roots; topping up an existing layer usually needs only an inch. Keep mulch a few inches away from tree trunks and plant stems to prevent rot.',
      'Bulk mulch is sold by the cubic yard and is typically much cheaper per yard than bags once you need more than two or three yards. The same calculation works for compost, topsoil and decorative bark.',
    ],
    faq: [
      { q: 'How many bags of mulch are in a cubic yard?', a: '13.5 two-cubic-foot bags, or 9 three-cubic-foot bags, since a cubic yard is 27 ft³.' },
      { q: 'How do I measure an irregular bed?', a: 'Approximate it with rectangles and circles, or walk it with a measuring wheel. Being within 10% is fine for mulch.' },
    ],
  },
  related: ['gravel', 'square-footage', 'concrete'],
  examples: [
    // 200 ft² × 3 in = 50 ft³ = 1.4158423296 m³ → 25 bags of 2 ft³
    { values: { area: 18.580608, depth: 0.0762, bag: 0.056633693184, pricePerBag: 4 }, expect: { volume: 1.4158423296, bags: 25, cost: 100 }, tolerance: 1e-8 },
  ],
});
