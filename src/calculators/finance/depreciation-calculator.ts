import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'depreciation-calculator',
  title: 'Depreciation Calculator',
  category: 'finance',
  description: 'Work out yearly depreciation and book value for an asset using the straight-line or double-declining balance method, with a year-by-year chart.',
  keywords: ['depreciation calculator', 'straight line depreciation calculator', 'double declining balance calculator', 'book value calculator', 'asset depreciation schedule'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'cost', label: 'Purchase cost', type: 'number', prefix: '$', default: 50000, min: 0, max: 1000000000, step: 100, info: 'What you paid for the asset, including set-up costs.' },
    { id: 'salvage', label: 'Salvage value', type: 'number', prefix: '$', default: 5000, min: 0, max: 1000000000, step: 100, info: 'What you expect it to be worth at the end of its useful life.' },
    { id: 'life', label: 'Useful life', type: 'number', suffix: 'years', default: 5, min: 1, max: 50, step: 1, info: 'How many whole years the asset is expected to be used.' },
    {
      id: 'method',
      label: 'Method',
      type: 'select',
      default: 'sl',
      options: [
        { value: 'sl', label: 'Straight-line' },
        { value: 'ddb', label: 'Double-declining balance' },
      ],
      info: 'Straight-line spreads the cost evenly. Double-declining takes bigger deductions early.',
    },
  ],
  outputs: [
    { id: 'first', label: 'Year 1 depreciation', format: 'currency', precision: 2, primary: true, info: 'The depreciation expense in the first year.' },
    { id: 'total', label: 'Total depreciation', format: 'currency', precision: 2, info: 'Cost minus salvage value, written off over the full life.' },
    { id: 'rate', label: 'Year 1 rate', format: 'percent', precision: 2, info: 'Year 1 depreciation as a share of the cost.' },
  ],
  compute: (v) => {
    const cost = num(v.cost);
    const salvage = num(v.salvage);
    const lifeRaw = num(v.life);
    if (cost === null || salvage === null || lifeRaw === null) return { first: null };
    const life = Math.round(lifeRaw);
    if (cost <= 0 || salvage < 0 || salvage > cost || life < 1) return { first: null };
    const ddb = v.method === 'ddb';
    const sl = (cost - salvage) / life;
    const rows: number[] = [];
    const book: number[] = [cost];
    let b = cost;
    for (let y = 1; y <= life; y++) {
      let d: number;
      if (!ddb) d = sl;
      else if (y === life) d = b - salvage;
      else d = Math.min((2 / life) * b, b - salvage);
      d = Math.max(0, d);
      rows.push(d);
      b -= d;
      book.push(b);
    }
    const first = rows[0];
    return {
      first,
      total: cost - salvage,
      rate: first / cost,
      chart: {
        type: 'line',
        title: 'Book value by year',
        x: book.map((_, i) => i),
        xLabel: 'Year',
        yFormat: { format: 'currency' },
        series: [{ name: 'Book value', values: book }],
      },
      steps: ddb
        ? [`Rate = 2 ÷ ${life} = ${fmt((2 / life) * 100)}% of book value each year`, `Year 1 = $${fmt(cost)} × ${fmt((2 / life) * 100)}% = $${fmt(first)}`, 'The last year is adjusted so book value ends at salvage value.']
        : [`Yearly depreciation = ($${fmt(cost)} − $${fmt(salvage)}) ÷ ${life} = $${fmt(sl)}`],
      note: `After ${life} years the book value is $${fmt(book[life])}.`,
    };
  },
  content: {
    formula: ['Straight-line = (cost − salvage value) ÷ useful life', 'Double-declining = 2 ÷ life × opening book value (never below salvage value)'],
    body: [
      'Depreciation spreads the cost of an asset, such as a vehicle or machine, over the years you use it. It lowers its book value on paper each year until it reaches the salvage value.',
      'Straight-line is the simplest method: the same amount every year. Double-declining balance applies twice the straight-line rate to the remaining book value, so deductions are largest in year 1 and shrink after that.',
      'This is an accounting estimate. Tax depreciation follows its own rules, so check with a tax professional before using these numbers on a return.',
    ],
    faq: [
      { q: 'How do you calculate straight-line depreciation?', a: 'Subtract the salvage value from the cost and divide by the useful life. $50,000 cost, $5,000 salvage and 5 years gives $9,000 a year.' },
      { q: 'How does double-declining balance work?', a: 'Each year you take 2 ÷ life of the opening book value. For 5 years that is 40%, so $50,000 gives $20,000 in year 1, then 40% of $30,000 is $12,000 in year 2.' },
      { q: 'What is salvage value?', a: 'The amount you expect to sell the asset for, or its scrap value, at the end of its useful life. Depreciation stops when book value reaches it.' },
      { q: 'What is book value?', a: 'Purchase cost minus the depreciation taken so far. It can differ a lot from what the asset would sell for.' },
    ],
    sources: [
      { label: 'IRS Publication 946: How to Depreciate Property', url: 'https://www.irs.gov/publications/p946' },
      { label: 'Investopedia: Depreciation', url: 'https://www.investopedia.com/terms/d/depreciation.asp' },
    ],
  },
  related: ['roi', 'payback-period', 'break-even', 'npv-irr-calculator', 'profit-margin'],
  examples: [
    // (50000-5000)/5 = 9000; 9000/50000 = 18%
    { values: { cost: 50000, salvage: 5000, life: 5, method: 'sl' }, expect: { first: 9000, total: 45000, rate: 0.18 }, tolerance: 1e-9 },
    // DDB 5y: 2/5=40% of 50000 = 20000
    { values: { cost: 50000, salvage: 5000, life: 5, method: 'ddb' }, expect: { first: 20000, total: 45000, rate: 0.4 }, tolerance: 1e-9 },
  ],
});
