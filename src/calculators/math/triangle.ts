import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const deg = (r: number) => (r * 180) / Math.PI;
const ANG = { unit: 'angle' as const, units: ['deg', 'rad'], defaultUnit: 'deg', precision: 4 };

export default defineCalculator({
  slug: 'triangle',
  title: 'Triangle Calculator',
  category: 'math',
  description: 'Enter three sides of any triangle to get its angles, area (Heron’s formula), perimeter and type.',
  keywords: ['heron’s formula', 'law of cosines', 'triangle angles', 'sss triangle', 'area of a triangle from sides', 'scalene isosceles equilateral'],
  inputs: [
    { id: 'a', info: 'Length of the first side. Angle A is opposite this side.', label: 'Side a', type: 'number', default: 5, min: 0 },
    { id: 'b', info: 'Length of the second side. Angle B is opposite this side.', label: 'Side b', type: 'number', default: 6, min: 0 },
    { id: 'c', info: 'Length of the third side. Angle C is opposite this side.', label: 'Side c', type: 'number', default: 7, min: 0 },
  ],
  outputs: [
    { id: 'area', info: 'The space inside the triangle, found from the three sides with Heron’s formula.', label: 'Area', primary: true, precision: 6 },
    { id: 'angleA', info: 'The interior angle opposite side a.', label: 'Angle A (opposite a)', ...ANG },
    { id: 'angleB', info: 'The interior angle opposite side b.', label: 'Angle B (opposite b)', ...ANG },
    { id: 'angleC', info: 'The interior angle opposite side c. The three angles always add up to 180°.', label: 'Angle C (opposite c)', ...ANG },
    { id: 'perimeter', info: 'The total length of all three sides.', label: 'Perimeter', precision: 6 },
    { id: 'kind', info: 'The triangle classified by its sides (equilateral, isosceles, scalene) and by its largest angle (acute, right, obtuse).', label: 'Triangle type', format: 'text' },
  ],
  compute: (v) => {
    const a = num(v.a);
    const b = num(v.b);
    const c = num(v.c);
    if (a === null || b === null || c === null) return { area: null };
    if (a <= 0 || b <= 0 || c <= 0) return { area: null, error: 'All sides must be positive.' };
    if (a + b <= c || a + c <= b || b + c <= a)
      return { area: null, error: 'These sides can’t form a triangle: each side must be shorter than the other two combined.' };
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const clamp = (x: number) => Math.min(1, Math.max(-1, x));
    const A = Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c)));
    const B = Math.acos(clamp((a * a + c * c - b * b) / (2 * a * c)));
    const C = Math.PI - A - B;
    const eq = (x: number, y: number) => Math.abs(x - y) <= 1e-9 * Math.max(x, y);
    const sides = eq(a, b) && eq(b, c) ? 'Equilateral' : eq(a, b) || eq(b, c) || eq(a, c) ? 'Isosceles' : 'Scalene';
    const maxAng = Math.max(A, B, C);
    const angleKind = Math.abs(maxAng - Math.PI / 2) < 1e-9 ? 'right' : maxAng > Math.PI / 2 ? 'obtuse' : 'acute';
    return {
      area,
      angleA: A,
      angleB: B,
      angleC: C,
      perimeter: 2 * s,
      kind: `${sides}, ${angleKind}`,
      chart: { type: 'bar', title: 'Angles (they add up to 180°)', categories: ['A', 'B', 'C'], series: [{ name: 'Angle', values: [deg(A), deg(B), deg(C)] }], format: { suffix: '°' } },
      steps: [
        `Semi-perimeter s = (a + b + c) ÷ 2 = (${fmt(a)} + ${fmt(b)} + ${fmt(c)}) ÷ 2 = ${fmt(s)}`,
        `Heron: Area = √(s(s − a)(s − b)(s − c)) = √(${fmt(s)} × ${fmt(s - a)} × ${fmt(s - b)} × ${fmt(s - c)}) = ${fmt(area)}`,
        `Law of cosines: cos A = (b² + c² − a²) ÷ 2bc = ${fmt((b * b + c * c - a * a) / (2 * b * c))} → A = ${fmt(deg(A), 6)}°`,
        `cos B = (a² + c² − b²) ÷ 2ac = ${fmt((a * a + c * c - b * b) / (2 * a * c))} → B = ${fmt(deg(B), 6)}°`,
        `C = 180° − A − B = ${fmt(deg(C), 6)}°`,
      ],
    };
  },
  content: {
    formula: ['s = (a + b + c) ÷ 2', 'Area = √(s(s − a)(s − b)(s − c))   (Heron’s formula)', 'cos A = (b² + c² − a²) ÷ 2bc   (law of cosines)'],
    body: [
      'Three side lengths fix a triangle completely, so you can work out everything else about it. Heron’s formula gives the area directly from the sides, with no need to find a height first: compute the semi-perimeter s, multiply s by its differences from each side, and take the square root.',
      'The angles come from the law of cosines, a generalisation of the Pythagorean theorem that works for any triangle. Once two angles are known, the third is whatever is left of 180°.',
      'Not every set of three lengths makes a triangle. The triangle inequality says each side must be shorter than the sum of the other two; 2, 3 and 6 fail because 2 + 3 < 6, so the short sides can’t meet.',
    ],
    faq: [
      { q: 'How can I tell if a triangle is right-angled from its sides?', a: 'Check whether the squares of the two shorter sides add up to the square of the longest. If a² + b² = c², the angle opposite c is exactly 90°. If the sum is smaller, the triangle is obtuse; if larger, acute.' },
      { q: 'What if I know two sides and an angle instead?', a: 'Use the law of cosines to find the third side first (c² = a² + b² − 2ab·cos C), then enter all three sides here.' },
    ],
  },
  related: ['pythagorean-theorem', 'area', 'slope'],
  examples: [
    { values: { a: 3, b: 4, c: 5 }, expect: { area: 6, angleC: Math.PI / 2, perimeter: 12, kind: 'Scalene, right' }, tolerance: 1e-9 },
    { values: { a: 2, b: 2, c: 2 }, expect: { area: Math.sqrt(3), angleA: Math.PI / 3, kind: 'Equilateral, acute' }, tolerance: 1e-9 },
    { values: { a: 5, b: 6, c: 7 }, expect: { area: 14.69693846 }, tolerance: 1e-8 },
  ],
});
