import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const PER_YEAR: Record<string, number> = { weekly: 52, monthly: 12, yearly: 1 };
const PERIOD_WORD: Record<string, string> = { weekly: 'a week', monthly: 'a month', yearly: 'a year' };
const YEARS = 10;

const DEFAULT_PRICES = [10, 15, 5];

const subInputs = SLOTS.flatMap((n) => {
  const optional = n > 1;
  const tail = optional ? ' Leave blank if you have fewer subscriptions.' : '';
  return [
    { id: `p${n}`, label: `Subscription ${n} price`, type: 'number' as const, prefix: '$', min: 0, step: 0.01, optional, ...(n <= 3 ? { default: DEFAULT_PRICES[n - 1] } : {}), info: `What subscription ${n} charges each time it bills.${tail}` },
    {
      id: `f${n}`,
      label: `Subscription ${n} billed`,
      type: 'select' as const,
      default: 'monthly',
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
      ],
      info: `How often subscription ${n} bills you. Weekly counts 52 times a year, monthly 12 and yearly once.`,
    },
  ];
});

/** Future value of an annual end-of-year contribution A for n years at rate r (fraction). */
const annuityFv = (a: number, r: number, n: number) => (r === 0 ? a * n : (a * (Math.pow(1 + r, n) - 1)) / r);

export default defineCalculator({
  slug: 'subscription-cost',
  title: 'Subscription Cost Calculator',
  category: 'finance',
  description: 'Add up your subscriptions and see what they cost per year and per month, plus what that money could grow to in 10 years if you invested it instead.',
  keywords: ['subscription cost calculator', 'how much do my subscriptions cost', 'annual subscription cost', 'monthly subscriptions total', 'subscription audit', 'cancel subscriptions savings'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    ...subInputs,
    { id: 'rate', label: 'Assumed investment return', type: 'number', suffix: '%', default: 7, min: 0, max: 30, step: 0.5, info: 'An assumption, not a promise: the yearly return you would earn if you invested the money instead. 7% is a commonly used long-run stock market guess before inflation. Set 0 to see plain saving with no growth.' },
  ],
  outputs: [
    { id: 'annual', label: 'Cost per year', format: 'currency', primary: true, info: 'Weekly prices × 52, monthly prices × 12 and yearly prices × 1, added together.' },
    { id: 'monthly', label: 'Cost per month', format: 'currency', info: 'Cost per year ÷ 12.' },
    { id: 'weekly', label: 'Cost per week', format: 'currency', info: 'Cost per year ÷ 52.' },
    { id: 'invested', label: 'If invested for 10 years', format: 'currency', info: `What a year of these costs, put aside at the end of each year for ${YEARS} years, could grow to at your assumed return. A what-if, not a forecast.` },
  ],
  compute: (v) => {
    const rate = num(v.rate) ?? 0;
    if (rate < 0 || rate > 30) return { annual: null, error: 'Choose a return between 0% and 30%.' };

    const rows: { n: number; annual: number }[] = [];
    for (const n of SLOTS) {
      const p = num(v[`p${n}`]);
      if (p === null) continue;
      if (p < 0) return { annual: null };
      if (p === 0) continue;
      rows.push({ n, annual: p * (PER_YEAR[String(v[`f${n}`])] ?? 12) });
    }
    if (rows.length === 0) return { annual: null, error: 'Enter at least one subscription price above $0.' };

    const annual = rows.reduce((s, r) => s + r.annual, 0);
    const monthly = annual / 12;
    const weekly = annual / 52;
    const r = rate / 100;
    const invested = annuityFv(annual, r, YEARS);
    const paid = annual * YEARS;

    const badge = `${money(annual, 0)} a year on subscriptions`;
    const tone: 'good' | 'ok' | 'warn' | 'bad' = annual < 300 ? 'good' : annual < 1000 ? 'ok' : annual < 2500 ? 'warn' : 'bad';
    const note = `${rows.length} subscription${rows.length === 1 ? '' : 's'} cost ${money(annual)} a year, or ${money(monthly)} a month. Invested at ${rate}% a year instead, that money could grow to about ${money(invested, 0)} in ${YEARS} years (an assumption, not a promise).`;

    return {
      annual,
      monthly,
      weekly,
      invested,
      tone,
      badge,
      chart: {
        type: 'bar',
        title: 'Cost per year, by subscription',
        categories: rows.map((x) => `Sub ${x.n}`),
        series: [{ name: 'Per year', values: rows.map((x) => x.annual) }],
        format: { format: 'currency' },
        horizontal: rows.length > 5,
        highlight: rows.reduce((best, x, i) => (x.annual > rows[best].annual ? i : best), 0),
      },
      steps: [
        ...rows.map((x) => {
          const f = String(v[`f${x.n}`]);
          return `Subscription ${x.n} = ${money(num(v[`p${x.n}`]) as number)} × ${PER_YEAR[f] ?? 12} = ${money(x.annual)} a year (billed ${f})`;
        }),
        `Per year = ${money(annual)}`,
        `Per month = ${money(annual)} ÷ 12 = ${money(monthly)}`,
        `Per week = ${money(annual)} ÷ 52 = ${money(weekly)}`,
        r === 0
          ? `Saved ${YEARS} years at 0% = ${money(annual)} × ${YEARS} = ${money(invested, 0)}`
          : `Invested ${YEARS} years = ${money(annual)} × ((1 + ${rate}%)^${YEARS} − 1) ÷ ${rate}% = ${money(invested, 0)}, from ${money(paid, 0)} paid in`,
      ],
      note,
    };
  },
  content: {
    formula: [
      'Per year = weekly prices × 52 + monthly prices × 12 + yearly prices × 1',
      'Per month = per year ÷ 12',
      'Per week = per year ÷ 52',
      'Invested value = A × ((1 + r)^10 − 1) ÷ r, where A is the yearly cost and r is the yearly return (A × 10 when r = 0)',
    ],
    body: [
      'Subscriptions are built to feel small. A $10 streaming plan, a $15 music and cloud bundle and a $5 app do not look like much on a single bill, but together they cost $30 a month, which is $360 a year. This calculator turns every price into a yearly cost so you can see the real number.',
      'To compare different billing cycles, convert each one to a year. A weekly charge is paid 52 times, a monthly charge 12 times and a yearly charge once. Add the results for the yearly total, then divide by 12 for the monthly figure or by 52 for the weekly one. Adding a $120 yearly plan to the example above brings the total to $480 a year, or $40 a month.',
      'The last result is a what-if. It assumes you put one year of subscription cost into an investment at the end of each year for 10 years, earning the return you choose (7% by default). At 7%, $360 a year grows to about $4,974. That return is an assumption, not a promise: real returns vary from year to year and can be negative. Set the return to 0% to see plain saving instead, where $360 a year is $3,600 over 10 years.',
      'This is not a case for cancelling everything. Many subscriptions are worth what they cost. The point is to see the total and decide on purpose. Weekly charges are the easiest to miss, because $2 a week looks tiny and is $104 a year.',
    ],
    sections: [
      {
        heading: 'How to run a quick subscription audit',
        paragraphs: [
          'Scan your last two or three bank or card statements for repeat charges, including small ones and annual renewals. Enter each one here, then ask of each: did I use it this month, and would I sign up again today?',
          'Cancel or pause what you would not buy again. Moving a plan from monthly to yearly billing sometimes lowers the cost, so check, but only if you are sure you will keep it for the full year.',
        ],
      },
    ],
    faq: [
      { q: 'How much do $10, $15 and $5 monthly subscriptions cost a year?', a: 'Together they cost $30 a month. Multiplied by 12, that is $360 a year, or about $6.92 a week.' },
      { q: 'How do I compare weekly, monthly and yearly prices?', a: 'Convert each to a year: weekly × 52, monthly × 12 and yearly × 1. Add them up, then divide by 12 for a monthly figure. For example, $10 + $15 + $5 monthly plus a $120 yearly plan is $480 a year, or $40 a month.' },
      { q: 'What does a $2 weekly subscription cost?', a: '$2 × 52 = $104 a year, which is about $8.67 a month.' },
      { q: 'What could I have if I invested the money instead?', a: 'At the default 7% return, $360 a year put aside at the end of each of 10 years grows to about $4,974, of which $3,600 is your own money. The return is an assumption, not a promise, and actual results will differ.' },
      { q: 'What if I set the return to 0%?', a: 'Then there is no growth and the result is simply the yearly cost × 10. For $360 a year that is $3,600.' },
      { q: 'Does the calculator include tax or price rises?', a: 'No. It uses the price you enter, so include any tax your bill shows. Prices that rise over time would make the true cost higher.' },
    ],
    sources: [
      { label: 'CFPB: Budgeting and saving tools', url: 'https://www.consumerfinance.gov/consumer-tools/' },
      { label: 'Investor.gov: Compound interest calculator', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
    ],
  },
  related: ['savings-goal', 'compound-interest', 'rule-of-72', 'savings-challenge'],
  examples: [
    {
      // 10 + 15 + 5 monthly = 30 a month; × 12 = 360 a year; weekly 360 ÷ 52 = 6.9231;
      // invested 360 × (1.07^10 − 1) ÷ 0.07 = 360 × 13.816448 = 4,973.92.
      values: { p1: 10, f1: 'monthly', p2: 15, f2: 'monthly', p3: 5, f3: 'monthly', rate: 7 },
      expect: { annual: 360, monthly: 30, weekly: 6.9231, invested: 4973.92 },
      tolerance: 1e-2,
    },
    {
      // Add 120 yearly: 360 + 120 = 480 a year; 480 ÷ 12 = 40 a month; 480 ÷ 52 = 9.2308;
      // invested 480 × 13.816448 = 6,631.90.
      values: { p1: 10, f1: 'monthly', p2: 15, f2: 'monthly', p3: 5, f3: 'monthly', p4: 120, f4: 'yearly', rate: 7 },
      expect: { annual: 480, monthly: 40, weekly: 9.2308, invested: 6631.9 },
      tolerance: 1e-2,
    },
    {
      // $2 a week × 52 = 104 a year; 104 ÷ 12 = 8.6667 a month; 104 ÷ 52 = 2 a week; at 0% invested = 104 × 10 = 1,040.
      values: { p1: 2, f1: 'weekly', rate: 0 },
      expect: { annual: 104, monthly: 8.6667, weekly: 2, invested: 1040 },
      tolerance: 1e-3,
    },
    {
      // 360 a year at 0%: 360 × 10 = 3,600.
      values: { p1: 30, f1: 'monthly', rate: 0 },
      expect: { annual: 360, monthly: 30, weekly: 6.9231, invested: 3600 },
      tolerance: 1e-3,
    },
  ],
});
