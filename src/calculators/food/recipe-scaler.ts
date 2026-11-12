import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4, '⅕': 1 / 5, '⅖': 2 / 5, '⅗': 3 / 5, '⅘': 4 / 5,
  '⅙': 1 / 6, '⅚': 5 / 6, '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8,
};
const UF = Object.keys(UNICODE_FRACTIONS).join('');

// One quantity: "1 1/2", "1½", "1/2", "½", "1.5", "2"
const QTY = `(?:\\d+\\s+\\d+\\/\\d+|\\d+\\s*[${UF}]|\\d+\\/\\d+|[${UF}]|\\d*\\.\\d+|\\d+)`;
const LEAD = new RegExp(`^(\\s*)(${QTY})(?:\\s*(?:-|–|to)\\s*(${QTY}))?(?=\\s|[a-zA-Z]|$)`);

function parseQty(s: string): number | null {
  s = s.trim();
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[3] ? +m[1] + +m[2] / +m[3] : null;
  m = s.match(new RegExp(`^(\\d+)\\s*([${UF}])$`));
  if (m) return +m[1] + UNICODE_FRACTIONS[m[2]];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[2] ? +m[1] / +m[2] : null;
  if (s in UNICODE_FRACTIONS) return UNICODE_FRACTIONS[s];
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Format as a kitchen-friendly mixed fraction (halves, thirds, quarters, eighths) or a short decimal. */
function fmtQty(x: number): string {
  if (x <= 0) return '0';
  const whole = Math.floor(x + 1e-9);
  const frac = x - whole;
  if (frac < 0.02) return String(whole);
  if (frac > 0.98) return String(whole + 1);
  for (const den of [2, 3, 4, 8]) {
    const n = Math.round(frac * den);
    if (n > 0 && n < den && Math.abs(frac - n / den) < 0.02) {
      const g = n % 2 === 0 && den % 2 === 0 ? (n % 4 === 0 && den % 4 === 0 ? 4 : 2) : 1;
      const f = `${n / g}/${den / g}`;
      return whole ? `${whole} ${f}` : f;
    }
  }
  return String(+x.toFixed(2));
}

function scaleLine(line: string, factor: number): string {
  const m = line.match(LEAD);
  if (!m) return line;
  const a = parseQty(m[2]);
  if (a === null) return line;
  const b = m[3] ? parseQty(m[3]) : null;
  const scaled = b !== null ? `${fmtQty(a * factor)}–${fmtQty(b * factor)}` : fmtQty(a * factor);
  const rest = line.slice(m[0].length);
  return `${m[1]}${scaled}${rest && !/^\s/.test(rest) ? ' ' : ''}${rest}`;
}

export default defineCalculator({
  slug: 'recipe-scaler',
  title: 'Recipe Scaler',
  category: 'food',
  description: 'Scale a recipe up or down to any number of servings — paste the ingredient list and get adjusted quantities with tidy fractions.',
  keywords: ['recipe converter', 'scale recipe', 'double a recipe', 'halve a recipe', 'servings calculator', 'recipe resizer'],
  layout: 'wide',
  inputs: [
    { id: 'original', label: 'Original servings', type: 'number', default: 4, min: 0.25, step: 1, info: 'How many servings the recipe makes as written — usually stated near the title ("Serves 4").' },
    { id: 'desired', label: 'Servings you want', type: 'number', default: 6, min: 0.25, step: 1, info: 'How many servings you want to make. Use a smaller number to scale the recipe down.' },
    {
      id: 'recipe',
      label: 'Ingredients (one per line)',
      type: 'textarea',
      rows: 10,
      default: '2 cups all-purpose flour\n1 1/2 tsp baking powder\n1/2 tsp salt\n3/4 cup sugar\n2 eggs\n1 cup milk\n4 tbsp butter, melted\n1 tsp vanilla extract\nPinch of cinnamon',
      placeholder: '2 cups flour\n1 1/2 tsp salt\n½ cup sugar',
      help: 'Quantities at the start of each line are scaled. Whole numbers, decimals, fractions (1/2, 1 1/2, ½) and ranges (2-3) are understood.',
      info: 'Paste the ingredient list with one ingredient per line. Only the number at the start of each line changes; units and descriptions are kept.',
    },
  ],
  outputs: [
    { id: 'scaled', label: 'Scaled ingredients', primary: true, format: 'code', info: 'Your ingredient list with each leading quantity multiplied by the scale factor and rounded to measurable fractions.' },
    { id: 'factor', label: 'Scale factor', precision: 4, suffix: '×', info: 'Desired servings divided by original servings. 2 means double, 0.5 means halve.' },
  ],
  compute: (v) => {
    const o = num(v.original);
    const d = num(v.desired);
    const text = typeof v.recipe === 'string' ? v.recipe : '';
    if (!o || !d || o <= 0 || d <= 0) return { scaled: null, error: 'Enter positive numbers of servings.' };
    const factor = d / o;
    if (!text.trim()) return { scaled: '', factor, chart: { type: 'bar', title: 'Servings', categories: ['Original', 'Scaled'], series: [{ name: 'Servings', values: [o, d] }] } };
    const lines = text.split(/\r?\n/);
    const items = lines
      .map((l) => {
        const m = l.match(LEAD);
        const qty = m ? parseQty(m[2]) : null;
        const name = m ? l.slice(m[0].length).trim().replace(/,.*$/, '') : '';
        return qty === null ? null : { qty, name: name.length > 22 ? name.slice(0, 21) + '…' : name || '(item)' };
      })
      .filter((x): x is { qty: number; name: string } => x !== null)
      .slice(0, 12);
    const unscaled = lines.filter((l) => l.trim() && !LEAD.test(l)).length;
    return {
      scaled: lines.map((l) => scaleLine(l, factor)).join('\n'),
      factor,
      chart: {
        type: 'bar',
        title: 'Original vs scaled quantities',
        categories: items.map((i) => i.name),
        series: [
          { name: 'Original', values: items.map((i) => i.qty) },
          { name: 'Scaled', values: items.map((i) => i.qty * factor) },
        ],
        horizontal: true,
      },
      steps: [`Scale factor = ${d} ÷ ${o} = ${+factor.toFixed(4)}`],
      note: unscaled ? `${unscaled} line${unscaled === 1 ? '' : 's'} without a leading quantity ${unscaled === 1 ? 'was' : 'were'} left unchanged. Adjust baking times and pan sizes by eye.` : 'Baking times and pan sizes may need adjusting when you change quantities a lot.',
    };
  },
  content: {
    formula: ['Scale factor = desired servings ÷ original servings', 'New quantity = original quantity × scale factor'],
    body: [
      'Scaling a recipe means multiplying every ingredient by the same factor: the servings you want divided by the servings the recipe makes. Paste the ingredient list, one item per line, and the scaler multiplies the number at the start of each line, keeping the unit and description as written.',
      'Results are rounded to fractions you can actually measure — halves, thirds, quarters and eighths — or to two decimals when no simple fraction fits. Lines without a leading number, such as "pinch of salt" or "oil for frying", are left as they are for you to judge.',
      'Most savoury dishes scale well. Baking is less forgiving: leavening, salt and spices sometimes need a little less than straight multiplication when you double or triple a recipe, and larger batches may need a different pan size and a longer, lower bake. Eggs are easiest to round to whole numbers, or beat them and measure by weight (about 50 g per large egg without the shell).',
    ],
    faq: [
      { q: 'How do I halve a recipe with 3 eggs?', a: 'The scaler will show 1 1/2 eggs. Beat 2 eggs together and use about three-quarters of the mixture, or use 1 egg plus 1 egg yolk.' },
      { q: 'Can I convert the units too?', a: 'This tool keeps your original units. To switch between cups and grams, use the cups-to-grams converter after scaling.' },
    ],
  },
  related: ['cooking-converter', 'percentage', 'macro'],
  examples: [
    {
      values: { original: 4, desired: 6, recipe: '2 cups flour\n1 1/2 tsp salt\n1/2 cup sugar\n3 eggs\nPinch of nutmeg' },
      expect: { factor: 1.5, scaled: '3 cups flour\n2 1/4 tsp salt\n3/4 cup sugar\n4 1/2 eggs\nPinch of nutmeg' },
    },
    { values: { original: 6, desired: 2, recipe: '1 cup milk\n2-3 cloves garlic\n½ tsp pepper\n1.5 kg potatoes' }, expect: { scaled: '1/3 cup milk\n2/3–1 cloves garlic\n0.17 tsp pepper\n1/2 kg potatoes' } },
  ],
});
