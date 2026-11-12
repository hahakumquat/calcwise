import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const LEN = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];
const AREA = ['cm2', 'm2', 'km2', 'in2', 'ft2', 'yd2', 'ac', 'ha', 'mi2'];
const len = { type: 'number' as const, unit: 'length' as const, units: LEN, defaultUnit: 'm', min: 0 };
const when = (...shapes: string[]) => ({ input: 'shape', is: shapes });

export default defineCalculator({
  slug: 'area',
  title: 'Area Calculator',
  category: 'math',
  description: 'Find the area of a rectangle, triangle, circle, trapezoid, ellipse or parallelogram in any unit.',
  keywords: ['area of a rectangle', 'area of a triangle', 'area of a trapezoid', 'area of an ellipse', 'square feet', 'square meters', 'surface area of shape'],
  inputs: [
    {
      id: 'shape', info: 'Pick the flat shape you want to measure. The fields below change to the measurements that shape needs.',
      label: 'Shape',
      type: 'select',
      default: 'rectangle',
      options: [
        { value: 'rectangle', label: 'Rectangle / square' },
        { value: 'triangle', label: 'Triangle' },
        { value: 'circle', label: 'Circle' },
        { value: 'trapezoid', label: 'Trapezoid' },
        { value: 'ellipse', label: 'Ellipse' },
        { value: 'parallelogram', label: 'Parallelogram' },
      ],
    },
    { id: 'length', info: 'The longer side of the rectangle. For a square, enter the same value for length and width.', label: 'Length', ...len, default: 8, showWhen: when('rectangle') },
    { id: 'width', info: 'The shorter side of the rectangle, at right angles to the length.', label: 'Width', ...len, default: 5, showWhen: when('rectangle') },
    { id: 'base', info: 'The side the shape sits on. For a trapezoid, this is one of the two parallel sides.', label: 'Base', ...len, default: 6, help: 'For a trapezoid: the first parallel side', showWhen: when('triangle', 'parallelogram', 'trapezoid') },
    { id: 'base2', info: 'The other parallel side of the trapezoid (the one opposite the first base).', label: 'Second base', ...len, default: 4, showWhen: when('trapezoid') },
    { id: 'height', info: 'The perpendicular distance from the base to the opposite side or vertex — not the length of a slanted side.', label: 'Height (perpendicular)', ...len, default: 4, showWhen: when('triangle', 'parallelogram', 'trapezoid') },
    { id: 'radius', info: 'The distance from the centre of the circle to its edge (half the diameter).', label: 'Radius', ...len, default: 3, showWhen: when('circle') },
    { id: 'semiA', info: 'Half of the ellipse’s longest width, measured from the centre.', label: 'Semi-major axis (a)', ...len, default: 5, showWhen: when('ellipse') },
    { id: 'semiB', info: 'Half of the ellipse’s shortest width, measured from the centre.', label: 'Semi-minor axis (b)', ...len, default: 3, showWhen: when('ellipse') },
  ],
  outputs: [
    { id: 'area', info: 'How much flat surface the shape covers, in square units. Change the unit to convert, e.g. to ft² or acres.', label: 'Area', unit: 'area', units: AREA, defaultUnit: 'm2', primary: true, precision: 6 },
    { id: 'perimeter', info: 'The distance all the way around the edge. For an ellipse this uses Ramanujan’s very accurate approximation.', label: 'Perimeter', unit: 'length', units: LEN, defaultUnit: 'm', precision: 6, showWhen: when('rectangle', 'circle', 'ellipse') },
  ],
  compute: (v) => {
    const shape = (v.shape as string) || 'rectangle';
    const need: Record<string, string[]> = {
      rectangle: ['length', 'width'],
      triangle: ['base', 'height'],
      circle: ['radius'],
      trapezoid: ['base', 'base2', 'height'],
      ellipse: ['semiA', 'semiB'],
      parallelogram: ['base', 'height'],
    };
    const ids = need[shape] ?? need.rectangle;
    const d: Record<string, number> = {};
    for (const id of ids) {
      const x = num(v[id]);
      if (x === null) return { area: null };
      if (x < 0) return { area: null, error: 'Dimensions can’t be negative.' };
      d[id] = x;
    }
    let area: number;
    let perimeter: number | null = null;
    const steps: string[] = [];
    const m = (x: number) => `${fmt(x)} m`;
    switch (shape) {
      case 'triangle':
        area = (d.base * d.height) / 2;
        steps.push(`A = ½ × base × height = ½ × ${m(d.base)} × ${m(d.height)} = ${fmt(area)} m²`);
        break;
      case 'circle':
        area = Math.PI * d.radius ** 2;
        perimeter = 2 * Math.PI * d.radius;
        steps.push(`A = πr² = π × (${m(d.radius)})² = ${fmt(area)} m²`, `Circumference = 2πr = ${fmt(perimeter)} m`);
        break;
      case 'trapezoid':
        area = ((d.base + d.base2) / 2) * d.height;
        steps.push(`A = (a + b) ÷ 2 × h = (${m(d.base)} + ${m(d.base2)}) ÷ 2 × ${m(d.height)} = ${fmt(area)} m²`);
        break;
      case 'ellipse': {
        const { semiA: a, semiB: b } = d;
        area = Math.PI * a * b;
        const h = a + b > 0 ? (a - b) ** 2 / (a + b) ** 2 : 0;
        perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
        steps.push(`A = π × a × b = π × ${m(a)} × ${m(b)} = ${fmt(area)} m²`, `Perimeter ≈ π(a + b)(1 + 3h ÷ (10 + √(4 − 3h))), h = (a − b)² ÷ (a + b)² → ${fmt(perimeter)} m`);
        break;
      }
      case 'parallelogram':
        area = d.base * d.height;
        steps.push(`A = base × height = ${m(d.base)} × ${m(d.height)} = ${fmt(area)} m²`);
        break;
      default:
        area = d.length * d.width;
        perimeter = 2 * (d.length + d.width);
        steps.push(`A = length × width = ${m(d.length)} × ${m(d.width)} = ${fmt(area)} m²`, `Perimeter = 2(l + w) = ${fmt(perimeter)} m`);
    }
    steps.push('Lengths are converted to metres first; switch the output unit to see the area in other units.');
    const labels: Record<string, string> = { length: 'Length', width: 'Width', base: shape === 'trapezoid' ? 'Base a' : 'Base', base2: 'Base b', height: 'Height', radius: 'Radius', semiA: 'Semi-axis a', semiB: 'Semi-axis b' };
    return {
      area,
      perimeter,
      chart: { type: 'bar', title: 'Dimensions you entered', categories: ids.map((id) => labels[id]), series: [{ name: 'Length', values: ids.map((id) => d[id]) }], format: { unit: 'length' } },
      steps,
    };
  },
  content: {
    formula: [
      'Rectangle: A = l × w',
      'Triangle: A = ½ × b × h',
      'Circle: A = πr²',
      'Trapezoid: A = ½(a + b) × h',
      'Ellipse: A = π × a × b',
      'Parallelogram: A = b × h',
    ],
    body: [
      'Area is the amount of flat surface a shape covers, measured in square units. A rectangle 8 m long and 5 m wide covers 40 squares that are each 1 m on a side, so its area is 40 m².',
      'Many shapes reduce to the rectangle. A parallelogram can be cut and slid into a rectangle with the same base and height. A triangle is half of a parallelogram, which is where the ½ comes from. A trapezoid’s area uses the average of its two parallel sides times its height.',
      'For triangles, parallelograms and trapezoids, the height must be perpendicular to the base — not the length of the slanted side. Choose the units of your measurements and the units you want for the answer independently; the calculator converts between them, for example from feet to square metres.',
    ],
    faq: [
      { q: 'How do I find the area of an irregular shape?', a: 'Split it into rectangles, triangles and circles, find each area separately, then add them up (or subtract the area of any holes).' },
      { q: 'How many square feet are in a square metre?', a: 'About 10.764. Because area is two-dimensional, the conversion factor is the length factor squared: 3.2808² ≈ 10.764.' },
      { q: 'What are the semi-axes of an ellipse?', a: 'They are half the longest width and half the shortest width, measured from the centre. For a circle both semi-axes equal the radius, and the formula πab becomes πr².' },
    ],
  },
  related: ['circle', 'volume', 'triangle', 'pythagorean-theorem'],
  examples: [
    { values: { shape: 'rectangle', length: 8, width: 5 }, expect: { area: 40, perimeter: 26 } },
    { values: { shape: 'triangle', base: 6, height: 4 }, expect: { area: 12 } },
    { values: { shape: 'trapezoid', base: 3, base2: 5, height: 4 }, expect: { area: 16 } },
    { values: { shape: 'circle', radius: 1 }, expect: { area: Math.PI } },
    { values: { shape: 'ellipse', semiA: 2, semiB: 2 }, expect: { area: 4 * Math.PI, perimeter: 4 * Math.PI }, tolerance: 1e-12 },
  ],
});
