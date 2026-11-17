import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (x: number) => (Number.isFinite(x) ? String(+x.toPrecision(10)) : 'too large');

export default defineCalculator({
  slug: 'sequence-calculator',
  title: 'Arithmetic and Geometric Sequence Calculator',
  category: 'math',
  description: 'Find the nth term and the sum of an arithmetic or geometric sequence from the first term, the difference or ratio, and n. Shows the first terms too.',
  keywords: ['sequence calculator', 'arithmetic sequence calculator', 'geometric sequence calculator', 'nth term calculator', 'sum of arithmetic series', 'sum of geometric series'],
  inputs: [
    { id: 'type', label: 'Sequence type', type: 'select', segmented: true, default: 'arith', options: [{ value: 'arith', label: 'Arithmetic' }, { value: 'geo', label: 'Geometric' }], info: 'Arithmetic adds the same number each step. Geometric multiplies by the same number each step.' },
    { id: 'a1', label: 'First term (a₁)', type: 'number', default: 3, step: 1, info: 'The first number in the sequence.' },
    { id: 'step', label: 'Common difference (d) or ratio (r)', type: 'number', default: 4, step: 0.5, help: 'Difference for arithmetic, ratio for geometric.', info: 'The amount added each step (arithmetic) or the multiplier each step (geometric).' },
    { id: 'n', label: 'Number of terms (n)', type: 'number', default: 10, min: 1, max: 1000, step: 1, info: 'Which term to find and how many terms to add up. Whole numbers only.' },
  ],
  outputs: [
    { id: 'an', label: 'Term n (aₙ)', format: 'text', primary: true, info: 'Arithmetic: a₁ + (n − 1)d. Geometric: a₁ × rⁿ⁻¹.' },
    { id: 'sn', label: 'Sum of first n terms (Sₙ)', format: 'text', info: 'Arithmetic: n ÷ 2 × (a₁ + aₙ). Geometric: a₁ × (rⁿ − 1) ÷ (r − 1), or n × a₁ if r = 1.' },
    { id: 'inf', label: 'Sum to infinity', format: 'text', info: 'Only exists for a geometric sequence when |r| < 1: a₁ ÷ (1 − r).' },
    { id: 'first', label: 'First terms', format: 'text', info: 'Up to the first 8 terms.' },
  ],
  compute: (v) => {
    const a1 = num(v.a1), s = num(v.step), nRaw = num(v.n);
    if (a1 === null || s === null || nRaw === null) return { an: null };
    if (!Number.isInteger(nRaw) || nRaw < 1 || nRaw > 1000) return { an: null };
    const n = nRaw;
    const geo = v.type === 'geo';
    const term = (k: number) => (geo ? a1 * s ** (k - 1) : a1 + (k - 1) * s);
    const an = term(n);
    let sn: number;
    if (geo) sn = s === 1 ? n * a1 : (a1 * (s ** n - 1)) / (s - 1);
    else sn = (n / 2) * (a1 + an);
    const inf = geo ? (Math.abs(s) < 1 ? fmt(a1 / (1 - s)) : 'None (|r| must be below 1)') : 'None (an arithmetic sequence does not converge)';
    const shown = Math.min(n, 30);
    const xs = Array.from({ length: shown }, (_, i) => i + 1);
    const vals = xs.map(term).map((x) => (Number.isFinite(x) ? x : null));
    return {
      an: fmt(an),
      sn: fmt(sn),
      inf,
      first: xs.slice(0, 8).map((k) => fmt(term(k))).join(', ') + (n > 8 ? ', …' : ''),
      chart: {
        type: 'line',
        title: shown < n ? 'First 30 terms' : 'Terms of the sequence',
        x: xs,
        xLabel: 'Term number',
        series: [{ name: 'Term value', values: vals }],
      },
      steps: [
        geo ? `aₙ = ${a1} × ${s}^(${n} − 1) = ${fmt(an)}` : `aₙ = ${a1} + (${n} − 1) × ${s} = ${fmt(an)}`,
        geo ? `Sₙ = ${fmt(sn)}` : `Sₙ = ${n} ÷ 2 × (${a1} + ${fmt(an)}) = ${fmt(sn)}`,
      ],
    };
  },
  content: {
    formula: ['Arithmetic: aₙ = a₁ + (n − 1)d, Sₙ = n ÷ 2 × (a₁ + aₙ)', 'Geometric: aₙ = a₁ × rⁿ⁻¹, Sₙ = a₁ × (rⁿ − 1) ÷ (r − 1)', 'Infinite geometric sum = a₁ ÷ (1 − r), only when |r| < 1'],
    body: [
      'A sequence is a list of numbers that follows a rule. In an arithmetic sequence you add the same number, the common difference, each step. In a geometric sequence you multiply by the same number, the common ratio.',
      'Take a first term of 3 and a difference of 4. The terms are 3, 7, 11, 15 and so on. The 10th term is 3 + 9 × 4 = 39, and the first 10 terms add up to 10 ÷ 2 × (3 + 39) = 210.',
      'For a geometric sequence with a first term of 2 and a ratio of 3, the terms are 2, 6, 18, 54, 162. The sum of five terms is 2 × (3⁵ − 1) ÷ (3 − 1) = 242. If the ratio is between −1 and 1, the terms shrink and the sum to infinity is a₁ ÷ (1 − r): 8 with a ratio of 0.5 gives 16.',
    ],
    faq: [
      { q: 'How do I find the nth term of an arithmetic sequence?', a: 'Use aₙ = a₁ + (n − 1)d. With a₁ = 3, d = 4 and n = 10, the answer is 39.' },
      { q: 'When does a geometric series have an infinite sum?', a: 'Only when the ratio r is between −1 and 1. Then the sum is a₁ ÷ (1 − r). For a₁ = 8 and r = 0.5 it is 16.' },
      { q: 'What if the ratio is 1?', a: 'Every term equals a₁, so the sum of n terms is simply n × a₁.' },
    ],
  },
  related: ['savings-challenge', 'exponent', 'habit-compounding'],
  examples: [
    { values: { type: 'arith', a1: 3, step: 4, n: 10 }, expect: { an: '39', sn: '210', first: '3, 7, 11, 15, 19, 23, 27, 31, …' } },
    { values: { type: 'geo', a1: 2, step: 3, n: 5 }, expect: { an: '162', sn: '242', first: '2, 6, 18, 54, 162' } },
    { values: { type: 'geo', a1: 8, step: 0.5, n: 4 }, expect: { inf: '16' } },
  ],
});
