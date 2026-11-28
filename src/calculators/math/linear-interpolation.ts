import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'linear-interpolation',
  title: 'Linear Interpolation Calculator',
  seoTitle: 'Linear Interpolation Calculator',
  metaDescription: 'Find y for any x (or x for any y) on the straight line between two known points. Flags extrapolation and shows the working step by step.',
  updated: '2026-11-28',
  category: 'math',
  description: 'Interpolate y from x, or x from y, between two known points, with a warning when you extrapolate.',
  keywords: ['linear interpolation calculator', 'interpolate between two points', 'interpolation formula', 'find y given x between two points', 'extrapolation calculator', 'lerp'],
  inputs: [
    { id: 'x1', label: 'x₁', type: 'number', default: 2, info: 'The x value of the first known point.' },
    { id: 'y1', label: 'y₁', type: 'number', default: 10, info: 'The y value of the first known point.' },
    { id: 'x2', label: 'x₂', type: 'number', default: 6, info: 'The x value of the second known point. Must differ from x₁.' },
    { id: 'y2', label: 'y₂', type: 'number', default: 30, info: 'The y value of the second known point.' },
    {
      id: 'mode',
      label: 'Find',
      type: 'select',
      segmented: true,
      default: 'y',
      info: 'Choose y to look up a y value for a given x, or x to look up an x value for a given y.',
      options: [
        { value: 'y', label: 'y from x' },
        { value: 'x', label: 'x from y' },
      ],
    },
    { id: 'x', label: 'x', type: 'number', default: 3, info: 'The x value to look up.', showWhen: { input: 'mode', is: 'y' } },
    { id: 'y', label: 'y', type: 'number', default: 25, info: 'The y value to look up.', showWhen: { input: 'mode', is: 'x' } },
  ],
  outputs: [
    { id: 'result', label: 'Result', primary: true, precision: 6, info: 'The interpolated y (or x) on the straight line through the two points.' },
    { id: 'slope', label: 'Slope', precision: 6, info: '(y₂ − y₁) ÷ (x₂ − x₁), the change in y per 1 of x.' },
    { id: 'kind', label: 'Type', format: 'text', info: 'Interpolation if the value is between your two points, extrapolation if it is outside.' },
  ],
  compute: (v) => {
    const x1 = num(v.x1), y1 = num(v.y1), x2 = num(v.x2), y2 = num(v.y2);
    if (x1 === null || y1 === null || x2 === null || y2 === null) return { result: null };
    if (x1 === x2) return { result: null, error: 'x₁ and x₂ must be different, otherwise the line is vertical.' };
    const slope = (y2 - y1) / (x2 - x1);
    const findX = String(v.mode) === 'x';
    let result: number;
    let inside: boolean;
    let step: string;
    let name: string;
    if (findX) {
      const y = num(v.y);
      if (y === null) return { result: null };
      if (y1 === y2) return { result: null, error: 'y₁ and y₂ must be different to find x from y.' };
      result = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
      inside = y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
      step = `x = ${fmt(x1)} + (${fmt(y)} − ${fmt(y1)}) × (${fmt(x2)} − ${fmt(x1)}) ÷ (${fmt(y2)} − ${fmt(y1)}) = ${fmt(result)}`;
      name = 'x';
    } else {
      const x = num(v.x);
      if (x === null) return { result: null };
      result = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
      inside = x >= Math.min(x1, x2) && x <= Math.max(x1, x2);
      step = `y = ${fmt(y1)} + (${fmt(x)} − ${fmt(x1)}) × (${fmt(y2)} − ${fmt(y1)}) ÷ (${fmt(x2)} − ${fmt(x1)}) = ${fmt(result)}`;
      name = 'y';
    }
    const points: [number, number][] = [[x1, y1], [x2, y2], findX ? [result, num(v.y) as number] : [num(v.x) as number, result]];
    return {
      result,
      slope,
      kind: inside ? 'Interpolation (between your points)' : 'Extrapolation (outside your points)',
      tone: inside ? 'good' : 'warn',
      badge: inside ? 'Interpolated' : 'Extrapolated',
      chart: { type: 'scatter', title: 'Your points and the line through them', points, line: { slope, intercept: y1 - slope * x1 }, xLabel: 'x', yLabel: 'y' },
      steps: [`Slope = (${fmt(y2)} − ${fmt(y1)}) ÷ (${fmt(x2)} − ${fmt(x1)}) = ${fmt(slope)}`, step],
      note: inside
        ? `${name} = ${fmt(result)} lies between your two known points, so this is a reliable straight-line estimate if the data is roughly linear.`
        : `Warning: the value you entered is outside your two points, so this is extrapolation. The straight line may not hold out there; treat ${name} = ${fmt(result)} with care.`,
    };
  },
  content: {
    formula: [
      'y = y₁ + (x − x₁) × (y₂ − y₁) ÷ (x₂ − x₁)',
      'x = x₁ + (y − y₁) × (x₂ − x₁) ÷ (y₂ − y₁)',
      'Slope = (y₂ − y₁) ÷ (x₂ − x₁)',
    ],
    body: [
      'Linear interpolation estimates a value between two known points by assuming they sit on a straight line. It is handy for reading between rows of a table, such as a rate or a lookup chart.',
      'With points (2, 10) and (6, 30) the slope is 5. At x = 3, y = 10 + 1 × 5 = 15. At x = 8, which is outside the points, the same line gives y = 40, and the calculator flags that as extrapolation.',
    ],
    sections: [
      {
        heading: 'Interpolation versus extrapolation',
        paragraphs: [
          'Between your two points the straight line is usually a fair guess. Beyond them it is a projection, and real data often curves, so be cautious.',
        ],
      },
    ],
    faq: [
      { q: 'What is the linear interpolation formula?', a: 'y = y₁ + (x − x₁) × (y₂ − y₁) ÷ (x₂ − x₁). It finds the point on the straight line through (x₁, y₁) and (x₂, y₂).' },
      { q: 'What is y at x = 3 for (2, 10) and (6, 30)?', a: 'The slope is 5, so y = 10 + (3 − 2) × 5 = 15.' },
      { q: 'What happens if x is outside my two points?', a: 'The calculator still extends the line (x = 8 gives y = 40 for the points above) but labels it extrapolation and shows a warning.' },
      { q: 'Why does it say x₁ and x₂ must differ?', a: 'If both x values match, the line is vertical and y cannot be worked out. Going from y to x also needs y₁ and y₂ to differ.' },
      { q: 'How do I find x from y?', a: 'Switch Find to "x from y". For y = 25 on the same points, x = 2 + (25 − 10) × 4 ÷ 20 = 5.' },
    ],
    sources: [],
  },
  related: ['slope', 'linear-equation', 'distance-midpoint', 'percentage-change'],
  examples: [
    // slope 20/4=5; y=10+1*5=15
    { values: { x1: 2, y1: 10, x2: 6, y2: 30, mode: 'y', x: 3 }, expect: { result: 15, slope: 5, kind: 'Interpolation (between your points)' } },
    // x=8: 10+6*5=40, extrapolated
    { values: { x1: 2, y1: 10, x2: 6, y2: 30, mode: 'y', x: 8 }, expect: { result: 40, kind: 'Extrapolation (outside your points)' } },
    // y=25: 2+15*4/20=5
    { values: { x1: 2, y1: 10, x2: 6, y2: 30, mode: 'x', y: 25 }, expect: { result: 5 } },
  ],
});
