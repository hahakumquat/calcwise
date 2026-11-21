import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'side-hustle-goal',
  title: 'Side Hustle Goal Calculator',
  category: 'finance',
  description: 'Find how many sales, orders or hours a month your side hustle needs to hit an income goal, after platform fees and the cost of each sale.',
  keywords: ['side hustle calculator', 'side hustle income goal', 'how many sales do i need', 'etsy profit goal calculator', 'extra income goal calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'target', label: 'Monthly profit goal', type: 'number', prefix: '$', default: 500, min: 0, step: 50, info: 'What you want to keep each month, after fees and costs.' },
    { id: 'price', label: 'Price per sale', type: 'number', prefix: '$', default: 25, min: 0, step: 1, info: 'What the customer pays for one order, item or hour.' },
    { id: 'cost', label: 'Cost per sale', type: 'number', prefix: '$', default: 8, min: 0, step: 0.5, info: 'Materials, shipping, supplies or anything else you spend on each sale.' },
    { id: 'fee', label: 'Platform and payment fees', type: 'number', default: 10, min: 0, max: 99, step: 0.5, suffix: '% of price', info: 'Marketplace, card processing and similar fees taken from each sale.' },
  ],
  outputs: [
    { id: 'units', label: 'Sales needed per month', format: 'number', precision: 0, primary: true, info: 'Monthly goal divided by profit per sale, rounded up to a whole sale.' },
    { id: 'weekly', label: 'Sales needed per week', format: 'number', precision: 1, info: 'Monthly sales times 12, divided by 52 weeks.' },
    { id: 'profit', label: 'Profit per sale', format: 'currency', precision: 2, info: 'Price minus fees minus cost.' },
    { id: 'revenue', label: 'Revenue needed per month', format: 'currency', precision: 0, info: 'Whole sales needed times the price.' },
  ],
  compute: (v) => {
    const target = num(v.target);
    const price = num(v.price);
    const cost = num(v.cost);
    const fee = num(v.fee);
    if (target === null || price === null || cost === null || fee === null) return { units: null };
    if (target < 0 || price < 0 || cost < 0 || fee < 0 || fee >= 100) return { units: null };
    const feeAmt = price * (fee / 100);
    const profit = price - feeAmt - cost;
    if (profit <= 0) return { units: null, error: 'Each sale loses money after fees and costs. Raise the price or cut the cost.' };
    const units = Math.ceil(target / profit - 1e-9);
    const weekly = (units * 12) / 52;
    const revenue = units * price;
    const margin = profit / price;
    return {
      units,
      weekly,
      profit,
      revenue,
      tone: margin >= 0.3 ? 'good' : 'ok',
      badge: `${fmt(margin * 100, 0)}% kept per sale`,
      chart: {
        type: 'donut',
        title: 'Where the price of one sale goes',
        slices: [
          { label: 'Your profit', value: profit },
          { label: 'Cost', value: cost },
          { label: 'Fees', value: feeAmt },
        ],
        format: { format: 'currency', precision: 2 },
        centerLabel: 'Price',
        centerValue: `$${fmt(price)}`,
      },
      steps: [
        `Fees = $${fmt(price)} × ${fmt(fee)}% = $${fmt(feeAmt)}`,
        `Profit per sale = $${fmt(price)} − $${fmt(feeAmt)} − $${fmt(cost)} = $${fmt(profit)}`,
        `Sales = $${fmt(target, 0)} ÷ $${fmt(profit)} = ${fmt(target / profit, 2)}, rounded up to ${fmt(units, 0)}`,
        `Per week = ${fmt(units, 0)} × 12 ÷ 52 = ${fmt(weekly, 1)}`,
      ],
      note: `Make about ${fmt(units, 0)} sales a month (${fmt(weekly, 1)} a week) to keep $${fmt(target, 0)}.`,
    };
  },
  content: {
    formula: [
      'Profit per sale = price × (1 − fee %) − cost per sale',
      'Sales needed per month = monthly goal ÷ profit per sale, rounded up',
      'Sales per week = sales per month × 12 ÷ 52',
    ],
    body: [
      'A side hustle goal is easier to act on as a number of sales than as a dollar figure. This calculator works back from the profit you want each month to the number of orders, items or paid hours it takes, once fees and the cost of each sale are taken out.',
      'Example: you want $500 a month, sell at $25, spend $8 per sale and lose 10% to fees. Fees are $2.50, so each sale leaves $25 − $2.50 − $8 = $14.50. $500 ÷ $14.50 is 34.48, so you need 35 sales a month, about 8.1 a week.',
      'It rounds up because you cannot sell part of an order. The 35 sales bring in $875 of revenue and $507.50 of profit, slightly over the goal.',
      'For an hourly service, treat one hour as one sale. Set the price to your hourly rate and the cost to anything you spend per hour. This does not include tax or the time spent on admin, so leave some room.',
    ],
    faq: [
      { q: 'How many sales do I need to make $500 a month?', a: 'With a $25 price, $8 cost and 10% fees, each sale leaves $14.50, so you need 35 sales a month, or about 8.1 a week.' },
      { q: 'Why does the answer round up?', a: 'Sales come in whole numbers. 34.48 sales would fall short of the goal, so the calculator shows 35.' },
      { q: 'Does this include tax?', a: 'No. The goal is profit before income tax. If you want a figure after tax, raise your goal to cover it.' },
      { q: 'What if each sale loses money?', a: 'If fees and costs are higher than the price, no number of sales reaches the goal. The calculator asks you to raise the price or cut the cost.' },
    ],
    sources: [],
  },
  related: ['freelance-rate', 'break-even', 'profit-margin', 'markup'],
  examples: [
    // fees 25*0.10=2.5; profit 25-2.5-8=14.5; 500/14.5=34.48 -> 35; weekly 35*12/52=8.0769; revenue 35*25=875
    { values: { target: 500, price: 25, cost: 8, fee: 10 }, expect: { units: 35, profit: 14.5, weekly: 8.0769, revenue: 875 }, tolerance: 1e-3 },
    // no fee; profit 40-15=25; 1000/25=40 exactly; weekly 40*12/52=9.2308; revenue 1600
    { values: { target: 1000, price: 40, cost: 15, fee: 0 }, expect: { units: 40, profit: 25, weekly: 9.2308, revenue: 1600 }, tolerance: 1e-3 },
  ],
});
