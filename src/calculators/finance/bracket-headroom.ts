import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'bracket-headroom',
  title: 'Tax Bracket Headroom Calculator',
  category: 'finance',
  description: 'How much more income can you add before it is taxed at the next rate? Enter your taxable income and bracket to see your headroom and the tax on extra income.',
  keywords: ['tax bracket headroom', 'how much income before next tax bracket', 'fill the bracket calculator', 'marginal tax on bonus', 'tax bracket calculator extra income', 'room left in tax bracket'],
  updated: '2026-11-24',
  inputs: [
    { id: 'income', label: 'Taxable income so far', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'Income after deductions, from your tax return or an estimate.' },
    { id: 'top', label: 'Top of your current bracket', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, info: 'Taxable income where the next rate starts. Check the current brackets for your filing status on irs.gov.' },
    { id: 'rate', label: 'Current bracket rate', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 1, info: 'The federal rate on your last dollar of income now.' },
    { id: 'next', label: 'Next bracket rate', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 1, info: 'The federal rate that starts above the top of your bracket.' },
    { id: 'extra', label: 'Extra income to test', type: 'number', prefix: '$', default: 30000, min: 0, step: 1000, info: 'A bonus, Roth conversion, freelance invoice or other income.' },
  ],
  outputs: [
    { id: 'tax', label: 'Tax on the extra income', format: 'currency', primary: true, info: 'Part inside the bracket at the current rate, the rest at the next rate.' },
    { id: 'headroom', label: 'Headroom left in bracket', format: 'currency', info: 'Top of bracket − taxable income, never below 0.' },
    { id: 'avg', label: 'Average rate on the extra', format: 'percent', info: 'Tax ÷ extra income.' },
    { id: 'inside', label: 'Extra taxed at current rate', format: 'currency', info: 'The smaller of the extra income and the headroom.' },
    { id: 'over', label: 'Extra taxed at next rate', format: 'currency', info: 'Extra income above the headroom.' },
  ],
  compute: (v) => {
    const income = num(v.income), top = num(v.top), rate = num(v.rate), next = num(v.next), extra = num(v.extra);
    if ([income, top, rate, next, extra].some((x) => x === null)) return { tax: null };
    if ([income, top, rate, next, extra].some((x) => (x as number) < 0)) return { tax: null, error: 'Values cannot be negative.' };
    if ((rate as number) > 100 || (next as number) > 100) return { tax: null, error: 'Rates cannot be above 100%.' };
    if ((extra as number) === 0) return { tax: null, note: 'Enter some extra income to test.' };
    const headroom = Math.max(0, (top as number) - (income as number));
    const inside = Math.min(extra as number, headroom);
    const over = Math.max(0, (extra as number) - headroom);
    const tax = inside * ((rate as number) / 100) + over * ((next as number) / 100);
    const avg = tax / (extra as number);
    return {
      tax, headroom, avg, inside, over,
      tone: over > 0 ? 'warn' : 'good',
      badge: over > 0 ? `${usd(over)} spills into the ${next}% bracket` : `All of it stays at ${rate}%`,
      chart: {
        type: 'bar',
        title: 'How the extra ' + usd(extra as number) + ' is taxed',
        categories: ['At current rate', 'At next rate'],
        series: [{ name: 'Income', values: [inside, over] }],
        format: { format: 'currency' },
      },
      steps: [
        `Headroom: ${usd(top as number)} − ${usd(income as number)} = ${usd(headroom)}`,
        `Inside the bracket: ${usd(inside)} × ${rate}% = ${usd(inside * (rate as number) / 100)}`,
        `Above the bracket: ${usd(over)} × ${next}% = ${usd(over * (next as number) / 100)}`,
        `Total: ${usd(tax)}, an average of ${(avg * 100).toFixed(2)}% on the extra income`,
      ],
      note: 'Federal ordinary income only. It ignores credits, phase-outs, payroll tax and state tax, and assumes the extra income is taxed as ordinary income. Bracket limits depend on your filing status and tax year, so enter them from irs.gov.',
    };
  },
  content: {
    formula: [
      'Headroom = top of bracket − taxable income (not below 0)',
      'Tax = min(extra, headroom) × current rate + max(0, extra − headroom) × next rate',
      'Average rate = tax ÷ extra income',
    ],
    body: [
      'Tax brackets are marginal: only the income above a threshold is taxed at the higher rate. Headroom is how much more you can earn before the next rate starts.',
      'Knowing it helps with year-end choices, such as when to take a bonus or invoice, or how much to convert to a Roth IRA. Filling the current bracket without crossing it keeps those dollars at the lower rate.',
      'Enter the bracket top and rates from the current IRS tables for your filing status. They change each year, so this calculator does not guess them.',
      'The result covers federal ordinary income tax only. Credits, deductions that phase out, payroll tax and state tax can change the real cost.',
    ],
    faq: [
      { q: 'How much extra income can I add before the next bracket?', a: 'Subtract your taxable income from the top of your bracket. With $80,000 of income and a $100,000 bracket top, the headroom is $20,000.' },
      { q: 'What is the tax on $30,000 of extra income in that example?', a: '$20,000 at 22% is $4,400 and the other $10,000 at 24% is $2,400, so $6,800, an average of 22.67%.' },
      { q: 'Does crossing a bracket tax all my income at the higher rate?', a: 'No. Only the dollars above the threshold are taxed at the higher rate.' },
      { q: 'Does this include state or payroll tax?', a: 'No. It is federal ordinary income tax only.' },
      { q: 'Where do I find the bracket numbers?', a: 'On irs.gov, in the current tax-year brackets for your filing status. Enter the top of your bracket yourself.' },
    ],
    sources: [
      { label: 'IRS: Federal income tax rates and brackets', url: 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets' },
    ],
  },
  related: ['roth-conversion', 'gains-harvest-headroom', 'income-tax'],
  examples: [
    // headroom 20000; 20000×.22=4400; 10000×.24=2400; 6800; avg 6800/30000
    { values: { income: 80000, top: 100000, rate: 22, next: 24, extra: 30000 }, expect: { headroom: 20000, tax: 6800, avg: 6800 / 30000, inside: 20000, over: 10000 }, tolerance: 0.0001 },
    // extra fits: 5000×.12=600
    { values: { income: 40000, top: 50000, rate: 12, next: 22, extra: 5000 }, expect: { tax: 600, over: 0, headroom: 10000 }, tolerance: 0.01 },
    // already past top: headroom 0; 10000×.24=2400
    { values: { income: 120000, top: 100000, rate: 22, next: 24, extra: 10000 }, expect: { headroom: 0, tax: 2400, inside: 0 }, tolerance: 0.01 },
  ],
});
