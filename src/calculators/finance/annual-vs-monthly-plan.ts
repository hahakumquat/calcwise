import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'annual-vs-monthly-plan',
  title: 'Annual vs Monthly Plan Break-Even',
  category: 'finance',
  description: 'Is the yearly plan cheaper than paying monthly? Enter both prices to see the saving, the effective monthly price and the month the annual plan pays off.',
  keywords: ['annual vs monthly subscription', 'is annual plan worth it', 'yearly vs monthly pricing', 'subscription break-even calculator', 'annual plan savings', 'monthly or yearly subscription'],
  updated: '2026-11-20',
  inputs: [
    { id: 'monthly', label: 'Monthly price', type: 'number', prefix: '$', default: 12.99, min: 0.01, step: 0.01, info: 'What you pay each month on the monthly plan.' },
    { id: 'annual', label: 'Annual price', type: 'number', prefix: '$', default: 99, min: 0.01, step: 0.01, info: 'What you pay once for the full year on the annual plan.' },
  ],
  outputs: [
    { id: 'saving', label: 'Saved over 12 months', format: 'currency', primary: true, info: '12 × monthly price − annual price. Negative means the annual plan costs more.' },
    { id: 'pct', label: 'Saving vs paying monthly', format: 'percent', precision: 1, info: 'The saving as a share of 12 months at the monthly price.' },
    { id: 'effective', label: 'Effective monthly price', format: 'currency', info: 'Annual price ÷ 12.' },
    { id: 'breakeven', label: 'Break-even', format: 'number', precision: 1, suffix: 'months', info: 'Annual price ÷ monthly price: after this many months of use the monthly plan has cost as much as the annual one.' },
  ],
  compute: (v) => {
    const m = num(v.monthly), a = num(v.annual);
    if (m === null || a === null) return { saving: null, note: 'Enter both prices.' };
    if (m <= 0 || a <= 0) return { saving: null, error: 'Both prices must be above 0.' };
    const year = m * 12;
    const saving = year - a;
    const be = a / m;
    const beMonths = Math.ceil(be - 1e-9);
    const x = Array.from({ length: 13 }, (_, i) => i);
    const better = saving > 0 ? 'Annual is cheaper if you will use it for the full year.' : saving === 0 ? 'Both plans cost the same over a full year.' : 'Monthly is cheaper over a full year.';
    return {
      saving,
      pct: saving / year,
      effective: a / 12,
      breakeven: be,
      tone: saving > 0 ? 'good' : 'ok',
      badge: be > 12 ? 'Monthly is cheaper for a year' : `Annual wins from month ${beMonths}`,
      chart: {
        type: 'line',
        title: 'Total paid over the first year',
        x,
        xLabel: 'Months',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Monthly plan', values: x.map((i) => m * i) },
          { name: 'Annual plan', values: x.map((i) => (i === 0 ? 0 : a)) },
        ],
      },
      steps: [
        `12 months monthly = 12 × ${usd(m)} = ${usd(year)}`,
        `Saving = ${usd(year)} − ${usd(a)} = ${usd(saving)}`,
        `Effective monthly price = ${usd(a)} ÷ 12 = ${usd(a / 12)}`,
        `Break-even = ${usd(a)} ÷ ${usd(m)} = ${be.toFixed(2)} months`,
      ],
      note: `${better} If you might cancel before month ${be > 12 ? 12 : beMonths}, the monthly plan costs less.`,
    };
  },
  content: {
    formula: [
      'Saving = 12 × monthly price − annual price',
      'Effective monthly price = annual price ÷ 12',
      'Break-even months = annual price ÷ monthly price',
    ],
    body: [
      'Subscriptions often offer a discount for paying a year up front. The discount only helps if you actually keep the service long enough. This calculator shows the saving for a full year and the break-even point: the number of months after which the annual plan would have been the cheaper choice.',
      'If you are confident you will use the service for the whole year, take the cheaper full-year price. If you are unsure, compare the break-even with how long you realistically expect to stay. Paying monthly lets you stop at any time.',
      'It compares list prices only. It ignores tax, free trials, refunds on cancelled annual plans, price rises at renewal, and any value of keeping cash in your pocket for a few months.',
      'To see what all your subscriptions add up to, use the subscription cost calculator. To judge whether a service is worth it per use, try cost per use.',
    ],
    faq: [
      { q: 'Is $99 a year better than $12.99 a month?', a: 'Over 12 months the monthly plan costs 12 × $12.99 = $155.88, so the annual plan saves $56.88 (36.5%). The effective monthly price is $8.25.' },
      { q: 'What is the break-even point?', a: 'Annual price ÷ monthly price. For $99 and $12.99 that is 7.62 months, so after 8 months of monthly payments you would have paid more than the annual price.' },
      { q: 'When is monthly the better choice?', a: 'When you might cancel before the break-even month, or when the annual price is not actually lower than 12 monthly payments.' },
      { q: 'What if both plans cost the same over a year?', a: 'If the annual price equals 12 monthly payments, the saving is $0 and the break-even is exactly 12 months, so the monthly plan is more flexible.' },
    ],
    sources: [
      { label: 'Break-even point (Investopedia)', url: 'https://www.investopedia.com/terms/b/breakevenpoint.asp' },
    ],
  },
  related: ['subscription-cost', 'cost-per-use', 'latte-factor', 'hours-of-work-cost'],
  examples: [
    // 12 x 12.99 = 155.88; saving 56.88; 56.88/155.88 = 0.364895...; 99/12 = 8.25; 99/12.99 = 7.6212
    { values: { monthly: 12.99, annual: 99 }, expect: { saving: 56.88, pct: 0.36490, effective: 8.25, breakeven: 7.6212 }, tolerance: 1e-3 },
    // 12 x 10 = 120 = annual: no saving, break-even 12
    { values: { monthly: 10, annual: 120 }, expect: { saving: 0, pct: 0, effective: 10, breakeven: 12 }, tolerance: 1e-9 },
    // 12 x 10 = 120; saving 20; 20/120 = 1/6; 100/12 = 8.3333; 100/10 = 10
    { values: { monthly: 10, annual: 100 }, expect: { saving: 20, pct: 1 / 6, effective: 100 / 12, breakeven: 10 }, tolerance: 1e-9 },
  ],
});
