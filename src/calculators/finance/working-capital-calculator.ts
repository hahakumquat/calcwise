import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'working-capital-calculator',
  title: 'Working Capital Calculator',
  category: 'finance',
  description: 'Calculate working capital from current assets and current liabilities, plus the working capital ratio. See how much short-term cushion a business has.',
  keywords: ['working capital calculator', 'working capital formula', 'net working capital calculator', 'working capital ratio', 'how to calculate working capital'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'assets', label: 'Current assets', type: 'number', prefix: '$', default: 250000, min: 0, max: 1e13, step: 1000, info: 'Cash, receivables, inventory and other assets expected to turn into cash within a year.' },
    { id: 'liabilities', label: 'Current liabilities', type: 'number', prefix: '$', default: 150000, min: 0, max: 1e13, step: 1000, info: 'Debts and bills due within a year.' },
  ],
  outputs: [
    { id: 'wc', label: 'Working capital', format: 'currency', precision: 0, primary: true, info: 'Current assets minus current liabilities.' },
    { id: 'ratio', label: 'Working capital ratio', format: 'number', precision: 2, info: 'Current assets ÷ current liabilities (the current ratio).' },
  ],
  compute: (v) => {
    const a = num(v.assets), l = num(v.liabilities);
    if (a === null || l === null) return { wc: null };
    if (a < 0 || l <= 0) return { wc: null };
    const wc = a - l;
    const ratio = a / l;
    return {
      wc,
      ratio,
      chart: {
        type: 'bar',
        title: 'Current assets vs. current liabilities ($)',
        categories: ['Current assets', 'Current liabilities', 'Working capital'],
        series: [{ name: 'Amount', values: [a, l, wc] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Working capital = $${fmt(a, 0)} − $${fmt(l, 0)} = $${fmt(wc, 0)}`,
        `Working capital ratio = $${fmt(a, 0)} ÷ $${fmt(l, 0)} = ${fmt(ratio)}`,
      ],
      note: wc >= 0
        ? `Current assets exceed current liabilities by $${fmt(wc, 0)}, a short-term cushion.`
        : `Current liabilities exceed current assets by $${fmt(-wc, 0)}. The business would need new cash or financing to pay everything due within a year.`,
    };
  },
  content: {
    formula: ['Working capital = current assets − current liabilities', 'Working capital ratio = current assets ÷ current liabilities'],
    body: [
      'Working capital is the money a business has to run on day to day. It is what is left of its short-term assets once its short-term bills are paid.',
      'A positive number means the company can cover what it owes within a year and still have something over. A negative number is not always a crisis: retailers and subscription businesses often collect cash before they pay suppliers, so they can run with little or negative working capital.',
      'The same two figures also give the working capital ratio, which is the current ratio. A ratio between about 1.2 and 2 is often cited as comfortable, though the right level depends on the industry.',
      'Use the balance sheet totals for current assets and current liabilities. For a stricter test that leaves out inventory, try the quick ratio.',
    ],
    faq: [
      { q: 'How do you calculate working capital?', a: 'Subtract current liabilities from current assets. With $250,000 of current assets and $150,000 of current liabilities, working capital is $100,000.' },
      { q: 'What is a good working capital ratio?', a: 'Many analysts look for roughly 1.2 to 2. Below 1 means short-term debts exceed short-term assets; far above 2 can mean cash or inventory is sitting idle.' },
      { q: 'Can working capital be negative?', a: 'Yes. It can signal liquidity stress, but some healthy businesses with fast cash collection and slow supplier payments run with negative working capital.' },
      { q: 'Is working capital the same as the current ratio?', a: 'Not quite. Working capital is a dollar amount (assets minus liabilities); the current ratio divides the same two numbers.' },
    ],
    sources: [
      { label: 'Investopedia: Working capital', url: 'https://www.investopedia.com/terms/w/workingcapital.asp' },
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
    ],
  },
  related: ['current-ratio-calculator', 'quick-ratio-calculator', 'cash-conversion-cycle', 'debt-to-equity-ratio', 'free-cash-flow-calculator'],
  examples: [
    // 250000-150000 = 100000; 250000/150000 = 1.6667
    { values: { assets: 250000, liabilities: 150000 }, expect: { wc: 100000, ratio: 250000 / 150000 }, tolerance: 1e-9 },
    // 80000-100000 = -20000; ratio 0.8
    { values: { assets: 80000, liabilities: 100000 }, expect: { wc: -20000, ratio: 0.8 }, tolerance: 1e-9 },
  ],
});
