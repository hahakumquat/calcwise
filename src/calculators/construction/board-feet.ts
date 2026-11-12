import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const IN = 0.0254;
const FT = 0.3048;

export default defineCalculator({
  slug: 'board-feet',
  title: 'Board Foot Calculator',
  category: 'construction',
  description: 'Calculate board feet and lumber cost from thickness, width, length and quantity.',
  keywords: ['board feet', 'lumber calculator', 'hardwood pricing', 'bf', 'timber volume'],
  inputs: [
    { id: 'thickness', label: 'Thickness', type: 'number', unit: 'length', units: ['in', 'cm', 'mm'], defaultUnit: 'in', default: 2, min: 0, help: 'Use nominal size for dimensional lumber (2×6 = 2 in × 6 in).', info: 'Board thickness in inches. For rough hardwood, 4/4 = 1 in and 8/4 = 2 in; for dimensional lumber use the nominal size.' },
    { id: 'width', label: 'Width', type: 'number', unit: 'length', units: ['in', 'cm', 'mm'], defaultUnit: 'in', default: 6, min: 0, info: 'Board width in inches (nominal for dimensional lumber, so a 2×6 is 6 in).' },
    { id: 'length', label: 'Length', type: 'number', unit: 'length', units: ['ft', 'in', 'm'], defaultUnit: 'ft', default: 8, min: 0, info: 'Board length, usually in feet. Lumber comes in 2 ft steps from 6 to 16 ft.' },
    { id: 'qty', label: 'Number of boards', type: 'number', default: 1, min: 1, step: 1, info: 'How many identical boards you need.' },
    { id: 'price', label: 'Price per board foot', type: 'number', prefix: '$', min: 0, step: 0.01, optional: true, placeholder: 'Optional', info: 'The dealer’s price per board foot. Hardwoods typically run $4–15 per BF.' },
  ],
  outputs: [
    { id: 'bf', label: 'Board feet', precision: 2, suffix: 'BF', primary: true, info: 'Total board feet: thickness (in) × width (in) × length (ft) ÷ 12 × number of boards.' },
    { id: 'volume', label: 'Volume', unit: 'volume', units: ['ft3', 'm3', 'in3'], defaultUnit: 'ft3', precision: 3, info: 'The same amount of wood as a plain volume. One board foot is 144 in³.' },
    { id: 'cost', label: 'Cost', format: 'currency', info: 'Board feet × price per board foot.' },
  ],
  compute: (v) => {
    const t = num(v.thickness);
    const w = num(v.width);
    const l = num(v.length);
    const q = num(v.qty);
    if (t === null || w === null || l === null || q === null || t < 0 || w < 0 || l < 0 || q < 0) return { bf: null };
    const bf = ((t / IN) * (w / IN) * (l / FT) * q) / 12;
    const price = num(v.price);
    return {
      chart: {
        type: 'bar',
        title: 'Board feet',
        categories: ['One board', `All ${q} boards`],
        series: [{ name: 'Board feet', values: [q > 0 ? bf / q : 0, bf] }],
        format: { suffix: 'BF' },
        highlight: 1,
      },
      bf,
      volume: t * w * l * q,
      cost: price !== null ? bf * price : null,
      steps: [`BF = ${(t / IN).toFixed(3)} in × ${(w / IN).toFixed(3)} in × ${(l / FT).toFixed(3)} ft × ${q} ÷ 12 = ${bf.toFixed(3)}`],
    };
  },
  content: {
    formula: ['Board feet = thickness (in) × width (in) × length (ft) ÷ 12', '1 board foot = 144 in³ = 1/12 ft³ ≈ 2.36 L'],
    body: [
      'A board foot is a volume: a piece one inch thick, twelve inches wide and one foot long, or 144 cubic inches. Hardwood dealers price almost everything by the board foot, so it is the number you need to compare offers.',
      'Rough-sawn hardwood is sold by its thickness in quarters of an inch — 4/4 is 1 inch, 8/4 is 2 inches — measured before planing. Dimensional softwood such as a 2×6 is named by its nominal size even though it is actually 1.5 × 5.5 inches; board-foot pricing uses the nominal figures.',
      'Plan for 20–30% extra when buying rough lumber for furniture, to allow for knots, checks and cutting the boards to clean lengths.',
    ],
    faq: [
      { q: 'How many board feet are in a 2×4×8?', a: '2 × 4 × 8 ÷ 12 = 5.33 board feet.' },
      { q: 'Is a board foot the same as a linear foot?', a: 'No. A linear foot is just length, regardless of the board’s width and thickness. Trim and mouldings are sold by the linear foot; hardwood stock by the board foot.' },
    ],
  },
  related: ['roofing', 'drywall', 'volume-converter'],
  examples: [
    { values: { thickness: 0.0508, width: 0.1524, length: 2.4384, qty: 1, price: 5 }, expect: { bf: 8, cost: 40, volume: (8 / 12) * 0.028316846592 } },
    { values: { thickness: 0.0254, width: 0.2032, length: 3.048, qty: 3, price: null }, expect: { bf: 20 } },
  ],
});
