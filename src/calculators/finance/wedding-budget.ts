import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const CATS = [
  { id: 'venue', label: 'Venue and catering', def: 50 },
  { id: 'photo', label: 'Photo and video', def: 12 },
  { id: 'attire', label: 'Attire', def: 8 },
  { id: 'music', label: 'Music', def: 8 },
  { id: 'flowers', label: 'Flowers and decor', def: 10 },
  { id: 'other', label: 'Other and buffer', def: 12 },
];

export default defineCalculator({
  slug: 'wedding-budget',
  title: 'Wedding Budget Calculator',
  seoTitle: 'Wedding Budget Calculator',
  metaDescription: 'Split your total wedding budget across venue, photo, attire, music, flowers and a buffer, then see the cost per guest and the monthly saving needed.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Split a total wedding budget into categories using percentages you choose, and see the cost per guest and how much to save each month.',
  keywords: ['wedding budget calculator', 'wedding budget breakdown', 'wedding cost per guest', 'how much to save for a wedding', 'wedding budget planner'],
  popular: false,
  inputs: [
    { id: 'budget', label: 'Total budget', type: 'number', prefix: '$', default: 30000, min: 0, step: 500, info: 'The most you plan to spend in total.' },
    { id: 'guests', label: 'Guests', type: 'number', default: 100, min: 1, step: 1, info: 'Number of people you are paying for.' },
    ...CATS.map((c) => ({ id: c.id, label: `${c.label} (%)`, type: 'number' as const, suffix: '%', default: c.def, min: 0, max: 100, step: 1, info: 'Your own share of the budget. The six shares should add up to 100.' })),
    { id: 'months', label: 'Months until the wedding', type: 'number', default: 18, min: 1, step: 1, info: 'How long you have to save.' },
    { id: 'saved', label: 'Saved so far', type: 'number', prefix: '$', default: 6000, min: 0, step: 500, info: 'Money already set aside for the wedding.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Save per month', format: 'currency', precision: 2, primary: true, info: '(Budget - saved) ÷ months. Zero if you have already saved the budget.' },
    { id: 'perGuest', label: 'Budget per guest', format: 'currency', precision: 2, info: 'Total budget ÷ guests.' },
    { id: 'venue$', label: 'Venue and catering', format: 'currency', info: 'Budget × share.' },
    { id: 'photo$', label: 'Photo and video', format: 'currency', info: 'Budget × share.' },
    { id: 'attire$', label: 'Attire', format: 'currency', info: 'Budget × share.' },
    { id: 'music$', label: 'Music', format: 'currency', info: 'Budget × share.' },
    { id: 'flowers$', label: 'Flowers and decor', format: 'currency', info: 'Budget × share.' },
    { id: 'other$', label: 'Other and buffer', format: 'currency', info: 'Budget × share.' },
    { id: 'remainder', label: 'Shares left to assign', format: 'number', precision: 1, suffix: '%', info: '100 minus the six shares. It should be 0.' },
  ],
  compute: (v) => {
    const budget = num(v.budget), guests = num(v.guests), months = num(v.months), saved = num(v.saved);
    const pcts = CATS.map((c) => num(v[c.id]));
    if ([budget, guests, months, saved, ...pcts].some((x) => x === null)) return { monthly: null };
    if ([budget!, saved!, ...(pcts as number[])].some((x) => x < 0)) return { monthly: null, error: 'Amounts cannot be negative.' };
    if (guests! < 1) return { monthly: null, error: 'Guests must be at least 1.' };
    if (months! < 1) return { monthly: null, error: 'Months must be at least 1.' };
    const p = pcts as number[];
    const sum = p.reduce((a, b) => a + b, 0);
    const remainder = 100 - sum;
    const amounts = p.map((x) => (budget! * x) / 100);
    const monthly = Math.max(budget! - saved!, 0) / months!;
    const perGuest = budget! / guests!;
    const out: Record<string, any> = { monthly, perGuest, remainder };
    CATS.forEach((c, i) => { out[`${c.id}$`] = amounts[i]; });
    const chart: ChartSpec = {
      type: 'donut',
      title: 'Where the budget goes',
      format: { format: 'currency' },
      slices: CATS.map((c, i) => ({ label: c.label, value: amounts[i] })).filter((s) => s.value > 0),
      centerValue: money(budget!),
      centerLabel: 'total',
    };
    const off = Math.abs(remainder) > 1e-9;
    return {
      ...out,
      tone: off ? 'warn' : 'ok',
      badge: off
        ? (remainder > 0 ? `${+remainder.toFixed(1)}% of the budget is still unassigned` : `Shares are ${+(-remainder).toFixed(1)}% over 100`)
        : `${money(perGuest, 0)} per guest`,
      chart: budget! > 0 && sum > 0 ? chart : undefined,
      steps: [
        `Each category = ${money(budget!, 0)} × its share, for example venue = ${money(amounts[0], 0)}`,
        `Per guest = ${money(budget!, 0)} ÷ ${guests} = ${money(perGuest, 2)}`,
        `Monthly saving = (${money(budget!, 0)} - ${money(saved!, 0)}) ÷ ${months} = ${money(monthly, 2)}`,
      ],
      note: 'The shares are yours, not a benchmark: costs vary a lot by place and season. Keep a buffer for things you have not thought of.',
    };
  },
  content: {
    formula: [
      'Category amount = total budget × share ÷ 100',
      'Budget per guest = total budget ÷ guests',
      'Monthly saving = (budget - saved) ÷ months left',
    ],
    body: [
      'A wedding budget works best as a fixed total split into shares. Set the total you can afford, decide how much of it each category gets, and the calculator turns the shares into dollar amounts.',
      'The six shares should add up to 100. If they do not, the result shows how much is still unassigned or how far over you are, so you can rebalance before you book anything.',
      'The cost per guest is a quick check on the guest list: every extra person raises the venue and catering line, so cutting ten guests can free more than cutting a flower budget.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'With $30,000 and shares of 50, 12, 8, 8, 10 and 12 percent, venue and catering get $15,000, photo and video $3,600, attire $2,400, music $2,400, flowers and decor $3,000, and other and buffer $3,600.',
          'For 100 guests that is $300 per guest. If you have saved $6,000 and have 18 months left, you need ($30,000 - $6,000) ÷ 18 = $1,333.33 a month.',
        ],
      },
      {
        heading: 'Related planning',
        paragraphs: [
          'The engagement ring budget calculator covers the earlier spend, the event cost per guest calculator handles any event, and the sinking fund calculator helps with other planned costs.',
        ],
      },
    ],
    faq: [
      { q: 'How do I split a wedding budget?', a: 'Choose a total, then give each category a percentage that adds up to 100. A $30,000 budget with 50% for venue and catering gives that line $15,000.' },
      { q: 'How much should I save each month?', a: 'Subtract what you have saved from the budget and divide by the months left. $30,000 less $6,000 over 18 months is $1,333.33 a month.' },
      { q: 'What if my shares do not add up to 100?', a: 'The result shows the gap. Under 100 means money is unassigned; over 100 means you have planned to spend more than the budget.' },
      { q: 'Are these percentages typical?', a: 'No. They are placeholders you should change. Wedding costs vary by location, season and guest count, so use quotes from your own vendors.' },
    ],
    sources: [],
  },
  related: ['engagement-ring-budget', 'event-cost-per-guest', 'sinking-fund', 'savings-goal'],
  examples: [
    // 30000*.5=15000; .12=3600; .08=2400; .1=3000; per guest 300; monthly (30000-6000)/18=1333.3333
    { values: { budget: 30000, guests: 100, venue: 50, photo: 12, attire: 8, music: 8, flowers: 10, other: 12, months: 18, saved: 6000 }, expect: { 'venue$': 15000, 'photo$': 3600, 'attire$': 2400, 'music$': 2400, 'flowers$': 3000, 'other$': 3600, perGuest: 300, monthly: 1333.3333, remainder: 0 }, tolerance: 1e-3 },
    // shares total 90 -> remainder 10; saved >= budget -> monthly 0
    { values: { budget: 20000, guests: 50, venue: 50, photo: 10, attire: 8, music: 7, flowers: 8, other: 7, months: 12, saved: 25000 }, expect: { monthly: 0, remainder: 10, perGuest: 400 }, tolerance: 1e-6 },
  ],
});
