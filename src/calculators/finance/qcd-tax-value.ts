import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'qcd-tax-value',
  title: 'QCD Tax Savings Calculator',
  category: 'finance',
  description: 'See how much tax a qualified charitable distribution (QCD) from your IRA saves versus withdrawing cash and donating it. Enter gift, limit and rate.',
  keywords: ['qcd calculator', 'qualified charitable distribution calculator', 'qcd vs cash donation', 'ira charitable distribution tax savings', 'qcd limit'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'gift', label: 'Amount you want to give', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The total you plan to give to charity from your IRA.' },
    { id: 'limit', label: 'Annual QCD limit', type: 'number', prefix: '$', default: 108000, min: 0, step: 1000, info: 'The most you can send as a QCD this year. The IRS adjusts it for inflation, so check the current figure.' },
    { id: 'rate', label: 'Marginal tax rate', type: 'number', suffix: '%', default: 24, min: 0, max: 60, step: 1, info: 'Your federal rate on the last dollar of income.' },
    { id: 'deduct', label: 'Share of a cash gift you could deduct', type: 'number', suffix: '%', default: 0, min: 0, max: 100, step: 5, info: 'Use 0 if you take the standard deduction, so a cash gift saves nothing. Use 100 if you itemize and the full gift would be deductible.' },
  ],
  outputs: [
    { id: 'saved', label: 'Tax saved by using a QCD', format: 'currency', precision: 2, primary: true, info: 'Eligible QCD × rate × (1 − deductible share).' },
    { id: 'eligible', label: 'Amount that counts as a QCD', format: 'currency', precision: 2, info: 'The smaller of your gift and the annual limit.' },
    { id: 'excess', label: 'Above the limit', format: 'currency', precision: 2, info: 'Any part of the gift over the limit, which would be a normal taxable withdrawal.' },
  ],
  compute: (v) => {
    const gift = num(v.gift);
    const limit = num(v.limit);
    const rate = num(v.rate);
    const ded = num(v.deduct);
    if ([gift, limit, rate, ded].some((x) => x === null)) return { saved: null };
    if ([gift, limit, rate, ded].some((x) => (x as number) < 0)) return { saved: null, error: 'Values cannot be negative.' };
    if (rate! > 60) return { saved: null, error: 'Use a marginal rate of 60% or less.' };
    if (ded! > 100) return { saved: null, error: 'The deductible share cannot be over 100%.' };
    const eligible = Math.min(gift!, limit!);
    const excess = gift! - eligible;
    const cashTax = eligible * (rate! / 100);
    const offset = cashTax * (ded! / 100);
    const saved = cashTax - offset;
    return {
      saved,
      eligible,
      excess,
      tone: saved > 0 ? 'good' : 'ok',
      badge: saved > 0 ? `Saves ${money(saved)}` : 'No tax difference',
      note: saved > 0
        ? `Giving ${money(eligible)} straight from your IRA keeps it out of your taxable income. Withdrawing it and giving cash would cost ${money(cashTax)} in tax${offset > 0 ? `, less ${money(offset)} from the deduction` : ''}.${excess > 0 ? ` ${money(excess)} is over the limit and would be taxable.` : ''} Age and account rules apply; this ignores state tax and other income effects.`
        : `With these inputs the deduction on a cash gift cancels out the tax, so the QCD saves nothing directly. A QCD can still lower your adjusted gross income, which this does not model.`,
      chart: {
        type: 'bar' as const,
        title: 'Federal tax on the gift',
        categories: ['Cash gift', 'QCD'],
        series: [{ name: 'Net tax', values: [cashTax - offset, 0] }],
        format: CURRENCY,
      },
      steps: [
        `Eligible QCD = smaller of ${money(gift!)} and ${money(limit!)} = ${money(eligible)}`,
        `Tax if withdrawn = ${money(eligible)} × ${rate}% = ${money(cashTax)}`,
        `Deduction offset = ${money(cashTax)} × ${ded}% = ${money(offset)}`,
        `Saved by QCD = ${money(cashTax)} − ${money(offset)} = ${money(saved)}`,
      ],
    };
  },
  content: {
    formula: [
      'Eligible QCD = smaller of your gift and the annual limit',
      'Tax on a cash gift = eligible × marginal rate',
      'Offset = tax on a cash gift × deductible share',
      'Tax saved = tax on a cash gift − offset',
    ],
    body: [
      'A qualified charitable distribution sends money straight from your IRA to a charity. It is not counted as taxable income, so you avoid tax on that money instead of paying it and hoping to deduct the gift.',
      'Example: you give $10,000 at a 24% rate and take the standard deduction. Withdrawing $10,000 would cost $2,400 in tax and the cash gift would not be deductible, so the QCD saves $2,400.',
      'QCDs have age and account rules and must reach the charity by December 31. A QCD can also reduce your adjusted gross income, which may help with other thresholds; that is not modelled here. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Who can make a QCD?', a: 'The IRS allows them from an IRA once the owner is age 70½ or older. Check the IRS page below for the current rules.' },
      { q: 'What limit should I use?', a: 'The IRS sets an annual limit and adjusts it for inflation. The default is a recent figure; confirm the current one and edit it.' },
      { q: 'Why does itemizing change the result?', a: 'If you itemize, a cash gift is deductible, which offsets most of the tax. Enter the share you could deduct to see that. With the standard deduction, enter 0.' },
      { q: 'Does this include state tax?', a: 'No. It uses one federal marginal rate you enter.' },
      { q: 'What if my gift is over the limit?', a: 'Only the limit counts as a QCD. The rest would be an ordinary taxable withdrawal, shown as the amount above the limit.' },
    ],
    sources: [
      { label: 'IRS: Qualified charitable distributions', url: 'https://www.irs.gov/charities-non-profits/charitable-organizations/qualified-charitable-distributions' },
    ],
  },
  related: ['charitable-giving-tax-value', 'income-tax', 'bracket-headroom', 'take-home-pay'],
  examples: [
    // eligible 10000; tax 2400; no deduction; saved 2400
    { values: { gift: 10000, limit: 108000, rate: 24, deduct: 0 }, expect: { eligible: 10000, excess: 0, saved: 2400 } },
    // limit binds: eligible 5000, excess 3000; tax 5000*0.22 = 1100; offset 50% = 550; saved 550
    { values: { gift: 8000, limit: 5000, rate: 22, deduct: 50 }, expect: { eligible: 5000, excess: 3000, saved: 550 } },
    // itemizing fully: saved 0
    { values: { gift: 4000, limit: 108000, rate: 32, deduct: 100 }, expect: { eligible: 4000, excess: 0, saved: 0 } },
  ],
});
