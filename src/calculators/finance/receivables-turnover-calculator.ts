import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'receivables-turnover-calculator',
  title: 'Receivables Turnover & DSO Calculator',
  category: 'finance',
  description: 'Calculate accounts receivable turnover and days sales outstanding (DSO) from credit sales and opening and closing receivables. See how fast customers pay.',
  keywords: ['receivables turnover calculator', 'days sales outstanding calculator', 'DSO calculator', 'accounts receivable turnover ratio', 'collection period'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'sales', label: 'Net credit sales (per period)', type: 'number', prefix: '$', default: 1200000, min: 0, max: 1e12, step: 1000, info: 'Sales made on credit, after returns and discounts.' },
    { id: 'begin', label: 'Receivables at start of period', type: 'number', prefix: '$', default: 150000, min: 0, max: 1e12, step: 1000, info: 'Accounts receivable on the opening balance sheet.' },
    { id: 'end', label: 'Receivables at end of period', type: 'number', prefix: '$', default: 250000, min: 0, max: 1e12, step: 1000, info: 'Accounts receivable on the closing balance sheet.' },
    { id: 'days', label: 'Days in period', type: 'number', default: 365, min: 1, max: 366, step: 1, info: 'Use 365 for a year, or 90 for a quarter if sales are for the quarter.' },
  ],
  outputs: [
    { id: 'turnover', label: 'Receivables turnover', format: 'number', precision: 2, suffix: 'x', primary: true, info: 'Net credit sales ÷ average receivables.' },
    { id: 'dso', label: 'Days sales outstanding', format: 'number', precision: 1, suffix: ' days', info: 'Days in period ÷ turnover.' },
    { id: 'avg', label: 'Average receivables', format: 'currency', precision: 0, info: '(Opening + closing) ÷ 2.' },
  ],
  compute: (v) => {
    const s = num(v.sales);
    const b = num(v.begin);
    const e = num(v.end);
    const d = num(v.days);
    if (s === null || b === null || e === null || d === null) return { turnover: null };
    if (s < 0 || b < 0 || e < 0 || d <= 0) return { turnover: null };
    const avg = (b + e) / 2;
    if (avg <= 0) return { turnover: null };
    const turnover = s / avg;
    const dso = turnover > 0 ? d / turnover : null;
    return {
      turnover,
      dso,
      avg,
      chart: {
        type: 'bar',
        title: 'Net credit sales vs. average receivables ($)',
        categories: ['Net credit sales', 'Average receivables'],
        series: [{ name: 'Amount', values: [s, avg] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Average receivables = ($${fmt(b, 0)} + $${fmt(e, 0)}) ÷ 2 = $${fmt(avg, 0)}`,
        `Turnover = $${fmt(s, 0)} ÷ $${fmt(avg, 0)} = ${fmt(turnover)}x`,
        dso === null ? 'There were no credit sales, so there is no days figure.' : `DSO = ${fmt(d, 0)} ÷ ${fmt(turnover)} = ${fmt(dso, 1)} days`,
      ],
      note: dso === null
        ? 'With no credit sales, nothing was owed to collect.'
        : `Customers take about ${fmt(dso, 0)} days to pay. Compare that with your payment terms: if you offer net 30, a DSO well above 30 means invoices are running late.`,
    };
  },
  content: {
    formula: ['Average receivables = (opening + closing receivables) ÷ 2', 'Receivables turnover = net credit sales ÷ average receivables', 'Days sales outstanding = days in period ÷ receivables turnover'],
    body: [
      'Receivables turnover shows how many times a business collects its average outstanding invoices in a period. A higher number means customers pay faster and cash comes in sooner.',
      'Days sales outstanding (DSO) expresses the same idea in days: the average time between making a credit sale and getting paid. Compare it with your payment terms. Net 30 terms with a DSO of 60 means many customers are paying late.',
      'Use net credit sales, not total sales, because cash sales never become receivables. If you only know total sales, the result will look better than reality.',
    ],
    faq: [
      { q: 'How do you calculate receivables turnover?', a: 'Divide net credit sales by average accounts receivable. $1,200,000 ÷ $200,000 = 6 times a year.' },
      { q: 'How do you calculate DSO?', a: 'Divide the days in the period by receivables turnover. 365 ÷ 6 = 60.8 days.' },
      { q: 'What is a good DSO?', a: 'Lower is better, and it should sit close to your payment terms. A DSO well above your terms usually points to slow collections.' },
      { q: 'Why average the opening and closing balances?', a: 'Receivables move during the period. The average smooths out a spike or dip on the day the books close.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Accounts receivable turnover ratio', url: 'https://www.investopedia.com/terms/a/accountsreceivableturnover.asp' },
    ],
  },
  related: ['inventory-turnover-calculator', 'current-ratio-calculator', 'roe-calculator', 'profit-margin', 'interest-coverage-ratio'],
  examples: [
    // avg = 200000; 1200000/200000 = 6; 365/6 = 60.8333
    { values: { sales: 1200000, begin: 150000, end: 250000, days: 365 }, expect: { turnover: 6, dso: 60.8333333333, avg: 200000 }, tolerance: 1e-6 },
    // avg 40000; 120000/40000 = 3; 90/3 = 30
    { values: { sales: 120000, begin: 40000, end: 40000, days: 90 }, expect: { turnover: 3, dso: 30, avg: 40000 }, tolerance: 1e-9 },
  ],
});
