import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const CUTOFF = { male: 0.9, female: 0.85 } as const;

export default defineCalculator({
  slug: 'waist-hip-ratio',
  title: 'Waist-to-Hip Ratio Calculator',
  category: 'health',
  description: 'Work out your waist-to-hip ratio and compare it with the WHO cut-offs for abdominal obesity: 0.90 for men and 0.85 for women.',
  keywords: ['waist to hip ratio calculator', 'WHR', 'waist hip ratio chart', 'abdominal obesity', 'apple or pear body shape'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'waist', label: 'Waist circumference', type: 'number', unit: 'length', units: ['cm', 'in'], defaultUnit: 'in', default: 34, help: 'Measure midway between your lowest rib and the top of your hip bone.', info: 'Stand relaxed, breathe out normally and measure on bare skin with the tape level.' },
    { id: 'hip', label: 'Hip circumference', type: 'number', unit: 'length', units: ['cm', 'in'], defaultUnit: 'in', default: 40, help: 'Measure around the widest part of your hips and buttocks.', info: 'Keep the tape level and snug without pressing into the skin. Use the same unit as your waist.' },
    {
      id: 'sex',
      label: 'Sex',
      type: 'select',
      segmented: true,
      default: 'male',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ],
      info: 'The WHO cut-off differs: 0.90 for men and 0.85 for women.',
    },
  ],
  outputs: [
    { id: 'ratio', label: 'Waist-to-hip ratio', primary: true, precision: 2, info: 'Waist divided by hip. At or above 0.90 (men) or 0.85 (women) is the WHO threshold for abdominal obesity.' },
    { id: 'category', label: 'Against the WHO cut-off', format: 'text', info: 'Below the cut-off, or at/above it.' },
    { id: 'target', label: 'Waist at the cut-off', unit: 'length', units: ['cm', 'in'], defaultUnit: 'in', precision: 1, help: 'Your hip size times the cut-off.', info: 'The waist size that would give exactly the WHO cut-off ratio at your current hip size. Stay below it.' },
  ],
  compute: (v) => {
    const w = num(v.waist);
    const h = num(v.hip);
    if (!w || !h || w <= 0 || h <= 0) return { ratio: null };
    const cut = v.sex === 'female' ? CUTOFF.female : CUTOFF.male;
    const ratio = w / h;
    const over = ratio >= cut;
    return {
      ratio,
      category: over ? `At or above ${cut.toFixed(2)}` : `Below ${cut.toFixed(2)}`,
      target: h * cut,
      tone: over ? 'warn' : 'good',
      chart: {
        type: 'scale',
        title: 'Waist-to-hip ratio',
        min: 0.6,
        max: 1.1,
        value: Math.min(1.1, Math.max(0.6, ratio)),
        valueLabel: ratio.toFixed(2),
        bands: [
          { from: 0.6, to: cut, label: 'Below cut-off', tone: 'good' },
          { from: cut, to: 1.1, label: 'Abdominal obesity', tone: 'warn' },
        ],
      },
      steps: [
        `Ratio = waist ÷ hip = ${(w * 100).toFixed(1)} cm ÷ ${(h * 100).toFixed(1)} cm = ${ratio.toFixed(3)}`,
        `WHO cut-off for ${v.sex === 'female' ? 'women' : 'men'} = ${cut.toFixed(2)}`,
      ],
      note: over
        ? `A ratio of ${cut.toFixed(2)} or more is the WHO marker of abdominal obesity. This is a screening number, not a diagnosis or medical advice.`
        : `Below the ${cut.toFixed(2)} WHO cut-off. This is a screening number, not a diagnosis or medical advice.`,
    };
  },
  content: {
    formula: ['WHR = waist circumference ÷ hip circumference (same units)', 'WHO cut-off: 0.90 for men, 0.85 for women'],
    body: [
      'Waist-to-hip ratio compares the size of your waist with your hips. A higher ratio means more fat carried around the middle, which is linked to higher cardiovascular and metabolic risk than the same weight carried on the hips.',
      'The WHO expert consultation on waist circumference and waist-hip ratio (2008) lists a ratio of 0.90 or more in men and 0.85 or more in women as an indicator of abdominal obesity and substantially increased risk. Example: a 34 in waist and 40 in hips give 0.85, which is below the male cut-off and exactly at the female one.',
      'Measure on bare skin after breathing out normally, with the tape level all the way around. Units do not matter as long as waist and hip use the same one. Ratios are a screening measure and can be less reliable for children, pregnancy and very short or very tall people. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is a healthy waist-to-hip ratio?', a: 'The WHO treats under 0.90 for men and under 0.85 for women as below the abdominal obesity threshold. Lower is generally better within a normal range.' },
      { q: 'Where do I measure my waist?', a: 'Midway between your lowest rib and the top of your hip bone, after a normal breath out.' },
      { q: 'Is waist-to-hip better than BMI?', a: 'They measure different things. WHR looks at where fat is stored, so it can flag risk in someone with a normal BMI. Using several measures together gives the best picture.' },
      { q: 'What does apple or pear mean?', a: 'A higher ratio with more weight around the middle is often called apple-shaped; more weight on hips and thighs is pear-shaped.' },
    ],
    sources: [
      { label: 'WHO: Waist circumference and waist-hip ratio, report of a WHO expert consultation (2008)', url: 'https://www.who.int/publications/i/item/9789241501491' },
    ],
  },
  related: ['waist-to-height-ratio', 'bmi', 'body-fat', 'ideal-weight'],
  examples: [
    // 0.9/1.0 male -> at cut-off; target 1.0*0.9
    { values: { waist: 0.9, hip: 1.0, sex: 'male' }, expect: { ratio: 0.9, category: 'At or above 0.90', target: 0.9 }, tolerance: 1e-9 },
    // female 0.8/1.0 -> 0.8 below 0.85; target 0.85
    { values: { waist: 0.8, hip: 1.0, sex: 'female' }, expect: { ratio: 0.8, category: 'Below 0.85', target: 0.85 }, tolerance: 1e-9 },
  ],
});
