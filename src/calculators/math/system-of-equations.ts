import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'system-of-equations',
  title: 'System of Equations Calculator (2 × 2)',
  category: 'math',
  description: 'Solve two linear equations in two unknowns with Cramer’s rule. See the determinants, the solution and the intersection point plotted, step by step.',
  keywords: ['system of equations calculator', 'solve system of linear equations', 'cramers rule calculator', '2x2 system solver', 'simultaneous equations calculator', 'two equations two unknowns'],
  updated: '2026-11-20',
  inputs: [
    { id: 'a1', label: 'a₁ (x in equation 1)', type: 'number', default: 2, info: 'Coefficient of x in a₁x + b₁y = c₁.' },
    { id: 'b1', label: 'b₁ (y in equation 1)', type: 'number', default: 1, info: 'Coefficient of y in a₁x + b₁y = c₁.' },
    { id: 'c1', label: 'c₁ (constant in equation 1)', type: 'number', default: 5, info: 'The right-hand side of equation 1.' },
    { id: 'a2', label: 'a₂ (x in equation 2)', type: 'number', default: 1, info: 'Coefficient of x in a₂x + b₂y = c₂.' },
    { id: 'b2', label: 'b₂ (y in equation 2)', type: 'number', default: -1, info: 'Coefficient of y in a₂x + b₂y = c₂.' },
    { id: 'c2', label: 'c₂ (constant in equation 2)', type: 'number', default: 1, info: 'The right-hand side of equation 2.' },
  ],
  outputs: [
    { id: 'x', label: 'x', primary: true, precision: 6, info: 'The x value of the solution: x = Dₓ ÷ D.' },
    { id: 'y', label: 'y', precision: 6, info: 'The y value of the solution: y = Dᵧ ÷ D.' },
    { id: 'det', label: 'Determinant D', precision: 6, info: 'D = a₁b₂ − a₂b₁. If D is 0 there is no single solution.' },
  ],
  compute: (v) => {
    const a1 = num(v.a1), b1 = num(v.b1), c1 = num(v.c1), a2 = num(v.a2), b2 = num(v.b2), c2 = num(v.c2);
    if (a1 === null || b1 === null || c1 === null || a2 === null || b2 === null || c2 === null) return { x: null, note: 'Enter all six numbers.' };
    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;
    if (D === 0) {
      const same = Dx === 0 && Dy === 0 && (a1 !== 0 || b1 !== 0 || a2 !== 0 || b2 !== 0);
      return {
        x: null,
        det: 0,
        tone: 'warn',
        note: same
          ? 'D = 0 and the equations describe the same line, so there are infinitely many solutions.'
          : 'D = 0 and the lines are parallel, so there is no solution.',
        steps: [`D = ${fmt(a1)} × ${fmt(b2)} − ${fmt(a2)} × ${fmt(b1)} = 0`],
      };
    }
    const x = Dx / D;
    const y = Dy / D;
    return {
      x,
      y,
      det: D,
      tone: 'good',
      badge: `x = ${fmt(x, 4)}, y = ${fmt(y, 4)}`,
      note: `The two lines cross at one point, (${fmt(x, 4)}, ${fmt(y, 4)}).`,
      chart: {
        type: 'scatter',
        title: 'Where the two lines cross',
        points: [[x, y]],
        xLabel: 'x',
        yLabel: 'y',
      },
      steps: [
        `D = ${fmt(a1)} × ${fmt(b2)} − ${fmt(a2)} × ${fmt(b1)} = ${fmt(D)}`,
        `Dₓ = ${fmt(c1)} × ${fmt(b2)} − ${fmt(c2)} × ${fmt(b1)} = ${fmt(Dx)}`,
        `Dᵧ = ${fmt(a1)} × ${fmt(c2)} − ${fmt(a2)} × ${fmt(c1)} = ${fmt(Dy)}`,
        `x = ${fmt(Dx)} ÷ ${fmt(D)} = ${fmt(x, 6)}, y = ${fmt(Dy)} ÷ ${fmt(D)} = ${fmt(y, 6)}`,
      ],
    };
  },
  content: {
    formula: ['a₁x + b₁y = c₁ and a₂x + b₂y = c₂', 'D = a₁b₂ − a₂b₁', 'Dₓ = c₁b₂ − c₂b₁, Dᵧ = a₁c₂ − a₂c₁', 'x = Dₓ ÷ D, y = Dᵧ ÷ D'],
    body: [
      'A 2 × 2 system is two straight lines. Solving it means finding the point where both equations are true at once, which is where the lines cross. Cramer’s rule does this with three small determinants.',
      'Write each equation as ax + by = c, with the x terms, y terms and constants lined up. The determinant D = a₁b₂ − a₂b₁ tells you whether there is one answer. If D is not zero, the lines cross exactly once and x = Dₓ ÷ D, y = Dᵧ ÷ D.',
      'If D is zero the lines have the same slope. They are either the same line, which gives infinitely many solutions, or parallel lines, which give none. The calculator tells you which.',
      'Check your answer by putting x and y back into both original equations.',
    ],
    faq: [
      { q: 'How do I solve 2x + y = 5 and x − y = 1?', a: 'D = 2 × (−1) − 1 × 1 = −3. Dₓ = 5 × (−1) − 1 × 1 = −6, so x = 2. Dᵧ = 2 × 1 − 1 × 5 = −3, so y = 1.' },
      { q: 'What does D = 0 mean?', a: 'The lines have equal slopes. If the equations are multiples of each other there are infinitely many solutions; otherwise the lines are parallel and there are none.' },
      { q: 'What is Cramer’s rule?', a: 'A formula that solves a linear system with determinants: each unknown equals the determinant with its column replaced by the constants, divided by D.' },
      { q: 'Does it work with decimals and negatives?', a: 'Yes. Enter any numbers, including decimals and negatives.' },
    ],
    sources: [{ label: 'Wolfram MathWorld: Cramer’s Rule', url: 'https://mathworld.wolfram.com/CramersRule.html' }],
  },
  related: ['quadratic', 'slope', 'distance-midpoint'],
  examples: [
    // 2x + y = 5, x − y = 1: D = −3, Dx = −6, Dy = −3 -> x = 2, y = 1.
    { values: { a1: 2, b1: 1, c1: 5, a2: 1, b2: -1, c2: 1 }, expect: { x: 2, y: 1, det: -3 }, tolerance: 1e-9 },
    // x + y = 10, x − y = 2: D = −2, Dx = 10(−1) − 2(1) = −12, Dy = 1×2 − 1×10 = −8 -> x = 6, y = 4.
    { values: { a1: 1, b1: 1, c1: 10, a2: 1, b2: -1, c2: 2 }, expect: { x: 6, y: 4, det: -2 }, tolerance: 1e-9 },
  ],
});
