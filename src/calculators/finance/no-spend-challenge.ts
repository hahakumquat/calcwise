import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'no-spend-challenge',
  title: 'No-Spend Challenge Calculator',
  category: 'finance',
  description: 'Work out how much a no-spend challenge saves: no-spend days times your usual daily spending, plus what a full year at that pace would add up to.',
  keywords: ['no spend challenge calculator', 'no spend month savings', 'no spend days', 'how much will i save no spend', 'spending freeze calculator', 'no buy challenge'],
  updated: '2026-11-20',
  inputs: [
    { id: 'totalDays', label: 'Challenge length', type: 'number', suffix: 'days', default: 30, min: 1, max: 365, step: 1, info: 'How many days the challenge runs. 30 is a month.' },
    { id: 'noSpendDays', label: 'No-spend days', type: 'number', suffix: 'days', default: 21, min: 0, max: 365, step: 1, info: 'Days you spend nothing on non-essentials. Cannot be more than the challenge length.' },
    { id: 'dailySpend', label: 'Usual spending on a normal day', type: 'number', prefix: '$', default: 20, min: 0, step: 1, info: 'Your typical daily non-essential spending: coffee, takeout, shopping, apps. Leave out rent, bills and groceries you need.' },
  ],
  outputs: [
    { id: 'saved', label: 'Saved in the challenge', format: 'currency', primary: true, info: 'No-spend days × usual daily spending.' },
    { id: 'share', label: 'Share of days with no spend', format: 'percent', info: 'No-spend days ÷ challenge length.' },
    { id: 'spendDays', label: 'Days you still spent', format: 'number', info: 'Challenge length minus no-spend days.' },
    { id: 'yearly', label: 'At this pace for a year', format: 'currency', info: 'Saved ÷ challenge length × 365.' },
  ],
  compute: (v) => {
    const total = num(v.totalDays);
    const days = num(v.noSpendDays);
    const daily = num(v.dailySpend);
    if (total === null || days === null || daily === null || total < 1 || days < 0 || daily < 0 || days > total) return { saved: null };
    const n = Math.round(total);
    const k = Math.round(days);
    const saved = k * daily;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let d = 0; d <= n; d++) {
      xs.push(d);
      ys.push(((k * d) / n) * daily);
    }
    const yearly = (saved / n) * 365;
    return {
      saved,
      share: (k / n) * 100,
      spendDays: n - k,
      yearly,
      note: `${k} no-spend days at $${fmt(daily, 2)} a day is $${fmt(saved, 2)} kept. Kept up for a year, that pace is about $${fmt(yearly)}. This assumes a no-spend day really replaces your usual spend rather than shifting it to the next day.`,
      chart: {
        type: 'area',
        title: 'Money kept as the challenge goes on (even pace)',
        x: xs,
        xLabel: 'Day of challenge',
        yFormat: { format: 'currency' },
        series: [{ name: 'Saved so far', values: ys }],
      },
      steps: [`Saved = ${k} days × $${fmt(daily, 2)} = $${fmt(saved, 2)}`, `Per year = $${fmt(saved, 2)} ÷ ${n} × 365 = $${fmt(yearly, 2)}`],
    };
  },
  content: {
    formula: ['Saved = no-spend days × usual daily spending', 'Per year = saved ÷ challenge length × 365'],
    body: [
      'A no-spend challenge is a stretch of days where you buy only what you must: rent, bills, groceries and other essentials. Everything else, such as takeout, impulse buys and subscriptions you forgot about, waits. This calculator turns the number of no-spend days into dollars kept.',
      'The maths is simple on purpose: the days you stay at zero, multiplied by what a normal day usually costs you. The yearly figure scales that rate to 365 days so you can see what the habit is worth if you kept it up. The chart assumes the savings build evenly across the challenge.',
      'Be honest about the daily figure. If skipping spending today just means a bigger order tomorrow, the real saving is smaller. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does a 30-day no-spend challenge save?', a: 'With 21 no-spend days at $20 a day, it keeps 21 × $20 = $420. A perfect 30 days at $20 keeps $600.' },
      { q: 'What counts as a no-spend day?', a: 'There is no official rule. Most people allow essentials such as rent, bills, groceries and transport, and skip everything optional. Pick your rules before you start.' },
      { q: 'Is the yearly figure realistic?', a: 'It is only what the same pace would add up to. Few people keep a strict challenge going all year, so treat it as a size check, not a forecast.' },
    ],
    sources: [{ label: 'Consumer Financial Protection Bureau: Budgeting and saving', url: 'https://www.consumerfinance.gov/consumer-tools/budgeting-saving/' }],
  },
  related: ['dry-january', 'daily-spending-allowance', 'latte-factor', 'savings-goal', 'budget-50-30-20'],
  examples: [
    // 21 × 20 = 420; 21/30 = 70%; 9 spend days; 420 ÷ 30 × 365 = 5,110.
    { values: { totalDays: 30, noSpendDays: 21, dailySpend: 20 }, expect: { saved: 420, share: 70, spendDays: 9, yearly: 5110 }, tolerance: 1e-6 },
    // 7 × 15 = 105; 100%; 0; 105 ÷ 7 × 365 = 5,475.
    { values: { totalDays: 7, noSpendDays: 7, dailySpend: 15 }, expect: { saved: 105, share: 100, spendDays: 0, yearly: 5475 }, tolerance: 1e-6 },
  ],
});
