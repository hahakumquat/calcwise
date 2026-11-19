import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'cash-conversion-cycle',
  title: 'Cash Conversion Cycle Calculator',
  category: 'finance',
  description: 'Calculate the cash conversion cycle from days inventory outstanding, days sales outstanding and days payables outstanding. See how long cash is tied up.',
  keywords: ['cash conversion cycle calculator', 'CCC formula', 'DIO DSO DPO', 'days payables outstanding', 'working capital cycle'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'dio', label: 'Days inventory outstanding (DIO)', type: 'number', default: 60, min: 0, max: 3650, step: 0.1, info: 'Average days stock sits before it is sold. 365 ÷ inventory turnover.' },
    { id: 'dso', label: 'Days sales outstanding (DSO)', type: 'number', default: 45, min: 0, max: 3650, step: 0.1, info: 'Average days customers take to pay. 365 ÷ receivables turnover.' },
    { id: 'dpo', label: 'Days payables outstanding (DPO)', type: 'number', default: 30, min: 0, max: 3650, step: 0.1, info: 'Average days you take to pay suppliers.' },
  ],
  outputs: [
    { id: 'ccc', label: 'Cash conversion cycle', format: 'number', precision: 1, suffix: ' days', primary: true, info: 'DIO + DSO − DPO.' },
    { id: 'operating', label: 'Operating cycle', format: 'number', precision: 1, suffix: ' days', info: 'DIO + DSO: from buying stock to collecting cash.' },
    { id: 'supplier', label: 'Supplier credit', format: 'number', precision: 1, suffix: ' days', info: 'DPO: days of the cycle funded by suppliers.' },
  ],
  compute: (v) => {
    const i = num(v.dio);
    const s = num(v.dso);
    const p = num(v.dpo);
    if (i === null || s === null || p === null) return { ccc: null };
    if (i < 0 || s < 0 || p < 0) return { ccc: null };
    const op = i + s;
    const ccc = op - p;
    return {
      ccc,
      operating: op,
      supplier: p,
      chart: {
        type: 'bar',
        title: 'Days in each stage',
        categories: ['Inventory (DIO)', 'Customers (DSO)', 'Suppliers (DPO)', 'Cash cycle'],
        series: [{ name: 'Days', values: [i, s, p, ccc] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Operating cycle = ${fmt(i)} + ${fmt(s)} = ${fmt(op)} days`,
        `Cash conversion cycle = ${fmt(op)} − ${fmt(p)} = ${fmt(ccc)} days`,
      ],
      note: ccc > 0
        ? `Cash is tied up for about ${fmt(ccc, 0)} days between paying suppliers and collecting from customers. Shortening DIO or DSO, or stretching DPO, frees cash.`
        : `A negative cycle means customers pay you ${fmt(-ccc, 0)} days before suppliers need paying, so the business is funded by its suppliers.`,
    };
  },
  content: {
    formula: ['Operating cycle = DIO + DSO', 'Cash conversion cycle = DIO + DSO − DPO'],
    body: [
      'The cash conversion cycle measures how many days a dollar spent on stock stays tied up before it comes back as cash from a customer. It combines three timings: how long inventory sits, how long customers take to pay, and how long you take to pay suppliers.',
      'A shorter cycle means less cash is locked in working capital. A negative cycle, which some retailers and subscription businesses achieve, means suppliers effectively finance the business.',
      'Get your inputs from the inventory turnover and receivables turnover calculators (365 ÷ turnover), and from DPO, which is average payables ÷ cost of goods sold × days in the period. Always use the same period for all three.',
    ],
    faq: [
      { q: 'How do you calculate the cash conversion cycle?', a: 'Add days inventory outstanding and days sales outstanding, then subtract days payables outstanding. 60 + 45 − 30 = 75 days.' },
      { q: 'Can the cash conversion cycle be negative?', a: 'Yes. If you collect from customers before you pay suppliers, DIO + DSO is smaller than DPO and the cycle is negative. For example 20 + 5 − 50 = −25 days.' },
      { q: 'What is a good cash conversion cycle?', a: 'Shorter is better, but norms differ a lot by industry. Compare with similar businesses and with your own past figures.' },
      { q: 'How do you calculate DPO?', a: 'Average accounts payable ÷ cost of goods sold × days in the period.' },
    ],
    sources: [
      { label: 'Investopedia: Cash conversion cycle', url: 'https://www.investopedia.com/terms/c/cashconversioncycle.asp' },
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
    ],
  },
  related: ['inventory-turnover-calculator', 'receivables-turnover-calculator', 'current-ratio-calculator', 'roe-calculator', 'break-even'],
  examples: [
    { values: { dio: 60, dso: 45, dpo: 30 }, expect: { ccc: 75, operating: 105, supplier: 30 }, tolerance: 1e-9 },
    { values: { dio: 20, dso: 5, dpo: 50 }, expect: { ccc: -25, operating: 25, supplier: 50 }, tolerance: 1e-9 },
  ],
});
