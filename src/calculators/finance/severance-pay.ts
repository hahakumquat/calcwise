import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'severance-pay',
  title: 'Severance Pay Calculator: Weeks of Pay Estimate',
  category: 'finance',
  description: 'Estimate severance from your pay, years of service and weeks per year, add unused PTO, and see how many months of expenses the total could cover.',
  keywords: ['severance pay calculator', 'severance calculator', 'how much severance', 'severance weeks per year of service', 'layoff package calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'salary', label: 'Annual pay', type: 'number', prefix: '$', default: 78000, min: 0, step: 1000, info: 'Your yearly base pay before tax. Weekly pay is this divided by 52.' },
    { id: 'years', label: 'Years of service', type: 'number', suffix: 'years', default: 6, min: 0, max: 60, step: 0.5, info: 'Full years you worked for the employer. Fractions are fine.' },
    { id: 'rate', label: 'Weeks of pay per year of service', type: 'number', default: 2, min: 0, max: 10, step: 0.5, help: 'A common rule of thumb is 1 to 2. Not a legal minimum.', info: 'What your offer or policy says. Many private employers offer 1 to 2 weeks per year, but no general law requires severance in the US.' },
    { id: 'cap', label: 'Cap on weeks', type: 'number', suffix: 'weeks', min: 0, step: 1, optional: true, help: 'Leave blank if there is no cap.', info: 'Some packages stop at a maximum number of weeks.' },
    { id: 'pto', label: 'Unused PTO to be paid out', type: 'number', suffix: 'days', default: 0, min: 0, step: 0.5, optional: true, info: 'Paid at a daily rate of annual pay ÷ 260 working days. Whether PTO is paid out depends on your state and policy.' },
    { id: 'expenses', label: 'Monthly expenses', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, optional: true, help: 'Used to show how long the package lasts. Leave 0 to skip.', info: 'What you spend per month. The package is gross, so taxes will reduce it.' },
  ],
  outputs: [
    { id: 'total', label: 'Estimated package (before tax)', format: 'currency', primary: true, info: 'Severance weeks × weekly pay + PTO days × daily pay.' },
    { id: 'weeks', label: 'Weeks of severance', format: 'number', info: 'Years × weeks per year, limited by the cap if you set one.' },
    { id: 'severance', label: 'Severance pay', format: 'currency', info: 'Weeks × weekly pay.' },
    { id: 'ptoPay', label: 'PTO payout', format: 'currency', info: 'PTO days × (annual pay ÷ 260).' },
    { id: 'months', label: 'Months of expenses covered', format: 'number', info: 'Package ÷ monthly expenses. Before tax, so the real figure is lower.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const years = num(v.years);
    const rate = num(v.rate);
    const cap = num(v.cap);
    const pto = num(v.pto) ?? 0;
    const exp = num(v.expenses) ?? 0;
    if (salary === null || years === null || rate === null) return { total: null };
    if (salary < 0 || years < 0 || rate < 0 || pto < 0 || exp < 0 || (cap !== null && cap < 0)) return { total: null };

    const weekly = salary / 52;
    const daily = salary / 260;
    const raw = years * rate;
    const weeks = cap !== null && cap > 0 ? Math.min(raw, cap) : raw;
    const severance = weeks * weekly;
    const ptoPay = pto * daily;
    const total = severance + ptoPay;
    const months = exp > 0 ? total / exp : null;
    const capped = cap !== null && cap > 0 && raw > cap;

    return {
      total,
      weeks,
      severance,
      ptoPay,
      months,
      tone: 'good',
      badge: `${+weeks.toFixed(1)} weeks of pay`,
      chart: [
        moneyDonut('What is in the package', [
          { label: 'Severance', value: severance },
          { label: 'PTO payout', value: ptoPay },
        ].filter((s) => s.value > 0), money(total, 0), 'before tax'),
      ],
      steps: [
        `Weekly pay = ${money(salary, 2)} ÷ 52 = ${money(weekly, 2)}`,
        `Weeks = ${years} years × ${rate} = ${+raw.toFixed(2)}${capped ? `, capped at ${cap}` : ''}`,
        `Severance = ${+weeks.toFixed(2)} × ${money(weekly, 2)} = ${money(severance, 2)}`,
        ...(pto > 0 ? [`PTO = ${pto} days × (${money(salary, 2)} ÷ 260) = ${money(ptoPay, 2)}`] : []),
        `Total = ${money(total, 2)}`,
        ...(months !== null ? [`Months covered = ${money(total, 2)} ÷ ${money(exp, 2)} = ${+months.toFixed(2)}`] : []),
      ],
      note: `This is a before-tax estimate from the numbers you entered. Real packages depend on your agreement, and taxes will reduce what you receive. Not legal or financial advice.`,
    };
  },
  content: {
    formula: [
      'Weekly pay = annual pay ÷ 52',
      'Severance weeks = years of service × weeks per year (limited by the cap, if any)',
      'Package = severance weeks × weekly pay + unused PTO days × (annual pay ÷ 260)',
      'Months covered = package ÷ monthly expenses',
    ],
    body: [
      'If you are facing a layoff, one of the first questions is how much runway the package gives you. Enter your annual pay, your years of service and the number of weeks per year your employer offers, and this calculator turns it into a dollar estimate.',
      'A common rule of thumb in private companies is one to two weeks of pay per year of service, but it is only a rule of thumb. In the US there is no general law that requires severance, so the real number is whatever your offer letter, policy or separation agreement says. Treat the weeks-per-year input as something to check against your paperwork.',
      'Add unused paid time off if it will be paid out, and your monthly expenses to see how many months the package could cover. The total is before tax, so plan on receiving less.',
    ],
    sections: [
      {
        heading: 'What to check before you sign',
        paragraphs: [
          'Read what the agreement asks of you in return, such as a release of claims, and ask how health coverage and any final pay are handled. For a longer view of your cushion, try the savings runway calculator. Federal employees follow a separate formula set by the Office of Personnel Management, which this page does not model.',
        ],
      },
    ],
    faq: [
      { q: 'How much severance would $78,000 and 6 years give at 2 weeks per year?', a: 'Weekly pay is $1,500. Six years × 2 weeks is 12 weeks, so severance is $18,000 before tax.' },
      { q: 'How is unused PTO valued?', a: 'Each day is annual pay ÷ 260 working days. At $78,000 a day is $300, so 5 days is $1,500.' },
      { q: 'What does the cap do?', a: 'It limits the weeks. With 10 years at 2 weeks (20 weeks) and a 16-week cap on $78,000, severance is 16 × $1,500 = $24,000.' },
      { q: 'Is severance required by law?', a: 'In the US, generally no. It comes from your contract, policy or negotiation, which is why the weeks per year is an input here and not a fixed number.' },
      { q: 'Is the result after tax?', a: 'No. It is a before-tax estimate, and withholding on lump sums can be higher than usual.' },
    ],
    sources: [
      { label: 'OPM: Severance pay (federal employees, a separate formula)', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/severance-pay/' },
    ],
  },
  related: ['savings-runway', 'emergency-fund', 'take-home-pay', 'bonus-tax', 'salary-to-hourly'],
  examples: [
    {
      // weekly 78000/52 = 1500; 6 × 2 = 12 weeks = 18,000; PTO 5 × (78000/260 = 300) = 1,500; total 19,500; 19,500/3,000 = 6.5 months.
      values: { salary: 78000, years: 6, rate: 2, pto: 5, expenses: 3000 },
      expect: { total: 19500, weeks: 12, severance: 18000, ptoPay: 1500, months: 6.5 },
      tolerance: 0.01,
    },
    {
      // 10 × 2 = 20 weeks capped at 16 → 16 × 1,500 = 24,000; no PTO; 24,000/4,000 = 6 months.
      values: { salary: 78000, years: 10, rate: 2, cap: 16, pto: 0, expenses: 4000 },
      expect: { total: 24000, weeks: 16, severance: 24000, ptoPay: 0, months: 6 },
      tolerance: 0.01,
    },
  ],
});
