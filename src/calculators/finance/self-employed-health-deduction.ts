import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'self-employed-health-deduction',
  title: 'Self-Employed Health Insurance Deduction',
  category: 'finance',
  description: 'Estimate the self-employed health insurance deduction from your premiums, net profit and self-employment tax, and the income tax it saves at your marginal rate.',
  keywords: ['self-employed health insurance deduction', 'health insurance deduction calculator', 'freelancer health premium tax saving', 'self employed premiums deductible', 'schedule 1 health insurance'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'premiums', label: 'Health premiums paid for the year', type: 'number', prefix: '$', default: 7200, min: 0, step: 50, info: 'What you paid for yourself, spouse and dependents.' },
    { id: 'profit', label: 'Net self-employment profit', type: 'number', prefix: '$', default: 70000, min: 0, step: 500, info: 'Business profit for the year, after expenses.' },
    { id: 'setax', label: 'Self-employment tax paid', type: 'number', prefix: '$', default: 9891, min: 0, step: 10, info: 'Your self-employment tax. Half of it is taken off the profit limit.' },
    { id: 'rate', label: 'Marginal income tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 0.5, info: 'Your top federal bracket.' },
  ],
  outputs: [
    { id: 'deduction', label: 'Deduction', format: 'currency', precision: 2, primary: true, info: 'The smaller of your premiums and the profit limit.' },
    { id: 'saved', label: 'Income tax saved', format: 'currency', precision: 2, info: 'Deduction × marginal rate.' },
    { id: 'limit', label: 'Profit limit', format: 'currency', precision: 2, info: 'Profit − half of self-employment tax, never below zero.' },
    { id: 'unused', label: 'Premiums not deducted', format: 'currency', precision: 2, info: 'Premiums − deduction.' },
  ],
  compute: (v) => {
    const prem = num(v.premiums);
    const profit = num(v.profit);
    const se = num(v.setax);
    const rate = num(v.rate);
    if (prem === null || profit === null || se === null || rate === null) return { deduction: null };
    if (prem < 0 || profit < 0 || se < 0 || rate < 0 || rate > 100) return { deduction: null };
    const limit = Math.max(0, profit - se / 2);
    const deduction = Math.min(prem, limit);
    const unused = prem - deduction;
    const saved = (deduction * rate) / 100;
    return {
      deduction,
      saved,
      limit,
      unused,
      tone: unused > 0 ? 'warn' : 'good',
      badge: unused > 0 ? `${money(unused)} of premiums not deducted` : 'All premiums deducted',
      note: `You can deduct ${money(deduction)}, which saves about ${money(saved)} at ${rate}%.${unused > 0 ? ' Profit limits the deduction.' : ''} Eligibility rules and the premium tax credit are not computed.`,
      chart: {
        type: 'bar' as const,
        title: 'Premiums: deducted vs not',
        categories: ['Deducted', 'Not deducted'],
        series: [{ name: 'Premiums', values: [deduction, unused] }],
        format: CURRENCY,
        highlight: 0,
      },
      steps: [
        `Limit = ${money(profit)} − ${money(se)} ÷ 2 = ${money(limit)}`,
        `Deduction = smaller of ${money(prem)} and ${money(limit)} = ${money(deduction)}`,
        `Tax saved = ${money(deduction)} × ${rate}% = ${money(saved)}`,
      ],
    };
  },
  content: {
    formula: [
      'Limit = max(0, net profit − self-employment tax ÷ 2)',
      'Deduction = smaller of premiums and limit',
      'Unused = premiums − deduction',
      'Tax saved = deduction × marginal rate',
    ],
    body: [
      'Self-employed people can often deduct health insurance premiums, but the deduction cannot exceed the profit from the business. This page applies that cap and shows the income tax the deduction saves at your rate.',
      'Example: $70,000 profit and $9,891 of self-employment tax give a limit of $65,054.50. Premiums of $7,200 are under it, so all $7,200 is deducted, saving $1,584.00 at 22%. Another: $6,000 profit, $848 tax and $9,600 premiums give a limit of $5,576, so $5,576 is deducted, $4,024 is not, and 12% saves $669.12.',
      'Eligibility, for example being able to join an employer plan, and the premium tax credit interaction are not computed. Check the rules on irs.gov or with a tax professional; this is not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Why subtract half of self-employment tax?', a: 'That half is already deducted elsewhere, so this calculator removes it from the profit limit.' },
      { q: 'Does this save self-employment tax too?', a: 'No. It only estimates income tax saved at the marginal rate you enter.' },
      { q: 'What if my premiums exceed the limit?', a: 'The deduction is capped at the limit and the rest is shown as not deducted.' },
      { q: 'Does this check my eligibility?', a: 'No. Eligibility and the premium tax credit are not computed.' },
    ],
    sources: [],
  },
  related: ['self-employment-tax', 'marketplace-subsidy', 'write-off-value'],
  examples: [
    // limit 70000-4945.5=65054.5; ded 7200; saved 1584
    { values: { premiums: 7200, profit: 70000, setax: 9891, rate: 22 }, expect: { deduction: 7200, saved: 1584, limit: 65054.5, unused: 0 } },
    // limit 6000-424=5576; ded 5576; unused 4024; saved 669.12
    { values: { premiums: 9600, profit: 6000, setax: 848, rate: 12 }, expect: { deduction: 5576, saved: 669.12, limit: 5576, unused: 4024 } },
  ],
});
