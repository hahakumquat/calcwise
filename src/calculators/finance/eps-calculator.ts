import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'eps-calculator',
  title: 'EPS Calculator: Earnings Per Share',
  category: 'finance',
  description: 'Calculate earnings per share (EPS) from net income, preferred dividends and shares outstanding. Add the share price to see the P/E ratio and earnings yield.',
  keywords: ['eps calculator', 'earnings per share calculator', 'earnings per share formula', 'basic eps', 'earnings yield'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'netIncome', label: 'Net income', type: 'number', prefix: '$', default: 5000000, min: -1e13, max: 1e13, step: 10000, info: 'Profit after tax for the period, from the income statement. Can be negative.' },
    { id: 'preferred', label: 'Preferred dividends', type: 'number', prefix: '$', default: 500000, min: 0, max: 1e13, step: 10000, info: 'Dividends owed to preferred shareholders. They come off before common shareholders get their share. Enter 0 if none.' },
    { id: 'shares', label: 'Weighted average shares outstanding', type: 'number', default: 3000000, min: 1, max: 1e12, step: 1000, info: 'Common shares outstanding, averaged over the period.' },
    { id: 'price', label: 'Share price (optional)', type: 'number', prefix: '$', default: 30, min: 0, max: 1e7, step: 0.5, info: 'Used for the P/E ratio and earnings yield. Leave at 0 to skip.' },
  ],
  outputs: [
    { id: 'eps', label: 'Earnings per share', format: 'currency', precision: 2, primary: true, info: '(Net income − preferred dividends) ÷ weighted average shares.' },
    { id: 'pe', label: 'P/E ratio', format: 'number', precision: 1, info: 'Share price ÷ EPS. Only shown when EPS and price are positive.' },
    { id: 'yield', label: 'Earnings yield', format: 'percent', precision: 2, info: 'EPS ÷ share price: the share of the price earned each year.' },
  ],
  compute: (v) => {
    const ni = num(v.netIncome), pref = num(v.preferred), sh = num(v.shares), price = num(v.price);
    if (ni === null || pref === null || sh === null) return { eps: null };
    if (pref < 0 || sh <= 0) return { eps: null };
    const common = ni - pref;
    const eps = common / sh;
    const out: Record<string, number> = { eps };
    const steps = [
      `Earnings for common shareholders = $${fmt(ni, 0)} − $${fmt(pref, 0)} = $${fmt(common, 0)}`,
      `EPS = $${fmt(common, 0)} ÷ ${fmt(sh, 0)} shares = $${fmt(eps)}`,
    ];
    let note = `Each common share earned about $${fmt(eps)} over the period.`;
    if (eps < 0) note = `The company lost about $${fmt(-eps)} per share, so there is no meaningful P/E.`;
    if (price !== null && price > 0) {
      const ey = eps / price;
      out.yield = ey;
      steps.push(`Earnings yield = $${fmt(eps)} ÷ $${fmt(price)} = ${fmt(ey * 100)}%`);
      if (eps > 0) {
        const pe = price / eps;
        out.pe = pe;
        steps.push(`P/E = $${fmt(price)} ÷ $${fmt(eps)} = ${fmt(pe, 1)}`);
        note = `You pay about $${fmt(pe, 1)} for every $1 of yearly earnings per share.`;
      }
    }
    return {
      ...out,
      chart: {
        type: 'bar',
        title: 'Where net income goes ($)',
        categories: ['Net income', 'Preferred dividends', 'Left for common shares'],
        series: [{ name: 'Amount', values: [ni, pref, common] }],
        format: { format: 'currency', precision: 0 },
      },
      steps,
      note,
    };
  },
  content: {
    formula: ['EPS = (net income − preferred dividends) ÷ weighted average common shares', 'P/E = share price ÷ EPS', 'Earnings yield = EPS ÷ share price'],
    body: [
      'Earnings per share (EPS) shows how much profit belongs to each common share. It puts companies of different sizes on the same footing, which is why it sits at the top of most earnings reports.',
      'Start with net income. Take off any preferred dividends, because preferred holders are paid first. Then divide by the weighted average number of common shares, not the count on the last day, since the number of shares can change during the period.',
      'Add the share price to get the P/E ratio and its flip side, the earnings yield. A P/E of 10 means an earnings yield of 10%. A low P/E is not automatically cheap: it can mean the market expects earnings to fall.',
      'This is basic EPS. Diluted EPS also counts options, convertibles and other claims that could add shares, so it is usually a little lower.',
    ],
    faq: [
      { q: 'How do you calculate EPS?', a: 'Subtract preferred dividends from net income, then divide by weighted average common shares. ($5,000,000 − $500,000) ÷ 3,000,000 = $1.50.' },
      { q: 'Why use weighted average shares?', a: 'Shares can be issued or bought back during the period. Averaging them over time matches the profit to the shares that actually earned it.' },
      { q: 'What is a good EPS?', a: 'Compare it with the same company over time and with similar companies. Rising EPS is usually a good sign; a higher number alone does not mean a better company.' },
      { q: 'How is EPS used for the P/E ratio?', a: 'Divide the share price by EPS. At $30 and an EPS of $1.50, the P/E is 20 and the earnings yield is 5%.' },
    ],
    sources: [
      { label: 'Investor.gov: Earnings per share (SEC glossary)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Earnings per share', url: 'https://www.investopedia.com/terms/e/eps.asp' },
    ],
  },
  related: ['pe-ratio-calculator', 'dividend-calculator', 'roe-calculator', 'ebitda-calculator', 'stock-split-calculator', 'sustainable-growth-rate'],
  examples: [
    // (5,000,000 - 500,000) / 3,000,000 = 1.5; P/E 30/1.5 = 20; yield 5%
    { values: { netIncome: 5000000, preferred: 500000, shares: 3000000, price: 30 }, expect: { eps: 1.5, pe: 20, yield: 0.05 }, tolerance: 1e-9 },
    // loss: (-1,000,000 - 0) / 2,000,000 = -0.5
    { values: { netIncome: -1000000, preferred: 0, shares: 2000000, price: 0 }, expect: { eps: -0.5 }, tolerance: 1e-9 },
  ],
});
