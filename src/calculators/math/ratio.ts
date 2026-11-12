import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num, gcd } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

/** Number of decimal places needed to write x exactly (up to 9). */
function decimals(x: number): number {
  for (let d = 0; d <= 9; d++) if (Math.abs(Number((x * 10 ** d).toFixed(6)) - Math.round(x * 10 ** d)) < 1e-9) return d;
  return 9;
}

export default defineCalculator({
  slug: 'ratio',
  title: 'Ratio Calculator',
  category: 'math',
  description: 'Simplify a ratio A : B to lowest terms, or solve a proportion A : B = C : x.',
  keywords: ['simplify ratio', 'proportion', 'solve for x', 'equivalent ratios', 'aspect ratio', 'scale'],
  inputs: [
    {
      id: 'mode', info: 'Simplify a ratio to lowest terms, or find the missing value x in a proportion A : B = C : x.',
      label: 'Task',
      type: 'select',
      default: 'solve',
      segmented: true,
      options: [
        { value: 'solve', label: 'Solve A : B = C : x' },
        { value: 'simplify', label: 'Simplify A : B' },
      ],
    },
    { id: 'a', info: 'The first term of the ratio.', label: 'A', type: 'number', default: 3 },
    { id: 'b', info: 'The second term of the ratio.', label: 'B', type: 'number', default: 4 },
    { id: 'c', info: 'The first term of the second ratio, matching A.', label: 'C', type: 'number', default: 15, showWhen: { input: 'mode', is: 'solve' } },
  ],
  outputs: [
    { id: 'result', info: 'The simplified ratio, or the value of x that makes the two ratios equal.', label: 'Answer', format: 'text', primary: true },
    { id: 'x', info: 'The missing fourth term of the proportion.', label: 'x', precision: 8, showWhen: { input: 'mode', is: 'solve' } },
    { id: 'simplified', info: 'A : B divided through by the largest common factor, so the terms are as small as possible.', label: 'A : B in lowest terms', format: 'text' },
    { id: 'quotient', info: 'The ratio written as a single number: A divided by B.', label: 'A ÷ B', precision: 8 },
  ],
  compute: (v) => {
    const a = num(v.a);
    const b = num(v.b);
    if (a === null || b === null) return { result: null };
    if (a === 0 || b === 0) return { result: null, error: 'Both terms of a ratio should be non-zero.' };
    const steps: string[] = [];
    // Simplify: scale to integers, then divide by GCF.
    const d = Math.max(decimals(a), decimals(b));
    const A = Math.round(a * 10 ** d);
    const B = Math.round(b * 10 ** d);
    if (d > 0) steps.push(`Multiply both terms by ${10 ** d} to clear decimals: ${A} : ${B}`);
    const g = gcd(A, B) || 1;
    const simplified = `${A / g} : ${B / g}`;
    steps.push(g > 1 ? `Divide both terms by their GCF ${g}: ${simplified}` : `${A} and ${B} share no common factor, so ${simplified} is already in lowest terms`);
    const donut: ChartSpec | undefined =
      a > 0 && b > 0 ? { type: 'donut', title: 'Share of the total', slices: [{ label: `A (${fmt(a)})`, value: a }, { label: `B (${fmt(b)})`, value: b }], centerValue: simplified, centerLabel: 'A : B' } : undefined;
    const bars: ChartSpec = { type: 'bar', title: 'A and B', categories: ['A', 'B'], series: [{ name: 'Value', values: [a, b] }] };
    if (v.mode === 'simplify') return { result: simplified, simplified, quotient: a / b, x: null, chart: donut ?? bars, steps };
    const c = num(v.c);
    if (c === null) return { result: null, simplified, quotient: a / b, note: 'Enter C to solve the proportion.' };
    const x = (b * c) / a;
    steps.push(`Cross-multiply: A·x = B·C → ${fmt(a)}x = ${fmt(b)} × ${fmt(c)} = ${fmt(b * c)}`);
    steps.push(`x = ${fmt(b * c)} ÷ ${fmt(a)} = ${fmt(x)}`);
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Equivalent ratios',
      categories: [`${fmt(a)} : ${fmt(b)}`, `${fmt(c)} : ${fmt(x)}`],
      series: [
        { name: 'First term', values: [a, c] },
        { name: 'Second term', values: [b, x] },
      ],
    };
    return { result: `x = ${fmt(x)}`, x, simplified, quotient: a / b, chart, steps, note: `${fmt(a)} : ${fmt(b)} = ${fmt(c)} : ${fmt(x)}` };
  },
  content: {
    formula: ['A : B = C : x  ⇒  x = B × C ÷ A', 'Simplify: divide A and B by GCF(A, B)'],
    body: [
      'A ratio compares two quantities by division. A recipe that uses 3 cups of flour for every 4 cups of milk has a flour-to-milk ratio of 3 : 4. Multiplying or dividing both terms by the same number gives an equivalent ratio, so 6 : 8 and 15 : 20 describe the same mix.',
      'To simplify a ratio, divide both terms by their greatest common factor. If the ratio contains decimals, first multiply both terms by a power of 10 to make them whole numbers: 1.5 : 2.5 becomes 15 : 25, which simplifies to 3 : 5.',
      'A proportion says two ratios are equal. To find a missing term, cross-multiply: in 3 : 4 = 15 : x, 3 × x = 4 × 15, so x = 20. This is the method behind scaling recipes, reading map scales and converting currencies.',
    ],
    faq: [
      { q: 'Does the order in a ratio matter?', a: 'Yes. 3 : 4 (flour to milk) is not the same as 4 : 3. Always keep the terms in the order the question describes.' },
      { q: 'How do I turn a ratio into a fraction or percentage?', a: 'For a part-to-part ratio A : B, the share of A in the total is A ÷ (A + B). For 3 : 4 that is 3/7 ≈ 42.9%.' },
    ],
  },
  related: ['fraction', 'gcf-lcm', 'percentage', 'percentage-change'],
  examples: [
    { values: { mode: 'solve', a: 3, b: 4, c: 15 }, expect: { x: 20, result: 'x = 20' } },
    { values: { mode: 'simplify', a: 12, b: 16, c: null }, expect: { result: '3 : 4' } },
    { values: { mode: 'simplify', a: 1.5, b: 2.5, c: null }, expect: { result: '3 : 5' } },
  ],
});
