import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'refund-interest-forgone',
  title: 'Tax Refund Interest Forgone Calculator',
  category: 'finance',
  description: 'See the interest you could have earned if a big tax refund had stayed in your paychecks and savings instead of going to the IRS first.',
  keywords: ['tax refund interest calculator', 'big tax refund interest lost', 'tax refund interest free loan', 'interest on tax refund opportunity cost', 'overwithholding cost', 'refund per paycheck'],
  updated: '2026-11-24',
  inputs: [
    { id: 'refund', label: 'Tax refund', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, info: 'The refund you received or expect.' },
    { id: 'rate', label: 'Savings rate (APY)', type: 'number', suffix: '%', default: 4.5, min: 0, max: 100, step: 0.1, info: 'What a savings account pays. The default is an example, so use your own rate.' },
    { id: 'months', label: 'Months the money was effectively lent', type: 'number', suffix: 'months', default: 6, min: 0, max: 12, step: 1, info: 'Over-withholding builds up through the year, so on average the money sat with the IRS about half the year. 6 is an assumption; change it if you know better.' },
    { id: 'paychecks', label: 'Paychecks per year', type: 'number', default: 26, min: 1, max: 60, step: 1, info: '26 for every two weeks, 24 for twice a month, 12 for monthly.' },
  ],
  outputs: [
    { id: 'interest', label: 'Interest forgone', format: 'currency', primary: true, info: 'Refund × rate × months ÷ 12. Simple interest, no compounding.' },
    { id: 'perMonth', label: 'Per month', format: 'currency', info: 'Interest forgone ÷ months.' },
    { id: 'perCheck', label: 'Refund spread over a year of paychecks', format: 'currency', info: 'Refund ÷ paychecks per year: the extra take-home per paycheck if the same amount had not been withheld.' },
  ],
  compute: (v) => {
    const refund = num(v.refund), rate = num(v.rate), months = num(v.months), paychecks = num(v.paychecks);
    if ([refund, rate, months, paychecks].some((x) => x === null)) return { interest: null };
    if ([refund, rate, months].some((x) => (x as number) < 0)) return { interest: null, error: 'Values cannot be negative.' };
    if ((paychecks as number) < 1) return { interest: null, error: 'Enter at least 1 paycheck per year.' };
    const interest = (refund as number) * ((rate as number) / 100) * ((months as number) / 12);
    const perMonth = (months as number) === 0 ? 0 : interest / (months as number);
    const perCheck = (refund as number) / (paychecks as number);
    return {
      interest, perMonth, perCheck,
      tone: 'ok',
      badge: `${usd(interest)} of interest forgone`,
      chart: {
        type: 'bar',
        title: 'Refund and the interest it could have earned',
        categories: ['Refund', 'Interest forgone'],
        series: [{ name: 'Amount', values: [refund as number, interest] }],
        format: { format: 'currency' },
      },
      steps: [
        `Interest: ${usd(refund as number)} × ${rate}% × ${months} ÷ 12 = ${usd(interest)}`,
        `Per month: ${usd(interest)} ÷ ${months} = ${usd(perMonth)}`,
        `Per paycheck: ${usd(refund as number)} ÷ ${paychecks} = ${usd(perCheck)}`,
      ],
      note: 'You do not lose the refund itself, only what it could have earned. The 6-month average is an assumption. Whether to change your withholding is your decision; this only shows the numbers.',
    };
  },
  content: {
    formula: [
      'Interest forgone = refund × savings rate × months ÷ 12',
      'Per month = interest forgone ÷ months',
      'Per paycheck = refund ÷ paychecks per year',
    ],
    body: [
      'A tax refund is your own money coming back. While it sat with the IRS during the year it earned you nothing. This calculator estimates what a savings account would have paid on that money instead.',
      'Because over-withholding builds up gradually, the money was on average with the IRS for about half the year, so the default is 6 months. That is an assumption, not a measurement, and you can change it.',
      'The last number spreads the refund across a year of paychecks. It shows how much more take-home pay each check would have been had that amount not been withheld.',
      'This is simple interest on numbers you enter. It does not advise changing your W-4.',
    ],
    faq: [
      { q: 'How much interest is forgone in the example?', a: 'A $3,000 refund at 4.5% for 6 months is $67.50, about $11.25 a month. Spread over 26 paychecks, $3,000 is $115.38 a paycheck.' },
      { q: 'Do I lose my refund?', a: 'No. You get the refund back. The cost is only the interest it could have earned in the meantime.' },
      { q: 'Why 6 months?', a: 'Withholding builds up over the year, so on average the extra money sat with the IRS about half of it. Change it if your situation differs.' },
      { q: 'Should I change my withholding?', a: 'That is up to you. A smaller refund also means a smaller cushion if your taxes turn out higher.' },
    ],
    sources: [
      { label: 'IRS: Tax Withholding Estimator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
    ],
  },
  related: ['tax-refund-estimator', 'apy-calculator', 'take-home-pay'],
  examples: [
    // 3000 * .045 * .5 = 67.5; /6 = 11.25; 3000/26 = 115.3846
    { values: { refund: 3000, rate: 4.5, months: 6, paychecks: 26 }, expect: { interest: 67.5, perMonth: 11.25, perCheck: 115.38 }, tolerance: 0.01 },
    // 1200 * .04 * 12/12 = 48; /12 = 4; 1200/12 = 100
    { values: { refund: 1200, rate: 4, months: 12, paychecks: 12 }, expect: { interest: 48, perMonth: 4, perCheck: 100 }, tolerance: 0.01 },
    { values: { refund: 2000, rate: 5, months: 0, paychecks: 24 }, expect: { interest: 0, perMonth: 0 }, tolerance: 0.01 },
  ],
});
