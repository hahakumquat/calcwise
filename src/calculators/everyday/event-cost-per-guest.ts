import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'event-cost-per-guest',
  title: 'Event Cost Per Guest Calculator',
  category: 'everyday',
  description: 'Work out what a party or event costs per guest. Split food and drinks that grow with headcount from venue and decor that do not, and compare a second guest count.',
  keywords: ['event cost per guest', 'party cost per person', 'cost per guest calculator', 'nye party budget per person', 'how much does a party cost per head', 'holiday party cost'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'guests', label: 'Guests', type: 'number', default: 25, min: 1, max: 5000, step: 1, info: 'How many people you expect, including yourself if you are eating too.' },
    { id: 'food', label: 'Food', type: 'number', prefix: '$', default: 300, min: 0, step: 10, info: 'Food cost at this guest count. It scales with headcount.' },
    { id: 'drinks', label: 'Drinks', type: 'number', prefix: '$', default: 150, min: 0, step: 10, info: 'Drinks cost at this guest count. It scales with headcount.' },
    { id: 'venue', label: 'Venue', type: 'number', prefix: '$', default: 200, min: 0, step: 10, info: 'Venue or rental. Treated as fixed: it does not change with guests.' },
    { id: 'decor', label: 'Decor and other fixed costs', type: 'number', prefix: '$', default: 0, min: 0, step: 10, optional: true, info: 'Decorations, music, anything that costs the same for 10 or 40 people.' },
    { id: 'alt', label: 'Compare with this many guests', type: 'number', default: 40, min: 1, max: 5000, step: 1, optional: true, info: 'Optional. Food and drinks are scaled in proportion; fixed costs stay the same.' },
  ],
  outputs: [
    { id: 'perGuest', label: 'Cost per guest', format: 'currency', primary: true, info: 'Total cost ÷ guests.' },
    { id: 'total', label: 'Total cost', format: 'currency', info: 'Food + drinks + venue + decor.' },
    { id: 'altTotal', label: 'Total at the other guest count', format: 'currency', info: 'Food and drinks scaled by the guest ratio, plus the same fixed costs.' },
    { id: 'altPerGuest', label: 'Per guest at the other count', format: 'currency', info: 'Total at the other guest count ÷ that count.' },
  ],
  compute: (v) => {
    const g = num(v.guests);
    const food = num(v.food);
    const drinks = num(v.drinks);
    const venue = num(v.venue);
    const decor = num(v.decor) ?? 0;
    const alt = num(v.alt);
    if (g === null || food === null || drinks === null || venue === null || g < 1 || food < 0 || drinks < 0 || venue < 0 || decor < 0) return { perGuest: null };
    if (alt !== null && alt < 1) return { perGuest: null };
    const n = Math.round(g);
    const variable = food + drinks;
    const fixed = venue + decor;
    const total = variable + fixed;
    if (total <= 0) return { perGuest: null, error: 'Enter at least one cost above zero.' };
    const per = total / n;
    const altN = alt !== null ? Math.round(alt) : null;
    const altTotal = altN !== null ? (variable / n) * altN + fixed : null;
    const altPer = altTotal !== null && altN !== null ? altTotal / altN : null;
    return {
      perGuest: per,
      total,
      altTotal,
      altPerGuest: altPer,
      tone: 'good',
      badge: `${money(per)} per guest`,
      note: altTotal !== null && altN !== null && altPer !== null
        ? `${n} guests cost ${money(total)} in total, or ${money(per)} each. With ${altN} guests the total is ${money(altTotal)}, or ${money(altPer)} each, because the fixed ${money(fixed)} is shared by more people.`
        : `${n} guests cost ${money(total)} in total, or ${money(per)} each.`,
      chart: {
        type: 'donut',
        title: 'Where the money goes',
        format: { format: 'currency' },
        slices: [
          { label: 'Food', value: food },
          { label: 'Drinks', value: drinks },
          { label: 'Venue', value: venue },
          { label: 'Decor and other', value: decor },
        ],
        centerValue: money(total),
        centerLabel: 'total',
      },
      steps: [
        `Total = ${money(food)} + ${money(drinks)} + ${money(venue)} + ${money(decor)} = ${money(total)}`,
        `Per guest = ${money(total)} ÷ ${n} = ${money(per)}`,
        ...(altTotal !== null && altN !== null && altPer !== null
          ? [`At ${altN} guests = ${money(variable)} ÷ ${n} × ${altN} + ${money(fixed)} = ${money(altTotal)}, or ${money(altPer)} each`]
          : []),
      ],
    };
  },
  content: {
    formula: [
      'Total = food + drinks + venue + decor',
      'Cost per guest = total ÷ guests',
      'At a new guest count: total = (food + drinks) ÷ guests × new guests + fixed costs',
    ],
    body: [
      'An event has two kinds of cost. Food and drinks grow with every extra guest. A venue or decorations cost the same whether 10 or 40 people turn up. This calculator keeps them apart so you can see what each guest really costs.',
      'Because fixed costs are shared, the cost per guest usually falls as the guest list grows, while the total goes up. Enter a second guest count to compare the two sizes side by side.',
      'Food and drinks are scaled in direct proportion to headcount, which is a simplification: caterers sometimes price in tiers, and a bigger crowd may need a bigger venue. Treat the second figure as a quick estimate. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I work out cost per guest?', a: 'Add up every cost and divide by the number of guests. $300 food, $150 drinks and $200 venue is $650, and $650 ÷ 25 guests is $26.00 each.' },
      { q: 'Why does the cost per guest drop with more guests?', a: 'Fixed costs such as the venue are shared. At 40 guests the same example has $480 of food, $240 of drinks and $200 of venue, $920 in total, or $23.00 each.' },
      { q: 'What counts as a fixed cost?', a: 'Anything that does not change with headcount: venue, decorations, a DJ or playlist, invitations.' },
      { q: 'Is the second guest count exact?', a: 'It is an estimate. Food and drinks are scaled in proportion, but real prices can come in steps.' },
    ],
    sources: [],
  },
  related: ['party-seating', 'group-gift-split', 'gift-budget', 'bill-splitter', 'holiday-spending-total'],
  examples: [
    // Variable 300 + 150 = 450; fixed 200; total 650; ÷ 25 = 26. At 40: 450/25 × 40 = 720 + 200 = 920; ÷ 40 = 23.
    { values: { guests: 25, food: 300, drinks: 150, venue: 200, decor: 0, alt: 40 }, expect: { perGuest: 26, total: 650, altTotal: 920, altPerGuest: 23 }, tolerance: 1e-6 },
    // Variable 200; fixed 100 + 50 = 150; total 350; ÷ 10 = 35. At 20: 200/10 × 20 = 400 + 150 = 550; ÷ 20 = 27.5.
    { values: { guests: 10, food: 120, drinks: 80, venue: 100, decor: 50, alt: 20 }, expect: { perGuest: 35, total: 350, altTotal: 550, altPerGuest: 27.5 }, tolerance: 1e-6 },
  ],
});
