import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt, zCritical, plotFn } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'sample-size',
  title: 'Sample Size Calculator',
  category: 'statistics',
  description: 'Work out how many survey responses you need for a given margin of error and confidence level.',
  keywords: ['survey sample size', 'how many respondents', 'margin of error', 'finite population correction', 'Cochran formula'],
  inputs: [
    { id: 'conf', info: 'How sure you want to be that the true value is within your margin of error. 95% is standard.', label: 'Confidence level', type: 'number', suffix: '%', default: 95, min: 50, max: 99.99, step: 0.5 },
    { id: 'moe', info: 'The ± precision you want, e.g. 5 means the result should be within 5 percentage points of the truth.', label: 'Margin of error', type: 'number', suffix: '%', default: 5, min: 0, step: 0.5 },
    { id: 'p', info: 'Your best guess of the proportion who will answer “yes”. 50% is the safest choice when unsure.', label: 'Expected proportion', type: 'number', suffix: '%', default: 50, min: 0, max: 100, help: 'Use 50% if unsure — it gives the largest, safest sample' },
    { id: 'pop', info: 'The total number of people you could survey. Leave blank if it is very large or unknown.', label: 'Population size', type: 'number', min: 1, step: 1, optional: true, help: 'Leave blank for a very large or unknown population' },
  ],
  outputs: [
    { id: 'n', info: 'The number of completed responses you need, rounded up.', label: 'Required sample size', format: 'integer', primary: true },
    { id: 'n0', info: 'The exact sample size for an infinitely large population, before rounding.', label: 'Sample size before rounding (infinite population)', precision: 4 },
    { id: 'nAdj', info: 'The sample size after the finite population correction, which helps when your population is small.', label: 'After finite population correction', precision: 4 },
    { id: 'z', info: 'The z critical value for your confidence level (1.96 for 95%).', label: 'z critical value', precision: 4 },
  ],
  compute: (v) => {
    const conf = num(v.conf);
    const moe = num(v.moe);
    const p = num(v.p);
    const N = num(v.pop);
    if (conf === null || moe === null || p === null) return { n: null };
    if (conf <= 0 || conf >= 100) return { n: null, error: 'Confidence level must be between 0% and 100%.' };
    if (moe <= 0 || moe >= 100) return { n: null, error: 'Margin of error must be between 0% and 100%.' };
    if (p < 0 || p > 100) return { n: null, error: 'Proportion must be between 0% and 100%.' };
    if (N !== null && N < 1) return { n: null, error: 'Population size must be at least 1.' };
    const z = zCritical(conf / 100);
    const P = p / 100;
    const E = moe / 100;
    const n0 = (z * z * P * (1 - P)) / (E * E);
    const steps = [
      `z for ${fmt(conf)}% confidence = ${fmt(z, 6)}`,
      `n₀ = z² × p(1 − p) ÷ E² = ${fmt(z, 6)}² × ${fmt(P)} × ${fmt(1 - P)} ÷ ${fmt(E)}² = ${fmt(n0, 6)}`,
    ];
    let nAdj: number | null = null;
    let final = n0;
    if (N !== null) {
      nAdj = n0 / (1 + (n0 - 1) / N);
      final = nAdj;
      steps.push(`Finite population correction: n = n₀ ÷ (1 + (n₀ − 1) ÷ N) = ${fmt(n0, 6)} ÷ (1 + ${fmt(n0 - 1, 6)} ÷ ${fmt(N)}) = ${fmt(nAdj, 6)}`);
    }
    // Guard against 384.00000000001 rounding up to 385.
    const n = Math.max(1, Math.ceil(Number(final.toPrecision(12))));
    steps.push(`Round up to the next whole respondent: ${n}`);
    // How the required sample changes with the margin of error, holding everything else fixed.
    const nFor = (e: number) => {
      const base = (z * z * P * (1 - P)) / ((e / 100) * (e / 100));
      return Math.ceil(N !== null ? base / (1 + (base - 1) / N) : base);
    };
    const chart = plotFn(nFor, Math.max(1, Math.min(moe, 10) / 2), Math.max(10, moe * 1.5), {
      name: 'Sample size',
      title: 'Required sample size vs margin of error',
      xLabel: 'Margin of error (%)',
      markers: [{ x: moe, label: `±${fmt(moe)}% → ${n}` }],
    }, 40);
    return {
      n,
      n0,
      chart,
      nAdj,
      z,
      steps,
      note: P === 0 || P === 1 ? 'A proportion of 0% or 100% leaves no uncertainty; use 50% for a conservative estimate.' : undefined,
    };
  },
  content: {
    formula: ['n₀ = z² × p(1 − p) ÷ E²', 'n = n₀ ÷ (1 + (n₀ − 1) ÷ N)   (finite population)'],
    body: [
      'Before running a survey or poll, you need to know how many people to ask. The answer depends on three things: how confident you want to be (usually 95%), how precise you need the result to be (the margin of error, often ±5 percentage points), and how varied the answers are likely to be.',
      'Variability is captured by p(1 − p), where p is the proportion you expect to answer “yes”. This product is largest when p = 50%, so if you have no prior estimate, 50% gives a sample big enough for any outcome. At 95% confidence and ±5%, that famous worst case needs 385 responses.',
      'If the population is small — say, the 1,000 employees of one company — you can apply the finite population correction, which reduces the required sample because each response covers a meaningful share of everyone. For populations in the hundreds of thousands or more, the correction makes almost no difference.',
    ],
    faq: [
      { q: 'Why does a national poll only need about 1,000 people?', a: 'Precision depends mainly on the sample size, not the population size. About 1,000 random respondents give a margin of error near ±3% at 95% confidence, whether the country has 5 million or 300 million people.' },
      { q: 'Does this account for people who don’t respond?', a: 'No. This is the number of completed responses you need. If you expect a 20% response rate, invite five times as many people.' },
      { q: 'How do I halve the margin of error?', a: 'You need roughly four times the sample size, because the margin of error shrinks with the square root of n.' },
    ],
  },
  related: ['confidence-interval', 'ab-test', 'standard-deviation'],
  examples: [
    { values: { conf: 95, moe: 5, p: 50, pop: null }, expect: { n: 385, n0: 384.1459 }, tolerance: 1e-6 },
    { values: { conf: 95, moe: 5, p: 50, pop: 1000 }, expect: { n: 278 } },
    { values: { conf: 99, moe: 3, p: 50, pop: null }, expect: { n: 1844 } },
  ],
});
