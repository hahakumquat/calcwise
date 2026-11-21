import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct, CURRENCY } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'rent-increase-impact',
  title: 'Rent Increase Impact Calculator',
  category: 'finance',
  description: 'Enter your current and new rent to see the monthly and yearly cost, the percent rise, and the pay raise you need to absorb it.',
  keywords: ['rent increase calculator', 'rent increase percentage', 'lease renewal rent increase', 'how much did my rent go up', 'rent hike cost per year', 'raise needed for rent increase'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'current', label: 'Current monthly rent', type: 'number', prefix: '$', default: 1500, min: 0, step: 25, info: 'What you pay each month now, before the increase.' },
    { id: 'next', label: 'New monthly rent', type: 'number', prefix: '$', default: 1620, min: 0, step: 25, info: 'The rent in your renewal notice.' },
    { id: 'months', label: 'Months in the new lease', type: 'number', default: 12, min: 1, max: 60, step: 1, info: 'How many months the new rent will apply. Most leases run 12.' },
    { id: 'pay', label: 'Monthly take-home pay', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, optional: true, help: 'Optional. Used for rent share and the raise needed.', info: 'Pay after tax and deductions, per month. Leave blank to skip the pay comparison.' },
  ],
  outputs: [
    { id: 'rise', label: 'Extra per month', format: 'currency', primary: true, info: 'New rent minus current rent.' },
    { id: 'percent', label: 'Rent increase', format: 'percent', info: 'The rise divided by current rent.' },
    { id: 'lease', label: 'Extra over the lease', format: 'currency', info: 'Monthly rise times the months in the new lease.' },
    { id: 'share', label: 'New rent as share of take-home', format: 'percent', info: 'New rent divided by monthly take-home pay.' },
    { id: 'raiseNeeded', label: 'Take-home raise to absorb it', format: 'percent', info: 'Monthly rise divided by take-home pay: the raise that keeps your leftover money the same.' },
  ],
  compute: (v) => {
    const cur = num(v.current);
    const nxt = num(v.next);
    const months = num(v.months);
    const pay = num(v.pay);
    if (cur === null || nxt === null || months === null) return { rise: null };
    if (cur <= 0 || nxt < 0 || months < 1) return { rise: null };

    const rise = nxt - cur;
    const percent = rise / cur;
    const lease = rise * months;
    const hasPay = pay !== null && pay > 0;
    const share = hasPay ? nxt / pay : null;
    const oldShare = hasPay ? cur / pay : null;
    const raiseNeeded = hasPay ? rise / pay : null;

    const tone = rise <= 0 ? 'good' : percent > 0.1 ? 'bad' : percent > 0.05 ? 'warn' : 'ok';
    const sign = rise >= 0 ? '+' : '−';
    const badge = rise === 0 ? 'No change' : `${sign}${Math.abs(percent * 100).toFixed(1)}% rent`;

    const payNote = hasPay && rise > 0
      ? ` Rent goes from ${pct(oldShare!, 1)} to ${pct(share!, 1)} of take-home pay, and a ${pct(raiseNeeded!, 1)} raise in take-home pay would cover it.`
      : hasPay
        ? ` Rent is now ${pct(share!, 1)} of take-home pay.`
        : '';

    return {
      rise,
      percent,
      lease,
      share,
      raiseNeeded,
      tone,
      badge,
      chart: [{ type: 'bar', title: 'Rent per month, before and after', categories: ['Current', 'New'], series: [{ name: 'Rent', values: [cur, nxt] }], format: CURRENCY, highlight: 1 }],
      steps: [
        `Monthly rise = ${money(nxt)} − ${money(cur)} = ${money(rise)}`,
        `Percent = ${money(rise)} ÷ ${money(cur)} = ${(percent * 100).toFixed(2)}%`,
        `Over the lease = ${money(rise)} × ${months} months = ${money(lease)}`,
        ...(hasPay ? [`Raise needed = ${money(rise)} ÷ ${money(pay!)} = ${(raiseNeeded! * 100).toFixed(2)}% of take-home pay`] : []),
      ],
      note: `${rise >= 0 ? 'Your rent goes up' : 'Your rent goes down'} ${money(Math.abs(rise))} a month (${(Math.abs(percent) * 100).toFixed(1)}%), which is ${money(Math.abs(lease))} ${rise >= 0 ? 'more' : 'less'} over ${months} months.${payNote}`,
    };
  },
  content: {
    formula: [
      'Monthly rise = new rent − current rent',
      'Percent increase = rise ÷ current rent',
      'Extra over the lease = rise × months',
      'Rent share = rent ÷ monthly take-home pay',
      'Raise needed = rise ÷ monthly take-home pay',
    ],
    body: [
      'A renewal notice usually gives one number: the new rent. This page turns it into the figures that matter: how much more you pay each month, what that is as a percent, and what it adds up to over the lease.',
      'If you enter your monthly take-home pay, it also shows how much of your pay rent takes before and after, and the raise in take-home pay you would need to be exactly as well off as before.',
      'The raise shown is a take-home figure, not a gross salary figure. Taxes take part of any raise, so the pre-tax raise you ask for needs to be a little larger.',
      'This is plain arithmetic. It does not check local rent rules or caps, which vary by place and building.',
    ],
    faq: [
      { q: 'How do I work out a rent increase percentage?', a: 'Subtract the current rent from the new rent, then divide by the current rent. Going from $1,500 to $1,620 is a $120 rise, and $120 ÷ $1,500 is 8.0%.' },
      { q: 'How much extra will I pay over a year?', a: 'Multiply the monthly rise by the months in the lease. $120 more for 12 months is $1,440.' },
      { q: 'What raise do I need to cover the increase?', a: 'Divide the monthly rise by your monthly take-home pay. $120 on $5,000 take-home is 2.4%. That is after tax, so a gross raise needs to be a little higher.' },
      { q: 'What share of my pay should rent be?', a: 'A common rule of thumb is no more than about 30% of income. In the example, rent goes from 30.0% to 32.4% of $5,000 take-home pay. That rule is usually applied to gross income, so measuring on take-home pay is stricter.' },
      { q: 'Is there a legal limit on rent increases?', a: 'It depends on where you live. Some cities and states cap increases or require notice. Check your local rules or tenant resources.' },
    ],
    sources: [
      { label: 'HUD: Renting and tenant rights', url: 'https://www.hud.gov/topics/rental_assistance/tenantrights' },
    ],
  },
  related: ['rent-affordability', 'rent-vs-buy', 'raise-calculator', 'budget-50-30-20', 'cost-of-living-salary'],
  examples: [
    {
      // rise 1620 − 1500 = 120; 120/1500 = 0.08; 120 × 12 = 1,440; share 1620/5000 = 0.324; raise 120/5000 = 0.024.
      values: { current: 1500, next: 1620, months: 12, pay: 5000 },
      expect: { rise: 120, percent: 0.08, lease: 1440, share: 0.324, raiseNeeded: 0.024 },
    },
    {
      // rise 2000 − 1600 = 400; 400/1600 = 0.25; 400 × 6 = 2,400; share 2000/4000 = 0.5; raise 400/4000 = 0.1.
      values: { current: 1600, next: 2000, months: 6, pay: 4000 },
      expect: { rise: 400, percent: 0.25, lease: 2400, share: 0.5, raiseNeeded: 0.1 },
    },
    {
      // rise 950 − 1000 = −50; −50/1000 = −0.05; −50 × 12 = −600; no pay entered → share and raise null.
      values: { current: 1000, next: 950, months: 12, pay: null },
      expect: { rise: -50, percent: -0.05, lease: -600 },
    },
  ],
});
