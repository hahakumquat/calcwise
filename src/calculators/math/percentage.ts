import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

const pie = (part: number, whole: number): ChartSpec | undefined =>
  whole > 0 && part >= 0 && part <= whole
    ? { type: 'donut', title: 'Part of the whole', slices: [{ label: 'Part', value: part }, { label: 'Rest', value: whole - part }], centerValue: `${+((part / whole) * 100).toFixed(2)}%`, centerLabel: 'of the whole' }
    : { type: 'bar', title: 'Part vs whole', categories: ['Whole', 'Part'], series: [{ name: 'Value', values: [whole, part] }] };

export default defineCalculator({
  slug: 'percentage',
  title: 'Percentage Calculator',
  category: 'math',
  description: 'Find what P% of a number is, what percent one number is of another, or the whole from a part.',
  keywords: ['percent', 'percent of', 'what percent', '% of'],
  popular: true,
  inputs: [
    {
      id: 'mode',
      label: 'Question',
      type: 'select',
      default: 'of',
      options: [
        { value: 'of', label: 'What is P% of X?' },
        { value: 'is', label: 'Y is what % of X?' },
        { value: 'whole', label: 'Y is P% of what?' },
      ],
      info: 'Choose the kind of percentage question you are asking; the fields below change to match.',
    },
    { id: 'p', label: 'Percentage (P)', type: 'number', suffix: '%', default: 15, info: 'The percent value, e.g. 15 for 15%.', showWhen: { input: 'mode', is: ['of', 'whole'] } },
    { id: 'x', label: 'Number (X)', type: 'number', default: 80, info: 'The whole amount you are taking a percentage of.', showWhen: { input: 'mode', is: ['of', 'is'] } },
    { id: 'y', label: 'Part (Y)', type: 'number', default: 12, info: 'The part of the whole you already know.', showWhen: { input: 'mode', is: ['is', 'whole'] } },
  ],
  outputs: [{ id: 'result', label: 'Answer', primary: true, format: 'number', precision: 6, info: 'The missing value for the question you picked. Expand “Show the working” to see each step.' }],
  compute: (v) => {
    const p = num(v.p);
    const x = num(v.x);
    const y = num(v.y);
    if (v.mode === 'of') {
      if (p === null || x === null) return { result: null };
      return { result: (p / 100) * x, chart: pie((p / 100) * x, x), steps: [`${p}% × ${x} = ${p} ÷ 100 × ${x}`, `= ${(p / 100) * x}`] };
    }
    if (v.mode === 'is') {
      if (y === null || x === null || x === 0) return { result: null };
      const r = (y / x) * 100;
      return { result: `${+r.toFixed(6)}%`, chart: pie(y, x), steps: [`${y} ÷ ${x} × 100 = ${+r.toFixed(6)}%`] };
    }
    if (p === null || y === null || p === 0) return { result: null };
    return { result: y / (p / 100), chart: pie(y, y / (p / 100)), steps: [`${y} ÷ (${p} ÷ 100) = ${y / (p / 100)}`] };
  },
  content: {
    formula: ['P% of X = (P ÷ 100) × X', 'Y as a % of X = (Y ÷ X) × 100', 'Whole = Y ÷ (P ÷ 100)'],
    body: [
      'A percentage is a fraction with 100 as its denominator: "15 percent" literally means 15 per hundred. That is why every percentage problem comes down to multiplying or dividing by 100.',
      'Pick the question that matches yours. The calculator only needs the two numbers that question uses, and shows the arithmetic so you can check it by hand.',
    ],
    faq: [
      { q: 'How do I calculate 20% of a number in my head?', a: 'Find 10% by moving the decimal point one place left, then double it. 20% of 85 is 8.5 × 2 = 17.' },
      { q: 'Is X% of Y the same as Y% of X?', a: 'Yes. Multiplication is commutative, so 8% of 50 equals 50% of 8 — both are 4. This trick often makes mental math easier.' },
    ],
  },
  related: ['percentage-change', 'percent-error', 'fraction'],
  examples: [
    { values: { mode: 'of', p: 15, x: 80, y: null }, expect: { result: 12 } },
    { values: { mode: 'whole', p: 25, x: null, y: 10 }, expect: { result: 40 } },
  ],
});
