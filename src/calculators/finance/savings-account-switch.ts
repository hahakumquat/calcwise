import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const grow = (b: number, apy: number, y: number) => b * Math.pow(1 + apy / 100, y);

export default defineCalculator({
  slug: 'savings-account-switch',
  title: 'Savings Account Switch Calculator',
  category: 'finance',
  description: 'See how much more interest you would earn by moving your savings from a low-APY account to a higher-APY one, over 1, 5 and 10 years.',
  keywords: ['savings account switch', 'high yield savings calculator', 'savings apy comparison', 'is it worth switching savings accounts', 'compare savings accounts'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'balance', label: 'Savings balance', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'The amount you would move. No further deposits or withdrawals are assumed.' },
    { id: 'oldApy', label: 'Current APY', type: 'number', suffix: '%', default: 0.5, min: 0, max: 100, step: 0.05, info: 'The annual percentage yield your current account pays.' },
    { id: 'newApy', label: 'New account APY', type: 'number', suffix: '%', default: 4.0, min: 0, max: 100, step: 0.05, info: 'The APY of the account you are considering. Enter a rate you have checked yourself; it is not a current offer.' },
    { id: 'years', label: 'Years', type: 'number', default: 5, min: 1, max: 50, step: 1, info: 'How long the money stays put. Rates are assumed to stay the same.' },
  ],
  outputs: [
    { id: 'gain', label: 'Extra interest from switching', format: 'currency', precision: 2, primary: true, info: 'Interest in the new account minus interest in the current one over your chosen years.' },
    { id: 'oldInterest', label: 'Interest in current account', format: 'currency', precision: 2, info: 'Balance × ((1 + APY)^years − 1).' },
    { id: 'newInterest', label: 'Interest in new account', format: 'currency', precision: 2, info: 'Balance × ((1 + APY)^years − 1).' },
    { id: 'oldEnd', label: 'Final balance, current account', format: 'currency', precision: 2, info: 'Starting balance plus interest in the current account.' },
    { id: 'newEnd', label: 'Final balance, new account', format: 'currency', precision: 2, info: 'Starting balance plus interest in the new account.' },
    { id: 'gain1', label: 'Extra interest after 1 year', format: 'currency', precision: 2, info: 'The gain from switching if the money stays 1 year.' },
    { id: 'gain5', label: 'Extra interest after 5 years', format: 'currency', precision: 2, info: 'The gain from switching if the money stays 5 years.' },
    { id: 'gain10', label: 'Extra interest after 10 years', format: 'currency', precision: 2, info: 'The gain from switching if the money stays 10 years.' },
  ],
  compute: (v) => {
    const b = num(v.balance);
    const o = num(v.oldApy);
    const n = num(v.newApy);
    const y = num(v.years);
    if (b === null || o === null || n === null || y === null || b < 0 || o < 0 || n < 0 || o > 100 || n > 100 || y < 1 || y > 50) return { gain: null };
    const interest = (apy: number, yrs: number) => grow(b, apy, yrs) - b;
    const gainAt = (yrs: number) => interest(n, yrs) - interest(o, yrs);
    const oldI = interest(o, y);
    const newI = interest(n, y);
    const gain = newI - oldI;
    const xs: number[] = [];
    for (let i = 0; i <= y; i++) xs.push(i);
    const better = n > o;
    return {
      gain,
      oldInterest: oldI,
      newInterest: newI,
      oldEnd: b + oldI,
      newEnd: b + newI,
      gain1: gainAt(1),
      gain5: gainAt(5),
      gain10: gainAt(10),
      tone: gain > 0 ? 'good' : gain < 0 ? 'warn' : undefined,
      badge: gain > 0 ? 'Worth a look' : gain < 0 ? 'Lower rate' : 'No difference',
      chart: {
        type: 'line',
        title: 'Balance over time',
        x: xs,
        xLabel: 'Years',
        xFormat: { format: 'number' },
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Current account', values: xs.map((i) => grow(b, o, i)) },
          { name: 'New account', values: xs.map((i) => grow(b, n, i)) },
        ],
      },
      steps: [
        `Current: ${money(b)} × ((1 + ${o}%)^${y} − 1) = ${money(oldI)}`,
        `New: ${money(b)} × ((1 + ${n}%)^${y} − 1) = ${money(newI)}`,
        `Extra interest = ${money(newI)} − ${money(oldI)} = ${money(gain)}`,
      ],
      note: better
        ? `Over ${y} year${y === 1 ? '' : 's'}, the higher rate earns ${money(gain)} more, if both rates stay the same.`
        : `The new account pays no more than the current one, so switching earns nothing extra at these rates.`,
    };
  },
  content: {
    formula: [
      'Interest = balance × ((1 + APY)^years − 1)',
      'Extra interest from switching = new-account interest − current-account interest',
    ],
    body: [
      'Many savings accounts at large banks pay well under 1% APY, while online high-yield savings accounts often pay several times more. On a few thousand dollars the gap is small. On a bigger balance it adds up quickly, and compounding makes it grow faster each year.',
      'This calculator takes your balance and two APYs and compounds each once a year, since APY already includes the effect of compounding within the year. It assumes no deposits or withdrawals. Try 20,000 dollars at 0.50% versus 4.00%: after one year you would have earned 100.00 dollars versus 800.00 dollars, and after five years 505.03 dollars versus 4,333.06 dollars.',
      'The rates here are numbers you type in, not current offers. Savings rates are usually variable, so the bank can change them at any time, and the gap you see today may shrink or grow. Treat the result as a what-if, and re-check rates now and then.',
      'Deposit insurance limits (FDIC for banks, NCUA for credit unions) are not modelled. Interest is also usually taxable as ordinary income, which this tool ignores. Check any minimum balance, fee or promotional-rate conditions before moving money.',
    ],
    faq: [
      { q: 'Is it worth switching savings accounts for a higher APY?', a: 'Often, if the new account is insured and has no fees that eat the gain. With 20,000 dollars, moving from 0.50% to 4.00% earns about 700 dollars more in the first year, and about 3,828 dollars more over five years if rates stay the same.' },
      { q: 'How is the extra interest calculated?', a: 'Each account grows as balance × (1 + APY)^years. Interest is the growth above your starting balance, and the extra interest is the new account\'s interest minus the old one\'s.' },
      { q: 'What if the new rate drops later?', a: 'Savings rates are usually variable. If the new rate falls, your real gain will be lower than shown. Run the calculator with a lower new APY to see a cautious case.' },
      { q: 'Does this include deposit insurance, taxes or fees?', a: 'No. It does not model FDIC or NCUA coverage limits, tax on interest, or account fees. Keep balances within insured limits and check the account terms.' },
      { q: 'Does the calculator include new deposits?', a: 'No. It assumes a single balance with no deposits or withdrawals. Regular deposits would increase the dollar gain from a higher rate.' },
    ],
    sources: [
      { label: 'FDIC: Deposit insurance', url: 'https://www.fdic.gov/deposit-insurance' },
      { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' },
    ],
  },
  related: ['apy-calculator', 'emergency-fund', 'compound-interest', 'cd', 'savings-goal', 'inflation'],
  examples: [
    {
      // 20000 × (1.005 − 1) = 100.00; 20000 × 0.04 = 800.00; gain 700.00
      values: { balance: 20000, oldApy: 0.5, newApy: 4, years: 1 },
      expect: { oldInterest: 100, newInterest: 800, gain: 700 },
      tolerance: 1e-6,
    },
    {
      // 1.005^5 = 1.0252513 -> 505.03; 1.04^5 = 1.2166529 -> 4333.06; gain 3828.03
      values: { balance: 20000, oldApy: 0.5, newApy: 4, years: 5 },
      expect: { oldInterest: 505.03, newInterest: 4333.06, gain: 3828.03, gain1: 700 },
      tolerance: 0.01,
    },
    {
      // 10 years: 20000 × (1.04^10 − 1) = 9604.89; 20000 × (1.005^10 − 1) = 1022.80
      values: { balance: 20000, oldApy: 0.5, newApy: 4, years: 10 },
      expect: { oldInterest: 1022.8, newInterest: 9604.89, gain: 8582.09 },
      tolerance: 0.01,
    },
  ],
});
