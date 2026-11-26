import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'school-lunch-cost',
  title: 'School Lunch: Buy vs Pack Calculator',
  category: 'everyday',
  description: 'Compare buying school lunch with packing it. Enter the price per lunch, your packed cost, school days and children to see the yearly totals and what you save.',
  keywords: ['school lunch cost', 'pack lunch vs buy school lunch', 'how much does school lunch cost per year', 'packed lunch cost calculator', 'school lunch savings'],
  updated: '2026-11-26',
  inputs: [
    { id: 'buy', label: 'Price to buy one lunch', type: 'number', prefix: '$', default: 4.25, min: 0, step: 0.05, info: 'What the school charges for one lunch.' },
    { id: 'pack', label: 'Cost to pack one lunch', type: 'number', prefix: '$', default: 2.1, min: 0, step: 0.05, info: 'Your estimate of the food, snacks, drink and wrap for one packed lunch.' },
    { id: 'days', label: 'School days', type: 'number', default: 180, min: 1, max: 366, step: 1, info: 'How many lunches you will cover. Many US school years run about 180 days; check your calendar.' },
    { id: 'kids', label: 'Children', type: 'number', default: 1, min: 1, max: 20, step: 1, info: 'How many children eat lunch at school.' },
  ],
  outputs: [
    { id: 'saving', label: 'Saved by packing', format: 'currency', primary: true, info: 'Buying total minus packing total. Negative means buying is cheaper.' },
    { id: 'buyTotal', label: 'Buying total', format: 'currency', info: 'Price × school days × children.' },
    { id: 'packTotal', label: 'Packing total', format: 'currency', info: 'Packed cost × school days × children.' },
    { id: 'perLunch', label: 'Saved per lunch', format: 'currency', info: 'Price to buy minus cost to pack.' },
  ],
  compute: (v) => {
    const buy = num(v.buy), pack = num(v.pack), days = num(v.days), kids = num(v.kids);
    if ([buy, pack, days, kids].some((x) => x === null)) return { saving: null };
    if ((buy as number) < 0 || (pack as number) < 0 || (days as number) < 1 || (kids as number) < 1) return { saving: null };
    const lunches = (days as number) * (kids as number);
    const buyTotal = (buy as number) * lunches;
    const packTotal = (pack as number) * lunches;
    const saving = buyTotal - packTotal;
    const perLunch = (buy as number) - (pack as number);
    return {
      saving,
      buyTotal,
      packTotal,
      perLunch,
      tone: saving > 0 ? 'good' : saving < 0 ? 'warn' : 'ok',
      badge: saving > 0 ? 'Packing is cheaper' : saving < 0 ? 'Buying is cheaper' : 'No difference',
      note: `Over ${fmt(lunches, 0)} lunches, buying costs ${money(buyTotal)} and packing costs ${money(packTotal)}. Free and reduced-price lunch eligibility is not modelled, and the packed cost is your own estimate.`,
      chart: {
        type: 'bar' as const,
        title: 'Cost for the school year',
        categories: ['Buy at school', 'Pack at home'],
        series: [{ name: 'Total', values: [buyTotal, packTotal] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Lunches: ${fmt(days as number, 0)} days × ${fmt(kids as number, 0)} = ${fmt(lunches, 0)}`,
        `Buying: ${money(buy as number)} × ${fmt(lunches, 0)} = ${money(buyTotal)}`,
        `Packing: ${money(pack as number)} × ${fmt(lunches, 0)} = ${money(packTotal)}`,
        `Saved: ${money(buyTotal)} − ${money(packTotal)} = ${money(saving)}`,
      ],
    };
  },
  content: {
    formula: [
      'Lunches = school days × children',
      'Buying total = price per lunch × lunches',
      'Packing total = packed cost per lunch × lunches',
      'Saved = buying total − packing total',
    ],
    body: [
      'School lunch looks cheap one day at a time and expensive over a year. Enter what the school charges, what a packed lunch costs you, how many school days there are and how many children eat lunch to see both yearly totals and the gap between them.',
      'The packed cost is the number to be honest about. Add the sandwich or leftovers, the fruit, the snack, the drink and any wraps or containers you replace. If you pack a lot of pre-made snacks, it can come close to the price of buying.',
      'Free and reduced-price lunch eligibility, a la carte extras and your own time are not modelled. Every price is an input, so use your own school menu. For the cost of cooking at home more generally, see the recipe cost calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does school lunch cost per year?', a: 'With the defaults of $4.25 a lunch over 180 school days for one child, buying costs $765.00 a year. Packing at $2.10 a lunch costs $378.00, so packing saves $387.00.' },
      { q: 'How much do I save per lunch by packing?', a: 'The default saving is $4.25 minus $2.10, which is $2.15 per lunch. Multiply by school days and children to get the year.' },
      { q: 'What if I have more than one child?', a: 'Totals scale with the number of children. Two children with the defaults would cost $1,530.00 to buy and $756.00 to pack, saving $774.00.' },
      { q: 'Does this include free or reduced-price lunch?', a: 'No. If your child qualifies, the buying price may be $0 or much lower, so enter that price to compare fairly.' },
    ],
    sources: [],
  },
  related: ['recipe-cost', 'meal-kit-vs-groceries'],
  examples: [
    // buy = 4.25*180 = 765.00; pack = 2.10*180 = 378.00; saving = 387.00; per lunch = 2.15
    { values: { buy: 4.25, pack: 2.1, days: 180, kids: 1 }, expect: { buyTotal: 765, packTotal: 378, saving: 387, perLunch: 2.15 }, tolerance: 1e-9 },
    // buy = 3.50*175 = 612.50; pack = 1.50*175 = 262.50; saving = 350.00; per lunch = 2.00
    { values: { buy: 3.5, pack: 1.5, days: 175, kids: 1 }, expect: { buyTotal: 612.5, packTotal: 262.5, saving: 350, perLunch: 2 }, tolerance: 1e-9 },
    // two kids, defaults: 4.25*360 = 1530; 2.10*360 = 756; saving = 774
    { values: { buy: 4.25, pack: 2.1, days: 180, kids: 2 }, expect: { buyTotal: 1530, packTotal: 756, saving: 774 }, tolerance: 1e-9 },
  ],
});
