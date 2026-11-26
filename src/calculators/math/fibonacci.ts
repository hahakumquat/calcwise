import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const PHI = (1 + Math.sqrt(5)) / 2;

// F1 = F2 = 1. BigInt keeps every digit exact, including the sum (F80 - 1) at n = 78.
function fib(n: number): bigint[] {
  const f: bigint[] = [0n, 1n, 1n];
  for (let i = 3; i <= n + 2; i++) f.push(f[i - 1] + f[i - 2]);
  return f;
}
const big = (b: bigint) => b.toLocaleString('en-US');

export default defineCalculator({
  slug: 'fibonacci',
  title: 'Fibonacci Calculator',
  category: 'math',
  description: 'Find the nth Fibonacci number, the sum of the first n terms and how close the ratio of neighbours is to the golden ratio 1.6180339887.',
  metaDescription: 'Find the nth Fibonacci number, the sum of the first n terms and the ratio to the golden ratio. Exact up to n = 78. Free and instant.',
  updated: '2026-11-26',
  keywords: ['fibonacci calculator', 'nth fibonacci number', 'fibonacci sequence', 'golden ratio calculator', 'sum of fibonacci numbers', 'fibonacci number list'],
  inputs: [
    { id: 'n', label: 'Term number (n)', type: 'number', default: 20, min: 2, max: 78, step: 1, info: 'Which Fibonacci number to find, from 2 to 78. The sequence starts F1 = 1, F2 = 1.' },
  ],
  outputs: [
    { id: 'fn', label: 'F(n)', format: 'text', primary: true, info: 'The nth Fibonacci number.' },
    { id: 'sum', label: 'Sum of F1 to F(n)', format: 'text', info: 'Equals F(n+2) − 1.' },
    { id: 'ratio', label: 'F(n) ÷ F(n−1)', format: 'number', precision: 7, info: 'Ratio of the term to the one before it. It approaches the golden ratio.' },
    { id: 'gap', label: 'Gap from golden ratio', format: 'number', precision: 7, info: 'The ratio minus 1.6180339887.' },
  ],
  compute: (v) => {
    const n = num(v.n);
    if (n === null) return { fn: null };
    if (!Number.isInteger(n) || n < 2 || n > 78) return { fn: null, error: 'Enter a whole number from 2 to 78.' };
    const f = fib(n);
    const sum = f[n + 2] - 1n;
    const ratio = Number(f[n]) / Number(f[n - 1]);
    const ks = Array.from({ length: Math.min(n, 15) }, (_, i) => i + 1);
    const rs = Array.from({ length: 14 }, (_, i) => Number(f[i + 2]) / Number(f[i + 1]));
    return {
      fn: big(f[n]),
      sum: big(sum),
      ratio,
      gap: ratio - PHI,
      tone: 'ok',
      badge: `F${n} = ${big(f[n])}`,
      chart: {
        type: 'line',
        title: 'F(k+1) ÷ F(k) closing in on the golden ratio',
        x: Array.from({ length: 14 }, (_, i) => i + 1),
        xLabel: 'k',
        yLabel: 'ratio',
        series: [{ name: 'F(k+1) ÷ F(k)', values: rs }],
      },
      steps: [
        `First terms: ${ks.map((k) => big(f[k])).join(', ')}${n > 15 ? ', …' : ''}`,
        `F(${n}) = F(${n - 1}) + F(${n - 2}) = ${big(f[n - 1])} + ${big(f[n - 2])} = ${big(f[n])}`,
        `Sum of F1 to F${n} = F(${n + 2}) − 1 = ${big(f[n + 2])} − 1 = ${big(sum)}`,
      ],
    };
  },
  content: {
    formula: ['F(1) = F(2) = 1, F(n) = F(n−1) + F(n−2)', 'F(1) + … + F(n) = F(n+2) − 1', 'F(n) ÷ F(n−1) → (1 + √5) ÷ 2 ≈ 1.6180339887'],
    body: [
      'The Fibonacci sequence starts 1, 1, 2, 3, 5, 8, 13 and each new term is the sum of the two before it. This calculator gives the nth term, the sum of the first n terms and how close the ratio of neighbouring terms is to the golden ratio.',
      'The sum has a shortcut: add up the first n terms and you always get F(n+2) − 1. For n = 10 that is F12 − 1 = 144 − 1 = 143.',
      'Divide any term by the one before it and the answer settles near 1.6180339887, the golden ratio (1 + √5) ÷ 2. The early ratios wobble above and below it, and by about the 15th term they agree to six decimal places. Results are exact up to n = 78.',
    ],
    faq: [
      { q: 'What is the 10th Fibonacci number?', a: 'F10 = 55. The sum of the first ten terms is 143, which is F12 − 1 = 144 − 1.' },
      { q: 'What are F20 and F30?', a: 'F20 = 6,765 and F30 = 832,040. The ratio F20 ÷ F19 = 6,765 ÷ 4,181 = 1.6180340.' },
      { q: 'Does the sequence start at 0 or 1?', a: 'Some books start with F0 = 0. This calculator uses F1 = 1 and F2 = 1, which gives the same numbers from F1 onward.' },
      { q: 'Why stop at 78?', a: 'Large Fibonacci numbers grow past what a standard double can store exactly. Results here use exact integer arithmetic, and the ratio uses ordinary decimals, so the limit keeps everything easy to check.' },
    ],
    sources: [],
  },
  related: ['factorial-calculator', 'prime-factorization'],
  examples: [
    // F10 = 55; sum = F12 - 1 = 143; 55/34 = 1.6176471
    { values: { n: 10 }, expect: { fn: '55', sum: '143', ratio: 1.6176471 }, tolerance: 0.0001 },
    // F20 = 6765; sum = F22 - 1 = 17711 - 1 = 17710; 6765/4181 = 1.6180340
    { values: { n: 20 }, expect: { fn: '6,765', sum: '17,710', ratio: 1.618034 }, tolerance: 0.0001 },
  ],
});
