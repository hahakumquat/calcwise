import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'area',
  [
    { id: 'm2', name: 'Square meters', info: 'The area of a 1 m × 1 m square, about 10.76 ft².' },
    { id: 'ft2', name: 'Square feet', info: 'The area of a 1 ft × 1 ft square, exactly 0.09290304 m². Used for US floor plans.' },
    { id: 'yd2', name: 'Square yards', info: '9 square feet, about 0.836 m². Carpet is often priced per square yard.' },
    { id: 'in2', name: 'Square inches', info: 'The area of a 1 in × 1 in square, exactly 6.4516 cm².' },
    { id: 'cm2', name: 'Square centimeters', info: 'The area of a 1 cm × 1 cm square, one ten-thousandth of a square meter.' },
    { id: 'ac', name: 'Acres', precision: 8, info: '43,560 square feet, about 4,047 m². The US unit for land.' },
    { id: 'ha', name: 'Hectares', precision: 8, info: '10,000 m² (a 100 m square), about 2.47 acres. The metric land unit.' },
    { id: 'km2', name: 'Square kilometers', precision: 8, info: '1,000,000 m², or 100 hectares.' },
    { id: 'mi2', name: 'Square miles', precision: 8, info: '640 acres, about 2.59 km².' },
  ],
  'm2',
  { chartUnits: ['m2', 'yd2', 'ft2'], chartTitle: 'Square meters, yards and feet side by side' },
);

export default defineCalculator({
  slug: 'area-converter',
  title: 'Area Converter',
  category: 'conversion',
  description: 'Convert between square feet, square meters, square yards, acres, hectares and square miles.',
  keywords: ['square feet to square meters', 'sq ft to m2', 'acres to hectares', 'hectares to acres', 'square yards', 'land area'],
  inputs: [{ id: 'value', label: 'Area', type: 'number', unit: 'area', defaultUnit: 'ft2', default: 1000, info: 'Enter an area and pick its unit; every other unit updates instantly.' }],
  outputs: conv.outputs,
  compute: conv.compute,
  content: {
    formula: ['1 ft² = 0.09290304 m² (exact)', '1 yd² = 9 ft²', '1 acre = 43,560 ft² ≈ 4,046.86 m²', '1 hectare = 10,000 m² ≈ 2.471 acres', '1 mi² = 640 acres'],
    body: [
      'Area units are squares of length units, so the conversion factor is the length factor squared. One foot is 0.3048 m, so one square foot is 0.3048² = 0.09290304 m² — a factor people often get wrong by forgetting to square.',
      'For land, the US uses acres (43,560 ft², historically the area one ox team could plough in a day) and most of the world uses hectares (a 100 m × 100 m square). A hectare is about 2.47 acres.',
      'Floor plans in the US are quoted in square feet and elsewhere in square meters; a 1,000 ft² apartment is roughly 93 m².',
    ],
    faq: [
      { q: 'How many square feet are in a square meter?', a: 'About 10.764 ft².' },
      { q: 'How big is an acre?', a: 'Roughly 209 ft × 209 ft, or about three-quarters of an American football field without the end zones.' },
    ],
  },
  related: ['square-footage', 'length-converter', 'volume-converter'],
  examples: [
    { values: { value: 4046.8564224 }, expect: { ac: 1, ft2: 43560, ha: 0.40468564224 } },
    { values: { value: 92.90304 }, expect: { ft2: 1000, yd2: 111.111111111 }, tolerance: 1e-9 },
  ],
});
