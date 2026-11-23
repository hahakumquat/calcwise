import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'shares-to-sell',
  title: 'Shares to Sell for Cash After Tax',
  seoTitle: 'How Many Shares to Sell Calculator',
  metaDescription: 'Work out how many shares to sell to raise a set amount of cash after capital gains tax and fees, with gross proceeds, tax owed and net cash.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Find how many shares you must sell to end up with the cash you need once tax on the gain is paid.',
  keywords: ['how many shares to sell calculator', 'shares to sell for cash after tax', 'sell stock to raise cash', 'stock sale after tax calculator', 'shares needed after capital gains tax'],
  popular: false,
  inputs: [
    { id: 'cash', label: 'Cash you need after tax', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The amount you want to keep after tax.' },
    { id: 'price', label: 'Current share price', type: 'number', prefix: '$', default: 50, min: 0.01, step: 0.5, info: 'What one share sells for today.' },
    { id: 'basis', label: 'Cost basis per share', type: 'number', prefix: '$', default: 30, min: 0, step: 0.5, info: 'What you paid per share, including any adjustments.' },
    { id: 'rate', label: 'Tax rate on the gain', type: 'number', suffix: '%', default: 15, min: 0, max: 50, step: 0.5, info: 'Your capital gains tax rate. You enter it; this tool does not look up brackets.' },
    { id: 'fee', label: 'Fee for the sale', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'Commission or other cost of the sale. Enter 0 if none.' },
  ],
  outputs: [
    { id: 'shares', label: 'Shares to sell', format: 'integer', primary: true, info: 'Rounded up: (cash + fee) ÷ net cash per share.' },
    { id: 'gross', label: 'Gross sale proceeds', format: 'currency', precision: 0, info: 'Shares × price.' },
    { id: 'tax', label: 'Tax on the gain', format: 'currency', precision: 0, info: 'Shares × gain per share × tax rate.' },
    { id: 'net', label: 'Cash you keep', format: 'currency', precision: 0, info: 'Gross proceeds − tax − fee.' },
  ],
  compute: (v) => {
    const cash = num(v.cash), price = num(v.price), basis = num(v.basis), rate = num(v.rate), fee = num(v.fee);
    if ([cash, price, basis, rate, fee].some((x) => x === null)) return { shares: null };
    if ([cash!, basis!, rate!, fee!].some((x) => x < 0)) return { shares: null, error: 'Amounts cannot be negative.' };
    if (price! <= 0) return { shares: null, error: 'Enter a share price above zero.' };
    if (rate! >= 100) return { shares: null, error: 'Tax rate must be under 100%.' };
    const gain = Math.max(0, price! - basis!);
    const taxPer = gain * rate! / 100;
    const netPer = price! - taxPer;
    const target = cash! + fee!;
    const shares = target === 0 ? 0 : Math.ceil(target / netPer - 1e-9);
    const gross = shares * price!;
    const tax = shares * taxPer;
    const net = gross - tax - fee!;
    return {
      shares,
      gross,
      tax,
      net,
      tone: 'good',
      badge: `${(tax / (gross || 1) * 100).toFixed(1)}% goes to tax`,
      chart: {
        type: 'bar',
        title: 'Where the sale proceeds go',
        categories: ['Cash you keep', 'Tax', 'Fee'],
        series: [{ name: 'Amount', values: [+net.toFixed(2), +tax.toFixed(2), fee!] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Gain per share = ${money(price!, 2)} − ${money(basis!, 2)} = ${money(gain, 2)}; tax per share = ${money(taxPer, 2)}`,
        `Net cash per share = ${money(price!, 2)} − ${money(taxPer, 2)} = ${money(netPer, 2)}`,
        `Shares = (${money(cash!, 0)} + ${money(fee!, 0)}) ÷ ${money(netPer, 2)} = ${(target / netPer).toFixed(2)}, rounded up to ${shares}`,
        `Gross ${money(gross, 0)} − tax ${money(tax, 0)} − fee ${money(fee!, 0)} = ${money(net, 0)}`,
      ],
      note: 'Not tax advice. Assumes the same cost basis on every share and one tax rate. If you hold lots bought at different prices, the gain per share differs by lot. Short-term and long-term gains are taxed at different rates.',
    };
  },
  content: {
    formula: [
      'Gain per share = max(0, price − cost basis)',
      'Net cash per share = price − gain per share × tax rate',
      'Shares to sell = (cash needed + fee) ÷ net cash per share, rounded up',
    ],
    body: [
      'If you sell stock to raise cash, tax on the gain comes out of the proceeds, so you must sell more than the amount you need. This calculator works backwards from the cash you want to keep.',
      'To net $10,000 from shares priced at $50 that cost $30, with a 15% rate: the gain is $20 a share, tax is $3, and each share nets $47. Then 10,000 ÷ 47 = 212.77, so you sell 213 shares for $10,650, pay $639 in tax and keep $10,011.',
    ],
    sections: [
      {
        heading: 'Choosing the tax rate',
        paragraphs: [
          'Enter the rate that applies to you. Gains on shares held over a year are usually taxed at lower long-term rates than shares held a year or less, and the rate depends on your income and country. Check the rate with a tax professional or your tax authority. To see the tax on a sale you have already planned, use the capital gains tax calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How many shares do I need to sell to get $10,000 after tax?', a: 'It depends on price, cost basis and tax rate. At $50 a share, $30 basis and 15% tax, each share nets $47, so you sell 213 shares, giving $10,650 gross and $10,011 after $639 of tax.' },
      { q: 'Why does the answer round up?', a: 'You cannot sell part of a share on most platforms, so rounding up makes sure you reach the cash you need. Rounding down would leave you short.' },
      { q: 'What if I sell at a loss?', a: 'Then the gain is zero in this calculator and no tax is added. A real loss may reduce your other taxable gains, which this tool does not model.' },
      { q: 'Does this work for fractional shares?', a: 'It rounds to whole shares. If your broker allows fractions, the unrounded figure shown in the steps is the exact amount.' },
    ],
    sources: [{ label: 'IRS: Topic no. 409, Capital gains and losses', url: 'https://www.irs.gov/taxtopics/tc409' }],
  },
  related: ['capital-gains-tax', 'stock-profit-calculator', 'tax-loss-harvesting', 'investment'],
  examples: [
    // gain 20, tax 3, net 47; 10000/47=212.77 -> 213; gross 10650; tax 639; net 10011
    { values: { cash: 10000, price: 50, basis: 30, rate: 15, fee: 0 }, expect: { shares: 213, gross: 10650, tax: 639, net: 10011 }, tolerance: 1e-6 },
    // basis above price: no tax; 1000/20 = 50 shares; fee 10: 1010/20=50.5 -> 51; gross 1020; net 1010
    { values: { cash: 1000, price: 20, basis: 25, rate: 20, fee: 10 }, expect: { shares: 51, gross: 1020, tax: 0, net: 1010 }, tolerance: 1e-6 },
  ],
});
