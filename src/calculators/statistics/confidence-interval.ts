import { defineCalculator } from '../../lib/types';
import { num, tInv } from '../../lib/math';
import { fmt, zCritical } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'confidence-interval',
  title: 'Confidence Interval Calculator',
  category: 'statistics',
  description: 'Build a confidence interval for a mean from the sample mean, standard deviation and sample size, using z or t.',
  keywords: ['confidence interval for the mean', '95% confidence interval', 'margin of error', 'critical value', 't interval', 'z interval'],
  popular: true,
  inputs: [
    { id: 'mean', info: 'The average of your sample data.', label: 'Sample mean (x̄)', type: 'number', default: 100 },
    { id: 'sd', info: 'How spread out your data are. Use the sample standard deviation s unless the population σ is known.', label: 'Standard deviation (s or σ)', type: 'number', default: 15, min: 0 },
    { id: 'n', info: 'How many observations are in your sample.', label: 'Sample size (n)', type: 'number', default: 30, min: 2, step: 1 },
    { id: 'conf', info: 'How often intervals built this way should capture the true mean. 95% is the usual choice.', label: 'Confidence level', type: 'number', suffix: '%', default: 95, min: 50, max: 99.99, step: 0.5 },
    {
      id: 'method', info: 'Use t when the standard deviation comes from your sample (almost always). Use z only if σ is known.',
      label: 'Distribution',
      type: 'select',
      default: 't',
      segmented: true,
      options: [
        { value: 't', label: 't (σ unknown)' },
        { value: 'z', label: 'z (σ known)' },
      ],
    },
  ],
  outputs: [
    { id: 'interval', info: 'The range of plausible values for the true population mean.', label: 'Confidence interval', format: 'text', primary: true },
    { id: 'lower', info: 'The bottom of the interval: mean minus the margin of error.', label: 'Lower bound', precision: 6 },
    { id: 'upper', info: 'The top of the interval: mean plus the margin of error.', label: 'Upper bound', precision: 6 },
    { id: 'margin', info: 'How far the interval extends on each side of the sample mean.', label: 'Margin of error', precision: 6 },
    { id: 'se', info: 'Standard error: how much the sample mean would vary from sample to sample (s ÷ √n).', label: 'Standard error', precision: 6 },
    { id: 'critical', info: 'The z* or t* value that matches your confidence level, read from the normal or t distribution.', label: 'Critical value', precision: 6 },
  ],
  compute: (v) => {
    const m = num(v.mean);
    const sd = num(v.sd);
    const n = num(v.n);
    const conf = num(v.conf);
    if (m === null || sd === null || n === null || conf === null) return { interval: null };
    if (sd < 0) return { interval: null, error: 'Standard deviation can’t be negative.' };
    if (!Number.isInteger(n) || n < 2) return { interval: null, error: 'Sample size must be a whole number of at least 2.' };
    if (conf <= 0 || conf >= 100) return { interval: null, error: 'Confidence level must be between 0% and 100%.' };
    const c = conf / 100;
    const useT = v.method !== 'z';
    const crit = useT ? tInv(1 - (1 - c) / 2, n - 1) : zCritical(c);
    const se = sd / Math.sqrt(n);
    const margin = crit * se;
    const lower = m - margin;
    const upper = m + margin;
    return {
      interval: `${fmt(lower, 6)} to ${fmt(upper, 6)}`,
      lower,
      upper,
      margin,
      se,
      critical: crit,
      chart: {
        type: 'distribution',
        title: `Sampling distribution of the mean — middle ${fmt(conf)}% shaded`,
        mean: m,
        sd: se > 0 ? se : 1e-9,
        df: useT ? n - 1 : undefined,
        shade: [{ from: lower, to: upper, label: `${fmt(conf)}%` }],
        markers: [
          { x: lower, label: fmt(lower, 5) },
          { x: upper, label: fmt(upper, 5) },
        ],
      },
      steps: [
        `Standard error SE = s ÷ √n = ${fmt(sd)} ÷ √${n} = ${fmt(se, 6)}`,
        useT
          ? `Critical value t* for ${fmt(conf)}% with df = ${n - 1}: ${fmt(crit, 6)}`
          : `Critical value z* for ${fmt(conf)}%: ${fmt(crit, 6)}`,
        `Margin of error = ${useT ? 't*' : 'z*'} × SE = ${fmt(crit, 6)} × ${fmt(se, 6)} = ${fmt(margin, 6)}`,
        `CI = ${fmt(m)} ± ${fmt(margin, 6)} = (${fmt(lower, 6)}, ${fmt(upper, 6)})`,
      ],
      note: `We are ${fmt(conf)}% confident the population mean lies between ${fmt(lower, 5)} and ${fmt(upper, 5)}.`,
    };
  },
  content: {
    formula: ['CI = x̄ ± t* × s ÷ √n   (σ unknown, df = n − 1)', 'CI = x̄ ± z* × σ ÷ √n   (σ known)', 'z* = 1.645 (90%), 1.960 (95%), 2.576 (99%)'],
    body: [
      'A confidence interval gives a range of plausible values for a population mean, based on a sample. It is centred on the sample mean and extends by a margin of error on each side. The margin depends on how variable the data are, how many observations you have, and how confident you want to be.',
      'The standard error s ÷ √n measures how much the sample mean would bounce around from sample to sample. Multiply it by a critical value — z* from the normal distribution if the population standard deviation is known, or t* from Student’s t distribution if you estimated it from the sample — to get the margin of error.',
      'Higher confidence means a wider interval: 99% intervals are wider than 95% ones because they need to capture the true mean more often. Larger samples give narrower intervals, but because of the square root you need four times the data to halve the width.',
    ],
    faq: [
      { q: 'What does “95% confident” actually mean?', a: 'If you repeated the sampling many times and built an interval each time, about 95% of those intervals would contain the true population mean. Any single interval either contains it or doesn’t.' },
      { q: 'Should I use z or t?', a: 'Use t whenever the standard deviation comes from your sample, which is almost always. The difference is large for small samples and becomes negligible above roughly n = 100.' },
      { q: 'Does the data need to be normal?', a: 'For small samples the method assumes the population is roughly normal. For larger samples (often n ≥ 30) the central limit theorem makes the sample mean approximately normal anyway.' },
    ],
  },
  related: ['sample-size', 'standard-deviation', 'p-value', 'z-score'],
  examples: [
    { values: { mean: 100, sd: 10, n: 100, conf: 95, method: 'z' }, expect: { margin: 1.959964, lower: 98.040036, critical: 1.959964 }, tolerance: 1e-6 },
    { values: { mean: 50, sd: 8, n: 16, conf: 95, method: 't' }, expect: { critical: 2.13145, margin: 4.2629 }, tolerance: 1e-4 },
    { values: { mean: 0, sd: 1, n: 100, conf: 99, method: 'z' }, expect: { critical: 2.575829 }, tolerance: 1e-6 },
  ],
});
