import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'snow-shoveling-calories',
  title: 'Snow Shoveling Calories Calculator',
  category: 'health',
  description: 'Estimate the calories you burn shoveling snow from your weight, minutes and effort level, and how long it takes to burn off a hot chocolate or other treat.',
  keywords: ['snow shoveling calories', 'calories burned shoveling snow', 'shoveling snow workout', 'how long to burn off hot chocolate', 'shoveling snow MET'],
  updated: '2026-11-26',
  inputs: [
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', default: 180, min: 1, info: 'Your body weight. Heavier people burn more calories doing the same work.' },
    { id: 'duration', label: 'Time shoveling', type: 'number', unit: 'time', units: ['min', 'h'], defaultUnit: 'min', default: 60, min: 0, info: 'Time actually spent shoveling, not counting long breaks.' },
    { id: 'met', label: 'Effort (MET)', type: 'number', default: 6, min: 1, max: 20, step: 0.5, info: 'Metabolic equivalent of the task, an estimate. Light shoveling is often quoted near 4 to 5 and heavy, deep or wet snow near 6 to 7.5. Check the Compendium of Physical Activities for the value that fits you; individuals vary.' },
    { id: 'treat', label: 'Treat calories', type: 'number', suffix: 'kcal', default: 250, min: 1, step: 10, info: 'Calories in the treat you want to burn off, from the label or a recipe. A mug of hot chocolate is often in the 200 to 300 kcal range.' },
  ],
  outputs: [
    { id: 'kcal', label: 'Calories burned', primary: true, precision: 0, suffix: 'kcal', info: 'MET × body weight in kg × hours. This is total energy including what you would burn at rest, and an estimate only.' },
    { id: 'perHour', label: 'Burn rate', precision: 0, suffix: 'kcal/hour', info: 'MET × body weight in kg.' },
    { id: 'treatMin', label: 'Minutes to burn the treat', precision: 1, suffix: 'min', info: 'Treat calories ÷ calories burned per minute.' },
    { id: 'treatShare', label: 'Treat covered by this shoveling', format: 'percent', precision: 0, info: 'Calories burned ÷ treat calories. Above 100% means you burned more than the treat.' },
  ],
  compute: (v) => {
    const kg = num(v.weight), sec = num(v.duration), met = num(v.met), treat = num(v.treat);
    if (kg === null || sec === null || met === null || treat === null) return { kcal: null };
    if (kg <= 0 || sec < 0 || met <= 0 || treat <= 0) return { kcal: null };
    const hours = sec / 3600;
    const perHour = met * kg;
    const kcal = perHour * hours;
    const treatMin = (treat / perHour) * 60;
    const share = kcal / treat;
    const covered = kcal >= treat;
    return {
      kcal,
      perHour,
      treatMin,
      treatShare: share,
      tone: covered ? 'good' : 'ok',
      badge: covered ? 'Treat earned' : 'Treat not yet earned',
      note: 'MET values are population averages and the result is an estimate; snow depth, wetness, technique and fitness all change it. Shoveling is hard on the heart, so ask a doctor if you have any heart or health concerns. That is a medical question this calculator does not answer.',
      chart: {
        type: 'bar' as const,
        title: 'Shoveling calories vs the treat',
        categories: ['Burned shoveling', 'Treat'],
        series: [{ name: 'kcal', values: [kcal, treat] }],
        format: { format: 'integer', suffix: 'kcal' },
        highlight: covered ? 0 : 1,
      },
      steps: [
        `Burn rate = ${fmt(met)} MET × ${fmt(kg)} kg = ${fmt(perHour, 0)} kcal per hour`,
        `Calories burned = ${fmt(perHour, 0)} × ${fmt(hours, 2)} h = ${fmt(kcal, 0)} kcal`,
        `Minutes to burn the treat = ${fmt(treat, 0)} ÷ ${fmt(perHour / 60, 2)} kcal per minute = ${fmt(treatMin)} min`,
      ],
    };
  },
  content: {
    formula: [
      'Calories burned = MET × body weight (kg) × time (hours)',
      'Minutes to burn a treat = treat calories ÷ (MET × body weight in kg ÷ 60)',
    ],
    body: [
      'A MET is how hard an activity is compared with sitting still, which counts as 1. Shoveling snow is often rated somewhere around 4 to 7.5 METs depending on how heavy the snow is, so the value here is an estimate you can change. Multiply it by your weight in kilograms and the hours worked to get calories.',
      'The second result turns that into a treat: how many minutes of shoveling it takes to burn the calories in a mug of hot chocolate or a cookie. It is a fun way to see the cost of a snow day, not a precise budget. Real burn varies with the snow, your technique and your fitness.',
      'Shoveling is strenuous and can raise heart rate and blood pressure quickly. Whether it is safe for you is a medical question, so talk to a doctor if you have any concerns. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How many calories does shoveling snow burn?', a: 'With the defaults, a 180 lb (81.6 kg) person shoveling for 60 minutes at 6 MET burns about 490 kcal. That is an estimate, and heavier snow or a heavier person burns more.' },
      { q: 'How long does it take to burn off a 250 calorie hot chocolate?', a: 'At those defaults the burn rate is about 490 kcal an hour, or 8.2 kcal a minute, so a 250 kcal treat takes about 30.6 minutes.' },
      { q: 'What MET value should I use?', a: 'Light shoveling is often quoted near 4 to 5 and heavy shoveling near 6 or more. Treat the number as an estimate and check the Compendium of Physical Activities for a better match.' },
      { q: 'Is shoveling safe for everyone?', a: 'Not necessarily. It is a strenuous task, and this calculator does not assess heart or health risk. Ask a doctor if you are unsure.' },
    ],
    sources: [{ label: 'Compendium of Physical Activities (MET values)', url: 'https://pacompendium.com/' }],
  },
  related: ['calories-burned', 'holiday-weight-burn-off', 'food-burn-off', 'snow-removal-payback'],
  examples: [
    // 180 lb = 81.6466266 kg; 6 x 81.6466266 = 489.8797596 kcal/h; 1 h -> 489.88 kcal; treat 250: 250 x 60 / 489.8797596 = 30.6199 min; share 489.88/250 = 1.95952
    { values: { weight: 81.6466266, duration: 3600, met: 6, treat: 250 }, expect: { kcal: 489.8797596, perHour: 489.8797596, treatMin: 30.6199, treatShare: 1.9595190 }, tolerance: 1e-3 },
    // 150 lb = 68.0388555 kg; 5 x 68.0388555 = 340.1942775 kcal/h; 0.75 h -> 255.1457 kcal; treat 250: 15000 / 340.1942775 = 44.0925 min; share 1.02058
    { values: { weight: 68.0388555, duration: 2700, met: 5, treat: 250 }, expect: { kcal: 255.1457, perHour: 340.1943, treatMin: 44.0925, treatShare: 1.020583 }, tolerance: 1e-3 },
  ],
});
