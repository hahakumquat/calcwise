import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num, normalCdf, tCdf } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'p-value',
  title: 'P-Value Calculator',
  category: 'statistics',
  description: 'Convert a z-score or t-statistic into a one-tailed or two-tailed p-value and see whether it is significant.',
  keywords: ['p value from z score', 'p value from t', 'significance', 'hypothesis test', 'two tailed', 'one tailed'],
  popular: true,
  inputs: [
    {
      id: 'dist', info: 'Choose z for a normal-based test or t for a Student’s t-test (small samples with estimated σ).',
      label: 'Test statistic',
      type: 'select',
      default: 'z',
      segmented: true,
      options: [
        { value: 'z', label: 'z (normal)' },
        { value: 't', label: 't (Student)' },
      ],
    },
    { id: 'stat', info: 'The test statistic you calculated, such as z = 2.1 or t = −1.8.', label: 'Statistic value', type: 'number', default: 1.96, step: 0.01 },
    { id: 'df', info: 'Degrees of freedom for the t distribution — for a one-sample t-test it is n − 1.', label: 'Degrees of freedom', type: 'number', default: 20, min: 1, help: 'Usually n − 1', showWhen: { input: 'dist', is: 't' } },
    {
      id: 'tails', info: 'Match your alternative hypothesis: two-tailed for “different”, left for “less than”, right for “greater than”.',
      label: 'Alternative hypothesis',
      type: 'select',
      default: 'two',
      options: [
        { value: 'two', label: 'Two-tailed (≠)' },
        { value: 'left', label: 'Left-tailed (<)' },
        { value: 'right', label: 'Right-tailed (>)' },
      ],
    },
    { id: 'alpha', info: 'Your cut-off for significance, chosen before the test. 0.05 is the most common.', label: 'Significance level α', type: 'number', default: 0.05, min: 0, max: 1, step: 0.01 },
  ],
  outputs: [
    { id: 'p', info: 'The probability of a result at least this extreme if the null hypothesis were true. Small means strong evidence against it.', label: 'p-value', primary: true, precision: 6 },
    { id: 'significant', info: 'Whether the p-value is below your significance level α.', label: 'Significant at α?', format: 'text' },
    { id: 'cdf', info: 'The area to the left of your statistic under the curve.', label: 'Cumulative probability P(X ≤ statistic)', precision: 6 },
  ],
  compute: (v) => {
    const x = num(v.stat);
    if (x === null) return { p: null };
    const isT = v.dist === 't';
    const df = num(v.df);
    if (isT && (df === null || df <= 0)) return { p: null, error: 'Enter positive degrees of freedom for a t statistic.' };
    const cdf = (q: number) => (isT ? tCdf(q, df!) : normalCdf(q));
    const lower = cdf(x);
    const upper = cdf(-x); // symmetric: P(X ≥ x) = P(X ≤ −x)
    const tails = v.tails as string;
    let p: number;
    const name = isT ? `t(${fmt(df!)})` : 'Z';
    const steps: string[] = [];
    if (tails === 'left') {
      p = lower;
      steps.push(`Left-tailed: p = P(${name} ≤ ${fmt(x)}) = ${fmt(p, 6)}`);
    } else if (tails === 'right') {
      p = upper;
      steps.push(`Right-tailed: p = P(${name} ≥ ${fmt(x)}) = 1 − ${fmt(lower, 6)} = ${fmt(p, 6)}`);
    } else {
      p = Math.min(1, 2 * Math.min(lower, upper));
      steps.push(`Two-tailed: p = 2 × P(${name} ≥ |${fmt(x)}|) = 2 × ${fmt(Math.min(lower, upper), 6)} = ${fmt(p, 6)}`);
    }
    const alpha = num(v.alpha);
    let significant: string | null = null;
    if (alpha !== null && alpha > 0 && alpha < 1) {
      significant = p < alpha ? `Yes (p < ${fmt(alpha)})` : `No (p ≥ ${fmt(alpha)})`;
      steps.push(p < alpha ? `${fmt(p, 6)} < α = ${fmt(alpha)} → reject the null hypothesis` : `${fmt(p, 6)} ≥ α = ${fmt(alpha)} → fail to reject the null hypothesis`);
    }
    const ax = Math.abs(x);
    const shade = tails === 'left' ? [{ to: x, label: 'p' }] : tails === 'right' ? [{ from: x, label: 'p' }] : [{ to: -ax, label: 'p/2' }, { from: ax, label: 'p/2' }];
    const markers = tails === 'two' || !tails ? [{ x: -ax, label: fmt(-ax, 4) }, { x: ax, label: fmt(ax, 4) }] : [{ x, label: fmt(x, 4) }];
    const chart: ChartSpec = { type: 'distribution', title: `p = ${fmt(p, 4)} (shaded area)`, mean: 0, sd: 1, df: isT ? df! : undefined, shade, markers };
    return { p, significant, cdf: lower, chart, steps };
  },
  content: {
    formula: ['Two-tailed: p = 2 × P(T ≥ |t|)', 'Right-tailed: p = P(T ≥ t)', 'Left-tailed: p = P(T ≤ t)', 'Z ~ N(0, 1);  T ~ Student’s t with df degrees of freedom'],
    body: [
      'A p-value is the probability of getting a test statistic at least as extreme as the one you observed, assuming the null hypothesis is true. A small p-value means your data would be surprising if there were really no effect, which counts as evidence against the null hypothesis.',
      'Use a z statistic when the population standard deviation is known or the sample is large; use a t statistic with n − 1 degrees of freedom (for a one-sample test) when you estimated the standard deviation from a small sample. The t distribution has fatter tails, so the same statistic gives a larger p-value, and it approaches the normal distribution as df grows.',
      'Choose the tails to match your alternative hypothesis. If you are testing for any difference (≠), use two tails — the classic cut-off z = 1.96 gives p ≈ 0.05. If you predicted a direction in advance (> or <), use one tail, which halves the p-value for a result in that direction.',
    ],
    faq: [
      { q: 'Does p < 0.05 mean my result is important?', a: 'No. It means the result is unlikely under the null hypothesis, not that the effect is large or useful. With huge samples, trivially small effects can be “significant”. Report an effect size or confidence interval alongside the p-value.' },
      { q: 'Is the p-value the probability that the null hypothesis is true?', a: 'No — a common misunderstanding. It is the probability of data this extreme if the null were true. It doesn’t give the probability that either hypothesis is correct.' },
      { q: 'What degrees of freedom should I use?', a: 'For a one-sample or paired t-test, df = n − 1. For a two-sample test with equal variances, df = n₁ + n₂ − 2. Welch’s test uses a more complicated formula that usually gives a non-integer df — that’s fine to enter here.' },
    ],
  },
  related: ['z-score', 'confidence-interval', 'ab-test', 'normal-distribution'],
  examples: [
    { values: { dist: 'z', stat: 1.96, df: null, tails: 'two', alpha: 0.05 }, expect: { p: 0.0499958, significant: 'Yes (p < 0.05)' }, tolerance: 1e-6 },
    { values: { dist: 'z', stat: 1.645, df: null, tails: 'right', alpha: 0.05 }, expect: { p: 0.0499849 }, tolerance: 1e-6 },
    { values: { dist: 't', stat: 2.228, df: 10, tails: 'two', alpha: 0.05 }, expect: { p: 0.05 }, tolerance: 1e-3 },
    { values: { dist: 't', stat: -2.0, df: 10, tails: 'left', alpha: 0.05 }, expect: { p: 0.0366941 }, tolerance: 1e-5 },
  ],
});
