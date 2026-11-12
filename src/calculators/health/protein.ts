import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// [low, high] grams of protein per kg of body weight per day.
const LEVELS: Record<string, { label: string; short: string; range: [number, number] }> = {
  sedentary: { label: 'Sedentary adult (RDA)', short: 'Sedentary', range: [0.8, 1.0] },
  active: { label: 'Regular exercise', short: 'Regular exercise', range: [1.1, 1.4] },
  endurance: { label: 'Endurance training', short: 'Endurance', range: [1.2, 1.6] },
  strength: { label: 'Strength training / building muscle', short: 'Strength', range: [1.6, 2.2] },
  cutting: { label: 'Losing fat while keeping muscle', short: 'Fat loss', range: [1.8, 2.4] },
  older: { label: 'Adult over 65', short: 'Over 65', range: [1.0, 1.2] },
};

export default defineCalculator({
  slug: 'protein',
  title: 'Protein Intake Calculator',
  category: 'health',
  description: 'Find how many grams of protein you need per day based on your weight and activity.',
  keywords: ['daily protein', 'how much protein', 'protein per day', 'grams of protein', 'protein requirement'],
  inputs: [
    { id: 'weight', label: 'Body weight', type: 'number', unit: 'mass', units: ['kg', 'lb', 'st'], defaultUnit: 'lb', default: 170, info: 'Your current weight. If you carry a lot of excess fat, entering your goal weight gives a more realistic target.' },
    {
      id: 'level',
      label: 'Activity / goal',
      type: 'select',
      default: 'active',
      options: Object.entries(LEVELS).map(([value, l]) => ({ value, label: `${l.label} — ${l.range[0]}–${l.range[1]} g/kg` })),
      info: 'Pick what best describes your training. Each option has a research-based range in grams of protein per kg of body weight.',
    },
    { id: 'meals', label: 'Meals per day', type: 'number', default: 4, min: 1, max: 8, step: 1, info: 'How many protein-containing meals you eat. 3–5 meals of 20–40 g each works well for most people.' },
  ],
  outputs: [
    { id: 'protein', label: 'Daily protein (midpoint)', primary: true, precision: 0, suffix: 'g/day', info: 'The middle of the recommended range for your weight and activity level.' },
    { id: 'range', label: 'Recommended range', format: 'text', info: 'The low and high end of the range for your activity level. Anywhere inside it is reasonable.' },
    { id: 'perMeal', label: 'Per meal', precision: 0, suffix: 'g', info: 'The daily midpoint split evenly across your meals.' },
    { id: 'calories', label: 'Calories from protein', precision: 0, suffix: 'kcal', info: 'Protein supplies about 4 kcal per gram, so this is daily grams × 4.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const lvl = LEVELS[String(v.level)];
    const meals = num(v.meals) ?? 4;
    if (!kg || kg <= 0 || !lvl || meals < 1) return { protein: null };
    const [lo, hi] = lvl.range;
    const mid = (lo + hi) / 2;
    const protein = kg * mid;
    const keys = Object.keys(LEVELS);
    return {
      protein,
      range: `${Math.round(kg * lo)}–${Math.round(kg * hi)} g/day`,
      perMeal: protein / Math.round(meals),
      calories: protein * 4,
      chart: {
        type: 'bar',
        title: 'Daily protein by activity level (midpoint)',
        horizontal: true,
        categories: keys.map((k) => LEVELS[k].short),
        series: [{ name: 'Protein', values: keys.map((k) => (kg * (LEVELS[k].range[0] + LEVELS[k].range[1])) / 2) }],
        format: { format: 'integer', suffix: 'g' },
        highlight: keys.indexOf(String(v.level)),
      },
      steps: [`${kg.toFixed(1)} kg × ${mid.toFixed(2)} g/kg = ${protein.toFixed(0)} g/day`],
      note: 'People with kidney disease should follow their doctor’s protein advice. Not medical advice.',
    };
  },
  content: {
    formula: ['Protein (g/day) = body weight (kg) × g/kg factor', 'g/kg factor depends on activity and goal (0.8 – 2.4)'],
    body: [
      'Protein supplies the amino acids your body uses to build and repair muscle, skin, enzymes and hormones. The official Recommended Dietary Allowance for adults is 0.8 g per kilogram of body weight — enough to prevent deficiency in most sedentary people, but not necessarily optimal for active ones.',
      'Research on athletes supports higher intakes: roughly 1.2–1.6 g/kg for endurance training and 1.6–2.2 g/kg for building muscle. During a calorie deficit, even higher intakes help preserve lean tissue. Older adults also benefit from a little more than the RDA to slow age-related muscle loss.',
      'Spreading protein over several meals of roughly 20–40 g each appears to support muscle growth better than eating it all at once. If you carry a lot of excess body fat, using your goal weight instead of current weight gives a more realistic target.',
    ],
    faq: [
      { q: 'Is a high-protein diet safe?', a: 'For healthy adults, intakes up to about 2 g/kg appear safe in long-term studies. People with kidney disease need individual advice because their kidneys may not handle extra protein well.' },
      { q: 'How much protein is in common foods?', a: 'Roughly: 100 g cooked chicken breast ≈ 31 g, one large egg ≈ 6 g, 170 g Greek yogurt ≈ 17 g, 100 g cooked lentils ≈ 9 g, 100 g firm tofu ≈ 15 g.' },
    ],
  },
  related: ['macro', 'tdee', 'bmr', 'one-rep-max', 'body-fat'],
  examples: [
    { values: { weight: 70, level: 'sedentary', meals: 3 }, expect: { protein: 63, range: '56–70 g/day', perMeal: 21 }, tolerance: 1e-6 },
    { values: { weight: 80, level: 'strength', meals: 4 }, expect: { protein: 152, calories: 608 }, tolerance: 1e-6 },
  ],
});
