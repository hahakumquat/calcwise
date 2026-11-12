import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'slope',
  title: 'Slope Calculator',
  category: 'math',
  description: 'Find the slope, y-intercept, line equation, distance and angle between two points.',
  keywords: ['slope formula', 'rise over run', 'gradient', 'line equation', 'y = mx + b', 'two points'],
  popular: true,
  inputs: [
    { id: 'x1', info: 'The horizontal coordinate of the first point.', label: 'x₁', type: 'number', default: 1 },
    { id: 'y1', info: 'The vertical coordinate of the first point.', label: 'y₁', type: 'number', default: 2 },
    { id: 'x2', info: 'The horizontal coordinate of the second point.', label: 'x₂', type: 'number', default: 4 },
    { id: 'y2', info: 'The vertical coordinate of the second point.', label: 'y₂', type: 'number', default: 8 },
  ],
  outputs: [
    { id: 'slope', info: 'Rise over run: how much y changes for every 1 unit increase in x.', label: 'Slope (m)', primary: true, precision: 6 },
    { id: 'equation', info: 'The line through both points in slope-intercept form, y = mx + b.', label: 'Equation of the line', format: 'text' },
    { id: 'intercept', info: 'The y-value where the line crosses the y-axis (where x = 0).', label: 'y-intercept (b)', precision: 6 },
    { id: 'distance', info: 'The straight-line distance between the two points.', label: 'Distance between points', precision: 6 },
    { id: 'angle', info: 'The angle the line makes with the positive x-axis.', label: 'Angle of inclination', unit: 'angle', units: ['deg', 'rad'], defaultUnit: 'deg', precision: 4 },
    { id: 'midpoint', info: 'The point exactly halfway between the two points.', label: 'Midpoint', format: 'text' },
  ],
  compute: (v) => {
    const x1 = num(v.x1);
    const y1 = num(v.y1);
    const x2 = num(v.x2);
    const y2 = num(v.y2);
    if (x1 === null || y1 === null || x2 === null || y2 === null) return { slope: null };
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);
    const midpoint = `(${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`;
    const points: [number, number][] = [
      [x1, y1],
      [x2, y2],
    ];
    if (dx === 0 && dy === 0) return { slope: null, error: 'The two points are the same — a line needs two different points.' };
    const steps = [`Rise Δy = y₂ − y₁ = ${fmt(y2)} − ${fmt(y1)} = ${fmt(dy)}`, `Run Δx = x₂ − x₁ = ${fmt(x2)} − ${fmt(x1)} = ${fmt(dx)}`];
    if (dx === 0) {
      steps.push('Run is 0, so the slope is undefined: the line is vertical');
      return { slope: null, equation: `x = ${fmt(x1)}`, intercept: null, distance, angle: Math.PI / 2, midpoint, steps, chart: { type: 'scatter', title: 'Vertical line through both points', points, xLabel: 'x', yLabel: 'y' }, note: 'Vertical line — slope is undefined.' };
    }
    const m = dy / dx;
    const b = y1 - m * x1;
    const bAbs = fmt(Math.abs(b));
    const mStr = m === 1 ? '' : m === -1 ? '-' : fmt(m);
    const equation = m === 0 ? `y = ${fmt(b)}` : `y = ${mStr}x${b === 0 ? '' : b > 0 ? ` + ${bAbs}` : ` − ${bAbs}`}`;
    const angle = Math.atan(m);
    steps.push(`Slope m = Δy ÷ Δx = ${fmt(dy)} ÷ ${fmt(dx)} = ${fmt(m)}`);
    steps.push(`Intercept b = y₁ − m·x₁ = ${fmt(y1)} − ${fmt(m)} × ${fmt(x1)} = ${fmt(b)}`);
    steps.push(`Distance = √(Δx² + Δy²) = √(${fmt(dx * dx)} + ${fmt(dy * dy)}) = ${fmt(distance)}`);
    steps.push(`Angle = arctan(m) = ${fmt((angle * 180) / Math.PI, 6)}°`);
    return {
      slope: m,
      equation,
      intercept: b,
      distance,
      angle,
      midpoint,
      chart: { type: 'scatter', title: 'The two points and the line through them', points, line: { slope: m, intercept: b, label: equation }, xLabel: 'x', yLabel: 'y' },
      steps,
      note: m > 0 ? 'Positive slope: the line rises left to right.' : m < 0 ? 'Negative slope: the line falls left to right.' : 'Zero slope: horizontal line.',
    };
  },
  content: {
    formula: ['m = (y₂ − y₁) ÷ (x₂ − x₁)', 'b = y₁ − m·x₁  →  y = mx + b', 'd = √((x₂ − x₁)² + (y₂ − y₁)²)', 'θ = arctan(m)'],
    body: [
      'Slope measures how steep a line is: how much it rises (or falls) for every one unit you move to the right. It is often remembered as “rise over run”. A slope of 2 means the line goes up 2 units for each 1 unit across.',
      'Once you have the slope, the y-intercept b tells you where the line crosses the y-axis. Plug either point into y = mx + b and solve for b. Together, m and b give the slope-intercept form of the line.',
      'The distance between the points comes from the Pythagorean theorem, treating the run and rise as the two legs of a right triangle. The angle of inclination is the angle the line makes with the positive x-axis.',
    ],
    faq: [
      { q: 'What does an undefined slope mean?', a: 'If both points have the same x-coordinate, the run is zero and you would be dividing by zero. The line is vertical and its equation is x = constant.' },
      { q: 'Does the order of the points matter?', a: 'No. Swapping the points flips the sign of both the rise and the run, so their ratio — the slope — stays the same.' },
      { q: 'How do I write the point-slope form?', a: 'Use y − y₁ = m(x − x₁). With m = 2 and the point (1, 2), that is y − 2 = 2(x − 1), which simplifies to y = 2x.' },
    ],
  },
  related: ['pythagorean-theorem', 'triangle', 'correlation', 'quadratic'],
  examples: [
    { values: { x1: 1, y1: 2, x2: 4, y2: 8 }, expect: { slope: 2, intercept: 0, equation: 'y = 2x', distance: 6.708203932 }, tolerance: 1e-9 },
    { values: { x1: 0, y1: 5, x2: 2, y2: 1 }, expect: { slope: -2, intercept: 5, equation: 'y = -2x + 5' } },
    { values: { x1: 1, y1: 1, x2: 2, y2: 2 }, expect: { angle: Math.PI / 4 }, tolerance: 1e-12 },
  ],
});
