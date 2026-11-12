import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ACTIVITY_LEVELS, SEX_OPTIONS, activityFactor, fmtInt, mifflinStJeor } from '../../lib/helpers/health';

const KCAL = 'kcal/day';

export default defineCalculator({
  slug: 'tdee',
  title: 'TDEE Calculator',
  category: 'health',
  description: 'Estimate how many calories you burn per day and the intake needed to lose, keep or gain weight.',
  keywords: ['calorie calculator', 'total daily energy expenditure', 'maintenance calories', 'calories per day', 'calorie needs'],
  popular: true,
  inputs: [
    { id: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS, default: 'male', segmented: true, info: 'Biological sex changes the constant in the Mifflin–St Jeor equation, because men on average carry more lean mass.' },
    { id: 'age', label: 'Age', type: 'number', suffix: 'years', default: 35, min: 15, max: 100, info: 'Your age in whole years. Calorie needs fall slightly with age — about 5 kcal a day per year in this formula.' },
    { id: 'weight', label: 'Weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 170, info: 'Your current body weight, ideally measured in the morning before eating.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', default: 69, info: 'Your height without shoes. 5 ft 9 in is 69 inches.' },
    {
      id: 'activity',
      label: 'Activity level',
      type: 'select',
      default: 'light',
      options: ACTIVITY_LEVELS.map(({ value, label }) => ({ value, label })),
      info: 'How active you are on a typical week, including your job. If unsure, pick the lower option — most people overestimate.',
    },
  ],
  outputs: [
    { id: 'tdee', label: 'Maintenance calories', primary: true, precision: 0, suffix: KCAL, info: 'Your estimated total daily energy expenditure: eat about this much and your weight should stay roughly the same.' },
    { id: 'bmr', label: 'BMR (at rest)', precision: 0, suffix: KCAL, info: 'Basal metabolic rate — the calories you would burn lying still all day, before any activity.' },
    { id: 'mildLoss', label: 'Mild weight loss (≈0.25 kg / 0.5 lb per week)', precision: 0, suffix: KCAL, info: 'Maintenance minus 250 kcal. A gentle deficit that is easy to sustain.' },
    { id: 'loss', label: 'Weight loss (≈0.5 kg / 1 lb per week)', precision: 0, suffix: KCAL, info: 'Maintenance minus 500 kcal — the classic target for losing about a pound a week.' },
    { id: 'mildGain', label: 'Mild weight gain (≈0.25 kg / 0.5 lb per week)', precision: 0, suffix: KCAL, info: 'Maintenance plus 250 kcal, a lean-bulk surplus that limits fat gain.' },
    { id: 'gain', label: 'Weight gain (≈0.5 kg / 1 lb per week)', precision: 0, suffix: KCAL, info: 'Maintenance plus 500 kcal for faster weight gain.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const kg = num(v.weight);
    const m = num(v.height);
    const f = activityFactor(v.activity);
    if (age === null || !kg || !m || f === null || age <= 0 || kg <= 0 || m <= 0) return { tdee: null };
    const cm = m * 100;
    const bmr = mifflinStJeor(v.sex, kg, cm, age);
    if (bmr <= 0) return { tdee: null };
    const tdee = bmr * f;
    const floor = v.sex === 'female' ? 1200 : 1500;
    return {
      tdee,
      bmr,
      mildLoss: tdee - 250,
      loss: tdee - 500,
      mildGain: tdee + 250,
      gain: tdee + 500,
      chart: {
        type: 'bar',
        title: 'Daily calories for each goal',
        categories: ['Lose 1 lb/wk', 'Lose ½ lb/wk', 'Maintain', 'Gain ½ lb/wk', 'Gain 1 lb/wk'],
        series: [{ name: 'Calories', values: [tdee - 500, tdee - 250, tdee, tdee + 250, tdee + 500] }],
        format: { format: 'integer', suffix: 'kcal' },
        highlight: 2,
      },
      steps: [
        `BMR = 10 × ${kg.toFixed(1)} kg + 6.25 × ${cm.toFixed(1)} cm − 5 × ${age} ${v.sex === 'female' ? '− 161' : '+ 5'} = ${fmtInt(bmr)} kcal`,
        `TDEE = BMR × ${f} (activity factor) = ${fmtInt(tdee)} kcal/day`,
      ],
      note:
        tdee - 500 < floor
          ? `A 500 kcal deficit would put you under ${floor} kcal/day — get advice before eating that little.`
          : `About ${fmtInt(tdee)} kcal/day should keep your weight stable. This is an estimate, not medical advice.`,
    };
  },
  content: {
    formula: [
      'BMR (men) = 10 × weight kg + 6.25 × height cm − 5 × age + 5',
      'BMR (women) = 10 × weight kg + 6.25 × height cm − 5 × age − 161',
      'TDEE = BMR × activity factor (1.2 – 1.9)',
    ],
    body: [
      'Total daily energy expenditure (TDEE) is the number of calories your body uses in a full day: the energy to keep you alive at rest (basal metabolic rate), plus digestion, everyday movement and deliberate exercise. Eat about this much and your weight should hold roughly steady.',
      'This calculator estimates your basal rate with the Mifflin–St Jeor equation, which studies have found to be the most reliable of the common formulas for healthy adults, then multiplies it by an activity factor. Be honest about activity: most people overestimate it, and choosing one level too high can add 200–300 kcal.',
      'A pound of body fat stores roughly 3,500 kcal, so a steady daily deficit of 500 kcal is the classic target for losing about a pound a week. Real-world results drift as your weight, water balance and activity change, so treat the numbers as a starting point and adjust after two or three weeks of tracking.',
      'These figures are estimates for healthy adults and are not medical advice. Pregnancy, breastfeeding, medical conditions and some medications change energy needs.',
    ],
    faq: [
      { q: 'What is the difference between BMR and TDEE?', a: 'BMR is what you would burn lying still all day. TDEE adds everything you do on top of that — walking, working, training and digesting food — so it is always higher than BMR.' },
      { q: 'Should I eat below my BMR to lose weight faster?', a: 'Generally no. Very low intakes make it hard to get enough protein and nutrients, increase muscle loss and are hard to sustain. A moderate deficit from your TDEE is safer and easier to keep up.' },
      { q: 'Why did my weight loss slow down?', a: 'As you get lighter, your TDEE falls, so the same intake becomes a smaller deficit. Recalculate with your new weight every few kilograms.' },
    ],
  },
  related: ['bmr', 'macro', 'calories-burned', 'weight-loss-goal', 'bmi', 'protein'],
  examples: [
    {
      values: { sex: 'male', age: 30, weight: 70, height: 1.75, activity: 'moderate' },
      expect: { bmr: 1648.75, tdee: 2555.5625, loss: 2055.5625, gain: 3055.5625 },
      tolerance: 1e-6,
    },
    { values: { sex: 'female', age: 25, weight: 60, height: 1.65, activity: 'sedentary' }, expect: { bmr: 1345.25, tdee: 1614.3 }, tolerance: 1e-6 },
  ],
});
