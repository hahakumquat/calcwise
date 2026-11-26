import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

/** Exact C(n,k) with BigInt (each step divides exactly). */
function chooseBig(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let r = 1n;
  for (let i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i);
  return r;
}
const grp = (b: bigint) => b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default defineCalculator({
  slug: 'lottery-odds',
  title: 'Lottery Odds Calculator',
  category: 'statistics',
  description: 'Work out the odds of matching every number in a lottery: pick k of n main numbers plus an optional bonus ball. Shows 1 in N and the probability.',
  keywords: ['lottery odds calculator', 'powerball odds', 'mega millions odds', '6/49 odds', 'chance of winning the lottery', 'jackpot odds'],
  updated: '2026-11-26',
  inputs: [
    { id: 'n', label: 'Main numbers to pick from (n)', type: 'number', default: 69, min: 1, max: 100, step: 1, info: 'The size of the main number pool. Powerball uses 69, a 6/49 game uses 49.' },
    { id: 'k', label: 'Main numbers drawn (k)', type: 'number', default: 5, min: 1, max: 20, step: 1, info: 'How many main numbers you must match. Powerball draws 5, a 6/49 game draws 6.' },
    { id: 'bonus', label: 'Bonus ball pool size', type: 'number', default: 26, min: 0, max: 100, step: 1, info: 'Size of the separate bonus pool, where one number is drawn. Powerball uses 26. Enter 0 for no bonus ball.' },
  ],
  outputs: [
    { id: 'odds', label: 'Odds of the jackpot (1 in …)', format: 'integer', primary: true, info: 'C(n, k) × bonus pool. This is N in "1 in N".' },
    { id: 'oneIn', label: 'Odds', format: 'text', info: 'The same figure written as 1 in N.' },
    { id: 'probability', label: 'Probability per ticket', format: 'text', info: '1 ÷ N, as a percentage.' },
    { id: 'tickets', label: 'Tickets for an expected single win', format: 'integer', info: 'On average you would need N tickets, each with a different set of numbers, to expect one jackpot. It is an average, not a guarantee.' },
  ],
  compute: (v) => {
    const n = num(v.n), k = num(v.k), bonus = num(v.bonus);
    if (n === null || k === null || bonus === null) return { odds: null };
    if (![n, k, bonus].every(Number.isInteger) || n < 1 || k < 1 || bonus < 0) return { odds: null, error: 'Use whole numbers: n and k at least 1, bonus pool 0 or more.' };
    if (k > n) return { odds: null, error: 'You cannot draw more numbers than are in the pool (k must be at most n).' };
    if (n > 100 || k > 20 || bonus > 100) return { odds: null, error: 'Limits: n up to 100, k up to 20, bonus pool up to 100.' };
    const main = chooseBig(n, k);
    const total = main * BigInt(bonus === 0 ? 1 : bonus);
    const odds = Number(total); // below 2^53 for all allowed inputs checked here
    if (!Number.isSafeInteger(odds)) return { odds: null, error: 'These numbers give odds too large to show exactly. Try a smaller pool.' };
    const pct = 100 / odds;
    const pctText = pct >= 0.001 ? pct.toPrecision(3) + '%' : pct.toExponential(2).replace('e', ' × 10^') + '%';
    return {
      odds,
      oneIn: `1 in ${grp(total)}`,
      probability: `${pctText} (${(1 / odds).toExponential(3)})`,
      tickets: odds,
      tone: 'ok',
      badge: `1 in ${grp(total)}`,
      chart: {
        type: 'bar',
        title: 'Number of possible tickets',
        categories: bonus === 0 ? ['Main numbers'] : ['Main numbers', 'With bonus ball'],
        series: [{ name: 'Combinations', values: bonus === 0 ? [Number(main)] : [Number(main), odds] }],
        format: { format: 'integer' },
      },
      steps: [
        `Main numbers: C(${n}, ${k}) = ${grp(main)}`,
        bonus === 0 ? 'No bonus ball, so the odds are C(n, k)' : `Bonus ball: ${grp(main)} × ${bonus} = ${grp(total)}`,
        `Odds: 1 in ${grp(total)}`,
      ],
      note: 'Odds are pure combinatorics and assume every combination is equally likely. Each draw is independent, so past results do not change them. This is not a prediction or advice to play.',
    };
  },
  content: {
    formula: [
      'Main combinations = C(n, k) = n! ÷ (k! × (n − k)!)',
      'Total combinations = C(n, k) × bonus pool size',
      'Odds = 1 in total combinations',
    ],
    body: [
      'A lottery jackpot needs you to match every number drawn. Because the order of the main numbers does not matter, the number of possible tickets is the combinations count C(n, k). If there is a separate bonus ball drawn from its own pool, multiply by the size of that pool.',
      'Powerball picks 5 numbers from 69 and one bonus ball from 26. C(69, 5) is 11,238,513, and times 26 that makes 292,201,338 possible tickets, so the jackpot is 1 in 292,201,338. A 6/49 game has C(49, 6) = 13,983,816 combinations.',
      'The odds are pure combinatorics. Every ticket has the same chance, and each draw is independent of earlier draws, so numbers are never "due". This calculator shows the odds for the numbers you enter. It does not cover smaller prizes or say whether playing is worthwhile.',
    ],
    faq: [
      { q: 'What are the odds for Powerball?', a: 'With 5 of 69 main numbers and 1 of 26 bonus numbers, there are 11,238,513 × 26 = 292,201,338 combinations, so the jackpot odds are 1 in 292,201,338.' },
      { q: 'What are the odds in a 6/49 lottery?', a: 'C(49, 6) = 13,983,816, so with no bonus ball the odds are 1 in 13,983,816. Set the bonus pool to 0.' },
      { q: 'What does "expected tickets" mean?', a: 'It is N, the number of tickets with different numbers that would cover every combination once. On average one jackpot per N tickets, but you could win with the first or never win.' },
      { q: 'Are some numbers luckier or due to come up?', a: 'No. Each draw is independent and every combination is equally likely, so past results do not change the odds.' },
    ],
    sources: [],
  },
  related: ['permutation-combination', 'probability', 'expected-value'],
  examples: [
    // C(69,5) = 11,238,513; x 26 = 292,201,338
    { values: { n: 69, k: 5, bonus: 26 }, expect: { odds: 292201338, tickets: 292201338 } },
    // C(49,6) = 13,983,816
    { values: { n: 49, k: 6, bonus: 0 }, expect: { odds: 13983816, tickets: 13983816 } },
    // C(5,2) = 10; x 3 = 30
    { values: { n: 5, k: 2, bonus: 3 }, expect: { odds: 30 } },
  ],
});
