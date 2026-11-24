import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'tips-deduction',
  title: 'No Tax on Tips Deduction Calculator',
  category: 'finance',
  description: 'Estimate the federal deduction for qualified tips and the income tax it saves. Cap, income limit and tax rate are inputs. Payroll tax is not reduced.',
  keywords: ['no tax on tips calculator', 'tips deduction calculator', 'how much will no tax on tips save me', 'tip income tax deduction 2026', 'server bartender tax deduction'],
  updated: '2026-11-24',
  inputs: [
    { id: 'tips', label: 'Qualified tips this year', type: 'number', prefix: '$', default: 15000, min: 0, step: 500, info: 'Tips that count under the rule, from your pay records or tip log.' },
    { id: 'cap', label: 'Deduction cap', type: 'number', prefix: '$', default: 25000, min: 0, step: 500, info: 'The yearly limit as reported. Check the IRS page before relying on it.' },
    { id: 'income', label: 'Modified adjusted gross income', type: 'number', prefix: '$', default: 60000, min: 0, step: 5000, info: 'Your income for the phase-out test.' },
    { id: 'threshold', label: 'Phase-out starts at', type: 'number', prefix: '$', default: 150000, min: 0, step: 5000, info: '$150,000 reported for single filers, $300,000 for joint. Confirm yours.' },
    { id: 'step', label: 'Reduction per $1,000 over', type: 'number', prefix: '$', default: 100, min: 0, step: 10, info: 'How much the deduction drops for each $1,000 (or part) over the threshold.' },
    { id: 'taxRate', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 12, min: 0, max: 50, step: 1, info: 'Your federal bracket. Turns the deduction into income tax saved.' },
  ],
  outputs: [
    { id: 'saved', label: 'Estimated income tax saved', format: 'currency', primary: true, info: 'Deduction × marginal rate.' },
    { id: 'deduction', label: 'Deduction after cap and phase-out', format: 'currency', info: 'Smaller of tips and cap, minus any phase-out.' },
    { id: 'reduction', label: 'Phase-out reduction', format: 'currency', info: 'Reduction per $1,000 × each $1,000 over the threshold, rounded up.' },
    { id: 'payroll', label: 'Payroll tax still due on tips', format: 'currency', info: 'Tips × 7.65%. The deduction does not remove Social Security and Medicare tax.' },
  ],
  compute: (v) => {
    const tips = num(v.tips), cap = num(v.cap), inc = num(v.income), th = num(v.threshold), st = num(v.step), t = num(v.taxRate);
    if ([tips, cap, inc, th, st, t].some((x) => x === null)) return { saved: null };
    if ([tips, cap, inc, th, st, t].some((x) => (x as number) < 0)) return { saved: null, error: 'Values cannot be negative.' };
    if ((t as number) > 50) return { saved: null, error: 'Enter a tax rate of 50% or less.' };
    const capped = Math.min(tips as number, cap as number);
    const over = Math.max(0, (inc as number) - (th as number));
    const reduction = Math.ceil(over / 1000) * (st as number);
    const deduction = Math.max(0, capped - reduction);
    const saved = deduction * (t as number) / 100;
    const payroll = (tips as number) * 0.0765;
    return {
      saved, deduction, reduction, payroll,
      tone: saved > 0 ? 'good' : 'warn',
      badge: saved > 0 ? `Deduction ${usd(deduction)}, tax saved ${usd(saved)}` : 'No deduction at these numbers',
      chart: {
        type: 'bar',
        title: 'From tips to tax saved',
        categories: ['Tips', 'Deduction', 'Tax saved'],
        series: [{ name: 'Amount', values: [tips as number, deduction, saved] }],
        format: { format: 'currency' },
      },
      steps: [
        `Capped at ${usd(cap as number)}: min(${usd(tips as number)}, ${usd(cap as number)}) = ${usd(capped)}`,
        `Phase-out: ${usd(reduction)}, so deduction = ${usd(deduction)}`,
        `Tax saved: ${usd(deduction)} × ${t}% = ${usd(saved)}`,
        `Payroll tax still due: ${usd(tips as number)} × 7.65% = ${usd(payroll)}`,
      ],
      note: 'The cap, income limit and phase-out rate are inputs because they depend on your filing status and the final IRS rules. Which tips qualify depends on your job. Check irs.gov. This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'Deduction = max(0, min(tips, cap) − reduction per $1,000 × each $1,000 over the income threshold, rounded up)',
      'Income tax saved = deduction × marginal tax rate',
      'Payroll tax on tips = tips × 7.65% (employee share, unchanged by the deduction)',
    ],
    body: [
      'Recent federal law lets workers in jobs that customarily receive tips deduct qualified tip income, up to a yearly cap. The deduction lowers taxable income, so it saves your marginal rate times the amount.',
      'Enter your tips, the cap and your income. The calculator applies the cap and any income phase-out, then shows the income tax saved. It also shows the payroll tax still owed, because the deduction does not cancel Social Security and Medicare tax.',
      'The rules are new, so every limit is editable. Check them on the IRS page linked below before you plan around the answer.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: '$15,000 of tips is under the $25,000 cap and income of $60,000 is under $150,000, so the deduction is $15,000. At 12% that saves $1,800. Payroll tax on the tips is still $15,000 × 7.65% = $1,147.50.' },
      { q: 'Are tips now tax free?', a: 'Not entirely. The deduction removes qualified tips from federal income tax, up to the cap. Payroll tax still applies and state rules vary.' },
      { q: 'How does the phase-out work here?', a: 'For each $1,000 (or part) of income over the threshold, the deduction drops by the reduction amount. At $160,000 with a $150,000 threshold and $100 per $1,000, the reduction is $1,000.' },
      { q: 'Do all tips qualify?', a: 'No. The job must customarily receive tips and the tips must be voluntary. This calculator trusts the figure you enter.' },
    ],
    sources: [
      { label: 'IRS: Tax information on tips and overtime deductions', url: 'https://www.irs.gov/node/157206' },
    ],
  },
  related: ['overtime-deduction', 'bracket-headroom', 'tax-refund-estimator'],
  examples: [
    // under cap, no phase-out: deduction 15000; saved 1800; payroll 1147.5
    { values: { tips: 15000, cap: 25000, income: 60000, threshold: 150000, step: 100, taxRate: 12 }, expect: { saved: 1800, deduction: 15000, reduction: 0, payroll: 1147.5 }, tolerance: 0.01 },
    // tips 30000 -> cap 25000; over 10000 -> 10*100=1000; deduction 24000; saved 24000*.22=5280; payroll 2295
    { values: { tips: 30000, cap: 25000, income: 160000, threshold: 150000, step: 100, taxRate: 22 }, expect: { saved: 5280, deduction: 24000, reduction: 1000, payroll: 2295 }, tolerance: 0.01 },
  ],
});
