import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'debt-to-equity-ratio',
  title: 'Debt-to-Equity Ratio Calculator',
  category: 'finance',
  description: 'Calculate a company\'s debt-to-equity ratio from total liabilities and shareholders\' equity. See the equity multiplier and debt share in plain English.',
  keywords: ['debt to equity ratio calculator', 'd/e ratio', 'debt to equity formula', 'equity multiplier', 'leverage ratio calculator'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'debt', label: 'Total liabilities (debt)', type: 'number', prefix: '$', default: 600000, min: 0, max: 1e12, step: 1000, info: 'Everything the company owes, from the balance sheet.' },
    { id: 'equity', label: 'Shareholders\' equity', type: 'number', prefix: '$', default: 400000, min: 0, max: 1e12, step: 1000, info: 'Assets minus liabilities, from the balance sheet.' },
  ],
  outputs: [
    { id: 'de', label: 'Debt-to-equity ratio', format: 'number', precision: 2, primary: true, info: 'Total liabilities ÷ shareholders\' equity.' },
    { id: 'multiplier', label: 'Equity multiplier', format: 'number', precision: 2, info: 'Total assets ÷ equity, which is 1 plus the D/E ratio.' },
    { id: 'debtShare', label: 'Share of funding from debt', format: 'percent', precision: 1, info: 'Liabilities ÷ total assets.' },
    { id: 'assets', label: 'Total assets', format: 'currency', precision: 0, info: 'Liabilities plus equity.' },
  ],
  compute: (v) => {
    const debt = num(v.debt);
    const equity = num(v.equity);
    if (debt === null || equity === null) return { de: null };
    if (debt < 0 || equity <= 0) return { de: null };
    const de = debt / equity;
    const assets = debt + equity;
    return {
      de,
      multiplier: assets / equity,
      debtShare: debt / assets,
      assets,
      chart: {
        type: 'bar',
        title: 'How the assets are funded ($)',
        categories: ['Debt', 'Equity'],
        series: [{ name: 'Amount', values: [debt, equity] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `D/E = $${fmt(debt, 0)} ÷ $${fmt(equity, 0)} = ${fmt(de)}`,
        `Total assets = $${fmt(debt, 0)} + $${fmt(equity, 0)} = $${fmt(assets, 0)}`,
        `Equity multiplier = $${fmt(assets, 0)} ÷ $${fmt(equity, 0)} = ${fmt(assets / equity)}`,
      ],
      note: `For every $1 of equity, the company owes $${fmt(de)}. What counts as high depends on the industry.`,
    };
  },
  content: {
    formula: ['D/E = total liabilities ÷ shareholders\' equity', 'Equity multiplier = total assets ÷ equity = 1 + D/E', 'Debt share = total liabilities ÷ total assets'],
    body: [
      'The debt-to-equity ratio shows how much a company leans on borrowed money compared with the money its owners have put in. A ratio of 1.5 means $1.50 of liabilities for every $1 of equity.',
      'A higher ratio means more leverage. That can boost returns in good years, but interest has to be paid even in bad ones, so risk rises too.',
      'Normal levels vary a lot. Utilities and banks often carry high ratios, while software firms tend to carry low ones. Compare a company with its peers, not with a single cut-off.',
      'This version uses total liabilities. Some analysts use only interest-bearing debt, which gives a lower figure. Use the same definition every time you compare.',
    ],
    faq: [
      { q: 'How do you calculate debt-to-equity?', a: 'Divide total liabilities by shareholders\' equity. $600,000 of liabilities and $400,000 of equity gives 600,000 ÷ 400,000 = 1.5.' },
      { q: 'What is a good debt-to-equity ratio?', a: 'It depends on the industry. Many analysts treat 1 to 2 as common, but capital-heavy industries often run higher.' },
      { q: 'What is the equity multiplier?', a: 'Total assets divided by equity. It equals 1 plus the D/E ratio, so a D/E of 1.5 gives 2.5.' },
      { q: 'Can the ratio be negative?', a: 'Yes, when equity is negative. This calculator asks for equity above zero because the ratio is hard to interpret otherwise.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Debt-to-equity ratio', url: 'https://www.investopedia.com/terms/d/debtequityratio.asp' },
    ],
  },
  related: ['wacc-calculator', 'pe-ratio-calculator', 'net-worth', 'debt-to-income', 'roi'],
  examples: [
    // 600/400 = 1.5; assets 1,000k; multiplier 2.5; debt share 60%
    { values: { debt: 600000, equity: 400000 }, expect: { de: 1.5, multiplier: 2.5, debtShare: 0.6, assets: 1000000 }, tolerance: 1e-9 },
    // no debt: D/E 0, multiplier 1, share 0
    { values: { debt: 0, equity: 50000 }, expect: { de: 0, multiplier: 1, debtShare: 0 }, tolerance: 1e-9 },
  ],
});
