import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { SEX_OPTIONS } from '../../lib/helpers/health';

const R = { male: 0.68, female: 0.55 }; // Widmark body-water factors
const BETA = 0.015; // % BAC eliminated per hour (typical average)
const LIMIT = 0.08;

function status(bac: number): string {
  if (bac <= 0) return 'No alcohol remaining (estimated)';
  if (bac < 0.02) return 'Minimal — some effects possible';
  if (bac < 0.05) return 'Mild impairment — relaxation, reduced judgment';
  if (bac < 0.08) return 'Impaired — coordination and reaction time affected';
  if (bac < 0.15) return 'Over the U.S. driving limit — clearly impaired';
  if (bac < 0.3) return 'Severe impairment — risk of vomiting and blackout';
  return 'Life-threatening — risk of alcohol poisoning';
}

export default defineCalculator({
  slug: 'bac',
  title: 'Blood Alcohol (BAC) Calculator',
  category: 'health',
  description: 'Get a rough estimate of blood alcohol concentration with the Widmark formula. For education only — never use it to decide whether to drive.',
  keywords: ['blood alcohol content', 'blood alcohol concentration', 'BAC', 'Widmark formula', 'am I drunk', 'standard drinks', 'how long until sober'],
  inputs: [
    { id: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS, default: 'male', segmented: true, info: 'Women have less body water on average, so the same drinks give a higher concentration. The formula uses r = 0.68 for men and 0.55 for women.' },
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 180, info: 'Your body weight. Alcohol spreads through body water, so lighter people reach higher levels from the same amount.' },
    { id: 'drinks', label: 'Standard drinks', type: 'number', default: 3, min: 0, step: 0.5, help: 'One US standard drink = 12 oz beer (5%), 5 oz wine (12%) or 1.5 oz spirits (40%).', info: 'Count standard drinks, not glasses. A large glass of wine or a strong craft beer can be 1.5–2 standard drinks.' },
    {
      id: 'standard',
      label: 'Standard drink size',
      type: 'select',
      default: '14',
      options: [
        { value: '14', label: 'US — 14 g alcohol' },
        { value: '10', label: 'Australia / NZ — 10 g' },
        { value: '8', label: 'UK unit — 8 g' },
      ],
      info: 'Countries define a “standard drink” differently. Pick the definition you used when counting drinks.',
    },
    { id: 'hours', label: 'Time since first drink', type: 'number', unit: 'time', units: ['h', 'min'], defaultUnit: 'h', default: 2, min: 0, info: 'Hours since you started drinking. The body removes roughly 0.015% BAC per hour on average.' },
  ],
  outputs: [
    { id: 'bac', label: 'Estimated BAC', primary: true, precision: 3, suffix: '%', info: 'Estimated grams of alcohol per 100 mL of blood. 0.08% is the U.S. driving limit, but impairment begins well below it.' },
    { id: 'status', label: 'Typical effects', format: 'text', info: 'Effects commonly seen at this level in an average adult. Individuals vary widely.' },
    { id: 'soberIn', label: 'Time until about 0.00%', unit: 'time', units: ['h', 'min'], defaultUnit: 'h', precision: 1, info: 'How long until the estimated BAC reaches zero at the average elimination rate. Only time lowers BAC.' },
    { id: 'alcohol', label: 'Pure alcohol consumed', precision: 0, suffix: 'g', info: 'Number of drinks × grams of alcohol per standard drink.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const drinks = num(v.drinks);
    const sec = num(v.hours) ?? 0;
    const grams = Number(v.standard) || 14;
    if (!kg || kg <= 0 || drinks === null || drinks < 0 || sec < 0) return { bac: null };
    const r = v.sex === 'female' ? R.female : R.male;
    const h = sec / 3600;
    const A = drinks * grams;
    const peak = (A / (r * kg * 1000)) * 100;
    const bac = Math.max(0, peak - BETA * h);
    // Curve from first drink until zero.
    const end = Math.max(h, peak / BETA, 1);
    const stepH = end > 12 ? 1 : 0.5;
    const xs: number[] = [];
    for (let t = 0; t <= end + stepH / 2; t += stepH) xs.push(+t.toFixed(2));
    return {
      bac,
      status: status(bac),
      soberIn: (bac / BETA) * 3600,
      alcohol: A,
      chart: {
        type: 'line',
        title: 'Estimated BAC over time',
        x: xs,
        xLabel: 'Hours since first drink',
        yFormat: { suffix: '%' },
        series: [
          { name: 'Estimated BAC', values: xs.map((t) => Math.max(0, peak - BETA * t)) },
          { name: 'U.S. driving limit (0.08%)', values: xs.map(() => LIMIT) },
        ],
        markers: [{ x: +h.toFixed(2), label: 'Now' }],
      },
      steps: [
        `Alcohol = ${drinks} × ${grams} g = ${A} g`,
        `Peak BAC = ${A} g ÷ (${r} × ${Math.round(kg * 1000)} g) × 100 = ${peak.toFixed(3)}%`,
        `After ${h.toFixed(1)} h: ${peak.toFixed(3)} − ${BETA} × ${h.toFixed(1)} = ${bac.toFixed(3)}%`,
      ],
      note: 'Rough estimate only. Food, medications, health and genetics change real BAC a lot. Never use this to decide whether you are safe to drive — if you have been drinking, don’t drive.',
    };
  },
  content: {
    formula: ['BAC (%) = A ÷ (r × W) × 100 − β × t', 'A = grams of alcohol, W = body weight in grams, r = 0.68 (men) or 0.55 (women)', 'β ≈ 0.015 % per hour, t = hours since drinking began'],
    body: [
      'Important: this calculator gives a rough, population-average estimate for education only. Your actual blood alcohol can be much higher than shown. It must never be used to judge whether you can drive, operate machinery or make any safety decision. The only safe blood alcohol level for driving is zero.',
      'The estimate uses the Widmark formula, developed in the 1930s. It spreads the alcohol you drank through your body water — represented by the factor r, which is lower on average for women because of differences in body composition — and then subtracts the amount your liver typically clears per hour.',
      'Real-world BAC depends on many things the formula ignores: how fast you drank, whether you ate, your liver health, medications and individual metabolism. Absorption takes 30–90 minutes, so BAC can keep rising after your last drink. Most U.S. states set the driving limit at 0.08% (Utah: 0.05%), and commercial drivers and under-21 drivers face stricter limits.',
      'If someone is confused, vomiting, having seizures, breathing slowly or cannot be woken, call emergency services — these are signs of alcohol poisoning. This tool is not medical or legal advice.',
    ],
    faq: [
      { q: 'Can I speed up sobering up?', a: 'No. Coffee, cold showers and exercise do not change how fast your liver removes alcohol. Only time lowers BAC, at roughly 0.015% per hour on average.' },
      { q: 'Why is the result different for men and women?', a: 'At the same weight, women on average have less body water, so the same amount of alcohol produces a higher concentration. The formula reflects this with a smaller r factor.' },
      { q: 'Is a breathalyzer more accurate?', a: 'A calibrated breath test measures your actual alcohol level rather than predicting it, so it is far more reliable than any formula. Consumer devices still vary in accuracy.' },
    ],
  },
  related: ['water-intake', 'calories-burned', 'bmi'],
  examples: [
    {
      values: { sex: 'male', weight: 80, drinks: 4, standard: '14', hours: 7200 },
      expect: { bac: 0.0729412, alcohol: 56, status: 'Impaired — coordination and reaction time affected', soberIn: 17505.88 },
      tolerance: 1e-5,
    },
    { values: { sex: 'female', weight: 60, drinks: 2, standard: '14', hours: 0 }, expect: { bac: 0.0848485 }, tolerance: 1e-5 },
  ],
});
