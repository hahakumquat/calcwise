import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { SEX_OPTIONS } from '../../lib/helpers/health';

const MASS = { unit: 'mass' as const, units: ['kg', 'lb'], defaultUnit: 'lb', precision: 1 };

// [base kg at 5 ft, kg per inch over 5 ft] for men and women.
const FORMULAS = {
  devine: { male: [50, 2.3], female: [45.5, 2.3] },
  robinson: { male: [52, 1.9], female: [49, 1.7] },
  miller: { male: [56.2, 1.41], female: [53.1, 1.36] },
  hamwi: { male: [48, 2.7], female: [45.5, 2.2] },
} as const;

export default defineCalculator({
  slug: 'ideal-weight',
  title: 'Ideal Weight Calculator',
  category: 'health',
  description: 'See your ideal body weight by the Devine, Robinson, Miller and Hamwi formulas, plus the healthy BMI range for your height.',
  keywords: ['ideal body weight', 'IBW', 'healthy weight', 'how much should I weigh', 'Devine formula'],
  inputs: [
    { id: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS, default: 'male', segmented: true, info: 'Each formula has separate constants for men and women.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', default: 69, info: 'Your height without shoes. The formulas add a fixed amount per inch above 5 ft (152.4 cm).' },
  ],
  outputs: [
    { id: 'devine', label: 'Ideal weight (Devine)', primary: true, ...MASS, info: 'The Devine (1974) formula, the one most used in hospitals, e.g. for drug dosing.' },
    { id: 'robinson', label: 'Robinson (1983)', ...MASS, info: 'A 1983 refinement of Devine based on population data; usually a little lower for tall men.' },
    { id: 'miller', label: 'Miller (1983)', ...MASS, info: 'Another 1983 formula with a smaller increase per inch, so it is flatter across heights.' },
    { id: 'hamwi', label: 'Hamwi (1964)', ...MASS, info: 'An older clinical rule of thumb that tends to give the highest values for tall people.' },
    { id: 'bmiMin', label: 'Healthy BMI range from', ...MASS, info: 'The weight that gives a BMI of 18.5 at your height — the bottom of the healthy range.' },
    { id: 'bmiMax', label: 'Healthy BMI range to', ...MASS, info: 'The weight that gives a BMI of 24.9 at your height — the top of the healthy range.' },
  ],
  compute: (v) => {
    const m = num(v.height);
    if (!m || m < 1.2 || m > 2.5) return { devine: null, error: m ? 'These formulas are only meaningful for adult heights (about 4 ft to 8 ft).' : undefined };
    const sex = v.sex === 'female' ? 'female' : 'male';
    const inches = m / 0.0254;
    const over = inches - 60;
    const calc = (k: keyof typeof FORMULAS) => {
      const [base, per] = FORMULAS[k][sex];
      return base + per * over;
    };
    const res = { devine: calc('devine'), robinson: calc('robinson'), miller: calc('miller'), hamwi: calc('hamwi') };
    const vals = Object.values(res);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const bmiMin = 18.5 * m * m;
    const bmiMax = 24.9 * m * m;
    return {
      ...res,
      bmiMin,
      bmiMax,
      chart: {
        type: 'bar',
        title: 'Ideal weight by formula',
        categories: ['Devine', 'Robinson', 'Miller', 'Hamwi', 'BMI 18.5', 'BMI 24.9'],
        series: [{ name: 'Weight', values: [res.devine, res.robinson, res.miller, res.hamwi, bmiMin, bmiMax] }],
        format: { unit: 'mass' },
        highlight: 0,
      },
      steps: [
        `Height = ${inches.toFixed(1)} in, i.e. ${over.toFixed(1)} in over 5 ft`,
        `Devine = ${FORMULAS.devine[sex][0]} + 2.3 × ${over.toFixed(1)} = ${res.devine.toFixed(1)} kg`,
      ],
      note:
        over < 0
          ? 'You are under 5 ft; these formulas were designed for taller adults, so the healthy BMI range is a better guide.'
          : `The four formulas span ${lo.toFixed(1)}–${hi.toFixed(1)} kg (${(lo / 0.45359237).toFixed(0)}–${(hi / 0.45359237).toFixed(0)} lb).`,
    };
  },
  content: {
    formula: [
      'Devine: men 50 kg + 2.3 kg per inch over 5 ft; women 45.5 kg + 2.3 kg/in',
      'Robinson: men 52 kg + 1.9 kg/in; women 49 kg + 1.7 kg/in',
      'Miller: men 56.2 kg + 1.41 kg/in; women 53.1 kg + 1.36 kg/in',
      'Hamwi: men 48 kg + 2.7 kg/in; women 45.5 kg + 2.2 kg/in',
      'Healthy BMI range: 18.5 × height² to 24.9 × height² (height in m)',
    ],
    body: [
      '"Ideal body weight" formulas were created mainly for clinical use — for example, to dose certain drugs — rather than as a weight-loss target. Each starts from a base weight at 5 feet tall and adds a fixed amount for every additional inch.',
      'The Devine formula (1974) is the most widely used in hospitals and is shown as the headline number. Robinson and Miller are later refinements based on population data, and Hamwi is an older rule of thumb. Taken together they give a sensible ballpark, and the spread between them is a reminder that there is no single correct number.',
      'None of these formulas consider frame size, muscle mass or age. The healthy BMI range is wider and often more practical: anywhere within it is generally associated with lower health risk. This is general information, not medical advice.',
    ],
    faq: [
      { q: 'Which formula is the most accurate?', a: 'None is "accurate" for an individual, because they ignore body composition. Devine is the clinical standard; Robinson and Miller tend to give slightly lower values for tall men.' },
      { q: 'I am muscular and above my ideal weight. Is that a problem?', a: 'Not necessarily. Muscle is dense, so athletic people often weigh more than these formulas suggest. A body-fat or waist-to-height measurement is more informative.' },
    ],
  },
  related: ['bmi', 'body-fat', 'waist-to-height-ratio', 'weight-loss-goal', 'tdee'],
  examples: [
    { values: { sex: 'male', height: 70 * 0.0254 }, expect: { devine: 73, robinson: 71, miller: 70.3, hamwi: 75 }, tolerance: 1e-6 },
    { values: { sex: 'female', height: 64 * 0.0254 }, expect: { devine: 54.7, robinson: 55.8, miller: 58.54, hamwi: 54.3 }, tolerance: 1e-6 },
  ],
});
