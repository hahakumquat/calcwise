import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'roa-calculator',
  title: 'Return on Assets (ROA) Calculator',
  category: 'finance',
  description: 'Calculate return on assets and asset turnover from net income, revenue and total assets. See how much profit each dollar of assets earns.',
  keywords: ['roa calculator', 'return on assets calculator', 'return on assets formula', 'asset turnover calculator'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'netIncome', label: 'Net income (per year)', type: 'number', prefix: '$', default: 40000, min: -1e12, max: 1e12, step: 1000, info: 'Profit after tax and interest. Use a loss as a negative number.' },
    { id: 'revenue', label: 'Revenue (per year)', type: 'number', prefix: '$', default: 500000, min: 0, max: 1e12, step: 1000, info: 'Total sales for the same year.' },
    { id: 'assets', label: 'Total assets', type: 'number', prefix: '$', default: 400000, min: 0, max: 1e12, step: 1000, info: 'Everything the company owns, from the balance sheet. Use the average of opening and closing if you have both.' },
  ],
  outputs: [
    { id: 'roa', label: 'Return on assets', format: 'percent', precision: 1, primary: true, info: 'Net income ÷ total assets.' },
    { id: 'margin', label: 'Net profit margin', format: 'percent', precision: 1, info: 'Net income ÷ revenue.' },
    { id: 'turnover', label: 'Asset turnover', format: 'number', precision: 2, info: 'Revenue ÷ total assets.' },
  ],
  compute: (v) => {
    const ni = num(v.netIncome);
    const rev = num(v.revenue);
    const a = num(v.assets);
    if (ni === null || rev === null || a === null) return { roa: null };
    if (rev <= 0 || a <= 0) return { roa: null };
    const roa = ni / a;
    const margin = ni / rev;
    const turnover = rev / a;
    return {
      roa,
      margin,
      turnover,
      chart: {
        type: 'bar',
        title: 'Net income vs. the assets behind it ($)',
        categories: ['Net income', 'Total assets'],
        series: [{ name: 'Amount', values: [ni, a] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `ROA = $${fmt(ni, 0)} ÷ $${fmt(a, 0)} = ${fmt(roa * 100, 1)}%`,
        `Same thing as margin × turnover: ${fmt(margin * 100, 1)}% × ${fmt(turnover)} = ${fmt(margin * turnover * 100, 1)}%`,
      ],
      note: ni < 0
        ? 'The company lost money this year, so return on assets is negative.'
        : `Each $1 of assets earned about ${fmt(roa, 2)} dollars of profit this year.`,
    };
  },
  content: {
    formula: ['ROA = net income ÷ total assets', 'ROA = (net income ÷ revenue) × (revenue ÷ total assets)'],
    body: [
      'Return on assets shows how much profit a company makes from everything it owns. An ROA of 10% means $10 of net income for every $100 of assets.',
      'Unlike return on equity, ROA ignores how the assets were paid for, so debt cannot flatter it. That makes it a cleaner way to compare how efficiently two businesses use what they have.',
      'ROA is the product of two things: profit margin (how much of each sale is kept) and asset turnover (how many sales each dollar of assets produces). A grocer earns a thin margin but turns assets fast; a software firm does the reverse.',
      'Compare companies in the same industry. Asset-heavy businesses such as utilities and airlines naturally post lower ROA than asset-light ones.',
    ],
    faq: [
      { q: 'How do you calculate ROA?', a: 'Divide net income by total assets. $40,000 ÷ $400,000 = 0.10, or 10%.' },
      { q: 'What is a good ROA?', a: 'Over 5% is often considered decent and over 20% excellent, but it depends heavily on the industry.' },
      { q: 'How is ROA different from ROE?', a: 'ROE divides by equity and rises with debt. ROA divides by all assets, so it is not affected by how the company is financed.' },
      { q: 'Does this use average assets?', a: 'No. It uses the figure you enter. For average assets, add opening and closing assets and divide by two first.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Return on assets', url: 'https://www.investopedia.com/terms/r/returnonassets.asp' },
    ],
  },
  related: ['roe-calculator', 'profit-margin', 'debt-to-equity-ratio', 'asset-turnover-calculator', 'inventory-turnover-calculator', 'roi', 'interest-coverage-ratio'],
  examples: [
    // 40/400 = 0.1; 40/500 = 0.08; 500/400 = 1.25
    { values: { netIncome: 40000, revenue: 500000, assets: 400000 }, expect: { roa: 0.1, margin: 0.08, turnover: 1.25 }, tolerance: 1e-9 },
    // -15/300 = -0.05; -15/600 = -0.025; 600/300 = 2
    { values: { netIncome: -15000, revenue: 600000, assets: 300000 }, expect: { roa: -0.05, margin: -0.025, turnover: 2 }, tolerance: 1e-9 },
  ],
});
