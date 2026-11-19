import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'price-to-book-ratio-calculator',
  title: 'Price-to-Book (P/B) Ratio Calculator',
  category: 'finance',
  description: 'Calculate the price-to-book (P/B) ratio from share price, total assets, total liabilities and shares outstanding. See book value per share and what it means.',
  keywords: ['price to book ratio calculator', 'p/b ratio calculator', 'book value per share calculator', 'pb ratio formula', 'how to calculate price to book'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'price', label: 'Share price', type: 'number', prefix: '$', default: 30, min: 0, max: 1e9, step: 0.01, info: 'Current market price of one share.' },
    { id: 'assets', label: 'Total assets', type: 'number', prefix: '$', default: 500000000, min: 0, max: 1e15, step: 1000000, info: 'From the balance sheet.' },
    { id: 'liabilities', label: 'Total liabilities', type: 'number', prefix: '$', default: 200000000, min: 0, max: 1e15, step: 1000000, info: 'From the balance sheet.' },
    { id: 'shares', label: 'Shares outstanding', type: 'number', default: 20000000, min: 0, max: 1e13, step: 100000, info: 'Total shares held by investors.' },
  ],
  outputs: [
    { id: 'pb', label: 'Price-to-book ratio', format: 'number', precision: 2, primary: true, info: 'Share price ÷ book value per share.' },
    { id: 'bvps', label: 'Book value per share', format: 'currency', precision: 2, info: '(Total assets − total liabilities) ÷ shares outstanding.' },
    { id: 'equity', label: 'Book value (equity)', format: 'currency', precision: 0, info: 'Total assets − total liabilities.' },
  ],
  compute: (v) => {
    const p = num(v.price), a = num(v.assets), l = num(v.liabilities), s = num(v.shares);
    if (p === null || a === null || l === null || s === null) return { pb: null };
    if (p < 0 || a < 0 || l < 0 || s <= 0) return { pb: null };
    const equity = a - l;
    const bvps = equity / s;
    if (bvps <= 0) {
      return {
        pb: null,
        bvps,
        equity,
        note: 'Book value is zero or negative, so the P/B ratio is not meaningful.',
      };
    }
    const pb = p / bvps;
    return {
      pb,
      bvps,
      equity,
      chart: {
        type: 'bar',
        title: 'Price vs book value per share ($)',
        categories: ['Share price', 'Book value per share'],
        series: [{ name: 'Per share', values: [p, bvps] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Book value = $${fmt(a, 0)} − $${fmt(l, 0)} = $${fmt(equity, 0)}`,
        `Book value per share = $${fmt(equity, 0)} ÷ ${fmt(s, 0)} = $${fmt(bvps, 2)}`,
        `P/B = $${fmt(p, 2)} ÷ $${fmt(bvps, 2)} = ${fmt(pb, 2)}`,
      ],
      note: pb < 1
        ? 'A P/B below 1 means the market values the company at less than its book value.'
        : `The market price is ${fmt(pb, 2)} times book value per share. What counts as high depends on the industry.`,
    };
  },
  content: {
    formula: [
      'Book value per share = (total assets − total liabilities) ÷ shares outstanding',
      'P/B = share price ÷ book value per share',
    ],
    body: [
      'The price-to-book ratio compares what the market pays for a share with the accounting value behind it. Book value is what would be left if the company sold its assets at their recorded values and paid off all its debts.',
      'A P/B of 1 means the stock trades at exactly its book value. Below 1 can signal a bargain or a business in trouble. Above 1 means investors expect the company to earn more than its assets alone suggest.',
      'The ratio works best for banks, insurers and other asset-heavy firms. It says less about companies whose value is mostly brand, software or people, because those do not show up fully on the balance sheet.',
      'Use the same date for the price and the balance sheet where you can, and compare companies in the same industry.',
    ],
    faq: [
      { q: 'How do you calculate the price-to-book ratio?', a: 'Divide the share price by book value per share. With $500 million of assets, $200 million of liabilities and 20 million shares, book value per share is $15. At $30 a share, P/B is 2.0.' },
      { q: 'What is a good P/B ratio?', a: 'There is no single good number. A value near or below 1 is often called cheap, but fast-growing or asset-light companies usually trade far above it. Compare with peers in the same industry.' },
      { q: 'Can book value be negative?', a: 'Yes. If liabilities exceed assets, book value is negative and the P/B ratio is not meaningful. This calculator says so instead of showing a number.' },
      { q: 'Is P/B the same as price to earnings?', a: 'No. Price-to-book uses shareholder equity per share, which is assets minus liabilities. Price-to-earnings uses profit per share instead.' },
    ],
    sources: [
      { label: 'Investopedia: Price-to-book (P/B) ratio', url: 'https://www.investopedia.com/terms/p/price-to-bookratio.asp' },
      { label: 'Corporate Finance Institute: P/B ratio', url: 'https://corporatefinanceinstitute.com/resources/valuation/price-to-book-ratio/' },
    ],
  },
  related: ['pe-ratio-calculator', 'roe-calculator', 'debt-to-equity-ratio', 'eps-calculator', 'dividend-payout-ratio-calculator'],
  examples: [
    // equity 300M; bvps 15; pb 30/15 = 2
    { values: { price: 30, assets: 500000000, liabilities: 200000000, shares: 20000000 }, expect: { pb: 2, bvps: 15, equity: 300000000 }, tolerance: 1e-9 },
    // equity 100M; bvps 20; pb 10/20 = 0.5
    { values: { price: 10, assets: 400000000, liabilities: 300000000, shares: 5000000 }, expect: { pb: 0.5, bvps: 20, equity: 100000000 }, tolerance: 1e-9 },
  ],
});
