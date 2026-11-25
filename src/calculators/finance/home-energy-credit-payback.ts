import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'home-energy-credit-payback',
  title: 'Home Energy Credit Payback Calculator',
  category: 'finance',
  description: 'Work out the net cost and payback years of a heat pump, windows or solar quote after a home energy tax credit. Credit rate, cap and tax owed are your inputs.',
  keywords: ['home energy credit calculator', 'heat pump tax credit payback', 'energy efficient home improvement credit', 'net cost after tax credit', 'window upgrade payback'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'cost', label: 'Project cost', type: 'number', prefix: '$', default: 12000, min: 0, step: 500, help: 'The quote for the heat pump, windows, insulation or similar.', info: 'Total installed cost before any credit.' },
    { id: 'creditPct', label: 'Credit rate', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 1, help: 'Illustrative default. Not a current-year claim: check the rate for your project.', info: 'Share of the cost the credit covers.' },
    { id: 'cap', label: 'Annual credit cap', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, help: 'Use 0 for no cap. Illustrative default, not a current-year claim.', info: 'Most credit you can claim in one year. 0 means no cap.' },
    { id: 'liability', label: 'Tax you owe this year', type: 'number', prefix: '$', default: 6000, min: 0, step: 500, help: 'A nonrefundable credit cannot go below zero tax.', info: 'Tax available to absorb the credit this year.' },
    { id: 'savings', label: 'Energy savings per year', type: 'number', prefix: '$', default: 600, min: 0, step: 50, help: 'Expected drop in your yearly energy bills.', info: 'Used for payback years.' },
  ],
  outputs: [
    { id: 'netCost', label: 'Net cost after credit', format: 'currency', primary: true, info: 'Project cost − credit you can use this year.' },
    { id: 'credit', label: 'Credit before liability limit', format: 'currency', info: 'The smaller of cost × rate and the cap (if any).' },
    { id: 'usable', label: 'Credit usable this year', format: 'currency', info: 'The smaller of the credit and your tax owed.' },
    { id: 'unused', label: 'Unused credit', format: 'currency', info: 'Credit − usable credit.' },
    { id: 'payback', label: 'Payback with credit', format: 'number', suffix: 'years', precision: 1, info: 'Net cost ÷ yearly savings.' },
    { id: 'paybackNo', label: 'Payback without credit', format: 'number', suffix: 'years', precision: 1, info: 'Project cost ÷ yearly savings.' },
  ],
  compute: (v) => {
    const cost = num(v.cost);
    const creditPct = num(v.creditPct);
    const cap = num(v.cap);
    const liability = num(v.liability);
    const savings = num(v.savings);
    if (cost === null || creditPct === null || cap === null || liability === null || savings === null) return { netCost: null };
    if (cost < 0 || creditPct < 0 || cap < 0 || liability < 0 || savings < 0) return { netCost: null };

    const raw = cost * (creditPct / 100);
    const credit = cap > 0 ? Math.min(raw, cap) : raw;
    const usable = Math.min(credit, liability);
    const unused = credit - usable;
    const netCost = cost - usable;
    const payback = savings > 0 ? netCost / savings : null;
    const paybackNo = savings > 0 ? cost / savings : null;
    const yrs = (n: number | null) => (n === null ? 'no savings entered' : `${n.toFixed(1)} years`);

    const charts: ChartSpec[] = [
      {
        type: 'bar',
        title: 'Project cost and what you really pay',
        categories: ['Project cost', 'Credit used', 'Net cost'],
        series: [{ name: 'Amount', values: [cost, usable, netCost] }],
        format: { format: 'currency' },
      },
    ];

    return {
      netCost, credit, usable, unused, payback, paybackNo,
      tone: usable > 0 ? 'good' : 'ok',
      badge: unused > 0 ? `${money(unused, 0)} of credit unused this year` : `Credit covers ${pct(cost > 0 ? usable / cost : 0, 1)} of the cost`,
      chart: charts,
      steps: [
        `Credit = ${money(cost, 0)} × ${pct(creditPct / 100, 1)}${cap > 0 ? `, capped at ${money(cap, 0)}` : ', no cap'} = ${money(credit)}`,
        `Usable this year = smaller of ${money(credit)} and ${money(liability, 0)} tax owed = ${money(usable)}`,
        `Net cost = ${money(cost, 0)} − ${money(usable)} = ${money(netCost)}`,
        `Payback = ${yrs(payback)} with the credit, versus ${yrs(paybackNo)} without`,
      ],
      note: 'The credit rate, cap and tax owed are your inputs and the defaults are illustrative, not current-year claims. Carryforward of unused credit, product eligibility and other rules are not computed. Not tax advice.',
    };
  },
  content: {
    formula: [
      'Credit = smaller of (cost × credit rate) and the annual cap (no cap if 0)',
      'Usable credit = smaller of the credit and your tax owed; unused = credit − usable',
      'Net cost = cost − usable credit; payback years = net cost ÷ yearly savings',
    ],
    body: [
      'A home energy tax credit takes a share of a qualifying project off your tax bill. This calculator shows what that does to the real price of a heat pump, windows or insulation quote, and how many years of lower energy bills it takes to earn the money back.',
      'A nonrefundable credit can only reduce tax you actually owe. If your tax is lower than the credit, part of the credit goes unused this year. Whether that part can be carried forward depends on the rules, which are not computed here, so the net cost shown counts only the credit you can use now.',
      'The credit rate, cap and tax owed are inputs, and the defaults are illustrative, not claims about the current year. Check the rules for your project and year before you buy.',
    ],
    sections: [
      {
        heading: 'Things this does not model',
        paragraphs: ['Carryforward of unused credit, which products qualify, per-item limits, installation versus equipment costs, financing and changes in energy prices are not computed. Savings are assumed flat every year. Check the IRS guidance or a tax professional.'],
      },
    ],
    faq: [
      { q: 'What is the net cost of a $12,000 project with a 30% credit capped at $2,000?', a: 'The credit is the smaller of $3,600 and $2,000, so $2,000. With $6,000 of tax owed you can use all of it, so the net cost is $10,000. At $600 a year of savings, payback is 16.7 years versus 20.0 without the credit.' },
      { q: 'What if I owe less tax than the credit?', a: 'On $20,000 at 30% with no cap, the credit is $6,000. With $4,000 of tax owed you can use $4,000, $2,000 goes unused, and the net cost is $16,000. At $1,000 a year of savings, payback is 16.0 years versus 20.0.' },
      { q: 'Is unused credit carried forward?', a: 'This calculator does not compute carryforward. Check the rules for your credit; if a carryforward applies, your real net cost may be lower than shown.' },
      { q: 'Are the default rate and cap current?', a: 'No. They are illustrative. Use the rate and cap that apply to your project and tax year.' },
    ],
    sources: [
      { label: 'IRS: Energy Efficient Home Improvement Credit', url: 'https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit' },
      { label: 'IRS: Home energy tax credits', url: 'https://www.irs.gov/credits-deductions/home-energy-tax-credits' },
    ],
  },
  related: ['energy-upgrade-payback', 'heating-cost', 'estimated-tax-safe-harbor'],
  examples: [
    {
      // credit = min(12,000 × 0.30 = 3,600, cap 2,000) = 2,000; usable = min(2,000, 6,000) = 2,000; net = 10,000; 10,000 / 600 = 16.6667; 12,000 / 600 = 20.
      values: { cost: 12000, creditPct: 30, cap: 2000, liability: 6000, savings: 600 },
      expect: { credit: 2000, usable: 2000, unused: 0, netCost: 10000, payback: 16.666667, paybackNo: 20 },
      tolerance: 1e-3,
    },
    {
      // credit = 20,000 × 0.30 = 6,000 (no cap); usable = min(6,000, 4,000) = 4,000; unused 2,000; net = 16,000; 16,000 / 1,000 = 16; 20,000 / 1,000 = 20.
      values: { cost: 20000, creditPct: 30, cap: 0, liability: 4000, savings: 1000 },
      expect: { credit: 6000, usable: 4000, unused: 2000, netCost: 16000, payback: 16, paybackNo: 20 },
      tolerance: 1e-3,
    },
  ],
});
