import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'advent-calendar-cost',
  title: 'Advent Calendar Cost Calculator',
  category: 'finance',
  description: 'Work out what an advent calendar costs per day and per item, and whether you pay a premium over buying the same treats or products loose.',
  keywords: ['advent calendar cost calculator', 'advent calendar cost per day', 'is an advent calendar worth it', 'advent calendar value', 'advent calendar price per item'],
  updated: '2026-11-26',
  inputs: [
    { id: 'price', label: 'Calendar price', type: 'number', prefix: '$', default: 30, min: 0, step: 0.5, info: 'What you pay for the whole calendar, including any delivery.' },
    { id: 'days', label: 'Number of days', type: 'number', default: 24, min: 1, step: 1, info: 'Most calendars have 24 doors. Some run to 25 or more.' },
    { id: 'items', label: 'Items per day', type: 'number', default: 1, min: 1, step: 1, info: 'How many separate items are behind each door.' },
    { id: 'retail', label: 'Loose retail value per item (optional)', type: 'number', prefix: '$', default: 0, min: 0, step: 0.05, info: 'What one item would cost if you bought it on its own. Leave at 0 to skip the value comparison.' },
  ],
  outputs: [
    { id: 'perDay', label: 'Cost per day', format: 'currency', primary: true, info: 'Calendar price ÷ number of days.' },
    { id: 'perItem', label: 'Cost per item', format: 'currency', info: 'Calendar price ÷ (days × items per day).' },
    { id: 'value', label: 'Loose retail value', format: 'currency', info: 'Days × items per day × loose retail value per item.' },
    { id: 'premium', label: 'Premium over loose price', format: 'currency', info: 'Calendar price minus the loose retail value. Negative means the calendar is cheaper.' },
    { id: 'premiumPct', label: 'Premium as a share of value', format: 'percent', precision: 1, info: 'Premium ÷ loose retail value.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const days = num(v.days);
    const items = num(v.items);
    const retail = num(v.retail) ?? 0;
    if (price === null || days === null || items === null || price < 0 || days < 1 || items < 1 || retail < 0) return { perDay: null };
    const total = days * items;
    const perDay = price / days;
    const perItem = price / total;
    const compare = retail > 0;
    const value = compare ? total * retail : null;
    const premium = value !== null ? price - value : null;
    const premiumPct = value !== null && premium !== null ? premium / value : null;
    const cheaper = premium !== null && premium <= 0;
    return {
      perDay,
      perItem,
      value,
      premium,
      premiumPct,
      tone: cheaper ? ('good' as const) : ('ok' as const),
      badge: compare ? (premium === 0 ? 'Same as loose' : cheaper ? 'Cheaper than loose' : 'Premium to pay') : 'Per-day cost',
      note:
        value !== null && premium !== null && premiumPct !== null
          ? cheaper
            ? `The calendar costs $${fmt(perDay, 2)} a day. The contents would cost $${fmt(value, 2)} loose, so you pay $${fmt(-premium, 2)} less (${fmt(-premiumPct * 100, 1)}% under).`
            : `The calendar costs $${fmt(perDay, 2)} a day. The contents would cost $${fmt(value, 2)} loose, so you pay $${fmt(premium, 2)} more (${fmt(premiumPct * 100, 1)}% over) for the surprise and the packaging.`
          : `The calendar costs $${fmt(perDay, 2)} a day and $${fmt(perItem, 2)} per item. Add a loose retail value to see if you pay a premium.`,
      chart:
        value !== null
          ? {
              type: 'bar',
              title: 'Calendar price vs buying the items loose ($)',
              categories: ['Calendar price', 'Loose retail value'],
              series: [{ name: 'Cost', values: [price, value] }],
              format: { format: 'currency' },
            }
          : {
              type: 'bar',
              title: 'What each day and each item costs ($)',
              categories: ['Per day', 'Per item'],
              series: [{ name: 'Cost', values: [perDay, perItem] }],
              format: { format: 'currency' },
            },
      steps: [
        `Cost per day = $${fmt(price, 2)} ÷ ${fmt(days)} = $${fmt(perDay, 2)}`,
        `Cost per item = $${fmt(price, 2)} ÷ (${fmt(days)} × ${fmt(items)}) = $${fmt(perItem, 2)}`,
        ...(value !== null && premium !== null
          ? [
              `Loose value = ${fmt(total)} items × $${fmt(retail, 2)} = $${fmt(value, 2)}`,
              `Premium = $${fmt(price, 2)} − $${fmt(value, 2)} = $${fmt(premium, 2)}`,
            ]
          : []),
      ],
    };
  },
  content: {
    formula: [
      'Cost per day = calendar price ÷ days',
      'Cost per item = calendar price ÷ (days × items per day)',
      'Loose retail value = days × items per day × loose retail value per item',
      'Premium = calendar price − loose retail value; premium % = premium ÷ loose retail value',
    ],
    body: [
      'An advent calendar spreads one purchase over a countdown, so the price is easy to lose sight of. Divide it by the number of days and you get the daily cost; divide by the number of items and you get what each treat or product really costs you.',
      'If you also enter what one item would cost bought on its own, the calculator shows the loose retail value and the premium: how much more or less you pay for getting them in a calendar. A $30 calendar with 24 items worth $0.75 each holds $18 of contents, a $12 premium.',
      'A premium is not automatically bad. You are also paying for the packaging, the surprise and the daily ritual. The number just lets you decide with the maths in front of you. Everything runs in your browser.',
    ],
    sections: [
      {
        heading: 'Finding the loose retail value',
        paragraphs: [
          'Check the listed contents and look up what a comparable item costs on its own, ideally at a normal shelf price rather than a sale price. For mixed calendars, use an average across the items. Treat the result as an estimate, since sizes and sale prices vary.',
        ],
      },
    ],
    faq: [
      { q: 'How do I work out the cost per day of an advent calendar?', a: 'Divide the price by the number of days. A $30 calendar with 24 doors costs $30 ÷ 24 = $1.25 a day.' },
      { q: 'How is the premium calculated?', a: 'Loose value is days × items per day × the loose retail price of one item. The premium is the calendar price minus that value. A $30 calendar with 24 items worth $0.75 each holds $18 of contents, so the premium is $12, or 66.7% of the value.' },
      { q: 'What if there is more than one item behind each door?', a: 'Enter the items per day. A $60 calendar with 2 items a day over 24 days has 48 items, so each costs $60 ÷ 48 = $1.25, and the day costs $2.50. If each item is worth $1 loose, the contents are worth $48 and the premium is $12, or 25%.' },
      { q: 'What does a negative premium mean?', a: 'It means the calendar costs less than buying the same items loose, based on the retail value you entered.' },
    ],
  },
  related: ['cost-per-use', 'holiday-spending-total'],
  examples: [
    // per day 30 ÷ 24 = 1.25; per item 30 ÷ 24 = 1.25; value 24 × 0.75 = 18; premium 30 − 18 = 12; 12 ÷ 18 = 0.6667.
    { values: { price: 30, days: 24, items: 1, retail: 0.75 }, expect: { perDay: 1.25, perItem: 1.25, value: 18, premium: 12, premiumPct: 12 / 18 }, tolerance: 1e-9 },
    // per day 60 ÷ 24 = 2.5; 48 items so per item 60 ÷ 48 = 1.25; value 48 × 1 = 48; premium 12; 12 ÷ 48 = 0.25.
    { values: { price: 60, days: 24, items: 2, retail: 1 }, expect: { perDay: 2.5, perItem: 1.25, value: 48, premium: 12, premiumPct: 0.25 }, tolerance: 1e-9 },
  ],
});
