import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'tip-pool-split',
  title: 'Tip Pool Split Calculator (by Hours Worked)',
  category: 'everyday',
  description: 'Split a shared tip pool by hours worked, with an optional tip-out taken from sales first. See the rate per hour and what each person takes home.',
  keywords: ['tip pool calculator', 'tip split by hours', 'tip out calculator', 'how to split tips', 'restaurant tip pool', 'tip share per hour'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'pool', label: 'Pooled tips', type: 'number', default: 480, min: 0, step: 10, prefix: '$', info: 'All tips collected into the pool for the shift or week.' },
    { id: 'h1', label: 'Person 1 hours', type: 'number', default: 8, min: 0, step: 0.25, suffix: 'h', info: 'Hours worked by the first person.' },
    { id: 'h2', label: 'Person 2 hours', type: 'number', default: 6, min: 0, step: 0.25, suffix: 'h', optional: true, info: 'Leave blank if there is no second person.' },
    { id: 'h3', label: 'Person 3 hours', type: 'number', default: 4, min: 0, step: 0.25, suffix: 'h', optional: true, info: 'Leave blank if there is no third person.' },
    { id: 'h4', label: 'Person 4 hours', type: 'number', min: 0, step: 0.25, suffix: 'h', optional: true, info: 'Leave blank if there is no fourth person.' },
    { id: 'sales', label: 'Sales the tip-out applies to', type: 'number', min: 0, step: 50, prefix: '$', optional: true, info: 'Optional. Sales that your venue\'s tip-out percentage is based on.' },
    { id: 'tipout', label: 'Tip-out rate', type: 'number', min: 0, max: 100, step: 0.5, suffix: '%', optional: true, info: 'Optional. Percent of sales shared with support staff. Your venue sets this.' },
  ],
  outputs: [
    { id: 'rate', label: 'Tips per hour', format: 'currency', primary: true, info: 'Pool after tip-out divided by total hours.' },
    { id: 'p1', label: 'Person 1 gets', format: 'currency', info: 'Hours × tips per hour.' },
    { id: 'p2', label: 'Person 2 gets', format: 'currency', info: 'Hours × tips per hour.' },
    { id: 'p3', label: 'Person 3 gets', format: 'currency', info: 'Hours × tips per hour.' },
    { id: 'p4', label: 'Person 4 gets', format: 'currency', info: 'Hours × tips per hour.' },
    { id: 'out', label: 'Tip-out', format: 'currency', info: 'Sales × tip-out rate, taken from the pool first.' },
    { id: 'hours', label: 'Total hours', format: 'number', precision: 2, info: 'Sum of everyone\'s hours.' },
  ],
  compute: (v) => {
    const pool = num(v.pool);
    if (pool === null || pool < 0) return { rate: null, error: 'Enter the pooled tips.' };
    const hs = [v.h1, v.h2, v.h3, v.h4].map((x) => (x === '' || x === undefined || x === null ? 0 : num(x)));
    if (hs.some((h) => h === null || h < 0)) return { rate: null, error: 'Hours cannot be negative.' };
    const hours = (hs as number[]);
    const total = hours.reduce((a, b) => a + b, 0);
    if (total <= 0) return { rate: null, error: 'Enter hours for at least one person.' };
    const salesRaw = v.sales === '' || v.sales === undefined || v.sales === null ? 0 : num(v.sales);
    const pctRaw = v.tipout === '' || v.tipout === undefined || v.tipout === null ? 0 : num(v.tipout);
    if (salesRaw === null || salesRaw < 0 || pctRaw === null || pctRaw < 0 || pctRaw > 100) return { rate: null, error: 'Enter sales and a tip-out rate between 0 and 100%.' };
    const out = salesRaw * (pctRaw / 100);
    if (out > pool) return { rate: null, error: 'The tip-out is larger than the pool. Check the sales and rate.' };
    const left = pool - out;
    const rate = left / total;
    const shares = hours.map((h) => h * rate);
    return {
      rate,
      p1: shares[0],
      p2: shares[1],
      p3: shares[2],
      p4: shares[3],
      out,
      hours: total,
      tone: 'ok',
      badge: `$${fmt(rate)} per hour`,
      note: `$${fmt(left)} is split across ${fmt(total)} hours. Which staff are in the pool, and how tip-out works, is set by your venue's policy and local law.`,
      chart: {
        type: 'bar' as const,
        title: 'Take-home from the pool',
        categories: ['Person 1', 'Person 2', 'Person 3', 'Person 4'],
        series: [{ name: 'Share', values: shares }],
        format: { format: 'currency' },
      },
      steps: [
        `Tip-out = $${fmt(salesRaw)} × ${fmt(pctRaw, 1)}% = $${fmt(out)}; pool left = $${fmt(left)}`,
        `Rate = $${fmt(left)} ÷ ${fmt(total)} h = $${fmt(rate)} per hour`,
        `Each share = hours × $${fmt(rate)}; the shares add up to $${fmt(left)}`,
      ],
    };
  },
  content: {
    formula: ['Tip-out = sales × tip-out rate', 'Rate per hour = (pool − tip-out) ÷ total hours', 'Share = hours worked × rate per hour'],
    body: [
      'A tip pool splits tips by time worked rather than by who served which table. Add up everyone\'s hours, divide the pool by that total to get a rate per hour, then multiply each person\'s hours by it.',
      'Example: a $480 pool with 8, 6 and 4 hours worked is 18 hours in total. The rate is 480 ÷ 18 = $26.67 an hour, so the shares are $213.33, $160.00 and $106.67. If your venue takes a tip-out of 3% of $1,200 sales, $36.00 comes off the pool first.',
      'Who may join a pool, and whether tip-out is based on sales or tips, depends on your employer\'s policy and local law, so treat this as arithmetic, not legal advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do you split a tip pool by hours?', a: 'Divide the pool by total hours to get a rate per hour, then multiply each person\'s hours by it. $480 over 18 hours is $26.67 an hour.' },
      { q: 'What is a tip-out?', a: 'A share of sales or tips that servers pass to support staff such as bussers or bartenders. The percentage is set by the venue. 3% of $1,200 in sales is $36.00.' },
      { q: 'Is the tip-out taken before or after the split?', a: 'Here it is taken from the pool first, then the rest is split by hours. Your venue may do it differently.' },
      { q: 'Who can be in a tip pool?', a: 'That depends on your employer\'s policy and local law. This calculator does not decide who is eligible.' },
      { q: 'Can I use it for more than four people?', a: 'Not directly. Add up hours for a group and treat them as one row, or run a second pool.' },
    ],
    sources: [
      { label: 'U.S. Department of Labor: Tips', url: 'https://www.dol.gov/agencies/whd/fact-sheets/15-flsa-tipped-employees' },
    ],
  },
  related: ['tip', 'bill-splitter', 'holiday-tipping-budget'],
  examples: [
    // 480/18 = 26.666667; 8*r = 213.333333; 6*r = 160; 4*r = 106.666667
    { values: { pool: 480, h1: 8, h2: 6, h3: 4 }, expect: { rate: 26.666667, p1: 213.333333, p2: 160, p3: 106.666667, out: 0, hours: 18 }, tolerance: 1e-5 },
    // $300 pool, 1200 sales * 3% = 36 out; 264 left; one person 5 h -> 52.8/h, 264
    { values: { pool: 300, h1: 5, sales: 1200, tipout: 3 }, expect: { rate: 52.8, p1: 264, out: 36, hours: 5 }, tolerance: 1e-5 },
  ],
});
