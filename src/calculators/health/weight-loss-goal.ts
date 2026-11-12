import { defineCalculator } from '../../lib/types';
import { formatDate, num, parseDate } from '../../lib/math';
import { addDays } from '../../lib/helpers/health';

const KCAL_PER_KG = 7700; // ≈ 3,500 kcal per lb of body fat
const MASS = ['kg', 'lb', 'st'];

export default defineCalculator({
  slug: 'weight-loss-goal',
  title: 'Weight Loss Goal Date Calculator',
  category: 'health',
  description: 'Find out when you could reach your goal weight with a steady daily calorie deficit.',
  keywords: ['goal weight date', 'weight loss calculator', 'how long to lose weight', 'calorie deficit', 'weight loss timeline'],
  inputs: [
    { id: 'current', label: 'Current weight', type: 'number', unit: 'mass', units: MASS, defaultUnit: 'lb', default: 200, info: 'Your weight today. Weigh at the same time of day, ideally in the morning, for consistency.' },
    { id: 'goal', label: 'Goal weight', type: 'number', unit: 'mass', units: MASS, defaultUnit: 'lb', default: 180, info: 'The weight you want to reach. Must be lower than your current weight.' },
    { id: 'deficit', label: 'Daily calorie deficit', type: 'number', suffix: 'kcal/day', default: 500, min: 50, step: 50, help: 'Calories below your maintenance (TDEE) each day.', info: 'How many calories below your maintenance level you eat each day. 300–750 kcal is a common, sustainable range.' },
    { id: 'start', label: 'Start date', type: 'date', default: 'today', info: 'The day you start (or started) your calorie deficit.' },
  ],
  outputs: [
    { id: 'goalDate', label: 'Estimated goal date', primary: true, format: 'text', info: 'When you would reach your goal if you keep the same deficit every day. Real progress is usually a little slower.' },
    { id: 'days', label: 'Days needed', format: 'integer', info: 'Energy stored in the weight to lose divided by your daily deficit, rounded up.' },
    { id: 'weeks', label: 'Weeks needed', precision: 1, suffix: 'weeks', info: 'The same time span in weeks.' },
    { id: 'weekly', label: 'Loss per week', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', precision: 2, info: 'Expected weekly loss: daily deficit × 7 ÷ 7,700 kcal per kg (3,500 kcal per lb).' },
    { id: 'toLose', label: 'Weight to lose', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', precision: 1, info: 'Current weight minus goal weight.' },
  ],
  compute: (v) => {
    const cur = num(v.current);
    const goal = num(v.goal);
    const def = num(v.deficit);
    const start = parseDate(v.start);
    if (!cur || !goal || !def || !start || cur <= 0 || goal <= 0 || def <= 0) return { goalDate: null };
    if (goal >= cur) return { goalDate: null, error: 'Your goal weight should be lower than your current weight.' };
    const toLose = cur - goal;
    const days = Math.ceil((toLose * KCAL_PER_KG) / def - 1e-9);
    const weekly = (def * 7) / KCAL_PER_KG;
    const pctPerWeek = (weekly / cur) * 100;
    const totalWeeks = Math.ceil(days / 7);
    const stride = Math.max(1, Math.ceil(totalWeeks / 60));
    const xs: number[] = [];
    for (let w = 0; w < totalWeeks; w += stride) xs.push(w);
    xs.push(totalWeeks);
    return {
      goalDate: formatDate(addDays(start, days)),
      days,
      weeks: days / 7,
      weekly,
      toLose,
      chart: {
        type: 'line',
        title: 'Projected weight',
        x: xs,
        xLabel: 'Weeks',
        yFormat: { unit: 'mass' },
        series: [
          { name: 'Weight', values: xs.map((w) => Math.max(goal, cur - weekly * w)) },
          { name: 'Goal', values: xs.map(() => goal) },
        ],
      },
      steps: [
        `Energy to burn = ${toLose.toFixed(2)} kg × 7,700 kcal/kg = ${Math.round(toLose * KCAL_PER_KG).toLocaleString('en-US')} kcal`,
        `Days = ${Math.round(toLose * KCAL_PER_KG).toLocaleString('en-US')} ÷ ${def} kcal/day ≈ ${days} days`,
      ],
      note:
        def > 1000 || pctPerWeek > 1
          ? 'That pace is faster than the usual safe guideline of 0.5–1% of body weight per week. Consider a smaller deficit or medical supervision.'
          : 'Real progress is rarely linear — water shifts and a slowing metabolism mean the date is a best-case estimate. Not medical advice.',
    };
  },
  content: {
    formula: ['Days = (current weight − goal weight) × 7,700 kcal/kg ÷ daily deficit', 'Weekly loss = daily deficit × 7 ÷ 7,700 kcal/kg'],
    body: [
      'This calculator uses the classic energy-balance rule of thumb: a kilogram of body fat holds about 7,700 kcal (roughly 3,500 kcal per pound). Divide the energy stored in the weight you want to lose by your daily calorie deficit and you get the number of days it should take.',
      'In practice the rule overestimates long-term progress. As you lose weight your maintenance calories drop, so a fixed intake produces a shrinking deficit, and the body adapts in other ways too. Early weeks often show faster loss because of water and glycogen, followed by slower, steadier change. Treat the date as an optimistic target and recalculate as you go.',
      'Most guidelines suggest losing about 0.5–1% of your body weight per week, which for many people means a deficit of 300–750 kcal a day. Larger deficits make it harder to keep muscle and get enough nutrients. This tool is for general information and is not medical advice.',
    ],
    faq: [
      { q: 'How do I know my daily deficit?', a: 'Estimate your maintenance calories with the TDEE calculator, then subtract what you actually eat. For example, a TDEE of 2,500 kcal and an intake of 2,000 kcal is a 500 kcal deficit.' },
      { q: 'Can exercise count toward the deficit?', a: 'Yes — the deficit is the gap between calories burned and eaten. Just be careful not to overestimate exercise calories, which fitness trackers often do.' },
    ],
  },
  related: ['tdee', 'macro', 'calories-burned', 'bmi', 'ideal-weight', 'bmr'],
  examples: [
    { values: { current: 90, goal: 80, deficit: 500, start: '2026-01-01' }, expect: { days: 154, goalDate: 'Thu, June 4, 2026', weeks: 22, weekly: 0.454545 }, tolerance: 1e-5 },
  ],
});
