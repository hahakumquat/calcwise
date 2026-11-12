import { defineCalculator } from '../../lib/types';
import { num, normalCdf } from '../../lib/math';
import { fmt, zCritical } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'ab-test',
  title: 'A/B Test Significance Calculator',
  category: 'statistics',
  description: 'Compare conversion rates of two variants and find out whether the difference is statistically significant.',
  keywords: ['split test', 'ab testing', 'conversion rate', 'statistical significance', 'two proportion z test', 'uplift'],
  popular: true,
  inputs: [
    { id: 'visitorsA', info: 'How many users saw the original version (the control).', label: 'Visitors — A (control)', type: 'number', default: 5000, min: 1, step: 1 },
    { id: 'convA', info: 'How many of the control users completed the goal, e.g. signed up or bought.', label: 'Conversions — A', type: 'number', default: 400, min: 0, step: 1 },
    { id: 'visitorsB', info: 'How many users saw the new version you are testing.', label: 'Visitors — B (variant)', type: 'number', default: 5000, min: 1, step: 1 },
    { id: 'convB', info: 'How many of the variant users completed the goal.', label: 'Conversions — B', type: 'number', default: 470, min: 0, step: 1 },
    {
      id: 'conf', info: 'How sure you want to be before calling a winner. 95% means accepting a 5% chance of a false positive.',
      label: 'Confidence level',
      type: 'select',
      default: '95',
      segmented: true,
      options: [
        { value: '90', label: '90%' },
        { value: '95', label: '95%' },
        { value: '99', label: '99%' },
      ],
    },
    {
      id: 'tails', info: 'Two-sided detects a difference in either direction; one-sided only asks whether B is better than A.',
      label: 'Test',
      type: 'select',
      default: 'two',
      segmented: true,
      options: [
        { value: 'two', label: 'Two-sided' },
        { value: 'one', label: 'One-sided (B > A)' },
      ],
    },
  ],
  outputs: [
    { id: 'verdict', info: 'Whether the difference between A and B is statistically significant at your chosen confidence level.', label: 'Result', format: 'text', primary: true },
    { id: 'rateA', info: 'Conversions divided by visitors for version A.', label: 'Conversion rate A', format: 'percent', precision: 2 },
    { id: 'rateB', info: 'Conversions divided by visitors for version B.', label: 'Conversion rate B', format: 'percent', precision: 2 },
    { id: 'uplift', info: 'How much better (or worse) B converts relative to A, as a percentage of A’s rate.', label: 'Relative uplift (B vs A)', format: 'percent', precision: 2 },
    { id: 'z', info: 'How many standard errors apart the two conversion rates are. Bigger (in size) means stronger evidence.', label: 'z-score', precision: 4 },
    { id: 'p', info: 'The chance of seeing a difference this large if A and B were truly identical. Below 1 − confidence counts as significant.', label: 'p-value', precision: 6 },
    { id: 'diffLow', info: 'Lower end of the confidence interval for the true difference in conversion rate (B − A).', label: 'Difference B − A, CI low', format: 'percent', precision: 2 },
    { id: 'diffHigh', info: 'Upper end of the confidence interval for the true difference in conversion rate (B − A).', label: 'Difference B − A, CI high', format: 'percent', precision: 2 },
  ],
  compute: (v) => {
    const nA = num(v.visitorsA);
    const cA = num(v.convA);
    const nB = num(v.visitorsB);
    const cB = num(v.convB);
    if (nA === null || cA === null || nB === null || cB === null) return { verdict: null };
    if (nA <= 0 || nB <= 0) return { verdict: null, error: 'Each variant needs at least one visitor.' };
    if (cA < 0 || cB < 0 || cA > nA || cB > nB) return { verdict: null, error: 'Conversions must be between 0 and the number of visitors.' };
    const conf = Number(v.conf) / 100 || 0.95;
    const oneSided = v.tails === 'one';
    const pA = cA / nA;
    const pB = cB / nB;
    const pool = (cA + cB) / (nA + nB);
    const sePool = Math.sqrt(pool * (1 - pool) * (1 / nA + 1 / nB));
    if (sePool === 0) return { verdict: null, rateA: pA, rateB: pB, error: 'Both variants have the same all-or-nothing rate, so there is nothing to test.' };
    const z = (pB - pA) / sePool;
    const p = oneSided ? normalCdf(-z) : 2 * normalCdf(-Math.abs(z));
    const alpha = 1 - conf;
    const sig = p < alpha;
    // Unpooled CI for the difference in rates.
    const seDiff = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
    const zc = zCritical(conf);
    const diff = pB - pA;
    const uplift = pA > 0 ? diff / pA : null;
    const winner = diff > 0 ? 'B' : 'A';
    const verdict = sig
      ? `Significant — ${winner} wins at ${fmt(conf * 100)}% confidence`
      : `Not significant at ${fmt(conf * 100)}% confidence`;
    return {
      verdict,
      rateA: pA,
      rateB: pB,
      uplift,
      z,
      p,
      diffLow: diff - zc * seDiff,
      diffHigh: diff + zc * seDiff,
      chart: [
        { type: 'bar', title: 'Conversion rate', categories: ['A (control)', 'B (variant)'], series: [{ name: 'Conversion rate', values: [pA, pB] }], format: { format: 'percent' }, highlight: diff >= 0 ? 1 : 0 },
        {
          type: 'distribution',
          title: `z = ${fmt(z, 3)} under the “no difference” curve`,
          mean: 0,
          sd: 1,
          shade: oneSided ? [{ from: z, label: 'p' }] : [{ to: -Math.abs(z), label: 'p/2' }, { from: Math.abs(z), label: 'p/2' }],
          markers: [{ x: z, label: `z = ${fmt(z, 3)}` }],
        },
      ],
      steps: [
        `Rate A = ${fmt(cA)} ÷ ${fmt(nA)} = ${fmt(pA * 100, 6)}%, rate B = ${fmt(cB)} ÷ ${fmt(nB)} = ${fmt(pB * 100, 6)}%`,
        uplift === null ? 'Uplift is undefined because A has a 0% rate' : `Relative uplift = (B − A) ÷ A = ${fmt(uplift * 100, 5)}%`,
        `Pooled rate p̂ = (${fmt(cA)} + ${fmt(cB)}) ÷ (${fmt(nA)} + ${fmt(nB)}) = ${fmt(pool, 6)}`,
        `SE = √(p̂(1 − p̂)(1/nA + 1/nB)) = ${fmt(sePool, 6)}`,
        `z = (pB − pA) ÷ SE = ${fmt(diff, 6)} ÷ ${fmt(sePool, 6)} = ${fmt(z, 5)}`,
        `${oneSided ? 'One-sided p = P(Z > z)' : 'Two-sided p = 2 × P(Z > |z|)'} = ${fmt(p, 5)}`,
        `${fmt(p, 5)} ${sig ? '<' : '≥'} α = ${fmt(alpha)} → ${sig ? 'significant' : 'not significant'}`,
      ],
      note: sig
        ? undefined
        : 'Not significant yet. The observed difference could plausibly be random noise; keep the test running to collect more data, or accept that any real effect is small.',
    };
  },
  content: {
    formula: ['p̂ = (c_A + c_B) ÷ (n_A + n_B)', 'SE = √(p̂(1 − p̂)(1/n_A + 1/n_B))', 'z = (p_B − p_A) ÷ SE', 'Uplift = (p_B − p_A) ÷ p_A'],
    body: [
      'An A/B test shows two versions of a page, email or feature to separate groups of users and compares how often each group converts. Because some difference will always appear by chance, you need a statistical test to judge whether the gap is real. This calculator uses the standard two-proportion z-test.',
      'The test pools both groups to estimate the conversion rate you would expect if the variants were identical, uses it to compute the standard error, and then measures how many standard errors apart the two observed rates are. That z-score is turned into a p-value. If the p-value is below 1 minus your confidence level (0.05 for 95%), the result is called statistically significant.',
      'The relative uplift is the headline number marketers quote: a jump from 8% to 9.4% is a 17.5% relative uplift, even though the absolute difference is 1.4 percentage points. The confidence interval for the difference shows the range of effects that are consistent with your data.',
      'Decide on the sample size before you start and avoid stopping the test the moment it turns significant — peeking repeatedly inflates the false-positive rate well above the nominal 5%.',
    ],
    faq: [
      { q: 'Should I use a one-sided or two-sided test?', a: 'Two-sided is the safer default: it detects a difference in either direction. Use one-sided only if you decided in advance that you only care whether B beats A, and would treat “B is worse” the same as “no difference”.' },
      { q: 'How many visitors do I need?', a: 'It depends on your baseline rate and the smallest uplift you want to detect. Small effects on low conversion rates can require tens of thousands of visitors per variant. Plan with a power analysis before launching.' },
      { q: 'What does 95% confidence mean here?', a: 'It means you accept a 5% chance of declaring a winner when there is actually no difference (a false positive).' },
    ],
  },
  related: ['p-value', 'sample-size', 'confidence-interval', 'percentage-change'],
  examples: [
    {
      values: { visitorsA: 1000, convA: 100, visitorsB: 1000, convB: 130, conf: '95', tails: 'two' },
      expect: { rateA: 0.1, rateB: 0.13, uplift: 0.3, z: 2.1027406, p: 0.0354881, verdict: 'Significant — B wins at 95% confidence' },
      tolerance: 1e-5,
    },
    {
      values: { visitorsA: 1000, convA: 100, visitorsB: 1000, convB: 110, conf: '95', tails: 'two' },
      expect: { verdict: 'Not significant at 95% confidence' },
    },
  ],
});
