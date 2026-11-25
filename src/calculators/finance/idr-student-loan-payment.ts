import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut, pct } from '../../lib/helpers/finance';

const NOT_CURRENT = 'The defaults are illustrative, not current-year figures. Look up the guideline for your plan year and enter it.';

export default defineCalculator({
  slug: 'idr-student-loan-payment',
  title: 'Income-Driven Student Loan Payment Calculator',
  category: 'finance',
  description: 'Estimate an income-driven repayment (IDR) student loan payment from your AGI, family size, poverty guideline and plan percent. Every rate is editable.',
  keywords: ['income driven repayment calculator', 'idr payment calculator', 'student loan payment from income', 'discretionary income calculator', 'income based repayment'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'agi', label: 'Adjusted gross income (AGI)', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'Line 11 of your tax return. Use last return or a current estimate.' },
    { id: 'family', label: 'Family size', type: 'number', default: 1, min: 1, max: 20, step: 1, info: 'You, a spouse if counted by your plan, and dependents.' },
    { id: 'guideline', label: 'Poverty guideline, 1 person', type: 'number', prefix: '$', default: 15650, min: 0, step: 50, help: NOT_CURRENT, info: 'Illustrative default. Not a current-year claim: check the HHS poverty guidelines.' },
    { id: 'extra', label: 'Added per extra person', type: 'number', prefix: '$', default: 5500, min: 0, step: 50, help: NOT_CURRENT, info: 'Illustrative default. Not a current-year claim.' },
    { id: 'multiplier', label: 'Protected income multiplier', type: 'number', suffix: '%', default: 150, min: 0, max: 400, step: 5, info: 'Share of the poverty guideline your plan shields from the payment. Plans differ (for example 100%, 150%, 225%).' },
    { id: 'planPct', label: 'Plan percent of discretionary income', type: 'number', suffix: '%', default: 10, min: 0, max: 30, step: 0.5, info: 'Share of discretionary income paid per year. Plans differ (for example 5%, 10%, 15%, 20%).' },
    { id: 'cap', label: 'Standard 10-year monthly payment (optional cap)', type: 'number', prefix: '$', min: 0, step: 10, optional: true, placeholder: 'No cap', help: 'If your plan caps the payment at the standard 10-year amount, enter it.', info: 'Leave blank for no cap.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Estimated monthly payment', format: 'currency', primary: true, info: 'Annual payment divided by 12, after any cap.' },
    { id: 'annual', label: 'Annual payment', format: 'currency', info: 'Plan percent × discretionary income, after any cap.' },
    { id: 'discretionary', label: 'Discretionary income', format: 'currency', info: 'AGI minus protected income, never below zero.' },
    { id: 'protected', label: 'Protected income', format: 'currency', info: 'Poverty guideline for your family size × multiplier.' },
    { id: 'share', label: 'Payment as a share of AGI', format: 'percent', precision: 1, info: 'Annual payment divided by AGI.' },
  ],
  compute: (v) => {
    const agi = num(v.agi);
    const family = num(v.family);
    const base = num(v.guideline);
    const extra = num(v.extra) ?? 0;
    const mult = num(v.multiplier);
    const planPct = num(v.planPct);
    const cap = num(v.cap);
    if (agi === null || family === null || base === null || mult === null || planPct === null) return { monthly: null };
    if (agi < 0 || family < 1 || base < 0 || extra < 0 || mult < 0 || planPct < 0) return { monthly: null };
    if (cap !== null && cap < 0) return { monthly: null };

    const size = Math.floor(family);
    const guideline = base + extra * (size - 1);
    const prot = guideline * (mult / 100);
    const discretionary = Math.max(0, agi - prot);
    const uncapped = discretionary * (planPct / 100);
    const capAnnual = cap !== null && cap > 0 ? cap * 12 : null;
    const capped = capAnnual !== null && uncapped > capAnnual;
    const annual = capped ? capAnnual! : uncapped;
    const monthly = annual / 12;
    const share = agi > 0 ? annual / agi : 0;

    const tone = annual === 0 ? 'good' : share < 0.05 ? 'ok' : share < 0.1 ? 'warn' : 'bad';
    const charts: ChartSpec[] = [
      moneyDonut('Where your AGI goes each year', [
        { label: 'Loan payment', value: annual },
        { label: 'Rest of AGI', value: Math.max(0, agi - annual) },
      ], money(monthly, 0), 'per month'),
    ];

    return {
      monthly, annual, discretionary, protected: prot, share,
      tone,
      badge: annual === 0 ? 'Payment is $0' : capped ? 'Capped at standard payment' : `${pct(share, 1)} of AGI`,
      chart: charts,
      steps: [
        `Guideline for ${size} = ${money(base, 0)} + ${size - 1} × ${money(extra, 0)} = ${money(guideline, 0)}`,
        `Protected income = ${money(guideline, 0)} × ${pct(mult / 100, 0)} = ${money(prot, 0)}`,
        `Discretionary income = ${money(agi, 0)} − ${money(prot, 0)} = ${money(discretionary, 0)} (not below $0)`,
        `Annual payment = ${money(discretionary, 0)} × ${pct(planPct / 100, 1)} = ${money(uncapped)}${capped ? `, capped at ${money(capAnnual!)} (${money(cap!)} × 12)` : ''}`,
        `Monthly = ${money(annual)} ÷ 12 = ${money(monthly)}`,
      ],
      note: 'The poverty guideline, multiplier and plan percent are your inputs and the defaults are illustrative, not current-year claims. Plan rules, spouse income and eligibility vary: confirm with your loan servicer. Not financial advice.',
    };
  },
  content: {
    formula: [
      'Guideline = 1-person guideline + added amount × (family size − 1)',
      'Protected income = guideline × multiplier',
      'Discretionary income = max(0, AGI − protected income)',
      'Monthly payment = discretionary income × plan percent ÷ 12 (capped if your plan has a cap)',
    ],
    body: [
      'Income-driven repayment (IDR) plans set your federal student loan payment from your income and family size instead of your balance. The core idea is the same across plans: shield part of your income, then pay a percentage of the rest.',
      'The shielded amount is a multiple of the federal poverty guideline for your family size. Plans differ in the multiplier and the percentage, and the rules have changed over time, so this calculator makes every one of them an input. The defaults are illustrative examples, not claims about the current year.',
      'It estimates a payment only. It does not model forgiveness timelines, interest subsidies, married-filing-separately rules or which plans you are eligible for.',
    ],
    sections: [
      {
        heading: 'How to use the right numbers',
        paragraphs: ['Look up the HHS poverty guideline for the plan year, then the multiplier and percentage for your specific plan on the Federal Student Aid site or from your servicer. Enter them above. Your servicer calculates the official payment.'],
      },
    ],
    faq: [
      { q: 'What is the payment on $60,000 AGI for one person?', a: 'With the default guideline of $15,650, a 150% multiplier and 10% plan percent: protected income is $23,475, discretionary income is $36,525, the annual payment is $3,652.50 and the monthly payment is $304.38.' },
      { q: 'How does family size change it?', a: 'Each extra person raises the guideline by the added amount. For a family of 3 at $60,000 AGI with the defaults, the guideline is $26,650, protected income $39,975, discretionary income $20,025, and the monthly payment $166.88.' },
      { q: 'Can the payment be $0?', a: 'Yes. If AGI is at or below protected income, discretionary income is zero. At $20,000 AGI for one person with the defaults, protected income is $23,475, so the payment is $0.' },
      { q: 'What does the optional cap do?', a: 'Some plans never charge more than the standard 10-year payment. If you enter $250 as the cap, the $304.38 monthly payment above becomes $250.00.' },
      { q: 'Are the default numbers current?', a: 'No. They are illustrative. Enter the poverty guideline, multiplier and percentage that apply to your plan and year.' },
    ],
    sources: [
      { label: 'Federal Student Aid: Income-driven repayment plans', url: 'https://studentaid.gov/manage-loans/repayment/plans/income-driven' },
      { label: 'HHS: Poverty guidelines', url: 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines' },
    ],
  },
  related: ['student-loan-payoff', 'student-loan-interest-deduction', 'student-loan-accrual', 'budget-50-30-20', 'take-home-pay'],
  examples: [
    {
      // guideline 15,650; protected 15,650 × 1.5 = 23,475; discretionary 36,525; × 10% = 3,652.50; / 12 = 304.375.
      values: { agi: 60000, family: 1, guideline: 15650, extra: 5500, multiplier: 150, planPct: 10 },
      expect: { protected: 23475, discretionary: 36525, annual: 3652.5, monthly: 304.375 },
      tolerance: 1e-6,
    },
    {
      // guideline 15,650 + 2 × 5,500 = 26,650; protected 39,975; discretionary 20,025; × 10% = 2,002.50; / 12 = 166.875.
      values: { agi: 60000, family: 3, guideline: 15650, extra: 5500, multiplier: 150, planPct: 10 },
      expect: { protected: 39975, discretionary: 20025, annual: 2002.5, monthly: 166.875 },
      tolerance: 1e-6,
    },
    {
      // AGI 20,000 < protected 23,475: discretionary 0.
      values: { agi: 20000, family: 1, guideline: 15650, extra: 5500, multiplier: 150, planPct: 10 },
      expect: { discretionary: 0, annual: 0, monthly: 0 },
      tolerance: 1e-6,
    },
    {
      // uncapped 304.375 > cap 250: monthly 250, annual 3,000.
      values: { agi: 60000, family: 1, guideline: 15650, extra: 5500, multiplier: 150, planPct: 10, cap: 250 },
      expect: { monthly: 250, annual: 3000 },
      tolerance: 1e-6,
    },
  ],
});
