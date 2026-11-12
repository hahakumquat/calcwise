import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'flooring',
  title: 'Flooring Calculator',
  category: 'construction',
  description: 'Work out how many boxes of laminate, vinyl plank, hardwood or tile to buy, including a waste allowance.',
  keywords: ['laminate', 'vinyl plank', 'hardwood flooring', 'tile', 'boxes of flooring', 'flooring cost', 'waste factor'],
  inputs: [
    { id: 'area', label: 'Floor area', type: 'number', unit: 'area', units: ['ft2', 'm2', 'yd2'], defaultUnit: 'ft2', default: 200, min: 0, help: 'Use the square footage calculator for room dimensions.', info: 'The floor area to cover, including closets. Use the square footage calculator for room dimensions.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 100, help: '5–10% for straight lays, 15% or more for diagonal or herringbone.', info: 'Extra material for offcuts and mistakes. 10% for straight layouts, 15–20% for diagonal or herringbone.' },
    { id: 'perBox', label: 'Coverage per box', type: 'number', unit: 'area', units: ['ft2', 'm2'], defaultUnit: 'ft2', default: 20, min: 0, info: 'Square feet (or m²) one box covers, printed on the box label. Laminate boxes often cover 18–25 ft².' },
    { id: 'pricePerBox', label: 'Price per box', type: 'number', prefix: '$', min: 0, step: 0.01, optional: true, placeholder: 'Optional', info: 'Price of one box. Leave blank if you only need the box count.' },
  ],
  outputs: [
    { id: 'boxes', label: 'Boxes to buy', format: 'integer', primary: true, info: 'Whole boxes to buy: area plus waste divided by coverage per box, rounded up.' },
    { id: 'needed', label: 'Area including waste', unit: 'area', units: ['ft2', 'm2'], defaultUnit: 'ft2', precision: 1, info: 'Floor area plus the waste allowance — the minimum material to have on hand.' },
    { id: 'purchased', label: 'Area you will buy', unit: 'area', units: ['ft2', 'm2'], defaultUnit: 'ft2', precision: 1, info: 'Total coverage of the boxes you buy, which is a little more than needed because of rounding up.' },
    { id: 'cost', label: 'Material cost', format: 'currency', info: 'Boxes × price per box, before tax and installation.' },
  ],
  compute: (v) => {
    const area = num(v.area);
    const waste = num(v.waste) ?? 0;
    const per = num(v.perBox);
    if (area === null || !per || area < 0 || per <= 0 || waste < 0) return { boxes: null };
    const needed = area * (1 + waste / 100);
    const boxes = ceilSafe(needed / per);
    const price = num(v.pricePerBox);
    return {
      chart: {
        type: 'donut',
        title: 'What you are buying',
        format: { unit: 'area' },
        slices: [
          { label: 'Floor area', value: area },
          { label: 'Waste allowance', value: needed - area },
          { label: 'Spare from rounding up', value: Math.max(0, boxes * per - needed) },
        ],
        centerValue: String(boxes),
        centerLabel: 'boxes',
      },
      boxes,
      needed,
      purchased: boxes * per,
      cost: price !== null ? boxes * price : null,
      steps: [`Area + ${waste}% = ${(needed / 0.09290304).toFixed(1)} ft²`, `Boxes = ${(needed / per).toFixed(2)} → round up to ${boxes}`],
    };
  },
  content: {
    formula: ['Area needed = floor area × (1 + waste % ÷ 100)', 'Boxes = area needed ÷ coverage per box, rounded up'],
    body: [
      'Flooring is sold by the box, and each box states how many square feet (or square metres) it covers. Add a waste allowance to the room’s area, divide by the box coverage and round up — you cannot buy part of a box.',
      'Waste covers offcuts at walls, pieces that do not match the pattern and the odd damaged plank. About 10% is typical for planks laid parallel to the walls; diagonal layouts, herringbone and large-format tile cut more and need 15–20%.',
      'Buy all boxes from the same production lot so the color matches, and keep one spare box for future repairs. Most stores accept unopened boxes back.',
    ],
    faq: [
      { q: 'Do I need extra for closets and doorways?', a: 'Yes — measure them as part of the floor area. The waste allowance is for cutting losses, not for forgotten spaces.' },
      { q: 'What about underlayment?', a: 'Underlayment is sold by the roll; use the area without the waste allowance and add a little for overlaps.' },
    ],
  },
  related: ['square-footage', 'paint', 'area-converter'],
  examples: [
    // 200 ft² × 1.10 = 220 ft² ÷ 20 = 11 boxes
    { values: { area: 18.580608, waste: 10, perBox: 1.8580608, pricePerBox: 45 }, expect: { boxes: 11, needed: 20.4386688, cost: 495 } },
    { values: { area: 18.580608, waste: 10, perBox: 2.229672960, pricePerBox: null }, expect: { boxes: 10 } },
  ],
});
