import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'kelly-criterion',
  title: 'Kelly Criterion Bet Size Calculator',
  category: 'finance',
  description: 'Find the Kelly fraction of your bankroll to stake from your win chance and payout odds, with half Kelly and a dollar amount. Arithmetic only, not advice.',
  keywords: ['kelly criterion calculator', 'kelly bet size', 'kelly formula', 'half kelly', 'bankroll management calculator', 'optimal bet size'],
  updated: '2026-11-27',
  inputs: [
    { id: 'p', label: 'Chance of winning', type: 'number', suffix: '%', default: 55, min: 0, max: 100, step: 0.1, info: 'Your estimate of the probability the bet wins, as a percentage. Strictly between 0 and 100.' },
    { id: 'b', label: 'Net odds (profit per $1 staked)', type: 'number', default: 1, min: 0, step: 0.05, info: 'The profit on a win for each $1 staked. Even money is 1; a bet that pays 2 to 1 is 2.' },
    { id: 'bankroll', label: 'Bankroll', type: 'number', prefix: '$', default: 1000, min: 0, step: 100, optional: true, info: 'Optional. The total amount you could stake from, to turn the fraction into dollars.' },
  ],
  outputs: [
    { id: 'f', label: 'Kelly fraction of bankroll', format: 'percent', precision: 2, primary: true, info: 'The share of your bankroll the formula says to stake: p − (1 − p) ÷ b. Zero when there is no edge.' },
    { id: 'half', label: 'Half Kelly', format: 'percent', precision: 2, info: 'Half the Kelly fraction. Many people use it because the win chance is never known exactly.' },
    { id: 'stake', label: 'Stake at full Kelly', format: 'currency', info: 'Bankroll × Kelly fraction.' },
    { id: 'halfStake', label: 'Stake at half Kelly', format: 'currency', info: 'Bankroll × half Kelly.' },
  ],
  compute: (v) => {
    const pp = num(v.p), b = num(v.b), bank = num(v.bankroll);
    if (pp === null || b === null) return { f: null };
    if (pp <= 0 || pp >= 100) return { f: null, error: 'Chance of winning must be above 0% and below 100%.' };
    if (b <= 0) return { f: null, error: 'Net odds must be above 0.' };
    const p = pp / 100;
    const q = 1 - p;
    const raw = p - q / b;
    if (raw <= 0) {
      return { f: 0, half: 0, stake: 0, halfStake: 0, tone: 'warn', badge: 'No edge: the formula says do not bet', note: 'A zero or negative Kelly fraction means the expected profit is not positive at these odds. This is arithmetic on your inputs, not betting or investment advice.' };
    }
    const f = Math.min(raw, 1);
    const half = f / 2;
    const hasBank = bank !== null && bank > 0;
    return {
      f, half,
      stake: hasBank ? bank! * f : null,
      halfStake: hasBank ? bank! * half : null,
      tone: 'good',
      badge: `Stake ${(f * 100).toFixed(2)}% of your bankroll`,
      chart: {
        type: 'bar',
        title: 'Share of bankroll to stake',
        categories: ['Full Kelly', 'Half Kelly', 'Quarter Kelly'],
        series: [{ name: 'Stake', values: [f, half, f / 4] }],
        format: { format: 'percent', precision: 1 },
      },
      steps: [
        `q = 1 − ${p.toFixed(4).replace(/\.?0+$/, '')} = ${q.toFixed(4).replace(/\.?0+$/, '')}`,
        `f = p − q ÷ b = ${p.toFixed(4).replace(/\.?0+$/, '')} − ${q.toFixed(4).replace(/\.?0+$/, '')} ÷ ${b} = ${(raw * 100).toFixed(2)}%`,
        ...(hasBank ? [`Stake: ${usd(bank!)} × ${(f * 100).toFixed(2)}% = ${usd(bank! * f)}; half Kelly ${usd(bank! * half)}`] : []),
      ],
      note: 'Kelly assumes your win chance is known exactly, which it never is. An overestimate leads to over-betting, so many people use half or quarter Kelly. This is arithmetic on your inputs, not betting or investment advice.',
    };
  },
  content: {
    formula: ['f = p − (1 − p) ÷ b', 'Equivalent: f = (b × p − q) ÷ b, with q = 1 − p', 'Stake = bankroll × f'],
    body: [
      'The Kelly criterion is a formula for how much of a bankroll to stake on a repeated bet with a known edge, so that the bankroll grows as fast as possible over the long run. It takes your chance of winning (p) and the net odds (b, the profit for each $1 staked) and returns a fraction of the bankroll.',
      'If the fraction is zero or negative there is no edge and the formula says not to bet. Full Kelly also swings hard: even with a real edge, big drawdowns are normal. Because the win chance is only an estimate, many people stake half or quarter Kelly instead, which is shown here.',
      'This page is arithmetic on the numbers you enter. It does not know whether your win chance is right, and it is not betting or investment advice.',
    ],
    faq: [
      { q: 'What is the result for a 55% chance at even money?', a: 'With p = 0.55 and b = 1, f = 0.55 − 0.45 ÷ 1 = 0.10, so 10% of the bankroll. On $1,000 that is $100, or $50 at half Kelly.' },
      { q: 'What if the odds pay 2 to 1?', a: 'With a 60% chance and b = 2, f = 0.6 − 0.4 ÷ 2 = 0.40, or 40% of the bankroll.' },
      { q: 'What does a zero result mean?', a: 'The edge is zero or negative at these odds. The formula says do not bet. The chance would need to exceed 1 ÷ (b + 1) to have an edge.' },
      { q: 'Why use half Kelly?', a: 'Kelly is very sensitive to the win chance. If you overestimate it, full Kelly over-bets. Half Kelly gives up some growth for smaller swings and more room for error.' },
      { q: 'Does Kelly work for one-off bets?', a: 'It is designed for a long series of bets where you can reinvest. It is a guide to sizing, not a prediction for any single bet.' },
    ],
    sources: [{ label: 'Kelly, J. L. (1956). A New Interpretation of Information Rate. Bell System Technical Journal 35(4)' }],
  },
  related: ['expected-value', 'breakeven-win-rate', 'position-size-calculator'],
  examples: [
    // f = .55 - .45/1 = .10; stake 100; half .05, 50
    { values: { p: 55, b: 1, bankroll: 1000 }, expect: { f: 0.1, half: 0.05, stake: 100, halfStake: 50 }, tolerance: 0.0001 },
    // f = .6 - .4/2 = .40
    { values: { p: 60, b: 2, bankroll: 500 }, expect: { f: 0.4, stake: 200 }, tolerance: 0.0001 },
    // f = .4 - .6/1 = -.2 -> 0
    { values: { p: 40, b: 1, bankroll: 1000 }, expect: { f: 0, stake: 0 } },
    { values: { p: 100, b: 1, bankroll: 1000 }, expect: { error: 'Chance of winning must be above 0% and below 100%.' } },
  ],
});
