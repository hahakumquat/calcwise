import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'macro-calories-check',
  title: 'Calories From Macros Calculator',
  category: 'food',
  description: 'Add up calories from grams of carbs, protein, fat and alcohol using the 4/4/9/7 Atwater factors, see each share, and compare with the label.',
  updated: '2026-11-26',
  keywords: ['calories from macros', 'calculate calories from carbs protein fat', 'nutrition label calorie check', 'atwater factors calculator', '4 4 9 calories', 'macros to calories'],
  inputs: [
    { id: 'carbs', label: 'Carbohydrates', type: 'number', default: 20, min: 0, step: 1, suffix: 'g', info: 'Grams of carbohydrate. Counted at 4 kcal per gram.' },
    { id: 'protein', label: 'Protein', type: 'number', default: 10, min: 0, step: 1, suffix: 'g', info: 'Grams of protein. Counted at 4 kcal per gram.' },
    { id: 'fat', label: 'Fat', type: 'number', default: 5, min: 0, step: 1, suffix: 'g', info: 'Grams of fat. Counted at 9 kcal per gram.' },
    { id: 'alcohol', label: 'Alcohol (optional)', type: 'number', min: 0, step: 1, suffix: 'g', optional: true, info: 'Grams of alcohol. Counted at 7 kcal per gram. Leave blank if none.' },
    { id: 'label', label: 'Label calories (optional)', type: 'number', min: 0, step: 1, suffix: 'kcal', optional: true, help: 'Enter the calories printed on the label to see the difference.', info: 'The calories the package or recipe states. Leave blank to skip the comparison.' },
  ],
  outputs: [
    { id: 'kcal', label: 'Calories from macros', primary: true, precision: 1, suffix: 'kcal', info: '4 × carbs + 4 × protein + 9 × fat + 7 × alcohol.' },
    { id: 'carbPct', label: 'Share from carbs', format: 'percent', precision: 1, info: 'Carb calories ÷ total calories.' },
    { id: 'proteinPct', label: 'Share from protein', format: 'percent', precision: 1, info: 'Protein calories ÷ total calories.' },
    { id: 'fatPct', label: 'Share from fat', format: 'percent', precision: 1, info: 'Fat calories ÷ total calories.' },
    { id: 'diff', label: 'Difference vs label', precision: 1, suffix: 'kcal', info: 'Calories from macros minus label calories. Positive means the macros add up to more than the label.' },
    { id: 'diffPct', label: 'Difference as share of label', format: 'percent', precision: 1, info: 'Difference ÷ label calories.' },
  ],
  compute: (v) => {
    const c = num(v.carbs), p = num(v.protein), f = num(v.fat);
    const a = num(v.alcohol) ?? 0;
    const label = num(v.label);
    if (c === null || p === null || f === null) return { kcal: null };
    if (c < 0 || p < 0 || f < 0 || a < 0 || (label !== null && label < 0)) return { kcal: null };
    const cK = 4 * c, pK = 4 * p, fK = 9 * f, aK = 7 * a;
    const kcal = cK + pK + fK + aK;
    if (kcal <= 0) return { kcal: null };
    const hasLabel = label !== null && label > 0;
    const diff = hasLabel ? kcal - label : null;
    const diffPct = hasLabel ? (kcal - label) / label : null;
    const slices = [
      { label: 'Carbs', value: cK },
      { label: 'Protein', value: pK },
      { label: 'Fat', value: fK },
      ...(a > 0 ? [{ label: 'Alcohol', value: aK }] : []),
    ];
    const close = diffPct !== null && Math.abs(diffPct) <= 0.1;
    const steps = [
      `Carbs = ${fmt(c)} g × 4 = ${fmt(cK)} kcal`,
      `Protein = ${fmt(p)} g × 4 = ${fmt(pK)} kcal`,
      `Fat = ${fmt(f)} g × 9 = ${fmt(fK)} kcal`,
      ...(a > 0 ? [`Alcohol = ${fmt(a)} g × 7 = ${fmt(aK)} kcal`] : []),
      `Total = ${fmt(kcal)} kcal`,
      ...(hasLabel ? [`Difference = ${fmt(kcal)} − ${fmt(label)} = ${fmt(kcal - label)} kcal`] : []),
    ];
    return {
      kcal,
      carbPct: cK / kcal,
      proteinPct: pK / kcal,
      fatPct: fK / kcal,
      diff,
      diffPct,
      tone: diffPct === null ? 'good' : close ? 'good' : 'warn',
      badge: diffPct === null ? 'No label to compare' : close ? 'Within 10% of the label' : 'More than 10% off the label',
      note: 'Labels round their numbers and may use different fibre rules, so a gap of a few percent is normal. This is an estimate, not nutrition or medical advice.',
      chart: {
        type: 'donut' as const,
        title: 'Calories by source',
        slices,
        format: { format: 'integer', suffix: 'kcal' },
        centerLabel: 'kcal',
        centerValue: fmt(kcal, 0),
      },
      steps,
    };
  },
  content: {
    formula: [
      'Calories = 4 × carbs (g) + 4 × protein (g) + 9 × fat (g) + 7 × alcohol (g)',
      'Share of a source = its calories ÷ total calories',
      'Difference vs label = calories from macros − label calories',
    ],
    body: [
      'The Atwater system gives each macronutrient an average energy value: 4 kcal per gram for carbohydrate and protein, 9 kcal per gram for fat, and 7 kcal per gram for alcohol. Multiply and add, and you get a calorie figure you can check against a package or a homemade recipe.',
      'For 20 g of carbs, 10 g of protein and 5 g of fat, that is 80 + 40 + 45 = 165 kcal. Carbs supply 48.5%, protein 24.2% and fat 27.3%. Adding 10 g of alcohol adds 70 kcal, for 235 kcal in total.',
      'Do not expect a perfect match with the label. Labels round grams and calories, and fibre, sugar alcohols and other ingredients can be counted differently from country to country. A gap of a few percent is normal; a big one is worth a second look at the numbers you typed in.',
    ],
    faq: [
      { q: 'How many calories are in a gram of carbs, protein, fat and alcohol?', a: 'This calculator uses 4 kcal per gram of carbohydrate, 4 per gram of protein, 9 per gram of fat and 7 per gram of alcohol.' },
      { q: 'How many calories are in 20 g carbs, 10 g protein and 5 g fat?', a: '165 kcal: 80 from carbs, 40 from protein and 45 from fat. That is 48.5% carbs, 24.2% protein and 27.3% fat.' },
      { q: 'Why does my label say something different?', a: 'Labels round their figures and treat fibre differently in some places. For a label of 150 kcal with 25 g carbs, 5 g protein and 6 g fat, the macros add up to 174 kcal, which is 24 kcal (16%) above the label.' },
      { q: 'Does this include alcohol?', a: 'Yes, if you enter grams of alcohol. Adding 10 g to 20 g carbs, 10 g protein and 5 g fat raises the total from 165 to 235 kcal.' },
    ],
    sources: [{ label: 'FAO: Food energy, methods of analysis and conversion factors (Atwater factors)', url: 'https://www.fao.org/4/y5022e/y5022e00.htm' }],
  },
  related: ['macro', 'protein', 'calories-burned'],
  examples: [
    // 4x20 = 80; 4x10 = 40; 9x5 = 45; total 165; shares 80/165, 40/165, 45/165
    { values: { carbs: 20, protein: 10, fat: 5 }, expect: { kcal: 165, carbPct: 80 / 165, proteinPct: 40 / 165, fatPct: 45 / 165 }, tolerance: 1e-9 },
    // add 10 g alcohol: 165 + 7x10 = 235
    { values: { carbs: 20, protein: 10, fat: 5, alcohol: 10 }, expect: { kcal: 235 }, tolerance: 1e-9 },
    // 4x25 = 100; 4x5 = 20; 9x6 = 54; total 174; 174 - 150 = 24; 24/150 = 0.16
    { values: { carbs: 25, protein: 5, fat: 6, label: 150 }, expect: { kcal: 174, diff: 24, diffPct: 0.16 }, tolerance: 1e-9 },
  ],
});
