import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, moneyDonut } from '../../lib/helpers/finance';
import { asStatus, federalIncomeTax, FILING_STATUS_OPTIONS, money, pct, sliceSteps, STANDARD_DEDUCTION, TAX_YEAR } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'income-tax',
  title: 'Income Tax Calculator',
  category: 'finance',
  description: `Estimate your ${TAX_YEAR} US federal income tax, taxable income, and marginal and effective tax rates.`,
  keywords: ['federal income tax', 'tax bracket', 'tax brackets 2026', 'marginal tax rate', 'effective tax rate', 'how much tax do I owe', 'IRS'],
  popular: true,
  inputs: [
    { id: 'income', label: 'Gross income', type: 'number', prefix: '$', default: 75000, min: 0, step: 1000, help: 'Wages, self-employment profit, interest and other ordinary income.', info: 'Your total ordinary income for the year: wages, self-employment profit, interest, short-term gains and similar.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'Your filing status. It sets the bracket thresholds and the standard deduction.' },
    { id: 'adjustments', label: 'Pre-tax contributions & adjustments', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', help: '401(k), traditional IRA, HSA, student-loan interest, etc.', info: 'Amounts that reduce income before deductions: pre-tax 401(k), traditional IRA, HSA, student-loan interest and similar.' },
    {
      id: 'deductionType',
      info: 'Most people take the standard deduction; itemize only if your itemized total is larger.',
      label: 'Deduction',
      type: 'select',
      segmented: true,
      default: 'standard',
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'itemized', label: 'Itemized' },
      ],
    },
    { id: 'itemized', label: 'Itemized deductions', type: 'number', prefix: '$', min: 0, optional: true, showWhen: { input: 'deductionType', is: 'itemized' }, placeholder: 'Mortgage interest, SALT, charity…', info: 'Your total itemized deductions: mortgage interest, state and local taxes (capped), charitable gifts and large medical costs.' },
    { id: 'credits', label: 'Tax credits', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', help: 'Child tax credit, education credits, etc.', info: 'Tax credits you qualify for, such as the child tax credit. Credits cut the tax itself dollar for dollar.' },
  ],
  outputs: [
    { id: 'tax', label: 'Federal income tax', format: 'currency', primary: true, info: 'Estimated federal income tax for the year after deductions and credits.' },
    { id: 'taxable', label: 'Taxable income', format: 'currency', info: 'Income left after adjustments and your deduction. This is the amount the brackets apply to.' },
    { id: 'deduction', label: 'Deduction used', format: 'currency', info: 'The standard or itemized deduction subtracted from your income.' },
    { id: 'marginal', label: 'Marginal tax rate', format: 'percent', precision: 0, info: 'The bracket rate on your last dollar of taxable income — what an extra dollar of income would be taxed at.' },
    { id: 'effective', label: 'Effective tax rate', format: 'percent', precision: 2, help: 'Tax ÷ gross income.', info: 'Your total tax as a share of gross income. Always lower than the marginal rate.' },
    { id: 'afterTax', label: 'Income after federal income tax', format: 'currency', info: 'Gross income minus federal income tax (before payroll and state taxes).' },
  ],
  compute: (v) => {
    const income = num(v.income);
    if (income === null || income < 0) return { tax: null };
    const status = asStatus(v.status);
    const adjustments = num(v.adjustments) ?? 0;
    const credits = num(v.credits) ?? 0;
    if (adjustments < 0 || credits < 0) return { tax: null };
    const std = STANDARD_DEDUCTION[status];
    const itemized = num(v.itemized) ?? 0;
    const deduction = v.deductionType === 'itemized' ? itemized : std;
    const agi = Math.max(0, income - adjustments);
    const taxable = Math.max(0, agi - deduction);
    const fed = federalIncomeTax(taxable, status);
    const tax = Math.max(0, fed.tax - credits);
    return {
      tax,
      taxable,
      deduction,
      marginal: fed.marginal,
      effective: income > 0 ? tax / income : 0,
      afterTax: income - tax,
      chart: [...(fed.slices.length ? [{ type: 'bar', title: 'Tax by bracket', categories: fed.slices.map((s) => pct(s.rate, 0)), series: [{ name: 'Income in bracket', values: fed.slices.map((s) => s.amount) }, { name: 'Tax', values: fed.slices.map((s) => s.tax) }], format: CURRENCY } as ChartSpec] : []), moneyDonut('Your gross income', [{ label: 'Federal income tax', value: tax }, { label: 'After federal tax', value: income - tax }], pct(income > 0 ? tax / income : 0, 1), 'effective rate')],
      steps: [
        `Adjusted gross income = ${money(income, 0)} − ${money(adjustments, 0)} = ${money(agi, 0)}`,
        `Taxable income = ${money(agi, 0)} − ${money(deduction, 0)} ${v.deductionType === 'itemized' ? 'itemized' : 'standard'} deduction = ${money(taxable, 0)}`,
        ...sliceSteps(fed.slices),
        `Tax before credits = ${money(fed.tax)}${credits ? `; after ${money(credits)} credits = ${money(tax)}` : ''}`,
      ],
      note:
        v.deductionType === 'itemized' && itemized < std
          ? `Your itemized deductions are below the ${money(std, 0)} standard deduction — taking the standard deduction would lower your tax.`
          : `Tax year ${TAX_YEAR} estimate — not tax advice. You are in the ${pct(fed.marginal, 0)} bracket, but your overall rate is ${pct(income > 0 ? tax / income : 0)}.`,
    };
  },
  content: {
    formula: [
      'Taxable income = gross income − adjustments − deduction',
      'Tax = Σ (income in each bracket × that bracket\'s rate) − credits',
      'Effective rate = tax ÷ gross income',
    ],
    body: [
      `This calculator uses the ${TAX_YEAR} federal income tax brackets and standard deductions published by the IRS, which reflect the tax law passed in 2025. The seven rates — 10%, 12%, 22%, 24%, 32%, 35% and 37% — are unchanged, while the income thresholds rise with inflation. For ${TAX_YEAR} the standard deduction is ${money(STANDARD_DEDUCTION.single, 0)} for single filers, ${money(STANDARD_DEDUCTION.mfj, 0)} for married couples filing jointly and ${money(STANDARD_DEDUCTION.hoh, 0)} for heads of household.`,
      'The U.S. system is progressive: each rate only applies to the slice of income inside its bracket. A single filer with $60,000 of taxable income pays 10% on the first $12,400, 12% on the next $38,000, and 22% only on the part above $50,400. The step-by-step breakdown shows each slice.',
      'Your marginal rate is the rate on your next dollar, which is what matters for decisions like contributing to a 401(k) or taking extra work. Your effective rate — total tax divided by income — is always lower, and is the better measure of your overall tax burden.',
      'This is an estimate for ordinary income only, not tax advice. It does not handle long-term capital gains and qualified dividends (taxed at 0%, 15% or 20%), self-employment tax, the alternative minimum tax, phase-outs of credits, or newer deductions such as those for tips, overtime and seniors.',
    ],
    faq: [
      { q: 'Will a raise push me into a higher bracket and lower my pay?', a: 'No. Only the dollars above the bracket threshold are taxed at the higher rate. Your take-home pay always rises with a raise, just a little less per dollar.' },
      { q: 'Should I itemize or take the standard deduction?', a: 'Take whichever is larger. Itemizing usually only wins if your mortgage interest, state and local taxes (subject to the SALT cap) and charitable gifts add up to more than the standard deduction.' },
      { q: 'What is the difference between a deduction and a credit?', a: 'A deduction lowers taxable income, so it saves you your marginal rate times the amount. A credit lowers the tax itself dollar for dollar — a $1,000 credit saves $1,000.' },
    ],
  },
  related: ['take-home-pay', 'rsu-tax', 'salary-to-hourly', 'retirement'],
  examples: [
    { values: { income: 75000, status: 'single', adjustments: null, deductionType: 'standard', itemized: null, credits: null }, expect: { taxable: 58900, tax: 7670, marginal: 0.22, effective: 0.10226666667 } },
    { values: { income: 150000, status: 'mfj', adjustments: 10000, deductionType: 'standard', itemized: null, credits: 2000 }, expect: { taxable: 107800, tax: 11140 } },
  ],
});
