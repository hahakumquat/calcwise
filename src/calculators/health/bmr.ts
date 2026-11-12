import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ACTIVITY_LEVELS, SEX_OPTIONS, fmtInt, harrisBenedict, mifflinStJeor } from '../../lib/helpers/health';

export default defineCalculator({
  slug: 'bmr',
  title: 'BMR Calculator',
  category: 'health',
  description: 'Estimate your basal metabolic rate — the calories your body burns at complete rest.',
  keywords: ['basal metabolic rate', 'resting metabolic rate', 'RMR', 'Mifflin St Jeor', 'Harris Benedict', 'metabolism'],
  inputs: [
    {
      id: 'formula',
      label: 'Equation',
      type: 'select',
      default: 'mifflin',
      segmented: true,
      options: [
        { value: 'mifflin', label: 'Mifflin–St Jeor' },
        { value: 'harris', label: 'Harris–Benedict' },
      ],
      info: 'Mifflin–St Jeor (1990) is usually closer to measured values in modern adults. Harris–Benedict (revised 1984) is the older standard.',
    },
    { id: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS, default: 'male', segmented: true, info: 'Both equations use different constants for men and women, reflecting average differences in lean mass.' },
    { id: 'age', label: 'Age', type: 'number', suffix: 'years', default: 35, min: 15, max: 100, info: 'Your age in years. Metabolic rate declines gradually with age.' },
    { id: 'weight', label: 'Weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 170, info: 'Your current body weight, ideally measured in the morning.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', default: 69, info: 'Your height without shoes. 5 ft 9 in is 69 inches.' },
  ],
  outputs: [
    { id: 'bmr', label: 'Basal metabolic rate', primary: true, precision: 0, suffix: 'kcal/day', info: 'Calories your body would burn in 24 hours at complete rest, just to keep your organs running.' },
    { id: 'other', label: 'Other equation', precision: 0, suffix: 'kcal/day', info: 'The result from the equation you did not pick, so you can see how much they differ.' },
    { id: 'perHour', label: 'Per hour', precision: 1, suffix: 'kcal/h', info: 'Your BMR divided by 24 — roughly what you burn per hour while resting.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const kg = num(v.weight);
    const m = num(v.height);
    if (age === null || !kg || !m || age <= 0 || kg <= 0 || m <= 0) return { bmr: null };
    const cm = m * 100;
    const mif = mifflinStJeor(v.sex, kg, cm, age);
    const hb = harrisBenedict(v.sex, kg, cm, age);
    const useHb = v.formula === 'harris';
    const bmr = useHb ? hb : mif;
    if (bmr <= 0) return { bmr: null };
    const female = v.sex === 'female';
    const step = useHb
      ? female
        ? `447.593 + 9.247 × ${kg.toFixed(1)} + 3.098 × ${cm.toFixed(1)} − 4.330 × ${age}`
        : `88.362 + 13.397 × ${kg.toFixed(1)} + 4.799 × ${cm.toFixed(1)} − 5.677 × ${age}`
      : `10 × ${kg.toFixed(1)} + 6.25 × ${cm.toFixed(1)} − 5 × ${age} ${female ? '− 161' : '+ 5'}`;
    return {
      bmr,
      other: useHb ? mif : hb,
      perHour: bmr / 24,
      chart: {
        type: 'bar',
        title: 'Daily calories by activity level',
        horizontal: true,
        categories: ['BMR (at rest)', ...ACTIVITY_LEVELS.map((a) => a.label.split(' (')[0])],
        series: [{ name: 'Calories', values: [bmr, ...ACTIVITY_LEVELS.map((a) => bmr * a.factor)] }],
        format: { format: 'integer', suffix: 'kcal' },
        highlight: 0,
      },
      steps: [`BMR = ${step} = ${fmtInt(bmr)} kcal/day`],
      note: 'Multiply your BMR by an activity factor to estimate total daily calories (see the TDEE calculator).',
    };
  },
  content: {
    formula: [
      'Mifflin–St Jeor: 10W + 6.25H − 5A + 5 (men), − 161 (women)',
      'Harris–Benedict (revised 1984), men: 88.362 + 13.397W + 4.799H − 5.677A',
      'Harris–Benedict (revised 1984), women: 447.593 + 9.247W + 3.098H − 4.330A',
      'W = weight in kg, H = height in cm, A = age in years',
    ],
    body: [
      'Basal metabolic rate is the energy your body spends just to stay alive while fully at rest: breathing, circulating blood, maintaining body temperature and running your organs. For most people it accounts for 60–70% of the calories they burn in a day.',
      'Both equations here predict BMR from weight, height, age and sex. Harris–Benedict dates from 1919 and was revised in 1984; Mifflin–St Jeor was published in 1990 and tends to be closer to measured values in modern adults, so it is the default. The two usually agree within about 5%.',
      'Because the equations do not know your body composition, they can underestimate BMR for very muscular people and overestimate it for people with a high body-fat percentage. Only lab measurement (indirect calorimetry) gives your true value. This is an estimate, not medical advice.',
    ],
    faq: [
      { q: 'Is BMR the same as RMR?', a: 'Nearly. Resting metabolic rate is measured under slightly less strict conditions and usually comes out a few percent higher, but the terms are often used interchangeably.' },
      { q: 'Can I raise my BMR?', a: 'Building muscle raises it modestly, because muscle tissue uses more energy than fat at rest. Age, height and genetics play a bigger role and cannot be changed.' },
    ],
  },
  related: ['tdee', 'macro', 'body-fat', 'bmi', 'calories-burned'],
  examples: [
    { values: { formula: 'mifflin', sex: 'male', age: 30, weight: 70, height: 1.75 }, expect: { bmr: 1648.75, other: 1695.667 }, tolerance: 1e-6 },
    { values: { formula: 'harris', sex: 'female', age: 25, weight: 60, height: 1.65 }, expect: { bmr: 1405.333, other: 1345.25 }, tolerance: 1e-6 },
  ],
});
