import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'probability',
  title: 'Probability Calculator',
  category: 'statistics',
  description: 'For two independent events, find the probability of both, either, exactly one, or neither happening.',
  keywords: ['probability of a and b', 'probability of a or b', 'independent events', 'complement', 'union', 'intersection', 'odds'],
  inputs: [
    { id: 'pA', info: 'The chance that event A happens, as a decimal between 0 and 1.', label: 'P(A)', type: 'number', default: 0.5, min: 0, max: 1, step: 0.01, help: 'A probability between 0 and 1 (e.g. 0.25 for 25%)' },
    { id: 'pB', info: 'The chance that event B happens, as a decimal between 0 and 1. A and B are assumed independent.', label: 'P(B)', type: 'number', default: 0.4, min: 0, max: 1, step: 0.01 },
  ],
  outputs: [
    { id: 'and', info: 'The chance that both A and B happen.', label: 'P(A and B) — both', primary: true, precision: 6 },
    { id: 'or', info: 'The chance that A, B, or both happen.', label: 'P(A or B) — at least one', precision: 6 },
    { id: 'xor', info: 'The chance that exactly one of the two events happens, but not both.', label: 'P(exactly one of A, B)', precision: 6 },
    { id: 'neither', info: 'The chance that neither event happens.', label: 'P(neither A nor B)', precision: 6 },
    { id: 'notA', info: 'The chance that A does not happen: 1 − P(A).', label: 'P(not A)', precision: 6 },
    { id: 'notB', info: 'The chance that B does not happen: 1 − P(B).', label: 'P(not B)', precision: 6 },
    { id: 'aNotB', info: 'The chance that A happens while B does not.', label: 'P(A but not B)', precision: 6 },
  ],
  compute: (v) => {
    const a = num(v.pA);
    const b = num(v.pB);
    if (a === null || b === null) return { and: null };
    if (a < 0 || a > 1 || b < 0 || b > 1) return { and: null, error: 'Probabilities must be between 0 and 1. For percentages, divide by 100 (35% → 0.35).' };
    const and = a * b;
    const or = a + b - and;
    const xor = or - and;
    return {
      and,
      or,
      xor,
      neither: (1 - a) * (1 - b),
      notA: 1 - a,
      notB: 1 - b,
      aNotB: a * (1 - b),
      chart: {
        type: 'bar',
        title: 'Probabilities',
        categories: ['P(A)', 'P(B)', 'A and B', 'A or B', 'Exactly one', 'Neither'],
        series: [{ name: 'Probability', values: [a, b, and, or, xor, (1 - a) * (1 - b)] }],
        highlight: 2,
      },
      steps: [
        `P(A and B) = P(A) × P(B) = ${fmt(a)} × ${fmt(b)} = ${fmt(and)}`,
        `P(A or B) = P(A) + P(B) − P(A and B) = ${fmt(a)} + ${fmt(b)} − ${fmt(and)} = ${fmt(or)}`,
        `P(exactly one) = P(A or B) − P(A and B) = ${fmt(or)} − ${fmt(and)} = ${fmt(xor)}`,
        `P(neither) = (1 − P(A)) × (1 − P(B)) = ${fmt(1 - a)} × ${fmt(1 - b)} = ${fmt((1 - a) * (1 - b))}`,
      ],
    };
  },
  content: {
    formula: ['P(A ∩ B) = P(A) × P(B)   (independent)', 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)', 'P(not A) = 1 − P(A)', 'P(exactly one) = P(A) + P(B) − 2·P(A ∩ B)'],
    body: [
      'Two events are independent when one happening doesn’t change the chances of the other — like flipping a coin and rolling a die. For independent events, the probability that both happen is the product of their individual probabilities.',
      'The chance that at least one happens is the sum of the two probabilities minus the overlap. Without subtracting P(A and B), outcomes where both happen would be counted twice. The complement rule, P(not A) = 1 − P(A), is often the quickest route: the chance of at least one six in two dice rolls is 1 − (5/6)² ≈ 0.306.',
      'These formulas assume independence. If the events affect each other — drawing two cards without putting the first back, for example — you need conditional probability: P(A and B) = P(A) × P(B | A).',
    ],
    faq: [
      { q: 'What is the difference between independent and mutually exclusive?', a: 'Mutually exclusive events can’t happen together (P(A and B) = 0), like rolling a 2 and a 5 on one die. Independent events can happen together; they just don’t influence each other. Two events with non-zero probabilities can’t be both.' },
      { q: 'How do I convert odds to a probability?', a: 'Odds of 3 to 1 against mean 1 success for every 3 failures, so the probability is 1 ÷ (1 + 3) = 0.25.' },
    ],
  },
  related: ['permutation-combination', 'normal-distribution', 'z-score'],
  examples: [
    { values: { pA: 0.5, pB: 0.4 }, expect: { and: 0.2, or: 0.7, xor: 0.5, neither: 0.3, notA: 0.5 }, tolerance: 1e-12 },
    { values: { pA: 1 / 6, pB: 1 / 6 }, expect: { or: 11 / 36, and: 1 / 36 }, tolerance: 1e-12 },
  ],
});
