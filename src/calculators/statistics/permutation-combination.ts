import { defineCalculator } from '../../lib/types';
import { num, choose } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

function perm(n: number, r: number): number {
  let p = 1;
  for (let i = 0; i < r; i++) p *= n - i;
  return p;
}

export default defineCalculator({
  slug: 'permutation-combination',
  title: 'Permutation and Combination Calculator',
  category: 'statistics',
  description: 'Count the ways to choose r items from n — combinations (nCr), permutations (nPr), with or without repetition.',
  keywords: ['nCr', 'nPr', 'combinations', 'permutations', 'n choose r', 'binomial coefficient', 'counting'],
  inputs: [
    { id: 'n', info: 'How many different items you can choose from.', label: 'Total items (n)', type: 'number', default: 10, min: 0, step: 1 },
    { id: 'r', info: 'How many items you pick.', label: 'Items chosen (r)', type: 'number', default: 3, min: 0, step: 1 },
  ],
  outputs: [
    { id: 'combinations', info: 'Ways to choose r items when order doesn’t matter — e.g. picking a team.', label: 'Combinations nCr (order doesn’t matter)', format: 'integer', primary: true },
    { id: 'permutations', info: 'Ways to choose and arrange r items when order matters — e.g. gold, silver, bronze.', label: 'Permutations nPr (order matters)', format: 'integer' },
    { id: 'combRep', info: 'Ways to choose r items when the same item may be picked more than once and order doesn’t matter.', label: 'Combinations with repetition', format: 'integer' },
    { id: 'permRep', info: 'Ways to fill r ordered slots when items can repeat — e.g. digits of a PIN.', label: 'Permutations with repetition (nʳ)', format: 'integer' },
  ],
  compute: (v) => {
    const n = num(v.n);
    const r = num(v.r);
    if (n === null || r === null) return { combinations: null };
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) return { combinations: null, error: 'n and r must be non-negative whole numbers.' };
    if (n > 1000) return { combinations: null, error: 'n is limited to 1000 here.' };
    const combRep = n + r - 1 >= 0 && (n > 0 || r === 0) ? choose(n + r - 1, r) : 0;
    const permRep = n ** r;
    if (r > n)
      return {
        combinations: 0,
        permutations: 0,
        combRep,
        permRep,
        chart: { type: 'bar', title: 'Number of ways', categories: ['nCr', 'nPr', 'nCr (rep.)', 'nʳ'], series: [{ name: 'Ways', values: [0, 0, combRep, permRep] }], format: { format: 'integer' } },
        steps: [`r > n: you can’t pick ${r} different items from only ${n}, so nCr = nPr = 0`],
      };
    const P = perm(n, r);
    const C = choose(n, r);
    return {
      combinations: C,
      permutations: P,
      combRep,
      permRep,
      chart: {
        type: 'bar',
        title: `Order matters: ${fmt(P, 6)} vs ${fmt(C, 6)} ways (×${r}!)`,
        categories: ['nCr', 'nPr', 'nCr (rep.)', 'nʳ'],
        series: [{ name: 'Ways', values: [C, P, combRep, permRep] }],
        format: { format: 'integer' },
        horizontal: true,
        highlight: 0,
      },
      steps: [
        `nPr = n! ÷ (n − r)! = ${n}! ÷ ${n - r}! = ${r <= 8 && r > 0 ? Array.from({ length: r }, (_, i) => n - i).join(' × ') + ' = ' : ''}${fmt(P, 15)}`,
        `nCr = nPr ÷ r! = ${fmt(P, 15)} ÷ ${r}! = ${fmt(C, 15)}`,
        `With repetition: nʳ = ${n}^${r} = ${fmt(permRep, 15)} ordered, C(n + r − 1, r) = ${fmt(combRep, 15)} unordered`,
      ],
      note: !Number.isSafeInteger(C) || !Number.isSafeInteger(P) ? 'Very large results are approximate (floating-point).' : undefined,
    };
  },
  content: {
    formula: ['nPr = n! ÷ (n − r)!', 'nCr = n! ÷ (r! (n − r)!)', 'With repetition: nʳ (ordered),  (n + r − 1)! ÷ (r! (n − 1)!) (unordered)'],
    body: [
      'Permutations and combinations both count ways of picking r items from a set of n. The difference is whether order matters. A podium finish (gold, silver, bronze) is a permutation — Alice-Bob-Carol is a different result from Carol-Bob-Alice. A three-person committee is a combination — the same three people form the same committee no matter the order they were picked.',
      'Because every group of r items can be arranged in r! orders, there are always r! times as many permutations as combinations: nCr = nPr ÷ r!. Choosing 3 from 10 gives 720 permutations but only 120 combinations.',
      'With repetition allowed — like digits in a PIN, where the same digit can appear more than once — ordered selections number nʳ. A 4-digit PIN has 10⁴ = 10,000 possibilities. Unordered selections with repetition (such as choosing 3 scoops from 10 ice-cream flavours, doubles allowed) use the “stars and bars” formula C(n + r − 1, r).',
    ],
    faq: [
      { q: 'Is a combination lock really a combination?', a: 'Mathematically, no — the order of the numbers matters and repeats are allowed, so it is a permutation with repetition. “Permutation lock” would be more accurate.' },
      { q: 'What are the odds of winning a 6/49 lottery?', a: 'There are 49C6 = 13,983,816 possible tickets, so a single ticket has about a 1 in 14 million chance of matching all six numbers.' },
      { q: 'What is 0! ?', a: '0! is defined as 1. This makes formulas work at the edges: there is exactly one way to choose nothing, so nC0 = 1.' },
    ],
  },
  related: ['probability', 'gcf-lcm', 'exponent'],
  examples: [
    { values: { n: 10, r: 3 }, expect: { combinations: 120, permutations: 720, permRep: 1000, combRep: 220 } },
    { values: { n: 49, r: 6 }, expect: { combinations: 13983816 } },
    { values: { n: 5, r: 0 }, expect: { combinations: 1, permutations: 1 } },
    { values: { n: 3, r: 5 }, expect: { combinations: 0, permRep: 243, combRep: 21 } },
  ],
});
