import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const SHAPES = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'rect', label: 'Rectangular' },
];

function area(shape: string | null | undefined, a: number | null, b: number | null): number | null {
  if (a === null || a <= 0) return null;
  if (shape === 'round') return Math.PI * (a / 2) ** 2;
  if (shape === 'square') return a * a;
  if (shape === 'rect') return b === null || b <= 0 ? null : a * b;
  return null;
}

const label = (shape: string, a: number, b: number | null) =>
  shape === 'round' ? `${a} round` : shape === 'square' ? `${a} × ${a}` : `${a} × ${b}`;

export default defineCalculator({
  slug: 'baking-pan-converter',
  title: 'Baking Pan Size Converter',
  category: 'food',
  description: 'Swap one baking pan for another and see how much to scale the recipe. Compares round, square and rectangular pans by surface area, in inches or cm.',
  keywords: ['baking pan converter', 'cake pan size conversion', 'pan size calculator', '9x13 to round pan', '8 inch square to 9 inch round', 'convert recipe to different pan size'],
  inputs: [
    { id: 'oldShape', label: 'Recipe pan shape', type: 'select', default: 'round', options: SHAPES, info: 'The shape of the pan the recipe was written for.' },
    { id: 'oldA', label: 'Recipe pan: diameter or side', type: 'number', default: 9, min: 0.5, step: 0.5, help: 'Any unit, as long as both pans use the same one.', info: 'Diameter for a round pan, side length for a square pan, or the first side of a rectangle. Measure across the inside of the pan, not the rim.' },
    { id: 'oldB', label: 'Recipe pan: other side', type: 'number', default: 13, min: 0.5, step: 0.5, showWhen: { input: 'oldShape', is: 'rect' }, info: 'The second side of the rectangular pan, in the same unit.' },
    { id: 'newShape', label: 'Your pan shape', type: 'select', default: 'rect', options: SHAPES, info: 'The shape of the pan you want to use instead.' },
    { id: 'newA', label: 'Your pan: diameter or side', type: 'number', default: 9, min: 0.5, step: 0.5, info: 'Diameter for a round pan, side length for a square pan, or the first side of a rectangle, in the same unit as above.' },
    { id: 'newB', label: 'Your pan: other side', type: 'number', default: 13, min: 0.5, step: 0.5, showWhen: { input: 'newShape', is: 'rect' }, info: 'The second side of your rectangular pan, in the same unit.' },
  ],
  outputs: [
    { id: 'scale', label: 'Scale the recipe by', format: 'number', precision: 2, primary: true, info: 'Your pan area divided by the recipe pan area. Multiply every ingredient by this.' },
    { id: 'percent', label: 'As a percentage', format: 'percent', precision: 0, info: 'The same ratio as a percentage of the original recipe.' },
    { id: 'oldArea', label: 'Recipe pan area', format: 'number', precision: 1, info: 'Surface area in square units of whatever you measured.' },
    { id: 'newArea', label: 'Your pan area', format: 'number', precision: 1, info: 'Surface area in square units of whatever you measured.' },
  ],
  compute: (v) => {
    const oa = area(v.oldShape as string, num(v.oldA), num(v.oldB));
    const na = area(v.newShape as string, num(v.newA), num(v.newB));
    if (oa === null || na === null) return { scale: null };
    const scale = na / oa;
    const o = label(v.oldShape as string, num(v.oldA)!, num(v.oldB));
    const n = label(v.newShape as string, num(v.newA)!, num(v.newB));
    return {
      scale,
      percent: scale,
      oldArea: oa,
      newArea: na,
      chart: {
        type: 'bar',
        title: 'Pan surface area',
        categories: [`Recipe (${o})`, `Yours (${n})`],
        series: [{ name: 'Area', values: [oa, na] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Recipe pan area = ${oa.toFixed(2)}`,
        `Your pan area = ${na.toFixed(2)}`,
        `Scale = ${na.toFixed(2)} ÷ ${oa.toFixed(2)} = ${scale.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: ['Round area = π × (diameter ÷ 2)²', 'Square area = side × side; rectangle area = length × width', 'Scale factor = your pan area ÷ recipe pan area'],
    body: [
      'A batter spreads to the same depth when the pan has the same surface area, so comparing areas tells you how much to scale a recipe. A 9 inch round pan has an area of about 63.6 square inches and a 9 × 13 inch pan has 117, so the larger pan needs about 1.84 times the recipe.',
      'Some swaps need no change at all. An 8 inch square pan (64 square inches) and a 9 inch round pan (63.6 square inches) hold almost the same amount, so the recipe stays as written. Enter both pans in the same unit, inches or centimetres; the ratio is the same either way.',
      'This assumes you want the batter at the same depth. A wider, shallower pan usually bakes faster, but there is no exact formula for the change, so start checking early and go by how the centre looks and feels. Very deep or very shallow results may also need a different oven temperature.',
    ],
    faq: [
      { q: 'How do I convert a 9 inch round pan to a 9 × 13 pan?', a: 'Divide the areas: 117 ÷ 63.6 is about 1.84, so multiply the recipe by 1.84. Check the bake early, since the batter will be shallower if you use the original amount.' },
      { q: 'Can I swap an 8 inch square for a 9 inch round?', a: 'Yes, with no scaling. The areas are 64 and 63.6 square inches, a ratio of 0.99.' },
      { q: 'Does this work in centimetres?', a: 'Yes. Use the same unit for both pans and the scale factor comes out the same.' },
      { q: 'Does it account for pan depth?', a: 'No. It assumes the batter fills the new pan to the same depth as the old one. A much deeper or shallower pan changes the bake time.' },
    ],
  },
  related: ['recipe-scaler', 'cooking-converter', 'bakers-percentage'],
  examples: [
    { values: { oldShape: 'round', oldA: 9, oldB: null, newShape: 'rect', newA: 9, newB: 13 }, expect: { scale: 117 / (Math.PI * 20.25), oldArea: Math.PI * 20.25, newArea: 117 }, tolerance: 1e-9 },
    { values: { oldShape: 'square', oldA: 8, oldB: null, newShape: 'round', newA: 9, newB: null }, expect: { scale: (Math.PI * 20.25) / 64, oldArea: 64 }, tolerance: 1e-9 },
    { values: { oldShape: 'rect', oldA: 9, oldB: 13, newShape: 'rect', newA: 9, newB: 13 }, expect: { scale: 1, percent: 1 }, tolerance: 1e-9 },
  ],
});
