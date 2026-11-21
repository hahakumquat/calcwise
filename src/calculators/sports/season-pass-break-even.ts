import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'season-pass-break-even',
  title: 'Season Pass Break-Even Calculator',
  category: 'sports',
  description: 'Find how many days you need to ski or snowboard before a season pass beats buying day tickets, and what you save at the days you expect to go.',
  keywords: ['season pass break even calculator', 'ski pass vs day tickets', 'is a season pass worth it', 'snowboard season pass cost per day', 'ski pass break even days', 'season pass worth it calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'pass', label: 'Season pass price', type: 'number', prefix: '$', default: 699, min: 1, step: 10, info: 'The total price of the pass, including any fees and tax you will pay.' },
    { id: 'day', label: 'Day ticket price', type: 'number', prefix: '$', default: 130, min: 1, step: 5, info: 'What you would pay for a single-day lift ticket, the price you actually get, not the window price you never pay.' },
    { id: 'days', label: 'Days you expect to go', type: 'number', default: 8, min: 1, max: 200, step: 1, info: 'Be honest: count the days you will really ride this season.' },
    { id: 'extra', label: 'Extra cost per day with the pass', type: 'number', prefix: '$', default: 0, min: 0, step: 5, optional: true, info: 'Optional. Anything pass holders pay that day-ticket buyers do not, such as parking. Leave at 0 if none.' },
  ],
  outputs: [
    { id: 'breakEven', label: 'Break-even days', format: 'integer', primary: true, info: 'Pass price ÷ (day ticket price − extra per day), rounded up to a whole day.' },
    { id: 'savings', label: 'Saved at your days', format: 'currency', info: 'Days × day ticket − pass price − days × extra. Negative means day tickets are cheaper.' },
    { id: 'perDay', label: 'Pass cost per day', format: 'currency', info: 'The pass price ÷ your days, plus any extra per day.' },
  ],
  compute: (v) => {
    const pass = num(v.pass);
    const day = num(v.day);
    const days = num(v.days);
    const extra = num(v.extra) ?? 0;
    if (pass === null || day === null || days === null || pass <= 0 || day <= 0 || days < 1 || extra < 0) return { breakEven: null };
    const d = Math.round(days);
    const net = day - extra;
    if (net <= 0) return { breakEven: null, error: 'The extra cost per day is as much as a day ticket, so the pass can never pay off. Lower the extra cost.' };
    const exact = pass / net;
    const breakEven = Math.max(1, Math.ceil(exact - 1e-9));
    const savings = d * net - pass;
    const perDay = pass / d + extra;
    const worth = d >= breakEven;
    const xs: number[] = [];
    const dayLine: number[] = [];
    const passLine: number[] = [];
    const top = Math.max(d, breakEven) + 2;
    for (let k = 0; k <= top; k++) {
      xs.push(k);
      dayLine.push(day * k);
      passLine.push(pass + extra * k);
    }
    return {
      breakEven,
      savings,
      perDay,
      tone: worth ? 'good' : 'warn',
      badge: worth ? `Pass saves ${money(savings, 0)}` : `Day tickets save ${money(-savings, 0)}`,
      note: worth
        ? `The pass pays off from day ${breakEven} (${money(pass)} ÷ ${money(net)} = ${exact.toFixed(2)}). At ${d} days you save ${money(savings)}, or ${money(perDay)} a day.`
        : `You need ${breakEven} days for the pass to pay off, and you expect ${d}. At ${d} days day tickets are ${money(-savings)} cheaper. Prices are the ones you entered; the calculator does not look up any resort's rates.`,
      chart: {
        type: 'line',
        title: 'Total cost by days skied',
        x: xs,
        xLabel: 'Days',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Day tickets', values: dayLine },
          { name: 'Season pass', values: passLine },
        ],
        markers: [{ x: breakEven, label: `Break-even: day ${breakEven}` }],
      },
      steps: [
        `Break-even = ${money(pass)} ÷ (${money(day)} − ${money(extra)}) = ${exact.toFixed(3)}, rounded up to ${breakEven} days`,
        `Saved at ${d} days = ${d} × ${money(net)} − ${money(pass)} = ${money(savings)}`,
        `Pass cost per day = ${money(pass)} ÷ ${d}${extra ? ` + ${money(extra)}` : ''} = ${money(perDay)}`,
      ],
    };
  },
  content: {
    formula: [
      'Break-even days = ⌈pass price ÷ (day ticket price − extra cost per day)⌉',
      'Saved = days × (day ticket − extra per day) − pass price',
      'Pass cost per day = pass price ÷ days + extra per day',
    ],
    body: [
      'A season pass is a bet that you will ride enough days to beat buying a ticket each time. The break-even point is the pass price divided by what a day ticket costs. Go more days than that and the pass wins; fewer and you would have been better off with day tickets.',
      'Enter the real prices: the day ticket you would actually pay, not the highest window rate, and the pass price with any fees. If the pass costs you something extra on the day, such as parking that day-ticket buyers get free, put it in the extra cost box and the calculator takes it off every day.',
      'The most important input is the number of days you honestly expect to go. People tend to overestimate it, so try a lower number too. The calculator uses only your prices and does not look up any resort. It also does not count perks like friend discounts. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How many days to break even on a $699 pass?', a: 'With $130 day tickets, 699 ÷ 130 = 5.38, so you break even on day 6.' },
      { q: 'How much would I save over 8 days?', a: '8 × $130 = $1,040, minus the $699 pass, saves $341. That is $87.38 a day with the pass.' },
      { q: 'What is the extra cost per day?', a: 'Anything pass holders pay that day-ticket buyers do not, such as parking. It is taken off the savings for every day you go.' },
      { q: 'What if I only go a few times?', a: 'Below the break-even number of days, day tickets cost less. At 4 days, 4 × $130 = $520 is $179 less than the $699 pass.' },
      { q: 'Does it use real resort prices?', a: 'No. Prices change by date and resort, so you enter your own.' },
    ],
    sources: [],
  },
  related: ['break-even', 'cost-per-use', 'gas-cost', 'holiday-spending-total', 'road-trip-time'],
  examples: [
    // 699 / 130 = 5.377 → 6 days; 8 × 130 − 699 = 341; 699 / 8 = 87.375.
    { values: { pass: 699, day: 130, days: 8, extra: 0 }, expect: { breakEven: 6, savings: 341, perDay: 87.375 }, tolerance: 1e-6 },
    // Net 100 − 20 = 80; 500 / 80 = 6.25 → 7; 10 × 80 − 500 = 300; 500/10 + 20 = 70.
    { values: { pass: 500, day: 100, days: 10, extra: 20 }, expect: { breakEven: 7, savings: 300, perDay: 70 }, tolerance: 1e-6 },
    // 4 days: 4 × 130 − 699 = −179.
    { values: { pass: 699, day: 130, days: 4, extra: 0 }, expect: { breakEven: 6, savings: -179, perDay: 174.75 }, tolerance: 1e-6 },
  ],
});
