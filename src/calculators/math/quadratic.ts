import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt, plotFn } from '../../lib/helpers/math-extra';

/** Clean tiny floating-point noise for display, e.g. 1.0000000000000002 → 1. */
const par = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
const clean = (x: number) => (Math.abs(x) < 1e-14 ? 0 : Number(x.toPrecision(14)));

export default defineCalculator({
  slug: 'quadratic',
  title: 'Quadratic Equation Solver',
  category: 'math',
  description: 'Solve ax² + bx + c = 0 with the quadratic formula, including complex roots, the vertex and the discriminant.',
  keywords: ['quadratic formula', 'solve quadratic', 'roots', 'discriminant', 'vertex', 'parabola', 'complex roots'],
  inputs: [
    { id: 'a', info: 'The number in front of x². If it is 0 the equation is linear instead of quadratic.', label: 'a (x² coefficient)', type: 'number', default: 1 },
    { id: 'b', info: 'The number in front of x. Use 0 if there is no x term.', label: 'b (x coefficient)', type: 'number', default: -3 },
    { id: 'c', info: 'The constant term with no x. Use 0 if there is none.', label: 'c (constant)', type: 'number', default: -10 },
  ],
  outputs: [
    { id: 'roots', info: 'The values of x that make ax² + bx + c equal zero — where the parabola crosses the x-axis.', label: 'Solutions', format: 'text', primary: true },
    { id: 'x1', info: 'The larger real root (or the only root).', label: 'x₁', precision: 8 },
    { id: 'x2', info: 'The smaller real root.', label: 'x₂', precision: 8 },
    { id: 'discriminant', info: 'b² − 4ac. Positive means two real roots, zero means one repeated root, negative means complex roots.', label: 'Discriminant (b² − 4ac)', precision: 8 },
    { id: 'rootType', info: 'What kind of solutions the equation has, based on the discriminant.', label: 'Type of roots', format: 'text' },
    { id: 'vertex', info: 'The turning point of the parabola — its lowest point if a > 0 or highest point if a < 0.', label: 'Vertex', format: 'text' },
    { id: 'axis', info: 'The vertical line through the vertex that splits the parabola into mirror images.', label: 'Axis of symmetry', format: 'text' },
  ],
  compute: (v) => {
    const a = num(v.a);
    const b = num(v.b);
    const c = num(v.c);
    if (a === null || b === null || c === null) return { roots: null };
    if (a === 0) {
      if (b === 0) return { roots: null, error: c === 0 ? 'With a = b = c = 0 every x is a solution.' : 'With a = b = 0 the equation has no solution.' };
      const x = clean(-c / b);
      const w = Math.max(3, Math.abs(x));
      const lineChart = plotFn((t) => b * t + c, x - w, x + w, { name: 'y', title: `y = ${fmt(b)}x + ${fmt(c)}`, xLabel: 'x', markers: [{ x, label: `x = ${fmt(x)}` }] });
      return { roots: `x = ${fmt(x)}`, x1: x, x2: null, chart: lineChart, rootType: 'Linear (a = 0): one root', steps: [`a = 0, so this is linear: ${fmt(b)}x + ${fmt(c)} = 0`, `x = −c ÷ b = ${fmt(x)}`] };
    }
    const D = b * b - 4 * a * c;
    const h = -b / (2 * a);
    const k = c - (b * b) / (4 * a);
    const vertex = `(${fmt(clean(h))}, ${fmt(clean(k))})`;
    const steps = [
      `Discriminant D = b² − 4ac = ${par(b)}² − 4 × ${par(a)} × ${par(c)} = ${fmt(D)}`,
      `x = (−b ± √D) ÷ 2a = (${fmt(-b)} ± √${fmt(D)}) ÷ ${fmt(2 * a)}`,
    ];
    let roots: string;
    let x1: number | null = null;
    let x2: number | null = null;
    let rootType: string;
    if (D > 0) {
      const s = Math.sqrt(D);
      // Numerically stable form avoids cancellation when b² ≫ 4ac.
      const q = -0.5 * (b + Math.sign(b || 1) * s);
      const r1 = q / a;
      const r2 = q !== 0 ? c / q : -r1;
      x1 = clean(Math.max(r1, r2));
      x2 = clean(Math.min(r1, r2));
      roots = `x = ${fmt(x1)} or x = ${fmt(x2)}`;
      rootType = 'Two distinct real roots (D > 0)';
      steps.push(`√D = ${fmt(s)}`, `x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)}`);
    } else if (D === 0) {
      x1 = x2 = clean(h);
      roots = `x = ${fmt(x1)} (double root)`;
      rootType = 'One repeated real root (D = 0)';
      steps.push(`D = 0, so x = −b ÷ 2a = ${fmt(x1)}`);
    } else {
      const re = clean(h);
      const im = clean(Math.sqrt(-D) / (2 * Math.abs(a)));
      const reStr = re === 0 ? '' : `${fmt(re)} `;
      roots = `x = ${reStr}± ${fmt(im)}i`;
      rootType = 'Two complex conjugate roots (D < 0)';
      steps.push(`D < 0, so √D = √${fmt(-D)}·i = ${fmt(Math.sqrt(-D))}i`, `x = ${fmt(re)} ± ${fmt(im)}i`);
    }
    // Plot window: show both real roots (or the vertex region for complex roots) with some margin.
    const half = x1 !== null && x2 !== null && x1 !== x2 ? Math.max(1, (x1 - x2) * 0.8) : Math.max(2, D < 0 ? (2 * Math.sqrt(-D)) / Math.abs(2 * a) : 2);
    const markers =
      x1 !== null && x2 !== null && x1 !== x2
        ? [
            { x: x2, label: `x₂ = ${fmt(x2, 5)}` },
            { x: x1, label: `x₁ = ${fmt(x1, 5)}` },
          ]
        : x1 !== null
          ? [{ x: x1, label: `x = ${fmt(x1, 5)}` }]
          : [{ x: h, label: 'vertex' }];
    const chart = plotFn((t) => a * t * t + b * t + c, h - half, h + half, { name: 'y', title: 'y = ax² + bx + c', xLabel: 'x', markers });
    steps.push(`Vertex: x = −b ÷ 2a = ${fmt(clean(h))}, y = c − b² ÷ 4a = ${fmt(clean(k))}`);
    return {
      roots,
      x1,
      x2,
      discriminant: D,
      rootType,
      vertex,
      axis: `x = ${fmt(clean(h))}`,
      chart,
      steps,
      note: `The parabola opens ${a > 0 ? 'upward (vertex is a minimum)' : 'downward (vertex is a maximum)'}.`,
    };
  },
  content: {
    formula: ['x = (−b ± √(b² − 4ac)) ÷ 2a', 'D = b² − 4ac', 'Vertex = (−b ÷ 2a, c − b² ÷ 4a)'],
    body: [
      'A quadratic equation has the form ax² + bx + c = 0 with a ≠ 0. Its graph is a parabola, and the solutions (roots) are where the parabola crosses the x-axis. The quadratic formula solves every quadratic, even ones that are hard or impossible to factor.',
      'The discriminant D = b² − 4ac, the expression under the square root, tells you what kind of roots to expect before you finish. If D is positive there are two different real roots; if D is zero, the parabola just touches the x-axis and there is one repeated root; if D is negative the parabola never reaches the x-axis and the roots are a pair of complex numbers a ± bi.',
      'The vertex is the turning point of the parabola, halfway between the roots at x = −b/2a. When a is positive the parabola opens upward and the vertex is the lowest point; when a is negative it opens downward and the vertex is the highest point.',
    ],
    faq: [
      { q: 'How can I check my roots?', a: 'Substitute each root back into ax² + bx + c; you should get 0. You can also check that the roots add up to −b/a and multiply to c/a.' },
      { q: 'What if a is zero?', a: 'Then there is no x² term and the equation is linear, bx + c = 0, with the single solution x = −c/b. The calculator handles that case too.' },
      { q: 'What does i mean in complex roots?', a: 'i is the imaginary unit, defined by i² = −1. Complex roots always come in conjugate pairs like 2 + 3i and 2 − 3i when a, b and c are real.' },
    ],
  },
  related: ['square-root', 'slope', 'exponent'],
  examples: [
    { values: { a: 1, b: -3, c: -10 }, expect: { x1: 5, x2: -2, discriminant: 49, roots: 'x = 5 or x = -2' } },
    { values: { a: 1, b: 2, c: 5 }, expect: { roots: 'x = -1 ± 2i', discriminant: -16 } },
    { values: { a: 1, b: -4, c: 4 }, expect: { x1: 2, roots: 'x = 2 (double root)', vertex: '(2, 0)' } },
    { values: { a: 2, b: -4, c: -6 }, expect: { vertex: '(1, -8)', x1: 3, x2: -1 } },
  ],
});
