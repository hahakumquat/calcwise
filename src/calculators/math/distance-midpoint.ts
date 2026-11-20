import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'distance-midpoint',
  title: 'Distance and Midpoint Calculator',
  category: 'math',
  description: 'Find the distance and midpoint between two points in 2D or 3D, with the working shown step by step and the segment plotted on a graph.',
  keywords: ['distance formula calculator', 'midpoint calculator', 'distance between two points', '3d distance calculator', 'midpoint formula', 'distance between two points in 3d'],
  inputs: [
    { id: 'x1', info: 'The x coordinate of the first point.', label: 'x₁', type: 'number', default: 1 },
    { id: 'y1', info: 'The y coordinate of the first point.', label: 'y₁', type: 'number', default: 2 },
    { id: 'z1', info: 'Optional z coordinate of the first point. Leave both z fields blank for 2D.', label: 'z₁ (optional)', type: 'number' },
    { id: 'x2', info: 'The x coordinate of the second point.', label: 'x₂', type: 'number', default: 4 },
    { id: 'y2', info: 'The y coordinate of the second point.', label: 'y₂', type: 'number', default: 6 },
    { id: 'z2', info: 'Optional z coordinate of the second point. Leave both z fields blank for 2D.', label: 'z₂ (optional)', type: 'number' },
  ],
  outputs: [
    { id: 'distance', info: 'The straight-line distance between the two points.', label: 'Distance', primary: true, precision: 6 },
    { id: 'midpoint', info: 'The point exactly halfway between the two points: the average of each coordinate.', label: 'Midpoint', format: 'text' },
    { id: 'dsq', info: 'The squared distance, Δx² + Δy² (+ Δz²). Handy to avoid square roots.', label: 'Distance squared', precision: 6 },
  ],
  compute: (v) => {
    const x1 = num(v.x1), y1 = num(v.y1), x2 = num(v.x2), y2 = num(v.y2);
    const z1 = num(v.z1), z2 = num(v.z2);
    if (x1 === null || y1 === null || x2 === null || y2 === null) return { distance: null, note: 'Enter x and y for both points.' };
    if ((z1 === null) !== (z2 === null)) return { distance: null, error: 'For 3D, fill in both z values; for 2D, leave both blank.' };
    const is3d = z1 !== null && z2 !== null;
    const dx = x2 - x1, dy = y2 - y1, dz = is3d ? (z2 as number) - (z1 as number) : 0;
    const dsq = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(dsq);
    const mid = [(x1 + x2) / 2, (y1 + y2) / 2, ...(is3d ? [((z1 as number) + (z2 as number)) / 2] : [])];
    const midText = `(${mid.map((m) => fmt(m)).join(', ')})`;
    const sq = [`${fmt(dx)}²`, `${fmt(dy)}²`, ...(is3d ? [`${fmt(dz)}²`] : [])].join(' + ');
    return {
      distance,
      dsq,
      midpoint: midText,
      tone: 'good',
      badge: is3d ? '3D' : '2D',
      chart: {
        type: 'scatter',
        title: is3d ? 'The two points seen from the front (x and y only)' : 'The two points and the midpoint',
        points: [[x1, y1], [mid[0], mid[1]], [x2, y2]],
        xLabel: 'x',
        yLabel: 'y',
      },
      steps: [
        `Δx = ${fmt(x2)} − ${fmt(x1)} = ${fmt(dx)}, Δy = ${fmt(y2)} − ${fmt(y1)} = ${fmt(dy)}${is3d ? `, Δz = ${fmt(z2 as number)} − ${fmt(z1 as number)} = ${fmt(dz)}` : ''}`,
        `Distance = √(${sq}) = √${fmt(dsq)} = ${fmt(distance, 6)}`,
        `Midpoint = average of each coordinate = ${midText}`,
      ],
    };
  },
  content: {
    formula: ['d = √((x₂ − x₁)² + (y₂ − y₁)²)', '3D: d = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²)', 'Midpoint = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2, (z₁ + z₂) ÷ 2)'],
    body: [
      'The distance formula is the Pythagorean theorem in disguise. The horizontal gap Δx and the vertical gap Δy are the two legs of a right triangle, and the distance between the points is the hypotenuse: √(Δx² + Δy²). For points (1, 2) and (4, 6), Δx = 3 and Δy = 4, so the distance is 5.',
      'The midpoint is simply the average of the coordinates. Add the two x values and halve them, then do the same for y. The midpoint of (1, 2) and (4, 6) is (2.5, 4).',
      'To work in 3D, fill in both z values. The formula gains one more squared term, and the midpoint gains a z average. Leave both z boxes empty for a flat 2D problem. If you also want the slope or line equation, use the slope calculator.',
    ],
    faq: [
      { q: 'What is the distance between (1, 2) and (4, 6)?', a: '5. Δx = 3, Δy = 4, and √(9 + 16) = √25 = 5. The midpoint is (2.5, 4).' },
      { q: 'What is the distance between (−3, 4) and (5, −2)?', a: '10. Δx = 8 and Δy = −6, so √(64 + 36) = √100 = 10. The midpoint is (1, 1).' },
      { q: 'How do I find a distance in 3D?', a: 'Add a squared z difference under the root. From (0, 0, 0) to (1, 2, 2) the distance is √(1 + 4 + 4) = 3. Fill in both z fields in the calculator.' },
      { q: 'Does the order of the points matter?', a: 'No. Squaring removes the sign, so the distance is the same either way round, and the midpoint is the same too.' },
    ],
    sources: [
      { label: 'Wolfram MathWorld: Distance', url: 'https://mathworld.wolfram.com/Distance.html' },
      { label: 'Wikipedia: Euclidean distance', url: 'https://en.wikipedia.org/wiki/Euclidean_distance' },
    ],
  },
  related: ['slope', 'pythagorean-theorem', 'triangle', 'square-root'],
  examples: [
    { values: { x1: 1, y1: 2, x2: 4, y2: 6 }, expect: { distance: 5, midpoint: '(2.5, 4)', dsq: 25 } },
    { values: { x1: -3, y1: 4, x2: 5, y2: -2 }, expect: { distance: 10, midpoint: '(1, 1)', dsq: 100 } },
    // 3D: sqrt(1+4+4) = 3; midpoint (0.5, 1, 1)
    { values: { x1: 0, y1: 0, z1: 0, x2: 1, y2: 2, z2: 2 }, expect: { distance: 3, midpoint: '(0.5, 1, 1)', dsq: 9 } },
  ],
});
