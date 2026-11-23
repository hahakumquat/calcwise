import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import type { ComputeResult } from '../../lib/types';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const MIN_SAFE_DAILY = 1200;
const DAY_NAMES = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Feast day'];

export default defineCalculator({
  slug: 'weekly-calorie-budget',
  title: 'Weekly Calorie Budget Calculator',
  category: 'health',
  description: 'Bank calories for a big meal: see how much to trim from each day before a feast so your 7-day calorie total still matches your weekly budget.',
  keywords: ['weekly calorie budget', 'calorie banking calculator', 'bank calories for a big meal', 'save calories for dinner', 'calorie cycling for a feast', 'weekly calorie allowance'],
  updated: '2026-11-23',
  inputs: [
    { id: 'target', label: 'Daily calorie target', type: 'number', default: 2000, min: 0, max: 10000, step: 50, suffix: 'kcal', info: 'The calories you normally aim for on an ordinary day.' },
    { id: 'meal', label: 'Big meal calories', type: 'number', default: 1500, min: 0, max: 10000, step: 50, suffix: 'kcal', info: 'The estimated calories of the feast meal itself.' },
    { id: 'rest', label: 'Other calories on the feast day', type: 'number', default: 600, min: 0, max: 10000, step: 50, suffix: 'kcal', info: 'Calories already planned for the rest of the feast day, such as breakfast or a snack.' },
    { id: 'days', label: 'Days before the feast to bank over', type: 'select', default: '3', options: ['1', '2', '3', '4', '5', '6'].map((d) => ({ value: d, label: d })), info: 'How many days just before the feast you trim a little from. The week is fixed at 7 days, with the feast on day 7.' },
  ],
  outputs: [
    { id: 'overage', label: 'Calories over target on the feast day', format: 'integer', primary: true, info: 'Feast day total minus your daily target. Zero means no banking is needed.' },
    { id: 'daily', label: 'Daily calories on banking days', format: 'integer', info: 'Your target minus the calories banked per day.' },
    { id: 'banked', label: 'Trimmed per banking day', format: 'integer', info: 'Overage divided by the number of banking days.' },
    { id: 'spread', label: 'Or trimmed over all 6 other days', format: 'integer', info: 'Overage divided by 6, if you spread it across the whole week instead.' },
    { id: 'weekly', label: 'Weekly total', format: 'integer', info: 'Sum of all 7 days. With banking it equals your target times 7; if the feast day is under target, the week simply comes in lower.' },
  ],
  compute: (v) => {
    const target = num(v.target);
    const meal = num(v.meal);
    const rest = num(v.rest);
    const daysRaw = Number.parseInt(String(v.days ?? '3'), 10);
    if (target === null || meal === null || rest === null || Number.isNaN(daysRaw)) return { overage: null };
    if (target <= 0) return { overage: null, error: 'Enter a daily calorie target above 0.' };
    if (meal < 0 || rest < 0) return { overage: null, error: 'Calories cannot be negative.' };
    const days = Math.min(6, Math.max(1, Math.round(daysRaw)));

    const budget = target * 7;
    const feast = meal + rest;
    const overage = Math.max(0, feast - target);
    const banked = overage / days;
    const daily = target - banked;
    const spread = overage / 6;
    // Days 1..(6-days) at target, then the banking days, then the feast day.
    const plain = 6 - days;
    const values = [...Array(plain).fill(target), ...Array(days).fill(daily), feast].map((x) => Math.round(x * 100) / 100);
    const weekly = values.reduce((a, b) => a + b, 0);
    const weeklyRounded = Math.round(weekly * 100) / 100;
    // If the feast day is under target there is nothing to bank and the week is simply under budget.
    const weeklyOut = overage > 0 ? budget : weeklyRounded;

    const unsafe = overage > 0 && daily < MIN_SAFE_DAILY;
    const notMedical = 'This is not medical advice. Eating very little is unsafe for most people, so if your daily figure is low, talk to a doctor or registered dietitian.';

    const out: ComputeResult = {
      overage,
      daily: overage > 0 ? daily : target,
      banked,
      spread,
      weekly: weeklyOut,
      chart: {
        type: 'bar',
        title: 'Calories each day of the week',
        categories: DAY_NAMES,
        series: [{ name: 'Calories', values }],
        format: { format: 'integer', suffix: 'kcal' },
        highlight: 6,
      },
      steps: [
        `Weekly budget: ${fmt(target)} × 7 = ${fmt(budget)} kcal`,
        `Feast day total: ${fmt(meal)} + ${fmt(rest)} = ${fmt(feast)} kcal`,
        overage > 0 ? `Over target: ${fmt(feast)} − ${fmt(target)} = ${fmt(overage)} kcal` : `Feast day is at or under target by ${fmt(target - feast)} kcal, so there is nothing to bank`,
        overage > 0 ? `Trimmed per banking day: ${fmt(overage)} ÷ ${days} = ${fmt(banked, 1)} kcal` : 'Trimmed per banking day: 0 kcal',
        overage > 0 ? `Banking day figure: ${fmt(target)} − ${fmt(banked, 1)} = ${fmt(daily, 1)} kcal` : `Every day stays at ${fmt(target)} kcal`,
        overage > 0 ? `Check: ${fmt(plain)} × ${fmt(target)} + ${days} × ${fmt(daily, 1)} + ${fmt(feast)} = ${fmt(budget)} kcal` : `Week total: ${fmt(weeklyRounded)} kcal`,
      ],
      tone: unsafe ? 'warn' : 'ok',
      badge: overage > 0 ? `${fmt(daily)} kcal/day` : 'No banking needed',
      note: overage > 0
        ? `Your feast day comes to ${fmt(feast)} kcal, ${fmt(overage)} over target. Trimming ${fmt(banked)} kcal a day for ${days} ${days === 1 ? 'day' : 'days'} brings those days to ${fmt(daily)} kcal and keeps the week at ${fmt(budget)} kcal.${unsafe ? ` That is below ${fmt(MIN_SAFE_DAILY)} kcal a day, which is too low to be a sensible plan. Try more banking days, a smaller meal, or accept a slightly higher week. ` : ' '}${notMedical}`
        : `Your feast day comes to ${fmt(feast)} kcal, at or under your ${fmt(target)} kcal target, so no banking is needed. ${notMedical}`,
    };
    return out;
  },
  content: {
    formula: [
      'Weekly budget = daily target × 7',
      'Feast day total = big meal + other calories that day',
      'Overage = feast day total − daily target (0 if negative)',
      'Trimmed per banking day = overage ÷ banking days',
      'Banking day calories = daily target − trimmed per banking day',
    ],
    body: [
      'Calorie banking means eating a little less on the days before a big meal so the whole week still lands on your usual budget. This calculator does the sums: enter your daily target, the size of the feast, what else you plan to eat that day, and how many days you want to bank over.',
      'The week is fixed at 7 days with the feast on day 7. The days before the banking window stay at your normal target, the banking days drop by an equal amount, and the chart shows each day so you can see the shape of the week.',
      'This is simple arithmetic, not medical or dietary advice. Eating very little is unsafe for most people. If the result shows a low daily figure, choose more banking days or a smaller meal, and see a doctor or registered dietitian if you are unsure what is right for you. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'How the numbers work',
        paragraphs: [
          'With a 2,000 kcal target, the weekly budget is 14,000 kcal. A 2,000 kcal feast plus 500 kcal for the rest of the day makes 2,500 kcal, which is 500 over target. Banking that over 3 days means trimming about 167 kcal from each, so those days come to about 1,833 kcal.',
          'The week still adds up to 14,000 kcal: the days at target, the banking days, and the feast day cancel out exactly. If the feast day is already at or under your target, there is nothing to bank.',
        ],
      },
      {
        heading: 'Choosing how many days to bank over',
        paragraphs: [
          'More banking days means a smaller trim each day, which is usually easier to live with than one very light day. The alternative figure shows the overage spread across all 6 other days, which is the gentlest option if you have the flexibility.',
          'Keep an eye on the daily figure. This calculator warns you when it falls below 1,200 kcal, because that is low enough that it is better to reduce the meal or bank over more days.',
        ],
      },
    ],
    faq: [
      { q: 'How many calories do I save per day for a 2,500 kcal feast day?', a: 'With a 2,000 kcal target that is 500 over. Over 3 days you trim about 167 kcal a day, so those days are about 1,833 kcal. Over 6 days it is about 83 kcal a day.' },
      { q: 'Does the weekly total stay the same?', a: 'Yes. The trimmed calories on the banking days are added back on the feast day, so the 7 days still total your target times 7, for example 14,000 kcal at 2,000 a day.' },
      { q: 'What if my feast day is under my target?', a: 'Then no banking is needed. For example, an 800 kcal meal plus 600 kcal for the rest of the day is 1,400 kcal, below a 2,000 kcal target, and every day stays at target.' },
      { q: 'Is it safe to eat much less before a big meal?', a: 'Not if the daily figure gets very low. The calculator flags anything under 1,200 kcal a day. This is not medical advice, so see a doctor or registered dietitian if you are unsure what is right for you.' },
    ],
    sources: [],
  },
  related: ['tdee', 'bmr', 'calories-burned', 'food-burn-off', 'weight-loss-goal'],
  examples: [
    // weekly 14000; feast 2000+500 = 2500; overage 500; banked 500/3 = 166.667; daily 1833.333; spread 500/6 = 83.333
    { values: { target: 2000, meal: 2000, rest: 500, days: '3' }, expect: { overage: 500, banked: 166.6667, daily: 1833.3333, spread: 83.3333, weekly: 14000 }, tolerance: 0.001 },
    // feast 1500+600 = 2100; overage 100; banked 100/4 = 25; daily 1975; spread 16.667
    { values: { target: 2000, meal: 1500, rest: 600, days: '4' }, expect: { overage: 100, banked: 25, daily: 1975, spread: 16.6667, weekly: 14000 }, tolerance: 0.001 },
    // feast 800+600 = 1400 <= 2000: nothing to bank; daily stays 2000; week = 6*2000 + 1400 = 13400
    { values: { target: 2000, meal: 800, rest: 600, days: '3' }, expect: { overage: 0, banked: 0, daily: 2000, weekly: 13400 }, tolerance: 0.001 },
    // low-calorie warn case: target 1500, feast 2500+800 = 3300; overage 1800; banked 900; daily 600 (< 1200); weekly 10500
    { values: { target: 1500, meal: 2500, rest: 800, days: '2' }, expect: { overage: 1800, banked: 900, daily: 600, weekly: 10500 }, tolerance: 0.001 },
  ],
});
