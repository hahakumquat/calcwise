import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { SEX_OPTIONS } from '../../lib/helpers/health';

export default defineCalculator({
  slug: 'lean-body-mass',
  title: 'Lean Body Mass & FFMI Calculator',
  category: 'health',
  description: 'Estimate your lean body mass with the Boer formula, or from body fat %, and get your fat-free mass index (FFMI).',
  keywords: ['lean body mass', 'LBM', 'FFMI', 'fat free mass index', 'Boer formula', 'lean mass'],
  inputs: [
    { id: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS, default: 'male', segmented: true, info: 'The Boer formula has separate coefficients for men and women. Ignored if you enter a body fat percentage.' },
    { id: 'weight', label: 'Weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 176, info: 'Your body weight.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', default: 71, info: 'Your height without shoes, standing straight.' },
    { id: 'bodyFat', label: 'Body fat (optional)', type: 'number', suffix: '%', min: 2, max: 70, optional: true, help: 'Leave blank to use the Boer formula.', info: 'If you know your body fat percentage (from a scan or the body fat calculator), lean mass is simply weight × (1 − body fat). That is more accurate than a height-and-weight formula.' },
  ],
  outputs: [
    { id: 'lbm', label: 'Lean body mass', primary: true, unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', precision: 1, info: 'Everything that is not fat: muscle, bone, organs and water.' },
    { id: 'fatMass', label: 'Fat mass', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', precision: 1, info: 'Weight minus lean body mass.' },
    { id: 'leanPct', label: 'Lean share of weight', precision: 1, suffix: '%', info: 'Lean body mass as a percentage of your weight.' },
    { id: 'ffmi', label: 'FFMI', precision: 1, info: 'Fat-free mass index: lean mass in kg divided by height in metres squared.' },
    { id: 'nffmi', label: 'Normalized FFMI', precision: 1, info: 'FFMI adjusted to a height of 1.80 m: FFMI + 6.3 × (1.8 − height in m).' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const h = num(v.height);
    if (!kg || !h || kg <= 0 || h <= 0) return { lbm: null };
    const bf = num(v.bodyFat);
    const hasBf = bf != null && bf > 0;
    const hc = h * 100;
    const female = v.sex === 'female';
    let lbm: number;
    let step: string;
    if (hasBf) {
      lbm = kg * (1 - bf / 100);
      step = `LBM = weight × (1 − body fat) = ${kg.toFixed(1)} × (1 − ${bf / 100}) = ${lbm.toFixed(1)} kg`;
    } else if (female) {
      lbm = 0.252 * kg + 0.473 * hc - 48.3;
      step = `Boer (women): 0.252 × ${kg.toFixed(1)} + 0.473 × ${hc.toFixed(1)} − 48.3 = ${lbm.toFixed(1)} kg`;
    } else {
      lbm = 0.407 * kg + 0.267 * hc - 19.2;
      step = `Boer (men): 0.407 × ${kg.toFixed(1)} + 0.267 × ${hc.toFixed(1)} − 19.2 = ${lbm.toFixed(1)} kg`;
    }
    if (!Number.isFinite(lbm) || lbm <= 0 || lbm >= kg)
      return { lbm: null, error: 'These numbers give a lean mass outside a sensible range. Please double-check weight and height.' };
    const ffmi = lbm / (h * h);
    const nffmi = ffmi + 6.3 * (1.8 - h);
    return {
      lbm,
      fatMass: kg - lbm,
      leanPct: (lbm / kg) * 100,
      ffmi,
      nffmi,
      chart: {
        type: 'donut',
        title: 'Body composition',
        format: { unit: 'mass' },
        slices: [
          { label: 'Fat mass', value: kg - lbm },
          { label: 'Lean mass', value: lbm },
        ],
        centerValue: `${((lbm / kg) * 100).toFixed(0)}%`,
        centerLabel: 'lean',
      },
      steps: [step, `FFMI = ${lbm.toFixed(1)} ÷ ${h.toFixed(2)}² = ${ffmi.toFixed(1)}`, `Normalized FFMI = ${ffmi.toFixed(1)} + 6.3 × (1.8 − ${h.toFixed(2)}) = ${nffmi.toFixed(1)}`],
      note: hasBf ? 'Using your body fat percentage. A scan or tape estimate is only as good as its measurement.' : 'The Boer formula is an estimate from height and weight; it cannot see how muscular you are. Add a body fat percentage for a better number.',
    };
  },
  content: {
    formula: [
      'Boer (men): LBM = 0.407 × weight (kg) + 0.267 × height (cm) − 19.2',
      'Boer (women): LBM = 0.252 × weight (kg) + 0.473 × height (cm) − 48.3',
      'With body fat: LBM = weight × (1 − body fat %)',
      'FFMI = LBM (kg) ÷ height (m)²; normalized FFMI = FFMI + 6.3 × (1.8 − height in m)',
    ],
    body: [
      'Lean body mass (LBM) is your weight minus your fat: muscle, bone, organs, blood and water. It is the number behind protein targets, calorie needs and some medication doses, and it is a better progress marker than the scale when you are lifting.',
      'With no body fat figure, this calculator uses the Boer (1984) equations, which estimate LBM from height and weight. They are widely used in clinical settings but treat two people of the same size alike, so a very muscular or very lean person will be underestimated. If you know your body fat percentage, enter it and the calculator uses weight × (1 − body fat) instead.',
      'FFMI divides lean mass by height squared, like BMI but without the fat. The normalized version rescales to a 1.80 m height so that tall and short people can be compared. Kouri and colleagues (1995) introduced it in a study of male athletes. Claims about a "natural limit" are debated and a single number does not prove anything about any one person, so none is shown here.',
      'This is an estimate for fitness tracking, not medical advice.',
    ],
    faq: [
      { q: 'How is lean body mass calculated?', a: 'Without a body fat figure, the Boer formula: for men 0.407 × weight in kg + 0.267 × height in cm − 19.2; for women 0.252 × weight + 0.473 × height − 48.3. With a body fat percentage it is weight × (1 − body fat).' },
      { q: 'What is a good FFMI?', a: 'There is no official target. In the Kouri study, non-steroid-using male athletes mostly fell below about 25, but that is one sample and the "limit" is contested. Use FFMI to track your own change over time.' },
      { q: 'Why does the result differ from my body fat scan?', a: 'The Boer formula only knows height, weight and sex. A scan measures your actual composition, so prefer it and enter the body fat percentage.' },
    ],
    sources: [
      { label: 'Boer P. Estimated lean body mass as an index for normalization of body fluid volumes in humans. Am J Physiol 1984;247:F632-5', url: 'https://doi.org/10.1152/ajprenal.1984.247.4.F632' },
      { label: 'Kouri EM et al. Fat-free mass index in users and nonusers of anabolic-androgenic steroids. Clin J Sport Med 1995;5(4):223-8', url: 'https://doi.org/10.1097/00042752-199510000-00003' },
    ],
  },
  related: ['body-fat', 'tdee', 'protein', 'bmi'],
  examples: [
    { values: { sex: 'male', weight: 80, height: 1.8, bodyFat: 15 }, expect: { lbm: 68, fatMass: 12, leanPct: 85, ffmi: 20.987654, nffmi: 20.987654 }, tolerance: 1e-4 },
    { values: { sex: 'male', weight: 80, height: 1.8 }, expect: { lbm: 61.42, ffmi: 18.95679 }, tolerance: 1e-4 },
    { values: { sex: 'female', weight: 60, height: 1.65 }, expect: { lbm: 44.865, ffmi: 16.47934, nffmi: 17.42434 }, tolerance: 1e-3 },
  ],
});
