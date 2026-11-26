import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'sugary-drink-swap',
  title: 'Sugary Drink Swap Calculator',
  category: 'health',
  description: 'See the calories, pounds and dollars you could save in a year by swapping soda, juice or sweet coffee for water or a zero-calorie drink.',
  keywords: ['sugary drink swap', 'soda calories per year', 'how much weight from quitting soda', 'cost of soda habit', 'swap soda for water savings'],
  updated: '2026-11-26',
  inputs: [
    { id: 'drinks', label: 'Drinks per week', type: 'number', default: 7, min: 0, step: 1, info: 'How many sugary drinks you have in a typical week.' },
    { id: 'kcal', label: 'Calories per drink', type: 'number', suffix: 'kcal', default: 150, min: 0, step: 5, info: 'From the label. A 12 oz can of regular soda is roughly 140 to 150 kcal.' },
    { id: 'price', label: 'Price per drink', type: 'number', prefix: '$', default: 1.5, min: 0, step: 0.05, info: 'What one sugary drink costs you.' },
    { id: 'swapPrice', label: 'Replacement drink price', type: 'number', prefix: '$', default: 0, min: 0, step: 0.05, info: 'What the swap costs per drink. Use 0 for tap water. The replacement is assumed to have no calories.' },
    { id: 'weeks', label: 'Weeks', type: 'number', default: 52, min: 1, max: 520, step: 1, info: 'How many weeks you keep the swap going.' },
    { id: 'kcalPerLb', label: 'Calories per pound', type: 'number', default: 3500, min: 1, step: 100, info: 'A rough rule of thumb for converting calories to pounds of body weight. Real weight change varies and is not guaranteed.' },
  ],
  outputs: [
    { id: 'pounds', label: 'Pounds equivalent', primary: true, precision: 1, suffix: 'lb', info: 'Calories saved ÷ calories per pound. A rule-of-thumb estimate, not a prediction of your weight.' },
    { id: 'kcalSaved', label: 'Calories saved', precision: 0, suffix: 'kcal', info: 'Drinks per week × calories per drink × weeks.' },
    { id: 'dollars', label: 'Money saved', format: 'currency', info: 'Drinks per week × (drink price − replacement price) × weeks.' },
    { id: 'kcalPerDay', label: 'Calories saved per day', precision: 0, suffix: 'kcal', info: 'Calories saved ÷ (weeks × 7).' },
  ],
  compute: (v) => {
    const drinks = num(v.drinks), kcal = num(v.kcal), price = num(v.price), swap = num(v.swapPrice), weeks = num(v.weeks), perLb = num(v.kcalPerLb);
    if ([drinks, kcal, price, swap, weeks, perLb].some((x) => x === null)) return { pounds: null };
    if ((drinks as number) < 0 || (kcal as number) < 0 || (price as number) < 0 || (swap as number) < 0 || (weeks as number) < 1 || (perLb as number) <= 0) return { pounds: null };
    const d = drinks as number, k = kcal as number, p = price as number, s = swap as number, w = weeks as number, l = perLb as number;
    const kcalSaved = d * k * w;
    const pounds = kcalSaved / l;
    const dollars = d * (p - s) * w;
    const marks = [...new Set([13, 26, 39, 52, Math.round(w)])].sort((a, b) => a - b);
    return {
      pounds,
      kcalSaved,
      dollars,
      kcalPerDay: kcalSaved / (w * 7),
      tone: 'good',
      badge: `${fmt(pounds, 1)} lb and ${money(dollars)}`,
      note: `${fmt(l, 0)} calories per pound is a rough rule of thumb, and weight change is not guaranteed. Your body adjusts, and the swap only helps if you do not eat or drink the calories back elsewhere.`,
      chart: {
        type: 'bar' as const,
        title: 'Pounds equivalent by week',
        categories: marks.map((m) => `Week ${m}`),
        series: [{ name: 'Pounds', values: marks.map((m) => (d * k * m) / l) }],
        format: { format: 'number', suffix: 'lb' },
        highlight: marks.indexOf(Math.round(w)),
      },
      steps: [
        `Calories saved = ${fmt(d, 1)} drinks × ${fmt(k, 0)} kcal × ${fmt(w, 0)} weeks = ${fmt(kcalSaved, 0)} kcal`,
        `Pounds = ${fmt(kcalSaved, 0)} ÷ ${fmt(l, 0)} = ${fmt(pounds)} lb`,
        `Money = ${fmt(d, 1)} × (${money(p)} − ${money(s)}) × ${fmt(w, 0)} = ${money(dollars)}`,
      ],
    };
  },
  content: {
    formula: [
      'Calories saved = drinks per week × calories per drink × weeks',
      'Pounds = calories saved ÷ calories per pound',
      'Money saved = drinks per week × (drink price − replacement price) × weeks',
    ],
    body: [
      'Liquid calories add up quietly. Enter how many sugary drinks you have in a week, what each one contains and costs, and what you would drink instead. The calculator shows the calories, the pounds equivalent and the money over the weeks you choose.',
      'The pounds figure uses 3,500 calories per pound, a long-used rule of thumb that you can change. It is an estimate, not a forecast: bodies adjust, and weight change is not guaranteed. The swap is assumed to have zero calories, so use a replacement price of 0 for tap water.',
      'To see how much walking a single drink equals, try the food burn-off calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How many calories do I save by swapping soda for water?', a: 'With the defaults, 7 drinks a week at 150 kcal for 52 weeks is 54,600 kcal. That is about 150 kcal a day.' },
      { q: 'How many pounds is that?', a: 'At the rule-of-thumb 3,500 kcal per pound, 54,600 kcal is 15.6 lb. This is an estimate, and actual weight change varies and is not guaranteed.' },
      { q: 'How much money would I save?', a: 'At $1.50 per drink with free replacement water, 7 drinks a week for 52 weeks saves $546. If the replacement costs $0.25 a drink, the saving is $455.00.' },
      { q: 'Is 3,500 calories per pound exact?', a: 'No. It is a rough rule of thumb. You can change it in the calculator, and real results differ from person to person.' },
    ],
    sources: [],
  },
  related: ['food-burn-off', 'latte-factor', 'dry-january', 'weight-loss-goal'],
  examples: [
    // 7 x 150 x 52 = 54,600 kcal; /3500 = 15.6 lb; 7 x (1.50 - 0.25) x 52 = 7 x 1.25 x 52 = 455; /364 days = 150 kcal/day
    { values: { drinks: 7, kcal: 150, price: 1.5, swapPrice: 0.25, weeks: 52, kcalPerLb: 3500 }, expect: { kcalSaved: 54600, pounds: 15.6, dollars: 455, kcalPerDay: 150 }, tolerance: 1e-9 },
    // 3 x 140 x 52 = 21,840 kcal; /3500 = 6.24 lb; 3 x 2.00 x 52 = 312; /364 = 60 kcal/day
    { values: { drinks: 3, kcal: 140, price: 2, swapPrice: 0, weeks: 52, kcalPerLb: 3500 }, expect: { kcalSaved: 21840, pounds: 6.24, dollars: 312, kcalPerDay: 60 }, tolerance: 1e-9 },
  ],
});
