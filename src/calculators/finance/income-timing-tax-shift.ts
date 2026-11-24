import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'income-timing-tax-shift',
  title: 'Income Timing Calculator: This Year or Next',
  category: 'finance',
  description: 'Should you take income this year or defer it to January? Compare the tax at this year\'s and next year\'s rate, plus the value of paying tax later.',
  keywords: ['defer income to next year calculator', 'invoice in december or january', 'income timing tax', 'defer bonus to next year tax', 'push income into next tax year', 'year end income shifting'],
  updated: '2026-11-24',
  inputs: [
    { id: 'amount', label: 'Income you could shift', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'A freelance invoice, bonus or gain you can choose to take this year or next.' },
    { id: 'thisRate', label: 'Marginal tax rate this year', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 0.5, info: 'Combined rate you would pay on this income if taken this year.' },
    { id: 'nextRate', label: 'Expected marginal rate next year', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 0.5, info: 'Combined rate if taken next year. Your best estimate.' },
    { id: 'delay', label: 'Months the tax bill is pushed back', type: 'number', suffix: 'months', default: 12, min: 0, max: 24, step: 1, info: 'Deferring usually delays the tax by about a year. Use 0 to ignore the time value.' },
    { id: 'savings', label: 'Savings rate (APY)', type: 'number', suffix: '%', default: 4.5, min: 0, max: 100, step: 0.1, info: 'What you could earn on the tax money while you hold it. The default is an example.' },
  ],
  outputs: [
    { id: 'advantage', label: 'Advantage of deferring', format: 'currency', primary: true, info: 'Rate saving plus time value. Negative means taking it this year is cheaper.' },
    { id: 'taxNow', label: 'Tax if taken this year', format: 'currency', info: 'Amount × this year\'s rate.' },
    { id: 'taxLater', label: 'Tax if taken next year', format: 'currency', info: 'Amount × next year\'s rate.' },
    { id: 'rateGap', label: 'Rate saving from deferring', format: 'currency', info: 'Tax this year − tax next year.' },
    { id: 'timeValue', label: 'Time value of paying later', format: 'currency', info: 'Tax this year × savings rate × months ÷ 12. Simple interest.' },
  ],
  compute: (v) => {
    const amount = num(v.amount), a = num(v.thisRate), b = num(v.nextRate), d = num(v.delay), s = num(v.savings);
    if ([amount, a, b, d, s].some((x) => x === null)) return { advantage: null };
    if ([amount, a, b, d, s].some((x) => (x as number) < 0)) return { advantage: null, error: 'Values cannot be negative.' };
    if ((a as number) > 100 || (b as number) > 100) return { advantage: null, error: 'Rates cannot be above 100%.' };
    const taxNow = (amount as number) * ((a as number) / 100);
    const taxLater = (amount as number) * ((b as number) / 100);
    const rateGap = taxNow - taxLater;
    const timeValue = taxNow * ((s as number) / 100) * ((d as number) / 12);
    const advantage = rateGap + timeValue;
    return {
      advantage, taxNow, taxLater, rateGap, timeValue,
      tone: advantage >= 0 ? 'good' : 'warn',
      badge: advantage >= 0 ? `Deferring is ${usd(advantage)} better` : `Taking it this year is ${usd(-advantage)} better`,
      chart: {
        type: 'bar',
        title: 'Tax on the income by timing',
        categories: ['Take this year', 'Take next year'],
        series: [{ name: 'Tax', values: [taxNow, taxLater] }],
        format: { format: 'currency' },
      },
      steps: [
        `Tax this year: ${usd(amount as number)} × ${a}% = ${usd(taxNow)}`,
        `Tax next year: ${usd(amount as number)} × ${b}% = ${usd(taxLater)}`,
        `Rate saving: ${usd(taxNow)} − ${usd(taxLater)} = ${usd(rateGap)}`,
        `Time value: ${usd(taxNow)} × ${s}% × ${d} ÷ 12 = ${usd(timeValue)}`,
        `Advantage of deferring: ${usd(rateGap)} + ${usd(timeValue)} = ${usd(advantage)}`,
      ],
      note: 'This compares marginal rates you enter. It does not check whether your employer or the tax rules let you defer, cash-method accounting rules, or the risk that the income never arrives or your rate turns out higher.',
    };
  },
  content: {
    formula: [
      'Tax this year = amount × this year\'s rate',
      'Tax next year = amount × next year\'s rate',
      'Time value = tax this year × savings rate × months ÷ 12',
      'Advantage of deferring = (tax this year − tax next year) + time value',
    ],
    body: [
      'If you can choose when income lands, such as invoicing in December or January, the timing changes your tax in two ways. The rate may differ between years, and deferring pushes the tax bill back, so that money stays with you longer.',
      'Enter the amount, the marginal rate you expect in each year, and how long deferring delays the tax. The result is positive when deferring is cheaper and negative when taking the income now is cheaper.',
      'Rates are your own estimates. Not every income can be deferred, and some rules limit it, so check your situation before acting. This calculator only does the arithmetic.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: '$10,000 at 24% this year is $2,400 of tax; at 22% next year it is $2,200, a $200 rate saving. Holding $2,400 for 12 months at 4.5% is worth $108, so deferring is $308 better.' },
      { q: 'When is taking income this year better?', a: 'When next year\'s rate is higher, for example a raise or a big expected gain, the rate gap can outweigh the time value. The second example shows $5,000 at 22% now vs 24% later: deferring is $56 worse.' },
      { q: 'Why include the time value?', a: 'Deferring usually delays the tax by about a year, and you can earn interest on that money meanwhile. Set months to 0 to leave it out.' },
      { q: 'Can I always defer income?', a: 'No. It depends on how you are paid and on tax rules. This is not tax advice.' },
    ],
    sources: [
      { label: 'IRS: Tax Withholding Estimator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
    ],
  },
  related: ['bracket-headroom', 'standard-vs-itemized', 'bonus-tax'],
  examples: [
    // 2400, 2200, gap 200, tv 2400*.045 = 108, adv 308
    { values: { amount: 10000, thisRate: 24, nextRate: 22, delay: 12, savings: 4.5 }, expect: { advantage: 308, taxNow: 2400, taxLater: 2200, rateGap: 200, timeValue: 108 }, tolerance: 0.01 },
    // 1100, 1200, gap -100, tv 1100*.04 = 44, adv -56
    { values: { amount: 5000, thisRate: 22, nextRate: 24, delay: 12, savings: 4 }, expect: { advantage: -56, rateGap: -100, timeValue: 44 }, tolerance: 0.01 },
    { values: { amount: 1000, thisRate: 20, nextRate: 20, delay: 0, savings: 5 }, expect: { advantage: 0 }, tolerance: 0.01 },
  ],
});
