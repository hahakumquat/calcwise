import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'signon-bonus-clawback',
  title: 'Sign-On Bonus Clawback Calculator',
  category: 'finance',
  description: 'Leaving before your sign-on bonus period ends? See how much you would owe back, what you actually received after tax, and what you keep.',
  keywords: ['sign on bonus clawback calculator', 'signing bonus repayment', 'leave job before signing bonus period', 'prorated signing bonus repayment', 'sign on bonus payback'],
  updated: '2026-11-23',
  inputs: [
    { id: 'bonus', label: 'Gross sign-on bonus', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The bonus before tax, as written in your offer letter.' },
    { id: 'period', label: 'Repayment period', type: 'number', suffix: 'months', default: 12, min: 1, max: 120, step: 1, info: 'How long you must stay to keep the bonus. Often 12 or 24 months.' },
    { id: 'worked', label: 'Months you worked', type: 'number', suffix: 'months', default: 8, min: 0, max: 600, step: 1, info: 'Full months between your start date and your last day.' },
    {
      id: 'rule', label: 'Repayment rule', type: 'select', default: 'prorated',
      info: 'Prorated: you repay only the months you did not work. All-or-nothing: you repay the full bonus if you leave before the period ends.',
      options: [
        { value: 'prorated', label: 'Prorated' },
        { value: 'all', label: 'All or nothing' },
      ],
    },
    { id: 'rate', label: 'Tax withheld on the bonus', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 1, info: 'The share of the bonus taken for tax when it was paid. Check your pay stub.' },
  ],
  outputs: [
    { id: 'kept', label: 'What you keep', format: 'currency', primary: true, info: 'Bonus received after tax, minus the amount you repay. Negative means you end up paying out of pocket.' },
    { id: 'owed', label: 'Amount you owe back', format: 'currency', info: 'The gross amount the employer asks for under the rule you chose.' },
    { id: 'received', label: 'Bonus received after tax', format: 'currency', info: 'Gross bonus minus the tax withheld.' },
  ],
  compute: (v) => {
    const bonus = num(v.bonus);
    const period = num(v.period);
    const worked = num(v.worked);
    const rate = num(v.rate);
    if (bonus === null || period === null || worked === null || rate === null) return { kept: null };
    if (bonus < 0 || worked < 0 || rate < 0) return { kept: null, error: 'Values cannot be negative.' };
    if (period < 1) return { kept: null, error: 'The repayment period must be at least 1 month.' };
    if (rate > 100) return { kept: null, error: 'The tax rate cannot be above 100%.' };
    if (bonus === 0) return { kept: null, note: 'Enter a bonus amount to see the result.' };
    const prorated = v.rule !== 'all';
    const stayed = worked >= period;
    const owed = stayed ? 0 : prorated ? (bonus * (period - worked)) / period : bonus;
    const received = bonus * (1 - rate / 100);
    const kept = received - owed;
    return {
      kept,
      owed,
      received,
      tone: stayed ? 'good' : kept < -0.005 ? 'warn' : 'ok',
      badge: stayed ? 'Period completed: nothing owed' : kept < -0.005 ? 'You would pay out of pocket' : 'You keep part of it',
      chart: {
        type: 'bar',
        title: 'Where the bonus goes',
        categories: ['Gross bonus', 'Received after tax', 'Owed back', 'You keep'],
        series: [{ name: 'Amount', values: [bonus, received, owed, kept] }],
        format: { format: 'currency' },
      },
      steps: [
        stayed
          ? `Worked ${worked} of ${period} months, so nothing is owed.`
          : prorated
            ? `Owed: ${usd(bonus)} × (${period} − ${worked}) ÷ ${period} = ${usd(owed)}`
            : `Left before ${period} months, so the full bonus is owed: ${usd(owed)}`,
        `Received after tax: ${usd(bonus)} × (1 − ${rate}%) = ${usd(received)}`,
        `You keep: ${usd(received)} − ${usd(owed)} = ${usd(kept)}`,
      ],
      note: 'Repayment is treated as the gross amount paid out of pocket. Whether you get a tax refund or deduction for the repaid amount depends on the tax year in which you repay and is not computed. Your offer letter or bonus agreement sets the real terms, including whether vacation or notice time counts as months worked.',
    };
  },
  content: {
    formula: [
      'Owed (prorated) = bonus × (period − months worked) ÷ period',
      'Owed (all or nothing) = full bonus if months worked < period, otherwise 0',
      'Received after tax = bonus × (1 − tax withheld %)',
      'You keep = received after tax − owed',
    ],
    body: [
      'Many sign-on bonuses come with a repayment clause: stay for a set number of months, usually 12 or 24, or pay some or all of it back. This calculator shows what that clause costs if you leave early.',
      'The catch most people miss is tax. The bonus was taxed when it was paid, so you received less than the headline figure, but the employer usually asks for the gross amount back. Leaving early can therefore leave you with less than nothing: a prorated repayment can eat most of what you took home, and an all-or-nothing clause can cost more than you received.',
      'Terms differ by employer. Some prorate by month, some by quarter, some drop the repayment after a partial period and some require the full amount until the last day. Enter the rule from your letter, and read the exact wording on when the period starts and ends before you give notice. A few extra weeks can change the result, so use the months-worked field to test your last day.',
      'What this does not compute: any tax refund or deduction for money you repay, which depends on whether you repay in the same tax year, and state rules on wage deductions. Ask the employer in writing how repayment is handled for tax, and a tax professional if the amount is large.',
    ],
    faq: [
      { q: 'How much of a sign-on bonus do I pay back if I leave?', a: 'It depends on the clause. With a prorated clause on a $10,000 bonus over 12 months, leaving after 8 months means repaying 4/12 of it, which is $3,333.33. With an all-or-nothing clause you would repay the full $10,000.' },
      { q: 'Do I repay the gross or the after-tax bonus?', a: 'Employers typically ask for the gross amount, even though you received less after tax. This calculator assumes that. With 30% withheld on $10,000 you received $7,000 and would owe $3,333.33 back, so you keep $3,666.67.' },
      { q: 'Can I owe more than I received?', a: 'Yes. With an all-or-nothing clause and 30% withheld, leaving early means repaying $10,000 against $7,000 received, a net cost of $3,000. You may get some tax back depending on the year you repay, which is not computed here.' },
      { q: 'Does the clawback period count calendar months or full months?', a: 'That is set by your agreement. Enter the full months you would have worked on your last day, and test a later date to see how much a few extra weeks change the result.' },
      { q: 'Can an employer take the repayment from my final paycheck?', a: 'Rules on deductions from final pay vary by state and by what you signed. Ask the employer to confirm in writing how they will collect, and check your state labor department if you are unsure.' },
    ],
    sources: [
      { label: 'IRS Publication 525: Taxable and Nontaxable Income (repayments)', url: 'https://www.irs.gov/publications/p525' },
      { label: 'IRS Publication 15: Employer\'s Tax Guide (supplemental wages)', url: 'https://www.irs.gov/publications/p15' },
    ],
  },
  related: ['bonus-tax', 'job-offer-comparison', 'bonus-vs-raise'],
  examples: [
    // owed 10000 × 4/12 = 3333.333333; received 7000; kept 3666.666667
    { values: { bonus: 10000, period: 12, worked: 8, rule: 'prorated', rate: 30 }, expect: { owed: 3333.333333, received: 7000, kept: 3666.666667 }, tolerance: 1e-3 },
    // all or nothing: owed 10000; received 7000; kept -3000
    { values: { bonus: 10000, period: 12, worked: 8, rule: 'all', rate: 30 }, expect: { owed: 10000, received: 7000, kept: -3000 }, tolerance: 1e-3 },
    // period completed: owed 0; received 22500 × ... 15000 × 0.78 = 11700
    { values: { bonus: 15000, period: 24, worked: 24, rule: 'prorated', rate: 22 }, expect: { owed: 0, received: 11700, kept: 11700 }, tolerance: 1e-3 },
  ],
});
