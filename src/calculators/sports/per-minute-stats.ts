import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'per-minute-stats',
  title: 'Per-Minute Stats Calculator (Per 36, 40, 48)',
  category: 'sports',
  description: 'Turn a season total and minutes played into a per-minute rate, per 36, per 40 and per 48 minute figures, and a per-game average.',
  metaDescription: 'Per-minute stats calculator: convert points, rebounds or assists to per-minute, per 36, per 40 and per 48 minutes, plus per game. Enter total and minutes.',
  updated: '2026-11-28',
  keywords: ['per 36 minutes calculator', 'per minute stats calculator', 'per 40 minutes', 'per 48 minutes', 'basketball per-36 stats', 'stats per game calculator'],
  inputs: [
    { id: 'stat', label: 'Stat total', type: 'number', default: 126, min: 0, step: 1, info: 'The season or period total for one stat, such as points, rebounds or assists.' },
    { id: 'minutes', label: 'Total minutes played', type: 'number', suffix: 'min', default: 270, min: 0, step: 1, info: 'Minutes played over the same period as the stat total.' },
    { id: 'games', label: 'Games played (optional)', type: 'number', optional: true, default: 15, min: 0, step: 1, info: 'Leave blank to skip the per-game average.' },
  ],
  outputs: [
    { id: 'per36', label: 'Per 36 minutes', precision: 2, primary: true, info: 'Per-minute rate times 36.' },
    { id: 'perMin', label: 'Per minute', precision: 4, info: 'Stat total divided by total minutes.' },
    { id: 'per40', label: 'Per 40 minutes', precision: 2, info: 'Per-minute rate times 40, a full college game.' },
    { id: 'per48', label: 'Per 48 minutes', precision: 2, info: 'Per-minute rate times 48, a full NBA game.' },
    { id: 'perGame', label: 'Per game', precision: 2, info: 'Stat total divided by games played.' },
  ],
  compute: (v) => {
    const stat = num(v.stat);
    const min = num(v.minutes);
    const games = num(v.games);
    if (stat === null || min === null) return { per36: null };
    if (min <= 0) return { per36: null, error: 'Enter total minutes above 0.' };
    if (stat < 0) return { per36: null, error: 'The stat total cannot be negative.' };
    if (games !== null && games < 0) return { per36: null, error: 'Games played cannot be negative.' };
    const perMin = stat / min;
    const per36 = perMin * 36;
    const per40 = perMin * 40;
    const per48 = perMin * 48;
    const perGame = games !== null && games > 0 ? stat / games : null;
    const small = min < 100;
    const cats = ['Per 36', 'Per 40', 'Per 48'];
    const vals = [per36, per40, per48];
    if (perGame !== null) {
      cats.push('Per game');
      vals.push(perGame);
    }
    return {
      per36,
      perMin,
      per40,
      per48,
      perGame,
      tone: small ? 'warn' : 'ok',
      badge: small ? 'Small sample' : `${per36.toFixed(1)} per 36`,
      note: small
        ? 'Under 100 minutes is a small sample, so these rates are noisy. Treat them with care.'
        : 'Rates do not always scale: with more playing time, efficiency, opponents and fatigue change, so per-36 is an estimate, not a promise.',
      chart: { type: 'bar', title: 'Stat at different minute totals', categories: cats, series: [{ name: 'Stat', values: vals.map((x) => Math.round(x * 100) / 100) }] },
      steps: [
        `Per minute = ${stat} ÷ ${min} = ${perMin.toFixed(4)}`,
        `Per 36 = ${perMin.toFixed(4)} × 36 = ${per36.toFixed(2)}; per 40 = ${per40.toFixed(2)}; per 48 = ${per48.toFixed(2)}`,
        ...(perGame !== null ? [`Per game = ${stat} ÷ ${games} = ${perGame.toFixed(2)}`] : []),
      ],
    };
  },
  content: {
    formula: ['Per minute = stat ÷ minutes', 'Per N minutes = per minute × N (N = 36, 40 or 48)', 'Per game = stat ÷ games'],
    body: [
      'Per-minute stats put players with different playing time on the same footing. A bench player with 12 minutes a game can be compared with a starter who plays 34, by scaling each to the same number of minutes. Per 36 is the most common choice in basketball; per 40 matches a college game and per 48 an NBA game.',
      'The calculation is plain proportion: divide the total by minutes to get a rate per minute, then multiply by 36, 40 or 48. Divide the total by games for the usual per-game average.',
      'Be careful with small samples. A player with 50 minutes on court can produce eye-catching per-36 numbers from one hot night. Rates also do not always scale up: with more minutes a player faces tougher opponents, gets more tired and may take on a different role, so per-36 is a rough guide rather than a forecast.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A player scores 126 points in 270 minutes over 15 games. Per minute that is 126 ÷ 270 = 0.4667. Per 36 minutes is 16.8, per 40 is 18.67 and per 48 is 22.4. Per game is 126 ÷ 15 = 8.4 points.',
        ],
      },
    ],
    faq: [
      { q: 'What are per-36 stats for 126 points in 270 minutes?', a: '126 ÷ 270 = 0.4667 points per minute, so per 36 minutes it is 16.8. Per 40 is 18.67 and per 48 is 22.4.' },
      { q: 'What is the per-game average for 126 points in 15 games?', a: '126 ÷ 15 = 8.4 points per game.' },
      { q: 'Why use per-36 instead of per-game?', a: 'Per-game numbers depend on playing time. Per-36 scales everyone to the same minutes so bench and starting players can be compared.' },
      { q: 'Do per-36 numbers predict what happens with more minutes?', a: 'Not reliably. Efficiency, competition and fatigue change with more playing time, so treat it as an estimate.' },
      { q: 'Why are low-minute rates unreliable?', a: 'With few minutes, one good or bad game swings the rate a lot. The calculator flags totals under 100 minutes as a small sample.' },
    ],
  },
  related: ['shooting-efficiency', 'baseball-stats', 'pythagorean-win-expectation'],
  examples: [
    // 126/270 = 0.46667; x36 = 16.8; x40 = 18.6667; x48 = 22.4; 126/15 = 8.4
    { values: { stat: 126, minutes: 270, games: 15 }, expect: { perMin: 126 / 270, per36: 16.8, per40: 560 / 30, per48: 22.4, perGame: 8.4 }, tolerance: 1e-6 },
    // 240 min, 100 pts: 100/240 = 0.416667; x36 = 15; x48 = 20
    { values: { stat: 100, minutes: 240 }, expect: { per36: 15, per48: 20 }, tolerance: 1e-6 },
  ],
});
