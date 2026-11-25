import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'meal-plan-value',
  title: 'College Meal Plan Value: Cost Per Meal',
  category: 'finance',
  description: 'See what a college meal plan really costs per meal used, how much value goes unused, and whether paying for meals yourself would be cheaper.',
  keywords: ['college meal plan calculator', 'meal plan cost per meal', 'is a meal plan worth it', 'dining plan value', 'meal swipe cost calculator', 'meal plan vs cooking'],
  updated: '2026-11-25',
  inputs: [
    { id: 'price', label: 'Plan price for the term', type: 'number', prefix: '$', default: 2400, min: 0, step: 50, info: 'What the plan costs for the semester or year you are comparing.' },
    { id: 'included', label: 'Meals included', type: 'number', default: 150, min: 1, step: 1, info: 'Total meals or swipes the plan gives you for that term.' },
    { id: 'used', label: 'Meals you actually use', type: 'number', default: 105, min: 0, step: 1, info: 'Your honest guess. Check last term\'s swipe count if you have it.' },
    { id: 'other', label: 'Cost of a comparable meal otherwise', type: 'number', prefix: '$', default: 9, min: 0, step: 0.5, info: 'What you would pay per meal cooking or buying it yourself.' },
  ],
  outputs: [
    { id: 'perUsed', label: 'Cost per meal used', format: 'currency', primary: true, info: 'Plan price ÷ meals you actually use.' },
    { id: 'perPaid', label: 'Cost per meal included', format: 'currency', info: 'Plan price ÷ meals included.' },
    { id: 'unused', label: 'Value of unused meals', format: 'currency', info: '(Included − used) × cost per meal included.' },
    { id: 'alt', label: 'Cost of the same meals yourself', format: 'currency', info: 'Meals used × your comparable meal cost.' },
    { id: 'diff', label: 'Plan minus doing it yourself', format: 'currency', info: 'Positive means the plan costs more; negative means it saves money.' },
  ],
  compute: (v) => {
    const price = num(v.price), included = num(v.included), used = num(v.used), other = num(v.other);
    if (price === null || included === null || used === null || other === null) return { perUsed: null };
    if (price < 0 || other < 0 || used < 0) return { perUsed: null, error: 'Amounts cannot be negative.' };
    if (included < 1) return { perUsed: null, error: 'Enter at least 1 meal included.' };
    if (used < 1) return { perUsed: null, error: 'Enter at least 1 meal used.' };
    if (used > included) return { perUsed: null, error: 'Meals used cannot be more than meals included.' };
    const perPaid = price / included;
    const perUsed = price / used;
    const unused = (included - used) * perPaid;
    const alt = used * other;
    const diff = price - alt;
    const saves = diff < 0;
    return {
      perUsed, perPaid, unused, alt, diff,
      tone: saves ? 'good' : 'warn',
      badge: Math.abs(diff) < 0.005 ? 'Plan and DIY cost the same' : saves ? `Plan saves ${usd(-diff)}` : `Plan costs ${usd(diff)} more`,
      chart: {
        type: 'bar',
        title: 'Plan price vs buying the meals yourself',
        categories: ['Meal plan', 'Meals yourself', 'Unused value'],
        series: [{ name: 'Amount', values: [price, alt, unused] }],
        format: { format: 'currency' },
      },
      steps: [
        `Per meal included = ${usd(price)} ÷ ${included} = ${usd(perPaid)}`,
        `Per meal used = ${usd(price)} ÷ ${used} = ${usd(perUsed)}`,
        `Unused value = (${included} − ${used}) × ${usd(perPaid)} = ${usd(unused)}`,
        `Same meals yourself = ${used} × ${usd(other)} = ${usd(alt)}`,
      ],
      note: 'Convenience, dining dollars, guest swipes and rollover rules are not modelled. Check your school\'s plan terms.',
    };
  },
  content: {
    formula: ['Per meal included = price ÷ meals included', 'Per meal used = price ÷ meals used', 'Unused value = (included − used) × per meal included', 'Plan minus DIY = price − (meals used × comparable meal cost)'],
    body: [
      'A meal plan looks cheap per swipe until you count the swipes you never use. Divide the price by the meals you actually eat on campus and you get the real cost per meal. Then compare that with what the same meals would cost you cooking or buying them.',
      'Example: $2,400 for 150 meals is $16.00 per meal included. If you use 105, it is $22.86 per meal used, and the 45 unused meals are worth $720.00. Buying 105 meals at $9 costs $945.00, so the plan costs $1,455.00 more. Second example: $1,800 for 180 meals, 170 used, $11 otherwise: $10.59 per meal used, and the plan saves $70.00.',
      'Dining dollars, guest swipes, rollover rules and plain convenience are not modelled, and some schools require a plan. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I work out the cost per meal of a meal plan?', a: 'Divide the price by the meals you will actually use. $2,400 over 105 used meals is $22.86 each, versus $16.00 if you used all 150.' },
      { q: 'Is a meal plan worth it?', a: 'It is when the plan price is below used meals × what the same meals cost you elsewhere. At $1,800, 170 meals used and $11 otherwise, the alternative is $1,870.00, so the plan saves $70.00.' },
      { q: 'What counts as an unused meal?', a: 'Any included meal you do not eat. Its value is the unused count times the per-meal-included price: 45 × $16.00 = $720.00 in the default example.' },
      { q: 'What cost should I use for a comparable meal?', a: 'Your own average for groceries or takeout. Use the eating out cost calculator if you are not sure.' },
      { q: 'Does this include dining dollars or rollover?', a: 'No. Those vary by school, so treat the result as a baseline and adjust for your plan\'s rules.' },
    ],
    sources: [
      { label: 'College Board: Estimating costs', url: 'https://bigfuture.collegeboard.org/pay-for-college/college-costs/college-costs-how-to-estimate' },
    ],
  },
  related: ['college-net-price', 'eating-out-cost', 'meal-kit-vs-groceries'],
  examples: [
    // 2400/150=16; 2400/105=22.857; 45*16=720; 105*9=945; 2400-945=1455
    { values: { price: 2400, included: 150, used: 105, other: 9 }, expect: { perPaid: 16, perUsed: 22.86, unused: 720, alt: 945, diff: 1455 }, tolerance: 0.01 },
    // 1800/180=10; 1800/170=10.588; 10*10=100; 170*11=1870; 1800-1870=-70
    { values: { price: 1800, included: 180, used: 170, other: 11 }, expect: { perPaid: 10, perUsed: 10.59, unused: 100, alt: 1870, diff: -70 }, tolerance: 0.01 },
  ],
});
