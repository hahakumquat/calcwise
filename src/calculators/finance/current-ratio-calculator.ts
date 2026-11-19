import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'current-ratio-calculator',
  title: 'Current Ratio and Quick Ratio Calculator',
  category: 'finance',
  description: 'Calculate the current ratio, quick ratio and working capital from a balance sheet. See in plain English whether a company can pay its short-term bills.',
  keywords: ['current ratio calculator', 'quick ratio calculator', 'working capital calculator', 'liquidity ratio', 'acid test ratio'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'currentAssets', label: 'Current assets', type: 'number', prefix: '$', default: 150000, min: 0, max: 1e12, step: 1000, info: 'Cash, receivables, inventory and anything else due to turn into cash within a year.' },
    { id: 'inventory', label: 'Inventory', type: 'number', prefix: '$', default: 40000, min: 0, max: 1e12, step: 1000, info: 'Part of current assets. Left out of the quick ratio because it is slower to sell.' },
    { id: 'currentLiabilities', label: 'Current liabilities', type: 'number', prefix: '$', default: 100000, min: 0, max: 1e12, step: 1000, info: 'Bills and debts due within a year.' },
  ],
  outputs: [
    { id: 'current', label: 'Current ratio', format: 'number', precision: 2, primary: true, info: 'Current assets ÷ current liabilities.' },
    { id: 'quick', label: 'Quick ratio', format: 'number', precision: 2, info: '(Current assets − inventory) ÷ current liabilities.' },
    { id: 'workingCapital', label: 'Working capital', format: 'currency', precision: 0, info: 'Current assets − current liabilities.' },
  ],
  compute: (v) => {
    const ca = num(v.currentAssets);
    const inv = num(v.inventory);
    const cl = num(v.currentLiabilities);
    if (ca === null || inv === null || cl === null) return { current: null };
    if (ca < 0 || inv < 0 || cl <= 0 || inv > ca) return { current: null };
    const current = ca / cl;
    const quick = (ca - inv) / cl;
    const wc = ca - cl;
    return {
      current,
      quick,
      workingCapital: wc,
      chart: {
        type: 'bar',
        title: 'What the company has vs. what it owes ($)',
        categories: ['Current assets', 'Quick assets', 'Current liabilities'],
        series: [{ name: 'Amount', values: [ca, ca - inv, cl] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Current ratio = $${fmt(ca, 0)} ÷ $${fmt(cl, 0)} = ${fmt(current)}`,
        `Quick ratio = ($${fmt(ca, 0)} − $${fmt(inv, 0)}) ÷ $${fmt(cl, 0)} = ${fmt(quick)}`,
        `Working capital = $${fmt(ca, 0)} − $${fmt(cl, 0)} = $${fmt(wc, 0)}`,
      ],
      note: current >= 1
        ? `Current assets cover short-term bills ${fmt(current)} times over. Many analysts like to see 1.5 to 2, but norms vary by industry.`
        : `Current assets cover only ${fmt(current * 100, 0)}% of short-term bills, which can signal a cash squeeze.`,
    };
  },
  content: {
    formula: ['Current ratio = current assets ÷ current liabilities', 'Quick ratio = (current assets − inventory) ÷ current liabilities', 'Working capital = current assets − current liabilities'],
    body: [
      'The current ratio asks a simple question: if every bill due in the next year landed today, could the company pay them from what it already has or will collect? A ratio of 1.5 means $1.50 of current assets for every $1 of current liabilities.',
      'The quick ratio is the stricter version. It leaves out inventory, because stock can take time to sell and may sell for less than its book value. This version removes only inventory; some analysts remove prepaid expenses too.',
      'Below 1 means short-term bills are bigger than short-term assets, which is worth a closer look. Very high is not automatically good either, since it can mean cash is sitting idle.',
      'Compare companies in the same industry. Grocery chains run low ratios on purpose because they turn stock into cash quickly, while manufacturers usually carry more.',
    ],
    faq: [
      { q: 'How do you calculate the current ratio?', a: 'Divide current assets by current liabilities. $150,000 of current assets and $100,000 of current liabilities gives 150,000 ÷ 100,000 = 1.5.' },
      { q: 'What is the difference between current and quick ratio?', a: 'The quick ratio removes inventory from current assets. With $40,000 of inventory in the example, it is (150,000 − 40,000) ÷ 100,000 = 1.1.' },
      { q: 'What is a good current ratio?', a: 'Many analysts look for 1.5 to 2, and a quick ratio of at least 1. Healthy levels differ a lot between industries.' },
      { q: 'What is working capital?', a: 'Current assets minus current liabilities. In the example it is $150,000 − $100,000 = $50,000.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Current ratio', url: 'https://www.investopedia.com/terms/c/currentratio.asp' },
    ],
  },
  related: ['quick-ratio-calculator', 'ebitda-calculator', 'debt-to-equity-ratio', 'interest-coverage-ratio', 'wacc-calculator', 'break-even', 'profit-margin', 'net-worth'],
  examples: [
    // 150/100 = 1.5; (150-40)/100 = 1.1; WC 50,000
    { values: { currentAssets: 150000, inventory: 40000, currentLiabilities: 100000 }, expect: { current: 1.5, quick: 1.1, workingCapital: 50000 }, tolerance: 1e-9 },
    // no inventory: quick = current; 80/200 = 0.4; WC -120,000
    { values: { currentAssets: 80000, inventory: 0, currentLiabilities: 200000 }, expect: { current: 0.4, quick: 0.4, workingCapital: -120000 }, tolerance: 1e-9 },
  ],
});
