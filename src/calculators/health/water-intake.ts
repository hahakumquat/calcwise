import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const ML = 1e-6; // m³ per mL
const CLIMATE: Record<string, number> = { temperate: 0, hot: 500, veryhot: 1000 };
const STATUS: Record<string, number> = { none: 0, pregnant: 300, breastfeeding: 700 };
const VOL = ['floz', 'cup', 'l', 'ml'];

export default defineCalculator({
  slug: 'water-intake',
  title: 'Water Intake Calculator',
  category: 'health',
  description: 'Estimate how much water to drink each day based on your weight, exercise and climate.',
  keywords: ['how much water should I drink', 'hydration', 'daily water', 'fluid intake', 'glasses of water'],
  inputs: [
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 160, info: 'Your current body weight. Larger bodies need more water, about 35 mL per kg as a baseline.' },
    { id: 'exercise', label: 'Exercise per day', type: 'number', unit: 'time', units: ['min', 'h'], defaultUnit: 'min', default: 30, min: 0, info: 'Average minutes of sweaty exercise per day. Each 30 minutes adds about 350 mL (12 oz).' },
    {
      id: 'climate',
      label: 'Climate',
      type: 'select',
      default: 'temperate',
      segmented: true,
      options: [
        { value: 'temperate', label: 'Mild' },
        { value: 'hot', label: 'Hot' },
        { value: 'veryhot', label: 'Very hot / humid' },
      ],
      info: 'Hot or humid weather increases sweating. Adds 0.5 L for hot and 1 L for very hot or humid conditions.',
    },
    {
      id: 'status',
      label: 'Pregnancy / breastfeeding',
      type: 'select',
      default: 'none',
      options: [
        { value: 'none', label: 'Neither' },
        { value: 'pregnant', label: 'Pregnant (+300 mL)' },
        { value: 'breastfeeding', label: 'Breastfeeding (+700 mL)' },
      ],
      info: 'Pregnancy and breastfeeding raise fluid needs, by about 300 mL and 700 mL a day respectively.',
    },
  ],
  outputs: [
    { id: 'water', label: 'Water to drink per day', primary: true, unit: 'volume', units: VOL, defaultUnit: 'floz', precision: 0, info: 'Estimated fluids to drink per day, including water, tea, coffee and milk. Food provides extra on top.' },
    { id: 'glasses', label: '8-oz glasses', precision: 1, suffix: 'glasses', info: 'The daily total expressed as standard 8 fl oz (237 mL) glasses.' },
    { id: 'base', label: 'Baseline (before exercise and heat)', unit: 'volume', units: VOL, defaultUnit: 'floz', precision: 0, info: 'The weight-based part of the estimate: 35 mL per kg of body weight.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const ex = num(v.exercise) ?? 0;
    if (!kg || kg <= 0 || ex < 0) return { water: null };
    const baseMl = 35 * kg;
    const exMl = (ex / 60) * 12; // ≈ 350 mL per 30 minutes
    const climMl = CLIMATE[String(v.climate)] ?? 0;
    const statusMl = STATUS[String(v.status)] ?? 0;
    const totalMl = baseMl + exMl + climMl + statusMl;
    const water = totalMl * ML;
    return {
      water,
      base: baseMl * ML,
      glasses: water / (8 * 2.95735295625e-5),
      chart: {
        type: 'donut',
        title: 'Where your water need comes from',
        slices: [
          { label: 'Baseline', value: baseMl * ML },
          { label: 'Exercise', value: exMl * ML },
          { label: 'Climate', value: climMl * ML },
          { label: 'Pregnancy / breastfeeding', value: statusMl * ML },
        ].filter((s) => s.value > 0),
        format: { unit: 'volume' },
        centerValue: (water / (8 * 2.95735295625e-5)).toFixed(1),
        centerLabel: '8-oz glasses',
      },
      steps: [
        `Baseline: 35 mL × ${kg.toFixed(1)} kg = ${Math.round(baseMl)} mL`,
        `Exercise: ${Math.round(ex / 60)} min × 12 mL/min = ${Math.round(exMl)} mL`,
        `Climate + pregnancy/breastfeeding: ${climMl + statusMl} mL`,
        `Total ≈ ${(totalMl / 1000).toFixed(2)} L`,
      ],
      note: 'This is a general estimate of fluids to drink; food provides roughly another 20% of your water. Not medical advice — people with heart or kidney conditions may need to limit fluids.',
    };
  },
  content: {
    formula: [
      'Baseline (mL) = 35 × body weight (kg)',
      '+ about 12 mL per minute of exercise (≈ 350 mL per 30 min)',
      '+ 500 – 1,000 mL in hot weather, + 300 mL pregnant, + 700 mL breastfeeding',
    ],
    body: [
      'There is no single amount of water that is right for everyone. Needs scale with body size and rise sharply with sweating, which is why this estimate starts from body weight and then adds allowances for exercise, hot weather, pregnancy and breastfeeding.',
      'The baseline of about 35 mL per kilogram is a widely used rule of thumb in clinical nutrition. U.S. reference intakes for total water (drinks plus food) are about 3.7 L a day for men and 2.7 L for women; because food supplies roughly a fifth of that, the drinking-water figure here is usually a bit lower.',
      'All drinks count toward hydration, including tea, coffee and milk. A practical check is urine color: pale straw usually means you are well hydrated. Drinking far more than you need in a short time can be dangerous, especially during long endurance events.',
    ],
    faq: [
      { q: 'Do I really need eight glasses a day?', a: '"Eight glasses" is a memorable approximation, not a scientific rule. Smaller, less active people may need less; larger or very active people in warm weather may need much more.' },
      { q: 'Does coffee dehydrate you?', a: 'Caffeine has a mild diuretic effect, but in regular coffee drinkers the fluid in the cup more than makes up for it, so it still counts toward your daily intake.' },
    ],
  },
  related: ['calories-burned', 'tdee', 'bmi', 'protein'],
  examples: [
    { values: { weight: 70, exercise: 0, climate: 'temperate', status: 'none' }, expect: { water: 0.00245 }, tolerance: 1e-9 },
    { values: { weight: 80, exercise: 3600, climate: 'hot', status: 'none' }, expect: { water: 0.00402, base: 0.0028 }, tolerance: 1e-9 },
  ],
});
