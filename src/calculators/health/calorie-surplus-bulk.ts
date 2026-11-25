import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'calorie-surplus-bulk',
  title: 'Calorie Surplus Calculator for a Lean Bulk',
  category: 'health',
  description: 'Plan a lean bulk. Enter maintenance calories and a daily surplus to see your target intake, expected weight gain per week and total gain over your chosen weeks.',
  keywords: ['calorie surplus calculator', 'lean bulk calculator', 'bulking calories', 'how much to eat to gain weight', 'weekly weight gain surplus'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'maintenance', label: 'Maintenance calories', type: 'number', default: 2600, min: 500, step: 50, suffix: 'kcal/day', info: 'What you eat to hold your weight steady. Estimate it with the TDEE calculator.' },
    { id: 'surplus', label: 'Daily surplus', type: 'number', default: 300, min: 0, step: 25, suffix: 'kcal', info: 'Extra calories per day. A modest 200 to 300 is common for a lean bulk.' },
    { id: 'kcalPerLb', label: 'Calories per pound gained', type: 'number', default: 3500, min: 1, step: 100, suffix: 'kcal/lb', info: 'The classic 3,500 rule is an approximation. Edit it if you prefer another figure.' },
    { id: 'weeks', label: 'Weeks', type: 'number', default: 12, min: 1, step: 1, suffix: 'weeks', info: 'How long you plan to hold the surplus.' },
  ],
  outputs: [
    { id: 'intake', label: 'Daily intake target', format: 'number', precision: 0, suffix: 'kcal', primary: true, info: 'Maintenance plus daily surplus.' },
    { id: 'weekly', label: 'Expected gain per week', format: 'number', precision: 2, suffix: 'lb', info: 'Surplus × 7 ÷ calories per pound.' },
    { id: 'total', label: 'Expected gain over the period', format: 'number', precision: 1, suffix: 'lb', info: 'Weekly gain × weeks.' },
  ],
  compute: (v) => {
    const m = num(v.maintenance);
    const s = num(v.surplus);
    const k = num(v.kcalPerLb);
    const w = num(v.weeks);
    if ([m, s, k, w].some((x) => x === null)) return { intake: null };
    if (m! <= 0 || k! <= 0 || w! <= 0 || s! < 0) return { intake: null, error: 'Enter positive values; the surplus cannot be negative.' };
    const intake = m! + s!;
    const weekly = s! * 7 / k!;
    const total = weekly * w!;
    const n = Math.min(Math.floor(w!), 104);
    const x: number[] = [];
    const y: number[] = [];
    for (let i = 0; i <= n; i++) { x.push(i); y.push(weekly * i); }
    return {
      intake,
      weekly,
      total,
      tone: 'ok',
      badge: `${fmt(weekly)} lb a week`,
      note: `Eating ${fmt(intake, 0)} kcal a day is ${fmt(s!, 0)} above maintenance, about ${fmt(weekly)} lb a week or ${fmt(total, 1)} lb in ${fmt(w!, 0)} weeks. Not all of that gain is muscle, and the calories-per-pound rule is only an approximation.`,
      chart: {
        type: 'line' as const,
        title: 'Expected cumulative gain (lb)',
        x,
        xLabel: 'Week',
        series: [{ name: 'Gain', values: y }],
        yFormat: { format: 'number', precision: 1 },
      },
      steps: [
        `Intake = ${fmt(m!, 0)} + ${fmt(s!, 0)} = ${fmt(intake, 0)} kcal`,
        `Weekly gain = ${fmt(s!, 0)} × 7 ÷ ${fmt(k!, 0)} = ${fmt(weekly)} lb`,
        `Total = ${fmt(weekly)} × ${fmt(w!, 0)} = ${fmt(total, 1)} lb`,
      ],
    };
  },
  content: {
    formula: [
      'Intake = maintenance + daily surplus',
      'Weekly gain = surplus × 7 ÷ calories per pound',
      'Total gain = weekly gain × weeks',
    ],
    body: [
      'A lean bulk uses a small calorie surplus so weight rises slowly and less of it is fat. Start from your maintenance calories, add a daily surplus, and the calculator converts it into a weekly pace.',
      'Example: maintenance 2,600 kcal plus a 300 kcal surplus is 2,900 kcal a day. That is 300 × 7 ÷ 3,500 = 0.6 lb a week, or 7.2 lb over 12 weeks.',
      'The 3,500 calories-per-pound figure is a rule of thumb, and real gain varies with training, sleep and metabolism. Not all weight gained is muscle. Weigh yourself regularly and adjust the surplus. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How big should a lean bulk surplus be?', a: 'Many lifters use roughly 200 to 300 kcal above maintenance. A smaller surplus gains more slowly with less fat; a larger one gains faster.' },
      { q: 'How much weight will a 300 kcal surplus add?', a: 'About 0.6 lb a week using the 3,500 kcal per pound rule, which is 7.2 lb over 12 weeks.' },
      { q: 'Is all the weight gained muscle?', a: 'No. Some gain is fat, water and other tissue. Training and protein intake influence how much is muscle.' },
      { q: 'Where do I get my maintenance calories?', a: 'Use the TDEE calculator for an estimate, or track your intake and weight for a few weeks to find the level where weight holds steady.' },
      { q: 'Why is the 3,500 figure editable?', a: 'It is an approximation, not a law. If you prefer a different value, change it and the pace updates.' },
    ],
    sources: [
      { label: 'CDC: Healthy weight, balancing calories', url: 'https://www.cdc.gov/healthy-weight-growth/food-activity/index.html' },
      { label: 'NIH Body Weight Planner', url: 'https://www.niddk.nih.gov/bwp' },
    ],
  },
  related: ['tdee', 'weight-change-rate', 'weekly-calorie-budget'],
  examples: [
    // intake 2900; weekly 300*7/3500 = 0.6; total 7.2
    { values: { maintenance: 2600, surplus: 300, kcalPerLb: 3500, weeks: 12 }, expect: { intake: 2900, weekly: 0.6, total: 7.2 } },
    // 250*7/3500 = 0.5; 8 weeks -> 4
    { values: { maintenance: 2400, surplus: 250, kcalPerLb: 3500, weeks: 8 }, expect: { intake: 2650, weekly: 0.5, total: 4 } },
  ],
});
