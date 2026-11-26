import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Glucose C6H12O6 has a molar mass of 180.16 g/mol.
// 1 mmol/L = 180.16 mg/L = 18.016 mg/dL, so mg/dL = mmol/L x 18.016.
const FACTOR = 18.016;

export default defineCalculator({
  slug: 'blood-glucose-converter',
  title: 'Blood Glucose Converter',
  category: 'conversion',
  description: 'Convert blood glucose between mg/dL (US) and mmol/L (UK, Europe, Canada). For unit conversion only, not medical advice.',
  metaDescription: 'Convert blood glucose between mg/dL and mmol/L instantly using the exact factor 18.016. Handy for US, UK, EU and Canadian meters. Not medical advice.',
  updated: '2026-11-26',
  keywords: ['mg/dl to mmol/l', 'mmol/l to mg/dl', 'blood sugar converter', 'glucose unit converter', 'blood glucose mg/dl to mmol/l', 'blood sugar mmol to mg'],
  inputs: [
    { id: 'value', label: 'Glucose reading', type: 'number', default: 100, min: 0, step: 0.1, info: 'The number on your meter or lab report.' },
    {
      id: 'from', label: 'Reading is in', type: 'select', segmented: true, default: 'mgdl',
      options: [{ value: 'mgdl', label: 'mg/dL' }, { value: 'mmol', label: 'mmol/L' }],
      info: 'mg/dL is used in the US and a few other countries. mmol/L is used in the UK, Europe, Canada, Australia and most others.',
    },
  ],
  outputs: [
    { id: 'result', label: 'Converted reading', format: 'text', primary: true, info: 'The same glucose level in the other unit.' },
    { id: 'mgdl', label: 'mg/dL', format: 'number', info: 'Milligrams per decilitre.' },
    { id: 'mmol', label: 'mmol/L', format: 'number', info: 'Millimoles per litre.' },
  ],
  compute: (v) => {
    const x = num(v.value);
    if (x === null || x < 0) return { result: null };
    const fromMg = v.from !== 'mmol';
    const mgdl = fromMg ? x : x * FACTOR;
    const mmol = fromMg ? x / FACTOR : x;
    const fmt = (n: number, d: number) => n.toLocaleString('en-US', { maximumFractionDigits: d });
    return {
      result: fromMg ? `${fmt(mmol, 1)} mmol/L` : `${fmt(mgdl, 0)} mg/dL`,
      mgdl,
      mmol,
      badge: fromMg ? 'mg/dL to mmol/L' : 'mmol/L to mg/dL',
      note: 'Unit conversion only. Ask your care team what your targets are.',
      chart: {
        type: 'line',
        title: 'mg/dL for each mmol/L (your reading marked)',
        x: Array.from({ length: 26 }, (_, i) => i),
        xLabel: 'mmol/L',
        yLabel: 'mg/dL',
        series: [{ name: 'mg/dL', values: Array.from({ length: 26 }, (_, i) => i * FACTOR) }],
        markers: mmol <= 25 ? [{ x: Math.round(mmol * 10) / 10, label: `${fmt(mmol, 1)} mmol/L` }] : undefined,
      },
      steps: [fromMg ? `${x} mg/dL ÷ 18.016 = ${mmol.toFixed(2)} mmol/L` : `${x} mmol/L × 18.016 = ${mgdl.toFixed(1)} mg/dL`],
    };
  },
  content: {
    formula: ['mg/dL = mmol/L × 18.016', 'mmol/L = mg/dL ÷ 18.016'],
    body: [
      'Blood glucose is reported in mg/dL in the United States and in mmol/L in the UK, Europe, Canada, Australia and many other places. The two units measure the same thing, so conversion is a single multiplication.',
      'The factor comes from the molar mass of glucose, 180.16 g/mol. One mmol/L is 180.16 mg per litre, which is 18.016 mg per decilitre. Many charts round this to 18, which is why a printed table can differ from this page by a fraction of a percent.',
      'This tool converts units only. It does not say whether a reading is healthy for you. Targets depend on the person, the time of day and the test, so follow the advice of your doctor or diabetes care team.',
    ],
    faq: [
      { q: 'How do I convert mg/dL to mmol/L?', a: 'Divide by 18.016. For example 100 mg/dL is 100 / 18.016 = 5.55 mmol/L.' },
      { q: 'How do I convert mmol/L to mg/dL?', a: 'Multiply by 18.016. For example 7 mmol/L is 7 × 18.016 = 126.1 mg/dL.' },
      { q: 'Why do some charts use 18 instead of 18.016?', a: 'It is a rounded version for easy mental maths. 5.5 mmol/L is 99.1 mg/dL with 18.016 and 99.0 with 18.' },
      { q: 'Is this medical advice?', a: 'No. It only converts units. Ask your care team what your targets should be.' },
    ],
    sources: [
      { label: 'Joslin Diabetes Center, Conversion table for blood glucose monitoring (uses the rounded factor of 18).', url: 'https://www.joslin.org/patient-care/diabetes-education/diabetes-learning-center/conversion-table-blood-glucose-monitoring' },
      { label: 'Glucose molar mass 180.16 g/mol (C6H12O6): PubChem, D-Glucose compound record.', url: 'https://pubchem.ncbi.nlm.nih.gov/compound/D-Glucose' },
    ],
  },
  related: ['temperature-converter', 'pressure-converter', 'bmi'],
  examples: [
    // 100 / 18.016 = 5.550621...
    { values: { value: 100, from: 'mgdl' }, expect: { mmol: 5.550621669626998, result: '5.6 mmol/L' }, tolerance: 1e-9 },
    // 5.5 x 18.016 = 99.088
    { values: { value: 5.5, from: 'mmol' }, expect: { mgdl: 99.088, result: '99 mg/dL' }, tolerance: 1e-9 },
    // 7 x 18.016 = 126.112
    { values: { value: 7, from: 'mmol' }, expect: { mgdl: 126.112 }, tolerance: 1e-9 },
    // 126 / 18.016 = 6.99378...
    { values: { value: 126, from: 'mgdl' }, expect: { mmol: 6.993783303730018 }, tolerance: 1e-9 },
  ],
});
