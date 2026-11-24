import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'senior-deduction',
  title: 'Senior Deduction Calculator (Extra $6,000)',
  category: 'finance',
  description: 'Estimate the extra deduction for people 65 and older after the income phase-out, and the federal tax it saves. Amount, threshold and rate are editable inputs.',
  keywords: ['senior deduction calculator', 'extra $6000 deduction age 65', 'senior bonus deduction phase out', 'over 65 deduction 2026', 'senior deduction tax savings'],
  updated: '2026-11-24',
  inputs: [
    { id: 'people', label: 'People on the return aged 65 or older', type: 'number', default: 1, min: 0, max: 2, step: 1, info: '1 for a single filer, up to 2 for a joint return.' },
    { id: 'magi', label: 'Modified adjusted gross income', type: 'number', prefix: '$', default: 90000, min: 0, step: 1000, info: 'Your income for the phase-out test, usually AGI.' },
    { id: 'amount', label: 'Extra deduction per person', type: 'number', prefix: '$', default: 6000, min: 0, step: 500, info: 'The yearly amount per eligible person. Check the IRS page.' },
    { id: 'threshold', label: 'Phase-out starts at', type: 'number', prefix: '$', default: 75000, min: 0, step: 5000, info: '$75,000 single, $150,000 joint in the rule as reported. Check the IRS page.' },
    { id: 'rate', label: 'Phase-out rate', type: 'number', suffix: '%', default: 6, min: 0, max: 100, step: 1, info: 'Deduction falls by this share of income above the threshold.' },
    { id: 'bracket', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 50, step: 1, info: 'Your federal bracket on ordinary income.' },
  ],
  outputs: [
    { id: 'deduction', label: 'Extra deduction you keep', format: 'currency', primary: true, info: 'Full amount minus the phase-out reduction, never below zero.' },
    { id: 'saved', label: 'Federal tax saved', format: 'currency', info: 'Deduction × marginal tax rate.' },
    { id: 'reduction', label: 'Lost to the phase-out', format: 'currency', info: 'Phase-out rate × income above the threshold, capped at the full amount.' },
    { id: 'full', label: 'Full deduction before phase-out', format: 'currency', info: 'People × amount per person.' },
  ],
  compute: (v) => {
    const n = num(v.people), m = num(v.magi), a = num(v.amount), t = num(v.threshold), r = num(v.rate), b = num(v.bracket);
    if ([n, m, a, t, r, b].some((x) => x === null)) return { deduction: null };
    if ([n, m, a, t, r, b].some((x) => (x as number) < 0)) return { deduction: null, error: 'Values cannot be negative.' };
    if ((n as number) > 2 || (r as number) > 100 || (b as number) > 50) return { deduction: null, error: 'Use 0 to 2 people, a phase-out rate up to 100% and a tax rate up to 50%.' };
    const full = (n as number) * (a as number);
    const reduction = Math.min(full, Math.max(0, (m as number) - (t as number)) * (r as number) / 100);
    const deduction = full - reduction;
    const saved = deduction * (b as number) / 100;
    return {
      deduction, saved, reduction, full,
      tone: 'good',
      badge: full === 0 ? 'No eligible people' : `${usd(deduction)} deduction, ${usd(saved)} saved`,
      chart: {
        type: 'bar',
        title: 'Extra deduction: full vs kept',
        categories: ['Full', 'Kept'],
        series: [{ name: 'Deduction', values: [full, deduction] }],
        format: { format: 'currency' },
      },
      steps: [
        `Full deduction: ${n} × ${usd(a as number)} = ${usd(full)}`,
        `Phase-out: (${usd(m as number)} − ${usd(t as number)}) × ${r}% = ${usd(reduction)}`,
        `Deduction kept: ${usd(full)} − ${usd(reduction)} = ${usd(deduction)}`,
        `Tax saved: ${usd(deduction)} × ${b}% = ${usd(saved)}`,
      ],
      note: 'Enter the amount, threshold and rate from the IRS page, since the rules are temporary and were not confirmed here. It ignores the regular standard deduction, the older extra amount for age 65+, state tax and eligibility details such as a valid Social Security number. This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'Full deduction = people aged 65+ × amount per person',
      'Reduction = max(0, income − threshold) × phase-out rate, capped at the full deduction',
      'Deduction kept = full deduction − reduction',
      'Tax saved = deduction kept × marginal tax rate',
    ],
    body: [
      'A temporary rule gives people aged 65 and older an extra deduction on top of the standard deduction. It shrinks as income rises above a threshold, so higher earners keep less of it.',
      'Enter how many people on the return qualify, your income and your bracket. The calculator applies the phase-out and shows the tax saved.',
      'The amount, threshold and rate are editable because rules change. Check them on the IRS page before you rely on the result.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'One person with $90,000 of income: the $6,000 deduction falls by 6% × $15,000 = $900 to $5,100. At 22% that saves $1,122.' },
      { q: 'What about a couple?', a: 'Two eligible people on a joint return start at $12,000. At $170,000 of income, with a $150,000 threshold, the reduction is $1,200, leaving $10,800 and saving $2,376 at 22%.' },
      { q: 'When does it disappear?', a: 'At a 6% rate, a $6,000 deduction is gone when income is $100,000 above the threshold, since 6% × $100,000 = $6,000.' },
      { q: 'Is this the same as the extra standard deduction for age 65?', a: 'No. This is a separate extra amount. This calculator does not compute the regular standard deduction.' },
    ],
    sources: [
      { label: 'IRS: Standard deduction', url: 'https://www.irs.gov/taxtopics/tc551' },
    ],
  },
  related: ['bracket-headroom', 'standard-vs-itemized', 'capital-loss-carryover'],
  examples: [
    // 6000 - 0.06*15000 = 5100; saved 1122
    { values: { people: 1, magi: 90000, amount: 6000, threshold: 75000, rate: 6, bracket: 22 }, expect: { deduction: 5100, saved: 1122, reduction: 900, full: 6000 }, tolerance: 0.01 },
    // 12000 - 0.06*20000 = 10800; saved 2376
    { values: { people: 2, magi: 170000, amount: 6000, threshold: 150000, rate: 6, bracket: 22 }, expect: { deduction: 10800, saved: 2376, reduction: 1200, full: 12000 }, tolerance: 0.01 },
    // fully phased out: 6% * 200000 = 12000 > 6000 -> reduction capped at 6000
    { values: { people: 1, magi: 275000, amount: 6000, threshold: 75000, rate: 6, bracket: 32 }, expect: { deduction: 0, saved: 0, reduction: 6000, full: 6000 }, tolerance: 0.01 },
  ],
});
