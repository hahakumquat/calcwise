import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { SEX_OPTIONS } from '../../lib/helpers/health';

const M_PER_MILE = 1609.344;
// Widely used rule-of-thumb stride factors (fraction of height). Approximate, not a measured standard.
const STRIDE_FACTOR = { male: 0.415, female: 0.413 };
const STEP_COUNTS = [2000, 5000, 7500, 10000, 15000];

export default defineCalculator({
  slug: 'steps-to-distance',
  title: 'Steps to Miles & Km Calculator',
  category: 'health',
  description: 'Convert your step count to miles and kilometres using your height and sex. Includes estimated stride length and steps per mile.',
  keywords: ['steps to miles', 'steps to km', 'steps to distance', '10000 steps in miles', 'stride length calculator', 'step counter distance'],
  inputs: [
    { id: 'stepCount', label: 'Steps', type: 'number', default: 10000, min: 0, step: 100, info: 'The step count from your phone, watch or pedometer.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', default: 69, info: 'Your height without shoes. Stride length is estimated as a fraction of height.' },
    { id: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS, default: 'male', segmented: true, info: 'The rule of thumb uses a slightly longer stride for men (0.415 × height) than for women (0.413 × height).' },
  ],
  outputs: [
    { id: 'distance', label: 'Distance', primary: true, unit: 'length', units: ['mi', 'km'], defaultUnit: 'mi', precision: 2, info: 'Steps multiplied by estimated stride length. An approximation: your real stride varies with pace, terrain and fatigue.' },
    { id: 'stride', label: 'Estimated stride length', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', precision: 1, info: 'Height × 0.415 for men or × 0.413 for women, a widely used estimate.' },
    { id: 'stepsPerMile', label: 'Steps per mile', precision: 0, info: 'How many of your steps make up one mile at this stride length.' },
    { id: 'stepsPerKm', label: 'Steps per kilometre', precision: 0, info: 'How many of your steps make up one kilometre at this stride length.' },
  ],
  compute: (v) => {
    const steps = num(v.stepCount);
    const h = num(v.height);
    if (steps === null || steps < 0 || !h || h <= 0) return { distance: null };
    const factor = v.sex === 'female' ? STRIDE_FACTOR.female : STRIDE_FACTOR.male;
    const stride = h * factor;
    const distance = steps * stride;
    return {
      distance,
      stride,
      stepsPerMile: M_PER_MILE / stride,
      stepsPerKm: 1000 / stride,
      chart: {
        type: 'bar',
        title: 'Distance by step count',
        categories: STEP_COUNTS.map((s) => s.toLocaleString('en-US')),
        series: [{ name: 'Distance', values: STEP_COUNTS.map((s) => s * stride) }],
        format: { format: 'number', unit: 'length' },
      },
      steps: [
        `Stride = ${(h * 100).toFixed(1)} cm × ${factor} = ${(stride * 100).toFixed(2)} cm`,
        `Distance = ${Math.round(steps).toLocaleString('en-US')} steps × ${(stride * 100).toFixed(2)} cm = ${(distance / 1000).toFixed(2)} km = ${(distance / M_PER_MILE).toFixed(2)} mi`,
      ],
      note: 'Approximate: this uses a common rule of thumb (stride ≈ 0.415 × height for men, 0.413 for women). Measure your own stride for a better figure.',
    };
  },
  content: {
    formula: [
      'Stride length = height × 0.415 (men) or × 0.413 (women)',
      'Distance = steps × stride length',
      'Steps per mile = 1,609.344 m ÷ stride length',
    ],
    body: [
      'A step counter tells you how many steps you took, not how far you went. To convert one into the other you need your stride length, the distance covered by one step. A widely used rule of thumb estimates it as about 41.5% of your height for men and 41.3% for women.',
      'Multiply that stride by your step count and you get an approximate distance. For example, a man 175 cm tall has a stride of about 72.6 cm, so 10,000 steps comes to roughly 7.26 km, or 4.51 miles.',
      'This is an estimate only. Stride gets longer when you walk fast or run and shorter on hills, in crowds or when you are tired, so two people of the same height can differ noticeably. For a more personal figure, walk a known distance such as a track lap, count your steps and divide.',
    ],
    faq: [
      { q: 'How many miles is 10,000 steps?', a: 'For a 175 cm (about 5 ft 9 in) man the calculator gives about 4.51 miles (7.26 km). A woman of the same height gets about 4.49 miles (7.23 km) because the stride factor is slightly smaller. Shorter people cover less, taller people more.' },
      { q: 'How many steps are in a mile?', a: 'At the same 175 cm height for a man, about 2,216 steps make a mile and about 1,377 make a kilometre. Your own number depends on your height and pace.' },
      { q: 'How accurate is the stride estimate?', a: 'It is a rough rule of thumb based on height and sex, not a measured standard. Expect it to be off by 10% or more for some people, especially when walking fast, running or on hills.' },
    ],
  },
  related: ['calories-burned', 'food-burn-off', 'tdee', 'pace', 'bmi', 'weight-loss-goal'],
  examples: [
    // 175 cm male: stride = 1.75 × 0.415 = 0.72625 m; distance = 10000 × 0.72625 = 7262.5 m (7.2625 km = 4.5127 mi)
    // steps/km = 1000 ÷ 0.72625 = 1376.94; steps/mile = 1609.344 ÷ 0.72625 = 2215.96
    { values: { stepCount: 10000, height: 1.75, sex: 'male' }, expect: { stride: 0.72625, distance: 7262.5, stepsPerKm: 1376.936, stepsPerMile: 2215.964 }, tolerance: 1e-3 },
    // 66 in = 1.6764 m female: stride = 1.6764 × 0.413 = 0.6923532 m; distance = 8000 × 0.6923532 = 5538.8256 m
    // steps/km = 1000 ÷ 0.6923532 = 1444.35; steps/mile = 1609.344 ÷ 0.6923532 = 2324.455
    { values: { stepCount: 8000, height: 1.6764, sex: 'female' }, expect: { stride: 0.6923532, distance: 5538.8256, stepsPerKm: 1444.35, stepsPerMile: 2324.455 }, tolerance: 1e-3 },
    // 180 cm male: stride = 1.8 × 0.415 = 0.747 m; distance = 5000 × 0.747 = 3735 m
    { values: { stepCount: 5000, height: 1.8, sex: 'male' }, expect: { stride: 0.747, distance: 3735 }, tolerance: 1e-6 },
  ],
});
