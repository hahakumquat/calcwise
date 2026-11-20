import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'linear-equation',
  title: 'Linear Equation Solver (ax + b = c)',
  category: 'math',
  description: 'Solve a one-variable linear equation ax + b = c. Get x, the steps to isolate it and a check that puts the answer back into the equation.',
  keywords: ['linear equation solver', 'solve ax + b = c', 'one variable equation calculator', 'solve for x calculator', 'algebra equation solver', 'linear equation calculator'],
  updated: '2026-11-20',
  inputs: [
    { id: 'a', label: 'a (coefficient of x)', type: 'number', default: 2, info: 'The number multiplying x. It cannot be 0.' },
    { id: 'b', label: 'b (number added to ax)', type: 'number', default: 3, info: 'The constant on the left side. Use a negative number for subtraction.' },
    { id: 'c', label: 'c (right-hand side)', type: 'number', default: 11, info: 'The value the left side equals.' },
  ],
  outputs: [
    { id: 'x', label: 'x', primary: true, precision: 6, info: 'x = (c − b) ÷ a.' },
    { id: 'check', label: 'Check: a·x + b', precision: 6, info: 'The answer put back into the left side. It should equal c.' },
  ],
  compute: (v) => {
    const a = num(v.a), b = num(v.b), c = num(v.c);
    if (a === null || b === null || c === null) return { x: null, note: 'Enter all three numbers.' };
    if (a === 0) {
      return {
        x: null,
        tone: 'warn',
        note: b === c ? 'With a = 0 the equation reads b = c, which is true for every x: infinitely many solutions.' : 'With a = 0 the x term vanishes and b ≠ c, so there is no solution.',
      };
    }
    const diff = c - b;
    const x = diff / a;
    const span = Math.max(Math.abs(x), 1);
    const xs: number[] = [];
    for (let i = -5; i <= 5; i++) xs.push(x + (span * i) / 5);
    return {
      x,
      check: a * x + b,
      tone: 'good',
      badge: `x = ${fmt(x, 4)}`,
      note: `Subtract ${fmt(b)} from both sides, then divide by ${fmt(a)}: x = ${fmt(x, 4)}.`,
      chart: {
        type: 'line',
        title: 'Where ax + b meets c',
        x: xs,
        xLabel: 'x',
        series: [
          { name: 'ax + b', values: xs.map((t) => a * t + b) },
          { name: 'c', values: xs.map(() => c) },
        ],
      },
      steps: [
        `${fmt(a)}x + ${fmt(b)} = ${fmt(c)}`,
        `${fmt(a)}x = ${fmt(c)} − ${fmt(b)} = ${fmt(diff)}`,
        `x = ${fmt(diff)} ÷ ${fmt(a)} = ${fmt(x, 6)}`,
      ],
    };
  },
  content: {
    formula: ['ax + b = c', 'ax = c − b', 'x = (c − b) ÷ a'],
    body: [
      'A linear equation in one variable has x to the first power only. The goal is to get x alone: do the same thing to both sides until nothing else is left next to it.',
      'For ax + b = c there are two moves. Subtract b from both sides to get ax = c − b, then divide both sides by a to get x = (c − b) ÷ a. That works for any a except 0.',
      'If a is 0 the x term disappears. Then the equation is either always true (when b equals c) or never true (when they differ). The calculator says which. Always check by putting x back into the original equation.',
    ],
    faq: [
      { q: 'How do I solve 2x + 3 = 11?', a: 'Subtract 3 from both sides to get 2x = 8, then divide by 2: x = 4. Check: 2 × 4 + 3 = 11.' },
      { q: 'What if x has a negative coefficient?', a: 'The same steps work. For −3x + 4 = 10: −3x = 6, so x = −2. Check: −3 × (−2) + 4 = 10.' },
      { q: 'What if a is 0?', a: 'Then there is no x to solve for. If b equals c every x works; if not, no x works.' },
      { q: 'Does it work with decimals and fractions?', a: 'Yes for decimals. Enter a fraction as a decimal, for example 0.5 for 1/2.' },
    ],
    sources: [{ label: 'Wolfram MathWorld: Linear Equation', url: 'https://mathworld.wolfram.com/LinearEquation.html' }],
  },
  related: ['system-of-equations', 'quadratic', 'slope'],
  examples: [
    // 2x + 3 = 11 -> 2x = 8 -> x = 4; check 2×4+3 = 11.
    { values: { a: 2, b: 3, c: 11 }, expect: { x: 4, check: 11 }, tolerance: 1e-9 },
    // −3x + 4 = 10 -> −3x = 6 -> x = −2; check −3×−2+4 = 10.
    { values: { a: -3, b: 4, c: 10 }, expect: { x: -2, check: 10 }, tolerance: 1e-9 },
    // 5x − 7 = 18 -> 5x = 25 -> x = 5.
    { values: { a: 5, b: -7, c: 18 }, expect: { x: 5, check: 18 }, tolerance: 1e-9 },
  ],
});
