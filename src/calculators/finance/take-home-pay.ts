import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, moneyDonut, pct } from '../../lib/helpers/finance';
import {
  asStatus,
  federalIncomeTax,
  ficaTax,
  FILING_STATUS_OPTIONS,
  LIMIT_401K,
  money,
  SS_WAGE_BASE,
  STANDARD_DEDUCTION,
  TAX_YEAR,
} from '../../lib/helpers/finance';

const PERIODS: Record<string, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, annual: 1 };

export default defineCalculator({
  slug: 'take-home-pay',
  title: 'Take-Home Pay Calculator',
  category: 'finance',
  description: `Estimate your ${TAX_YEAR} US paycheck after federal income tax, Social Security, Medicare, state tax and 401(k) contributions.`,
  keywords: ['paycheck calculator', 'net pay', 'after-tax salary', 'take home', 'salary after tax', 'FICA', 'withholding'],
  popular: true,
  inputs: [
    { id: 'salary', label: 'Annual gross salary', type: 'number', prefix: '$', default: 85000, min: 0, step: 1000, info: 'Your yearly pay before any taxes or deductions, from your offer letter or the \'gross\' line on a pay stub.' },
    {
      id: 'frequency',
      info: 'How often you are paid. It only changes the per-paycheck figure, not the yearly total.',
      label: 'Pay frequency',
      type: 'select',
      default: 'biweekly',
      options: [
        { value: 'weekly', label: 'Weekly (52)' },
        { value: 'biweekly', label: 'Every two weeks (26)' },
        { value: 'semimonthly', label: 'Twice a month (24)' },
        { value: 'monthly', label: 'Monthly (12)' },
        { value: 'annual', label: 'Annually' },
      ],
    },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'The filing status you will use on your federal return. It sets your brackets and standard deduction.' },
    { id: 'k401', label: '401(k) contribution (pre-tax)', type: 'number', suffix: '% of salary', default: 5, min: 0, max: 100, step: 0.5, optional: true, info: 'The percentage of pay you put into a traditional (pre-tax) 401(k) or 403(b). Roth contributions do not lower taxes.' },
    { id: 'otherPretax', label: 'Other pre-tax deductions (per year)', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', help: 'Health insurance premiums, HSA, FSA — these also skip Social Security and Medicare.', info: 'Yearly health, dental and vision premiums, HSA and FSA contributions taken out before tax. Your pay stub lists them.' },
    { id: 'stateRate', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, optional: true, help: 'A flat estimate. Use 0 for states without income tax.', info: 'Your approximate state income tax rate. States like Texas and Florida have none; others range up to about 13%.' },
    { id: 'localRate', label: 'Local / city income tax rate', type: 'number', suffix: '%', min: 0, max: 10, step: 0.1, optional: true, placeholder: '0', info: 'City or county income tax, if your area has one (e.g. New York City, many Ohio and Pennsylvania towns).' },
  ],
  outputs: [
    { id: 'net', label: 'Take-home pay per paycheck', format: 'currency', primary: true, info: 'Estimated money that lands in your bank account each payday after taxes and pre-tax deductions.' },
    { id: 'netAnnual', label: 'Take-home pay per year', format: 'currency', info: 'Estimated take-home pay for the whole year.' },
    { id: 'federal', label: 'Federal income tax (year)', format: 'currency', info: 'Estimated federal income tax for the year after the standard deduction and pre-tax contributions.' },
    { id: 'socialSecurity', label: 'Social Security (year)', format: 'currency', info: '6.2% of wages up to the yearly wage base. Pre-tax 401(k) money is still taxed.' },
    { id: 'medicare', label: 'Medicare (year)', format: 'currency', info: '1.45% of all wages, plus 0.9% on wages above the Additional Medicare Tax threshold.' },
    { id: 'state', label: 'State & local tax (year)', format: 'currency', info: 'Estimated state and local income tax at the flat rates you entered.' },
    { id: 'retirement', label: '401(k) contribution (year)', format: 'currency', info: 'Your yearly pre-tax 401(k) contribution, capped at the IRS limit.' },
    { id: 'effectiveRate', label: 'Total tax rate', format: 'percent', precision: 2, help: 'All taxes ÷ gross salary.', info: 'All income and payroll taxes divided by gross salary — your overall tax share.' },
    { id: 'marginal', label: 'Federal marginal rate', format: 'percent', precision: 0, info: 'The federal rate on your next dollar of taxable income, i.e. your top bracket.' },
  ],
  compute: (v) => {
    const gross = num(v.salary);
    if (gross === null || gross < 0) return { net: null };
    const status = asStatus(v.status);
    const periods = PERIODS[String(v.frequency)] ?? 26;
    const k401Pct = num(v.k401) ?? 0;
    const other = num(v.otherPretax) ?? 0;
    if (k401Pct < 0 || other < 0) return { net: null };
    let retirement = (gross * k401Pct) / 100;
    const capped = retirement > LIMIT_401K;
    if (capped) retirement = LIMIT_401K;
    if (retirement + other > gross) return { net: null, error: 'Pre-tax deductions are larger than the salary.' };
    const stdDed = STANDARD_DEDUCTION[status];
    const taxable = Math.max(0, gross - retirement - other - stdDed);
    const fed = federalIncomeTax(taxable, status);
    const ficaWages = gross - other; // 401(k) deferrals are still subject to FICA; cafeteria-plan deductions are not
    const fica = ficaTax(ficaWages, status);
    const stateWages = gross - retirement - other;
    const state = (stateWages * ((num(v.stateRate) ?? 0) + (num(v.localRate) ?? 0))) / 100;
    const taxes = fed.tax + fica.socialSecurity + fica.medicare + state;
    const netAnnual = gross - retirement - other - taxes;
    return {
      net: netAnnual / periods,
      netAnnual,
      federal: fed.tax,
      socialSecurity: fica.socialSecurity,
      medicare: fica.medicare,
      state,
      retirement,
      effectiveRate: gross > 0 ? taxes / gross : 0,
      marginal: fed.marginal,
      chart: [moneyDonut('Where your gross pay goes', [{ label: 'Take-home pay', value: netAnnual }, { label: 'Federal income tax', value: fed.tax }, { label: 'Social Security', value: fica.socialSecurity }, { label: 'Medicare', value: fica.medicare }, { label: 'State & local tax', value: state }, { label: '401(k)', value: retirement }, { label: 'Other pre-tax', value: other }], pct(gross > 0 ? netAnnual / gross : 0, 0), 'take-home'), ...(fed.slices.length ? [{ type: 'bar', title: 'Federal tax by bracket', categories: fed.slices.map((s) => pct(s.rate, 0)), series: [{ name: 'Tax', values: fed.slices.map((s) => s.tax) }], format: CURRENCY } as ChartSpec] : [])],
      steps: [
        `Federal taxable income = ${money(gross, 0)} − ${money(retirement, 0)} 401(k) − ${money(other, 0)} other − ${money(stdDed, 0)} standard deduction = ${money(taxable, 0)}`,
        `Federal tax (${TAX_YEAR} brackets) = ${money(fed.tax)}`,
        `Social Security = 6.2% × ${money(Math.min(ficaWages, SS_WAGE_BASE), 0)} = ${money(fica.socialSecurity)}; Medicare = ${money(fica.medicare)}`,
        `State & local = ${money(stateWages, 0)} × ${(num(v.stateRate) ?? 0) + (num(v.localRate) ?? 0)}% = ${money(state)}`,
        `Take-home = ${money(netAnnual)} a year ÷ ${periods} = ${money(netAnnual / periods)} per paycheck`,
      ],
      note: capped
        ? `Your 401(k) contribution was capped at the ${TAX_YEAR} limit of ${money(LIMIT_401K, 0)}. Estimate only — not tax advice.`
        : `Estimate for tax year ${TAX_YEAR} using the standard deduction — not tax advice. Your actual withholding depends on your W-4.`,
    };
  },
  content: {
    formula: [
      'Take-home = gross − pre-tax deductions − federal tax − Social Security − Medicare − state tax',
      'Federal taxable income = gross − 401(k) − other pre-tax − standard deduction',
      `Social Security = 6.2% of wages up to ${money(SS_WAGE_BASE, 0)}; Medicare = 1.45% (+0.9% above $200k single / $250k joint)`,
    ],
    body: [
      `This calculator estimates your take-home pay for tax year ${TAX_YEAR} using the IRS's ${TAX_YEAR} federal brackets and standard deductions (${money(STANDARD_DEDUCTION.single, 0)} single, ${money(STANDARD_DEDUCTION.mfj, 0)} married filing jointly, ${money(STANDARD_DEDUCTION.hoh, 0)} head of household). It is an estimate, not tax advice, and it works out your annual tax liability rather than copying your employer's withholding tables.`,
      `Payroll taxes are separate from income tax. Social Security takes 6.2% of wages up to the ${TAX_YEAR} wage base of ${money(SS_WAGE_BASE, 0)}, and Medicare takes 1.45% of all wages, plus an extra 0.9% on wages above $200,000 (single) or $250,000 (married filing jointly, combined).`,
      'Traditional 401(k) contributions lower your federal and most state income tax, but not Social Security or Medicare. Health insurance premiums, HSA and FSA contributions taken through a cafeteria plan lower all of them, which is why they are entered separately.',
      'State tax is modeled as one flat rate on wages after pre-tax deductions. Most states have their own brackets and deductions, so use your state\'s effective rate for a closer estimate. Credits (such as the child tax credit), itemized deductions and the newer deductions for tips, overtime or seniors are not included.',
    ],
    faq: [
      { q: 'Why is my real paycheck different?', a: 'Employers withhold using IRS tables and your W-4 choices, which spread tax evenly across paychecks and may not match your final liability exactly. Benefits deductions, local taxes, and state-specific rules also change the number.' },
      { q: 'What is my marginal tax rate?', a: 'It is the federal rate on your next dollar of taxable income. Only income inside each bracket is taxed at that bracket\'s rate, so a raise never lowers your take-home pay.' },
      { q: 'Does contributing to a 401(k) reduce my paycheck by the full amount?', a: 'No. Because traditional contributions are made before income tax, each $100 contributed reduces take-home pay by only about $100 minus your combined federal and state marginal rate — around $70 for many people.' },
    ],
  },
  related: ['income-tax', 'salary-to-hourly', 'retirement', 'rsu-tax', 'home-affordability'],
  examples: [
    {
      values: { salary: 85000, frequency: 'biweekly', status: 'single', k401: 5, otherPretax: null, stateRate: 5, localRate: null },
      expect: { federal: 8935, socialSecurity: 5270, medicare: 1232.5, state: 4037.5, netAnnual: 61275, net: 2356.730769, marginal: 0.22 },
    },
    {
      values: { salary: 250000, frequency: 'monthly', status: 'single', k401: 0, otherPretax: 0, stateRate: 0, localRate: 0 },
      expect: { socialSecurity: 11439, medicare: 4075, federal: 51304 },
      tolerance: 1e-9,
    },
  ],
});
