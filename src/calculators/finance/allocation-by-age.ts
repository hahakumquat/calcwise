import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const RULES = [100, 110, 120];

export default defineCalculator({
  slug: 'allocation-by-age',
  title: 'Allocation by Age Calculator: Stocks vs Bonds',
  seoTitle: 'Asset Allocation by Age Calculator',
  metaDescription: 'See the 100, 110 and 120 minus age rules of thumb side by side: what share of your portfolio goes in stocks and bonds, and how many dollars that is.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Compare the popular 100, 110 and 120 minus your age rules for splitting a portfolio between stocks and bonds, shown as percentages and dollars.',
  keywords: ['asset allocation by age', '110 minus age rule', '100 minus your age', 'stocks vs bonds by age calculator', 'age based asset allocation'],
  popular: false,
  inputs: [
    { id: 'age', label: 'Your age', type: 'number', default: 30, min: 0, max: 120, step: 1, suffix: 'years', info: 'Your age today.' },
    { id: 'value', label: 'Portfolio value', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'The total you want to split between stocks and bonds.' },
  ],
  outputs: [
    { id: 's100', label: 'Stocks, 100 rule', format: 'number', precision: 0, suffix: '%', info: '100 minus your age, kept between 0 and 100.' },
    { id: 's110', label: 'Stocks, 110 rule', format: 'number', precision: 0, suffix: '%', primary: true, info: '110 minus your age, kept between 0 and 100.' },
    { id: 's120', label: 'Stocks, 120 rule', format: 'number', precision: 0, suffix: '%', info: '120 minus your age, kept between 0 and 100.' },
    { id: 'd100', label: 'Stocks in dollars, 100 rule', format: 'currency', info: 'Portfolio value × stock share.' },
    { id: 'd110', label: 'Stocks in dollars, 110 rule', format: 'currency', info: 'Portfolio value × stock share.' },
    { id: 'd120', label: 'Stocks in dollars, 120 rule', format: 'currency', info: 'Portfolio value × stock share.' },
    { id: 'b100', label: 'Bonds in dollars, 100 rule', format: 'currency', info: 'Portfolio value minus stocks.' },
    { id: 'b110', label: 'Bonds in dollars, 110 rule', format: 'currency', info: 'Portfolio value minus stocks.' },
    { id: 'b120', label: 'Bonds in dollars, 120 rule', format: 'currency', info: 'Portfolio value minus stocks.' },
  ],
  compute: (v) => {
    const age = num(v.age), value = num(v.value);
    if (age === null || value === null) return { s110: null };
    if (age < 0 || value < 0) return { s110: null, error: 'Age and portfolio value cannot be negative.' };
    const out: Record<string, any> = {};
    const shares = RULES.map((r) => Math.min(100, Math.max(0, r - age)));
    RULES.forEach((r, i) => {
      out[`s${r}`] = shares[i];
      out[`d${r}`] = (value * shares[i]) / 100;
      out[`b${r}`] = value - (value * shares[i]) / 100;
    });
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Stocks and bonds under each rule ($)',
      categories: RULES.map((r) => `${r} minus age`),
      series: [
        { name: 'Stocks', values: RULES.map((r) => out[`d${r}`]) },
        { name: 'Bonds', values: RULES.map((r) => out[`b${r}`]) },
      ],
      format: { format: 'currency' },
    };
    return {
      ...out,
      tone: 'ok',
      badge: `${shares[1]}% stocks, ${100 - shares[1]}% bonds (110 rule)`,
      chart,
      steps: [
        `Stock share = rule number - age, so 110 - ${age} = ${110 - age}, kept between 0 and 100`,
        `Stocks = ${money(value, 0)} × ${shares[1]}% = ${money(out.d110, 0)}`,
        `Bonds = ${money(value, 0)} - ${money(out.d110, 0)} = ${money(out.b110, 0)}`,
      ],
      note: 'These are popular rules of thumb with no official standard. They ignore your goals, other savings and how much risk you can handle. This is not investment advice.',
    };
  },
  content: {
    formula: [
      'Stock share = rule number (100, 110 or 120) - your age, kept between 0% and 100%',
      'Bond share = 100% - stock share',
      'Dollars = portfolio value × share',
    ],
    body: [
      'A common rule of thumb says to hold your age in bonds, or put 100 minus your age in stocks. As people live longer, some use 110 or 120 instead, which keeps more in stocks. The idea is simple: the older you get, the less time you have to recover from a market fall, so the share in stocks shrinks.',
      'Enter your age and portfolio value to see the three versions side by side, as percentages and as dollars. The 110 rule is shown as the headline figure because it sits in the middle.',
      'None of these rules is a standard, and they are not advice. Your income, other savings, goals and comfort with losses matter more than a formula. Treat the result as a starting point for a conversation, not an instruction.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'At 30 with $50,000, the 100 rule gives 70% stocks and 30% bonds, which is $35,000 and $15,000. The 110 rule gives 80/20, or $40,000 and $10,000. The 120 rule gives 90/10, or $45,000 and $5,000.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The investment calculator projects growth, and the portfolio rebalance calculator shows how much to buy or sell to reach a chosen mix.',
        ],
      },
    ],
    faq: [
      { q: 'What is the 110 minus age rule?', a: 'It puts 110 minus your age in stocks and the rest in bonds. At 30 that is 80% stocks and 20% bonds. At 60 it is 50/50.' },
      { q: 'Is 100 minus age or 120 minus age better?', a: 'There is no proven answer. The higher the number, the more in stocks, which means more growth potential and bigger swings. Pick what fits your situation.' },
      { q: 'What happens past age 100 or above the rule number?', a: 'The stock share cannot go below 0%, so the calculator stops at 0% stocks. Under the 120 rule, someone aged 20 would get 100% stocks, not more.' },
      { q: 'Is this investment advice?', a: 'No. These are popular rules of thumb with no official standard. The calculator does arithmetic only.' },
    ],
    sources: [],
  },
  related: ['investment', 'portfolio-rebalance', 'net-worth'],
  examples: [
    // age 30, $50,000: 70/80/90 -> stocks 35000/40000/45000, bonds 15000/10000/5000
    { values: { age: 30, value: 50000 }, expect: { s100: 70, s110: 80, s120: 90, d100: 35000, d110: 40000, d120: 45000, b100: 15000, b110: 10000, b120: 5000 }, tolerance: 1e-6 },
    // age 60, $200,000: 40/50/60 -> 80000/100000/120000
    { values: { age: 60, value: 200000 }, expect: { s100: 40, s110: 50, s120: 60, d100: 80000, d110: 100000, d120: 120000 }, tolerance: 1e-6 },
    // age 105: 100 rule floors at 0, 110 -> 5, 120 -> 15
    { values: { age: 105, value: 10000 }, expect: { s100: 0, s110: 5, s120: 15, d110: 500 }, tolerance: 1e-6 },
  ],
});
