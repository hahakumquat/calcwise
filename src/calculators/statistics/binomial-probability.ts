import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const MAX_N = 1000;

/** Binomial pmf for every i in 0..n, computed in log space (stable for large n). */
function pmfs(n: number, p: number): number[] {
  const out: number[] = [];
  if (p === 0) return Array.from({ length: n + 1 }, (_, i) => (i === 0 ? 1 : 0));
  if (p === 1) return Array.from({ length: n + 1 }, (_, i) => (i === n ? 1 : 0));
  const lf = [0];
  for (let i = 1; i <= n; i++) lf.push(lf[i - 1] + Math.log(i));
  const lp = Math.log(p);
  const lq = Math.log(1 - p);
  for (let i = 0; i <= n; i++) out.push(Math.exp(lf[n] - lf[i] - lf[n - i] + i * lp + (n - i) * lq));
  return out;
}

export default defineCalculator({
  slug: 'binomial-probability',
  title: 'Binomial Probability Calculator',
  category: 'statistics',
  description: 'Find the chance of exactly k, at most k or at least k successes in n trials, plus the mean and standard deviation, with steps and a chart.',
  keywords: ['binomial probability', 'binomial distribution', 'binomial calculator', 'p(x=k)', 'at least k successes', 'bernoulli trials', 'binompdf'],
  inputs: [
    { id: 'n', info: 'The number of independent trials, such as coin flips or free throws (whole number, up to 1,000).', label: 'Trials (n)', type: 'number', default: 10, min: 1, max: MAX_N, step: 1 },
    { id: 'p', info: 'The chance of success on each trial, as a decimal between 0 and 1 (0.5 for a fair coin).', label: 'Success probability (p)', type: 'number', default: 0.5, min: 0, max: 1, step: 0.01, help: 'A probability between 0 and 1 (e.g. 0.25 for 25%)' },
    { id: 'k', info: 'The number of successes you are asking about (whole number from 0 to n).', label: 'Successes (k)', type: 'number', default: 3, min: 0, max: MAX_N, step: 1 },
  ],
  outputs: [
    { id: 'exact', info: 'The chance of getting exactly k successes: C(n,k) p^k (1−p)^(n−k).', label: 'P(X = k) — exactly k', primary: true, precision: 6 },
    { id: 'atMost', info: 'The chance of k or fewer successes.', label: 'P(X ≤ k) — at most k', precision: 6 },
    { id: 'atLeast', info: 'The chance of k or more successes.', label: 'P(X ≥ k) — at least k', precision: 6 },
    { id: 'mean', info: 'The expected number of successes, n × p.', label: 'Mean (np)', precision: 6 },
    { id: 'sd', info: 'The standard deviation of the number of successes, √(np(1−p)).', label: 'Standard deviation', precision: 6 },
  ],
  compute: (v) => {
    const n = num(v.n);
    const p = num(v.p);
    const k = num(v.k);
    if (n === null || p === null || k === null) return { exact: null };
    if (!Number.isInteger(n) || n < 1 || n > MAX_N) return { exact: null, error: `Trials must be a whole number from 1 to ${MAX_N}.` };
    if (p < 0 || p > 1) return { exact: null, error: 'The success probability must be between 0 and 1. For percentages, divide by 100 (35% → 0.35).' };
    if (!Number.isInteger(k) || k < 0 || k > n) return { exact: null, error: 'Successes (k) must be a whole number from 0 to n.' };

    const pm = pmfs(n, p);
    const exact = pm[k];
    let atMost = 0;
    for (let i = 0; i <= k; i++) atMost += pm[i];
    let atLeast = 0;
    for (let i = k; i <= n; i++) atLeast += pm[i];
    atMost = Math.min(1, atMost);
    atLeast = Math.min(1, atLeast);
    const mean = n * p;
    const sd = Math.sqrt(n * p * (1 - p));

    // Chart window: all bars up to n = 40, otherwise mean ± 4 SD (and always include k), capped at 41 bars.
    let lo = 0;
    let hi = n;
    if (n > 40) {
      lo = Math.max(0, Math.floor(mean - 4 * sd));
      hi = Math.min(n, Math.ceil(mean + 4 * sd));
      lo = Math.min(lo, k);
      hi = Math.max(hi, k);
      if (hi - lo > 40) {
        lo = Math.max(0, Math.min(k, Math.round(mean) - 20));
        hi = Math.min(n, lo + 40);
      }
    }
    const cats: string[] = [];
    const vals: number[] = [];
    for (let i = lo; i <= hi; i++) {
      cats.push(String(i));
      vals.push(pm[i]);
    }

    return {
      exact,
      atMost,
      atLeast,
      mean,
      sd,
      tone: exact >= 0.2 ? 'good' : exact >= 0.05 ? 'ok' : 'warn',
      badge: exact >= 0.2 ? 'Likely outcome' : exact >= 0.05 ? 'Plausible outcome' : 'Unlikely outcome',
      chart: {
        type: 'bar',
        title: `Chance of each number of successes (k = ${k} highlighted)`,
        categories: cats,
        series: [{ name: 'Probability', values: vals }],
        highlight: k - lo,
      },
      steps: [
        `n = ${n}, p = ${fmt(p)}, k = ${k}`,
        `P(X = ${k}) = C(${n}, ${k}) × ${fmt(p)}^${k} × ${fmt(1 - p)}^${n - k} = ${fmt(exact, 6)}`,
        `P(X ≤ ${k}) = sum of P(X = i) for i = 0 to ${k} = ${fmt(atMost, 6)}`,
        `P(X ≥ ${k}) = sum of P(X = i) for i = ${k} to ${n} = ${fmt(atLeast, 6)}`,
        `Mean = n × p = ${fmt(mean)}; SD = √(n × p × (1 − p)) = ${fmt(sd, 6)}`,
      ],
    };
  },
  content: {
    formula: ['P(X = k) = C(n, k) × p^k × (1 − p)^(n − k)', 'Mean = n × p', 'SD = √(n × p × (1 − p))'],
    body: [
      'The binomial distribution counts successes in a fixed number of independent trials where each trial has the same chance of success: coin flips, free throws, defective parts on a line, or true/false guesses on a quiz. Enter the number of trials n, the success probability p, and the count k you care about.',
      'The calculator gives three answers: exactly k successes, at most k (k or fewer) and at least k (k or more). The at-most and at-least values are sums of the exact probabilities, and they overlap at k, so they add up to 1 plus P(X = k).',
      'Probabilities are computed in log space so large n does not overflow, and n is capped at 1,000. The model assumes the trials are independent and p never changes; drawing without replacement from a small group needs the hypergeometric distribution instead.',
    ],
    faq: [
      { q: 'What is the probability of exactly 3 heads in 10 fair coin flips?', a: 'C(10,3) = 120, so P(X = 3) = 120 × 0.5³ × 0.5⁷ = 120 ÷ 1024 = 0.1172, about 11.7%. The chance of 3 or fewer heads is 176 ÷ 1024 = 0.1719.' },
      { q: 'How do I find "at least k" successes?', a: 'Add the exact probabilities from k up to n. For n = 10, p = 0.5, k = 3 that is 1 − 56 ÷ 1024 = 0.9453, because "at least 3" is the opposite of "2 or fewer".' },
      { q: 'What are the mean and standard deviation?', a: 'The mean is n × p and the standard deviation is √(n × p × (1 − p)). For n = 5 and p = 0.2 the mean is 1 and the standard deviation is about 0.894.' },
      { q: 'When does the binomial model not apply?', a: 'It needs a fixed number of trials, two outcomes per trial, a constant p and independent trials. If p changes or the trials affect each other, the results will be off.' },
    ],
    sources: [{ label: 'Wikipedia: Binomial distribution', url: 'https://en.wikipedia.org/wiki/Binomial_distribution' }],
  },
  related: ['permutation-combination', 'probability', 'expected-value', 'normal-distribution'],
  examples: [
    // C(10,3)=120; 120/1024 = 0.1171875; P(X<=3) = (1+10+45+120)/1024 = 176/1024 = 0.171875; P(X>=3) = 1 - 56/1024 = 0.9453125
    { values: { n: 10, p: 0.5, k: 3 }, expect: { exact: 0.1171875, atMost: 0.171875, atLeast: 0.9453125, mean: 5, sd: Math.sqrt(2.5) }, tolerance: 1e-9 },
    // C(5,2)=10; 10 x 0.04 x 0.512 = 0.2048; mean 1; SD = sqrt(0.8) = 0.894427191
    { values: { n: 5, p: 0.2, k: 2 }, expect: { exact: 0.2048, mean: 1, sd: 0.894427191 }, tolerance: 1e-9 },
    // n=4, p=1, k=4: certain success -> 1
    { values: { n: 4, p: 1, k: 4 }, expect: { exact: 1, atMost: 1, atLeast: 1 }, tolerance: 1e-9 },
  ],
});
