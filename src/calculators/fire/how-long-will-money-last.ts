import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { FIRE_UPDATED, SOURCES, yearsMonths } from '../../lib/helpers/fire';

const MAX_YEARS = 100;

export default defineCalculator({
  slug: 'how-long-will-money-last',
  title: 'How Long Will My Money Last?',
  seoTitle: 'How Long Will My Money Last? Calculator',
  metaDescription: 'Find out how many years your savings will last with regular withdrawals, investment growth and inflation, plus the withdrawal that would last forever.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'See how many years your savings last with yearly withdrawals, investment returns and inflation.',
  keywords: ['how long will my money last', 'retirement drawdown', 'savings depletion', 'withdrawal calculator', 'run out of money', 'how long will 1 million last'],
  inputs: [
    { id: 'balance', label: 'Savings today', type: 'number', prefix: '$', default: 1000000, min: 0, step: 10000, info: 'The amount you will draw from: retirement accounts, brokerage and savings.' },
    { id: 'withdrawal', label: 'Yearly withdrawal', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'What you take out in the first year, before tax. Withdrawals are taken at the start of each year.' },
    { id: 'returnRate', label: 'Expected return', type: 'number', suffix: '% / yr', default: 6, step: 0.1, info: 'Average yearly investment return before inflation. Retirees often hold more bonds, so 4–6% is a common planning range.' },
    { id: 'inflation', label: 'Inflation', type: 'number', suffix: '% / yr', default: 3, step: 0.1, info: 'How fast prices rise each year. Used to raise your withdrawal when the toggle below is on.' },
    { id: 'adjust', label: 'Raise withdrawals with inflation', type: 'toggle', default: true, info: 'On: your withdrawal grows each year to keep its buying power, like most retirees\' spending. Off: you withdraw the same dollar amount every year.' },
  ],
  outputs: [
    { id: 'lasts', label: 'Your money lasts', primary: true, format: 'text', info: 'How long until your savings run out at this withdrawal, return and inflation. "Indefinitely" means growth keeps up with withdrawals for at least 100 years.' },
    { id: 'years', label: 'Years', precision: 1, suffix: 'years', info: 'The same time as a number of years.' },
    { id: 'rate', label: 'Withdrawal rate', format: 'percent', precision: 2, info: 'First-year withdrawal divided by savings. 4% or less is often considered sustainable for 30 years.' },
    { id: 'total', label: 'Total withdrawn', format: 'currency', precision: 0, info: 'The sum of all withdrawals until the money runs out (or over 100 years), in future dollars.' },
    { id: 'forever', label: 'Withdrawal that lasts indefinitely', format: 'currency', precision: 0, info: 'The largest first-year withdrawal that never depletes your savings at a constant return — you spend only the growth.' },
  ],
  compute: (v) => {
    const B0 = num(v.balance);
    const W0 = num(v.withdrawal);
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    if (B0 === null || W0 === null || R === null || B0 < 0 || W0 < 0) return { lasts: null };
    const adjust = v.adjust !== 'off';
    const r = R / 100;
    const g = adjust ? I / 100 : 0;
    let b = B0;
    let w = W0;
    let total = 0;
    let years: number | null = null;
    const path = [B0];
    for (let y = 0; y < MAX_YEARS; y++) {
      if (w >= b) {
        total += b;
        years = y + (w > 0 ? b / w : 0);
        b = 0;
        path.push(0);
        break;
      }
      total += w;
      b = (b - w) * (1 + r);
      w *= 1 + g;
      path.push(b);
    }
    // Sustainable withdrawal: spend only real growth (start-of-year withdrawals).
    const real = (1 + r) / (1 + g) - 1;
    const forever = real > 0 ? (B0 * real) / (1 + real) : 0;
    const x = path.map((_, i) => i);
    return {
      lasts: years === null ? 'Indefinitely' : yearsMonths(years * 12),
      years: years ?? null,
      rate: B0 > 0 ? W0 / B0 : null,
      total,
      forever,
      chart: [
        {
          type: 'area',
          title: 'Savings balance over time',
          x,
          xLabel: 'Years',
          yFormat: CURRENCY,
          series: [{ name: 'Balance', values: path }],
          markers: years !== null ? [{ x: Math.round(years * 10) / 10, label: `Runs out after ${years.toFixed(1)} yrs` }] : [],
        },
        { type: 'bar', title: 'Yearly withdrawal compared', categories: ['Your withdrawal', 'Lasts indefinitely'], series: [{ name: 'First-year withdrawal', values: [W0, forever] }], format: CURRENCY, highlight: 0 },
      ],
      steps: [
        `Each year: withdraw at the start, then grow the rest by ${R}%`,
        adjust ? `Withdrawal rises ${I}% a year: ${money(W0, 0)} → ${money(W0 * (1 + g), 0)} → …` : `Withdrawal stays ${money(W0, 0)} every year`,
        `Sustainable withdrawal = ${money(B0, 0)} × real return ÷ (1 + real return) = ${money(forever, 0)}`,
      ],
      note: years === null ? 'Your returns outpace your withdrawals, so the balance does not run out within 100 years.' : W0 > forever ? `To make it last indefinitely, withdraw about ${money(forever, 0)} a year instead.` : undefined,
    };
  },
  content: {
    formula: ['Each year: balance = (balance − withdrawal) × (1 + return)', 'With inflation: next withdrawal = withdrawal × (1 + inflation)', 'Lasts forever if withdrawal ≤ balance × real return ÷ (1 + real return)'],
    body: [
      'This calculator plays your retirement forward one year at a time: take out the year\'s withdrawal, let the rest earn your expected return, raise next year\'s withdrawal for inflation, and repeat until the money runs out. The answer is the number of years your savings support you.',
      'If your withdrawal is small enough that investment growth replaces it each year, the money lasts indefinitely. The "withdrawal that lasts indefinitely" figure shows the largest amount that achieves that at a steady return.',
      'Real markets do not deliver a steady return. A crash early in retirement shortens how long your money lasts even if the long-run average is the same. To see how likely you are to run out across thousands of possible markets, use the safe withdrawal rate calculator.',
    ],
    sections: [
      {
        heading: 'How long will $1 million last?',
        paragraphs: [
          'At a 6% return and 3% inflation, $1 million lasts about 30 years with an inflation-adjusted withdrawal of around $50,000, and indefinitely at about $28,000. At $80,000 a year it lasts roughly 15 years. Enter your own numbers above — small changes in return or spending move the answer a lot.',
        ],
      },
    ],
    faq: [
      { q: 'Should I turn on inflation adjustment?', a: 'Usually yes. Your costs rise over time, so a fixed dollar withdrawal buys less each year. Leaving it off can make savings look like they last much longer than they will in practice.' },
      { q: 'Are withdrawals before or after tax?', a: 'Before tax. If your savings are in a traditional 401(k) or IRA, part of each withdrawal will go to income tax, so withdraw enough to cover both spending and tax.' },
      { q: 'What return should I use in retirement?', a: 'It depends on your mix of stocks and bonds. A 60/40 portfolio has historically returned around 6–8% before inflation, but many planners use 4–6% to stay on the safe side.' },
      { q: 'Does this include Social Security?', a: 'No. If you will receive Social Security or a pension, subtract it from your yearly withdrawal to see how long your savings need to cover the rest.' },
    ],
    sources: [SOURCES.bengen, SOURCES.ssa],
  },
  related: ['safe-withdrawal-rate', 'fire-number', 'retirement', 'inflation', 'barista-fire'],
  examples: [
    { values: { balance: 100000, withdrawal: 10000, returnRate: 0, inflation: 0, adjust: 'on' }, expect: { years: 10, lasts: '10 years' } },
    { values: { balance: 1000000, withdrawal: 10000, returnRate: 5, inflation: 0, adjust: 'off' }, expect: { lasts: 'Indefinitely' } },
  ],
});
