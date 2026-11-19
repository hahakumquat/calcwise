import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'payables-turnover-calculator',
  title: 'Payables Turnover & DPO Calculator',
  category: 'finance',
  description: 'Calculate accounts payable turnover and days payable outstanding (DPO) from purchases and opening and closing payables. See how fast you pay suppliers.',
  keywords: ['payables turnover calculator', 'days payable outstanding calculator', 'DPO calculator', 'accounts payable turnover ratio', 'payment period'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'purchases', label: 'Purchases from suppliers (per period)', type: 'number', prefix: '$', default: 1200000, min: 0, max: 1e12, step: 1000, info: 'Goods and services bought on credit. If unknown, use cost of goods sold.' },
    { id: 'begin', label: 'Payables at start of period', type: 'number', prefix: '$', default: 150000, min: 0, max: 1e12, step: 1000, info: 'Accounts payable on the opening balance sheet.' },
    { id: 'end', label: 'Payables at end of period', type: 'number', prefix: '$', default: 250000, min: 0, max: 1e12, step: 1000, info: 'Accounts payable on the closing balance sheet.' },
    { id: 'days', label: 'Days in period', type: 'number', default: 365, min: 1, max: 366, step: 1, info: 'Use 365 for a year, or 90 for a quarter if purchases are for the quarter.' },
  ],
  outputs: [
    { id: 'turnover', label: 'Payables turnover', format: 'number', precision: 2, suffix: 'x', primary: true, info: 'Purchases ÷ average payables.' },
    { id: 'dpo', label: 'Days payable outstanding', format: 'number', precision: 1, suffix: ' days', info: 'Days in period ÷ turnover.' },
    { id: 'avg', label: 'Average payables', format: 'currency', precision: 0, info: '(Opening + closing) ÷ 2.' },
  ],
  compute: (v) => {
    const s = num(v.purchases);
    const b = num(v.begin);
    const e = num(v.end);
    const d = num(v.days);
    if (s === null || b === null || e === null || d === null) return { turnover: null };
    if (s < 0 || b < 0 || e < 0 || d <= 0) return { turnover: null };
    const avg = (b + e) / 2;
    if (avg <= 0) return { turnover: null };
    const turnover = s / avg;
    const dpo = turnover > 0 ? d / turnover : null;
    return {
      turnover,
      dpo,
      avg,
      chart: {
        type: 'bar',
        title: 'Purchases vs. average payables ($)',
        categories: ['Purchases', 'Average payables'],
        series: [{ name: 'Amount', values: [s, avg] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Average payables = ($${fmt(b, 0)} + $${fmt(e, 0)}) ÷ 2 = $${fmt(avg, 0)}`,
        `Turnover = $${fmt(s, 0)} ÷ $${fmt(avg, 0)} = ${fmt(turnover)}x`,
        dpo === null ? 'There were no purchases, so there is no days figure.' : `DPO = ${fmt(d, 0)} ÷ ${fmt(turnover)} = ${fmt(dpo, 1)} days`,
      ],
      note: dpo === null
        ? 'With no purchases, there was nothing to pay.'
        : `You take about ${fmt(dpo, 0)} days to pay suppliers. Compare that with your terms: if suppliers offer net 30, a DPO well above 30 means bills are being paid late.`,
    };
  },
  content: {
    formula: ['Average payables = (opening + closing payables) ÷ 2', 'Payables turnover = purchases ÷ average payables', 'Days payable outstanding = days in period ÷ payables turnover'],
    body: [
      'Payables turnover shows how many times a business pays off its average outstanding supplier bills in a period. A lower number means it takes longer to pay.',
      'Days payable outstanding (DPO) expresses the same idea in days: the average time between receiving a supplier invoice and paying it. Paying slowly keeps cash in the business longer, but paying well past your terms can cost discounts and damage supplier relationships.',
      'Use purchases on credit as the numerator. Many people only know cost of goods sold, which is a fine approximation for a business that holds little inventory, though it will blur the result if stock levels change a lot.',
      'DPO is the third piece of the cash conversion cycle, alongside days inventory and days sales outstanding.',
    ],
    faq: [
      { q: 'How do you calculate payables turnover?', a: 'Divide purchases by average accounts payable. $900,000 ÷ $150,000 = 6 times a year.' },
      { q: 'How do you calculate DPO?', a: 'Divide the days in the period by payables turnover. 365 ÷ 6 = 60.8 days.' },
      { q: 'Is a high DPO good?', a: 'It frees up cash, but a DPO well above your suppliers\' terms means you are paying late. Aim to stay close to the agreed terms.' },
      { q: 'Why average the opening and closing balances?', a: 'Payables move during the period. The average smooths out a spike or dip on the day the books close.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Accounts payable turnover ratio', url: 'https://www.investopedia.com/terms/a/accountspayableturnover.asp' },
    ],
  },
  related: ['cash-conversion-cycle', 'payables-turnover-calculator', 'inventory-turnover-calculator', 'current-ratio-calculator', 'debt-to-equity-ratio', 'interest-coverage-ratio'],
  examples: [
    // avg = 150000; 900000/150000 = 6; 365/6 = 60.8333
    { values: { purchases: 900000, begin: 100000, end: 200000, days: 365 }, expect: { turnover: 6, dpo: 60.8333333333, avg: 150000 }, tolerance: 1e-6 },
    // avg 30000; 90000/30000 = 3; 90/3 = 30
    { values: { purchases: 90000, begin: 30000, end: 30000, days: 90 }, expect: { turnover: 3, dpo: 30, avg: 30000 }, tolerance: 1e-9 },
  ],
});
