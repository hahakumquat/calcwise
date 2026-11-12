import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'pythagorean-theorem',
  title: 'Pythagorean Theorem Calculator',
  category: 'math',
  description: 'Enter any two sides of a right triangle to find the third, plus its angles, area and perimeter.',
  keywords: ['a² + b² = c²', 'hypotenuse', 'right triangle', 'missing side', 'pythagoras'],
  popular: true,
  inputs: [
    {
      id: 'find', info: 'Choose which side of the right triangle is missing. You then enter the other two.',
      label: 'Solve for',
      type: 'select',
      default: 'c',
      segmented: true,
      options: [
        { value: 'c', label: 'Hypotenuse c' },
        { value: 'a', label: 'Leg a' },
        { value: 'b', label: 'Leg b' },
      ],
    },
    { id: 'a', info: 'One of the two shorter sides that meet at the right angle.', label: 'Leg a', type: 'number', default: 3, min: 0, showWhen: { input: 'find', is: ['b', 'c'] } },
    { id: 'b', info: 'The other shorter side that meets leg a at the right angle.', label: 'Leg b', type: 'number', default: 4, min: 0, showWhen: { input: 'find', is: ['a', 'c'] } },
    { id: 'c', info: 'The longest side, opposite the right angle. It must be longer than either leg.', label: 'Hypotenuse c', type: 'number', default: 5, min: 0, showWhen: { input: 'find', is: ['a', 'b'] } },
  ],
  outputs: [
    { id: 'missing', info: 'The length of the side you asked to solve for.', label: 'Missing side', primary: true, precision: 6 },
    { id: 'sideA', info: 'Length of leg a.', label: 'Leg a', precision: 6 },
    { id: 'sideB', info: 'Length of leg b.', label: 'Leg b', precision: 6 },
    { id: 'sideC', info: 'Length of the hypotenuse c.', label: 'Hypotenuse c', precision: 6 },
    { id: 'angleA', info: 'The angle opposite leg a. Together with β it adds up to 90°.', label: 'Angle opposite a (α)', unit: 'angle', units: ['deg', 'rad'], defaultUnit: 'deg', precision: 4 },
    { id: 'angleB', info: 'The angle opposite leg b, equal to 90° minus α.', label: 'Angle opposite b (β)', unit: 'angle', units: ['deg', 'rad'], defaultUnit: 'deg', precision: 4 },
    { id: 'area', info: 'Space inside the triangle: half of leg a times leg b.', label: 'Area', precision: 6 },
    { id: 'perimeter', info: 'Total length of all three sides added together.', label: 'Perimeter', precision: 6 },
  ],
  compute: (v) => {
    const find = v.find as string | null | undefined;
    let a = find === 'a' ? null : num(v.a);
    let b = find === 'b' ? null : num(v.b);
    let c = find === 'c' ? null : num(v.c);
    const given = [a, b, c].filter((x) => x !== null).length;
    if (given < 2) return { missing: null };
    if (given === 3) return { missing: null, error: 'Leave one side blank — the calculator finds the missing one.' };
    if ([a, b, c].some((x) => x !== null && x <= 0)) return { missing: null, error: 'Side lengths must be positive.' };
    const steps = ['a² + b² = c²'];
    let missing: number;
    if (c === null) {
      c = missing = Math.hypot(a!, b!);
      steps.push(`c = √(a² + b²) = √(${fmt(a! ** 2)} + ${fmt(b! ** 2)}) = √${fmt(a! ** 2 + b! ** 2)} = ${fmt(c)}`);
    } else {
      const leg = (a ?? b)!;
      if (leg >= c) return { missing: null, error: 'The hypotenuse must be the longest side — make c larger than the leg.' };
      missing = Math.sqrt(c * c - leg * leg);
      steps.push(`${a === null ? 'a' : 'b'} = √(c² − ${a === null ? 'b' : 'a'}²) = √(${fmt(c ** 2)} − ${fmt(leg ** 2)}) = √${fmt(c ** 2 - leg ** 2)} = ${fmt(missing)}`);
      if (a === null) a = missing;
      else b = missing;
    }
    const A = a!;
    const B = b!;
    const angleA = Math.atan2(A, B);
    const solved = find === 'a' ? 0 : find === 'b' ? 1 : find === 'c' ? 2 : v.c === null || v.c === undefined ? 2 : v.a === null || v.a === undefined ? 0 : 1;
    steps.push(`α = arctan(a ÷ b) = ${fmt((angleA * 180) / Math.PI, 6)}°, β = 90° − α = ${fmt(90 - (angleA * 180) / Math.PI, 6)}°`);
    steps.push(`Area = ½ab = ${fmt((A * B) / 2)}`);
    return {
      missing,
      sideA: A,
      sideB: B,
      sideC: c,
      angleA,
      angleB: Math.PI / 2 - angleA,
      area: (A * B) / 2,
      perimeter: A + B + c,
      chart: { type: 'bar', title: 'Side lengths', categories: ['Leg a', 'Leg b', 'Hypotenuse c'], series: [{ name: 'Length', values: [A, B, c] }], highlight: solved },
      steps,
    };
  },
  content: {
    formula: ['a² + b² = c²', 'c = √(a² + b²),  a = √(c² − b²)'],
    body: [
      'In any right triangle, the square of the hypotenuse (the side opposite the right angle) equals the sum of the squares of the other two sides, called the legs. This relationship, credited to the Greek mathematician Pythagoras, lets you find any side when you know the other two.',
      'To find the hypotenuse, add the squares of the legs and take the square root. To find a leg, subtract the square of the known leg from the square of the hypotenuse, then take the square root. The hypotenuse is always the longest side, so a leg can never be longer than it.',
      'Some right triangles have whole-number sides, called Pythagorean triples: 3-4-5, 5-12-13, 8-15-17 and 7-24-25 are the most common, and any multiple of one (like 6-8-10) works too. Builders use the 3-4-5 triple to check that corners are square.',
    ],
    faq: [
      { q: 'Does the theorem work for triangles without a right angle?', a: 'No. For other triangles use the law of cosines, c² = a² + b² − 2ab·cos C, which reduces to the Pythagorean theorem when C = 90°. The triangle calculator handles any three sides.' },
      { q: 'How do I find distance on a graph with it?', a: 'The horizontal and vertical gaps between two points are the legs, and the straight-line distance is the hypotenuse: d = √(Δx² + Δy²).' },
    ],
  },
  related: ['triangle', 'slope', 'square-root', 'area'],
  examples: [
    { values: { find: 'c', a: 3, b: 4, c: null }, expect: { missing: 5, area: 6, perimeter: 12 } },
    { values: { find: 'b', a: 5, b: null, c: 13 }, expect: { missing: 12, sideB: 12 } },
    { values: { find: 'c', a: 1, b: 1, c: null }, expect: { missing: Math.SQRT2, angleA: Math.PI / 4 }, tolerance: 1e-12 },
  ],
});
