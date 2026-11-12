import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

function category(r: number): string {
  if (r < 0.4) return 'Low — possibly underweight';
  if (r < 0.5) return 'Healthy';
  if (r < 0.6) return 'Increased risk';
  return 'High risk';
}

export default defineCalculator({
  slug: 'waist-to-height-ratio',
  title: 'Waist-to-Height Ratio Calculator',
  category: 'health',
  description: 'Check your waist-to-height ratio, a simple measure of central body fat linked to heart and metabolic risk.',
  keywords: ['WHtR', 'waist to height', 'belly fat', 'central obesity', 'waist circumference'],
  inputs: [
    { id: 'waist', label: 'Waist circumference', type: 'number', unit: 'length', units: ['cm', 'in'], defaultUnit: 'in', default: 34, help: 'Measure midway between your lowest rib and the top of your hip bone.', info: 'Stand relaxed, breathe out normally and measure around your bare waist, midway between the lowest rib and the top of the hip bone.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', default: 69, info: 'Your height without shoes. Any unit works — the ratio is the same.' },
  ],
  outputs: [
    { id: 'ratio', label: 'Waist-to-height ratio', primary: true, precision: 2, info: 'Waist divided by height. Under 0.5 is generally healthy; 0.5 and above suggests extra fat around the middle.' },
    { id: 'category', label: 'Category', format: 'text', info: 'Risk band for your ratio: under 0.4 low, 0.4–0.49 healthy, 0.5–0.59 increased risk, 0.6+ high risk.' },
    { id: 'target', label: 'Waist for a ratio of 0.5', unit: 'length', units: ['cm', 'in'], defaultUnit: 'in', precision: 1, help: 'Keep your waist below this to stay under 0.5.', info: 'Half your height: the waist size that gives a ratio of exactly 0.5.' },
  ],
  compute: (v) => {
    const w = num(v.waist);
    const h = num(v.height);
    if (!w || !h || w <= 0 || h <= 0) return { ratio: null };
    const ratio = w / h;
    const cat = category(ratio);
    return {
      ratio,
      category: cat,
      target: h / 2,
      chart: {
        type: 'scale',
        title: 'Waist-to-height ratio',
        min: 0.3,
        max: 0.8,
        value: ratio,
        valueLabel: ratio.toFixed(2),
        bands: [
          { from: 0.3, to: 0.4, label: 'Low', tone: 'warn' },
          { from: 0.4, to: 0.5, label: 'Healthy', tone: 'good' },
          { from: 0.5, to: 0.6, label: 'Increased', tone: 'warn' },
          { from: 0.6, to: 0.8, label: 'High risk', tone: 'bad' },
        ],
      },
      steps: [`Ratio = waist ÷ height = ${(w * 100).toFixed(1)} cm ÷ ${(h * 100).toFixed(1)} cm = ${ratio.toFixed(3)}`],
      note: ratio >= 0.5 ? 'A ratio of 0.5 or more suggests extra fat around the middle. Not medical advice.' : 'Under 0.5 — "keep your waist to less than half your height."',
    };
  },
  content: {
    formula: ['WHtR = waist circumference ÷ height (same units)'],
    body: [
      'Waist-to-height ratio compares the size of your waist with your height. Fat stored around the abdomen, particularly around the organs, is more closely linked to type 2 diabetes, high blood pressure and heart disease than fat elsewhere, and this ratio captures it in a way BMI does not.',
      'The guiding message is simple: keep your waist to less than half your height. A ratio under 0.5 is generally considered healthy for adults of any sex and most ethnic backgrounds; 0.5–0.59 indicates increased risk and 0.6 or more high risk. The UK’s NICE guidance recommends using it alongside BMI.',
      'Measure on bare skin after breathing out normally, with the tape level all the way around and not pulling in. Units do not matter as long as waist and height use the same one. This is a screening measure, not a diagnosis or medical advice.',
    ],
    faq: [
      { q: 'Is waist-to-height ratio better than BMI?', a: 'Several studies find it predicts cardiometabolic risk at least as well as BMI, and it flags people with a "normal" BMI but excess belly fat. Using both together gives the best picture.' },
      { q: 'Does it work for children?', a: 'The 0.5 cut-off is often used for children over 5 as well, though pediatric assessment normally relies on growth charts.' },
    ],
  },
  related: ['bmi', 'body-fat', 'ideal-weight', 'tdee'],
  examples: [
    { values: { waist: 0.8, height: 1.75 }, expect: { ratio: 0.457143, category: 'Healthy', target: 0.875 }, tolerance: 1e-5 },
    { values: { waist: 40 * 0.0254, height: 66 * 0.0254 }, expect: { ratio: 0.606061, category: 'High risk' }, tolerance: 1e-5 },
  ],
});
