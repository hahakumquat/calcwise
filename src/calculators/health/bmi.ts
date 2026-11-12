import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'bmi',
  title: 'BMI Calculator',
  category: 'health',
  description: 'Calculate your body mass index and see which weight category it falls into.',
  keywords: ['body mass index', 'healthy weight'],
  popular: true,
  inputs: [
    { id: 'weight', label: 'Weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 165, info: 'Your current body weight. Weigh yourself in the morning, before eating, for the most consistent number.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'm', 'in', 'ft'], defaultUnit: 'in', default: 69, info: 'Your height without shoes. 5 ft 9 in is 69 inches — or switch the unit to cm or ft.' },
  ],
  outputs: [
    { id: 'bmi', label: 'BMI', primary: true, precision: 1, suffix: 'kg/m²', info: 'Body mass index: weight in kilograms divided by height in metres squared. 18.5–24.9 is the healthy range for adults.' },
    { id: 'category', label: 'Category', format: 'text', info: 'The World Health Organization weight category for your BMI. It is a screening tool, not a diagnosis.' },
    { id: 'healthyMin', label: 'Healthy weight from', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', precision: 1, info: 'The lowest weight that gives a BMI of 18.5 at your height.' },
    { id: 'healthyMax', label: 'Healthy weight to', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', precision: 1, info: 'The highest weight that keeps your BMI under 25 at your height.' },
  ],
  compute: (v) => {
    const w = num(v.weight);
    const h = num(v.height);
    if (!w || !h) return { bmi: null };
    const bmi = w / (h * h);
    const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy weight' : bmi < 30 ? 'Overweight' : 'Obesity';
    return {
      bmi,
      category,
      healthyMin: 18.5 * h * h,
      healthyMax: 24.9 * h * h,
      chart: {
        type: 'scale',
        title: 'Where you sit',
        min: 15,
        max: 40,
        value: bmi,
        valueLabel: `BMI ${bmi.toFixed(1)}`,
        bands: [
          { from: 15, to: 18.5, label: 'Underweight', tone: 'warn' },
          { from: 18.5, to: 25, label: 'Healthy', tone: 'good' },
          { from: 25, to: 30, label: 'Overweight', tone: 'warn' },
          { from: 30, to: 40, label: 'Obesity', tone: 'bad' },
        ],
      },
      note: `A BMI of ${bmi.toFixed(1)} is in the "${category}" range for adults.`,
    };
  },
  content: {
    formula: ['BMI = weight (kg) ÷ height (m)²'],
    body: [
      'Body mass index compares your weight with your height. It is a quick screening number used by doctors and insurers, not a diagnosis: it cannot tell muscle from fat, and it reads high for athletic people and can read low for older adults who have lost muscle.',
      'For adults, the WHO categories are: under 18.5 underweight, 18.5–24.9 healthy, 25–29.9 overweight, and 30 or more obesity. Children and teens use age- and sex-specific percentiles instead.',
    ],
    faq: [
      { q: 'Is BMI accurate for muscular people?', a: 'Not very. Muscle is denser than fat, so strength athletes often land in the "overweight" range while having low body fat. Waist measurements or body-fat estimates are more useful for them.' },
      { q: 'Does the same BMI scale apply to everyone?', a: 'Some health bodies use lower cut-offs for people of Asian descent (overweight from 23), because health risks start rising at lower BMIs in those populations.' },
    ],
  },
  related: ['body-fat', 'bmr', 'tdee', 'ideal-weight'],
  examples: [{ values: { weight: 70, height: 1.75 }, expect: { bmi: 22.857, category: 'Healthy weight' }, tolerance: 0.001 }],
});
