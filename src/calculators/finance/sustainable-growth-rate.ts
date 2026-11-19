import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'sustainable-growth-rate',
  title: 'Sustainable Growth Rate Calculator',
  category: 'finance',
  description: 'Work out a company’s dividend payout ratio, retention ratio and sustainable growth rate: how fast it can grow from profits alone, without new equity.',
  keywords: ['sustainable growth rate calculator', 'dividend payout ratio calculator', 'retention ratio calculator', 'plowback ratio', 'internal growth'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'netIncome', label: 'Net income', type: 'number', prefix: '$', default: 100000, min: 0, max: 1e12, step: 1000, info: 'Profit after tax for the year.' },
    { id: 'dividends', label: 'Dividends paid', type: 'number', prefix: '$', default: 30000, min: 0, max: 1e12, step: 1000, info: 'Total cash paid out to shareholders for the year.' },
    { id: 'equity', label: 'Shareholders’ equity', type: 'number', prefix: '$', default: 500000, min: 0, max: 1e12, step: 1000, info: 'Book equity from the balance sheet.' },
  ],
  outputs: [
    { id: 'sgr', label: 'Sustainable growth rate', format: 'percent', precision: 1, primary: true, info: 'ROE × retention ratio.' },
    { id: 'payout', label: 'Dividend payout ratio', format: 'percent', precision: 1, info: 'Dividends ÷ net income.' },
    { id: 'retention', label: 'Retention ratio', format: 'percent', precision: 1, info: '1 − payout ratio.' },
    { id: 'roe', label: 'Return on equity', format: 'percent', precision: 1, info: 'Net income ÷ equity.' },
  ],
  compute: (v) => {
    const ni = num(v.netIncome);
    const div = num(v.dividends);
    const e = num(v.equity);
    if (ni === null || div === null || e === null) return { sgr: null };
    if (ni <= 0 || div < 0 || e <= 0 || div > ni) return { sgr: null };
    const payout = div / ni;
    const retention = 1 - payout;
    const roe = ni / e;
    const sgr = roe * retention;
    return {
      sgr,
      payout,
      retention,
      roe,
      chart: {
        type: 'bar',
        title: 'Where the profit goes ($)',
        categories: ['Net income', 'Paid as dividends', 'Kept in the business'],
        series: [{ name: 'Amount', values: [ni, div, ni - div] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Payout ratio = $${fmt(div, 0)} ÷ $${fmt(ni, 0)} = ${fmt(payout * 100, 1)}%`,
        `Retention ratio = 1 − ${fmt(payout, 3)} = ${fmt(retention * 100, 1)}%`,
        `ROE = $${fmt(ni, 0)} ÷ $${fmt(e, 0)} = ${fmt(roe * 100, 1)}%`,
        `Sustainable growth rate = ${fmt(roe * 100, 1)}% × ${fmt(retention, 3)} = ${fmt(sgr * 100, 1)}%`,
      ],
      note: retention === 0
        ? 'The company pays out all of its profit, so equity does not grow and the sustainable growth rate is 0%.'
        : `Keeping ${fmt(retention * 100, 0)}% of profit and earning ${fmt(roe * 100, 0)}% on equity lets equity grow about ${fmt(sgr * 100, 1)}% a year without selling new shares, if ROE and payout stay the same.`,
    };
  },
  content: {
    formula: ['Payout ratio = dividends ÷ net income', 'Retention ratio = 1 − payout ratio', 'Sustainable growth rate = ROE × retention ratio'],
    body: [
      'The sustainable growth rate is how fast a company can grow using only the profit it keeps. No new shares, and no change in how much it earns on equity or how much it pays out. Faster than that, and it has to borrow more or sell stock.',
      'The maths has two ingredients. The payout ratio is the share of profit paid out as dividends. The rest is retained and added to equity. Multiply the retained share by return on equity and you get the growth rate of equity.',
      'This uses year-end equity and the simple ROE × retention form. Some textbooks use beginning-of-year equity, or adjust ROE for growth, which gives a slightly different figure.',
      'Use it as a sanity check. If a company plans to grow 25% a year but its sustainable rate is 8%, the gap has to be funded from outside.',
    ],
    faq: [
      { q: 'How do you calculate the sustainable growth rate?', a: 'Multiply return on equity by the retention ratio. With net income of $100,000, equity of $500,000 and $30,000 of dividends, ROE is 20%, retention is 70%, and the rate is 20% × 70% = 14%.' },
      { q: 'What is the dividend payout ratio?', a: 'Dividends divided by net income. $30,000 ÷ $100,000 = 30%.' },
      { q: 'What is the retention ratio?', a: 'The share of profit kept in the business, or 1 minus the payout ratio. In the example it is 70%.' },
      { q: 'What if the company pays out all its profit?', a: 'Retention is 0%, so the sustainable growth rate is 0%. Equity only grows if the company sells new shares.' },
    ],
    sources: [
      { label: 'Investopedia: Sustainable growth rate', url: 'https://www.investopedia.com/terms/s/sustainablegrowthrate.asp' },
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
    ],
  },
  related: ['dividend-payout-ratio-calculator', 'roe-calculator', 'dividend-calculator', 'pe-ratio-calculator', 'cagr-calculator', 'roa-calculator', 'wacc-calculator'],
  examples: [
    // payout 0.3, retention 0.7, ROE 0.2, SGR 0.14
    { values: { netIncome: 100000, dividends: 30000, equity: 500000 }, expect: { sgr: 0.14, payout: 0.3, retention: 0.7, roe: 0.2 }, tolerance: 1e-9 },
    // pays out everything: SGR 0; ROE 80/400 = 0.2
    { values: { netIncome: 80000, dividends: 80000, equity: 400000 }, expect: { sgr: 0, payout: 1, retention: 0, roe: 0.2 }, tolerance: 1e-9 },
  ],
});
