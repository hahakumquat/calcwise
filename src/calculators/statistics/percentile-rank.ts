import { defineCalculator } from '../../lib/types';
import { nums, histogram, fmt } from '../../lib/helpers/math-extra';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'percentile-rank',
  title: 'Percentile Rank Calculator',
  category: 'statistics',
  description: 'Paste a list of scores and enter one score to get its percentile rank: the share of the group below it, counting ties as half, with steps.',
  keywords: ['percentile rank calculator', 'percentile of a score', 'what percentile am i', 'percentile from data set', 'class rank percentile', 'test score percentile'],
  updated: '2026-11-27',
  inputs: [
    { id: 'data', label: 'All scores', type: 'list', default: '55, 60, 65, 70, 70, 75, 80, 85, 90, 95', placeholder: 'Numbers separated by commas, spaces or new lines', info: 'The whole group, including the score you want to rank.' },
    { id: 'score', label: 'Score to rank', type: 'number', default: 70, step: 1, info: 'The value whose percentile rank you want. It does not have to be in the list.' },
  ],
  outputs: [
    { id: 'percentile', label: 'Percentile rank', format: 'percent', precision: 1, primary: true, info: '(scores below + 0.5 × scores equal) ÷ total scores.' },
    { id: 'below', label: 'Scores below', format: 'integer', info: 'How many scores are strictly less than yours.' },
    { id: 'equal', label: 'Scores equal', format: 'integer', info: 'How many scores match yours exactly.' },
    { id: 'count', label: 'Total scores (n)', format: 'integer', info: 'The size of the group.' },
  ],
  compute: (v) => {
    const xs = nums(v.data);
    const s = num(v.score);
    const n = xs.length;
    if (n === 0 || s === null) return { percentile: null };
    const below = xs.filter((x) => x < s).length;
    const equal = xs.filter((x) => x === s).length;
    const p = (below + 0.5 * equal) / n;
    const pct = p * 100;
    return {
      percentile: p,
      below,
      equal,
      count: n,
      tone: pct >= 75 ? ('good' as const) : pct >= 25 ? ('ok' as const) : ('warn' as const),
      badge: pct >= 75 ? 'Top quarter' : pct >= 50 ? 'Above the middle' : pct >= 25 ? 'Below the middle' : 'Bottom quarter',
      note: `${fmt(s)} is at the ${fmt(pct, 4)}th percentile: ${below} of ${n} scores are lower${equal > 0 ? ` and ${equal} tie${equal === 1 ? 's' : ''} with it` : ''}.`,
      chart: histogram(xs, `Distribution of the scores (bar containing ${fmt(s, 5)} highlighted)`, s),
      steps: [
        `n = ${n}; scores below ${fmt(s)} = ${below}; scores equal = ${equal}`,
        `Percentile rank = (${below} + 0.5 × ${equal}) ÷ ${n} = ${fmt(below + 0.5 * equal)} ÷ ${n}`,
        `= ${fmt(pct, 6)}%`,
      ],
    };
  },
  content: {
    formula: ['Percentile rank = (B + 0.5 × E) ÷ N × 100%', 'B = scores below, E = scores equal to yours, N = total scores'],
    body: [
      'A percentile rank tells you where one score sits within a group: the percent of scores that fall below it. A score at the 80th percentile did better than about 80% of the group.',
      'This calculator uses the common mid-rank definition, counting scores equal to yours as half below and half above. That keeps tied scores from being pushed to either end. Other textbooks and tools count only strictly lower scores, so results can differ slightly with ties.',
      'Percentile rank describes position in this particular list. It is not the same as a percentage score on a test. Everything runs in your browser.',
    ],
    faq: [
      { q: 'What is the percentile rank of 70 in 55, 60, 65, 70, 70, 75, 80, 85, 90, 95?', a: 'Three scores are below 70 and two equal it, out of 10. Percentile rank = (3 + 0.5 × 2) ÷ 10 = 40%.' },
      { q: 'What is the percentile rank of the top score?', a: 'In the same list, 95 has 9 scores below and 1 equal: (9 + 0.5) ÷ 10 = 95%. A score above everything in the list gets 100%.' },
      { q: 'Why count ties as half?', a: 'A tied score is neither above nor below those it matches, so half of the tied group is treated as below. It gives tied scores the same, centred rank.' },
      { q: 'Is percentile the same as percent correct?', a: 'No. Percent correct compares you with the maximum possible mark. Percentile rank compares you with the other scores in the group.' },
    ],
  },
  related: ['z-score', 'quartile-calculator', 'mean-median-mode', 'standard-deviation'],
  examples: [
    // below 55,60,65 = 3; equal 70,70 = 2; n 10; (3 + 1) / 10 = 0.4.
    { values: { data: [55, 60, 65, 70, 70, 75, 80, 85, 90, 95], score: 70 }, expect: { percentile: 0.4, below: 3, equal: 2, count: 10 }, tolerance: 1e-9 },
    // 95: below 9, equal 1; (9 + 0.5) / 10 = 0.95.
    { values: { data: [55, 60, 65, 70, 70, 75, 80, 85, 90, 95], score: 95 }, expect: { percentile: 0.95, below: 9, equal: 1 }, tolerance: 1e-9 },
    // 100 above all: below 10, equal 0; 10 / 10 = 1.
    { values: { data: [55, 60, 65, 70, 70, 75, 80, 85, 90, 95], score: 100 }, expect: { percentile: 1, below: 10, equal: 0 }, tolerance: 1e-9 },
  ],
});
