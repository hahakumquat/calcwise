import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

/** Probability distribution of the sum of `dice` fair dice with `sides` sides. Index = sum. */
function distribution(dice: number, sides: number): number[] {
  let dist = [1]; // zero dice: sum 0 with probability 1
  for (let d = 0; d < dice; d++) {
    const next = new Array(dist.length + sides).fill(0);
    for (let s = 0; s < dist.length; s++) {
      if (dist[s] === 0) continue;
      for (let f = 1; f <= sides; f++) next[s + f] += dist[s] / sides;
    }
    dist = next;
  }
  return dist;
}

const MODE_TEXT: Record<string, string> = { exactly: 'exactly', atleast: 'at least', atmost: 'at most' };

export default defineCalculator({
  slug: 'dice-probability',
  title: 'Dice Probability Calculator',
  category: 'other',
  description: 'Find the chance of rolling an exact total, at least, or at most a number with any number of fair dice, plus the full odds chart. Works for 2d6, 3d6 and d20.',
  keywords: ['dice probability calculator', 'dice roll probability', '2d6 odds', '3d6 probability', 'dice sum calculator', 'dnd dice odds', 'chance of rolling'],
  updated: '2026-11-20',
  inputs: [
    { id: 'dice', label: 'Number of dice', type: 'number', default: 2, min: 1, max: 10, step: 1, info: 'How many dice you roll at once and add together (1 to 10).' },
    { id: 'sides', label: 'Sides per die', type: 'number', default: 6, min: 2, max: 100, step: 1, info: 'Faces on each die: 6 for a normal die, 20 for a D20 (2 to 100). All dice are assumed fair and identical.' },
    { id: 'target', label: 'Target total', type: 'number', default: 7, step: 1, info: 'The sum of all dice that you are asking about.' },
    {
      id: 'mode', label: 'Chance of rolling', type: 'select', default: 'exactly', segmented: true,
      options: [{ value: 'exactly', label: 'Exactly' }, { value: 'atleast', label: 'At least' }, { value: 'atmost', label: 'At most' }],
      info: 'Exactly = the total equals the target. At least = the total is the target or higher. At most = the total is the target or lower.',
    },
  ],
  outputs: [
    { id: 'probability', label: 'Probability', format: 'percent', primary: true, info: 'The chance that one roll of all the dice matches your condition.' },
    { id: 'oneIn', label: 'Odds: about 1 in', format: 'number', info: 'The same chance as "1 in N": 1 divided by the probability. Not shown when the chance is zero.' },
    { id: 'expected', label: 'Average total', format: 'number', info: 'The mean of the total: number of dice × (sides + 1) ÷ 2.' },
    { id: 'minTotal', label: 'Lowest possible total', format: 'integer', info: 'Every die shows 1.' },
    { id: 'maxTotal', label: 'Highest possible total', format: 'integer', info: 'Every die shows its top face.' },
  ],
  compute: (v) => {
    const dice = num(v.dice);
    const sides = num(v.sides);
    const target = num(v.target);
    const mode = String(v.mode || 'exactly');
    if (dice == null || sides == null || target == null) return { probability: null };
    if (!Number.isInteger(dice) || dice < 1 || dice > 10) return { probability: null, error: 'Use a whole number of dice from 1 to 10.' };
    if (!Number.isInteger(sides) || sides < 2 || sides > 100) return { probability: null, error: 'Use a whole number of sides from 2 to 100.' };
    if (!Number.isInteger(target)) return { probability: null, error: 'The target total must be a whole number.' };

    const dist = distribution(dice, sides);
    const lo = dice;
    const hi = dice * sides;
    let p = 0;
    for (let s = lo; s <= hi; s++) {
      if (mode === 'atleast' ? s >= target : mode === 'atmost' ? s <= target : s === target) p += dist[s];
    }
    p = Math.min(1, Math.max(0, p));
    const expected = (dice * (sides + 1)) / 2;
    const oneIn = p > 0 ? 1 / p : null;

    const cats: string[] = [];
    const vals: number[] = [];
    let highlight: number | undefined;
    for (let s = lo; s <= hi; s++) {
      if (s === target) highlight = cats.length;
      cats.push(String(s));
      vals.push(dist[s]);
    }
    const chart: ChartSpec = {
      type: 'bar',
      title: `Chance of each total with ${dice}d${sides}`,
      categories: cats,
      series: [{ name: 'Chance of this exact total', values: vals }],
      format: { format: 'percent' },
      ...(highlight != null ? { highlight } : {}),
    };

    const pct = (p * 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
    const phrase = `${MODE_TEXT[mode] || 'exactly'} ${target}`;
    return {
      probability: p,
      oneIn,
      expected,
      minTotal: lo,
      maxTotal: hi,
      tone: p === 0 ? 'warn' : 'ok',
      badge: p === 0 ? `${target} is not reachable` : `${pct}% to roll ${phrase}`,
      chart,
      note: p === 0
        ? `With ${dice}d${sides} the total can only be ${lo} to ${hi}, so this condition cannot happen.`
        : 'Assumes fair dice that land independently. Real dice and shaken-not-rolled dice can be slightly biased.',
      steps: [
        `Each die shows each face with probability 1/${sides}; the ${dice} dice are independent.`,
        `Add the chance of every total that matches "${phrase}" (totals run from ${lo} to ${hi}).`,
        `Result = ${pct}%${oneIn ? `, about 1 in ${oneIn.toLocaleString('en-US', { maximumFractionDigits: 1 })}` : ''}.`,
      ],
    };
  },
  content: {
    formula: [
      'P(total = s) = (number of ways the dice add to s) ÷ sides^dice',
      'Ways are counted one die at a time: ways with n dice = sum of ways with n−1 dice over the faces 1 to sides',
      'At least / at most = add up P(total = s) over every total that qualifies',
    ],
    body: [
      'Pick how many dice you roll, how many sides each has, and a target total. The calculator works out the exact chance of rolling exactly that total, at least that total, or at most that total.',
      'It builds the full distribution by adding one die at a time, so the answer is exact and not a simulation. The chart shows the chance of every possible total, with your target highlighted.',
    ],
    sections: [
      {
        heading: 'Why 7 is the most common roll on two dice',
        paragraphs: [
          'Two six-sided dice can land in 36 equally likely ways. Six of them add to 7 (1+6, 2+5, 3+4 and their mirror images), so the chance is 6/36, or 16.67%. Totals of 2 and 12 each have only one way, 1/36 or 2.78%.',
          'More dice make the middle totals even more likely compared with the extremes, and the chart takes on the familiar bell shape.',
        ],
      },
      {
        heading: 'Worked examples',
        paragraphs: [
          'Two dice, total at least 10: the ways are 3 (for 10), 2 (for 11) and 1 (for 12), so 6/36 = 16.67%.',
          'Three dice, total exactly 10: 27 of the 216 outcomes, which is 12.5%, or 1 in 8.',
        ],
      },
    ],
    faq: [
      { q: 'What is the probability of rolling a 7 with two dice?', a: 'It is 6 out of 36, which is 16.67% or about 1 in 6. Seven is the most likely total on two six-sided dice.' },
      { q: 'What are the odds of rolling at least 10 on 2d6?', a: 'Three ways make 10, two make 11 and one makes 12, so 6 of 36 outcomes qualify. That is 16.67%.' },
      { q: 'What is the chance of rolling 10 on three six-sided dice?', a: '27 of the 216 possible outcomes add to 10, so the chance is 12.5%, or 1 in 8.' },
      { q: 'Does this work for a D20 or other dice?', a: 'Yes. Enter the number of sides from 2 to 100. For one D20, any single total from 1 to 20 has a 5% chance.' },
      { q: 'Does it handle advantage, rerolls or dropping the lowest die?', a: 'No. It adds up all the dice you roll. Rules like advantage change the odds and are not included.' },
    ],
    sources: [{ label: 'Wolfram MathWorld: Dice', url: 'https://mathworld.wolfram.com/Dice.html' }],
  },
  related: ['permutation-combination', 'random-number', 'probability'],
  examples: [
    // 2d6, total 7: 6/36 = 0.166667; mean = 2*7/2 = 7.
    { values: { dice: 2, sides: 6, target: 7, mode: 'exactly' }, expect: { probability: 6 / 36, expected: 7, minTotal: 2, maxTotal: 12 } },
    // 2d6 at least 10: (3+2+1)/36 = 6/36.
    { values: { dice: 2, sides: 6, target: 10, mode: 'atleast' }, expect: { probability: 6 / 36 } },
    // 3d6 exactly 10: 27/216 = 0.125; one in 8.
    { values: { dice: 3, sides: 6, target: 10, mode: 'exactly' }, expect: { probability: 0.125, oneIn: 8 } },
    // 1d20 at most 5: 5/20 = 0.25.
    { values: { dice: 1, sides: 20, target: 5, mode: 'atmost' }, expect: { probability: 0.25, expected: 10.5 } },
  ],
});
