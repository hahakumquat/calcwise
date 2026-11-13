import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { timelineVerdict, fiPathChart, FIRE_UPDATED, fireNumber, growPath, IN, monthsToTarget, realReturn, SOURCES, yearsMonths } from '../../lib/helpers/fire';

const RATES = [3, 3.25, 3.5, 3.75, 4];

export default defineCalculator({
  slug: 'fat-fire',
  title: 'Fat FIRE Calculator',
  seoTitle: 'Fat FIRE Calculator: Retire Early in Comfort',
  metaDescription: 'Fat FIRE calculator: turn a high after-tax budget into the pre-tax withdrawals and portfolio you need, and see when your savings get you there.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'Plan a comfortable early retirement: account for taxes on withdrawals, choose a cautious withdrawal rate and see when you get there.',
  keywords: ['fat FIRE', 'fatFIRE', 'high net worth retirement', 'retire early rich', 'fat FI number'],
  inputs: [
    IN.spending(150000, 'Annual spending after tax'),
    { id: 'tax', label: 'Effective tax rate on withdrawals', type: 'number', suffix: '%', default: 15, min: 0, max: 60, step: 0.5, info: 'The average share of your withdrawals that goes to federal and state tax. It depends on your account mix: Roth and cost-basis withdrawals are tax-free, long-term gains are taxed at 0–20%, traditional 401(k)/IRA money as ordinary income. 10–20% is a common estimate for a mixed portfolio.' },
    IN.swr(3.5),
    IN.age(35),
    IN.portfolio(1500000),
    IN.savings(150000),
    IN.returnRate(7),
    IN.inflation(3),
  ],
  outputs: [
    { id: 'fatNumber', label: 'Fat FIRE number', primary: true, format: 'currency', precision: 0, info: 'The portfolio that supports your after-tax spending, once taxes on withdrawals are added, at your withdrawal rate. In today\'s dollars.' },
    { id: 'gross', label: 'Yearly withdrawal before tax', format: 'currency', precision: 0, info: 'What you need to withdraw so that, after tax, you have your spending: spending ÷ (1 − tax rate).' },
    { id: 'taxes', label: 'Estimated tax each year', format: 'currency', precision: 0, info: 'The part of each year\'s withdrawal that goes to tax.' },
    { id: 'timeTo', label: 'Time to Fat FIRE', format: 'text', info: 'How long until your portfolio reaches the Fat FIRE number at your current savings.' },
    { id: 'fatAge', label: 'Fat FIRE at age', precision: 1, suffix: 'years old', info: 'Your age when your portfolio reaches the Fat FIRE number.' },
    { id: 'monthlyAfterTax', label: 'Monthly spending money', format: 'currency', precision: 0, info: 'Your after-tax spending per month once you are retired.' },
  ],
  compute: (v) => {
    const spending = num(v.spending);
    const tax = num(v.tax) ?? 0;
    const swr = num(v.swr);
    const age = num(v.age);
    const have = num(v.portfolio) ?? 0;
    const savings = num(v.savings) ?? 0;
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    if (spending === null || swr === null || swr <= 0 || age === null || R === null || tax >= 100) return { fatNumber: null };
    const gross = spending / (1 - tax / 100);
    const target = fireNumber(gross, swr);
    const real = realReturn(R, I);
    const m = monthsToTarget({ start: have, savings, real, target });
    const years = Math.min(70, Math.ceil((m ?? 240) / 12) + 3);
    return {
      fatNumber: target,
      ...timelineVerdict(m === null ? null : m / 12),
      gross,
      taxes: gross - spending,
      timeTo: m === null ? 'Not within 80 years' : m === 0 ? 'You are already there' : yearsMonths(m),
      fatAge: m === null ? null : age + m / 12,
      monthlyAfterTax: spending / 12,
      chart: [
        { type: 'bar', title: 'Fat FIRE number by withdrawal rate', categories: RATES.map((r) => `${r}%`), series: [{ name: 'Fat FIRE number', values: RATES.map((r) => fireNumber(gross, r)) }], format: CURRENCY, highlight: RATES.indexOf(swr) },
        fiPathChart({ age, series: [{ name: 'Portfolio', values: growPath(have, savings, real, years) }], target, targetLabel: 'Fat FIRE number', fiAge: m === null ? null : age + m / 12 }),
      ],
      steps: [`Withdrawal before tax = ${money(spending, 0)} ÷ (1 − ${tax}%) = ${money(gross, 0)}`, `Fat FIRE number = ${money(gross, 0)} ÷ ${swr}% = ${money(target, 0)}`],
      note: `Taxes add ${money(target - fireNumber(spending, swr), 0)} to your target. Holding more in Roth and taxable accounts can lower your effective rate.`,
    };
  },
  content: {
    formula: ['Withdrawal before tax = after-tax spending ÷ (1 − effective tax rate)', 'Fat FIRE number = withdrawal before tax ÷ withdrawal rate'],
    body: [
      'Fat FIRE is financial independence without belt-tightening: a retirement budget that covers a large home, frequent travel, private schooling or generous giving — commonly $100,000 a year or more. The targets are large, usually several million dollars, so it is most common among high earners and business owners.',
      'At these spending levels taxes become a meaningful part of the plan, so this calculator starts from what you want to spend after tax and grosses it up by your effective tax rate on withdrawals. It also defaults to a 3.5% withdrawal rate, since Fat FIRE retirees often want a cushion and may be retired for 40 years or more.',
      'The bar chart shows how your target changes with the withdrawal rate. The line chart shows your path from today, assuming you keep saving the same amount each year.',
    ],
    sections: [
      {
        heading: 'Taxes in a Fat FIRE plan',
        paragraphs: [
          'Your effective tax rate depends on where your money sits. Roth accounts and the cost basis of taxable investments come out tax-free; long-term capital gains and qualified dividends are taxed at 0%, 15% or 20% federally; traditional 401(k) and IRA withdrawals are taxed as ordinary income. A mix of all three gives you control over how much tax you pay each year.',
          'High spenders should also consider state income tax, the 3.8% net investment income tax above certain thresholds, and how withdrawals affect health insurance subsidies (usually not available at Fat FIRE income levels).',
        ],
      },
      {
        heading: 'Fat FIRE and concentrated stock',
        paragraphs: [
          'Many people pursuing Fat FIRE have a large share of their wealth in one company\'s stock from RSUs or a startup. A concentrated position can swing your FIRE date by years in either direction. The RSU FIRE calculator models selling shares as they vest and diversifying.',
        ],
      },
    ],
    faq: [
      { q: 'How much do you need for Fat FIRE?', a: 'It depends on your spending. $150,000 a year after tax, with a 15% tax rate and a 3.5% withdrawal rate, needs about $5 million. At 4% with no tax it would be $3.75 million.' },
      { q: 'What is a good withdrawal rate for Fat FIRE?', a: 'Many Fat FIRE planners use 3–3.5% because they expect a long retirement and want room for market downturns. A larger portfolio also makes it easier to cut discretionary spending in bad years.' },
      { q: 'Is Fat FIRE the same as being rich?', a: 'Not quite. It is a lifestyle choice about how much you spend in retirement, not a net-worth threshold. Someone with $3 million and modest spending is regular FIRE; someone with $5 million who spends $200,000 a year may not yet be Fat FIRE.' },
      { q: 'Should I include my home in my Fat FIRE number?', a: 'No — count only investments that can fund withdrawals. Do include the running costs of your home (property tax, insurance, maintenance) in your spending.' },
    ],
    sources: [SOURCES.ern, SOURCES.irs525],
  },
  related: ['lean-fire', 'fire-calculator', 'rsu-fire', 'safe-withdrawal-rate', 'income-tax'],
  examples: [{ values: { spending: 85000, tax: 15, swr: 4, age: 40, portfolio: 2500000, savings: 0, returnRate: 7, inflation: 3 }, expect: { gross: 100000, fatNumber: 2500000, taxes: 15000, fatAge: 40 } }],
});
