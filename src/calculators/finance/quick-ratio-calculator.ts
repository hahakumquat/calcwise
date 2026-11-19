import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'quick-ratio-calculator',
  title: 'Quick Ratio (Acid-Test) Calculator',
  category: 'finance',
  description: 'Calculate the quick ratio (acid-test) from cash, securities, receivables and current liabilities. See if a company can pay bills without selling inventory.',
  keywords: ['quick ratio calculator', 'acid test ratio calculator', 'quick ratio formula', 'liquidity ratio calculator', 'what is a good quick ratio'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'cash', label: 'Cash and equivalents', type: 'number', prefix: '$', default: 50000, min: 0, max: 1e13, step: 1000, info: 'Cash in the bank plus short-term, easily cashed holdings.' },
    { id: 'securities', label: 'Marketable securities', type: 'number', prefix: '$', default: 20000, min: 0, max: 1e13, step: 1000, info: 'Short-term investments that can be sold quickly. Enter 0 if none.' },
    { id: 'receivables', label: 'Accounts receivable', type: 'number', prefix: '$', default: 80000, min: 0, max: 1e13, step: 1000, info: 'Money customers owe you, expected within a year.' },
    { id: 'liabilities', label: 'Current liabilities', type: 'number', prefix: '$', default: 100000, min: 0, max: 1e13, step: 1000, info: 'Debts and bills due within a year.' },
  ],
  outputs: [
    { id: 'ratio', label: 'Quick ratio', format: 'number', precision: 2, primary: true, info: 'Quick assets ÷ current liabilities.' },
    { id: 'quickAssets', label: 'Quick assets', format: 'currency', precision: 0, info: 'Cash + marketable securities + receivables.' },
    { id: 'gap', label: 'Surplus (shortfall) vs. liabilities', format: 'currency', precision: 0, info: 'Quick assets minus current liabilities.' },
  ],
  compute: (v) => {
    const c = num(v.cash), s = num(v.securities), r = num(v.receivables), l = num(v.liabilities);
    if (c === null || s === null || r === null || l === null) return { ratio: null };
    if (c < 0 || s < 0 || r < 0 || l <= 0) return { ratio: null };
    const q = c + s + r;
    const ratio = q / l;
    return {
      ratio,
      quickAssets: q,
      gap: q - l,
      chart: {
        type: 'bar',
        title: 'Quick assets vs. what is due within a year ($)',
        categories: ['Cash', 'Securities', 'Receivables', 'Quick assets', 'Current liabilities'],
        series: [{ name: 'Amount', values: [c, s, r, q, l] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Quick assets = $${fmt(c, 0)} + $${fmt(s, 0)} + $${fmt(r, 0)} = $${fmt(q, 0)}`,
        `Quick ratio = $${fmt(q, 0)} ÷ $${fmt(l, 0)} = ${fmt(ratio)}`,
      ],
      note: ratio >= 1
        ? `Quick assets cover current liabilities ${fmt(ratio)} times without selling any inventory.`
        : `Quick assets cover only ${fmt(ratio * 100, 0)}% of current liabilities, so the business would need inventory sales or new funding to pay everything due.`,
    };
  },
  content: {
    formula: ['Quick assets = cash + marketable securities + accounts receivable', 'Quick ratio = quick assets ÷ current liabilities'],
    body: [
      'The quick ratio, also called the acid-test ratio, asks a blunt question: if every bill due in the next year arrived today, could the business pay it using only assets that turn into cash fast?',
      'It is a stricter cousin of the current ratio. The current ratio counts inventory and prepaid expenses too, but those can take months to turn into cash. The quick ratio leaves them out.',
      'A ratio of 1.0 or more means quick assets at least match short-term debts. Many analysts treat 1 as a rough floor, but the right level varies by industry: software firms with steady subscription cash often run fine below 1, while a business with slow-paying customers wants more cushion.',
      'This version adds up the three standard quick assets directly. You can also work it from the other side by taking current assets, then subtracting inventory and prepaid expenses. The two routes should give a similar answer.',
    ],
    faq: [
      { q: 'How do you calculate the quick ratio?', a: 'Add cash, marketable securities and accounts receivable, then divide by current liabilities. With $50,000 cash, $20,000 securities, $80,000 receivables and $100,000 of current liabilities, the ratio is 150,000 ÷ 100,000 = 1.5.' },
      { q: 'What is a good quick ratio?', a: 'A ratio of 1 or higher is a common rule of thumb, meaning quick assets cover short-term debts. Acceptable levels differ by industry, so compare with similar companies.' },
      { q: 'What is the difference between the quick ratio and the current ratio?', a: 'The current ratio divides all current assets by current liabilities. The quick ratio drops inventory and prepaid expenses, so it is the tougher test of liquidity.' },
      { q: 'Can a quick ratio be too high?', a: 'Possibly. Very high values can mean cash or receivables are sitting idle instead of being invested in growth, though a safety buffer is not a bad thing.' },
    ],
    sources: [
      { label: 'Investopedia: Quick ratio (acid-test)', url: 'https://www.investopedia.com/terms/q/quickratio.asp' },
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
    ],
  },
  related: ['current-ratio-calculator', 'cash-conversion-cycle', 'debt-to-equity-ratio', 'interest-coverage-ratio', 'receivables-turnover-calculator'],
  examples: [
    // q = 50000+20000+80000 = 150000; /100000 = 1.5
    { values: { cash: 50000, securities: 20000, receivables: 80000, liabilities: 100000 }, expect: { ratio: 1.5, quickAssets: 150000, gap: 50000 }, tolerance: 1e-9 },
    // q = 10000+20000+30000 = 60000; /120000 = 0.5
    { values: { cash: 10000, securities: 20000, receivables: 30000, liabilities: 120000 }, expect: { ratio: 0.5, quickAssets: 60000, gap: -60000 }, tolerance: 1e-9 },
  ],
});
