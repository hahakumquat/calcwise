import { defineCalculator } from '../../lib/types';
import type { ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'standard-error',
  title: 'Standard Error of the Mean Calculator',
  category: 'statistics',
  description: 'Find the standard error of the mean from a sample standard deviation and sample size, and see how many observations a target error needs.',
  keywords: ['standard error of the mean', 'standard error calculator', 'SEM', 'standard error formula', 'sample size for standard error'],
  inputs: [
    { id: 'sd', info: 'The sample standard deviation s: how spread out your data are.', label: 'Sample standard deviation (s)', type: 'number', default: 12, min: 0 },
    { id: 'n', info: 'How many observations are in your sample.', label: 'Sample size (n)', type: 'number', default: 36, min: 2, step: 1 },
    { id: 'target', info: 'Optional. The standard error you would like to reach. Leave blank to skip.', label: 'Target standard error (optional)', type: 'number', default: 1, min: 0 },
  ],
  outputs: [
    { id: 'se', info: 'Standard error of the mean: s ÷ √n.', label: 'Standard error', precision: 6, primary: true },
    { id: 'needed', info: 'The sample size that brings the standard error down to your target: (s ÷ target)², rounded up.', label: 'Sample size for target', precision: 0 },
  ],
  compute: (v) => {
    const sd = num(v.sd);
    const n = num(v.n);
    const target = num(v.target);
    if (sd === null || n === null) return { se: null };
    if (sd < 0) return { se: null, error: 'Standard deviation can’t be negative.' };
    if (!Number.isInteger(n) || n < 2) return { se: null, error: 'Sample size must be a whole number of at least 2.' };
    const se = sd / Math.sqrt(n);
    const out: Record<string, string | number | string[] | ChartSpec | null> = {
      se,
      steps: [`SE = s ÷ √n = ${fmt(sd)} ÷ √${n} = ${fmt(se, 6)}`],
      note: `The sample mean typically lands about ${fmt(se, 4)} from the true mean.`,
    };
    const ns = [n, n * 2, n * 4, n * 8, n * 16];
    out.chart = {
      type: 'bar',
      title: 'Standard error as the sample grows',
      categories: ns.map((k) => `n = ${k}`),
      series: [{ name: 'Standard error', values: ns.map((k) => sd / Math.sqrt(k)) }],
      highlight: 0,
    };
    if (target !== null && target > 0) {
      const needed = Math.ceil(Math.round((sd / target) ** 2 * 1e9) / 1e9);
      out.needed = needed;
      (out.steps as string[]).push(`n needed = (s ÷ target)² = (${fmt(sd)} ÷ ${fmt(target)})² → ${needed}`);
    }
    return out;
  },
  content: {
    formula: ['SE = s ÷ √n', 'n needed = (s ÷ target SE)², rounded up'],
    body: [
      'The standard error of the mean says how much a sample average would bounce around if you drew new samples again and again. It is the sample standard deviation divided by the square root of the sample size.',
      'Standard deviation describes the spread of the data themselves, and it does not shrink as you collect more. Standard error describes the uncertainty of the average, and it does shrink. Because of the square root, halving the standard error takes four times as many observations.',
      'To plan a study, turn the formula around: the sample size needed for a target standard error is (s ÷ target)², rounded up. That uses your current s as a guess, so treat the result as an estimate.',
    ],
    faq: [
      { q: 'What is the difference between standard deviation and standard error?', a: 'Standard deviation measures spread in the data. Standard error measures how precisely the sample mean estimates the population mean, and equals s ÷ √n.' },
      { q: 'With s = 12 and n = 36, what is the standard error?', a: '12 ÷ √36 = 12 ÷ 6 = 2. To bring it down to 1 you would need (12 ÷ 1)² = 144 observations.' },
      { q: 'Does this give a confidence interval?', a: 'No. A confidence interval multiplies the standard error by a critical value (about 1.96 for 95% with a large sample). Use the confidence interval calculator for that.' },
    ],
  },
  related: ['standard-deviation', 'confidence-interval', 'sample-size', 'coefficient-of-variation'],
  examples: [
    { values: { sd: 12, n: 36, target: 1 }, expect: { se: 2, needed: 144 }, tolerance: 1e-9 },
    { values: { sd: 15, n: 100, target: 0 }, expect: { se: 1.5 }, tolerance: 1e-9 },
  ],
});
