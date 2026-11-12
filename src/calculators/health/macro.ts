import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Percent of calories from [protein, carbs, fat].
const SPLITS: Record<string, { label: string; p: number; c: number; f: number }> = {
  maintain: { label: 'Maintain weight (30 / 40 / 30)', p: 30, c: 40, f: 30 },
  lose: { label: 'Lose fat (40 / 30 / 30)', p: 40, c: 30, f: 30 },
  gain: { label: 'Build muscle (30 / 45 / 25)', p: 30, c: 45, f: 25 },
  endurance: { label: 'Endurance training (20 / 55 / 25)', p: 20, c: 55, f: 25 },
  lowcarb: { label: 'Low carb (30 / 20 / 50)', p: 30, c: 20, f: 50 },
  keto: { label: 'Keto (20 / 5 / 75)', p: 20, c: 5, f: 75 },
};
const CUSTOM = { input: 'goal', is: 'custom' };

export default defineCalculator({
  slug: 'macro',
  title: 'Macro Calculator',
  category: 'health',
  description: 'Split a daily calorie target into grams of protein, carbohydrate and fat for your goal.',
  keywords: ['macros', 'macronutrients', 'IIFYM', 'protein carbs fat', 'keto macros', 'macro split'],
  popular: true,
  inputs: [
    { id: 'calories', label: 'Daily calories', type: 'number', suffix: 'kcal', default: 2200, min: 800, step: 50, help: 'Not sure? Use the TDEE calculator first.', info: 'Your daily calorie target. Use your maintenance calories from the TDEE calculator, minus a deficit to lose weight or plus a surplus to gain.' },
    {
      id: 'goal',
      label: 'Goal / diet style',
      type: 'select',
      default: 'maintain',
      options: [...Object.entries(SPLITS).map(([value, s]) => ({ value, label: s.label })), { value: 'custom', label: 'Custom split' }],
      info: 'Each preset is a percentage split of calories as protein / carbs / fat. Choose “Custom split” to enter your own.',
    },
    { id: 'pPct', label: 'Protein', type: 'number', suffix: '% of kcal', default: 30, min: 0, max: 100, showWhen: CUSTOM, info: 'Share of calories from protein. 10–35% is the usual range for adults; higher helps preserve muscle when dieting.' },
    { id: 'cPct', label: 'Carbohydrates', type: 'number', suffix: '% of kcal', default: 40, min: 0, max: 100, showWhen: CUSTOM, info: 'Share of calories from carbohydrate. Guidelines suggest 45–65%; low-carb diets go much lower.' },
    { id: 'fPct', label: 'Fat', type: 'number', suffix: '% of kcal', default: 30, min: 0, max: 100, showWhen: CUSTOM, info: 'Share of calories from fat. Guidelines suggest 20–35%. The three percentages must add up to 100.' },
    { id: 'meals', label: 'Meals per day', type: 'number', default: 3, min: 1, max: 8, step: 1, info: 'How many meals (or meals plus snacks) you split the day into. Used only for the per-meal figure.' },
  ],
  outputs: [
    { id: 'summary', label: 'Daily macros', primary: true, format: 'text', info: 'Your daily targets in grams for protein, carbohydrate and fat, rounded to whole grams.' },
    { id: 'protein', label: 'Protein', precision: 0, suffix: 'g/day', info: 'Protein supplies 4 kcal per gram. Grams = calories × protein % ÷ 4.' },
    { id: 'carbs', label: 'Carbohydrates', precision: 0, suffix: 'g/day', info: 'Carbohydrate supplies 4 kcal per gram. US labels include fiber in total carbs.' },
    { id: 'fat', label: 'Fat', precision: 0, suffix: 'g/day', info: 'Fat supplies 9 kcal per gram, so the same calories mean fewer grams.' },
    { id: 'perMeal', label: 'Per meal', format: 'text', info: 'Daily grams divided evenly across your meals (P = protein, C = carbs, F = fat).' },
  ],
  compute: (v) => {
    const kcal = num(v.calories);
    const meals = num(v.meals) ?? 3;
    let s: { p: number; c: number; f: number } | undefined = SPLITS[String(v.goal)];
    if (v.goal === 'custom') {
      const p = num(v.pPct);
      const c = num(v.cPct);
      const f = num(v.fPct);
      if (p === null || c === null || f === null || p < 0 || c < 0 || f < 0) return { summary: null };
      if (Math.abs(p + c + f - 100) > 0.5) return { summary: null, error: `Your percentages add up to ${+(p + c + f).toFixed(1)}% — they need to total 100%.` };
      s = { p, c, f };
    }
    if (!kcal || kcal <= 0 || !s || meals < 1) return { summary: null };
    const protein = (kcal * s.p) / 100 / 4;
    const carbs = (kcal * s.c) / 100 / 4;
    const fat = (kcal * s.f) / 100 / 9;
    const g = (x: number) => `${Math.round(x)} g`;
    const n = Math.round(meals);
    return {
      summary: `${g(protein)} protein · ${g(carbs)} carbs · ${g(fat)} fat`,
      protein,
      carbs,
      fat,
      perMeal: `${g(protein / n)} P · ${g(carbs / n)} C · ${g(fat / n)} F`,
      chart: [
        {
          type: 'donut',
          title: 'Calories by macronutrient',
          slices: [
            { label: 'Protein', value: protein * 4 },
            { label: 'Carbs', value: carbs * 4 },
            { label: 'Fat', value: fat * 9 },
          ],
          format: { format: 'integer', suffix: 'kcal' },
          centerValue: Math.round(kcal).toLocaleString('en-US'),
          centerLabel: 'kcal/day',
        },
        {
          type: 'bar',
          title: 'Grams per day',
          categories: ['Protein', 'Carbs', 'Fat'],
          series: [{ name: 'Grams', values: [protein, carbs, fat] }],
          format: { format: 'integer', suffix: 'g' },
        },
      ],
      steps: [
        `Protein: ${kcal} × ${s.p}% ÷ 4 kcal/g = ${protein.toFixed(1)} g`,
        `Carbs: ${kcal} × ${s.c}% ÷ 4 kcal/g = ${carbs.toFixed(1)} g`,
        `Fat: ${kcal} × ${s.f}% ÷ 9 kcal/g = ${fat.toFixed(1)} g`,
      ],
      note: kcal < 1200 ? 'Intakes under 1,200 kcal/day are hard to make nutritionally complete — consider professional guidance.' : undefined,
    };
  },
  content: {
    formula: ['Protein g = calories × protein% ÷ 4', 'Carbs g = calories × carb% ÷ 4', 'Fat g = calories × fat% ÷ 9'],
    body: [
      'Macronutrients are the three nutrients that supply calories: protein and carbohydrate provide about 4 kcal per gram and fat about 9 kcal per gram. Once you know your calorie target, choosing a percentage split turns it into gram targets you can track on a food label or app.',
      'The presets are common starting points rather than rules. Higher protein helps preserve muscle while dieting and keeps you fuller; more carbohydrate supports hard or long training; low-carb and keto splits trade carbohydrate for fat. All of them fall within or near the broad ranges health authorities consider acceptable for adults (10–35% protein, 45–65% carbs and 20–35% fat), except the deliberately low-carb options.',
      'Hitting your calorie total consistently matters more for weight change than the exact split. Pick a split you can stick to, track for a couple of weeks, and adjust. This is general information, not medical or dietetic advice.',
    ],
    faq: [
      { q: 'Does alcohol count toward my macros?', a: 'Alcohol provides about 7 kcal per gram but is not one of the three macronutrients. If you drink, those calories come out of your total, usually by trimming carbs or fat.' },
      { q: 'Should I count fiber as carbohydrate?', a: 'Labels in the US include fiber in total carbohydrate. Fiber provides fewer usable calories, so some people track "net carbs", but for most goals counting total carbs is simpler and fine.' },
    ],
  },
  related: ['tdee', 'protein', 'bmr', 'weight-loss-goal', 'calories-burned'],
  examples: [
    { values: { calories: 2000, goal: 'maintain', pPct: null, cPct: null, fPct: null, meals: 3 }, expect: { protein: 150, carbs: 200, fat: 66.6667, summary: '150 g protein · 200 g carbs · 67 g fat' }, tolerance: 1e-4 },
    { values: { calories: 1800, goal: 'keto', pPct: null, cPct: null, fPct: null, meals: 3 }, expect: { protein: 90, carbs: 22.5, fat: 150 }, tolerance: 1e-6 },
    { values: { calories: 2400, goal: 'custom', pPct: 25, cPct: 50, fPct: 25, meals: 4 }, expect: { protein: 150, carbs: 300, fat: 66.6667 }, tolerance: 1e-4 },
  ],
});
