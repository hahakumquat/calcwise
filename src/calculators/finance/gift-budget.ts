import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'gift-budget',
  title: 'Holiday Gift Budget Calculator',
  category: 'finance',
  description: 'Split your holiday budget across adults and kids, see what you can spend per person and how much to set aside each week before the big day.',
  keywords: ['gift budget calculator', 'holiday budget calculator', 'christmas budget planner', 'how much to spend on gifts per person', 'holiday gift budget split', 'weekly savings for christmas'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    { id: 'total', label: 'Total holiday budget', type: 'number', prefix: '$', default: 1000, min: 0, step: 50, info: 'Everything you are willing to spend this season, including the fixed costs below.' },
    { id: 'fixed', label: 'Fixed costs', type: 'number', prefix: '$', default: 200, min: 0, step: 25, optional: true, help: 'Travel, wrapping, cards, postage, party food.', info: 'Costs that are not gifts. They come off the top before the rest is split between people.' },
    { id: 'adults', label: 'Adults to buy for', type: 'number', default: 2, min: 0, max: 100, step: 1, optional: true, info: 'Number of adults on your gift list. Adults count as one share each.' },
    { id: 'kids', label: 'Kids to buy for', type: 'number', default: 4, min: 0, max: 100, step: 1, optional: true, info: 'Number of kids on your gift list. Each counts as the kid weight below in shares.' },
    {
      id: 'weight',
      label: 'Kid weight',
      type: 'select',
      default: '1.0',
      options: [
        { value: '1.0', label: '1.0 (same as an adult)' },
        { value: '1.5', label: '1.5 (a kid gets 50% more)' },
      ],
      help: 'A rule of thumb, not a standard.',
      info: 'How much a kid counts for compared with an adult when the budget is split. Some budgeting guides give kids more; others split evenly. Pick what suits your family.',
    },
    { id: 'weeks', label: 'Weeks left', type: 'number', default: 6, min: 1, max: 104, step: 1, info: 'Weeks until you need the money, to work out a weekly saving amount.' },
    { id: 'spent', label: 'Already spent', type: 'number', prefix: '$', default: 0, min: 0, step: 25, optional: true, info: 'What you have already spent from this budget. It lowers the amount you still need to save.' },
  ],
  outputs: [
    { id: 'perAdult', label: 'Per adult', format: 'currency', primary: true, info: '(Total budget − fixed costs) ÷ (adults + kids × kid weight).' },
    { id: 'perKid', label: 'Per kid', format: 'currency', info: 'The per-adult amount multiplied by the kid weight.' },
    { id: 'weekly', label: 'Save each week', format: 'currency', info: 'Remaining budget ÷ weeks left.' },
    { id: 'remaining', label: 'Remaining budget', format: 'currency', info: 'Total budget minus what you have already spent.' },
  ],
  compute: (v) => {
    const total = num(v.total);
    const fixed = num(v.fixed) ?? 0;
    const adults = Math.floor(num(v.adults) ?? 0);
    const kids = Math.floor(num(v.kids) ?? 0);
    const weight = Number(v.weight) || 1;
    const weeks = num(v.weeks);
    const spent = num(v.spent) ?? 0;
    if (total === null || total < 0 || fixed < 0 || adults < 0 || kids < 0 || spent < 0) return { perAdult: null };

    const units = adults + kids * weight;
    if (units <= 0) return { perAdult: null, error: 'Add at least one adult or kid to split the budget between.' };
    if (fixed > total) return { perAdult: null, error: 'Your fixed costs are higher than the total budget. Raise the budget or lower the fixed costs.' };

    const pool = total - fixed;
    const perAdult = pool / units;
    const perKid = perAdult * weight;
    const remaining = total - spent;
    const weekly = weeks !== null && weeks >= 1 ? Math.max(0, remaining) / weeks : null;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    let badge: string;
    if (remaining < 0) {
      tone = 'bad';
      badge = `Over budget by ${money(-remaining, 0)}`;
    } else if (remaining === 0) {
      tone = 'good';
      badge = 'Budget fully spent';
    } else {
      tone = 'good';
      badge = `${money(perAdult, 0)} per adult`;
    }

    const parts = [
      { label: 'Adult gifts', value: perAdult * adults },
      { label: 'Kid gifts', value: perKid * kids },
      { label: 'Fixed costs', value: fixed },
    ].filter((p) => p.value > 0);

    const kidsText = kids > 0 ? ` and ${money(perKid, 0)} per kid` : '';
    const note =
      remaining < 0
        ? `You have spent ${money(spent, 0)}, which is ${money(-remaining, 0)} over your ${money(total, 0)} budget.`
        : `After ${money(fixed, 0)} of fixed costs, you can spend ${money(perAdult, 0)} per adult${kidsText}.${weekly !== null ? ` Saving ${money(weekly, 0)} a week for ${weeks} week${weeks === 1 ? '' : 's'} covers the remaining ${money(remaining, 0)}.` : ''}`;

    return {
      perAdult,
      perKid: kids > 0 ? perKid : null,
      weekly,
      remaining,
      tone,
      badge,
      chart: [moneyDonut('Where the budget goes', parts, money(total, 0), 'total')],
      steps: [
        `Left for gifts = ${money(total, 0)} − ${money(fixed, 0)} = ${money(pool, 0)}`,
        `Shares = ${adults} adult${adults === 1 ? '' : 's'} + ${kids} kid${kids === 1 ? '' : 's'} × ${weight} = ${+units.toFixed(2)}`,
        `Per adult = ${money(pool, 0)} ÷ ${+units.toFixed(2)} = ${money(perAdult)}`,
        ...(kids > 0 ? [`Per kid = ${money(perAdult)} × ${weight} = ${money(perKid)}`] : []),
        `Remaining = ${money(total, 0)} − ${money(spent, 0)} = ${money(remaining, 0)}`,
        ...(weekly !== null ? [`Weekly saving = ${money(Math.max(0, remaining), 0)} ÷ ${weeks} = ${money(weekly)}`] : []),
      ],
      note,
    };
  },
  content: {
    formula: [
      'Left for gifts = total budget − fixed costs',
      'Shares = adults + kids × kid weight',
      'Per adult = left for gifts ÷ shares',
      'Per kid = per adult × kid weight',
      'Remaining budget = total budget − already spent',
      'Weekly saving = remaining budget ÷ weeks left',
    ],
    body: [
      'A holiday budget works best when you set the total first and divide it second. Start with the most you are willing to spend, take off the costs that are not gifts, such as travel, wrapping and postage, and split what is left between the people on your list.',
      'Every adult counts as one share. Kids count as one share by default, so everyone gets the same amount. You can switch the kid weight to 1.5, which gives each kid 50% more than an adult. That is a rule of thumb some families use, not a standard, so use whichever feels fair to you.',
      'The weekly saving figure is the remaining budget divided by the weeks you have left. If you have already spent some of it, enter that amount and the calculator subtracts it. The per-person amounts are always based on the whole gift pool, so they stay the same as you spend.',
    ],
    sections: [
      {
        heading: 'Tips for sticking to the number',
        paragraphs: [
          'Write down a per-person cap before you shop and check each purchase against it. Buying for the hardest-to-shop-for person first stops you from overspending on easy gifts and running short later.',
          'If the per-person amount is lower than you hoped, you can raise the total, trim the fixed costs, or agree a smaller list with family and friends, for example a draw-names exchange for adults.',
        ],
      },
    ],
    faq: [
      { q: 'How much should I spend per person with $1,000?', a: 'With $200 of fixed costs, 2 adults and 4 kids at a kid weight of 1.5, you have $800 for gifts across 8 shares (2 + 4 × 1.5). That is $100 per adult and $150 per kid.' },
      { q: 'What does the kid weight do?', a: 'It sets how much a kid counts compared with an adult. At 1.0 everyone gets the same. At 1.5 each kid gets 50% more than each adult, and the adults get less. It is a rule of thumb you can choose, not a standard.' },
      { q: 'How is the weekly saving worked out?', a: 'It is your total budget minus what you have already spent, divided by the weeks left. For a $1,000 budget with nothing spent and 8 weeks to go, that is $125 a week.' },
      { q: 'What if I have already spent some money?', a: 'Enter it under Already spent. With a $1,000 budget, $250 spent and 5 weeks left, the remaining budget is $750 and the weekly saving is $150. Per-person amounts do not change, because they come from the full gift pool.' },
      { q: 'What happens if I enter no adults and no kids?', a: 'There is nobody to split the budget between, so the calculator asks you to add at least one adult or kid instead of showing a result.' },
    ],
    sources: [
      { label: 'CFPB: Budgeting and saving tools', url: 'https://www.consumerfinance.gov/consumer-tools/' },
    ],
  },
  related: ['savings-goal', 'savings-challenge', 'emergency-fund', 'discount', 'sales-tax'],
  examples: [
    {
      // Gift pool 1,000 − 200 = 800; shares 2 + 4 × 1.5 = 8; adult 800 ÷ 8 = 100; kid 100 × 1.5 = 150; remaining 1,000; weekly 1,000 ÷ 8 = 125.
      values: { total: 1000, fixed: 200, adults: 2, kids: 4, weight: '1.5', weeks: 8, spent: 0 },
      expect: { perAdult: 100, perKid: 150, weekly: 125, remaining: 1000 },
    },
    {
      // Pool 800; shares 2 + 3 × 1.0 = 5; adult = kid = 160; remaining 1,000 − 250 = 750; weekly 750 ÷ 5 = 150.
      values: { total: 1000, fixed: 200, adults: 2, kids: 3, weight: '1.0', weeks: 5, spent: 250 },
      expect: { perAdult: 160, perKid: 160, weekly: 150, remaining: 750 },
    },
    {
      // Pool 600 − 100 = 500; shares 3 + 2 × 1.5 = 6; adult 500 ÷ 6 = 83.3333; kid 125; remaining 600 − 100 = 500; weekly 500 ÷ 4 = 125.
      values: { total: 600, fixed: 100, adults: 3, kids: 2, weight: '1.5', weeks: 4, spent: 100 },
      expect: { perAdult: 83.3333, perKid: 125, weekly: 125, remaining: 500 },
      tolerance: 1e-3,
    },
  ],
});
