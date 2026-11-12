import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const FT2 = 0.09290304;

export default defineCalculator({
  slug: 'drywall',
  title: 'Drywall Calculator',
  category: 'construction',
  description: 'Count the drywall sheets needed for a room’s walls and ceiling, with a waste allowance.',
  keywords: ['sheetrock', 'gypsum board', 'drywall sheets', 'plasterboard', '4x8 sheets', 'drywall estimate'],
  inputs: [
    { id: 'length', label: 'Room length', type: 'number', unit: 'length', units: ['ft', 'm', 'in'], defaultUnit: 'ft', default: 12, min: 0, info: 'Length of the room, wall to wall.' },
    { id: 'width', label: 'Room width', type: 'number', unit: 'length', units: ['ft', 'm', 'in'], defaultUnit: 'ft', default: 12, min: 0, info: 'Width of the room, wall to wall.' },
    { id: 'height', label: 'Wall height', type: 'number', unit: 'length', units: ['ft', 'm', 'in'], defaultUnit: 'ft', default: 8, min: 0, info: 'Wall height from floor to ceiling. 8 ft is standard; 9 ft walls suit 4 × 9 or 4 × 10 sheets.' },
    { id: 'ceiling', label: 'Include the ceiling', type: 'toggle', default: true, info: 'Adds the ceiling (length × width) to the area to cover.' },
    {
      id: 'sheet',
      info: 'The panel size you plan to hang. Longer sheets mean fewer seams but are heavier to handle.',
      label: 'Sheet size',
      type: 'select',
      segmented: true,
      default: '32',
      options: [
        { value: '32', label: '4 × 8 ft' },
        { value: '40', label: '4 × 10 ft' },
        { value: '48', label: '4 × 12 ft' },
      ],
    },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 50, info: 'Extra for offcuts and breakage. 10% is typical; more for many corners or angled ceilings.' },
  ],
  outputs: [
    { id: 'sheets', label: 'Sheets', format: 'integer', primary: true, info: 'Whole sheets to buy, including waste, rounded up. Doors and windows are not subtracted.' },
    { id: 'area', label: 'Surface to cover', unit: 'area', units: ['ft2', 'm2'], defaultUnit: 'ft2', precision: 1, info: 'Total wall and ceiling surface to cover, before waste.' },
    { id: 'screws', label: 'Screws (approx.)', format: 'integer', help: 'About 32 per sheet on walls and ceilings at standard spacing.', info: 'A rough screw count at about 32 screws per sheet. Screws are sold by the pound (roughly 300 per lb for 1¼ in).' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const W = num(v.width);
    const H = num(v.height);
    const waste = num(v.waste) ?? 0;
    const sheetFt2 = Number(v.sheet) || 32;
    if (L === null || W === null || H === null || L < 0 || W < 0 || H < 0 || waste < 0) return { sheets: null };
    const walls = 2 * (L + W) * H;
    const ceil = v.ceiling === 'on' ? L * W : 0;
    const area = walls + ceil;
    const ft2 = area / FT2;
    const sheets = ceilSafe((ft2 * (1 + waste / 100)) / sheetFt2);
    return {
      chart: {
        type: 'donut',
        title: 'Surface to cover',
        format: { unit: 'area' },
        slices: [
          { label: 'Walls', value: walls },
          ...(ceil ? [{ label: 'Ceiling', value: ceil }] : []),
          { label: 'Waste allowance', value: (area * waste) / 100 },
        ],
        centerValue: String(sheets),
        centerLabel: 'sheets',
      },
      sheets,
      area,
      screws: sheets * 32,
      steps: [
        `Walls = 2 × (L + W) × H = ${(walls / FT2).toFixed(1)} ft²${ceil ? `; ceiling = ${(ceil / FT2).toFixed(1)} ft²` : ''}`,
        `(${ft2.toFixed(1)} ft² × ${1 + waste / 100}) ÷ ${sheetFt2} ft² per sheet = ${((ft2 * (1 + waste / 100)) / sheetFt2).toFixed(2)} → ${sheets} sheets`,
      ],
    };
  },
  content: {
    formula: ['Area = 2 × (length + width) × height (+ length × width for the ceiling)', 'Sheets = area × (1 + waste) ÷ sheet area, rounded up'],
    body: [
      'Add up the wall area — the room’s perimeter times its height — and the ceiling if you are hanging that too, then divide by the area of one sheet. A 4 × 8 sheet covers 32 ft², a 4 × 10 covers 40 ft² and a 4 × 12 covers 48 ft².',
      'Pros usually do not subtract doors and windows from the count: the offcuts are rarely reusable and the extra covers mistakes. The waste allowance handles cutting losses; 10% is typical, more for rooms with many corners or a vaulted ceiling.',
      'Longer sheets mean fewer butt joints to tape and a flatter finish, but they are heavy and awkward to carry up stairs. Use ½-inch board for walls and ⅝-inch or sag-resistant ½-inch for ceilings, and check local code for fire-rated Type X where required.',
    ],
    faq: [
      { q: 'How many sheets of drywall for a 12 × 12 room?', a: 'With 8 ft walls: 384 ft² of walls plus 144 ft² of ceiling is 528 ft². With 10% waste that is 581 ft², or 19 sheets of 4 × 8.' },
      { q: 'How much joint compound and tape do I need?', a: 'A rough rule is one 4.5-gallon bucket of all-purpose compound and one 500 ft roll of tape for every 15–20 sheets.' },
    ],
  },
  related: ['paint', 'square-footage', 'roofing'],
  examples: [
    { values: { length: 3.6576, width: 3.6576, height: 2.4384, ceiling: 'on', sheet: '32', waste: 10 }, expect: { sheets: 19, area: 528 * 0.09290304, screws: 608 } },
    { values: { length: 3.6576, width: 3.6576, height: 2.4384, ceiling: 'off', sheet: '32', waste: 0 }, expect: { sheets: 12 } },
    { values: { length: 3.6576, width: 3.6576, height: 2.4384, ceiling: 'off', sheet: '48', waste: 0 }, expect: { sheets: 8 } },
  ],
});
