import { defineCalculator } from '../../lib/types';
import { num, normalCdf } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'z-score',
  title: 'Z-Score Calculator',
  category: 'statistics',
  description: 'Standardise a value: get its z-score, percentile and the probability above or below it.',
  keywords: ['standard score', 'z table', 'percentile', 'standardize', 'how many standard deviations'],
  inputs: [
    { id: 'x', info: 'The individual value you want to standardise, such as a test score.', label: 'Value (x)', type: 'number', default: 85 },
    { id: 'mean', info: 'The average of the population or data set.', label: 'Mean (μ)', type: 'number', default: 70 },
    { id: 'sd', info: 'The standard deviation of the population or data set.', label: 'Standard deviation (σ)', type: 'number', default: 10, min: 0 },
  ],
  outputs: [
    { id: 'z', info: 'How many standard deviations the value is above (positive) or below (negative) the mean.', label: 'z-score', primary: true, precision: 4 },
    { id: 'percentile', info: 'The share of a normal population that falls below your value.', label: 'Percentile (P(X < x))', format: 'percent', precision: 2 },
    { id: 'above', info: 'The share of a normal population that falls above your value.', label: 'P(X > x)', format: 'percent', precision: 2 },
    { id: 'twoTail', info: 'The chance of a value at least this far from the mean in either direction.', label: 'P(|Z| > |z|) — two-tailed', precision: 6 },
  ],
  compute: (v) => {
    const x = num(v.x);
    const m = num(v.mean);
    const sd = num(v.sd);
    if (x === null || m === null || sd === null) return { z: null };
    if (sd <= 0) return { z: null, error: 'Standard deviation must be greater than zero.' };
    const z = (x - m) / sd;
    const below = normalCdf(z);
    const above = normalCdf(-z);
    return {
      z,
      percentile: below,
      above,
      twoTail: 2 * Math.min(below, above),
      chart: {
        type: 'distribution',
        title: `${fmt(below * 100, 4)}% of values fall below ${fmt(x)}`,
        mean: m,
        sd,
        shade: [{ to: x, label: `${fmt(below * 100, 3)}%` }],
        markers: [{ x, label: `z = ${fmt(z, 3)}` }],
      },
      steps: [
        `z = (x − μ) ÷ σ = (${fmt(x)} − ${fmt(m)}) ÷ ${fmt(sd)} = ${fmt(x - m)} ÷ ${fmt(sd)} = ${fmt(z, 6)}`,
        `From the standard normal distribution: P(Z < ${fmt(z, 4)}) = ${fmt(below, 6)}`,
        `P(Z > ${fmt(z, 4)}) = 1 − ${fmt(below, 6)} = ${fmt(above, 6)}`,
      ],
      note: `${fmt(x)} is ${fmt(Math.abs(z), 4)} standard deviation${Math.abs(z) === 1 ? '' : 's'} ${z >= 0 ? 'above' : 'below'} the mean, higher than about ${fmt(below * 100, 4)}% of values (assuming a normal distribution).`,
    };
  },
  content: {
    formula: ['z = (x − μ) ÷ σ', 'Percentile = Φ(z), the standard normal CDF'],
    body: [
      'A z-score tells you how many standard deviations a value is from the mean. A z-score of 0 is exactly average, +1.5 is one and a half standard deviations above, and −2 is two standard deviations below. Because z-scores strip away the original units, they let you compare results on different scales, such as an SAT score and an ACT score.',
      'If the data follow a normal distribution, a z-score maps directly to a percentile using the standard normal table. A z of 1.5 corresponds to about the 93rd percentile, meaning the value beats roughly 93% of the population.',
      'Values with |z| greater than about 2 are unusual (only around 5% of normal data are that far out), and |z| above 3 is rare enough that such values are often flagged as possible outliers.',
    ],
    faq: [
      { q: 'Can a z-score be negative?', a: 'Yes. A negative z-score just means the value is below the mean. z = −1 is one standard deviation below average, around the 16th percentile.' },
      { q: 'Should I use the sample or population standard deviation?', a: 'Use the population σ if you know it (for example, published test norms). If you only have a sample, the sample standard deviation s is the usual stand-in.' },
    ],
  },
  related: ['normal-distribution', 'p-value', 'standard-deviation', 'mean-median-mode'],
  examples: [
    { values: { x: 85, mean: 70, sd: 10 }, expect: { z: 1.5, percentile: 0.9331928, above: 0.0668072 }, tolerance: 1e-6 },
    { values: { x: 40, mean: 50, sd: 10 }, expect: { z: -1, percentile: 0.1586553 }, tolerance: 1e-6 },
  ],
});
