import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export default defineCalculator({
  slug: 'shareholder-yield',
  title: 'Shareholder Yield Calculator',
  category: 'finance',
  description: 'Add a stock’s dividend yield to its net buyback yield to see the total share of market value a company returned to shareholders in a year.',
  metaDescription: 'Shareholder yield calculator: dividend yield plus net buyback yield (buybacks minus new shares issued) as a percent of market cap. Enter your own figures.',
  updated: '2026-11-28',
  keywords: ['shareholder yield calculator', 'net buyback yield', 'dividend yield plus buyback yield', 'total shareholder yield', 'share buyback yield formula', 'net payout yield'],
  inputs: [
    { id: 'cap', label: 'Market capitalisation', type: 'number', default: 500, min: 0, step: 1, info: 'Share price times shares outstanding. Use any currency unit (millions, billions) as long as all four figures use the same one.' },
    { id: 'div', label: 'Annual dividends paid', type: 'number', default: 15, min: 0, step: 0.1, info: 'Total cash dividends paid over the last 12 months, from the financing section of the cash flow statement.' },
    { id: 'buy', label: 'Annual share buybacks', type: 'number', default: 25, min: 0, step: 0.1, info: 'Cash spent repurchasing shares over the last 12 months, from the cash flow statement (often “repurchase of common stock”).' },
    { id: 'issued', label: 'New shares issued (optional)', type: 'number', default: 0, optional: true, min: 0, step: 0.1, info: 'Value of shares issued in the year, such as stock compensation or offerings. Leave at 0 to ignore it.' },
  ],
  outputs: [
    { id: 'shareholderYield', label: 'Shareholder yield', format: 'percent', precision: 2, primary: true, info: 'Dividend yield plus net buyback yield.' },
    { id: 'divYield', label: 'Dividend yield', format: 'percent', precision: 2, info: 'Dividends paid divided by market cap.' },
    { id: 'buybackYield', label: 'Net buyback yield', format: 'percent', precision: 2, info: '(Buybacks minus new shares issued) divided by market cap. Negative if the company issued more than it bought back.' },
    { id: 'returned', label: 'Net cash returned', format: 'number', precision: 2, info: 'Dividends plus buybacks minus issuance, in the same unit you entered.' },
  ],
  compute: (v) => {
    const cap = num(v.cap);
    const d = num(v.div);
    const b = num(v.buy);
    const i = num(v.issued) ?? 0;
    if (cap === null || d === null || b === null) return { shareholderYield: null };
    if (cap <= 0) return { shareholderYield: null, error: 'Enter a market cap above 0.' };
    if (d < 0 || b < 0 || i < 0) return { shareholderYield: null, error: 'Dividends, buybacks and issuance cannot be negative.' };
    const divYield = d / cap;
    const buybackYield = (b - i) / cap;
    const total = divYield + buybackYield;
    return {
      shareholderYield: total,
      divYield,
      buybackYield,
      returned: d + b - i,
      tone: total > 0 ? 'ok' : 'warn',
      badge: `${pct(total)} shareholder yield`,
      note: 'Buybacks change a lot from year to year, so one year can mislead. Compare several years of cash flow statements.',
      chart: {
        type: 'bar',
        title: 'Yield by source (%)',
        categories: ['Dividend', 'Net buyback', 'Shareholder yield'],
        series: [{ name: 'Yield (%)', values: [divYield * 100, buybackYield * 100, total * 100] }],
        format: { precision: 2, suffix: '%' },
        highlight: 2,
      },
      steps: [
        `Dividend yield = ${d} ÷ ${cap} = ${pct(divYield)}`,
        `Net buyback yield = (${b} − ${i}) ÷ ${cap} = ${pct(buybackYield)}`,
        `Shareholder yield = ${pct(divYield)} + ${pct(buybackYield)} = ${pct(total)}`,
      ],
    };
  },
  content: {
    formula: ['Dividend yield = dividends ÷ market cap', 'Net buyback yield = (buybacks − new shares issued) ÷ market cap', 'Shareholder yield = dividend yield + net buyback yield'],
    body: [
      'Dividend yield only counts cash paid out as dividends. Many companies also return cash by buying back their own shares, which shrinks the share count and lifts each remaining holder’s slice. Shareholder yield adds the two together, and subtracts new shares issued so that buybacks which only offset stock compensation do not look generous.',
      'Take the figures from the cash flow statement: dividends paid and repurchases of stock are in the financing section, and stock issued is in the same section or the equity note. Market cap is today’s share price times shares outstanding. Enter all four in the same unit.',
      'Buybacks are lumpy. A company can repurchase heavily in a strong year and almost nothing in a weak one, so a single year can overstate or understate the typical yield. Averaging several years gives a steadier picture. A high figure also says nothing about whether the business is healthy or the price is fair.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A company has a market cap of 500 billion, pays 15 billion in dividends, buys back 25 billion of shares and issues 5 billion. Dividend yield is 15 ÷ 500 = 3.0%. Net buyback yield is (25 − 5) ÷ 500 = 4.0%. Shareholder yield is 3.0% + 4.0% = 7.0%.',
        ],
      },
    ],
    faq: [
      { q: 'What is the shareholder yield of a 500 billion company that pays 15 billion in dividends and buys back 25 billion with 5 billion issued?', a: 'Dividend yield is 3.0% and net buyback yield is (25 − 5) ÷ 500 = 4.0%, so shareholder yield is 7.0%.' },
      { q: 'Why subtract new shares issued?', a: 'Issuing shares dilutes existing holders. Subtracting issuance gives the net reduction in what the company has handed back, so buybacks that merely offset stock compensation are not double counted.' },
      { q: 'Can shareholder yield be negative?', a: 'Net buyback yield can be negative if more shares were issued than repurchased, and the total goes below zero if that outweighs the dividend yield.' },
      { q: 'Where do I find the numbers?', a: 'Dividends paid, repurchases of stock and stock issued are in the financing section of the cash flow statement. Market cap is share price times shares outstanding.' },
      { q: 'Is one year of buybacks reliable?', a: 'Not always. Buybacks vary a lot from year to year, so compare several years before drawing conclusions.' },
    ],
    sources: [{ label: 'Investor.gov: How to read a company’s financial statements', url: 'https://www.investor.gov/introduction-investing/getting-started/researching-investments/how-read-10-k10-q' }],
  },
  related: ['dividend-calculator', 'free-cash-flow-calculator', 'dividend-payout-ratio-calculator'],
  examples: [
    // 15/500 = 0.03; (25-5)/500 = 0.04; total 0.07
    { values: { cap: 500, div: 15, buy: 25, issued: 5 }, expect: { divYield: 0.03, buybackYield: 0.04, shareholderYield: 0.07, returned: 35 }, tolerance: 1e-9 },
    // No issuance: 15/500 = 0.03; 25/500 = 0.05; total 0.08
    { values: { cap: 500, div: 15, buy: 25, issued: 0 }, expect: { buybackYield: 0.05, shareholderYield: 0.08 }, tolerance: 1e-9 },
    // Issuance above buybacks: (2-10)/200 = -0.04; dividends 4/200 = 0.02; total -0.02
    { values: { cap: 200, div: 4, buy: 2, issued: 10 }, expect: { buybackYield: -0.04, shareholderYield: -0.02 }, tolerance: 1e-9 },
  ],
});
