import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import {
  asStatus,
  federalIncomeTax,
  FILING_STATUS_OPTIONS,
  money,
  moneyDonut,
  pct,
  STANDARD_DEDUCTION,
  TAX_YEAR,
} from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'tax-refund-estimator',
  title: 'Tax Refund Estimator: Will I Owe in April?',
  category: 'finance',
  description: `Estimate your ${TAX_YEAR} federal tax refund or amount owed from your wages and withholding, and see how much extra to withhold per paycheck to break even.`,
  keywords: ['tax refund estimator', 'will i owe taxes', 'federal tax refund calculator', 'am i withholding enough', 'w-4 withholding calculator', 'how much tax refund will i get'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    { id: 'wages', label: 'Annual wages', type: 'number', prefix: '$', default: 85000, min: 0, step: 1000, info: 'Total pay for the year before any tax or pre-tax deductions (Box 1 gross, including bonuses).' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'Sets your tax brackets and standard deduction.' },
    { id: 'withheld', label: 'Federal tax withheld for the whole year', type: 'number', prefix: '$', default: 9000, min: 0, step: 100, help: 'So far this year plus what you expect to be withheld on the remaining paychecks.', info: 'Find "federal tax YTD" on your latest paystub. To project the full year, take YTD ÷ paychecks so far × paychecks per year.' },
    { id: 'pretax', label: 'Pre-tax deductions', type: 'number', prefix: '$', min: 0, step: 500, optional: true, placeholder: '0', help: '401(k), HSA, and health premiums taken out of your pay before tax.', info: 'Money taken from your paycheck before income tax, such as traditional 401(k), HSA and pre-tax health insurance. It lowers your taxable income.' },
    { id: 'other', label: 'Other taxable income', type: 'number', prefix: '$', min: 0, step: 500, optional: true, placeholder: '0', help: 'Interest, side income, and similar.', info: 'Extra income not on your main paycheck, taxed like wages. Self-employment tax is not included.' },
    { id: 'credits', label: 'Tax credits', type: 'number', prefix: '$', min: 0, step: 100, optional: true, placeholder: '0', help: 'For example the child tax credit.', info: 'Credits reduce your tax dollar for dollar, down to zero. Refundable parts of credits are not modeled.' },
    { id: 'checksLeft', label: 'Paychecks left this year', type: 'number', min: 0, step: 1, optional: true, placeholder: '0', help: 'Used to show the extra withholding per paycheck if you would owe.', info: 'How many paychecks you still get before December 31. Leave blank to skip the W-4 suggestion.' },
  ],
  outputs: [
    { id: 'result', label: 'Refund (or amount owed)', format: 'currency', primary: true, info: 'Tax withheld minus your tax bill. Positive is a refund; a negative number with a minus sign is what you would owe.' },
    { id: 'totalTax', label: 'Federal income tax for the year', format: 'currency', info: 'Tax on taxable income using the standard deduction, minus credits (never below zero).' },
    { id: 'taxable', label: 'Taxable income', format: 'currency', info: 'Wages plus other income, minus pre-tax deductions and the standard deduction.' },
    { id: 'effectiveRate', label: 'Effective tax rate', format: 'percent', precision: 1, info: 'Federal income tax divided by your total income.' },
    { id: 'perCheck', label: 'Extra withholding per remaining paycheck', format: 'currency', info: 'Only shown if you would owe and have paychecks left: the amount owed divided by the paychecks left. Add it on a new W-4 (step 4c).' },
  ],
  compute: (v) => {
    const wages = num(v.wages);
    const withheld = num(v.withheld);
    if (wages === null || wages < 0 || withheld === null || withheld < 0) return { result: null };
    const pretax = Math.max(0, num(v.pretax) ?? 0);
    const other = Math.max(0, num(v.other) ?? 0);
    const credits = Math.max(0, num(v.credits) ?? 0);
    const checks = Math.max(0, Math.floor(num(v.checksLeft) ?? 0));
    const status = asStatus(v.status);

    const income = wages + other;
    const std = STANDARD_DEDUCTION[status];
    const taxable = Math.max(0, income - pretax - std);
    const grossTax = federalIncomeTax(taxable, status).tax;
    const totalTax = Math.max(0, grossTax - credits);
    const result = withheld - totalTax;
    const rate = income > 0 ? totalTax / income : 0;
    const owed = Math.max(0, -result);
    const refund = Math.max(0, result);
    const perCheck = owed > 0 && checks > 0 ? owed / checks : null;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    if (result >= 0) tone = 'good';
    else if (owed < 500) tone = 'ok';
    else if (owed < 2000) tone = 'warn';
    else tone = 'bad';

    const charts: ChartSpec[] = [
      moneyDonut(
        result >= 0 ? 'Your withholding vs. your tax bill' : 'Your tax bill vs. what was withheld',
        [
          { label: 'Tax covered by withholding', value: Math.min(withheld, totalTax) },
          { label: 'Still owed in April', value: owed },
          { label: 'Extra withheld (your refund)', value: refund },
        ],
        money(Math.abs(result), 0),
        result >= 0 ? 'refund' : 'owed',
      ),
    ];

    return {
      result,
      totalTax,
      taxable,
      effectiveRate: rate,
      perCheck,
      tone,
      badge: result >= 0 ? `Refund ${money(refund, 0)}` : `Owe ${money(owed, 0)}`,
      chart: charts,
      steps: [
        `Taxable income = ${money(income, 0)} − ${money(pretax, 0)} pre-tax − ${money(std, 0)} standard deduction = ${money(taxable, 0)}`,
        `Tax on ${money(taxable, 0)} (${status}) = ${money(grossTax)}`,
        `After credits = max(0, ${money(grossTax)} − ${money(credits)}) = ${money(totalTax)}`,
        `Result = ${money(withheld)} withheld − ${money(totalTax)} tax = ${money(result)}`,
        ...(perCheck !== null ? [`Extra per paycheck = ${money(owed)} ÷ ${checks} = ${money(perCheck)}`] : []),
      ],
      note: `Federal income tax only, for ${TAX_YEAR}, using the standard deduction. No state tax, self-employment tax, or other credits and deductions. Not tax advice.`,
    };
  },
  content: {
    formula: [
      'Taxable income = wages + other income - pre-tax deductions - standard deduction (not below 0)',
      'Tax = bracket tax on taxable income, minus credits (not below 0)',
      'Refund (or owed) = federal tax withheld - tax',
    ],
    body: [
      'Your employer withholds federal tax from each paycheck based on your W-4, but the final bill is only worked out when you file. If more was withheld than you owe, you get the difference back as a refund. If less, you pay the rest by the filing deadline.',
      'To estimate it, enter your wages and the federal tax withheld for the full year. If you are partway through the year, take the "federal tax YTD" figure on your paystub, divide by the paychecks so far, and multiply by the paychecks you get in a year. The calculator subtracts pre-tax deductions and the standard deduction, applies the tax brackets, takes off any credits, and compares the result with what was withheld.',
    ],
    sections: [
      {
        heading: 'If I would owe, how do I fix it?',
        paragraphs: ['Enter how many paychecks you have left. The calculator divides the amount owed by that number to show the extra withholding per paycheck that would bring you to break even. You can add it on a new W-4 under step 4(c), or use the IRS Tax Withholding Estimator for a fuller picture. The sooner you change it, the smaller each amount is.'],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: ['It covers federal income tax only. State tax, Social Security and Medicare, self-employment tax, itemized deductions, capital gains, and credits that can be paid out as refunds are not modeled. Treat the result as a planning number, and note that a large refund simply means you lent the government money interest-free during the year.'],
      },
    ],
    faq: [
      { q: 'Will I owe taxes on $85,000 with $9,000 withheld?', a: 'If you are single with no other income or deductions, taxable income is $85,000 − $16,100 = $68,900. Tax is $1,240 + $4,560 + $4,070 = $9,870. With $9,000 withheld you would owe $870.' },
      { q: 'What is the effective tax rate in that example?', a: 'Federal income tax of $9,870 divided by $85,000 of income is about 11.6%, well below the 22% bracket that the top of your income falls in.' },
      { q: 'How much extra should I withhold if I owe $870 with 10 paychecks left?', a: '$870 ÷ 10 = $87.00 extra per paycheck. Enter the amount on your W-4 in step 4(c) so the total withheld covers your tax by year end.' },
      { q: 'How do tax credits change my refund?', a: 'A credit reduces your tax dollar for dollar, but this calculator will not take it below zero. A $2,000 credit on the $9,870 bill above lowers the tax to $7,870, which turns the $870 owed into a $1,130 refund.' },
    ],
    sources: [
      { label: 'IRS Tax Withholding Estimator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
      { label: 'IRS Publication 505: Tax Withholding and Estimated Tax', url: 'https://www.irs.gov/publications/p505' },
      { label: 'IRS Rev. Proc. 2025-32: 2026 inflation adjustments (standard deduction and brackets)', url: 'https://www.irs.gov/irb/2025-45_IRB' },
    ],
  },
  related: ['income-tax', 'take-home-pay', 'bonus-tax', 'self-employment-tax', 'hsa-fsa-savings'],
  examples: [
    {
      // Defaults: taxable 85,000-16,100 = 68,900. Tax 1,240 + 12%x38,000 (4,560) + 22%x18,500 (4,070) = 9,870.
      // Owed 870; 870 / 10 paychecks = 87. Effective 9,870 / 85,000 = 0.116117647.
      values: { wages: 85000, status: 'single', withheld: 9000, pretax: null, other: null, credits: null, checksLeft: 10 },
      expect: { result: -870, totalTax: 9870, taxable: 68900, effectiveRate: 0.116117647, perCheck: 87 },
      tolerance: 1e-6,
    },
    {
      // Refund case: same tax 9,870, withheld 11,000 -> refund 1,130 (no perCheck).
      values: { wages: 85000, status: 'single', withheld: 11000, pretax: null, other: null, credits: null, checksLeft: 10 },
      expect: { result: 1130, totalTax: 9870 },
      tolerance: 1e-6,
    },
    {
      // Credits capped: 50,000-16,100 = 33,900; tax 1,240 + 12%x21,500 (2,580) = 3,820; credit 5,000 -> tax 0; refund = 4,000.
      values: { wages: 50000, status: 'single', withheld: 4000, pretax: null, other: null, credits: 5000, checksLeft: null },
      expect: { result: 4000, totalTax: 0, effectiveRate: 0 },
      tolerance: 1e-6,
    },
    {
      // MFJ: 120,000-10,000-32,200 = 77,800; tax 10%x24,800 (2,480) + 12%x53,000 (6,360) = 8,840; minus 2,000 credit = 6,840; 9,000-6,840 = 2,160.
      values: { wages: 120000, status: 'mfj', withheld: 9000, pretax: 10000, other: null, credits: 2000, checksLeft: null },
      expect: { result: 2160, totalTax: 6840, taxable: 77800 },
      tolerance: 1e-6,
    },
    {
      // Zero income: no taxable income, no tax; all 500 withheld comes back.
      values: { wages: 0, status: 'single', withheld: 500, pretax: null, other: null, credits: null, checksLeft: null },
      expect: { result: 500, totalTax: 0, taxable: 0, effectiveRate: 0 },
      tolerance: 1e-6,
    },
  ],
});
