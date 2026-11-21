import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// MET values copied from calories-burned.ts (Compendium of Physical Activities, approximate).
const ACTIVITIES: { value: string; label: string; met: number }[] = [
  { value: 'walk-slow', label: 'Walking, 2.5 mph (4 km/h)', met: 3.0 },
  { value: 'walk', label: 'Walking, 3.5 mph (5.6 km/h) brisk', met: 4.3 },
  { value: 'run-5', label: 'Running, 5 mph (12 min/mile)', met: 8.3 },
  { value: 'cycle-leisure', label: 'Cycling, leisurely (< 10 mph)', met: 4.0 },
  { value: 'cycle-moderate', label: 'Cycling, 12–14 mph', met: 8.0 },
];

// Approximate typical servings; real products vary a lot.
const FOODS: { value: string; label: string; kcal: number }[] = [
  { value: 'pie', label: 'Slice of pie (about 300 kcal)', kcal: 300 },
  { value: 'cookie', label: 'Chocolate chip cookie (about 150 kcal)', kcal: 150 },
  { value: 'pizza', label: 'Slice of pizza (about 285 kcal)', kcal: 285 },
  { value: 'soda', label: 'Can of soda, 12 oz (about 140 kcal)', kcal: 140 },
  { value: 'doughnut', label: 'Glazed doughnut (about 250 kcal)', kcal: 250 },
  { value: 'candy', label: 'Chocolate bar (about 230 kcal)', kcal: 230 },
];

export default defineCalculator({
  slug: 'food-burn-off',
  title: 'Food Burn-Off Calculator',
  category: 'health',
  description: 'See how many minutes of walking, running or cycling it takes to use the energy in a food, from its calories and your body weight.',
  keywords: ['food burn off', 'how long to burn off calories', 'walk off calories', 'minutes to burn calories', 'calories to exercise time', 'holiday food calories'],
  inputs: [
    {
      id: 'food',
      label: 'Food',
      type: 'select',
      default: 'pie',
      options: [...FOODS.map((f) => ({ value: f.value, label: f.label })), { value: 'custom', label: 'Other — enter calories' }],
      info: 'Presets are rough typical servings. Check the label or your recipe for the real figure.',
    },
    { id: 'kcal', label: 'Food calories', type: 'number', default: 250, min: 1, step: 1, showWhen: { input: 'food', is: 'custom' }, info: 'Calories (kcal) in the portion you ate, from the label or a recipe.' },
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 170, info: 'Heavier people use more energy for the same activity.' },
    {
      id: 'activity',
      label: 'Activity',
      type: 'select',
      default: 'walk',
      options: ACTIVITIES.map((a) => ({ value: a.value, label: `${a.label} — ${a.met} MET` })),
      info: 'The number after each activity is its MET value, how many times harder than resting it is.',
    },
  ],
  outputs: [
    { id: 'minutes', label: 'Time to use that energy', primary: true, precision: 0, suffix: 'min', info: 'Food calories divided by calories used per minute at this activity and body weight.' },
    { id: 'perMin', label: 'Energy used per minute', precision: 1, suffix: 'kcal/min', info: 'MET × 3.5 × weight in kg ÷ 200. Includes the calories you would burn at rest anyway.' },
    { id: 'foodKcal', label: 'Food energy', precision: 0, suffix: 'kcal', info: 'The calories in the food you chose, before converting to minutes.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const met = ACTIVITIES.find((a) => a.value === v.activity)?.met ?? null;
    const kcal = v.food === 'custom' ? num(v.kcal) : (FOODS.find((f) => f.value === v.food)?.kcal ?? null);
    if (!kg || kg <= 0 || !met || !kcal || kcal <= 0) return { minutes: null };
    const perMin = (met * 3.5 * kg) / 200;
    const minutes = kcal / perMin;
    return {
      minutes,
      perMin,
      foodKcal: kcal,
      tone: 'ok',
      badge: `${Math.round(minutes)} min`,
      chart: {
        type: 'bar',
        title: 'Minutes to use this food’s energy',
        categories: ACTIVITIES.map((a) => a.label.split(',')[0] + (a.met >= 8 ? ' (fast)' : '')),
        series: [{ name: 'Minutes', values: ACTIVITIES.map((a) => kcal / ((a.met * 3.5 * kg) / 200)) }],
        format: { format: 'integer', suffix: 'min' },
        highlight: ACTIVITIES.findIndex((a) => a.met === met),
      },
      steps: [`kcal per minute = ${met} MET × 3.5 × ${kg.toFixed(1)} kg ÷ 200 = ${perMin.toFixed(2)}`, `Minutes = ${Math.round(kcal)} kcal ÷ ${perMin.toFixed(2)} = ${minutes.toFixed(1)} min`],
      note: 'An estimate only. Food is not a debt to work off; this just shows the scale of the numbers.',
    };
  },
  content: {
    formula: ['Calories per minute = MET × 3.5 × body weight (kg) ÷ 200', 'Minutes = food calories ÷ calories per minute'],
    body: [
      'This calculator turns a food’s calories into minutes of movement. A MET (metabolic equivalent of task) says how hard an activity is compared with sitting quietly. The standard conversion is MET × 3.5 × kilograms ÷ 200 for calories per minute, and dividing the food’s calories by that gives the minutes.',
      'The MET values come from the Compendium of Physical Activities, the same ones used in our calories burned calculator. They are averages, so your own number can be 20% off or more.',
      'Food is not a debt to be worked off. Eating is how your body gets fuel, and a slice of pie is allowed to just be a slice of pie. Use the result for a sense of scale if it is useful, and skip it if it is not. If you are managing a medical condition or an eating disorder, speak to a professional rather than a calculator.',
    ],
    faq: [
      { q: 'How is the time worked out?', a: 'Calories per minute are MET × 3.5 × weight in kg ÷ 200. Dividing the food calories by that figure gives minutes. For example, 250 kcal at 70 kg brisk walking (4.3 MET) uses 5.27 kcal a minute, so about 47 minutes.' },
      { q: 'Are the food calories exact?', a: 'No. Presets are rough typical servings, and homemade or restaurant portions vary a lot. Use the label or select Other to enter your own figure.' },
      { q: 'Does this count calories I would burn anyway?', a: 'Yes. The figure is total energy use, including what you would burn at rest during those minutes, so the extra effort is smaller than it looks.' },
    ],
    sources: [{ label: 'Compendium of Physical Activities', url: 'https://pacompendium.com/' }],
  },
  related: ['calories-burned', 'steps-to-distance', 'tdee', 'bmr'],
  examples: [
    // 4.3 × 3.5 × 70 / 200 = 5.2675 kcal/min; 250 / 5.2675 = 47.4608 min
    { values: { food: 'custom', kcal: 250, weight: 70, activity: 'walk' }, expect: { minutes: 47.46082, perMin: 5.2675 }, tolerance: 1e-3 },
    // 8.3 × 3.5 × 80 / 200 = 11.62 kcal/min; 500 / 11.62 = 43.0293 min
    { values: { food: 'custom', kcal: 500, weight: 80, activity: 'run-5' }, expect: { minutes: 43.02926, perMin: 11.62 }, tolerance: 1e-3 },
    // preset pie 300 kcal, 60 kg, walk-slow 3.0: 3 × 3.5 × 60 / 200 = 3.15; 300 / 3.15 = 95.2381
    { values: { food: 'pie', kcal: null, weight: 60, activity: 'walk-slow' }, expect: { minutes: 95.2381, perMin: 3.15 }, tolerance: 1e-3 },
  ],
});
