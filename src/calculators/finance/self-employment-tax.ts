import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import {
  ADDL_MEDICARE_RATE,
  ADDL_MEDICARE_THRESHOLD,
  asStatus,
  federalIncomeTax,
  FILING_STATUS_OPTIONS,
  money,
  moneyDonut,
  pct,
  SS_WAGE_BASE,
  STANDARD_DEDUCTION,
  TAX_YEAR,
} from '../../lib/helpers/finance';

const SE_FACTOR = 0.9235;
const SE_SS_RATE = 0.124;
const SE_MEDICARE_RATE = 0.029;

export default defineCalculator({
  slug: 'self-employment-tax',
  title: 'Self-Employment Tax Calculator',
  category: 'finance',
  description: `Estimate your ${TAX_YEAR} self-employment tax (15.3%), federal income tax, and the quarterly payment to set aside as a freelancer or 1099 contractor.`,
  keywords: ['self employment tax calculator', 'freelance tax calculator', '1099 tax calculator', 'quarterly estimated tax', 'se tax 15.3%', 'how much tax do freelancers pay'],
  updated: '2026-11-15',
  popular: false,
  inputs: [
    { id: 'profit', label: 'Net self-employment profit', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'Income from your business or 1099 work minus business expenses, for the year.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'Sets your tax brackets and standard deduction.' },
    { id: 'wages', label: 'Other W-2 wages', type: 'number', prefix: '$', min: 0, step: 1000, optional: true, placeholder: '0', help: 'If you also have a job. Its Social Security tax uses up part of the yearly wage base first.', info: 'Wages from an employer this year. They count toward the Social Security wage base and fill lower tax brackets first.' },
    { id: 'stateRate', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, optional: true, help: 'A flat estimate. Use 0 for states without income tax.', info: 'Approximate state income tax rate on your profit.' },
  ],
  outputs: [
    { id: 'seTax', label: 'Self-employment tax', format: 'currency', primary: true, info: 'Social Security (12.4%) plus Medicare (2.9%) on 92.35% of your profit, plus 0.9% Additional Medicare above the threshold.' },
    { id: 'halfDeduction', label: 'Deductible half of SE tax', format: 'currency', info: 'You deduct half of the regular SE tax from your income before computing income tax.' },
    { id: 'incomeTax', label: 'Federal income tax on the profit', format: 'currency', info: 'Your federal tax with the profit minus your federal tax without it, using the standard deduction.' },
    { id: 'stateTax', label: 'State tax', format: 'currency', info: 'The flat rate you entered applied to profit after the SE tax deduction.' },
    { id: 'totalTax', label: 'Total tax on the profit', format: 'currency', info: 'Self-employment tax + federal income tax + state tax.' },
    { id: 'takeHome', label: 'Take-home after tax', format: 'currency', info: 'Profit minus total tax.' },
    { id: 'effectiveRate', label: 'Share of profit lost to tax', format: 'percent', precision: 1, info: 'Total tax divided by profit.' },
    { id: 'quarterly', label: 'Set aside each quarter', format: 'currency', info: 'Total tax divided by four, the usual estimated-tax payment.' },
  ],
  compute: (v) => {
    const profit = num(v.profit);
    if (profit === null || profit <= 0) return { seTax: null };
    const wages = Math.max(0, num(v.wages) ?? 0);
    const stateRate = num(v.stateRate) ?? 0;
    if (stateRate < 0) return { seTax: null };
    const status = asStatus(v.status);

    const base = profit * SE_FACTOR;
    const eligible = base >= 400;
    const ssRoom = Math.max(0, SS_WAGE_BASE - wages);
    const ss = eligible ? Math.min(base, ssRoom) * SE_SS_RATE : 0;
    const med = eligible ? base * SE_MEDICARE_RATE : 0;
    const thr = ADDL_MEDICARE_THRESHOLD[status];
    const addl = eligible ? (Math.max(0, wages + base - thr) - Math.max(0, wages - thr)) * ADDL_MEDICARE_RATE : 0;
    const regularSE = ss + med;
    const seTax = regularSE + addl;
    const half = regularSE / 2;

    const std = STANDARD_DEDUCTION[status];
    const withIncome = federalIncomeTax(Math.max(0, wages + profit - half - std), status);
    const withoutIncome = federalIncomeTax(Math.max(0, wages - std), status);
    const incomeTax = withIncome.tax - withoutIncome.tax;
    const stateTax = ((profit - half) * stateRate) / 100;
    const totalTax = seTax + incomeTax + stateTax;
    const takeHome = profit - totalTax;
    const rate = totalTax / profit;
    const quarterly = totalTax / 4;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    if (rate < 0.2) tone = 'good';
    else if (rate < 0.28) tone = 'ok';
    else if (rate < 0.36) tone = 'warn';
    else tone = 'bad';

    const charts: ChartSpec[] = [
      moneyDonut('Where your profit goes', [{ label: 'Take-home', value: takeHome }, { label: 'Social Security', value: ss }, { label: 'Medicare', value: med + addl }, { label: 'Federal income tax', value: incomeTax }, { label: 'State tax', value: stateTax }], pct(1 - rate, 0), 'kept'),
    ];

    return {
      seTax,
      halfDeduction: half,
      incomeTax,
      stateTax,
      totalTax,
      takeHome,
      effectiveRate: rate,
      quarterly,
      tone,
      badge: `Set aside ${pct(rate, 0)}`,
      chart: charts,
      steps: [
        `Taxable SE earnings = ${money(profit, 0)} × 92.35% = ${money(base)}`,
        `Social Security = ${money(Math.min(base, ssRoom))} × 12.4% = ${money(ss)}`,
        `Medicare = ${money(base)} × 2.9% = ${money(med)}${addl > 0 ? `, plus Additional Medicare ${money(addl)}` : ''}`,
        `Deductible half = ${money(regularSE)} ÷ 2 = ${money(half)}`,
        `Federal income tax on ${money(Math.max(0, wages + profit - half - std), 0)} taxable income, minus tax on wages alone = ${money(incomeTax)}`,
        `Total = ${money(seTax)} + ${money(incomeTax)} + ${money(stateTax)} = ${money(totalTax)}`,
      ],
      note: `${eligible ? '' : 'Net earnings under $400 owe no SE tax. '}Estimate for ${TAX_YEAR}, standard deduction, no credits, no QBI deduction (which could lower it). Not tax advice.`,
    };
  },
  content: {
    formula: [
      'Taxable SE earnings = profit × 92.35%',
      'SE tax = 12.4% × earnings up to the Social Security wage base + 2.9% × all earnings (+ 0.9% above the threshold)',
      'Deduction = half of the regular SE tax',
      'Income tax = tax(wages + profit - deduction - standard deduction) - tax(wages - standard deduction)',
    ],
    body: [
      'When you work for yourself you pay both halves of Social Security and Medicare, which is why the self-employment (SE) rate is 15.3% instead of the 7.65% an employee sees. The tax applies to 92.35% of your net profit, which roughly mirrors the employer half an employer would normally deduct.',
      `The Social Security part (12.4%) stops at the wage base, ${money(SS_WAGE_BASE, 0)} in ${TAX_YEAR}, counting any W-2 wages you also earn. Medicare (2.9%) has no cap. High earners owe an extra 0.9% on combined earnings above $200,000 single or $250,000 married filing jointly.`,
      'SE tax is separate from income tax. You then deduct half of the regular SE tax from your income before working out federal income tax. Freelancers usually pay all of it through quarterly estimated payments, which is why the calculator shows a per-quarter amount.',
    ],
    sections: [
      {
        heading: 'How much should I set aside from each payment?',
        paragraphs: ['A common rule of thumb is 25% to 30% of profit for people in the 12% to 22% brackets. The share lost to tax above shows your own number, and the quarterly figure is that total divided by four.'],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: ['It uses the standard deduction and ignores credits, the qualified business income (QBI) deduction, health insurance and retirement deductions, and state-specific rules. Those can lower your bill, so treat the result as a safe planning number.'],
      },
    ],
    faq: [
      { q: 'How much self-employment tax on $80,000 of profit?', a: 'Taxable earnings are $80,000 × 92.35% = $73,880. Social Security is $73,880 × 12.4% = $9,161.12 and Medicare is $73,880 × 2.9% = $2,142.52, so SE tax is $11,303.64. Half, $5,651.82, is deductible.' },
      { q: 'What is the total tax on $80,000 of freelance profit?', a: 'Single, no other income, 5% state rate: SE tax $11,303.64, federal income tax $7,526.60 on $58,248.18 of taxable income, and state tax $3,717.41. Total $22,547.65, about 28.2% of profit, or $5,636.91 per quarter.' },
      { q: 'Do I owe SE tax on small earnings?', a: 'Only if net self-employment earnings (after the 92.35% factor) are $400 or more. Below that, no SE tax is due.' },
      { q: 'Does a W-2 job change my SE tax?', a: 'Yes. Social Security tax stops at the wage base across all your wages and SE earnings, so W-2 pay uses up room first. The calculator accounts for that.' },
    ],
    sources: [
      { label: 'IRS: Self-employment tax (Social Security and Medicare)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
      { label: 'IRS Schedule SE instructions', url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040' },
      { label: 'SSA: contribution and benefit base', url: 'https://www.ssa.gov/oact/cola/cbb.html' },
    ],
  },
  related: ['income-tax', 'take-home-pay', 'bonus-tax', 'hsa-fsa-savings', 'salary-to-hourly'],
  examples: [
    {
      // base 73,880; SS 9,161.12; Medicare 2,142.52; SE 11,303.64; half 5,651.82.
      // taxable 80,000-5,651.82-16,100 = 58,248.18; tax 1,240 + 4,560 + 22%×7,848.18 (=1,726.5996) = 7,526.5996.
      // state 5% × 74,348.18 = 3,717.409; total 22,547.6486; take-home 57,452.3514.
      values: { profit: 80000, status: 'single', wages: null, stateRate: 5 },
      expect: { seTax: 11303.64, halfDeduction: 5651.82, incomeTax: 7526.5996, stateTax: 3717.409, totalTax: 22547.6486, takeHome: 57452.3514, quarterly: 5636.91215 },
      tolerance: 1e-6,
    },
    {
      // wages 184,500 already hit the wage base: no Social Security; Medicare only. profit 10,000: base 9,235 × 2.9% = 267.815.
      values: { profit: 10000, status: 'single', wages: 184500, stateRate: 0 },
      expect: { seTax: 267.815, halfDeduction: 133.9075 },
      tolerance: 1e-6,
    },
  ],
});
