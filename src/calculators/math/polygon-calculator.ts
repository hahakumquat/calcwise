import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'polygon-calculator',
  title: 'Regular Polygon Calculator',
  category: 'math',
  description: 'Enter the number of sides and the side length of a regular polygon to get its interior angle, exterior angle, angle sum, perimeter and area.',
  metaDescription: 'Regular polygon calculator: interior and exterior angles, angle sum, perimeter, area, apothem and circumradius from the number of sides and side length.',
  updated: '2026-11-27',
  keywords: ['regular polygon calculator', 'interior angle of a polygon', 'polygon area calculator', 'hexagon area', 'pentagon angles', 'sum of interior angles'],
  inputs: [
    { id: 'n', label: 'Number of sides (n)', type: 'number', default: 6, min: 3, max: 1000, step: 1, info: 'How many equal sides the polygon has: 3 is a triangle, 4 a square, 5 a pentagon, 6 a hexagon, 8 an octagon. Whole numbers from 3 up.' },
    { id: 's', label: 'Side length (s)', type: 'number', default: 10, min: 0, step: 0.1, info: 'The length of one side. Use any unit; lengths come back in that unit and area in its square.' },
  ],
  outputs: [
    { id: 'interior', label: 'Interior angle', format: 'number', precision: 4, primary: true, info: 'Each inside angle in degrees: (n − 2) × 180 ÷ n.' },
    { id: 'exterior', label: 'Exterior angle', format: 'number', precision: 4, info: 'The turn at each corner in degrees: 360 ÷ n.' },
    { id: 'sum', label: 'Sum of interior angles', format: 'number', precision: 4, info: 'All inside angles added together in degrees: (n − 2) × 180.' },
    { id: 'perimeter', label: 'Perimeter', format: 'number', precision: 4, info: 'The distance around the polygon: n × s.' },
    { id: 'area', label: 'Area', format: 'number', precision: 4, info: 'The space inside: n × s² ÷ (4 × tan(180° ÷ n)).' },
    { id: 'apothem', label: 'Apothem', format: 'number', precision: 4, info: 'The distance from the centre to the middle of a side: s ÷ (2 × tan(180° ÷ n)).' },
    { id: 'circumradius', label: 'Circumradius', format: 'number', precision: 4, info: 'The distance from the centre to a corner: s ÷ (2 × sin(180° ÷ n)).' },
  ],
  compute: (v) => {
    const n = num(v.n);
    const s = num(v.s);
    if (n === null || s === null) return { interior: null };
    if (!Number.isInteger(n) || n < 3) return { interior: null, error: 'Enter a whole number of sides, 3 or more.' };
    if (s <= 0) return { interior: null, error: 'Enter a side length above 0.' };
    const half = Math.PI / n;
    const interior = ((n - 2) * 180) / n;
    const exterior = 360 / n;
    const sum = (n - 2) * 180;
    const perimeter = n * s;
    const apothem = s / (2 * Math.tan(half));
    const circumradius = s / (2 * Math.sin(half));
    const area = (perimeter * apothem) / 2;
    return {
      interior,
      exterior,
      sum,
      perimeter,
      area,
      apothem,
      circumradius,
      tone: 'ok',
      badge: `${fmt(n)} sides`,
      chart: {
        type: 'bar',
        title: 'Interior and exterior angle at each corner',
        categories: ['Interior', 'Exterior'],
        series: [{ name: 'Degrees', values: [interior, exterior] }],
      },
      steps: [
        `Interior angle = (${fmt(n)} − 2) × 180 ÷ ${fmt(n)} = ${fmt(interior)}°; exterior = 360 ÷ ${fmt(n)} = ${fmt(exterior)}°`,
        `Perimeter = ${fmt(n)} × ${fmt(s)} = ${fmt(perimeter)}`,
        `Apothem = ${fmt(s)} ÷ (2 × tan(180° ÷ ${fmt(n)})) = ${fmt(apothem)}`,
        `Area = ½ × perimeter × apothem = ½ × ${fmt(perimeter)} × ${fmt(apothem)} = ${fmt(area)}`,
      ],
    };
  },
  content: {
    formula: [
      'Interior angle = (n − 2) × 180° ÷ n',
      'Exterior angle = 360° ÷ n',
      'Area = n × s² ÷ (4 × tan(180° ÷ n))',
      'Apothem = s ÷ (2 × tan(180° ÷ n)); circumradius = s ÷ (2 × sin(180° ÷ n))',
    ],
    body: [
      'A regular polygon has equal sides and equal angles. Give the number of sides and the length of one side and this calculator returns the angles, the perimeter, the area and the two radii that locate the centre.',
      'For a hexagon with 10-unit sides, each interior angle is (6 − 2) × 180 ÷ 6 = 120°, the perimeter is 60, the apothem is 8.66 and the area is ½ × 60 × 8.66 = 259.81. A regular pentagon with 5-unit sides has 108° interior angles and an area of 43.01.',
      'The exterior angles of any polygon add up to 360°, which is why each one is 360 ÷ n. The interior angle is what is left of a straight 180° line.',
    ],
    faq: [
      { q: 'What is the interior angle of a regular hexagon?', a: '120°. The formula is (n − 2) × 180 ÷ n, which for n = 6 is 4 × 180 ÷ 6 = 120. The six angles add up to 720°.' },
      { q: 'How do I find the area of a regular polygon?', a: 'Multiply half the perimeter by the apothem. For a pentagon with 5-unit sides the perimeter is 25, the apothem is 3.44 and the area is ½ × 25 × 3.44 = 43.01.' },
      { q: 'What is the sum of the interior angles?', a: '(n − 2) × 180°. A triangle gives 180°, a square 360°, a pentagon 540° and a hexagon 720°.' },
      { q: 'Does it work for irregular polygons?', a: 'No. The formulas assume all sides and all angles are equal. For an irregular shape, split it into triangles and use the triangle calculator.' },
    ],
    sources: [],
  },
  related: ['triangle', 'area', 'circle'],
  examples: [
    // hexagon s=10: interior 120, exterior 60, sum 720, perimeter 60, apothem 10/(2 tan30)=8.660254, circumradius 10, area 0.5*60*8.660254=259.80762
    { values: { n: 6, s: 10 }, expect: { interior: 120, exterior: 60, sum: 720, perimeter: 60, apothem: 8.660254, circumradius: 10, area: 259.80762 }, tolerance: 0.001 },
    // pentagon s=5: interior 108, exterior 72, sum 540, perimeter 25, apothem 5/(2 tan36)=3.440955, area 0.5*25*3.440955=43.011938
    { values: { n: 5, s: 5 }, expect: { interior: 108, exterior: 72, sum: 540, perimeter: 25, apothem: 3.440955, area: 43.011938 }, tolerance: 0.001 },
  ],
});
