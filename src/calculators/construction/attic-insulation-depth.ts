import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'attic-insulation-depth',
  title: 'Attic Insulation Depth Calculator',
  seoTitle: 'Attic Insulation Depth Calculator',
  metaDescription: 'Find how many inches of insulation to add to reach your target R-value, and the cubic feet of loose-fill or batts you need for your attic floor.',
  updated: '2026-11-28',
  category: 'construction',
  description: 'Work out the inches and cubic feet of insulation to add to an attic to reach a target R-value.',
  keywords: ['attic insulation depth', 'how much insulation to add', 'r-value to inches', 'blown in insulation calculator', 'attic r-49', 'add insulation to attic'],
  popular: false,
  inputs: [
    { id: 'area', label: 'Attic floor area', type: 'number', suffix: 'sq ft', default: 1000, min: 0, step: 50, info: 'The floor area you will cover, in square feet.' },
    { id: 'currentDepth', label: 'Current insulation depth', type: 'number', suffix: 'in', default: 4, min: 0, step: 0.5, info: 'Measure with a ruler. Enter 0 if there is none.' },
    { id: 'currentR', label: 'Current R-value per inch', type: 'number', default: 3, min: 0, step: 0.1, info: 'Check the product label or ask your installer. Settled loose-fill is often near 2.5 to 3.5 per inch.' },
    { id: 'targetR', label: 'Target total R-value', type: 'number', default: 49, min: 1, step: 1, info: 'Enter the R-value recommended for your climate and local code.' },
    { id: 'newR', label: 'New material R-value per inch', type: 'number', default: 3.5, min: 0.1, step: 0.1, info: 'Use the figure on the bag or batt label.' },
  ],
  outputs: [
    { id: 'inches', label: 'Inches to add', format: 'number', precision: 1, primary: true, info: 'Missing R-value ÷ new material R per inch.' },
    { id: 'cuft', label: 'Cubic feet to add', format: 'number', precision: 0, info: 'Area × inches to add ÷ 12.' },
    { id: 'existingR', label: 'Existing R-value', format: 'number', precision: 1, info: 'Current depth × current R per inch.' },
    { id: 'missingR', label: 'R-value missing', format: 'number', precision: 1, info: 'Target R minus existing R.' },
    { id: 'totalDepth', label: 'Total depth when done', format: 'number', precision: 1, suffix: 'in', info: 'Current depth plus inches to add.' },
  ],
  compute: (v) => {
    const a = num(v.area);
    const d = num(v.currentDepth);
    const cr = num(v.currentR);
    const t = num(v.targetR);
    const nr = num(v.newR);
    if (a === null || d === null || cr === null || t === null || nr === null) return { inches: null };
    if (a <= 0) return { inches: null, error: 'Enter an attic area above 0.' };
    if (d < 0 || cr < 0) return { inches: null, error: 'Depth and R-value cannot be negative.' };
    if (t <= 0 || nr <= 0) return { inches: null, error: 'Target R-value and new material R per inch must be above 0.' };
    const existingR = d * cr;
    const missingR = t - existingR;
    if (missingR <= 0) {
      return { inches: 0, cuft: 0, existingR, missingR: 0, totalDepth: d, tone: 'ok', badge: 'Already at target', note: `Your existing insulation is about R-${existingR.toFixed(1)}, which already meets R-${t}.` };
    }
    const inches = missingR / nr;
    const cuft = (a * inches) / 12;
    const totalDepth = d + inches;
    return {
      inches,
      cuft,
      existingR,
      missingR,
      totalDepth,
      tone: 'ok',
      badge: `Add ${inches.toFixed(1)} in`,
      chart: {
        type: 'bar',
        title: 'R-value before and after',
        categories: ['Existing', 'Target'],
        series: [{ name: 'R-value', values: [Math.round(existingR * 10) / 10, t] }],
        format: { format: 'number', precision: 1 },
        highlight: 1,
      },
      steps: [
        `Existing R = ${d} in × ${cr} = ${existingR.toFixed(1)}`,
        `Missing R = ${t} − ${existingR.toFixed(1)} = ${missingR.toFixed(1)}`,
        `Inches to add = ${missingR.toFixed(1)} ÷ ${nr} = ${inches.toFixed(2)}`,
        `Cubic feet = ${a} sq ft × ${inches.toFixed(2)} in ÷ 12 = ${cuft.toFixed(0)}`,
      ],
      note: 'R-value per inch varies by product and settles over time; this is an estimate. Bag coverage charts for blown-in insulation are the final word, and air sealing matters as much as depth.',
    };
  },
  content: {
    formula: [
      'Existing R = current depth × current R per inch',
      'Missing R = target R − existing R',
      'Inches to add = missing R ÷ new material R per inch',
      'Cubic feet = area × inches to add ÷ 12',
    ],
    body: [
      'This calculator tells you how deep a new layer of attic insulation needs to be to reach a target R-value, given what is already up there. Enter the target your climate and local code call for; it is not set for you.',
      'For a 1,000 sq ft attic with 4 inches of R-3 per inch insulation, existing R is 12. To reach R-49 you need 37 more R. At R-3.5 per inch that is 10.57 inches, or about 881 cubic feet.',
    ],
    sections: [
      {
        heading: 'Why the numbers are estimates',
        paragraphs: [
          'R-value per inch differs between fiberglass batts, blown fiberglass and cellulose, and loose-fill compresses as it settles. Product bags list a coverage chart that ties bags to area and depth; use it when you buy.',
        ],
      },
    ],
    faq: [
      { q: 'How many inches of insulation do I need for R-49?', a: 'It depends on the product. At R-3.5 per inch, a bare attic needs 49 ÷ 3.5 = 14 inches. This calculator subtracts what you already have.' },
      { q: 'Can I add new insulation on top of old?', a: 'Often yes, if the old layer is dry and not compressed or moldy. Check with an installer or local guidance for your case.' },
      { q: 'How are cubic feet calculated?', a: 'Area in square feet times inches to add, divided by 12. For 1,000 sq ft and 10.57 inches that is about 881 cubic feet.' },
      { q: 'What if I already meet my target?', a: 'The result shows 0 inches to add and says you are already at target.' },
    ],
    sources: [],
  },
  related: ['wall-heat-loss', 'home-energy-credit-payback', 'drywall', 'concrete'],
  examples: [
    // existing 4*3=12; missing 37; 37/3.5=10.5714; cuft 1000*10.5714/12=880.952; total 14.5714
    { values: { area: 1000, currentDepth: 4, currentR: 3, targetR: 49, newR: 3.5 }, expect: { existingR: 12, missingR: 37, inches: 10.5714, cuft: 880.9524, totalDepth: 14.5714 }, tolerance: 0.0001 },
    // none existing: 49/3.5 = 14 in; 500*14/12 = 583.3333
    { values: { area: 500, currentDepth: 0, currentR: 3, targetR: 49, newR: 3.5 }, expect: { inches: 14, cuft: 583.3333 }, tolerance: 0.0001 },
  ],
});
