import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'asset-turnover-calculator',
  title: 'Asset Turnover Ratio Calculator',
  category: 'finance',
  description: 'Calculate the asset turnover ratio from revenue and beginning and ending total assets. See how many dollars of sales each dollar of assets produces.',
  keywords: ['asset turnover ratio calculator', 'total asset turnover', 'asset turnover formula', 'asset efficiency ratio', 'dupont asset turnover'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'revenue', label: 'Net revenue (sales)', type: 'number', prefix: '$', default: 500000, min: 0, max: 1e13, step: 1000, info: 'Total sales for the period, after returns and discounts.' },
    { id: 'beginAssets', label: 'Total assets at start of period', type: 'number', prefix: '$', default: 380000, min: 0, max: 1e13, step: 1000, info: 'From the balance sheet at the start of the period.' },
    { id: 'endAssets', label: 'Total assets at end of period', type: 'number', prefix: '$', default: 420000, min: 0, max: 1e13, step: 1000, info: 'From the balance sheet at the end of the period.' },
  ],
  outputs: [
    { id: 'turnover', label: 'Asset turnover', format: 'number', precision: 2, primary: true, info: 'Revenue ÷ average total assets.' },
    { id: 'avgAssets', label: 'Average total assets', format: 'currency', precision: 0, info: '(Beginning assets + ending assets) ÷ 2.' },
    { id: 'perDollar', label: 'Revenue per $1 of assets', format: 'currency', precision: 2, info: 'The same ratio shown in dollars.' },
  ],
  compute: (v) => {
    const rev = num(v.revenue), b = num(v.beginAssets), e = num(v.endAssets);
    if (rev === null || b === null || e === null) return { turnover: null };
    if (rev < 0 || b < 0 || e < 0) return { turnover: null };
    const avg = (b + e) / 2;
    if (avg <= 0) return { turnover: null };
    const t = rev / avg;
    return {
      turnover: t,
      avgAssets: avg,
      perDollar: t,
      chart: {
        type: 'bar',
        title: 'Sales vs. the assets that produced them ($)',
        categories: ['Start assets', 'End assets', 'Average assets', 'Revenue'],
        series: [{ name: 'Amount', values: [b, e, avg, rev] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Average assets = ($${fmt(b, 0)} + $${fmt(e, 0)}) ÷ 2 = $${fmt(avg, 0)}`,
        `Asset turnover = $${fmt(rev, 0)} ÷ $${fmt(avg, 0)} = ${fmt(t)}`,
      ],
      note: `Each $1 of assets produced about $${fmt(t)} of revenue. Compare it with companies in the same industry, since capital-heavy businesses run lower.`,
    };
  },
  content: {
    formula: ['Average total assets = (beginning assets + ending assets) ÷ 2', 'Asset turnover = net revenue ÷ average total assets'],
    body: [
      'Asset turnover measures how efficiently a company uses what it owns to make sales. A ratio of 1.2 means every $1 of assets generated $1.20 of revenue over the period.',
      'Use the average of the starting and ending balance sheet rather than one snapshot, because assets can grow or shrink during the year and a single date can distort the result.',
      'The ratio depends heavily on the industry. Retailers and grocers often turn assets over more than twice a year, while utilities and telecoms, which own a lot of equipment, sit well below 1. Only compare like with like.',
      'It is also the middle piece of the DuPont breakdown of return on equity: net margin × asset turnover × equity multiplier. A low-margin business can still earn well if its turnover is high.',
    ],
    faq: [
      { q: 'How do you calculate asset turnover?', a: 'Divide net revenue by average total assets. With $500,000 of revenue and assets of $380,000 and $420,000, the average is $400,000 and the ratio is 500,000 ÷ 400,000 = 1.25.' },
      { q: 'What is a good asset turnover ratio?', a: 'It depends on the industry. Higher means more sales per dollar of assets, but a retailer and a utility cannot be compared directly. Track the same company over time.' },
      { q: 'Why average the assets?', a: 'Revenue builds up over a whole period, while a balance sheet shows one date. Averaging the start and end values matches the two better.' },
      { q: 'How is it different from fixed asset turnover?', a: 'Fixed asset turnover divides revenue by property, plant and equipment only. Total asset turnover, as calculated here, uses all assets including cash and receivables.' },
    ],
    sources: [
      { label: 'Investopedia: Asset turnover ratio', url: 'https://www.investopedia.com/terms/a/assetturnover.asp' },
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
    ],
  },
  related: ['roa-calculator', 'roe-calculator', 'inventory-turnover-calculator', 'receivables-turnover-calculator', 'profit-margin', 'current-ratio-calculator'],
  examples: [
    // avg (380000+420000)/2 = 400000; 500000/400000 = 1.25
    { values: { revenue: 500000, beginAssets: 380000, endAssets: 420000 }, expect: { turnover: 1.25, avgAssets: 400000, perDollar: 1.25 }, tolerance: 1e-9 },
    // avg 1,000,000; 2,500,000/1,000,000 = 2.5
    { values: { revenue: 2500000, beginAssets: 900000, endAssets: 1100000 }, expect: { turnover: 2.5, avgAssets: 1000000 }, tolerance: 1e-9 },
  ],
});
