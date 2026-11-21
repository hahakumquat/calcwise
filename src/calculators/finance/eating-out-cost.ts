import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'eating-out-cost',
  title: 'Eating Out vs Cooking Cost Calculator',
  category: 'finance',
  description: 'Work out what eating out, takeout and delivery cost you per year, and how much you would keep by cooking those same meals at home.',
  keywords: ['eating out cost calculator', 'takeout cost per year', 'eating out vs cooking', 'how much does eating out cost', 'food delivery spending', 'cook at home savings'],
  updated: '2026-11-21',
  inputs: [
    { id: 'mealsOut', label: 'Meals eaten out per week', type: 'number', default: 4, min: 0, max: 50, step: 1, info: 'Count restaurants, takeout, delivery and drive-thru. Each person eating counts as one meal.' },
    { id: 'costOut', label: 'Average cost per meal out', type: 'number', prefix: '$', default: 16, min: 0, step: 0.5, info: 'Include tax, tip and delivery fees if you use them. Your bank statement is a good place to check.' },
    { id: 'costHome', label: 'Average cost per meal at home', type: 'number', prefix: '$', default: 5, min: 0, step: 0.5, info: 'Groceries for one portion of a meal you would cook yourself.' },
  ],
  outputs: [
    { id: 'outYear', label: 'Eating out, per year', format: 'currency', primary: true, info: 'Meals per week × cost per meal out × 52.' },
    { id: 'homeYear', label: 'Same meals at home, per year', format: 'currency', info: 'Meals per week × cost per meal at home × 52.' },
    { id: 'saveYear', label: 'Difference per year', format: 'currency', info: 'Eating out minus cooking at home. Negative means eating out is cheaper in your numbers.' },
    { id: 'saveMonth', label: 'Difference per month', format: 'currency', info: 'The yearly difference divided by 12.' },
  ],
  compute: (v) => {
    const meals = num(v.mealsOut);
    const out = num(v.costOut);
    const home = num(v.costHome);
    if (meals === null || out === null || home === null || meals < 0 || out < 0 || home < 0) return { outYear: null };
    const outYear = meals * out * 52;
    const homeYear = meals * home * 52;
    const saveYear = outYear - homeYear;
    const saveMonth = saveYear / 12;
    const tone: 'good' | 'ok' | 'warn' | 'bad' = outYear < 1500 ? 'good' : outYear < 3000 ? 'ok' : outYear < 6000 ? 'warn' : 'bad';
    return {
      outYear,
      homeYear,
      saveYear,
      saveMonth,
      tone,
      badge: `$${fmt(outYear)} a year eating out`,
      note: `${fmt(meals, meals % 1 ? 1 : 0)} meals a week out at $${fmt(out, 2)} comes to $${fmt(outYear)} a year. Cooking the same meals at $${fmt(home, 2)} each would cost $${fmt(homeYear)}, a difference of $${fmt(saveYear)} a year. You do not have to cook every meal; even swapping a few helps.`,
      chart: {
        type: 'bar',
        title: 'Cost per year',
        categories: ['Eating out', 'Cooking at home'],
        series: [{ name: 'Per year', values: [outYear, homeYear] }],
        format: { format: 'currency' },
        highlight: 0,
      },
      steps: [
        `Eating out = ${meals} × $${fmt(out, 2)} × 52 = $${fmt(outYear, 2)}`,
        `At home = ${meals} × $${fmt(home, 2)} × 52 = $${fmt(homeYear, 2)}`,
        `Difference = $${fmt(outYear, 2)} − $${fmt(homeYear, 2)} = $${fmt(saveYear, 2)} a year, or $${fmt(saveMonth, 2)} a month`,
      ],
    };
  },
  content: {
    formula: ['Eating out per year = meals per week × cost per meal out × 52', 'Difference = (cost out − cost at home) × meals per week × 52'],
    body: [
      'Meals out rarely feel expensive one at a time, but they repeat every week. This calculator multiplies your weekly habit by 52 so you can see the yearly cost, then compares it with cooking the same number of meals at home.',
      'Every price is yours to enter, so use your own numbers: average what a typical takeout order or restaurant meal costs you including tax, tip and delivery fees, and what a home-cooked portion costs in groceries. The result uses 52 weeks and ignores inflation.',
      'Cooking is not always the better choice. It takes time, and some meals out are about friends or a break. Use the difference as information for deciding which meals are worth it. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does eating out 4 times a week cost per year?', a: 'At $16 a meal, 4 × $16 × 52 = $3,328 a year, about $277 a month.' },
      { q: 'How much would I save by cooking those meals?', a: 'If a home-cooked meal costs $5, the same 4 meals a week cost 4 × $5 × 52 = $1,040 a year. The difference is $2,288 a year, or about $191 a month.' },
      { q: 'Does this include groceries I already buy?', a: 'No. It only compares the cost of the meals you enter. Use the cost per meal at home as the extra groceries needed for each meal you would swap.' },
    ],
    sources: [{ label: 'USDA Economic Research Service: Food Prices and Spending', url: 'https://www.ers.usda.gov/data-products/ag-and-food-statistics-charting-the-essentials/food-prices-and-spending/' }],
  },
  related: ['latte-factor', 'subscription-cost', 'recipe-cost', 'savings-goal', 'daily-spending-allowance'],
  examples: [
    // out: 4 × 16 × 52 = 3,328; home: 4 × 5 × 52 = 1,040; diff 2,288; month 2,288 ÷ 12 = 190.6667.
    { values: { mealsOut: 4, costOut: 16, costHome: 5 }, expect: { outYear: 3328, homeYear: 1040, saveYear: 2288, saveMonth: 2288 / 12 }, tolerance: 1e-6 },
    // out: 7 × 20 × 52 = 7,280; home: 7 × 6 × 52 = 2,184; diff 5,096; month 5,096 ÷ 12 = 424.6667.
    { values: { mealsOut: 7, costOut: 20, costHome: 6 }, expect: { outYear: 7280, homeYear: 2184, saveYear: 5096, saveMonth: 5096 / 12 }, tolerance: 1e-6 },
    // home dearer than out: 2 × 8 × 52 = 832; 2 × 10 × 52 = 1,040; diff −208.
    { values: { mealsOut: 2, costOut: 8, costHome: 10 }, expect: { outYear: 832, homeYear: 1040, saveYear: -208 }, tolerance: 1e-6 },
  ],
});
