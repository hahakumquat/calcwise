import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'free-cash-flow-calculator',
  title: 'Free Cash Flow Calculator',
  category: 'finance',
  description: 'Calculate free cash flow from operating cash flow and capital spending, plus FCF margin and FCF yield. See the cash a business keeps after investing.',
  keywords: ['free cash flow calculator', 'FCF calculator', 'FCF margin', 'free cash flow yield', 'operating cash flow minus capex'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'ocf', label: 'Operating cash flow', type: 'number', prefix: '$', default: 500000, min: -1e12, max: 1e12, step: 1000, info: 'Cash from operations, from the cash flow statement.' },
    { id: 'capex', label: 'Capital expenditures', type: 'number', prefix: '$', default: 150000, min: 0, max: 1e12, step: 1000, info: 'Cash spent on equipment, property and other long-term assets.' },
    { id: 'revenue', label: 'Revenue (optional)', type: 'number', prefix: '$', default: 2000000, min: 0, max: 1e12, step: 1000, info: 'Used for FCF margin. Leave 0 to skip.' },
    { id: 'value', label: 'Market value or equity value (optional)', type: 'number', prefix: '$', default: 8000000, min: 0, max: 1e13, step: 1000, info: 'Used for FCF yield. Leave 0 to skip.' },
  ],
  outputs: [
    { id: 'fcf', label: 'Free cash flow', format: 'currency', precision: 0, primary: true, info: 'Operating cash flow − capital expenditures.' },
    { id: 'margin', label: 'FCF margin', format: 'number', precision: 1, suffix: '%', info: 'FCF ÷ revenue.' },
    { id: 'yield', label: 'FCF yield', format: 'number', precision: 2, suffix: '%', info: 'FCF ÷ market value.' },
  ],
  compute: (v) => {
    const o = num(v.ocf);
    const c = num(v.capex);
    const r = num(v.revenue) ?? 0;
    const m = num(v.value) ?? 0;
    if (o === null || c === null || c < 0 || r < 0 || m < 0) return { fcf: null };
    const fcf = o - c;
    const margin = r > 0 ? (fcf / r) * 100 : null;
    const yld = m > 0 ? (fcf / m) * 100 : null;
    return {
      fcf,
      margin,
      yield: yld,
      chart: {
        type: 'bar',
        title: 'Operating cash flow, capex and free cash flow ($)',
        categories: ['Operating cash flow', 'Capex', 'Free cash flow'],
        series: [{ name: 'Amount', values: [o, c, fcf] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `FCF = $${fmt(o, 0)} − $${fmt(c, 0)} = $${fmt(fcf, 0)}`,
        margin === null ? 'No revenue entered, so no margin.' : `FCF margin = $${fmt(fcf, 0)} ÷ $${fmt(r, 0)} = ${fmt(margin, 1)}%`,
        yld === null ? 'No market value entered, so no yield.' : `FCF yield = $${fmt(fcf, 0)} ÷ $${fmt(m, 0)} = ${fmt(yld, 2)}%`,
      ],
      note: fcf >= 0
        ? 'Positive free cash flow is cash left after keeping the business running and growing. It can fund dividends, debt repayment or buybacks.'
        : 'Negative free cash flow means spending on assets exceeded operating cash. That can be fine for a growing business, but it needs funding from savings, debt or investors.',
    };
  },
  content: {
    formula: ['Free cash flow = operating cash flow − capital expenditures', 'FCF margin = FCF ÷ revenue', 'FCF yield = FCF ÷ market value'],
    body: [
      'Free cash flow (FCF) is the cash a business generates after paying for the assets it needs to keep operating and growing. Unlike profit, it ignores accounting timing and shows actual cash.',
      'FCF margin tells you how many cents of every revenue dollar end up as free cash. FCF yield compares that cash with what the business is worth, which is a quick way to judge how much cash you get for the price.',
      'Be consistent: use the same period for every input, and the same definition of value (market cap for the whole company, or equity value if you only count owners).',
      'One year of FCF can mislead. A big equipment purchase can push it negative, and delayed spending can inflate it, so look at several years.',
    ],
    faq: [
      { q: 'How do you calculate free cash flow?', a: 'Subtract capital expenditures from operating cash flow. $500,000 − $150,000 = $350,000.' },
      { q: 'How do you calculate FCF margin?', a: 'Divide free cash flow by revenue. $350,000 ÷ $2,000,000 = 17.5%.' },
      { q: 'What is FCF yield?', a: 'Free cash flow divided by market value. $350,000 ÷ $8,000,000 = 4.38%.' },
      { q: 'Can free cash flow be negative?', a: 'Yes. It happens when capital spending exceeds operating cash flow, which is common in fast-growing or capital-heavy businesses.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial terms glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Free cash flow', url: 'https://www.investopedia.com/terms/f/freecashflow.asp' },
    ],
  },
  related: ['cash-conversion-cycle', 'roe-calculator', 'roa-calculator', 'sustainable-growth-rate', 'current-ratio-calculator', 'pe-ratio-calculator'],
  examples: [
    // 500000-150000 = 350000; /2000000 = 17.5%; /8000000 = 4.375%
    { values: { ocf: 500000, capex: 150000, revenue: 2000000, value: 8000000 }, expect: { fcf: 350000, margin: 17.5, yield: 4.375 }, tolerance: 1e-9 },
    // 100000-250000 = -150000; /1000000 = -15%
    { values: { ocf: 100000, capex: 250000, revenue: 1000000, value: 0 }, expect: { fcf: -150000, margin: -15 }, tolerance: 1e-9 },
  ],
});
