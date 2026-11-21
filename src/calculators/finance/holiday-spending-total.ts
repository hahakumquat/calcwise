import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'holiday-spending-total',
  title: 'Holiday Spending Total Calculator',
  category: 'finance',
  description: 'Add up gifts, travel, food, decor and events, compare with last year, and see how long the part you put on a card takes to pay off, with interest.',
  keywords: ['holiday spending calculator', 'how much will christmas cost', 'total holiday cost', 'holiday credit card payoff', 'christmas spending total', 'january holiday bill'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'gifts', label: 'Gifts', type: 'number', prefix: '$', default: 600, min: 0, step: 25, optional: true, info: 'Presents for everyone on your list, including stocking stuffers.' },
    { id: 'travel', label: 'Travel', type: 'number', prefix: '$', default: 400, min: 0, step: 25, optional: true, info: 'Flights, fuel, hotels and rental cars for the season.' },
    { id: 'food', label: 'Food and drink', type: 'number', prefix: '$', default: 250, min: 0, step: 25, optional: true, info: 'Holiday meals, groceries for hosting and drinks.' },
    { id: 'decor', label: 'Decor', type: 'number', prefix: '$', default: 80, min: 0, step: 10, optional: true, info: 'Tree, lights, wrapping and decorations.' },
    { id: 'events', label: 'Events and parties', type: 'number', prefix: '$', default: 120, min: 0, step: 10, optional: true, info: 'Parties, tickets, white-elephant contributions and similar.' },
    { id: 'other', label: 'Anything else', type: 'number', prefix: '$', default: 0, min: 0, step: 10, optional: true, info: 'Anything that does not fit the lines above.' },
    { id: 'last', label: 'Last year total', type: 'number', prefix: '$', default: 1300, min: 0, step: 50, optional: true, help: 'Leave at 0 to skip the comparison.', info: 'What the holidays cost you last year, for the comparison.' },
    { id: 'card', label: 'Put on a credit card', type: 'number', prefix: '$', default: 1000, min: 0, step: 50, optional: true, info: 'The part you will not pay in cash. It becomes the starting card balance.' },
    { id: 'apr', label: 'Card APR', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 0.5, optional: true, info: 'Annual rate. Monthly rate = APR ÷ 12.' },
    { id: 'payment', label: 'Monthly payment', type: 'number', prefix: '$', default: 250, min: 0, step: 25, optional: true, info: 'What you will pay the card each month.' },
  ],
  outputs: [
    { id: 'total', label: 'Holiday total', format: 'currency', primary: true, info: 'Gifts + travel + food + decor + events + anything else.' },
    { id: 'change', label: 'Change vs last year', format: 'percent', info: 'This year ÷ last year − 1.' },
    { id: 'months', label: 'Payments to clear the card', format: 'number', info: 'Number of monthly payments, with a smaller final one.' },
    { id: 'interest', label: 'Card interest', format: 'currency', info: 'Total paid minus the amount charged.' },
  ],
  compute: (v) => {
    const parts = {
      Gifts: num(v.gifts) ?? 0,
      Travel: num(v.travel) ?? 0,
      'Food and drink': num(v.food) ?? 0,
      Decor: num(v.decor) ?? 0,
      Events: num(v.events) ?? 0,
      Other: num(v.other) ?? 0,
    };
    const last = num(v.last) ?? 0;
    const card = num(v.card) ?? 0;
    const apr = num(v.apr) ?? 0;
    const pay = num(v.payment) ?? 0;
    if (Object.values(parts).some((x) => x < 0) || last < 0 || card < 0 || apr < 0 || pay < 0) return { total: null };

    const total = Object.values(parts).reduce((a, b) => a + b, 0);
    if (total <= 0) return { total: null, error: 'Enter at least one holiday cost to add up.' };
    const change = last > 0 ? total / last - 1 : null;

    let months: number | null = null;
    let interest: number | null = null;
    let payNote = '';
    if (card > 0) {
      const r = apr / 100 / 12;
      if (pay <= 0 || (r > 0 && pay <= r * card)) {
        payNote = ` At ${money(pay, 0)} a month the card never clears, because the payment is no more than the first month's interest. Raise the payment.`;
      } else {
        let bal = card;
        let paid = 0;
        let n = 0;
        while (bal > 0.005 && n < 1200) {
          bal *= 1 + r;
          const p = Math.min(pay, bal);
          bal -= p;
          paid += p;
          n++;
        }
        months = n;
        interest = paid - card;
        payNote = ` The ${money(card, 0)} on your card takes ${n} payment${n === 1 ? '' : 's'} of ${money(pay, 0)} and costs ${money(interest)} in interest.`;
      }
    }

    const tone = change === null ? 'ok' : change > 0.1 ? 'warn' : 'good';
    const badge = change === null ? `${money(total, 0)} total` : `${change >= 0 ? '+' : '−'}${Math.abs(change * 100).toFixed(1)}% vs last year`;
    const slices = Object.entries(parts)
      .filter(([, x]) => x > 0)
      .map(([label, value]) => ({ label, value }));

    return {
      total,
      change,
      months,
      interest,
      tone,
      badge,
      chart: [moneyDonut('Where the holiday money goes', slices, money(total, 0), 'total')],
      steps: [
        `Total = ${slices.map((s) => money(s.value, 0)).join(' + ')} = ${money(total, 0)}`,
        ...(change !== null ? [`Change = ${money(total, 0)} ÷ ${money(last, 0)} − 1 = ${(change * 100).toFixed(1)}%`] : []),
        ...(months !== null ? [`Each month: balance × (1 + APR ÷ 12), then subtract the payment, until it reaches zero (${months} payments)`] : []),
      ],
      note: `The holidays add up to ${money(total, 0)}.${change !== null ? ` That is ${change >= 0 ? 'up' : 'down'} ${Math.abs(change * 100).toFixed(1)}% on last year.` : ''}${payNote}`,
    };
  },
  content: {
    formula: [
      'Total = gifts + travel + food + decor + events + other',
      'Change vs last year = total ÷ last year − 1',
      'Monthly rate r = APR ÷ 12',
      'Each month: balance = balance × (1 + r) − payment (the last payment is whatever is left)',
      'Interest = total paid − amount put on the card',
    ],
    body: [
      'Holiday spending hides in small lines: a flight here, a party contribution there. Adding them in one place shows the real number before the card statement does.',
      'If part of it goes on a credit card, the January bill is the number that matters. The calculator charges interest every month on the balance, takes off your payment, and repeats until the card is clear.',
      'If your payment is no bigger than one month of interest, the balance never falls. The calculator says so instead of showing a made-up date.',
    ],
    faq: [
      { q: 'How is the holiday total worked out?', a: 'It is the sum of the six cost lines. With $600 gifts, $400 travel, $250 food, $80 decor and $120 events, the total is $1,450.' },
      { q: 'How is the change from last year calculated?', a: 'This year divided by last year, minus 1. $1,450 against $1,300 is +11.5%.' },
      { q: 'How long does a $1,000 card balance take to clear?', a: 'At 24% APR (2% a month) and $250 a month, it takes 5 payments: four of $250 and a last one of $53.07. Interest comes to $53.07.' },
      { q: 'What if my payment is too small?', a: 'If the payment is no more than the first month of interest (balance × APR ÷ 12), the balance never falls and the calculator tells you to raise it.' },
      { q: 'Does this include fees or a promo rate?', a: 'No. It uses one fixed APR and no fees. Check your card terms for anything else.' },
    ],
    sources: [
      { label: 'CFPB: Credit cards', url: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/' },
    ],
  },
  related: ['gift-budget', 'credit-card-payoff', 'sinking-fund', 'no-spend-challenge', 'savings-goal'],
  examples: [
    {
      // Total 600+400+250+80+120 = 1,450; 1,450/1,300 − 1 = 0.115385; r = 0.02: 1000 → 770 → 535.4 → 296.108 → 52.03 → paid off at 5th payment of 53.07; interest 1,053.07 − 1,000 = 53.07 (simulated).
      values: { gifts: 600, travel: 400, food: 250, decor: 80, events: 120, other: 0, last: 1300, card: 1000, apr: 24, payment: 250 },
      expect: { total: 1450, change: 0.115385, months: 5, interest: 53.07 },
      tolerance: 1e-2,
    },
    {
      // Total 500; no last year → no change; card 0 → no payoff.
      values: { gifts: 500, travel: 0, food: 0, decor: 0, events: 0, other: 0, last: 0, card: 0, apr: 20, payment: 0 },
      expect: { total: 500 },
    },
    {
      // Total 1,000; 0% APR card 600 at 200 a month → 3 payments, interest 0.
      values: { gifts: 1000, travel: 0, food: 0, decor: 0, events: 0, other: 0, last: 800, card: 600, apr: 0, payment: 200 },
      expect: { total: 1000, change: 0.25, months: 3, interest: 0 },
    },
  ],
});
