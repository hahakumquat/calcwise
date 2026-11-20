import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'dry-january',
  title: 'Dry January Savings Calculator',
  category: 'everyday',
  description: 'See how much money and how many drink calories you skip by going alcohol-free for a month, and what the same habit costs over a full year.',
  keywords: ['dry january calculator', 'how much money will i save dry january', 'alcohol free month savings', 'cost of drinking per year', 'calories in alcohol saved', 'sober month calculator'],
  updated: '2026-11-20',
  inputs: [
    { id: 'drinks', label: 'Drinks per week', type: 'number', default: 8, min: 0, max: 100, step: 1, info: 'How many alcoholic drinks you usually have in a normal week.' },
    { id: 'price', label: 'Average price per drink', type: 'number', prefix: '$', default: 9, min: 0, step: 0.5, info: 'Include bar prices or the per-drink cost of what you buy at the shop.' },
    { id: 'kcal', label: 'Calories per drink', type: 'number', suffix: 'kcal', default: 150, min: 0, max: 1000, step: 10, info: 'Roughly 150 kcal for a 12 oz beer or a 5 oz glass of wine, but it varies a lot. Use your own figure if you know it.' },
    { id: 'days', label: 'Days alcohol-free', type: 'number', default: 31, min: 1, max: 366, step: 1, info: '31 is the whole of January.' },
  ],
  outputs: [
    { id: 'saved', label: 'Money saved', format: 'currency', primary: true, info: 'Drinks per week × price × days ÷ 7.' },
    { id: 'skipped', label: 'Drinks skipped', format: 'number', precision: 1, info: 'Drinks per week × days ÷ 7.' },
    { id: 'calories', label: 'Calories skipped', format: 'integer', suffix: 'kcal', info: 'Drinks skipped × calories per drink.' },
    { id: 'year', label: 'Same habit over a full year', format: 'currency', info: 'Drinks per week × price × 52.' },
  ],
  compute: (v) => {
    const drinks = num(v.drinks);
    const price = num(v.price);
    const kcal = num(v.kcal);
    const days = num(v.days);
    if (drinks === null || price === null || kcal === null || days === null || drinks < 0 || price < 0 || kcal < 0 || days < 1) return { saved: null };
    const d = Math.round(days);
    const weeks = d / 7;
    const skipped = drinks * weeks;
    const saved = skipped * price;
    const calories = skipped * kcal;
    const year = drinks * price * 52;
    const xs: number[] = [];
    const cum: number[] = [];
    for (let i = 0; i <= d; i++) {
      xs.push(i);
      cum.push((drinks * price * i) / 7);
    }
    return {
      saved,
      skipped,
      calories,
      year,
      badge: `$${fmt(saved)} back in your pocket`,
      note: `${d} days without alcohol skips about ${fmt(skipped, 1)} drinks. Kept up for a year, the same habit costs $${fmt(year)}.`,
      chart: {
        type: 'area',
        title: 'Money saved day by day',
        x: xs,
        xLabel: 'Day',
        yFormat: { format: 'currency' },
        series: [{ name: 'Saved', values: cum }],
      },
      steps: [
        `Weeks = ${d} ÷ 7 = ${weeks.toFixed(2)}`,
        `Drinks skipped = ${drinks} × ${weeks.toFixed(2)} = ${skipped.toFixed(1)}`,
        `Money saved = ${skipped.toFixed(1)} × $${fmt(price, 2)} = $${fmt(saved, 2)}`,
        `Calories skipped = ${skipped.toFixed(1)} × ${kcal} = ${fmt(calories)} kcal`,
      ],
    };
  },
  content: {
    formula: ['Drinks skipped = drinks per week × days ÷ 7', 'Money saved = drinks skipped × price per drink', 'Calories skipped = drinks skipped × calories per drink', 'Full-year cost = drinks per week × price × 52'],
    body: [
      'Dry January means going without alcohol for the month. This calculator turns your normal week into a simple number: how many drinks you skip, what that is worth in money, and how many calories come with them.',
      'The calories are only an estimate because drinks differ a lot. A typical 12 oz regular beer or 5 oz glass of wine is around 150 kcal, but cocktails and craft beers are often much higher, so enter your own figure if you know it. Mixers and food eaten with drinks are not counted.',
      'The full-year figure shows what the same habit costs over 52 weeks. It is just arithmetic on your own numbers, not a prediction, and nothing you type leaves your browser.',
      'If you drink heavily or feel dependent on alcohol, talk to a doctor before stopping suddenly. This tool is for money and calorie arithmetic only and gives no medical advice.',
    ],
    faq: [
      { q: 'How much money do you save in Dry January?', a: 'It depends on your habit. With 8 drinks a week at $9 each over 31 days, you skip about 35.4 drinks and save about $318.86.' },
      { q: 'How many calories is that?', a: 'At 150 kcal a drink, 35.4 skipped drinks is about 5,314 kcal. Change the calories per drink to match what you actually drink.' },
      { q: 'What does the same habit cost over a year?', a: '8 drinks a week at $9 is 8 × 9 × 52 = $3,744 a year.' },
      { q: 'Does this give health advice?', a: 'No. It only does the arithmetic. If you are dependent on alcohol, speak to a doctor before stopping suddenly.' },
    ],
    sources: [{ label: 'CDC: Alcohol and Public Health', url: 'https://www.cdc.gov/alcohol/about-alcohol-use/index.html' }],
  },
  related: ['latte-factor', 'subscription-cost', 'year-progress', 'habit-compounding'],
  examples: [
    // 31/7 = 4.428571 weeks; 8 × 4.428571 = 35.428571 drinks; × 9 = 318.857143; × 150 = 5314.2857; year 8 × 9 × 52 = 3744.
    { values: { drinks: 8, price: 9, kcal: 150, days: 31 }, expect: { skipped: 248 / 7, saved: 2232 / 7, calories: 37200 / 7, year: 3744 }, tolerance: 1e-6 },
    // 7 drinks a week, $10, 14 days = 2 weeks: 14 drinks, $140, 14 × 100 = 1400 kcal.
    { values: { drinks: 7, price: 10, kcal: 100, days: 14 }, expect: { skipped: 14, saved: 140, calories: 1400, year: 3640 }, tolerance: 1e-9 },
  ],
});
