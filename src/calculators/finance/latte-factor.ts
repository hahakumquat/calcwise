import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Future value of one end-of-year deposit of `a` for `n` years at annual rate r (decimal). */
const fv = (a: number, r: number, n: number) => (r === 0 ? a * n : (a * (Math.pow(1 + r, n) - 1)) / r);

export default defineCalculator({
  slug: 'latte-factor',
  title: 'Latte Factor Calculator',
  category: 'finance',
  description: 'See what a daily coffee or any small habit costs in a year, and what that money could grow to if you invested it instead.',
  keywords: ['latte factor calculator', 'daily coffee cost', 'cost of a daily habit', 'small purchases add up', 'coffee money invested', 'what if i invested instead'],
  updated: '2026-11-16',
  inputs: [
    { id: 'cost', label: 'Cost per purchase', type: 'number', prefix: '$', default: 5, min: 0, step: 0.25, info: 'What one coffee, snack, delivery fee or other small habit costs.' },
    { id: 'perWeek', label: 'Times per week', type: 'number', default: 7, min: 0, max: 50, step: 1, info: 'How often you buy it. 7 means every day.' },
    { id: 'years', label: 'Years', type: 'number', default: 30, min: 1, max: 60, step: 1, info: 'How long you would invest the money instead.' },
    { id: 'rate', label: 'Assumed yearly return', type: 'number', suffix: '%', default: 7, min: 0, max: 20, step: 0.5, info: 'An assumption, not a promise. Real returns vary a lot from year to year, and 7% is a commonly used long-run stock-market figure before inflation, tax and fees.' },
  ],
  outputs: [
    { id: 'annual', label: 'Spent per year', format: 'currency', primary: true, info: 'Cost × times per week × 365 ÷ 7.' },
    { id: 'spent', label: 'Spent over the whole period', format: 'currency', info: 'The yearly spend multiplied by the number of years, with no growth.' },
    { id: 'future', label: 'If invested instead', format: 'currency', info: 'Each year’s spend is invested at the end of the year and compounds at the assumed return.' },
    { id: 'growth', label: 'Growth on top', format: 'currency', info: 'The invested value minus what you put in.' },
  ],
  compute: (v) => {
    const cost = num(v.cost);
    const perWeek = num(v.perWeek);
    const years = num(v.years);
    const rate = num(v.rate);
    if (cost === null || perWeek === null || years === null || rate === null || cost < 0 || perWeek < 0 || years < 1 || rate < 0) return { annual: null };
    const n = Math.round(years);
    const r = rate / 100;
    const annual = (cost * perWeek * 365) / 7;
    const future = fv(annual, r, n);
    const spent = annual * n;
    const xs: number[] = [];
    const contrib: number[] = [];
    const growth: number[] = [];
    for (let y = 0; y <= n; y++) {
      xs.push(y);
      contrib.push(annual * y);
      growth.push(fv(annual, r, y) - annual * y);
    }
    return {
      annual,
      spent,
      future,
      growth: future - spent,
      note: `$${fmt(annual)} a year is $${fmt(spent)} over ${n} years. Invested at ${rate}% a year it would be about $${fmt(future)}. This ignores tax, fees and inflation, and a coffee you enjoy may well be worth it.`,
      chart: {
        type: 'area',
        stacked: true,
        title: 'What the money could become',
        x: xs,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Money you put in', values: contrib },
          { name: 'Growth', values: growth },
        ],
      },
      steps: [
        `Per year = $${fmt(cost, 2)} × ${perWeek} × 365 ÷ 7 = $${fmt(annual, 2)}`,
        `Future value = $${fmt(annual, 2)} × ((1 + ${r})^${n} − 1) ÷ ${r || 'r'} = $${fmt(future, 2)}`,
      ],
    };
  },
  content: {
    formula: ['Spent per year = cost × times per week × 365 ÷ 7', 'Future value = yearly spend × ((1 + r)ⁿ − 1) ÷ r'],
    body: [
      'The "latte factor" is a popular idea: small daily purchases, like a $5 coffee, add up to a surprising amount, and the same money invested could grow much larger. This calculator turns a habit into a yearly cost and then into what that money could be worth if you invested it each year instead.',
      'It assumes one deposit at the end of each year and a steady return, using the standard annuity formula. Real returns are uneven, and the result ignores taxes, fees and inflation. Treat it as a way to see the size of a habit, not a forecast.',
      'One coffee is not the reason anyone struggles to save. Big costs such as housing, transport and debt matter far more, so use this to decide what is worth keeping, not to feel guilty about a treat. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How much does a $5 daily coffee cost per year?', a: '$5 × 365 = $1,825 a year, or $54,750 over 30 years before any growth.' },
      { q: 'What would $1,825 a year grow to?', a: 'At 7% a year for 30 years with end-of-year deposits, about $172,391. That is an assumption-based example, not a guarantee.' },
      { q: 'Is the latte factor realistic?', a: 'The arithmetic is right, but returns are not steady and the figure ignores tax, fees and inflation. It is better as a nudge than as a plan.' },
    ],
    sources: [{ label: 'Investor.gov: Compound interest calculator (SEC)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' }],
  },
  related: ['compound-interest', 'subscription-cost', 'investment', 'savings-goal'],
  examples: [
    // 5 × 7 × 365 ÷ 7 = 1,825; spent 54,750; 1.07^30 = 7.612255 → 1,825 × 6.612255 ÷ 0.07 = 172,391.
    { values: { cost: 5, perWeek: 7, years: 30, rate: 7 }, expect: { annual: 1825, spent: 54750, future: 172391, growth: 117641 }, tolerance: 1e-3 },
    // 0% return: no growth.
    { values: { cost: 4, perWeek: 5, years: 10, rate: 0 }, expect: { annual: (4 * 5 * 365) / 7, future: ((4 * 5 * 365) / 7) * 10, growth: 0 }, tolerance: 1e-6 },
  ],
});
