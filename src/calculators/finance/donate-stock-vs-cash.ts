import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'donate-stock-vs-cash',
  title: 'Donate Stock vs Cash Calculator: Tax Saved',
  category: 'finance',
  description: 'Compare donating appreciated shares with selling and giving cash: capital gains tax avoided, what the charity gets and what your deduction is worth.',
  keywords: ['donate stock vs cash', 'donating appreciated stock calculator', 'donate stock to charity tax savings', 'give stock instead of cash', 'appreciated stock donation', 'charitable giving capital gains'],
  updated: '2026-11-23',
  inputs: [
    { id: 'value', label: 'Current value of the shares', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'What the shares are worth on the day you give them.' },
    { id: 'basis', label: 'Cost basis (what you paid)', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, info: 'Your original purchase cost for these shares, including reinvested dividends.' },
    { id: 'cgRate', label: 'Capital gains tax rate', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 0.5, info: 'The long-term rate you would pay if you sold. Include any state tax or surtax that applies to you.' },
    { id: 'deductRate', label: 'Your tax rate on the deduction', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 1, info: 'Your marginal income tax rate. Only matters if you itemize deductions.' },
  ],
  outputs: [
    { id: 'taxAvoided', label: 'Capital gains tax avoided by giving the shares', format: 'currency', primary: true, info: 'Gain × capital gains rate. This is tax you would owe if you sold the shares first.' },
    { id: 'charityStock', label: 'Charity receives (donating shares)', format: 'currency', info: 'The full value of the shares, because the charity can sell them without paying tax.' },
    { id: 'charityCash', label: 'Charity receives (sell, then donate cash)', format: 'currency', info: 'Value minus the capital gains tax you pay on the sale.' },
    { id: 'deductStock', label: 'Deduction value (donating shares)', format: 'currency', info: 'Value × your tax rate, if you itemize and your deduction limits allow it.' },
    { id: 'deductCash', label: 'Deduction value (donating cash)', format: 'currency', info: 'Cash given × your tax rate, if you itemize and your deduction limits allow it.' },
  ],
  compute: (v) => {
    const val = num(v.value);
    const basis = num(v.basis);
    const cg = num(v.cgRate);
    const dr = num(v.deductRate);
    if (val === null || basis === null || cg === null || dr === null) return { taxAvoided: null };
    if (val < 0 || basis < 0 || cg < 0 || dr < 0) return { taxAvoided: null, error: 'Values cannot be negative.' };
    if (cg > 100 || dr > 100) return { taxAvoided: null, error: 'Rates cannot be above 100%.' };
    if (val === 0) return { taxAvoided: null, note: 'Enter the value of the shares to see the result.' };
    if (basis >= val) {
      return { taxAvoided: null, note: 'These shares are not worth more than you paid, so there is no gain to avoid tax on. Selling them could instead realize a loss you may be able to use, so check that before giving them away.' };
    }
    const gain = val - basis;
    const tax = gain * (cg / 100);
    const cashGift = val - tax;
    const dStock = val * (dr / 100);
    const dCash = cashGift * (dr / 100);
    return {
      taxAvoided: tax,
      charityStock: val,
      charityCash: cashGift,
      deductStock: dStock,
      deductCash: dCash,
      tone: tax > 0 ? 'good' : 'ok',
      badge: tax > 0 ? 'Giving the shares keeps more with the charity' : 'No tax difference at a 0% rate',
      chart: {
        type: 'bar',
        title: 'What the charity receives',
        categories: ['Donate shares', 'Sell, then donate cash'],
        series: [{ name: 'Charity receives', values: [val, cashGift] }],
        format: { format: 'currency' },
      },
      steps: [
        `Gain: ${usd(val)} − ${usd(basis)} = ${usd(gain)}`,
        `Tax if sold: ${usd(gain)} × ${cg}% = ${usd(tax)}`,
        `Cash left to give after selling: ${usd(val)} − ${usd(tax)} = ${usd(cashGift)}`,
        `Deduction value, shares: ${usd(val)} × ${dr}% = ${usd(dStock)}`,
        `Deduction value, cash: ${usd(cashGift)} × ${dr}% = ${usd(dCash)}`,
      ],
      note: 'Deduction limits (a percentage of your income for gifts of appreciated stock), itemizing rules, holding-period requirements and gift acknowledgement are not computed. The deduction only helps if you itemize. Check IRS Publication 526 or a tax professional.',
    };
  },
  content: {
    formula: [
      'Gain = value of shares − cost basis',
      'Capital gains tax avoided = gain × capital gains rate',
      'Charity receives, shares = value; charity receives, cash = value − tax',
      'Deduction value = amount given × your tax rate',
    ],
    body: [
      'If you hold shares that have gone up and you want to give to charity, you have two routes. You can sell the shares, pay capital gains tax, and donate the cash. Or you can give the shares directly to a charity or a donor-advised fund. A charity does not pay tax when it sells them, so the whole value goes to the cause and you never owe tax on the gain.',
      'This calculator compares the two routes for the same shares. It shows the tax you avoid, what the charity receives each way and what the deduction is worth to you at your tax rate. Giving the shares never makes the charity get less, and it is usually the better route for shares held for more than a year with a large gain.',
      'It is not worth giving shares that have fallen below what you paid. In that case there is no gain to avoid, and selling lets you realize the loss, which may offset other gains, and then you can donate the cash.',
      'What this does not compute: the limit on how much you can deduct in a year (for gifts of appreciated stock it is a percentage of your income, with carryover), whether you itemize at all, the one-year holding period for the full fair-market-value deduction, and state tax. Check IRS Publication 526 and your own return.',
    ],
    faq: [
      { q: 'How much tax do I save by donating stock instead of cash?', a: 'With shares worth $10,000, a $4,000 basis and a 15% rate, the gain is $6,000 and the tax you would owe on a sale is $900. Giving the shares avoids that $900, so the charity gets the full $10,000 instead of $9,100.' },
      { q: 'What is the deduction worth?', a: 'At a 24% rate the deduction on $10,000 of shares is $2,400. Selling first and giving the $9,100 left after tax is worth $2,184. That deduction only helps if you itemize.' },
      { q: 'Does the stock have to be held for a year?', a: 'For the deduction at full fair market value, long-term holding (more than one year) is the usual requirement. Shares held a year or less are generally deductible only at cost basis. This calculator does not check holding periods, so confirm with IRS Publication 526.' },
      { q: 'What if my shares are worth less than I paid?', a: 'Then there is no gain to avoid. Selling can realize a loss you may use against other gains, and you can donate the cash. The calculator tells you when basis is at or above value.' },
      { q: 'Can I give shares to any charity?', a: 'Only to a qualified charity or donor-advised fund that accepts securities. Ask the charity how it takes gifts of stock, and transfer the shares directly rather than selling them yourself.' },
    ],
    sources: [
      { label: 'IRS Publication 526: Charitable Contributions', url: 'https://www.irs.gov/publications/p526' },
      { label: 'IRS Topic 409: Capital gains and losses', url: 'https://www.irs.gov/taxtopics/tc409' },
    ],
  },
  related: ['capital-gains-tax', 'tax-loss-harvesting', 'stock-profit-calculator'],
  examples: [
    // gain 6000; tax 900; cash gift 9100; deduction 2400 vs 2184
    { values: { value: 10000, basis: 4000, cgRate: 15, deductRate: 24 }, expect: { taxAvoided: 900, charityStock: 10000, charityCash: 9100, deductStock: 2400, deductCash: 2184 }, tolerance: 1e-6 },
    // gain 20000; tax 20000 × 0.2 = 4000; cash 21000; deductions 25000 × 0.32 = 8000, 21000 × 0.32 = 6720
    { values: { value: 25000, basis: 5000, cgRate: 20, deductRate: 32 }, expect: { taxAvoided: 4000, charityCash: 21000, deductStock: 8000, deductCash: 6720 }, tolerance: 1e-6 },
  ],
});
