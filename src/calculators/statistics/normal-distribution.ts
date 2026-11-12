import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num, normalCdf } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'normal-distribution',
  title: 'Normal Distribution Calculator',
  category: 'statistics',
  description: 'Find probabilities under a normal curve: below a value, above a value, or between two values.',
  keywords: ['normal probability', 'bell curve', 'gaussian', 'normal cdf', 'area under the curve', 'z table'],
  inputs: [
    { id: 'mean', info: 'The centre of the bell curve (μ).', label: 'Mean (μ)', type: 'number', default: 100 },
    { id: 'sd', info: 'How wide the bell curve is (σ). About 68% of values lie within one σ of the mean.', label: 'Standard deviation (σ)', type: 'number', default: 15, min: 0 },
    {
      id: 'mode', info: 'Which probability you want: below a value, above a value, or between two values.',
      label: 'Probability',
      type: 'select',
      default: 'between',
      segmented: true,
      options: [
        { value: 'below', label: 'P(X < x₁)' },
        { value: 'above', label: 'P(X > x₁)' },
        { value: 'between', label: 'P(x₁ < X < x₂)' },
      ],
    },
    { id: 'x1', info: 'The value whose probability you want (the lower value for “between”).', label: 'x₁', type: 'number', default: 85 },
    { id: 'x2', info: 'The second value, for the probability of landing between x₁ and x₂.', label: 'x₂', type: 'number', default: 115, showWhen: { input: 'mode', is: 'between' } },
  ],
  outputs: [
    { id: 'prob', info: 'The area under the curve for your chosen region — the probability as a decimal from 0 to 1.', label: 'Probability', primary: true, precision: 6 },
    { id: 'probPct', info: 'The same probability written as a percentage.', label: 'As a percentage', format: 'percent', precision: 3 },
    { id: 'z1', info: 'How many standard deviations x₁ is from the mean.', label: 'z₁', precision: 4 },
    { id: 'z2', info: 'How many standard deviations x₂ is from the mean.', label: 'z₂', precision: 4 },
  ],
  compute: (v) => {
    const m = num(v.mean);
    const sd = num(v.sd);
    const x1 = num(v.x1);
    const x2 = num(v.x2);
    if (m === null || sd === null || x1 === null) return { prob: null };
    if (sd <= 0) return { prob: null, error: 'Standard deviation must be greater than zero.' };
    const z1 = (x1 - m) / sd;
    const steps = [`z₁ = (x₁ − μ) ÷ σ = (${fmt(x1)} − ${fmt(m)}) ÷ ${fmt(sd)} = ${fmt(z1, 6)}`];
    let prob: number;
    let z2: number | null = null;
    if (v.mode === 'below') {
      prob = normalCdf(z1);
      steps.push(`P(X < ${fmt(x1)}) = Φ(${fmt(z1, 4)}) = ${fmt(prob, 6)}`);
    } else if (v.mode === 'above') {
      prob = normalCdf(-z1);
      steps.push(`P(X > ${fmt(x1)}) = 1 − Φ(${fmt(z1, 4)}) = ${fmt(prob, 6)}`);
    } else {
      if (x2 === null) return { prob: null, z1, note: 'Enter x₂ for a “between” probability.' };
      const lo = Math.min(x1, x2);
      const hi = Math.max(x1, x2);
      const zl = (lo - m) / sd;
      const zh = (hi - m) / sd;
      z2 = (x2 - m) / sd;
      steps.push(`z₂ = (x₂ − μ) ÷ σ = (${fmt(x2)} − ${fmt(m)}) ÷ ${fmt(sd)} = ${fmt(z2, 6)}`);
      // Use the smaller tail where possible to keep precision in the far tails.
      prob = zl > 0 ? normalCdf(-zl) - normalCdf(-zh) : normalCdf(zh) - normalCdf(zl);
      steps.push(`P(${fmt(lo)} < X < ${fmt(hi)}) = Φ(${fmt(zh, 4)}) − Φ(${fmt(zl, 4)}) = ${fmt(normalCdf(zh), 6)} − ${fmt(normalCdf(zl), 6)} = ${fmt(prob, 6)}`);
    }
    const shade =
      v.mode === 'below' ? [{ to: x1 }] : v.mode === 'above' ? [{ from: x1 }] : [{ from: Math.min(x1, x2 ?? x1), to: Math.max(x1, x2 ?? x1) }];
    const markers = [{ x: x1, label: 'x₁' }, ...(z2 !== null && x2 !== null ? [{ x: x2, label: 'x₂' }] : [])];
    const chart: ChartSpec = { type: 'distribution', title: `Shaded area = ${fmt(prob * 100, 4)}%`, mean: m, sd, shade, markers };
    return { prob, probPct: prob, z1, z2, chart, steps };
  },
  content: {
    formula: ['z = (x − μ) ÷ σ', 'P(X < x) = Φ(z)', 'P(X > x) = 1 − Φ(z)', 'P(a < X < b) = Φ(z_b) − Φ(z_a)'],
    body: [
      'The normal distribution is the symmetric bell-shaped curve that describes heights, test scores, measurement errors and many other quantities. It is fully described by two numbers: the mean μ, which sets its centre, and the standard deviation σ, which sets its width.',
      'Probabilities correspond to areas under the curve. To find one, convert each x value into a z-score, which measures distance from the mean in standard deviations, and then look up the cumulative probability Φ(z) — the area to the left of z under the standard normal curve. This calculator computes Φ directly, so you don’t need a printed z-table.',
      'The default example uses IQ scores, which are scaled to a mean of 100 and a standard deviation of 15. The probability of a score between 85 and 115 — within one standard deviation — is about 68.3%, matching the empirical 68-95-99.7 rule.',
    ],
    faq: [
      { q: 'Does it matter whether I use < or ≤?', a: 'Not for a continuous distribution like the normal: the probability of hitting any exact value is zero, so P(X < x) and P(X ≤ x) are equal.' },
      { q: 'What if my data aren’t normal?', a: 'These probabilities will then be approximations at best. Check a histogram first; skewed data, such as incomes, are often better modelled after a log transformation.' },
    ],
  },
  related: ['z-score', 'p-value', 'standard-deviation', 'confidence-interval'],
  examples: [
    { values: { mean: 0, sd: 1, mode: 'below', x1: 1.96, x2: null }, expect: { prob: 0.9750021 }, tolerance: 1e-6 },
    { values: { mean: 0, sd: 1, mode: 'between', x1: -1, x2: 1 }, expect: { prob: 0.6826895 }, tolerance: 1e-6 },
    { values: { mean: 100, sd: 15, mode: 'above', x1: 130, x2: null }, expect: { prob: 0.0227501, z1: 2 }, tolerance: 1e-6 },
  ],
});
