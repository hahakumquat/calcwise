import { defineCalculator } from '../../lib/types';
import { num, sum } from '../../lib/math';
import { fmt, nums } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'expected-value',
  title: 'Expected Value Calculator',
  category: 'statistics',
  description: 'Find the expected value, variance and standard deviation of a bet, game or decision from its outcomes and probabilities, with the cost to play taken off.',
  keywords: ['expected value calculator', 'how to calculate expected value', 'expected value formula', 'expected value of a bet', 'probability expected value', 'lottery expected value'],
  updated: '2026-11-19',
  inputs: [
    { id: 'outcomes', label: 'Outcomes', type: 'list', default: '100, 0', placeholder: 'Payoffs separated by commas, spaces or new lines', info: 'What you receive in each possible case, such as a prize. Use 0 for winning nothing and a negative number for a loss.' },
    { id: 'probs', label: 'Probabilities', type: 'list', default: '10, 90', placeholder: 'One probability per outcome', help: 'Same number as outcomes, in the same order. Enter percentages that add to 100, or decimals that add to 1.', info: 'How likely each outcome is. They must cover every possibility, so they add up to 100% (or 1).' },
    { id: 'cost', label: 'Cost to play', type: 'number', prefix: '$', default: 5, min: 0, step: 1, optional: true, info: 'What you pay up front, such as a ticket price. Leave empty if there is none.' },
  ],
  outputs: [
    { id: 'ev', label: 'Expected value', format: 'number', precision: 4, primary: true, info: 'The probability-weighted average payoff, before the cost to play.' },
    { id: 'net', label: 'Expected value after cost', format: 'number', precision: 4, info: 'Expected value minus the cost to play. Positive means you come out ahead on average.' },
    { id: 'variance', label: 'Variance', format: 'number', precision: 4, info: 'The probability-weighted average of the squared distance from the expected value.' },
    { id: 'sd', label: 'Standard deviation', format: 'number', precision: 4, info: 'The square root of the variance, in the same units as the payoffs. Bigger means a bumpier ride.' },
  ],
  compute: (v) => {
    const xs = nums(v.outcomes);
    const ps = nums(v.probs);
    if (!xs.length || !ps.length) return { ev: null };
    if (xs.length !== ps.length) return { ev: null, error: `You entered ${xs.length} outcomes but ${ps.length} probabilities. They need to match.` };
    if (ps.some((p) => p < 0)) return { ev: null, error: 'Probabilities cannot be negative.' };
    const total = sum(ps);
    let scale: number;
    if (Math.abs(total - 1) < 1e-9) scale = 1;
    else if (Math.abs(total - 100) < 1e-9) scale = 100;
    else return { ev: null, error: `The probabilities add up to ${fmt(total)}. They need to add up to 100 (percent) or 1 (decimal).` };
    const p = ps.map((x) => x / scale);
    const ev = sum(xs.map((x, i) => x * p[i]));
    const variance = sum(xs.map((x, i) => p[i] * (x - ev) ** 2));
    const sd = Math.sqrt(variance);
    const cost = num(v.cost) ?? 0;
    if (cost < 0) return { ev: null, error: 'The cost to play cannot be negative.' };
    const net = ev - cost;
    const shown = xs.slice(0, 10);
    return {
      ev,
      net,
      variance,
      sd,
      chart: {
        type: 'bar',
        title: 'Chance of each outcome (%)',
        categories: shown.map((x) => fmt(x)),
        series: [{ name: 'Probability', values: p.slice(0, 10).map((x) => x * 100) }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Expected value = ${shown.map((x, i) => `${fmt(x)}×${fmt(p[i])}`).join(' + ')}${xs.length > 10 ? ' + …' : ''} = ${fmt(ev)}`,
        `Variance = Σ p × (x − ${fmt(ev)})² = ${fmt(variance)}; standard deviation = ${fmt(sd)}`,
        `After the cost to play: ${fmt(ev)} − ${fmt(cost)} = ${fmt(net)}`,
      ],
      note: net < 0
        ? `On average you lose ${fmt(-net, 4)} each time you play. Any single play can still win.`
        : net > 0
          ? `On average you gain ${fmt(net, 4)} each time you play. Any single play can still lose.`
          : 'On average you break even. Any single play can still win or lose.',
    };
  },
  content: {
    formula: ['E(X) = Σ x × p(x)', 'Variance = Σ p(x) × (x − E(X))²', 'Net expected value = E(X) − cost to play'],
    body: [
      'Expected value is the average result of a chance event if you could repeat it many times. List every possible outcome, multiply each by its probability, and add the results.',
      'Take a $5 ticket that pays $100 with a 10% chance and nothing otherwise. The expected value is 100 × 0.10 + 0 × 0.90 = $10. After the $5 cost, the expected value is +$5 per ticket.',
      'Expected value is an average, not a promise. A single play almost never lands on the average, which is why the standard deviation is shown too: a large value means results swing a lot.',
      'The probabilities must cover every possibility, so they add up to 100% (or 1). This calculator checks that and tells you if they do not.',
    ],
    faq: [
      { q: 'How do you calculate expected value?', a: 'Multiply each outcome by its probability and add the products. For $100 at 10% and $0 at 90%, the expected value is 100 × 0.10 + 0 × 0.90 = $10.' },
      { q: 'What does a negative expected value mean?', a: 'On average you lose money each time you play. Many games of chance are built this way, although individual plays can still win.' },
      { q: 'Do the probabilities have to add up to 100?', a: 'Yes. Together they must cover every possible outcome, so they add up to 100 (as percentages) or 1 (as decimals).' },
      { q: 'What is the difference between expected value and the average?', a: 'An ordinary average gives every value the same weight. Expected value weights each outcome by how likely it is.' },
    ],
    sources: [
      { label: 'Expected value (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Expected_value' },
    ],
  },
  related: ['probability', 'weighted-mean', 'standard-deviation', 'permutation-combination'],
  examples: [
    // EV 100*.1 = 10; var = .1*(90)^2 + .9*(10)^2 = 810 + 90 = 900; sd 30; net 10-5 = 5
    { values: { outcomes: [100, 0], probs: [10, 90], cost: 5 }, expect: { ev: 10, net: 5, variance: 900, sd: 30 }, tolerance: 1e-9 },
    // EV = 5 + 5 + 10 = 20; variance = .5*(-10)^2 + .25*0 + .25*20^2 = 50 + 100 = 150; sd = 12.2474487
    { values: { outcomes: [10, 20, 40], probs: [0.5, 0.25, 0.25], cost: null }, expect: { ev: 20, net: 20, variance: 150, sd: 12.2474487 }, tolerance: 1e-6 },
  ],
});
