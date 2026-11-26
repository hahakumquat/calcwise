import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const CAP = 2.375;
const clamp = (x: number) => Math.min(CAP, Math.max(0, x));

export default defineCalculator({
  slug: 'nfl-passer-rating',
  title: 'NFL Passer Rating Calculator',
  category: 'sports',
  description: 'Work out an NFL quarterback passer rating (0 to 158.3) from completions, attempts, yards, touchdowns and interceptions.',
  metaDescription: 'Calculate NFL passer rating from completions, attempts, yards, touchdowns and interceptions. See each component and how close to the 158.3 perfect score.',
  updated: '2026-11-26',
  keywords: ['nfl passer rating calculator', 'qb rating calculator', 'quarterback rating', 'passer rating formula', 'perfect passer rating 158.3'],
  inputs: [
    { id: 'comp', label: 'Completions (C)', type: 'number', default: 25, min: 0, step: 1, info: 'Passes completed. Cannot be more than attempts.' },
    { id: 'att', label: 'Attempts (A)', type: 'number', default: 40, min: 1, step: 1, info: 'Total pass attempts.' },
    { id: 'yds', label: 'Passing yards (Y)', type: 'number', default: 300, step: 1, info: 'Net passing yards gained on completions.' },
    { id: 'td', label: 'Touchdowns (TD)', type: 'number', default: 3, min: 0, step: 1, info: 'Touchdown passes thrown.' },
    { id: 'int', label: 'Interceptions (INT)', type: 'number', default: 1, min: 0, step: 1, info: 'Passes intercepted.' },
  ],
  outputs: [
    { id: 'rating', label: 'Passer rating', format: 'number', precision: 1, primary: true, info: 'On a scale of 0 to 158.3, where 158.3 is a perfect rating.' },
    { id: 'a', label: 'Completion component', format: 'number', precision: 3, info: 'Capped at 2.375.' },
    { id: 'b', label: 'Yards component', format: 'number', precision: 3, info: 'Capped at 2.375.' },
    { id: 'c', label: 'Touchdown component', format: 'number', precision: 3, info: 'Capped at 2.375.' },
    { id: 'd', label: 'Interception component', format: 'number', precision: 3, info: 'Capped at 2.375. Starts at the maximum and drops with each interception.' },
  ],
  compute: (v) => {
    const c = num(v.comp);
    const att = num(v.att);
    const y = num(v.yds);
    const td = num(v.td);
    const int = num(v.int);
    if (c === null || att === null || y === null || td === null || int === null) return { rating: null };
    if (att <= 0) return { rating: null, error: 'Attempts must be above zero.' };
    if (c < 0 || td < 0 || int < 0) return { rating: null, error: 'Counts cannot be negative.' };
    if (c > att) return { rating: null, error: 'Completions cannot be more than attempts.' };
    if (td > c) return { rating: null, error: 'Touchdowns cannot be more than completions.' };
    if (int > att - c) return { rating: null, error: 'Interceptions cannot be more than incomplete passes.' };
    const a = clamp((c / att - 0.3) * 5);
    const b = clamp((y / att - 3) * 0.25);
    const cc = clamp((td / att) * 20);
    const d = clamp(CAP - (int / att) * 25);
    const rating = ((a + b + cc + d) / 6) * 100;
    return {
      rating, a, b, c: cc, d,
      tone: rating >= 100 ? 'good' : rating >= 80 ? 'ok' : 'warn',
      badge: rating >= 158.3 - 1e-9 ? 'Perfect' : rating >= 100 ? 'Elite' : rating >= 85 ? 'Solid' : 'Below average',
      chart: {
        type: 'bar', title: 'Components (each maxes at 2.375)', categories: ['Completions', 'Yards', 'Touchdowns', 'Interceptions'],
        series: [{ name: 'Component', values: [a, b, cc, d].map((x) => Math.round(x * 1000) / 1000) }],
        format: { format: 'number', precision: 3 },
      },
      steps: [
        `a = (${c} ÷ ${att} − 0.3) × 5 = ${a.toFixed(3)}`,
        `b = (${y} ÷ ${att} − 3) × 0.25 = ${b.toFixed(3)}`,
        `c = ${td} ÷ ${att} × 20 = ${cc.toFixed(3)}`,
        `d = 2.375 − ${int} ÷ ${att} × 25 = ${d.toFixed(3)}`,
        `Rating = (${a.toFixed(3)} + ${b.toFixed(3)} + ${cc.toFixed(3)} + ${d.toFixed(3)}) ÷ 6 × 100 = ${rating.toFixed(1)}`,
      ],
    };
  },
  content: {
    formula: [
      'a = (C ÷ A − 0.3) × 5',
      'b = (Y ÷ A − 3) × 0.25',
      'c = TD ÷ A × 20',
      'd = 2.375 − INT ÷ A × 25',
      'Each of a, b, c and d is limited to between 0 and 2.375',
      'Rating = (a + b + c + d) ÷ 6 × 100',
    ],
    body: [
      'The NFL passer rating blends four things: how often a quarterback completes passes, how many yards he gains per attempt, how often he throws touchdowns, and how rarely he is intercepted. Each is turned into a number from 0 to 2.375, the four are added, and the total is scaled so the best possible result is 158.3.',
      'For example, 25 completions on 40 attempts for 300 yards, 3 touchdowns and 1 interception gives 1.625 + 1.125 + 1.5 + 1.75 = 6.0, and 6.0 ÷ 6 × 100 = 100.0.',
      'A perfect 158.3 needs all four components at the cap: at least a 77.5% completion rate, 12.5 yards per attempt, a touchdown on 11.9% of attempts and no interceptions. For instance, 25 of 30 for 400 yards and 5 touchdowns with no interceptions hits every cap.',
      'The rating ignores sacks, rushing and game situation, so use it as a snapshot of passing efficiency rather than a full measure of a quarterback.',
    ],
    faq: [
      { q: 'What is a perfect NFL passer rating?', a: '158.3. It needs every component at its 2.375 cap, for example 25 of 30 for 400 yards and 5 touchdowns with no interceptions.' },
      { q: 'What is the lowest possible passer rating?', a: 'Zero. It happens when every component falls to 0, such as a completion rate of 30% or less, 3 yards per attempt or fewer, no touchdowns and an interception on 9.5% or more of attempts.' },
      { q: 'What is a good passer rating?', a: 'Around 90 is roughly league average in recent seasons, 100 or above is excellent, and a full-season rating above 110 is rare. The example of 25 of 40 for 300 yards, 3 touchdowns and 1 interception comes out at 100.0.' },
      { q: 'Why does the calculator reject some inputs?', a: 'Attempts must be above zero, completions cannot exceed attempts, touchdowns cannot exceed completions, and interceptions cannot exceed incomplete passes.' },
    ],
    sources: [
      { label: 'Pro Football Reference: passer rating formula', url: 'https://www.pro-football-reference.com/about/glossary.htm' },
      { label: 'NFL.com: official passer rating explainer', url: 'https://www.nfl.com/stats/categories/passing/' },
    ],
  },
  related: ['baseball-stats', 'shooting-efficiency'],
  examples: [
    // a=(25/40-.3)*5=1.625; b=(300/40-3)*.25=1.125; c=3/40*20=1.5; d=2.375-25/40=1.75; sum 6.0 -> 100.0
    { values: { comp: 25, att: 40, yds: 300, td: 3, int: 1 }, expect: { rating: 100, a: 1.625, b: 1.125, c: 1.5, d: 1.75 }, tolerance: 1e-9 },
    // all capped: a=2.667->2.375, b=2.583->2.375, c=3.33->2.375, d=2.375; 9.5/6*100 = 158.333
    { values: { comp: 25, att: 30, yds: 400, td: 5, int: 0 }, expect: { rating: 950 / 6, a: 2.375, b: 2.375, c: 2.375, d: 2.375 }, tolerance: 1e-9 },
    // 20/30, 250y, 1 TD, 2 INT: a=1.8333, b=1.3333, c=.6667, d=2.375-1.6667=.7083; sum 4.54167 -> 75.694
    { values: { comp: 20, att: 30, yds: 250, td: 1, int: 2 }, expect: { rating: 75.6944444, a: 11 / 6, b: 4 / 3, c: 2 / 3, d: 0.7083333333 }, tolerance: 1e-6 },
  ],
});
