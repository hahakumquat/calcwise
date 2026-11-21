import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'trip-budget',
  title: 'Trip Budget Calculator',
  category: 'everyday',
  description: 'Work out your daily spending budget for a trip: subtract flights and lodging already paid, hold back a buffer, and divide what is left by the number of days.',
  keywords: ['trip budget calculator', 'daily travel budget', 'vacation budget per day', 'how much can i spend per day on holiday', 'travel spending money calculator', 'trip budget buffer'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'total', label: 'Total trip budget', type: 'number', prefix: '$', default: 2000, min: 0, step: 50, info: 'Everything you are willing to spend on the whole trip.' },
    { id: 'paid', label: 'Already paid or booked', type: 'number', prefix: '$', default: 1200, min: 0, step: 50, optional: true, info: 'Costs you have already committed to, such as flights and lodging.' },
    { id: 'days', label: 'Days of spending', type: 'number', default: 7, min: 1, max: 365, step: 1, info: 'How many days you will be spending money on the trip.' },
    { id: 'buffer', label: 'Safety buffer (your choice)', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, optional: true, info: 'A share of the remaining money held back for surprises. 10% is a common choice, not a rule. Set 0 for no buffer.' },
  ],
  outputs: [
    { id: 'perDay', label: 'Daily spending budget', format: 'currency', primary: true, info: 'Remaining × (1 − buffer) ÷ days.' },
    { id: 'remaining', label: 'Left after paid costs', format: 'currency', info: 'Total budget minus costs already paid. Negative means you are over budget.' },
    { id: 'usable', label: 'Spendable after buffer', format: 'currency', info: 'Remaining × (1 − buffer).' },
    { id: 'held', label: 'Held back as buffer', format: 'currency', info: 'Remaining × buffer.' },
    { id: 'perDayNoBuffer', label: 'Per day with no buffer', format: 'currency', info: 'Remaining ÷ days.' },
  ],
  compute: (v) => {
    const total = num(v.total);
    const paid = num(v.paid) ?? 0;
    const days = num(v.days);
    const bufferPct = num(v.buffer) ?? 0;
    if (total === null || days === null) return { perDay: null };
    if (total < 0 || paid < 0 || days < 1 || bufferPct < 0 || bufferPct > 100) return { perDay: null };
    const d = Math.round(days);
    const remaining = total - paid;
    if (remaining < 0) {
      return {
        perDay: 0,
        remaining,
        usable: 0,
        held: 0,
        perDayNoBuffer: 0,
        tone: 'bad',
        badge: `Over budget by ${money(-remaining, 0)}`,
        note: `Your paid costs of ${money(paid)} already exceed your ${money(total)} budget by ${money(-remaining)}, so there is nothing left for daily spending. Raise the budget or trim costs.`,
        steps: [`Remaining = ${money(total)} − ${money(paid)} = ${money(remaining)}`],
      };
    }
    const held = remaining * (bufferPct / 100);
    const usable = remaining - held;
    const perDay = usable / d;
    const perDayNoBuffer = remaining / d;
    return {
      perDay,
      remaining,
      usable,
      held,
      perDayNoBuffer,
      tone: perDay > 0 ? 'good' : 'ok',
      badge: `${money(perDay, 0)} a day for ${d} ${d === 1 ? 'day' : 'days'}`,
      note: `After ${money(paid)} of paid costs you have ${money(remaining)} left. Holding back ${bufferPct}% (${money(held)}) leaves ${money(usable)}, or ${money(perDay)} a day. Without a buffer it would be ${money(perDayNoBuffer)} a day.`,
      chart: {
        type: 'bar',
        title: 'Budget split',
        categories: ['Already paid', 'Buffer', 'Daily spending'],
        series: [{ name: 'Amount', values: [+paid.toFixed(2), +held.toFixed(2), +usable.toFixed(2)] }],
        format: { format: 'currency' },
        highlight: 2,
      },
      steps: [
        `Remaining = ${money(total)} − ${money(paid)} = ${money(remaining)}`,
        `Spendable = ${money(remaining)} × (1 − ${bufferPct}%) = ${money(usable)}`,
        `Per day = ${money(usable)} ÷ ${d} = ${money(perDay)}`,
      ],
    };
  },
  content: {
    formula: [
      'Remaining = total budget − costs already paid',
      'Spendable = remaining × (1 − buffer %)',
      'Per day = spendable ÷ days',
    ],
    body: [
      'Start with the total you are comfortable spending, then take off what is already locked in, usually flights and lodging. What is left has to cover food, getting around, activities and souvenirs.',
      'The buffer is your own choice. The 10% default is a common starting point, not a rule: set it higher for a trip with lots of unknowns, or to 0 if every cost is already fixed. The calculator holds that share back so a single surprise does not wreck the daily number.',
      'If your paid costs are already more than the budget, the calculator shows how far over you are rather than a daily figure. It does not look up prices or convert currencies, and everything runs in your browser.',
    ],
    faq: [
      { q: 'How do I work out a daily trip budget?', a: 'Subtract what you have already paid from your total budget, hold back a buffer, and divide by the number of days. For $2,000 with $1,200 paid, that leaves $800; a 10% buffer leaves $720, which over 7 days is $102.86 a day.' },
      { q: 'What does the buffer do?', a: 'It sets aside a share of the remaining money for surprises. With $800 left, a 10% buffer holds back $80. Without it the budget would be $114.29 a day.' },
      { q: 'How big should the buffer be?', a: 'That is your call. 10% is the default here, but you might choose more for a long or unpredictable trip, or 0% if everything is booked.' },
      { q: 'What if I am already over budget?', a: 'The calculator shows how much you are over and sets the daily budget to $0. You would need to raise the total or reduce the costs already committed.' },
      { q: 'What should count as already paid?', a: 'Anything fixed before you leave: flights, hotels, tours, visas, travel insurance. Daily costs like meals and local transport belong in the daily budget.' },
    ],
    sources: [{ label: 'USA.gov: Travel tips and planning', url: 'https://www.usa.gov/travel' }],
  },
  related: ['sinking-fund', 'foreign-transaction-fee', 'drive-vs-fly-cost', 'holiday-spending-total'],
  examples: [
    // 2000 - 1200 = 800; × 0.9 = 720; 720 / 7 = 102.857143; no buffer 800 / 7 = 114.285714; held 80.
    { values: { total: 2000, paid: 1200, days: 7, buffer: 10 }, expect: { perDay: 102.8571, remaining: 800, usable: 720, held: 80, perDayNoBuffer: 114.2857 }, tolerance: 1e-3 },
    // No buffer: 800 / 7 = 114.2857.
    { values: { total: 2000, paid: 1200, days: 7, buffer: 0 }, expect: { perDay: 114.2857, usable: 800, held: 0 }, tolerance: 1e-3 },
    // Over budget: 500 - 700 = -200; daily 0.
    { values: { total: 500, paid: 700, days: 5, buffer: 10 }, expect: { remaining: -200, perDay: 0 }, tolerance: 1e-6 },
  ],
});
