import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const CUP_ML = 236.5882365;

// Approximate grams per US cup (spooned and levelled for dry goods).
const INGREDIENTS: { value: string; label: string; gPerCup: number }[] = [
  { value: 'flour', label: 'All-purpose flour', gPerCup: 125 },
  { value: 'bread-flour', label: 'Bread flour', gPerCup: 130 },
  { value: 'ww-flour', label: 'Whole wheat flour', gPerCup: 120 },
  { value: 'sugar', label: 'Granulated sugar', gPerCup: 200 },
  { value: 'brown-sugar', label: 'Brown sugar (packed)', gPerCup: 220 },
  { value: 'powdered-sugar', label: 'Powdered sugar', gPerCup: 120 },
  { value: 'butter', label: 'Butter', gPerCup: 227 },
  { value: 'oil', label: 'Vegetable oil', gPerCup: 218 },
  { value: 'water', label: 'Water', gPerCup: 236.6 },
  { value: 'milk', label: 'Milk', gPerCup: 242 },
  { value: 'cream', label: 'Heavy cream', gPerCup: 238 },
  { value: 'yogurt', label: 'Plain yogurt', gPerCup: 245 },
  { value: 'honey', label: 'Honey', gPerCup: 340 },
  { value: 'maple', label: 'Maple syrup', gPerCup: 315 },
  { value: 'rice', label: 'White rice (uncooked)', gPerCup: 185 },
  { value: 'oats', label: 'Rolled oats', gPerCup: 90 },
  { value: 'cocoa', label: 'Cocoa powder', gPerCup: 85 },
  { value: 'cornstarch', label: 'Cornstarch', gPerCup: 120 },
  { value: 'salt', label: 'Table salt', gPerCup: 288 },
  { value: 'peanut-butter', label: 'Peanut butter', gPerCup: 256 },
  { value: 'chocolate-chips', label: 'Chocolate chips', gPerCup: 170 },
];
const COMPARE = ['flour', 'sugar', 'butter', 'water', 'honey', 'oats'];

// Volume units in mL, mass units in g.
const UNITS: Record<string, { label: string; ml?: number; g?: number }> = {
  cup: { label: 'cups', ml: CUP_ML },
  tbsp: { label: 'tbsp', ml: CUP_ML / 16 },
  tsp: { label: 'tsp', ml: CUP_ML / 48 },
  floz: { label: 'fl oz', ml: CUP_ML / 8 },
  ml: { label: 'mL', ml: 1 },
  l: { label: 'L', ml: 1000 },
  g: { label: 'g', g: 1 },
  kg: { label: 'kg', g: 1000 },
  oz: { label: 'oz', g: 28.349523125 },
  lb: { label: 'lb', g: 453.59237 },
};
const UNIT_OPTIONS = Object.entries(UNITS).map(([value, u]) => ({ value, label: u.label }));

/** Round to a sensible number of digits for kitchen use. */
function nice(x: number): string {
  const d = x >= 100 ? 0 : x >= 10 ? 1 : 2;
  return String(+x.toFixed(d));
}

export default defineCalculator({
  slug: 'cooking-converter',
  title: 'Cups to Grams Converter',
  category: 'food',
  description: 'Convert cups, tablespoons and teaspoons to grams and ounces (and back) for flour, sugar, butter and other common ingredients.',
  keywords: ['cups to grams', 'grams to cups', 'baking conversion', 'cooking measurement converter', 'tbsp to grams', 'flour cups to grams'],
  inputs: [
    { id: 'ingredient', label: 'Ingredient', type: 'select', default: 'flour', options: INGREDIENTS.map((i) => ({ value: i.value, label: i.label })), info: 'Each ingredient has its own density, so a cup of one weighs differently from a cup of another.' },
    { id: 'amount', label: 'Amount', type: 'number', default: 1, min: 0, step: 0.25, info: 'How much you have or the recipe calls for, in the “From” unit. Decimals work: 0.5 for half a cup.' },
    { id: 'from', label: 'From', type: 'select', default: 'cup', options: UNIT_OPTIONS, info: 'The unit your recipe uses. Cups and spoons are US customary measures.' },
    { id: 'to', label: 'To', type: 'select', default: 'g', options: UNIT_OPTIONS, info: 'The unit you want. Pick a weight unit to use a kitchen scale, or a volume unit for measuring cups.' },
  ],
  outputs: [
    { id: 'result', label: 'Converted amount', primary: true, format: 'text', info: 'Your amount in the target unit, rounded for kitchen use.' },
    { id: 'value', label: 'Value', precision: 3, info: 'The same result as a plain number with more decimal places.' },
    { id: 'grams', label: 'Weight', precision: 1, suffix: 'g', info: 'The weight of your amount in grams — the most accurate way to measure dry ingredients.' },
    { id: 'cups', label: 'Volume', precision: 3, suffix: 'US cups', info: 'The volume of your amount in US cups (236.6 mL each).' },
  ],
  compute: (v) => {
    const amt = num(v.amount);
    const ing = INGREDIENTS.find((i) => i.value === v.ingredient);
    const from = UNITS[String(v.from)];
    const to = UNITS[String(v.to)];
    if (amt === null || amt < 0 || !ing || !from || !to) return { result: null };
    const gPerMl = ing.gPerCup / CUP_ML;
    const grams = from.g !== undefined ? amt * from.g : amt * from.ml! * gPerMl;
    const ml = grams / gPerMl;
    const value = to.g !== undefined ? grams / to.g : ml / to.ml!;
    const cmp = [ing, ...INGREDIENTS.filter((i) => COMPARE.includes(i.value) && i.value !== ing.value)];
    return {
      result: `${nice(value)} ${to.label}`,
      value,
      grams,
      cups: ml / CUP_ML,
      chart: {
        type: 'bar',
        title: `Weight of ${nice(ml / CUP_ML)} cups of different ingredients`,
        categories: cmp.map((i) => i.label),
        series: [{ name: 'Weight', values: cmp.map((i) => (ml / CUP_ML) * i.gPerCup) }],
        format: { suffix: 'g' },
        horizontal: true,
        highlight: 0,
      },
      steps: [`1 US cup of ${ing.label.toLowerCase()} ≈ ${ing.gPerCup} g`, `${amt} ${from.label} = ${grams.toFixed(1)} g = ${(ml / CUP_ML).toFixed(3)} cups`],
      note: 'Dry ingredients vary with how they are packed — weighing is always more accurate than measuring by volume.',
    };
  },
  content: {
    formula: ['grams = cups × grams-per-cup (ingredient density)', '1 US cup = 16 tbsp = 48 tsp = 8 fl oz ≈ 236.6 mL'],
    body: [
      'Volume and weight are not interchangeable: a cup of flour weighs about half as much as a cup of sugar, and a cup of honey weighs nearly three times as much as a cup of oats. To convert between them you need the density of the specific ingredient, which this tool looks up for you.',
      'The figures assume US customary cups and spoons, with dry ingredients spooned into the cup and levelled off. Scooping flour straight from the bag packs it down and can add 20% or more, which is one of the most common reasons baked goods turn out dry. Brown sugar is the exception — recipes expect it firmly packed.',
      'For the most consistent baking, use a kitchen scale. Many professional recipes are written in grams for exactly this reason, and converting your favourite recipes once makes them far more repeatable.',
    ],
    faq: [
      { q: 'How many grams are in a cup of flour?', a: 'About 120–130 g for all-purpose flour that is spooned and levelled. This converter uses 125 g. A packed or scooped cup can reach 150 g.' },
      { q: 'Is a UK or metric cup the same as a US cup?', a: 'Not quite. A metric cup (used in Australia, Canada and elsewhere) is 250 mL, slightly larger than the 236.6 mL US cup. For most recipes the difference is small, but it adds up in large batches.' },
      { q: 'How much does a stick of butter weigh?', a: 'One US stick is ½ cup, 8 tablespoons or about 113 g.' },
    ],
  },
  related: ['recipe-scaler', 'macro', 'percentage'],
  examples: [
    { values: { ingredient: 'flour', amount: 1, from: 'cup', to: 'g' }, expect: { value: 125, result: '125 g' }, tolerance: 1e-9 },
    { values: { ingredient: 'sugar', amount: 100, from: 'g', to: 'tbsp' }, expect: { value: 8, result: '8 tbsp', cups: 0.5 }, tolerance: 1e-9 },
    { values: { ingredient: 'butter', amount: 8, from: 'tbsp', to: 'g' }, expect: { value: 113.5, result: '114 g' }, tolerance: 1e-9 },
  ],
});
