import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const MAX_LAMBDA = 500;
const MAX_K = 1000;

/** Poisson pmf for every i in 0..upTo, built from a running log-factorial so large λ and k never overflow. */
function pmfs(lambda: number, upTo: number): number[] {
  if (lambda === 0) return Array.from({ length: upTo + 1 }, (_, i) => (i === 0 ? 1 : 0));
  const out: number[] = [];
  const ll = Math.log(lambda);
  let lf = 0; // ln(i!)
  for (let i = 0; i <= upTo; i++) {
    if (i > 0) lf += Math.log(i);
    out.push(Math.exp(-lambda + i * ll - lf));
  }
  return out;
}

export default defineCalculator({
  slug: 'poisson-probability',
  title: 'Poisson Probability Calculator',
  category: 'statistics',
  description: 'Find the chance of exactly k, at most k or at least k events when events happen at an average rate λ, with steps and a distribution chart.',
  keywords: ['poisson probability', 'poisson distribution', 'poisson calculator', 'poisson pmf', 'poissonpdf', 'poissoncdf', 'events per interval', 'p(x=k)'],
  inputs: [
    { id: 'lambda', info: 'The average number of events per interval (λ), such as 3 calls per hour. It can be a decimal, from 0 to 500.', label: 'Average rate (λ)', type: 'number', default: 3, min: 0, max: MAX_LAMBDA, step: 0.1, help: 'Average events per interval, e.g. 3 calls per hour' },
    { id: 'k', info: 'The number of events you are asking about in one interval (whole number, 0 to 1,000).', label: 'Events (k)', type: 'number', default: 2, min: 0, max: MAX_K, step: 1 },
  ],
  outputs: [
    { id: 'exact', info: 'The chance of exactly k events: e^(−λ) λ^k ÷ k!.', label: 'P(X = k) — exactly k', primary: true, precision: 6 },
    { id: 'atMost', info: 'The chance of k or fewer events.', label: 'P(X ≤ k) — at most k', precision: 6 },
    { id: 'atLeast', info: 'The chance of k or more events.', label: 'P(X ≥ k) — at least k', precision: 6 },
  ],
  compute: (v) => {
    const lambda = num(v.lambda);
    const k = num(v.k);
    if (lambda === null || k === null) return { exact: null };
    if (lambda < 0 || lambda > MAX_LAMBDA) return { exact: null, error: `The average rate λ must be between 0 and ${MAX_LAMBDA}.` };
    if (!Number.isInteger(k) || k < 0 || k > MAX_K) return { exact: null, error: `Events (k) must be a whole number from 0 to ${MAX_K}.` };

    const hiNeeded = Math.max(k, Math.ceil(lambda + 4 * Math.sqrt(lambda)) + 1);
    const pm = pmfs(lambda, Math.max(k, hiNeeded));
    const exact = pm[k];
    let below = 0; // P(X < k)
    for (let i = 0; i < k; i++) below += pm[i];
    const atMost = Math.min(1, below + exact);
    const atLeast = Math.min(1, Math.max(0, 1 - below));

    // Chart window: at most 41 bars, covering about λ ± 4 SD and always including k.
    let lo = Math.max(0, Math.floor(lambda - 4 * Math.sqrt(lambda)));
    let hi = Math.min(hiNeeded, lo + 40);
    if (k < lo || k > hi) {
      lo = Math.max(0, k - 20);
      hi = lo + 40;
    }
    const cats: string[] = [];
    const vals: number[] = [];
    for (let i = lo; i <= hi; i++) {
      cats.push(String(i));
      vals.push(i < pm.length ? pm[i] : pmfs(lambda, i)[i]);
    }

    return {
      exact,
      atMost,
      atLeast,
      tone: exact >= 0.2 ? 'good' : exact >= 0.05 ? 'ok' : 'warn',
      badge: exact >= 0.2 ? 'Likely outcome' : exact >= 0.05 ? 'Plausible outcome' : 'Unlikely outcome',
      chart: {
        type: 'bar',
        title: `Chance of each number of events (k = ${k} highlighted)`,
        categories: cats,
        series: [{ name: 'Probability', values: vals }],
        highlight: k - lo,
      },
      steps: [
        `λ = ${fmt(lambda)}, k = ${k}`,
        `P(X = ${k}) = e^(−${fmt(lambda)}) × ${fmt(lambda)}^${k} ÷ ${k}! = ${fmt(exact, 6)}`,
        `P(X ≤ ${k}) = sum of P(X = i) for i = 0 to ${k} = ${fmt(atMost, 6)}`,
        `P(X ≥ ${k}) = 1 − P(X ≤ ${k - 1 < 0 ? 'none' : k - 1}) = ${fmt(atLeast, 6)}`,
      ],
    };
  },
  content: {
    formula: ['P(X = k) = e^(−λ) × λ^k ÷ k!', 'Mean = λ, variance = λ'],
    body: [
      'The Poisson distribution gives the chance of seeing exactly k events in a fixed interval of time or space when events happen independently at a constant average rate λ. Typical uses are calls arriving per hour, typos per page, or cars passing a point per minute.',
      'Enter the average rate λ for one interval and the count k you care about. The calculator returns exactly k, at most k (k or fewer) and at least k (k or more). The at-most and at-least values overlap at k, so they add up to 1 plus P(X = k).',
      'Probabilities are built up term by term in log space so large λ and k do not overflow; λ is capped at 500 and k at 1,000. The model assumes events are independent and the rate does not change; bursts or a fixed upper limit on events call for a different distribution, such as the binomial.',
    ],
    faq: [
      { q: 'What is the chance of exactly 2 events when the average is 3?', a: 'P(X = 2) = e^(−3) × 3² ÷ 2! = 4.5 × e^(−3) = 0.2240, about 22.4%.' },
      { q: 'How do I find "at most" and "at least" probabilities?', a: 'For λ = 3 and k = 2, add P(0) + P(1) + P(2) = 0.0498 + 0.1494 + 0.2240 = 0.4232 for at most 2. At least 2 is 1 − P(0) − P(1) = 0.8009.' },
      { q: 'What is the chance of no events at all?', a: 'P(X = 0) = e^(−λ). With an average of 1 event per interval that is e^(−1) = 0.3679, about 36.8%.' },
      { q: 'How is Poisson different from binomial?', a: 'The binomial counts successes in a fixed number of trials; the Poisson counts events in an interval with no fixed upper limit. Poisson is the limit of the binomial for many trials with a small success chance, with λ = n × p.' },
    ],
    sources: [
      { label: 'NIST Engineering Statistics Handbook: Poisson distribution', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda366j.htm' },
      { label: 'Wikipedia: Poisson distribution', url: 'https://en.wikipedia.org/wiki/Poisson_distribution' },
    ],
  },
  related: ['binomial-probability'],
  examples: [
    // λ=3,k=2: e^-3=0.0497870684; P0=0.0497870684, P1=3e^-3=0.1493612051, P2=4.5e^-3=0.2240418077
    // P(X<=2)=0.4231900812; P(X>=2)=1-0.1991482735=0.8008517265
    { values: { lambda: 3, k: 2 }, expect: { exact: 0.2240418077, atMost: 0.4231900812, atLeast: 0.8008517265 }, tolerance: 1e-8 },
    // λ=1,k=0: e^-1 = 0.3678794412; P(X<=0) = same; P(X>=0) = 1
    { values: { lambda: 1, k: 0 }, expect: { exact: 0.3678794412, atMost: 0.3678794412, atLeast: 1 }, tolerance: 1e-8 },
  ],
});
