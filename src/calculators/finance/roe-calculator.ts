import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'roe-calculator',
  title: 'Return on Equity (ROE) Calculator with DuPont',
  category: 'finance',
  description: 'Calculate return on equity and split it into profit margin, asset turnover and leverage with the DuPont breakdown. See what is really driving the return.',
  keywords: ['roe calculator', 'return on equity calculator', 'dupont analysis calculator', 'return on equity formula'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'netIncome', label: 'Net income (per year)', type: 'number', prefix: '$', default: 50000, min: -1e12, max: 1e12, step: 1000, info: 'Profit after tax and interest. Use a loss as a negative number.' },
    { id: 'revenue', label: 'Revenue (per year)', type: 'number', prefix: '$', default: 500000, min: 0, max: 1e12, step: 1000, info: 'Total sales for the same year.' },
    { id: 'assets', label: 'Total assets', type: 'number', prefix: '$', default: 400000, min: 0, max: 1e12, step: 1000, info: 'Everything the company owns, from the balance sheet.' },
    { id: 'equity', label: "Shareholders' equity", type: 'number', prefix: '$', default: 250000, min: 0, max: 1e12, step: 1000, info: 'Assets minus liabilities.' },
  ],
  outputs: [
    { id: 'roe', label: 'Return on equity', format: 'percent', precision: 1, primary: true, info: 'Net income ÷ shareholders’ equity.' },
    { id: 'margin', label: 'Net profit margin', format: 'percent', precision: 1, info: 'Net income ÷ revenue.' },
    { id: 'turnover', label: 'Asset turnover', format: 'number', precision: 2, info: 'Revenue ÷ total assets.' },
    { id: 'leverage', label: 'Equity multiplier', format: 'number', precision: 2, info: 'Total assets ÷ equity. Higher means more borrowed money.' },
  ],
  compute: (v) => {
    const ni = num(v.netIncome);
    const rev = num(v.revenue);
    const a = num(v.assets);
    const e = num(v.equity);
    if (ni === null || rev === null || a === null || e === null) return { roe: null };
    if (rev <= 0 || a <= 0 || e <= 0) return { roe: null };
    const margin = ni / rev;
    const turnover = rev / a;
    const leverage = a / e;
    const roe = ni / e;
    return {
      roe,
      margin,
      turnover,
      leverage,
      chart: {
        type: 'bar',
        title: 'Net income vs. the equity behind it ($)',
        categories: ['Net income', 'Equity'],
        series: [{ name: 'Amount', values: [ni, e] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `ROE = $${fmt(ni, 0)} ÷ $${fmt(e, 0)} = ${fmt(roe * 100, 1)}%`,
        `DuPont: ${fmt(margin * 100, 1)}% margin × ${fmt(turnover)} turnover × ${fmt(leverage)} leverage = ${fmt(margin * turnover * leverage * 100, 1)}%`,
      ],
      note: ni < 0
        ? 'The company lost money this year, so return on equity is negative.'
        : leverage > 3
          ? `A big part of this return comes from borrowing: assets are ${fmt(leverage)} times equity, which raises risk as well as ROE.`
          : `Each $1 of equity earned about ${fmt(roe, 2)} dollars this year.`,
    };
  },
  content: {
    formula: ['ROE = net income ÷ shareholders’ equity', 'DuPont: ROE = (net income ÷ revenue) × (revenue ÷ assets) × (assets ÷ equity)'],
    body: [
      'Return on equity shows how much profit a company earns for each dollar its owners have invested. An ROE of 20% means $20 of net income for every $100 of equity.',
      'The DuPont breakdown splits ROE into three levers: profit margin (how much of each sale is kept), asset turnover (how hard the assets work) and the equity multiplier (how much is financed with debt). Two companies can share the same ROE for very different reasons.',
      'Watch the third lever. Raising debt shrinks equity and lifts ROE without the business getting any better, so a high ROE built on leverage is riskier than one built on margin.',
      'This calculator needs positive equity. If equity is zero or negative, ROE is not meaningful. Compare companies in the same industry, using average equity over the year if you want a stricter measure.',
    ],
    faq: [
      { q: 'How do you calculate ROE?', a: 'Divide net income by shareholders’ equity. $50,000 ÷ $250,000 = 0.20, or 20%.' },
      { q: 'What does the DuPont breakdown show?', a: 'It multiplies margin, asset turnover and the equity multiplier. In the example, 10% × 1.25 × 1.6 = 20%, matching ROE.' },
      { q: 'What is a good ROE?', a: 'Many investors look for 15% or more, but it varies widely by industry and debt level.' },
      { q: 'Does this use average equity?', a: 'No. It uses the equity figure you enter. For average equity, add opening and closing equity and divide by two first.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Return on equity', url: 'https://www.investopedia.com/terms/r/returnonequity.asp' },
    ],
  },
  related: ['debt-to-equity-ratio', 'profit-margin', 'interest-coverage-ratio', 'current-ratio-calculator', 'roi', 'wacc-calculator'],
  examples: [
    // 50/250 = 0.2; 50/500 = 0.1; 500/400 = 1.25; 400/250 = 1.6
    { values: { netIncome: 50000, revenue: 500000, assets: 400000, equity: 250000 }, expect: { roe: 0.2, margin: 0.1, turnover: 1.25, leverage: 1.6 }, tolerance: 1e-9 },
    // -10/100 = -0.1; -10/200 = -0.05; 200/300; 300/100 = 3
    { values: { netIncome: -10000, revenue: 200000, assets: 300000, equity: 100000 }, expect: { roe: -0.1, margin: -0.05, turnover: 0.6666666667, leverage: 3 }, tolerance: 1e-9 },
  ],
});
