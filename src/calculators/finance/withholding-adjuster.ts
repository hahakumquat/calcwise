import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'withholding-adjuster',
  title: 'Withholding Adjuster: Extra Per Paycheck',
  category: 'finance',
  description: 'Turn a projected tax bill or refund into the extra (or smaller) amount to withhold per paycheck so you land on the refund you want.',
  keywords: ['withholding adjustment calculator', 'how much extra to withhold per paycheck', 'w-4 extra withholding calculator', 'change withholding to avoid owing', 'reduce tax refund per paycheck', 'paycheck withholding change'],
  updated: '2026-11-25',
  inputs: [
    { id: 'balance', label: 'Projected balance due (refund as a negative)', type: 'number', prefix: '$', default: 1800, step: 100, info: 'What you expect to owe at filing. If you expect a refund, enter it as a negative number, for example -2400. Take it from your own estimate or a tool like the tax refund estimator.' },
    { id: 'target', label: 'Refund you want', type: 'number', prefix: '$', default: 0, min: 0, step: 100, info: 'The refund you would like to get back. 0 means break even.' },
    { id: 'checks', label: 'Paychecks left this year', type: 'number', default: 12, min: 1, max: 60, step: 1, info: 'Count the paychecks still to come before the year ends. 26 is every two weeks for a full year, 24 twice a month, 12 monthly.' },
  ],
  outputs: [
    { id: 'perCheck', label: 'Change per paycheck', format: 'currency', primary: true, info: 'Positive means withhold more each check; negative means withhold less. Total change ÷ paychecks left.' },
    { id: 'change', label: 'Total change in withholding', format: 'currency', info: 'Balance due + the refund you want.' },
  ],
  compute: (v) => {
    const bal = num(v.balance), target = num(v.target), checks = num(v.checks);
    if (bal === null || target === null || checks === null) return { perCheck: null };
    if (target < 0) return { perCheck: null, error: 'The refund you want cannot be negative.' };
    if (checks < 1) return { perCheck: null, error: 'Enter at least 1 paycheck left.' };
    const change = bal + target;
    const perCheck = change / checks;
    const more = change > 0;
    const none = Math.abs(change) < 0.005;
    return {
      perCheck, change,
      tone: 'ok',
      badge: none ? 'No change needed' : more ? `Withhold ${usd(perCheck)} more per paycheck` : `Withhold ${usd(Math.abs(perCheck))} less per paycheck`,
      chart: {
        type: 'bar',
        title: 'Projected balance, goal and change needed',
        categories: ['Balance due', 'Refund wanted', 'Total change'],
        series: [{ name: 'Amount', values: [bal, -target, change] }],
        format: { format: 'currency' },
      },
      steps: [
        `Total change = ${usd(bal)} + ${usd(target)} = ${usd(change)}`,
        `Per paycheck = ${usd(change)} ÷ ${checks} = ${usd(perCheck)}`,
      ],
      note: 'Your projection is only as good as the estimate behind it. The W-4 line to change and the final figure are yours to confirm. This is general information, not tax advice.',
    };
  },
  content: {
    formula: ['Total change = projected balance due + refund you want', 'Per paycheck = total change ÷ paychecks left', 'Positive = withhold more; negative = withhold less'],
    body: [
      'If your tax bill is heading for a surprise in either direction, the fix is spread across the paychecks you have left. Take the amount you expect to owe, add the refund you would like, and divide by the checks remaining. A positive answer means withhold more each check; a negative one means you can withhold less.',
      'Example: you expect to owe $1,800, want to break even, and have 12 paychecks left. $1,800 ÷ 12 = $150.00 extra per paycheck. Second example: you expect a $2,400 refund (enter -2,400) but only want $400. -2,400 + 400 = -$2,000, and over 26 paychecks that is $76.92 less withheld per check.',
      'The fewer paychecks left, the bigger each adjustment, so earlier changes are gentler. This tool does not calculate your tax: bring your own projection, for instance from a tax estimator. Whether and how to change your Form W-4 is your decision. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much extra should I withhold per paycheck?', a: 'Divide the amount you expect to owe, plus any refund you want, by the paychecks left. Owing $1,800 with 12 checks left and a $0 goal is $150.00 extra per check.' },
      { q: 'How do I enter an expected refund?', a: 'As a negative balance. A $2,400 refund is -2400. If you only want $400 back, the total change is -2,400 + 400 = -$2,000, so you could withhold less.' },
      { q: 'What does a negative result mean?', a: 'You are over-withholding relative to your goal, so you could withhold less per paycheck and keep more of each check.' },
      { q: 'Why do late-year changes cost more per check?', a: 'The same total gets divided across fewer paychecks. 12 checks left turns $1,800 into $150 each; 6 checks left would be $300 each.' },
      { q: 'Does this tell me what my tax will be?', a: 'No. You supply the projected balance or refund. Use your last return, pay stubs or the IRS Tax Withholding Estimator to get one.' },
    ],
    sources: [
      { label: 'IRS: Tax Withholding Estimator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
      { label: 'IRS: Form W-4', url: 'https://www.irs.gov/forms-pubs/about-form-w-4' },
    ],
  },
  related: ['tax-refund-estimator', 'refund-interest-forgone', 'take-home-pay'],
  examples: [
    // 1800 + 0 = 1800; /12 = 150
    { values: { balance: 1800, target: 0, checks: 12 }, expect: { change: 1800, perCheck: 150 }, tolerance: 0.01 },
    // -2400 + 400 = -2000; /26 = -76.923
    { values: { balance: -2400, target: 400, checks: 26 }, expect: { change: -2000, perCheck: -76.92 }, tolerance: 0.01 },
  ],
});
