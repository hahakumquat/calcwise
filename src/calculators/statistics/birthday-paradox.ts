import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

/** Probability that at least two of n people share a birthday (365 equally likely days). */
const anyMatch = (n: number) => {
  let none = 1;
  for (let i = 0; i < n; i++) none *= (365 - i) / 365;
  return 1 - none;
};

const pct = (x: number) => `${(x * 100).toFixed(2)}%`;

export default defineCalculator({
  slug: 'birthday-paradox',
  title: 'Birthday Paradox Calculator',
  category: 'statistics',
  description: 'Find the chance that two people in a group share a birthday, and the much smaller chance that someone shares yours. 23 people is already about 50%.',
  keywords: ['birthday paradox calculator', 'birthday problem probability', 'chance two people share a birthday', 'shared birthday odds', 'how many people for 50 percent same birthday', 'birthday probability'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'n', label: 'People in the group', type: 'number', default: 23, min: 2, max: 100, step: 1, info: 'Everyone in the room, including you. Between 2 and 100.' },
  ],
  outputs: [
    { id: 'any', label: 'Chance any two share a birthday', format: 'percent', precision: 2, primary: true, info: '1 − (365 × 364 × … × (365 − n + 1)) ÷ 365ⁿ. Any pair in the group counts.' },
    { id: 'yours', label: 'Chance someone shares yours', format: 'percent', precision: 2, info: '1 − (364 ÷ 365)^(n − 1). Only a match with one specific person counts, so it is much lower.' },
    { id: 'pairs', label: 'Pairs of people', format: 'integer', info: 'n × (n − 1) ÷ 2. Every pair is a chance for a match, which is why the odds climb so fast.' },
  ],
  compute: (v) => {
    const raw = num(v.n);
    if (raw === null || raw < 2 || raw > 100) return { any: null };
    const n = Math.round(raw);
    const any = anyMatch(n);
    const yours = 1 - Math.pow(364 / 365, n - 1);
    const pairs = (n * (n - 1)) / 2;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let k = 2; k <= 100; k++) {
      xs.push(k);
      ys.push(+(anyMatch(k) * 100).toFixed(3));
    }
    return {
      any,
      yours,
      pairs,
      tone: 'ok',
      badge: `${(any * 100).toFixed(1)}% chance`,
      note: `With ${n} people there are ${pairs.toLocaleString('en-US')} pairs, so the chance that at least two share a birthday is ${pct(any)}. The chance that someone shares your birthday is only ${pct(yours)}. Real birthdays are not perfectly even and 29 February is ignored.`,
      chart: {
        type: 'line',
        title: 'Chance of a shared birthday by group size',
        x: xs,
        xLabel: 'People in the group',
        yFormat: { format: 'number', suffix: '%' },
        series: [{ name: 'Chance any two match', values: ys }],
        markers: [{ x: n, label: `${n} people` }],
      },
      steps: [
        `Chance nobody matches = (365 ÷ 365) × (364 ÷ 365) × … × (${365 - n + 1} ÷ 365) = ${(1 - any).toFixed(6)}`,
        `Chance any two match = 1 − ${(1 - any).toFixed(6)} = ${pct(any)}`,
        `Chance someone shares yours = 1 − (364 ÷ 365)^${n - 1} = ${pct(yours)}`,
      ],
    };
  },
  content: {
    formula: [
      'P(any two match) = 1 − (365 ÷ 365) × (364 ÷ 365) × … × ((365 − n + 1) ÷ 365)',
      'P(someone shares your birthday) = 1 − (364 ÷ 365)^(n − 1)',
      'Pairs = n × (n − 1) ÷ 2',
    ],
    body: [
      'The birthday paradox is not a paradox, just a result that feels wrong. In a room of 23 people, the chance that at least two share a birthday is just over 50%. Most people guess it would take far more.',
      'The reason is pairs. You are not checking one person against everyone, you are checking everyone against everyone: 23 people make 253 pairs, and each pair has a 1 in 365 chance of matching. The calculator finds the chance that nobody matches by multiplying the chance each new person avoids every earlier birthday, then subtracts that from 1.',
      'Matching your own birthday is a different question and a far less likely one. The calculator shows both. It assumes 365 equally likely days, so it ignores 29 February and the fact that some birthdays are more common than others; real groups come out slightly higher. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How many people for a 50% chance of a shared birthday?', a: '23 people. The chance that at least two share a birthday is 50.73%, while 22 people give 47.57%.' },
      { q: 'What are the odds with 30 people?', a: '70.63%. With 57 people it is 99.01%.' },
      { q: 'What is the chance someone shares my birthday?', a: 'With 23 people it is 1 − (364 ÷ 365)^22 = 5.86%. It is much lower because only matches with you count.' },
      { q: 'Does it include 29 February?', a: 'No. It assumes 365 equally likely birthdays. Real birthdays are not perfectly even, which makes a match slightly more likely than shown.' },
      { q: 'Why is the answer so high?', a: 'Because the number of pairs grows fast: 23 people form 253 pairs, and every pair can match.' },
    ],
    sources: [{ label: 'Wolfram MathWorld: Birthday Problem', url: 'https://mathworld.wolfram.com/BirthdayProblem.html' }],
  },
  related: ['probability', 'permutation-combination', 'expected-value', 'dice-probability', 'factorial-calculator'],
  examples: [
    // Product of (365 − i)/365 for i = 0..22 = 0.492703 → 1 − that = 0.507297; yours 1 − (364/365)^22 = 0.058571; pairs 253.
    { values: { n: 23 }, expect: { any: 0.507297, yours: 0.058571, pairs: 253 }, tolerance: 1e-5 },
    // n = 30 → 0.706316; yours 1 − (364/365)^29 = 0.076478; pairs 435.
    { values: { n: 30 }, expect: { any: 0.706316, yours: 0.076478, pairs: 435 }, tolerance: 1e-5 },
    // n = 57 → 0.990122.
    { values: { n: 57 }, expect: { any: 0.990122, pairs: 1596 }, tolerance: 1e-5 },
    // n = 2 → 1/365 = 0.002740.
    { values: { n: 2 }, expect: { any: 0.00274, yours: 0.00274, pairs: 1 }, tolerance: 1e-5 },
  ],
});
