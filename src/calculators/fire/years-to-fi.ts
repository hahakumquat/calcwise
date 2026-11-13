import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';
import { FIRE_UPDATED, fireNumber, IN, monthsToTarget, realReturn, SOURCES, yearsMonths } from '../../lib/helpers/fire';

export default defineCalculator({
  slug: 'years-to-fi',
  title: 'Savings Rate & Years to FI Calculator',
  seoTitle: 'Years to Financial Independence by Savings Rate',
  metaDescription: 'See how your savings rate sets the number of years until you can retire, with a curve from 5% to 90% saved and your own rate marked.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'See how many years of work stand between you and financial independence at your savings rate — and how much each extra percent saves.',
  keywords: ['savings rate', 'years to retirement', 'years to financial independence', 'savings rate calculator', 'how long until I can retire', 'shockingly simple math'],
  inputs: [
    { id: 'income', label: 'Annual take-home income', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, info: 'Your household income after taxes, including pre-tax retirement contributions and employer match.' },
    { id: 'rate', label: 'Savings rate', type: 'number', suffix: '%', default: 35, min: 0, max: 100, step: 1, info: 'The share of take-home income you save and invest. Whatever you do not save, you spend — and the calculator assumes you keep spending that much in retirement.' },
    { id: 'portfolio', label: 'Invested today', type: 'number', prefix: '$', default: 0, min: 0, step: 1000, optional: true, info: 'Long-term investments you already have. Leave at 0 to see the classic "starting from zero" result.' },
    IN.returnRate(7),
    IN.inflation(3),
    IN.swr(4),
  ],
  outputs: [
    { id: 'years', label: 'Years until financial independence', primary: true, precision: 1, suffix: 'years', info: 'Working years until your investments can cover your spending at your withdrawal rate, at a constant savings rate.' },
    { id: 'readable', label: 'That is', format: 'text', info: 'The same time in years and months.' },
    { id: 'saved', label: 'Saved each year', format: 'currency', precision: 0, info: 'Income × savings rate.' },
    { id: 'spending', label: 'Spent each year', format: 'currency', precision: 0, info: 'Income minus savings. The calculator assumes your retirement spending matches it.' },
    { id: 'target', label: 'FIRE number', format: 'currency', precision: 0, info: 'Annual spending ÷ withdrawal rate.' },
    { id: 'plus10', label: 'If you saved 10 points more', precision: 1, suffix: 'years', info: 'Years to financial independence with a savings rate 10 percentage points higher. Shows the payoff of saving more.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const rate = num(v.rate);
    const R = num(v.returnRate);
    const I = num(v.inflation) ?? 0;
    const swr = num(v.swr);
    if (income === null || income <= 0 || rate === null || rate < 0 || rate > 100 || R === null || swr === null || swr <= 0) return { years: null };
    const have = num(v.portfolio) ?? 0;
    const real = realReturn(R, I);
    const yearsAt = (r: number) => {
      const s = income * (r / 100);
      const m = monthsToTarget({ start: have, savings: s, real, target: fireNumber(income - s, swr), maxYears: 100 });
      return m === null ? null : m / 12;
    };
    const y = yearsAt(rate);
    const saved = income * (rate / 100);
    const curveRates = Array.from({ length: 18 }, (_, i) => 5 + i * 5);
    const curve = curveRates.map((r) => {
      const t = yearsAt(r);
      return t === null ? null : Math.min(t, 80);
    });
    return {
      years: y,
      readable: y === null ? 'More than 100 years' : y === 0 ? 'You are already there' : yearsMonths(y * 12),
      saved,
      spending: income - saved,
      target: fireNumber(income - saved, swr),
      plus10: rate + 10 <= 100 ? yearsAt(rate + 10) : null,
      chart: [
        {
          type: 'line',
          title: 'Years to financial independence by savings rate',
          x: curveRates,
          xLabel: 'Savings rate',
          xFormat: { format: 'number', suffix: '%' },
          yFormat: { format: 'number', suffix: ' yrs' },
          series: [{ name: 'Years to FI', values: curve }],
          markers: [{ x: rate, label: y === null ? `${rate}%` : `${rate}%: ${y.toFixed(1)} yrs` }],
        },
        moneyDonut('Your income', [{ label: 'Saved', value: saved }, { label: 'Spent', value: income - saved }], `${rate}%`, 'saved'),
      ],
      steps: [
        `Save ${money(saved, 0)} and spend ${money(income - saved, 0)} a year`,
        `FIRE number = ${money(income - saved, 0)} ÷ ${swr}% = ${money(fireNumber(income - saved, swr), 0)}`,
        `Real return ${(real * 100).toFixed(2)}% → ${y === null ? 'not reached' : `${y.toFixed(1)} years`}`,
      ],
      note: 'Your income level barely matters here — what counts is the share you save. Two people saving 50% reach FI at about the same time whether they earn $50k or $500k.',
    };
  },
  content: {
    formula: ['Spending = income × (1 − savings rate)', 'FIRE number = spending ÷ withdrawal rate', 'Years = time for savings, growing at the real return, to reach the FIRE number'],
    body: [
      'The savings rate is the most powerful number in early retirement. It works twice: every dollar you save is a dollar invested and also a dollar of spending your portfolio will not need to replace. That is why the curve is so steep — going from 10% to 50% cuts the working years from roughly half a century to under two decades.',
      'Starting from zero, the result depends only on your savings rate, your real return and your withdrawal rate — not on how much you earn. That surprising fact was popularised by the blogger Mr. Money Mustache, whose savings-rate table inspired a generation of FIRE plans.',
      'Add what you have already invested to see your personal timeline, and use the "10 points more" line to see what one bigger change would buy you.',
    ],
    sections: [
      {
        heading: 'How to calculate your savings rate',
        paragraphs: [
          'Divide what you save in a year by your take-home pay. Count 401(k) and IRA contributions, any employer match, HSA contributions and money moved to a brokerage account. Add pre-tax contributions and the match to both the top and bottom of the fraction so they are treated consistently.',
          'Paying down a mortgage early is usually counted as spending in this framework, because the money is not available to generate income in retirement — though it does lower your future spending.',
        ],
      },
    ],
    faq: [
      { q: 'What is a good savings rate to retire early?', a: 'A 50% savings rate leads to financial independence in roughly 15–20 years from zero, depending on returns. 25% takes about 35 years; 70% can take as little as 9–10.' },
      { q: 'Why does my income not change the result?', a: 'Because spending scales with income in this model. Someone who saves half of $200,000 needs twice the FIRE number of someone who saves half of $100,000, but they also save twice as much each year.' },
      { q: 'Should I use gross or take-home pay?', a: 'Take-home pay plus any pre-tax retirement contributions and match. Taxes are money you never get to save or spend, so including them understates your real rate.' },
      { q: 'Is this the same as the "shockingly simple math" table?', a: 'It follows the same idea. Results differ slightly with the return, inflation and withdrawal assumptions you choose; this calculator also uses monthly compounding.' },
    ],
    sources: [SOURCES.mmm, SOURCES.trinity],
  },
  related: ['fire-calculator', 'fire-number', 'lean-fire', 'take-home-pay', 'savings-goal'],
  examples: [{ values: { income: 100000, rate: 50, portfolio: null, returnRate: 3, inflation: 3, swr: 4 }, expect: { years: 25, saved: 50000, target: 1250000 }, tolerance: 0.01 }],
});
