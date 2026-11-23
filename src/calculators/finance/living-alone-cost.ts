import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'living-alone-cost',
  title: 'Cost of Living Alone vs Roommates',
  seoTitle: 'Living Alone vs Roommates Cost Calculator',
  metaDescription: 'Compare renting solo with sharing a place: rent, utilities and internet per month, then what privacy costs you per year and per day.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Find out what living alone costs compared with sharing a place with roommates.',
  keywords: ['cost of living alone vs roommates', 'living alone calculator', 'roommate savings calculator', 'is it worth living alone', 'solo apartment vs shared'],
  popular: false,
  inputs: [
    { id: 'soloRent', label: 'Solo place: rent', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'Monthly rent for a place of your own.' },
    { id: 'soloUtil', label: 'Solo place: utilities', type: 'number', prefix: '$', default: 150, min: 0, step: 10, info: 'Electricity, gas, water per month.' },
    { id: 'soloNet', label: 'Solo place: internet', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'Monthly internet.' },
    { id: 'sharedRent', label: 'Shared place: total rent', type: 'number', prefix: '$', default: 2700, min: 0, step: 50, info: 'The whole rent, before splitting.' },
    { id: 'sharedUtil', label: 'Shared place: total utilities', type: 'number', prefix: '$', default: 240, min: 0, step: 10, info: 'The whole utility bill, before splitting.' },
    { id: 'sharedNet', label: 'Shared place: total internet', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'The whole internet bill, before splitting.' },
    { id: 'people', label: 'People sharing', type: 'number', default: 3, min: 2, max: 12, step: 1, info: 'Including you. Costs are split equally.' },
  ],
  outputs: [
    { id: 'premium', label: 'What living alone costs extra per month', format: 'currency', precision: 0, primary: true, info: 'Solo total minus your share of the shared place.' },
    { id: 'year', label: 'Extra per year', format: 'currency', precision: 0, info: 'Monthly difference × 12.' },
    { id: 'day', label: 'Extra per day', format: 'currency', precision: 2, info: 'Yearly difference ÷ 365.' },
    { id: 'solo', label: 'Living alone per month', format: 'currency', precision: 0, info: 'Rent + utilities + internet.' },
    { id: 'shared', label: 'Your share of the shared place', format: 'currency', precision: 0, info: 'Total ÷ people.' },
  ],
  compute: (v) => {
    const a = num(v.soloRent), b = num(v.soloUtil), c = num(v.soloNet);
    const d = num(v.sharedRent), e = num(v.sharedUtil), f = num(v.sharedNet);
    const p = num(v.people);
    if ([a, b, c, d, e, f, p].some((x) => x === null)) return { premium: null };
    if ([a, b, c, d, e, f].some((x) => (x as number) < 0)) return { premium: null, error: 'Costs cannot be negative.' };
    if ((p as number) < 2) return { premium: null, error: 'Enter at least 2 people sharing.' };
    const n = Math.floor(p as number);
    const solo = (a as number) + (b as number) + (c as number);
    const sharedTotal = (d as number) + (e as number) + (f as number);
    const shared = sharedTotal / n;
    const premium = solo - shared;
    const year = premium * 12;
    const day = year / 365;
    return {
      premium,
      year,
      day,
      solo,
      shared,
      tone: premium > 0 ? 'ok' : 'good',
      badge: premium > 0 ? `Privacy costs ${money(day, 2)} a day` : 'Living alone is not more expensive here',
      chart: {
        type: 'bar',
        title: 'Monthly cost',
        categories: ['Living alone', `Sharing with ${n - 1}`],
        series: [{ name: 'Per month', values: [+solo.toFixed(2), +shared.toFixed(2)] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Alone = ${money(a as number, 0)} + ${money(b as number, 0)} + ${money(c as number, 0)} = ${money(solo, 0)} a month`,
        `Shared = ${money(sharedTotal, 0)} ÷ ${n} = ${money(shared, 0)} a month`,
        `Difference = ${money(premium, 0)} a month × 12 = ${money(year, 0)} a year = ${money(day, 2)} a day`,
      ],
      note: `Living alone costs ${money(solo, 0)} a month; sharing costs you ${money(shared, 0)}. Deposits, furniture and commute differences are not included.`,
    };
  },
  content: {
    formula: [
      'Alone = rent + utilities + internet',
      'Shared = (total rent + total utilities + total internet) ÷ people',
      'Extra per year = (alone − shared) × 12; per day = per year ÷ 365',
    ],
    body: [
      'Living alone buys privacy, and this calculator puts a price on it. Enter the monthly cost of a solo place and of a shared one and you get the difference per month, per year and per day.',
      'With a $1,800 solo rent plus $150 utilities and $60 internet ($2,010), against a $2,700 shared rent plus $240 and $60 split three ways ($1,000 each), living alone costs $1,010 more a month, $12,120 a year, or $33.21 a day.',
    ],
    sections: [
      {
        heading: 'What this leaves out',
        paragraphs: [
          'Security deposits, furniture, groceries, commute time and cost, and the chance a roommate leaves and the rest of you cover their share are not included. Costs are also split equally; if rooms differ in size, see the rent split calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How much more does living alone cost?', a: 'In the default example, $1,010 a month more: $2,010 alone against $1,000 as one of three people sharing.' },
      { q: 'How is the cost per day worked out?', a: 'The yearly difference ($12,120 in the default example) divided by 365 gives $33.21 a day.' },
      { q: 'Does it include deposits or furniture?', a: 'No, only monthly rent, utilities and internet.' },
      { q: 'What if the rooms are different sizes?', a: 'This splits everything equally. Use the rent split calculator for unequal rooms.' },
    ],
    sources: [{ label: 'Simple arithmetic on your own figures; no external data' }],
  },
  related: ['rent-split', 'rent-affordability', 'rent-increase-impact', 'rent-vs-buy'],
  examples: [
    // solo 2010; shared 3000/3 = 1000; premium 1010; year 12120; day 33.2054795
    { values: { soloRent: 1800, soloUtil: 150, soloNet: 60, sharedRent: 2700, sharedUtil: 240, sharedNet: 60, people: 3 }, expect: { solo: 2010, shared: 1000, premium: 1010, year: 12120, day: 33.20548 }, tolerance: 1e-4 },
    // solo 1000; shared 1600/2 = 800; premium 200; year 2400; day 6.575342
    { values: { soloRent: 900, soloUtil: 70, soloNet: 30, sharedRent: 1500, sharedUtil: 80, sharedNet: 20, people: 2 }, expect: { solo: 1000, shared: 800, premium: 200, year: 2400, day: 6.575342 }, tolerance: 1e-4 },
  ],
});
