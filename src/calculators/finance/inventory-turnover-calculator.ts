import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'inventory-turnover-calculator',
  title: 'Inventory Turnover Calculator',
  category: 'finance',
  description: 'Calculate inventory turnover and days sales of inventory from cost of goods sold and opening and closing stock. See how fast your inventory sells.',
  keywords: ['inventory turnover calculator', 'inventory turnover ratio', 'days sales of inventory', 'days inventory outstanding', 'stock turnover'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'cogs', label: 'Cost of goods sold (per year)', type: 'number', prefix: '$', default: 600000, min: 0, max: 1e12, step: 1000, info: 'What the goods you sold cost you, from the income statement.' },
    { id: 'begin', label: 'Inventory at start of year', type: 'number', prefix: '$', default: 90000, min: 0, max: 1e12, step: 1000, info: 'Value of stock on hand at the start.' },
    { id: 'end', label: 'Inventory at end of year', type: 'number', prefix: '$', default: 110000, min: 0, max: 1e12, step: 1000, info: 'Value of stock on hand at the end.' },
    { id: 'days', label: 'Days in period', type: 'number', default: 365, min: 1, max: 366, step: 1, info: 'Use 365 for a year, or 90 for a quarter if COGS is for the quarter.' },
  ],
  outputs: [
    { id: 'turnover', label: 'Inventory turnover', format: 'number', precision: 2, suffix: 'x', primary: true, info: 'Cost of goods sold ÷ average inventory.' },
    { id: 'dsi', label: 'Days to sell inventory', format: 'number', precision: 1, suffix: ' days', info: 'Days in period ÷ turnover.' },
    { id: 'avg', label: 'Average inventory', format: 'currency', precision: 0, info: '(Opening + closing) ÷ 2.' },
  ],
  compute: (v) => {
    const cogs = num(v.cogs);
    const b = num(v.begin);
    const e = num(v.end);
    const d = num(v.days);
    if (cogs === null || b === null || e === null || d === null) return { turnover: null };
    if (cogs < 0 || b < 0 || e < 0 || d <= 0) return { turnover: null };
    const avg = (b + e) / 2;
    if (avg <= 0) return { turnover: null };
    const turnover = cogs / avg;
    const dsi = turnover > 0 ? d / turnover : null;
    return {
      turnover,
      dsi,
      avg,
      chart: {
        type: 'bar',
        title: 'Cost of goods sold vs. average inventory ($)',
        categories: ['Cost of goods sold', 'Average inventory'],
        series: [{ name: 'Amount', values: [cogs, avg] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Average inventory = ($${fmt(b, 0)} + $${fmt(e, 0)}) ÷ 2 = $${fmt(avg, 0)}`,
        `Turnover = $${fmt(cogs, 0)} ÷ $${fmt(avg, 0)} = ${fmt(turnover)}x`,
        dsi === null ? 'No goods were sold, so there is no days figure.' : `Days to sell = ${fmt(d, 0)} ÷ ${fmt(turnover)} = ${fmt(dsi, 1)} days`,
      ],
      note: dsi === null
        ? 'With no cost of goods sold, the stock did not move.'
        : `Your stock turns over about ${fmt(turnover, 1)} times a period, so an item sits on the shelf for roughly ${fmt(dsi, 0)} days. What is healthy depends on the industry.`,
    };
  },
  content: {
    formula: ['Average inventory = (opening + closing inventory) ÷ 2', 'Inventory turnover = cost of goods sold ÷ average inventory', 'Days sales of inventory = days in period ÷ inventory turnover'],
    body: [
      'Inventory turnover tells you how many times a business sells and replaces its stock in a period. A higher number means goods move faster and less cash is tied up on shelves.',
      'Days sales of inventory turns the same idea into time: the average number of days a unit sits before it sells. Groceries turn over fast and furniture slowly, so compare with businesses in your own industry.',
      'Too low can mean overstock or slow sellers. Too high can mean you are running short and losing sales. Use cost of goods sold, not revenue, so the numerator and the inventory are both at cost.',
    ],
    faq: [
      { q: 'How do you calculate inventory turnover?', a: 'Divide cost of goods sold by average inventory. $600,000 ÷ $100,000 = 6 times a year.' },
      { q: 'How many days does that mean?', a: 'Divide the days in the period by turnover. 365 ÷ 6 = 60.8 days to sell the average stock.' },
      { q: 'Should I use sales or cost of goods sold?', a: 'Use cost of goods sold. Inventory is valued at cost, so sales would overstate the turnover.' },
      { q: 'What is a good inventory turnover?', a: 'It varies by industry. Fast-moving goods like food turn over many times a year; durable goods turn over only a few times.' },
    ],
    sources: [
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: Inventory turnover', url: 'https://www.investopedia.com/terms/i/inventoryturnover.asp' },
    ],
  },
  related: ['roe-calculator', 'profit-margin', 'markup', 'break-even', 'current-ratio-calculator'],
  examples: [
    // avg = 100000; 600000/100000 = 6; 365/6 = 60.8333
    { values: { cogs: 600000, begin: 90000, end: 110000, days: 365 }, expect: { turnover: 6, dsi: 60.8333333333, avg: 100000 }, tolerance: 1e-6 },
    // avg 50000; 200000/50000 = 4; 90/4 = 22.5
    { values: { cogs: 200000, begin: 50000, end: 50000, days: 90 }, expect: { turnover: 4, dsi: 22.5, avg: 50000 }, tolerance: 1e-9 },
  ],
});
