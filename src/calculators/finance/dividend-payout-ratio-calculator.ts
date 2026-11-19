import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'dividend-payout-ratio-calculator',
  title: 'Dividend Payout Ratio Calculator',
  category: 'finance',
  description: 'Calculate the dividend payout ratio and retention ratio from dividends and net income. See how much profit a company pays out and how much it keeps.',
  keywords: ['dividend payout ratio calculator', 'payout ratio formula', 'retention ratio calculator', 'how to calculate dividend payout ratio', 'dividend payout ratio'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'dividends', label: 'Total dividends paid', type: 'number', prefix: '$', default: 40000, min: 0, max: 1e13, step: 1000, info: 'Common dividends paid for the period. Preferred dividends are usually taken out of net income first.' },
    { id: 'income', label: 'Net income', type: 'number', prefix: '$', default: 100000, min: 0, max: 1e13, step: 1000, info: 'Profit after tax for the same period.' },
  ],
  outputs: [
    { id: 'payout', label: 'Dividend payout ratio', format: 'percent', precision: 1, primary: true, info: 'Dividends ÷ net income.' },
    { id: 'retention', label: 'Retention ratio', format: 'percent', precision: 1, info: '1 − payout ratio: the share of profit kept in the business.' },
    { id: 'retained', label: 'Earnings retained', format: 'currency', precision: 0, info: 'Net income − dividends.' },
  ],
  compute: (v) => {
    const d = num(v.dividends), n = num(v.income);
    if (d === null || n === null) return { payout: null };
    if (d < 0 || n <= 0) return { payout: null };
    const payout = d / n;
    const retention = 1 - payout;
    const retained = n - d;
    return {
      payout,
      retention,
      retained,
      chart: {
        type: 'bar',
        title: 'Where net income goes ($)',
        categories: ['Net income', 'Dividends paid', 'Earnings retained'],
        series: [{ name: 'Amount', values: [n, d, retained] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Payout ratio = $${fmt(d, 0)} ÷ $${fmt(n, 0)} = ${fmt(payout * 100, 1)}%`,
        `Retention ratio = 1 − ${fmt(payout, 4)} = ${fmt(retention * 100, 1)}%`,
        `Earnings retained = $${fmt(n, 0)} − $${fmt(d, 0)} = $${fmt(retained, 0)}`,
      ],
      note: payout > 1
        ? 'The payout ratio is above 100%: the company paid out more than it earned, which it can only sustain by using cash reserves or borrowing.'
        : `The company paid out ${fmt(payout * 100, 1)}% of its profit and kept the rest to reinvest.`,
    };
  },
  content: {
    formula: ['Dividend payout ratio = total dividends ÷ net income', 'Retention ratio = 1 − payout ratio'],
    body: [
      'The dividend payout ratio shows what share of a company’s profit goes to shareholders as dividends. The rest is retained to pay down debt, fund growth or build cash.',
      'A low ratio usually means a growing company that reinvests most of its earnings. A high ratio is typical of mature businesses with steady cash flow. Above 100% means dividends exceeded profit for the period, which is hard to keep up.',
      'What counts as healthy depends on the industry, so compare a company with its peers and look at several years rather than one. You can run the same sum per share by dividing dividends per share by earnings per share.',
      'The retention ratio is the mirror image. Multiply it by return on equity to estimate the sustainable growth rate.',
    ],
    faq: [
      { q: 'How do you calculate the dividend payout ratio?', a: 'Divide total dividends by net income. With $40,000 of dividends and $100,000 of net income, the payout ratio is 40%.' },
      { q: 'What is a good dividend payout ratio?', a: 'There is no single answer. Many investors treat 30% to 60% as a sustainable range for a mature company, but it varies by industry. A ratio above 100% is a warning sign.' },
      { q: 'What is the retention ratio?', a: 'It is the share of net income the company keeps, equal to 1 minus the payout ratio. At a 40% payout, the retention ratio is 60%.' },
      { q: 'Can the payout ratio be calculated per share?', a: 'Yes. Dividends per share divided by earnings per share gives the same ratio. This calculator needs net income above zero, since the ratio is not meaningful for a loss.' },
    ],
    sources: [
      { label: 'Investopedia: Dividend payout ratio', url: 'https://www.investopedia.com/terms/d/dividendpayoutratio.asp' },
      { label: 'Investor.gov: Dividend', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/dividend' },
    ],
  },
  related: ['dividend-calculator', 'eps-calculator', 'pe-ratio-calculator', 'sustainable-growth-rate', 'roe-calculator'],
  examples: [
    // 40000/100000 = 0.4; retention 0.6; retained 60000
    { values: { dividends: 40000, income: 100000 }, expect: { payout: 0.4, retention: 0.6, retained: 60000 }, tolerance: 1e-9 },
    // 120000/100000 = 1.2; retention -0.2; retained -20000
    { values: { dividends: 120000, income: 100000 }, expect: { payout: 1.2, retention: -0.2, retained: -20000 }, tolerance: 1e-9 },
  ],
});
