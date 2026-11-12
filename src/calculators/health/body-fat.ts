import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { SEX_OPTIONS } from '../../lib/helpers/health';

const LEN = ['cm', 'in'];

// ACE category lower bounds: [athletes, fitness, average, obese]
const CUTS = { male: [6, 14, 18, 25], female: [14, 21, 25, 32] };

function category(bf: number, female: boolean): string {
  const [ess, ath, fit, avg] = female ? CUTS.female : CUTS.male;
  if (bf < ess) return 'Essential fat';
  if (bf < ath) return 'Athletes';
  if (bf < fit) return 'Fitness';
  if (bf < avg) return 'Average';
  return 'Obese';
}

export default defineCalculator({
  slug: 'body-fat',
  title: 'Body Fat Calculator',
  category: 'health',
  description: 'Estimate your body fat percentage from a few tape-measure readings using the U.S. Navy method.',
  keywords: ['body fat percentage', 'navy method', 'navy body fat', 'lean body mass', 'fat mass'],
  popular: true,
  inputs: [
    { id: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS, default: 'male', segmented: true, info: 'Men and women use different Navy equations; the women’s version adds a hip measurement.' },
    { id: 'weight', label: 'Weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 180, help: 'Used only for fat and lean mass.', optional: true, info: 'Your body weight. It is not needed for the percentage — only to split your weight into fat and lean mass.' },
    { id: 'height', label: 'Height', type: 'number', unit: 'length', units: ['cm', 'in', 'ft'], defaultUnit: 'in', default: 70, info: 'Your height without shoes, standing straight.' },
    { id: 'neck', label: 'Neck circumference', type: 'number', unit: 'length', units: LEN, defaultUnit: 'in', default: 15.5, help: 'Just below the larynx (Adam’s apple).', info: 'Wrap the tape just below the Adam’s apple, sloping slightly down to the front. Typical values are 13–17 in (33–43 cm).' },
    { id: 'waist', label: 'Waist circumference', type: 'number', unit: 'length', units: LEN, defaultUnit: 'in', default: 35, help: 'Men: at the navel. Women: at the narrowest point.', info: 'Measure horizontally on bare skin after breathing out normally — at the navel for men, at the narrowest point for women.' },
    { id: 'hip', label: 'Hip circumference', type: 'number', unit: 'length', units: LEN, defaultUnit: 'in', default: 40, help: 'Widest part of the buttocks.', showWhen: { input: 'sex', is: 'female' }, info: 'Measure around the widest part of the buttocks with your feet together. Only used in the women’s formula.' },
  ],
  outputs: [
    { id: 'bodyFat', label: 'Body fat', primary: true, precision: 1, suffix: '%', info: 'Estimated share of your body weight that is fat. Tape methods are usually within 3–4 percentage points of lab tests.' },
    { id: 'category', label: 'Category', format: 'text', info: 'American Council on Exercise category for your body fat percentage and sex.' },
    { id: 'fatMass', label: 'Fat mass', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', precision: 1, info: 'Weight × body fat percentage: how much of your weight is fat. Needs your weight.' },
    { id: 'leanMass', label: 'Lean body mass', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', precision: 1, info: 'Everything that is not fat — muscle, bone, organs and water. Needs your weight.' },
  ],
  compute: (v) => {
    const female = v.sex === 'female';
    const h = num(v.height);
    const neck = num(v.neck);
    const waist = num(v.waist);
    const hip = num(v.hip);
    const kg = num(v.weight);
    if (!h || !neck || !waist || h <= 0 || neck <= 0 || waist <= 0) return { bodyFat: null };
    if (female && (!hip || hip <= 0)) return { bodyFat: null, error: 'Enter your hip circumference — the Navy formula for women needs it.' };
    // The Navy equations are defined in centimetres.
    const hc = h * 100;
    const nc = neck * 100;
    const wc = waist * 100;
    const pc = (hip ?? 0) * 100;
    const girth = female ? wc + pc - nc : wc - nc;
    if (girth <= 0) return { bodyFat: null, error: 'Your waist (plus hip, for women) must be larger than your neck measurement.' };
    const density = female
      ? 1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(hc)
      : 1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(hc);
    const bodyFat = 495 / density - 450;
    if (!Number.isFinite(bodyFat) || bodyFat <= 0 || bodyFat >= 75)
      return { bodyFat: null, error: 'These measurements are outside the range the Navy formula can handle. Please double-check them.' };
    const cat = category(bodyFat, female);
    const [a, b, c, d] = female ? CUTS.female : CUTS.male;
    const lo = female ? 8 : 2;
    const hi = female ? 45 : 40;
    const chart: ChartSpec[] = [
      {
        type: 'scale',
        title: `Body fat categories (${female ? 'women' : 'men'})`,
        min: lo,
        max: hi,
        value: bodyFat,
        valueLabel: `${bodyFat.toFixed(1)}%`,
        format: { suffix: '%' },
        bands: [
          { from: lo, to: a, label: 'Essential', tone: 'warn' },
          { from: a, to: b, label: 'Athletes', tone: 'good' },
          { from: b, to: c, label: 'Fitness', tone: 'good' },
          { from: c, to: d, label: 'Average', tone: 'ok' },
          { from: d, to: hi, label: 'Obese', tone: 'bad' },
        ],
      },
    ];
    if (kg) chart.push({ type: 'donut', title: 'Body composition', format: { unit: 'mass' }, slices: [{ label: 'Fat mass', value: (kg * bodyFat) / 100 }, { label: 'Lean mass', value: kg * (1 - bodyFat / 100) }], centerValue: `${bodyFat.toFixed(1)}%`, centerLabel: 'fat' });
    return {
      bodyFat,
      category: cat,
      fatMass: kg ? (kg * bodyFat) / 100 : null,
      leanMass: kg ? kg * (1 - bodyFat / 100) : null,
      chart,
      steps: [
        female
          ? `Waist + hip − neck = ${wc.toFixed(1)} + ${pc.toFixed(1)} − ${nc.toFixed(1)} = ${girth.toFixed(1)} cm`
          : `Waist − neck = ${wc.toFixed(1)} − ${nc.toFixed(1)} = ${girth.toFixed(1)} cm`,
        `Body density term = ${density.toFixed(5)}`,
        `Body fat = 495 ÷ ${density.toFixed(5)} − 450 = ${bodyFat.toFixed(1)}%`,
      ],
      note: `${bodyFat.toFixed(1)}% falls in the "${cat}" range (ACE categories). Tape estimates are typically within 3–4 points of lab methods.`,
    };
  },
  content: {
    formula: [
      'Men: %BF = 495 ÷ (1.0324 − 0.19077·log₁₀(waist − neck) + 0.15456·log₁₀(height)) − 450',
      'Women: %BF = 495 ÷ (1.29579 − 0.35004·log₁₀(waist + hip − neck) + 0.22100·log₁₀(height)) − 450',
      'All measurements in centimetres',
    ],
    body: [
      'The U.S. Navy method estimates body fat from circumference measurements. It was developed so recruiters could screen large numbers of people with nothing more than a tape measure, and it remains one of the more accurate do-it-yourself methods.',
      'Measure on bare skin with the tape snug but not compressing the skin, and take each reading two or three times. Men measure the waist horizontally at the navel; women measure at the narrowest part of the waist and the widest part of the hips. Small measuring errors move the result noticeably, so consistency matters more than precision if you are tracking change over time.',
      'Category labels follow the American Council on Exercise ranges. Essential fat (about 2–5% for men and 10–13% for women) is the minimum needed for normal body function; going below it is unhealthy. This calculator is for general information and is not medical advice.',
    ],
    faq: [
      { q: 'How accurate is the Navy method?', a: 'Compared with DEXA scans or hydrostatic weighing, it is usually within about 3–4 percentage points. It is less reliable for people with unusual fat distribution or very high or very low body fat.' },
      { q: 'Why does it need my weight?', a: 'It does not need it for the percentage. Weight is used only to split your body into fat mass and lean mass.' },
      { q: 'Is body fat a better measure than BMI?', a: 'For individuals, often yes — it separates fat from muscle, which BMI cannot. But both are screening tools; neither diagnoses a health problem on its own.' },
    ],
  },
  related: ['bmi', 'waist-to-height-ratio', 'ideal-weight', 'tdee', 'bmr'],
  examples: [
    {
      values: { sex: 'male', weight: 80, height: 1.75, neck: 0.38, waist: 0.85, hip: null },
      expect: { bodyFat: 16.93, category: 'Fitness', fatMass: 13.54 },
      tolerance: 0.002,
    },
    { values: { sex: 'female', weight: 60, height: 1.65, neck: 0.32, waist: 0.7, hip: 0.95 }, expect: { bodyFat: 24.856, category: 'Fitness' }, tolerance: 0.002 },
  ],
});
