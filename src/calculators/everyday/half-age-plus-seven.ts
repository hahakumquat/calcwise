import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'half-age-plus-seven',
  title: 'Half Your Age Plus Seven Calculator',
  category: 'everyday',
  description: 'Try the folk "half your age plus seven" rule: enter your age to see the youngest and oldest ages it says are socially okay to date.',
  keywords: ['half your age plus seven', 'half your age plus 7 rule', 'dating age range calculator', 'age gap rule', 'minimum dating age formula'],
  updated: '2026-11-27',
  inputs: [
    { id: 'age', label: 'Your age', type: 'number', default: 30, min: 14, max: 120, step: 1, suffix: 'years', info: 'Your age in whole years. The rule stops working below 14.' },
  ],
  outputs: [
    { id: 'youngest', label: 'Youngest by the rule', format: 'number', suffix: 'years', primary: true, info: 'Your age ÷ 2 + 7.' },
    { id: 'oldest', label: 'Oldest by the rule', format: 'number', suffix: 'years', info: '(Your age − 7) × 2, the same rule seen from the other side.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    if (age === null) return { youngest: null };
    if (age < 14) return { youngest: null, error: 'The rule breaks down below age 14. Enter 14 or older.' };
    if (age > 120) return { youngest: null, error: 'Enter an age of 120 or less.' };
    const youngest = age / 2 + 7;
    const oldest = (age - 7) * 2;
    return {
      youngest, oldest,
      chart: { type: 'bar', title: 'Ages by the rule', categories: ['Youngest', 'You', 'Oldest'], series: [{ name: 'Age', values: [youngest, age, oldest] }], highlight: 1 },
      steps: [
        `Youngest: ${age} ÷ 2 + 7 = ${youngest}`,
        `Oldest: (${age} − 7) × 2 = ${oldest}`,
      ],
      note: 'A folk rule of thumb for fun, not a law and not advice. Local laws on age of consent always apply.',
    };
  },
  content: {
    formula: [
      'Youngest = your age ÷ 2 + 7',
      'Oldest = (your age − 7) × 2',
    ],
    body: [
      'The "half your age plus seven" rule is an old bit of internet and dinner-table wisdom. It says the youngest person you should date is half your age plus seven years.',
      'Flip it around and you get the oldest: take away seven and double it. Both ends use the same rule, so the two people in a pair always agree.',
      'It is a joke-adjacent rule of thumb. It says nothing about maturity, circumstances or the law, so treat the result as a conversation starter.',
    ],
    faq: [
      { q: 'What does the rule say for a 30-year-old?', a: 'The youngest is 30 ÷ 2 + 7 = 22 and the oldest is (30 − 7) × 2 = 46.' },
      { q: 'What about 40 and 18?', a: 'At 40 the range is 27 to 66. At 18 it is 16 to 22.' },
      { q: 'Why does it stop at 14?', a: 'Below 14 the formula gives a minimum age at or above your own, so it no longer makes sense.' },
      { q: 'Is this a legal guide?', a: 'No. It is a folk rule. Age of consent and other laws apply no matter what the formula says.' },
    ],
    sources: [],
  },
  related: ['age'],
  examples: [
    { values: { age: 30 }, expect: { youngest: 22, oldest: 46 }, tolerance: 0.01 },
    { values: { age: 40 }, expect: { youngest: 27, oldest: 66 }, tolerance: 0.01 },
    { values: { age: 18 }, expect: { youngest: 16, oldest: 22 }, tolerance: 0.01 },
  ],
});
