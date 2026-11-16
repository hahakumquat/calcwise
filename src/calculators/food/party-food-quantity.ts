import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const LB_PER_PERSON = 1; // USDA FSIS "Let's Talk Turkey": allow 1 lb of whole turkey per person
const LB_PER_PERSON_LEFTOVERS = 1.5; // Illinois Extension: about 1.5 lb per person for hearty eaters or leftovers
const KID_PORTION = 0.5; // our own assumption (not from a published guide): a child eats half an adult portion

const r1 = (x: number) => Math.round(x * 10) / 10;

export default defineCalculator({
  slug: 'party-food-quantity',
  title: 'Thanksgiving & Party Food Quantity',
  category: 'food',
  description: 'How much turkey to buy for Thanksgiving or a party, from adults, kids and whether you want leftovers (USDA 1 lb and Extension 1.5 lb per person).',
  keywords: ['how much turkey per person', 'thanksgiving food calculator', 'turkey size calculator', 'how big a turkey do i need', 'turkey per person with leftovers', 'party food quantity'],
  inputs: [
    { id: 'adults', label: 'Adults', type: 'number', default: 10, min: 0, step: 1, info: 'Adults and teens who eat a full portion.' },
    { id: 'kids', label: 'Kids', type: 'number', default: 0, min: 0, step: 1, info: 'Each child counts as half an adult portion (0.5). This is our own assumption, not a published guideline. Set it to 0 and add kids as adults if yours eat a lot.' },
    { id: 'leftovers', label: 'Want leftovers', type: 'toggle', default: false, info: 'Turn on to plan for leftovers or hearty eaters: 1.5 lb of turkey per portion instead of 1 lb.' },
  ],
  outputs: [
    { id: 'turkeyLb', label: 'Whole turkey to buy', primary: true, precision: 1, suffix: 'lb', info: 'Portions × 1 lb (or × 1.5 lb with leftovers). Whole bird weight, bones included.' },
    { id: 'portions', label: 'Adult portions', precision: 1, info: 'Adults + kids × 0.5.' },
    { id: 'perPerson', label: 'Turkey per portion', precision: 1, suffix: 'lb', info: '1 lb per portion, or 1.5 lb with leftovers.' },
  ],
  compute: (v) => {
    const adults = num(v.adults);
    const kids = num(v.kids) ?? 0;
    if (adults === null || adults < 0 || kids < 0) return { turkeyLb: null, error: 'Enter how many adults and kids are coming.' };
    const portions = adults + kids * KID_PORTION;
    if (portions <= 0) return { turkeyLb: null, error: 'Enter at least one guest.' };
    const left = v.leftovers === 'on';
    const per = left ? LB_PER_PERSON_LEFTOVERS : LB_PER_PERSON;
    const lb = portions * per;
    const noLeft = portions * LB_PER_PERSON;
    const withLeft = portions * LB_PER_PERSON_LEFTOVERS;
    return {
      turkeyLb: lb,
      portions,
      perPerson: per,
      tone: 'good',
      badge: left ? `Buy about ${r1(lb)} lb for leftovers` : `Buy about ${r1(lb)} lb`,
      chart: {
        type: 'bar',
        title: 'Whole turkey needed (lb)',
        categories: ['No leftovers', 'With leftovers'],
        series: [{ name: 'Turkey (lb)', values: [noLeft, withLeft] }],
        format: { format: 'number', suffix: ' lb' },
        highlight: left ? 1 : 0,
      },
      steps: [
        `Portions = ${adults} adults + ${kids} kids × ${KID_PORTION} = ${r1(portions)}`,
        `Turkey = ${r1(portions)} × ${per} lb = ${r1(lb)} lb`,
        ...(lb > 24 ? ['That is more than the 24 lb top of the USDA roasting table: consider two smaller birds.'] : []),
      ],
      note: 'Rounded up to the next whole pound when shopping. Turkeys are sold by whole bird weight, bones included.',
    };
  },
  content: {
    formula: ['Portions = adults + kids × 0.5', 'Turkey (lb) = portions × 1 lb, or × 1.5 lb with leftovers'],
    body: [
      'Enter how many adults and kids are coming and whether you want leftovers. The calculator gives the weight of whole turkey to buy. The USDA advises allowing about 1 pound of turkey per person, and Illinois Extension suggests about 1.5 pounds per person for hearty eaters or if you want leftovers.',
      'Kids count as half a portion in this calculator. That 0.5 is our own simple assumption, not a figure from the USDA or Extension, so change the numbers if your kids eat like adults. Ten adults need 10 lb of turkey, or 15 lb if you want leftovers.',
      'This calculator covers the turkey only. We could not verify per-person amounts for side dishes from a USDA, Extension or manufacturer source, so we do not show them rather than guess.',
    ],
    faq: [
      { q: 'How much turkey per person?', a: 'About 1 pound of whole turkey per person (USDA). With leftovers or hearty eaters, plan on about 1.5 pounds per person (Illinois Extension). For 10 adults that is 10 lb, or 15 lb with leftovers.' },
      { q: 'How big a turkey do I need for 10 adults?', a: 'A 10 lb turkey with no leftovers, or a 15 lb turkey if you want leftovers.' },
      { q: 'Do kids count as a full person?', a: 'Here a child counts as half a portion. That is our own assumption. For 8 adults and 4 kids the calculator uses 10 portions: 10 lb, or 15 lb with leftovers.' },
      { q: 'What if I need more than 24 lb?', a: 'The USDA roasting table in our turkey cooking time calculator stops at 24 lb. For larger crowds, two smaller birds usually cook more evenly than one giant one.' },
    ],
    sources: [
      { label: 'USDA FSIS: Let\'s Talk Turkey (allow 1 pound of turkey per person)', url: 'https://www.fsis.usda.gov/sites/default/files/media_file/2021-04/Lets_Talk_Turkey.pdf' },
      { label: 'University of Illinois Extension: Choosing Your Turkey (about 1.5 lb per person for hearty eaters or leftovers)', url: 'https://extension.illinois.edu/turkey/choosing-your-turkey' },
    ],
  },
  related: ['turkey-cooking-time', 'party-drinks', 'recipe-scaler', 'cooking-converter', 'weight-converter'],
  examples: [
    // 10 adults x 1 lb = 10 lb.
    { values: { adults: 10, kids: 0, leftovers: 'off' }, expect: { turkeyLb: 10, portions: 10, perPerson: 1 } },
    // 10 adults x 1.5 lb = 15 lb.
    { values: { adults: 10, kids: 0, leftovers: 'on' }, expect: { turkeyLb: 15, portions: 10, perPerson: 1.5 } },
    // 8 adults + 4 kids x 0.5 = 10 portions; x 1.5 = 15 lb.
    { values: { adults: 8, kids: 4, leftovers: 'on' }, expect: { turkeyLb: 15, portions: 10 } },
    // 12 adults + 5 kids x 0.5 = 14.5 portions; x 1 = 14.5 lb.
    { values: { adults: 12, kids: 5, leftovers: 'off' }, expect: { turkeyLb: 14.5, portions: 14.5 } },
  ],
});
