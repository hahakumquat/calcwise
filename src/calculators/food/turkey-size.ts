import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'turkey-size',
  title: 'Turkey Size and Thaw Time Calculator',
  category: 'food',
  description: 'Work out how many pounds of turkey to buy for your guests and how many days to thaw it in the fridge, from adults, children and your own portion sizes.',
  keywords: ['how big a turkey do i need', 'turkey size per person', 'how much turkey per person', 'turkey thaw time', 'what size turkey for guests'],
  updated: '2026-11-26',
  inputs: [
    { id: 'adults', label: 'Adults', type: 'number', default: 8, min: 0, step: 1, info: 'Number of adults eating.' },
    { id: 'kids', label: 'Children', type: 'number', default: 4, min: 0, step: 1, info: 'Number of children eating.' },
    { id: 'kidPortion', label: 'Child portion', type: 'number', default: 0.5, min: 0, max: 1, step: 0.1, info: 'How much a child eats compared with an adult, from 0 to 1. 0.5 means half a portion.' },
    { id: 'lbPerAdult', label: 'Turkey per adult', type: 'number', suffix: 'lb', default: 1.5, min: 0.1, step: 0.25, info: 'Your own choice. Many cooks use about 1 lb for no leftovers and 1.5 lb with leftovers. This is a rule of thumb, not a standard.' },
    { id: 'thawRate', label: 'Fridge thaw rate', type: 'number', suffix: 'lb/day', default: 4, min: 0.5, step: 0.5, info: 'Pounds that thaw per day in the fridge. A common guideline is about 4 to 5 lb per 24 hours. Check the label on your bird.' },
  ],
  outputs: [
    { id: 'turkeyLb', label: 'Turkey to buy', format: 'number', precision: 1, suffix: 'lb', primary: true, info: 'Adult-equivalent portions × pounds per adult.' },
    { id: 'thawDays', label: 'Fridge thaw time', format: 'number', precision: 0, suffix: 'days', info: 'Turkey weight ÷ thaw rate, rounded up to whole days.' },
    { id: 'portions', label: 'Adult-equivalent portions', format: 'number', precision: 1, info: 'Adults + children × child portion.' },
    { id: 'thawExact', label: 'Thaw time before rounding', format: 'number', precision: 2, suffix: 'days', info: 'Turkey weight ÷ thaw rate.' },
  ],
  compute: (v) => {
    const a = num(v.adults), k = num(v.kids), kp = num(v.kidPortion), lb = num(v.lbPerAdult), tr = num(v.thawRate);
    if ([a, k, kp, lb, tr].some((x) => x === null)) return { turkeyLb: null };
    if ((a as number) < 0 || (k as number) < 0 || (kp as number) < 0 || (kp as number) > 1 || (lb as number) <= 0 || (tr as number) <= 0) return { turkeyLb: null };
    const portions = (a as number) + (k as number) * (kp as number);
    if (portions <= 0) return { turkeyLb: null };
    const turkeyLb = portions * (lb as number);
    const thawExact = turkeyLb / (tr as number);
    const thawDays = Math.ceil(thawExact - 1e-9);
    return {
      turkeyLb,
      thawDays,
      portions,
      thawExact,
      tone: 'ok',
      badge: 'Rule of thumb',
      note: `Buy about ${fmt(turkeyLb, 1)} lb and move it to the fridge ${thawDays} ${thawDays === 1 ? 'day' : 'days'} before cooking. Portion and thaw rates are rules of thumb, so check your turkey's label.`,
      chart: {
        type: 'donut' as const,
        title: 'Who the turkey feeds (adult portions)',
        slices: [
          { label: 'Adults', value: a as number },
          { label: 'Children', value: (k as number) * (kp as number) },
        ].filter((x) => x.value > 0),
        format: { format: 'number' as const, precision: 1 },
        centerLabel: 'portions',
        centerValue: fmt(portions, 1),
      },
      steps: [
        `Portions: ${fmt(a as number, 0)} + ${fmt(k as number, 0)} × ${fmt(kp as number)} = ${fmt(portions, 2)}`,
        `Turkey: ${fmt(portions, 2)} × ${fmt(lb as number)} lb = ${fmt(turkeyLb, 2)} lb`,
        `Thaw: ${fmt(turkeyLb, 2)} lb ÷ ${fmt(tr as number)} lb/day = ${fmt(thawExact, 2)} days, rounded up to ${thawDays}`,
      ],
    };
  },
  content: {
    formula: [
      'Portions = adults + children × child portion',
      'Turkey to buy = portions × pounds per adult',
      'Thaw days = turkey weight ÷ pounds thawed per day, rounded up',
    ],
    body: [
      'Buying a turkey comes down to two numbers: how big it should be and how early it has to leave the freezer. Enter your adults, children and how much each eats, and this works out both.',
      'The pounds per adult is your choice. Many cooks plan about 1 lb for a meal with no leftovers and 1.5 lb if they want leftovers, because bone and fat make up a big share of the weight. Treat those as rules of thumb, not rules.',
      'For thawing, a common fridge guideline is about 4 to 5 lb per 24 hours, so a bigger bird needs more days. Always check the label and food safety guidance for your turkey. For the cooking schedule, see the turkey cooking time calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How big a turkey do I need for 8 adults and 4 children?', a: 'With a child portion of 0.5 that is 10 adult portions. At 1.5 lb per adult you need a 15 lb turkey, and at 1 lb per adult you need 10 lb.' },
      { q: 'How many days should it thaw?', a: 'At 4 lb per day, a 15 lb turkey needs 3.75 days, which rounds up to 4 days in the fridge. A 2 lb turkey at 5 lb per day needs 0.4 days, so it shows 1 day.' },
      { q: 'Why round the thaw time up?', a: 'A partly frozen turkey cooks unevenly, so an extra day in the fridge is safer than too little.' },
      { q: 'Does this cover cooking time?', a: 'No. Use the turkey cooking time calculator once you know the weight.' },
    ],
    sources: [],
  },
  related: ['turkey-cooking-time', 'party-food-quantity', 'dinner-timeline'],
  examples: [
    // portions = 8+4*0.5 = 10; turkey = 10*1.5 = 15; thaw = 15/4 = 3.75 -> 4
    { values: { adults: 8, kids: 4, kidPortion: 0.5, lbPerAdult: 1.5, thawRate: 4 }, expect: { portions: 10, turkeyLb: 15, thawExact: 3.75, thawDays: 4 }, tolerance: 1e-9 },
    // portions = 2; turkey = 2*1 = 2; thaw = 2/5 = 0.4 -> 1
    { values: { adults: 2, kids: 0, kidPortion: 0.5, lbPerAdult: 1, thawRate: 5 }, expect: { portions: 2, turkeyLb: 2, thawExact: 0.4, thawDays: 1 }, tolerance: 1e-9 },
  ],
});
