import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'cohens-d',
  title: 'Cohen’s d Calculator (Effect Size)',
  category: 'statistics',
  description: 'Work out Cohen’s d and Hedges’ g effect size from the mean, standard deviation and sample size of two groups, with the pooled SD shown.',
  keywords: ['cohens d', 'effect size calculator', 'hedges g', 'pooled standard deviation', 'standardized mean difference'],
  inputs: [
    { id: 'm1', info: 'The average of group 1.', label: 'Group 1 mean', type: 'number', default: 78 },
    { id: 's1', info: 'The sample standard deviation of group 1. Must be above zero.', label: 'Group 1 standard deviation', type: 'number', default: 10, min: 0 },
    { id: 'n1', info: 'How many observations are in group 1 (at least 2).', label: 'Group 1 sample size', type: 'number', default: 30, min: 2, step: 1 },
    { id: 'm2', info: 'The average of group 2.', label: 'Group 2 mean', type: 'number', default: 72 },
    { id: 's2', info: 'The sample standard deviation of group 2. Must be above zero.', label: 'Group 2 standard deviation', type: 'number', default: 12, min: 0 },
    { id: 'n2', info: 'How many observations are in group 2 (at least 2).', label: 'Group 2 sample size', type: 'number', default: 30, min: 2, step: 1 },
  ],
  outputs: [
    { id: 'd', info: 'Cohen’s d: the difference between the means divided by the pooled standard deviation.', label: 'Cohen’s d', precision: 3, primary: true },
    { id: 'g', info: 'Hedges’ g: Cohen’s d with a small-sample bias correction, d × (1 − 3 ÷ (4(n1 + n2) − 9)).', label: 'Hedges’ g', precision: 3 },
    { id: 'pooled', info: 'The pooled standard deviation of the two groups, weighted by their degrees of freedom.', label: 'Pooled standard deviation', precision: 4 },
    { id: 'size', info: 'Cohen’s rough convention for the size of |d|: small about 0.2, medium about 0.5, large about 0.8. A rule of thumb, not a verdict.', label: 'Rough size (Cohen’s convention)', format: 'text' },
  ],
  compute: (v) => {
    const m1 = num(v.m1);
    const s1 = num(v.s1);
    const n1 = num(v.n1);
    const m2 = num(v.m2);
    const s2 = num(v.s2);
    const n2 = num(v.n2);
    if (m1 === null || s1 === null || n1 === null || m2 === null || s2 === null || n2 === null) return { d: null };
    if (!Number.isInteger(n1) || !Number.isInteger(n2) || n1 < 2 || n2 < 2) return { d: null, error: 'Each sample size must be a whole number of at least 2.' };
    if (s1 <= 0 || s2 <= 0) return { d: null, error: 'Standard deviations must be greater than zero.' };
    const pooled = Math.sqrt(((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2));
    const d = (m1 - m2) / pooled;
    const j = 1 - 3 / (4 * (n1 + n2) - 9);
    const g = d * j;
    const a = Math.abs(d);
    const label = a < 0.2 ? 'Negligible' : a < 0.5 ? 'Small' : a < 0.8 ? 'Medium' : 'Large';
    return {
      d,
      g,
      pooled,
      size: `${label} (rough rule of thumb)`,
      tone: a < 0.5 ? 'ok' : 'good',
      badge: `${label} effect`,
      steps: [
        `Pooled SD = √(((n1 − 1)s1² + (n2 − 1)s2²) ÷ (n1 + n2 − 2)) = √(${fmt((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2, 6)} ÷ ${n1 + n2 - 2}) = ${fmt(pooled, 5)}`,
        `d = (m1 − m2) ÷ pooled SD = ${fmt(m1 - m2, 6)} ÷ ${fmt(pooled, 5)} = ${fmt(d, 5)}`,
        `Hedges’ g = d × (1 − 3 ÷ (4(n1 + n2) − 9)) = ${fmt(d, 5)} × ${fmt(j, 6)} = ${fmt(g, 5)}`,
      ],
      note: 'Cohen’s labels (0.2 small, 0.5 medium, 0.8 large) are rough conventions. What counts as a meaningful effect depends on your field.',
      chart: {
        type: 'bar',
        title: '|d| against Cohen’s rough benchmarks',
        categories: ['Small (0.2)', 'Medium (0.5)', 'Large (0.8)', 'Your |d|'],
        series: [{ name: 'Effect size', values: [0.2, 0.5, 0.8, a] }],
        highlight: 3,
      },
    };
  },
  content: {
    formula: ['pooled SD = √(((n1 − 1)s1² + (n2 − 1)s2²) ÷ (n1 + n2 − 2))', 'd = (m1 − m2) ÷ pooled SD', 'g = d × (1 − 3 ÷ (4(n1 + n2) − 9))'],
    body: [
      'Cohen’s d is an effect size: it says how far apart two group averages are, measured in standard deviations. Unlike a p-value, it does not shrink or grow just because you collected more data, so it tells you about the size of a difference rather than whether it is detectable.',
      'To get d, subtract the second mean from the first and divide by the pooled standard deviation, a weighted blend of the two groups’ spreads. Larger groups count for more through their degrees of freedom (n − 1). A positive d means group 1 has the higher mean.',
      'Hedges’ g applies a small correction to d, because d slightly overstates the effect in small samples. With 30 per group the correction is about 1.3%; it fades as samples grow.',
      'Cohen suggested 0.2, 0.5 and 0.8 as rough markers of small, medium and large effects. Treat them as a starting point only: a “small” effect can matter a great deal in medicine, and a “large” one can be trivial in another field.',
    ],
    faq: [
      { q: 'With means 78 and 72, SDs 10 and 12 and 30 per group, what is d?', a: 'The pooled SD is √(7076 ÷ 58) ≈ 11.045, so d = 6 ÷ 11.045 ≈ 0.543, a medium effect by Cohen’s rough convention. Hedges’ g is 0.543 × (1 − 3 ÷ 231) ≈ 0.536.' },
      { q: 'What counts as a small, medium or large effect?', a: 'Cohen’s rough convention is about 0.2 small, 0.5 medium and 0.8 large, applied to the absolute value of d. This calculator calls anything under 0.2 negligible. These are rules of thumb, not verdicts.' },
      { q: 'Should I report d or Hedges’ g?', a: 'Hedges’ g is preferred for small samples because it corrects the slight upward bias in d. With large samples the two are almost identical.' },
      { q: 'Does d tell me if the result is statistically significant?', a: 'No. For that, use the p-value calculator. Cohen’s d only describes the size of the difference. A confidence interval shows how precisely it is estimated.' },
    ],
  },
  related: ['p-value', 'confidence-interval', 'standard-deviation', 'standard-error'],
  examples: [
    // pooled = √(((29·100)+(29·144)) ÷ 58) = √(7076 ÷ 58) = 11.04536; d = 6 ÷ 11.04536 = 0.543214; g = d × (1 − 3/231) = 0.536160
    { values: { m1: 78, s1: 10, n1: 30, m2: 72, s2: 12, n2: 30 }, expect: { pooled: 11.045361, d: 0.543214, g: 0.53616 }, tolerance: 1e-5 },
    // Equal SDs of 5, means 10 and 12: pooled = 5, d = −2 ÷ 5 = −0.4
    { values: { m1: 10, s1: 5, n1: 20, m2: 12, s2: 5, n2: 20 }, expect: { pooled: 5, d: -0.4 }, tolerance: 1e-9 },
  ],
});
