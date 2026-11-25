import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const LIVES = [300, 400, 500, 600];

export default defineCalculator({
  slug: 'running-shoe-cost',
  title: 'Running Shoe Cost per Mile Calculator',
  category: 'sports',
  description: 'Work out what your running shoes cost per mile, how many miles and weeks are left before you replace them, and what shoes cost you per year.',
  keywords: ['running shoe cost per mile', 'when to replace running shoes', 'running shoe mileage calculator', 'shoe cost per mile', 'running shoes yearly cost', 'running shoe replacement'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'price', label: 'Shoe price', type: 'number', prefix: '$', default: 140, min: 0, step: 5, info: 'What you paid for one pair.' },
    { id: 'life', label: 'Miles per pair', type: 'number', suffix: 'mi', default: 400, min: 1, step: 25, info: 'How many miles you expect one pair to last. Brands and coaches often quote a range such as 300 to 500 miles; this is your own estimate.' },
    { id: 'used', label: 'Miles already on them', type: 'number', suffix: 'mi', default: 150, min: 0, step: 10, info: 'Miles logged in this pair so far. Use 0 for new shoes.' },
    { id: 'weekly', label: 'Miles you run per week', type: 'number', suffix: 'mi/wk', default: 20, min: 0.1, step: 1, info: 'Your typical weekly mileage.' },
  ],
  outputs: [
    { id: 'perMile', label: 'Cost per mile', format: 'currency', precision: 2, primary: true, info: 'Price divided by miles per pair.' },
    { id: 'milesLeft', label: 'Miles left', format: 'number', precision: 0, suffix: 'mi', info: 'Miles per pair minus miles already on them (never below 0).' },
    { id: 'weeksLeft', label: 'Weeks until replacement', format: 'number', precision: 1, suffix: 'weeks', info: 'Miles left divided by weekly miles.' },
    { id: 'yearly', label: 'Shoe spend per year', format: 'currency', precision: 2, info: 'Yearly miles divided by miles per pair, times the price.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const life = num(v.life);
    const used = num(v.used) ?? 0;
    const wk = num(v.weekly);
    if (price === null || price < 0) return { perMile: null, error: 'Enter the shoe price.' };
    if (life === null || life <= 0) return { perMile: null, error: 'Enter how many miles a pair should last.' };
    if (used < 0) return { perMile: null, error: 'Miles already on the shoes cannot be negative.' };
    if (wk === null || wk <= 0) return { perMile: null, error: 'Enter your weekly miles.' };
    const perMile = price / life;
    const left = Math.max(0, life - used);
    const weeks = left / wk;
    const yearMiles = wk * 52;
    const pairs = yearMiles / life;
    const yearly = pairs * price;
    const over = used >= life ? ' They are already at or past the mileage you set, so it may be time to replace them.' : '';
    return {
      perMile,
      milesLeft: left,
      weeksLeft: weeks,
      yearly,
      tone: 'ok',
      badge: `${money(perMile)} / mi`,
      note: `A ${money(price)} pair that lasts ${fmt(life, 0)} miles costs ${money(perMile)} per mile. With ${fmt(left, 0)} miles left at ${fmt(wk, 1)} a week, that is ${fmt(weeks, 1)} weeks. Over a year you run ${fmt(yearMiles, 0)} miles, about ${fmt(pairs, 2)} pairs, or ${money(yearly)}.${over}`,
      chart: {
        type: 'bar' as const,
        title: `Cost per mile if a pair lasts...`,
        categories: LIVES.map((l) => `${l} mi`),
        series: [{ name: 'Cost per mile', values: LIVES.map((l) => price / l) }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Cost per mile = ${money(price)} ÷ ${fmt(life, 0)} = ${money(perMile)}`,
        `Miles left = ${fmt(life, 0)} − ${fmt(used, 0)} = ${fmt(left, 0)}`,
        `Weeks left = ${fmt(left, 0)} ÷ ${fmt(wk, 1)} = ${fmt(weeks, 1)}`,
        `Yearly spend = (${fmt(wk, 1)} × 52 ÷ ${fmt(life, 0)}) × ${money(price)} = ${money(yearly)}`,
      ],
    };
  },
  content: {
    formula: ['Cost per mile = price ÷ miles per pair', 'Miles left = miles per pair − miles used', 'Weeks left = miles left ÷ weekly miles', 'Yearly spend = (weekly miles × 52 ÷ miles per pair) × price'],
    body: [
      'Running shoes wear out, so their real cost is the price spread over the miles you get from them. Divide the price by the miles you expect one pair to last. A $140 pair that lasts 400 miles costs $0.35 per mile.',
      'To plan a replacement, subtract the miles already on the shoes and divide what is left by your weekly mileage. With 150 miles used and 20 miles a week, 250 miles are left, or 12.5 weeks. Over a full year, 20 miles a week is 1,040 miles, about 2.6 pairs, or $364.',
      'The mileage per pair is your own estimate, not a fact. Shoe type, your weight, running surface and gait all change it, and soreness or flat cushioning is a better cue than a number. The chart shows how the cost per mile falls if a pair lasts longer. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I work out running shoe cost per mile?', a: 'Divide the price by the miles you expect the pair to last. $140 over 400 miles is $0.35 per mile.' },
      { q: 'How many weeks until I need new shoes?', a: 'Subtract miles already run from miles per pair, then divide by weekly miles. 250 miles left at 20 a week is 12.5 weeks.' },
      { q: 'How much will I spend on shoes in a year?', a: 'Multiply weekly miles by 52, divide by miles per pair, then multiply by the price. 20 mi/wk with a 400-mile pair at $140 is 2.6 pairs, or $364.' },
      { q: 'How many miles should running shoes last?', a: 'There is no fixed number. Many runners quote 300 to 500 miles, but it varies, so enter your own estimate and adjust it by how the shoes feel.' },
      { q: 'Does a cheaper shoe cost less per mile?', a: 'Not always. A $90 pair that lasts 300 miles costs $0.30 per mile, less than a $140 pair at 400 miles ($0.35), but a $140 pair lasting 500 miles costs $0.28.' },
    ],
    sources: [
      { label: 'Wikipedia: Running shoe', url: 'https://en.wikipedia.org/wiki/Running_shoe' },
    ],
  },
  related: ['pace', 'mileage-build-plan', 'race-time-predictor'],
  examples: [
    // 140/400 = 0.35; left 250; 250/20 = 12.5 wk; 20*52/400 = 2.6 pairs * 140 = 364
    { values: { price: 140, life: 400, used: 150, weekly: 20 }, expect: { perMile: 0.35, milesLeft: 250, weeksLeft: 12.5, yearly: 364 }, tolerance: 1e-6 },
    // 90/300 = 0.30; left 300; 300/12 = 25 wk; 12*52/300 = 2.08 pairs * 90 = 187.2
    { values: { price: 90, life: 300, used: 0, weekly: 12 }, expect: { perMile: 0.3, milesLeft: 300, weeksLeft: 25, yearly: 187.2 }, tolerance: 1e-6 },
  ],
});
