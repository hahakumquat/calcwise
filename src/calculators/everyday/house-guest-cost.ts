import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'house-guest-cost',
  title: 'House Guest Cost: What Holiday Visitors Add',
  category: 'everyday',
  description: 'Work out what hosting house guests costs: extra food, heat, water and laundry, and outings. See the total and the cost per guest night.',
  keywords: ['house guest cost', 'cost of hosting guests', 'holiday visitors cost', 'how much does hosting overnight guests cost', 'guest cost per night'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'guests', label: 'Guests', type: 'number', default: 2, min: 0, step: 1, info: 'Number of people staying with you.' },
    { id: 'nights', label: 'Nights', type: 'number', default: 5, min: 0, step: 1, info: 'How many nights they stay.' },
    { id: 'food', label: 'Extra food per guest per day', type: 'number', prefix: '$', default: 18, min: 0, step: 1, info: 'Your own estimate of groceries and drinks beyond what you normally buy.' },
    { id: 'household', label: 'Extra household cost per night', type: 'number', prefix: '$', default: 6, min: 0, step: 1, info: 'Your estimate for heat, water and laundry for the whole group.' },
    { id: 'other', label: 'Other costs', type: 'number', prefix: '$', default: 40, min: 0, step: 5, info: 'Outings, bedding, supplies: the one-off extras.' },
  ],
  outputs: [
    { id: 'total', label: 'Total hosting cost', format: 'currency', precision: 2, primary: true, info: 'Food + household + other.' },
    { id: 'perNight', label: 'Cost per guest night', format: 'currency', precision: 2, info: 'Total ÷ (guests × nights).' },
    { id: 'foodTotal', label: 'Extra food', format: 'currency', precision: 2, info: 'Guests × nights × food rate.' },
    { id: 'householdTotal', label: 'Extra household', format: 'currency', precision: 2, info: 'Nights × household rate.' },
  ],
  compute: (v) => {
    const guests = num(v.guests);
    const nights = num(v.nights);
    const food = num(v.food);
    const hh = num(v.household);
    const other = num(v.other);
    if (guests === null || nights === null || food === null || hh === null || other === null) return { total: null };
    if (guests < 0 || nights < 0 || food < 0 || hh < 0 || other < 0) return { total: null };
    const foodTotal = guests * nights * food;
    const householdTotal = nights * hh;
    const total = foodTotal + householdTotal + other;
    const gn = guests * nights;
    const perNight = gn > 0 ? total / gn : 0;
    return {
      total,
      perNight,
      foodTotal,
      householdTotal,
      tone: 'ok',
      badge: `Hosting costs about ${money(total)}`,
      note: gn > 0
        ? `${guests} guest${guests === 1 ? '' : 's'} for ${nights} night${nights === 1 ? '' : 's'} is ${gn} guest nights. Food adds ${money(foodTotal)}, the household adds ${money(householdTotal)} and other costs add ${money(other)}, so ${money(total)} in all, or ${money(perNight)} per guest night.`
        : 'Enter at least one guest and one night to see the cost per guest night.',
      chart: {
        type: 'bar' as const,
        title: 'Where the cost goes',
        categories: ['Food', 'Household', 'Other'],
        format: CURRENCY,
        series: [{ name: 'Cost', values: [foodTotal, householdTotal, other] }],
      },
      steps: [
        `Food = ${guests} × ${nights} × ${money(food)} = ${money(foodTotal)}`,
        `Household = ${nights} × ${money(hh)} = ${money(householdTotal)}`,
        `Total = ${money(foodTotal)} + ${money(householdTotal)} + ${money(other)} = ${money(total)}`,
        gn > 0 ? `Per guest night = ${money(total)} ÷ ${gn} = ${money(perNight)}` : 'Per guest night needs at least one guest and one night',
      ],
    };
  },
  content: {
    formula: [
      'Food = guests × nights × extra food per guest per day',
      'Household = nights × extra household cost per night',
      'Total = food + household + other costs',
      'Per guest night = total ÷ (guests × nights)',
    ],
    body: [
      'Hosting is generous, and it is also a line in the budget. This calculator adds up the extra food, the extra heat, water and laundry, and the one-off costs, so you know what a visit really costs before it starts.',
      'Example: 2 guests for 5 nights, $18 of extra food per guest per day, $6 of extra household cost per night and $40 of other costs. Food is 2 × 5 × $18 = $180. The household adds 5 × $6 = $30. With $40 of extras the total is $250, which is $25.00 per guest night across 10 guest nights.',
      'Every rate here is your own estimate; the tool does not know your utility prices or grocery habits. It counts only extra costs, not what you would have spent anyway. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What counts as extra food?', a: 'Only what you would not have bought otherwise. If a guest eats $18 more of groceries a day than you would have bought, enter 18.' },
      { q: 'How do I estimate the household cost?', a: 'Think of extra heat or cooling, water, laundry and cleaning for the whole group, per night. The $6 default is a placeholder; use your own bills as a guide.' },
      { q: 'What goes in other costs?', a: 'One-off extras: outings, bedding, an air mattress, gifts for the host-side. Enter the total.' },
      { q: 'How is cost per guest night worked out?', a: 'The total divided by guests times nights. Two guests for five nights is 10 guest nights, so $250 is $25.00 each.' },
      { q: 'Does it include the cost of my time?', a: 'No. It counts money only.' },
    ],
    sources: [],
  },
  related: ['event-cost-per-guest', 'holiday-spending-total', 'heating-cost', 'gift-budget'],
  examples: [
    // food 2*5*18=180; household 5*6=30; total 180+30+40=250; per night 250/10=25
    { values: { guests: 2, nights: 5, food: 18, household: 6, other: 40 }, expect: { foodTotal: 180, householdTotal: 30, total: 250, perNight: 25 } },
    // food 1*3*20=60; household 3*10=30; total 90; per night 30
    { values: { guests: 1, nights: 3, food: 20, household: 10, other: 0 }, expect: { foodTotal: 60, householdTotal: 30, total: 90, perNight: 30 } },
  ],
});
