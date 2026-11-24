import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'overtime-deduction',
  title: 'Overtime Tax Deduction Calculator',
  category: 'finance',
  description: 'Estimate the federal deduction on the premium part of your overtime pay and the tax it saves. Cap, income limit and tax rate are inputs you can edit.',
  keywords: ['no tax on overtime calculator', 'overtime tax deduction calculator', 'how much will no tax on overtime save me', 'overtime deduction 2026', 'overtime premium deduction'],
  updated: '2026-11-24',
  inputs: [
    { id: 'hours', label: 'Overtime hours this year', type: 'number', suffix: 'hours', default: 200, min: 0, step: 10, info: 'Hours paid at the overtime rate that the law requires.' },
    { id: 'rate', label: 'Regular hourly pay', type: 'number', prefix: '$', default: 30, min: 0, step: 1, info: 'Your normal rate before overtime.' },
    { id: 'mult', label: 'Overtime pay multiplier', type: 'number', suffix: '×', default: 1.5, min: 1, max: 3, step: 0.25, info: '1.5 for time and a half. Only the part above 1.0× is the premium.' },
    { id: 'cap', label: 'Deduction cap', type: 'number', prefix: '$', default: 12500, min: 0, step: 500, info: 'The yearly limit as reported for single filers; $25,000 for joint returns. Check the IRS page before relying on it.' },
    { id: 'income', label: 'Modified adjusted gross income', type: 'number', prefix: '$', default: 80000, min: 0, step: 5000, info: 'Your income for the phase-out test.' },
    { id: 'threshold', label: 'Phase-out starts at', type: 'number', prefix: '$', default: 150000, min: 0, step: 5000, info: 'Income above this shrinks the deduction. Confirm the figure for your filing status.' },
    { id: 'step', label: 'Reduction per $1,000 over', type: 'number', prefix: '$', default: 100, min: 0, step: 10, info: 'How much the deduction drops for each $1,000 (or part of $1,000) over the threshold.' },
    { id: 'taxRate', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 50, step: 1, info: 'Your federal bracket. Turns the deduction into tax saved.' },
  ],
  outputs: [
    { id: 'saved', label: 'Estimated tax saved', format: 'currency', primary: true, info: 'Deduction × marginal rate.' },
    { id: 'deduction', label: 'Deduction after cap and phase-out', format: 'currency', info: 'Smaller of premium pay and cap, minus any phase-out.' },
    { id: 'premium', label: 'Overtime premium pay', format: 'currency', info: 'Hours × rate × (multiplier − 1).' },
    { id: 'reduction', label: 'Phase-out reduction', format: 'currency', info: 'Reduction per $1,000 × each $1,000 of income over the threshold, rounded up.' },
  ],
  compute: (v) => {
    const h = num(v.hours), r = num(v.rate), m = num(v.mult), cap = num(v.cap), inc = num(v.income), th = num(v.threshold), st = num(v.step), t = num(v.taxRate);
    if ([h, r, m, cap, inc, th, st, t].some((x) => x === null)) return { saved: null };
    if ([h, r, cap, inc, th, st, t].some((x) => (x as number) < 0)) return { saved: null, error: 'Values cannot be negative.' };
    if ((m as number) < 1) return { saved: null, error: 'The multiplier must be at least 1.' };
    if ((t as number) > 50) return { saved: null, error: 'Enter a tax rate of 50% or less.' };
    const premium = (h as number) * (r as number) * ((m as number) - 1);
    const capped = Math.min(premium, cap as number);
    const over = Math.max(0, (inc as number) - (th as number));
    const reduction = Math.ceil(over / 1000) * (st as number);
    const deduction = Math.max(0, capped - reduction);
    const saved = deduction * (t as number) / 100;
    return {
      saved, deduction, premium, reduction,
      tone: saved > 0 ? 'good' : 'warn',
      badge: saved > 0 ? `Deduction ${usd(deduction)}, tax saved ${usd(saved)}` : 'No deduction at these numbers',
      chart: {
        type: 'bar',
        title: 'From premium pay to tax saved',
        categories: ['Premium pay', 'Deduction', 'Tax saved'],
        series: [{ name: 'Amount', values: [premium, deduction, saved] }],
        format: { format: 'currency' },
      },
      steps: [
        `Premium: ${h} h × ${usd(r as number)} × (${m} − 1) = ${usd(premium)}`,
        `Capped at ${usd(cap as number)}: ${usd(capped)}`,
        `Phase-out: ${usd(reduction)}, so deduction = ${usd(deduction)}`,
        `Tax saved: ${usd(deduction)} × ${t}% = ${usd(saved)}`,
      ],
      note: 'The cap, income limit and phase-out rate are inputs because they depend on your filing status and the final IRS rules. Check them on irs.gov. Your employer’s reporting of qualified overtime may differ. This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'Premium = overtime hours × regular rate × (multiplier − 1)',
      'Deduction = max(0, min(premium, cap) − reduction per $1,000 × each $1,000 over the income threshold, rounded up)',
      'Tax saved = deduction × marginal tax rate',
    ],
    body: [
      'Recent federal law lets many workers deduct the extra half of time-and-a-half overtime pay, up to a yearly cap. Only the premium counts, not the whole overtime paycheck. A deduction lowers taxable income, so it saves your marginal rate times the amount.',
      'Enter your overtime hours, regular rate and multiplier, then the cap and income limit that apply to you. The result shows the premium pay, the deduction after the cap and phase-out, and the tax it saves.',
      'The rules are new, so the cap, threshold and phase-out are editable. Check them on the IRS page linked below before you plan around the answer.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: '200 hours × $30 × 0.5 = $3,000 of premium. It is under the $12,500 cap and income is below $150,000, so the deduction is $3,000. At 22% that saves $660.' },
      { q: 'Why only half of the overtime pay?', a: 'The deduction targets the premium: the part above your regular rate. At time and a half, that is one third of each overtime dollar, or 0.5 times your rate per hour. The multiplier input handles other rates.' },
      { q: 'How does the phase-out work here?', a: 'For each $1,000 (or part) of income over the threshold, the deduction drops by the amount in the reduction box. At $160,000 with a $150,000 threshold and $100 per $1,000, the reduction is 10 × $100 = $1,000.' },
      { q: 'Does this replace tax software?', a: 'No. It is a planning estimate. Your return decides what counts as qualified overtime.' },
    ],
    sources: [
      { label: 'IRS: Tax information on tips and overtime deductions', url: 'https://www.irs.gov/node/157211' },
    ],
  },
  related: ['overtime-pay', 'bracket-headroom', 'tax-refund-estimator'],
  examples: [
    // premium 200*30*.5=3000; cap ok; no phase-out; saved 660
    { values: { hours: 200, rate: 30, mult: 1.5, cap: 12500, income: 80000, threshold: 150000, step: 100, taxRate: 22 }, expect: { saved: 660, deduction: 3000, premium: 3000, reduction: 0 }, tolerance: 0.01 },
    // premium 1000*50*.5=25000; cap 12500; over 10000 -> 10*100=1000; deduction 11500; saved 2760
    { values: { hours: 1000, rate: 50, mult: 1.5, cap: 12500, income: 160000, threshold: 150000, step: 100, taxRate: 24 }, expect: { saved: 2760, deduction: 11500, premium: 25000, reduction: 1000 }, tolerance: 0.01 },
  ],
});
