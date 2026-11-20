import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'body-surface-area',
  title: 'Body Surface Area (BSA) Calculator',
  category: 'health',
  description: 'Calculate your body surface area in m² from height and weight using the Mosteller formula, with Du Bois shown for comparison.',
  keywords: ['BSA', 'body surface area', 'Mosteller', 'Du Bois', 'dosing', 'm2'],
  inputs: [
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'm', 'in', 'ft'], defaultUnit: 'in', default: 69, info: 'Your height without shoes. 5 ft 9 in is 69 inches — or switch the unit to cm, m or ft.' },
    { id: 'weight', label: 'Weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 165, info: 'Your current body weight in any unit.' },
  ],
  outputs: [
    { id: 'bsa', label: 'Body surface area (Mosteller)', primary: true, precision: 2, suffix: 'm²', info: 'Estimated skin surface area using the Mosteller formula: the square root of height (cm) × weight (kg) ÷ 3600.' },
    { id: 'duBois', label: 'Du Bois & Du Bois', precision: 2, suffix: 'm²', info: 'The older 1916 formula, shown for comparison. For most adults it lands within about 0.01–0.03 m² of Mosteller.' },
    { id: 'ft2', label: 'Mosteller in square feet', precision: 1, suffix: 'ft²', info: 'The Mosteller result converted to square feet (1 m² = 10.7639 ft²).' },
  ],
  compute: (v) => {
    const hm = num(v.height);
    const w = num(v.weight);
    if (!hm || !w || hm <= 0 || w <= 0) return { bsa: null };
    const hcm = hm * 100;
    const bsa = Math.sqrt((hcm * w) / 3600);
    const duBois = 0.007184 * Math.pow(w, 0.425) * Math.pow(hcm, 0.725);
    const ws = Array.from({ length: 11 }, (_, i) => w * (0.6 + 0.08 * i));
    return {
      bsa,
      duBois,
      ft2: bsa * 10.7639,
      tone: 'ok',
      badge: 'Mosteller',
      chart: {
        type: 'line',
        title: `BSA at ${hcm.toFixed(0)} cm as weight changes`,
        x: ws.map((x) => Math.round(x)),
        xLabel: 'Weight (kg)',
        yLabel: 'BSA (m²)',
        series: [
          { name: 'Mosteller', values: ws.map((x) => Math.sqrt((hcm * x) / 3600)) },
          { name: 'Du Bois', values: ws.map((x) => 0.007184 * Math.pow(x, 0.425) * Math.pow(hcm, 0.725)) },
        ],
      },
      steps: [
        `Mosteller = √(height × weight ÷ 3600) = √(${hcm.toFixed(1)} cm × ${w.toFixed(1)} kg ÷ 3600) = ${bsa.toFixed(3)} m²`,
        `Du Bois = 0.007184 × ${w.toFixed(1)}^0.425 × ${hcm.toFixed(1)}^0.725 = ${duBois.toFixed(3)} m²`,
      ],
      note: 'This is an estimate from height and weight, not medical advice. Clinical dosing should always be set by a qualified professional.',
    };
  },
  content: {
    formula: ['Mosteller: BSA (m²) = √( height (cm) × weight (kg) ÷ 3600 )', 'Du Bois & Du Bois: BSA (m²) = 0.007184 × weight (kg)^0.425 × height (cm)^0.725'],
    body: [
      'Body surface area (BSA) is an estimate of the total area of your skin. Clinicians use it because some body measures, such as cardiac output, kidney filtration and certain drug doses, scale more closely with surface area than with weight alone.',
      'This calculator uses the Mosteller formula, published in 1987 as a simple alternative that can be worked out on a pocket calculator. It takes the square root of height in centimetres times weight in kilograms, divided by 3600. The 1916 Du Bois & Du Bois formula is shown next to it so you can compare; for typical adults the two agree closely.',
      'For a 170 cm, 70 kg adult, Mosteller gives about 1.82 m² and Du Bois about 1.81 m². Many adults fall between roughly 1.5 and 2.2 m², and 1.73 m² is a common reference value used to standardise kidney-function results. Both formulas are estimates and are less reliable at extremes of size. This page is not medical advice.',
    ],
    faq: [
      { q: 'What is a normal body surface area?', a: 'There is no single normal value. Adults commonly land between about 1.5 and 2.2 m², and 1.73 m² is a widely used reference value for standardising kidney-function results. A 170 cm, 70 kg adult comes out at about 1.82 m² with Mosteller.' },
      { q: 'Which formula is more accurate, Mosteller or Du Bois?', a: 'For most adults they differ by only a few hundredths of a square metre (for 170 cm and 70 kg: 1.82 vs 1.81 m²). Mosteller is simpler and widely used in clinical practice; neither is a direct measurement.' },
      { q: 'Can I use this to work out a medication dose?', a: 'No. Dose calculations, especially for chemotherapy, follow protocols that specify the formula, rounding and any caps. Use this only as an estimate and rely on your care team for dosing.' },
    ],
    sources: [
      { label: 'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.' },
      { label: 'Du Bois D, Du Bois EF. A formula to estimate the approximate surface area if height and weight be known. Arch Intern Med. 1916;17:863–871.' },
    ],
  },
  related: ['bmi', 'body-fat', 'ideal-weight', 'tdee'],
  examples: [
    // 170 cm, 70 kg: 170 × 70 = 11,900; ÷ 3600 = 3.3056; √ = 1.8181. Du Bois: 0.007184 × 70^0.425 × 170^0.725 = 1.8097
    { values: { height: 1.7, weight: 70 }, expect: { bsa: 1.8181, duBois: 1.8097, ft2: 19.5700 }, tolerance: 0.001 },
    // 180 cm, 90 kg: 16,200 ÷ 3600 = 4.5; √4.5 = 2.1213. Du Bois = 2.0989
    { values: { height: 1.8, weight: 90 }, expect: { bsa: 2.1213, duBois: 2.0989 }, tolerance: 0.001 },
  ],
});
