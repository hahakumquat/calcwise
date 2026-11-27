import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'bowling-average',
  title: 'Bowling Average Calculator',
  category: 'sports',
  description: 'Work out your bowling average from total pins and games bowled, then see the pins you need over your next games to reach a target average.',
  metaDescription: 'Bowling average calculator: find your league average from pins and games, and how many pins you need in your next games to reach a target average.',
  updated: '2026-11-27',
  keywords: ['bowling average calculator', 'how to calculate bowling average', 'pins needed for bowling average', 'league bowling average', 'bowling target average'],
  inputs: [
    { id: 'total', label: 'Total pins so far', type: 'number', default: 1800, min: 0, step: 1, info: 'Add up the pins from every game this season.' },
    { id: 'games', label: 'Games bowled', type: 'number', default: 10, min: 1, step: 1, info: 'How many games those pins came from.' },
    { id: 'target', label: 'Target average', type: 'number', default: 185, min: 0, max: 300, step: 1, info: 'The average you want to reach.' },
    { id: 'more', label: 'Games to go', type: 'number', default: 1, min: 1, step: 1, info: 'How many more games you will bowl to get there.' },
  ],
  outputs: [
    { id: 'avg', label: 'Current average', format: 'integer', primary: true, info: 'Total pins ÷ games, rounded down as most leagues do.' },
    { id: 'exact', label: 'Average with decimals', format: 'number', precision: 2, info: 'Total pins ÷ games, not rounded.' },
    { id: 'needed', label: 'Pins needed in the games to go', format: 'integer', info: 'Target × (games bowled + games to go) − total pins.' },
    { id: 'perGame', label: 'Pins needed per game', format: 'number', precision: 1, info: 'Pins needed ÷ games to go. A perfect game is 300.' },
  ],
  compute: (v) => {
    const total = num(v.total);
    const games = num(v.games);
    const target = num(v.target);
    const more = num(v.more);
    if (total === null || games === null || target === null || more === null) return { avg: null };
    if (games < 1 || more < 1) return { avg: null, error: 'Games bowled and games to go must each be at least 1.' };
    if (total < 0 || target < 0) return { avg: null, error: 'Pins and target cannot be negative.' };
    if (total > games * 300) return { avg: null, error: 'That is more than 300 pins a game. Check the total.' };
    const exact = total / games;
    const avg = Math.floor(exact);
    const needed = target * (games + more) - total;
    const perGame = needed / more;
    let tone: 'good' | 'ok' | 'bad' = 'ok';
    let badge: string;
    let note: string;
    if (needed <= 0) {
      tone = 'good';
      badge = 'Already there';
      note = 'You are already above this target, even if you bowled zero in the games to go.';
    } else if (perGame > 300) {
      tone = 'bad';
      badge = 'Out of reach';
      note = 'You would need more than 300 a game, so this target cannot be reached in that many games.';
    } else {
      badge = `${fmt(Math.ceil(perGame))} a game`;
      note = `About ${fmt(Math.ceil(perGame))} a game for ${more} game${more === 1 ? '' : 's'} gets you to ${target}.`;
    }
    return {
      avg,
      exact,
      needed: Math.max(0, needed),
      perGame: Math.max(0, perGame),
      tone,
      badge,
      note,
      chart: {
        type: 'bar',
        title: 'Average now, target and pins per game needed',
        categories: ['Your average', 'Target average', 'Needed per game'],
        series: [{ name: 'Pins per game', values: [exact, target, Math.max(0, perGame)] }],
        format: { format: 'number' },
      },
      steps: [
        `Average = ${fmt(total)} ÷ ${fmt(games)} = ${fmt(exact)}, shown as ${avg}`,
        `Pins needed = ${target} × (${fmt(games)} + ${fmt(more)}) − ${fmt(total)} = ${fmt(needed)}`,
        `Per game = ${fmt(needed)} ÷ ${fmt(more)} = ${fmt(perGame)}`,
        'This uses the plain average, not a handicap.',
      ],
    };
  },
  content: {
    formula: ['Average = total pins ÷ games bowled (rounded down)', 'Pins needed = target × (games + games to go) − total pins', 'Per game = pins needed ÷ games to go'],
    body: [
      'Your bowling average is your total pins divided by the games you have bowled. Most leagues drop the decimals instead of rounding, so 193.6 is written as 193.',
      'To reach a target, work out the total pins you need after the extra games, then subtract what you already have. With 1,800 pins in 10 games, a 185 average after 5 more games needs 185 × 15 − 1,800 = 975 pins, which is 195 a game.',
      'This calculator uses the plain average. It does not work out a league handicap, which each league sets with its own rules.',
    ],
    faq: [
      { q: 'How do you calculate a bowling average?', a: 'Divide your total pins by the number of games. 1,800 pins in 10 games is 180.' },
      { q: 'Is a bowling average rounded or cut off?', a: 'Most leagues cut off the decimals, so 193.6 counts as 193. This calculator shows both the rounded-down average and the exact figure.' },
      { q: 'How many pins do I need to raise my average to 185?', a: 'With 1,800 pins in 10 games, you need 185 × 15 − 1,800 = 975 pins over the next 5 games, or 195 a game.' },
      { q: 'Does this include handicap?', a: 'No. It gives the plain average only. Handicap formulas differ between leagues.' },
    ],
    sources: [],
  },
  related: ['pace', 'season-pass-break-even'],
  examples: [
    // avg 1800/10 = 180; needed 185*15 - 1800 = 975; per game 975/5 = 195
    { values: { total: 1800, games: 10, target: 185, more: 5 }, expect: { avg: 180, exact: 180, needed: 975, perGame: 195 }, tolerance: 0.001 },
    // 1742/9 = 193.5556 -> 193; needed 200*10 - 1742 = 258
    { values: { total: 1742, games: 9, target: 200, more: 1 }, expect: { avg: 193, exact: 193.5556, needed: 258, perGame: 258 }, tolerance: 0.001 },
  ],
});
