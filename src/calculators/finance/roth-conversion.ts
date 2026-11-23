import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'roth-conversion',
  title: 'Roth Conversion Calculator: Tax Now vs Later',
  category: 'finance',
  description: 'Price a Roth conversion: tax you pay now, tax you avoid on the growth later, and whether converting beats waiting at your expected future tax rate.',
  keywords: ['roth conversion calculator', 'should i convert to roth', 'roth conversion tax cost', 'roth conversion break even', 'traditional ira to roth ira', 'roth conversion before year end'],
  updated: '2026-11-23',
  inputs: [
    { id: 'amount', label: 'Amount to convert', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'The pre-tax money you move from a traditional IRA or 401(k) into a Roth IRA.' },
    { id: 'rateNow', label: 'Tax rate on the conversion', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 1, info: 'Your marginal rate on the converted amount this year, including state tax. The conversion is added to your income.' },
    { id: 'years', label: 'Years until you withdraw', type: 'number', suffix: 'years', default: 20, min: 0, max: 60, step: 1, info: 'How long the money stays invested before you need it.' },
    { id: 'ret', label: 'Annual investment return', type: 'number', suffix: '%', default: 6, min: -50, max: 50, step: 0.5, info: 'An assumption, not a forecast. The same return is used for the converted money and for the tax money.' },
    { id: 'rateLater', label: 'Expected tax rate on withdrawals', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 1, info: 'Your guess at your marginal rate when you would otherwise withdraw from the traditional account.' },
  ],
  outputs: [
    { id: 'net', label: 'Advantage of converting (at withdrawal time)', format: 'currency', primary: true, info: 'Tax avoided later minus the tax paid now, grown at the same return. Negative means waiting wins.' },
    { id: 'taxNow', label: 'Tax paid now on the conversion', format: 'currency', info: 'Amount × tax rate now, paid from money outside the IRA.' },
    { id: 'futureValue', label: 'Converted amount at withdrawal', format: 'currency', info: 'Amount grown at the annual return for the number of years. Roth withdrawals are tax-free.' },
    { id: 'taxAvoided', label: 'Tax avoided later', format: 'currency', info: 'What you would have paid on that grown balance at your expected future rate.' },
    { id: 'taxNowGrown', label: 'Tax paid now, if it had stayed invested', format: 'currency', info: 'The cost of converting in future dollars: the tax money grown at the same return.' },
  ],
  compute: (v) => {
    const amount = num(v.amount);
    const rn = num(v.rateNow);
    const years = num(v.years);
    const ret = num(v.ret);
    const rl = num(v.rateLater);
    if (amount === null || rn === null || years === null || ret === null || rl === null) return { net: null };
    if (amount < 0 || rn < 0 || rl < 0 || years < 0) return { net: null, error: 'Values cannot be negative.' };
    if (rn > 100 || rl > 100) return { net: null, error: 'Tax rates cannot be above 100%.' };
    if (ret <= -100) return { net: null, error: 'The return must be above -100%.' };
    if (amount === 0) return { net: null, note: 'Enter an amount to convert to see the result.' };
    const growth = Math.pow(1 + ret / 100, years);
    const taxNow = amount * (rn / 100);
    const fv = amount * growth;
    const avoided = fv * (rl / 100);
    const taxGrown = taxNow * growth;
    const net = avoided - taxGrown;
    const wins = net > 0.005;
    return {
      net,
      taxNow,
      futureValue: fv,
      taxAvoided: avoided,
      taxNowGrown: taxGrown,
      tone: wins ? 'good' : net < -0.005 ? 'warn' : 'ok',
      badge: wins ? 'Converting comes out ahead' : net < -0.005 ? 'Waiting comes out ahead' : 'Break-even',
      chart: {
        type: 'bar',
        title: 'In dollars at withdrawal time',
        categories: ['Cost: tax now, grown', 'Benefit: tax avoided later'],
        series: [{ name: 'Amount', values: [taxGrown, avoided] }],
        format: { format: 'currency' },
      },
      steps: [
        `Tax now: ${usd(amount)} × ${rn}% = ${usd(taxNow)}`,
        `Growth factor: (1 + ${ret}%)^${years} = ${growth.toFixed(4)}`,
        `Converted amount at withdrawal: ${usd(amount)} × ${growth.toFixed(4)} = ${usd(fv)}`,
        `Tax avoided later: ${usd(fv)} × ${rl}% = ${usd(avoided)}`,
        `Tax now, kept invested instead: ${usd(taxNow)} × ${growth.toFixed(4)} = ${usd(taxGrown)}`,
        `Advantage: ${usd(avoided)} − ${usd(taxGrown)} = ${usd(net)}`,
      ],
      note: 'Assumes the tax is paid from money outside the IRA, that this money would earn the same tax-free return, and that the conversion does not push you into a higher bracket than the rate you entered. Medicare premium surcharges, the loss of credits, state rules and the five-year rule on conversions are not computed. Check IRS Publication 590-A or a tax professional.',
    };
  },
  content: {
    formula: [
      'Tax now = amount × tax rate now',
      'Growth factor = (1 + annual return)^years',
      'Tax avoided later = amount × growth factor × expected future tax rate',
      'Advantage = tax avoided later − tax now × growth factor',
    ],
    body: [
      'A Roth conversion moves money from a traditional IRA or 401(k) into a Roth IRA. You pay income tax on the converted amount this year, and in return the money and all its growth come out tax-free later. So you are choosing between paying tax now on a smaller number and paying tax later on a bigger one.',
      'This calculator prices that trade. It takes the tax you pay now, grows it at the same return as the converted money, and compares it with the tax you would have paid later on the grown balance. When the tax is paid from money outside the IRA and both pots earn the same return, the advantage reduces to the converted balance times the gap between your future rate and your rate now. Convert when you expect to be taxed at a higher rate later, and wait when you expect a lower one.',
      'Years with unusually low income, such as a career break, a gap before retirement or a sabbatical, are the classic times to convert, because the rate now is low. A conversion counts as income for the year it happens, and a large one can push you into a higher bracket, so the rate you enter should be the rate on the last dollars converted, not your average rate.',
      'The conversion has to be completed by December 31 to count for this tax year. What this does not compute: the effect on Medicare premiums or tax credits, state tax differences, the five-year rule on converted money, and paying the tax out of the converted amount itself, which reduces the benefit. Check IRS Publication 590-A and your own return.',
    ],
    faq: [
      { q: 'Is a Roth conversion worth it?', a: 'It is worth it when your tax rate on withdrawals later is higher than the rate you pay on the conversion now. With $20,000 converted at 22%, 20 years at 6% and a 24% future rate, converting comes out about $1,282.85 ahead. At a 22% future rate it breaks even.' },
      { q: 'How much tax do I pay on a conversion?', a: 'The converted amount is added to your taxable income for the year. At a 22% rate, converting $20,000 costs $4,400. Enter the rate that applies to the top of the converted amount, since a large conversion can push part of it into a higher bracket.' },
      { q: 'Why is the tax paid now grown at the same return?', a: 'Because money spent on the conversion tax could have stayed invested. Comparing tax paid now with tax avoided later in today\'s dollars would ignore that, so both sides are shown in dollars at withdrawal time.' },
      { q: 'What if I pay the tax from the converted money?', a: 'Then less money lands in the Roth account and the benefit shrinks. This calculator assumes you pay the tax from savings outside the IRA. Paying it from the conversion is usually worse, and withdrawals before age 59½ may carry a penalty.' },
      { q: 'What is the deadline for a Roth conversion?', a: 'A conversion counts for the tax year in which it is completed, so for this year it must be done by December 31. Contributions can be made until the tax filing deadline, but conversions cannot.' },
    ],
    sources: [
      { label: 'IRS: Roth IRAs and rollovers', url: 'https://www.irs.gov/retirement-plans/roth-iras' },
      { label: 'IRS Publication 590-A: Contributions to IRAs', url: 'https://www.irs.gov/publications/p590a' },
    ],
  },
  related: ['roth-vs-traditional', 'roth-ira', 'rmd-calculator'],
  examples: [
    // growth 1.06^20 = 3.2071354720; tax 4400; fv 64142.709440; avoided 15394.250266; grown 14111.396077; net 1282.854189
    { values: { amount: 20000, rateNow: 22, years: 20, ret: 6, rateLater: 24 }, expect: { taxNow: 4400, futureValue: 64142.70944, taxAvoided: 15394.250266, net: 1282.854189 }, tolerance: 1e-3 },
    // growth 1.05^10 = 1.6288946268; tax 1200; fv 16288.946268; net = fv × 0.10 = 1628.894627
    { values: { amount: 10000, rateNow: 12, years: 10, ret: 5, rateLater: 22 }, expect: { taxNow: 1200, futureValue: 16288.946268, net: 1628.894627 }, tolerance: 1e-3 },
  ],
});
