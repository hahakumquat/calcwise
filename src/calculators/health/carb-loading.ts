import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const MIN_G = 8;
const MAX_G = 12;

export default defineCalculator({
  slug: 'carb-loading',
  title: 'Carb Loading Calculator',
  category: 'health',
  description: 'Turn your body weight into daily carbohydrate grams, calories and a per-meal split for carb loading before an endurance event, at 8 to 12 g per kg.',
  keywords: ['carb loading calculator', 'how many carbs to carb load', 'marathon carb loading', 'carbs per kg before race', 'carb loading grams per day', 'half marathon carb load'],
  inputs: [
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'kg', default: 70, min: 0, info: 'Your current body weight. Carb loading is dosed in grams per kilogram.' },
    { id: 'gPerKg', label: 'Carbs per kg per day', type: 'number', default: 10, min: 8, max: 12, step: 0.5, suffix: 'g/kg', info: 'Sports-nutrition guidance for loading is 8 to 12 g per kg per day. 10 is a common middle choice.' },
    { id: 'days', label: 'Loading days', type: 'number', default: 2, min: 1, max: 3, step: 1, suffix: 'days', info: 'The guidance covers about 36 to 48 hours before the event, so 2 days is typical.' },
    { id: 'meals', label: 'Meals and snacks per day', type: 'number', default: 4, min: 1, max: 10, step: 1, info: 'How many eating occasions you will spread the carbs across. Smaller, more frequent meals are easier to finish.' },
    { id: 'usual', label: 'Usual carbs per kg per day', type: 'number', default: 5, min: 0, step: 0.5, suffix: 'g/kg', info: 'What you normally eat, for comparison. Moderate training days are often around 5 g per kg.' },
  ],
  outputs: [
    { id: 'daily', label: 'Carbs per day', precision: 0, suffix: 'g', primary: true, info: 'Body weight in kg times grams per kg.' },
    { id: 'kcal', label: 'Calories from carbs per day', precision: 0, suffix: 'kcal', info: 'Carb grams times 4 calories per gram.' },
    { id: 'perMeal', label: 'Carbs per meal', precision: 0, suffix: 'g', info: 'Daily carbs divided by the number of meals and snacks.' },
    { id: 'usualDaily', label: 'Usual carbs per day', precision: 0, suffix: 'g', info: 'Body weight times your usual grams per kg.' },
    { id: 'extraDaily', label: 'Extra carbs per day', precision: 0, suffix: 'g', info: 'Loading carbs minus usual carbs, per day.' },
    { id: 'extraTotal', label: 'Extra carbs over all loading days', precision: 0, suffix: 'g', info: 'Extra per day times the number of loading days.' },
    { id: 'total', label: 'Total carbs over loading', precision: 0, suffix: 'g', info: 'Daily carbs times loading days.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const g = num(v.gPerKg);
    const days = num(v.days) ?? 2;
    const meals = num(v.meals) ?? 4;
    const usualG = num(v.usual) ?? 5;
    if (kg === null || kg <= 0 || g === null) return { daily: null };
    if (g < MIN_G || g > MAX_G) return { daily: null, error: `Carbs per kg should be between ${MIN_G} and ${MAX_G} g per kg per day for carb loading.` };
    if (!Number.isInteger(days) || days < 1 || days > 3) return { daily: null, error: 'Loading days must be a whole number from 1 to 3.' };
    if (!Number.isInteger(meals) || meals < 1) return { daily: null, error: 'Meals per day must be a whole number of at least 1.' };
    if (usualG < 0) return { daily: null, error: 'Usual carbs per kg cannot be negative.' };
    const daily = kg * g;
    const kcal = daily * 4;
    const perMeal = daily / meals;
    const usualDaily = kg * usualG;
    const extraDaily = (g - usualG) * kg;
    const extraTotal = extraDaily * days;
    const total = daily * days;
    const r0 = (n: number) => Math.round(n);
    return {
      daily,
      kcal,
      perMeal,
      usualDaily,
      extraDaily,
      extraTotal,
      total,
      chart: {
        type: 'bar',
        title: 'Carbs per day (g)',
        categories: ['Usual', 'Carb loading'],
        series: [{ name: 'Carbs', values: [r0(usualDaily), r0(daily)] }],
        format: { format: 'number', suffix: ' g' },
      },
      tone: 'ok',
      badge: `${r0(daily)} g/day`,
      note: 'Carb loading suits events lasting over about 90 minutes; a 10 km run does not need it. Try it in training first, favour familiar low-fibre foods, and ask a clinician or dietitian if you have diabetes or another medical condition.',
      steps: [
        `Daily carbs = ${+kg.toFixed(2)} kg × ${g} g/kg = ${r0(daily)} g`,
        `Calories from carbs = ${r0(daily)} g × 4 = ${r0(kcal)} kcal`,
        `Per meal = ${r0(daily)} g ÷ ${meals} = ${r0(perMeal)} g`,
        `Usual = ${+kg.toFixed(2)} kg × ${usualG} g/kg = ${r0(usualDaily)} g, so extra = ${r0(extraDaily)} g a day, ${r0(extraTotal)} g over ${days} days`,
      ],
    };
  },
  content: {
    formula: [
      'Daily carbs (g) = body weight (kg) × grams per kg',
      'Calories from carbs = daily carbs × 4',
      'Per meal = daily carbs ÷ meals per day',
      'Extra versus usual = (grams per kg − usual grams per kg) × body weight (kg)',
    ],
    body: [
      'Carb loading means eating more carbohydrate than usual for the day or two before a long event so your muscles start with full fuel stores. Sports-nutrition guidance, including the position stand listed under sources, puts the amount at about 8 to 12 g of carbohydrate per kg of body weight per day for 36 to 48 hours before an event. You can check the current wording at acsm.org; we have not reproduced it here.',
      'It is aimed at events lasting longer than about 90 minutes, such as a half or full marathon. A 10 km run does not need it. Try your plan on a long training run first, favour familiar low-fibre foods such as rice, pasta, bread and bananas, and expect to feel full. Fat and fibre intake usually drops to make room for the carbs.',
      'This is general information, not medical advice. Anyone with diabetes or another medical condition should ask a clinician or dietitian before changing how they eat.',
    ],
    faq: [
      { q: 'How many carbs should a 70 kg runner eat when carb loading?', a: 'At 10 g per kg, 70 kg × 10 = 700 g of carbohydrate a day, which is 2,800 kcal from carbs. Over 4 meals that is 175 g per meal.' },
      { q: 'How much extra is that compared with a normal day?', a: 'If you usually eat 5 g per kg, that is 350 g for 70 kg. Loading at 10 g per kg adds 350 g a day, or 700 g over 2 days.' },
      { q: 'What range does this accept?', a: 'Between 8 and 12 g per kg per day, the range used in sports-nutrition guidance. Values outside it show a message instead of a result.' },
      { q: 'How long should I carb load?', a: 'Guidance covers about 36 to 48 hours before the event, so most people use 2 days.' },
      { q: 'Do I need to carb load for a 10 km race?', a: 'No. It is meant for events lasting over about 90 minutes. For shorter events normal eating is usually enough.' },
      { q: 'What if I enter my weight in pounds?', a: 'It is converted at 0.45359237 kg per lb. 154 lb is about 69.85 kg, so 10 g per kg is about 699 g a day.' },
    ],
    sources: [
      { label: 'Thomas DT, Erdman KA, Burke LM (2016). Position of the Academy of Nutrition and Dietetics, Dietitians of Canada, and the American College of Sports Medicine: Nutrition and athletic performance. Medicine & Science in Sports & Exercise.' },
    ],
  },
  related: ['race-fueling-plan', 'macro'],
  examples: [
    // 70 kg x 10 = 700 g; *4 = 2800 kcal; /4 = 175; usual 70*5 = 350; extra 350; x2 = 700; total 1400
    { values: { weight: 70, gPerKg: 10, days: 2, meals: 4, usual: 5 }, expect: { daily: 700, kcal: 2800, perMeal: 175, usualDaily: 350, extraDaily: 350, extraTotal: 700, total: 1400 }, tolerance: 1e-6 },
    // 60 kg x 8 = 480 g; 1920 kcal; /3 = 160; usual 60*6 = 360; extra 120; 1 day
    { values: { weight: 60, gPerKg: 8, days: 1, meals: 3, usual: 6 }, expect: { daily: 480, kcal: 1920, perMeal: 160, extraDaily: 120, extraTotal: 120 }, tolerance: 1e-6 },
    // 80 kg x 12 = 960 g; 3840 kcal; /6 = 160
    { values: { weight: 80, gPerKg: 12, days: 2, meals: 6, usual: 5 }, expect: { daily: 960, kcal: 3840, perMeal: 160, extraDaily: 560 }, tolerance: 1e-6 },
  ],
});
