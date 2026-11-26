import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'pythagorean-win-expectation',
  title: 'Pythagorean Win Expectation Calculator',
  category: 'sports',
  description: 'Estimate a team\'s expected win percentage and wins from runs or points scored and allowed, with an adjustable exponent, and compare to actual wins.',
  metaDescription: 'Pythagorean expectation calculator: expected win % and wins from runs or points scored and allowed, with an editable exponent. Free, for baseball and more.',
  updated: '2026-11-26',
  keywords: ['pythagorean win expectation', 'pythagorean expectation calculator', 'expected wins calculator', 'pythagenpat', 'runs scored runs allowed win percentage', 'baseball pythagorean theorem'],
  inputs: [
    { id: 'scored', label: 'Runs or points scored', type: 'number', default: 800, min: 0, step: 1, info: 'Total scored by the team over the games you are projecting.' },
    { id: 'allowed', label: 'Runs or points allowed', type: 'number', default: 700, min: 0, step: 1, info: 'Total allowed by the team over the same games.' },
    { id: 'games', label: 'Games played', type: 'number', default: 162, min: 1, step: 1, info: '162 for an MLB season, 82 for the NBA, 17 for the NFL.' },
    { id: 'exponent', label: 'Exponent', type: 'number', default: 2, min: 0.1, max: 20, step: 0.01, info: 'Original formula uses 2. Baseball is often fit at about 1.83, the NBA near 14 and the NFL near 2.37. It is an editable assumption.' },
    { id: 'wins', label: 'Actual wins (optional)', type: 'number', default: 0, optional: true, min: 0, step: 1, info: 'Leave at 0 to skip. Used to show how far the team is above or below expectation.' },
  ],
  outputs: [
    { id: 'pct', label: 'Expected win %', format: 'percent', precision: 1, primary: true, info: 'RS^x ÷ (RS^x + RA^x).' },
    { id: 'expWins', label: 'Expected wins', format: 'number', precision: 2, info: 'Expected win % times games played.' },
    { id: 'expLosses', label: 'Expected losses', format: 'number', precision: 2, info: 'Games played minus expected wins (ties ignored).' },
    { id: 'over', label: 'Actual wins vs expected', format: 'number', precision: 2, info: 'Actual wins minus expected wins. Positive means the team has beaten its run differential.' },
  ],
  compute: (v) => {
    const rs = num(v.scored);
    const ra = num(v.allowed);
    const g = num(v.games);
    const x = num(v.exponent);
    const w0 = num(v.wins);
    const w = w0 === null || w0 === 0 ? null : w0;
    if (rs === null || ra === null || g === null || x === null) return { pct: null };
    if (rs <= 0 || ra <= 0) return { pct: null, error: 'Runs or points scored and allowed must both be above zero.' };
    if (g < 1) return { pct: null, error: 'Games played must be at least 1.' };
    if (x <= 0) return { pct: null, error: 'The exponent must be above zero.' };
    if (w !== null && (w < 0 || w > g)) return { pct: null, error: 'Actual wins must be between 0 and games played.' };
    // RS^x / (RS^x + RA^x) rewritten as 1 / (1 + (RA/RS)^x) to avoid overflow
    const pct = 1 / (1 + Math.pow(ra / rs, x));
    const expWins = pct * g;
    const expLosses = g - expWins;
    const over = w === null ? null : w - expWins;
    const round = (n: number) => Math.round(n * 100) / 100;
    const categories = ['Expected wins', 'Expected losses'];
    const values = [round(expWins), round(expLosses)];
    if (w !== null) { categories.push('Actual wins'); values.push(w); }
    const tone = over === null ? (pct >= 0.5 ? 'good' as const : 'warn' as const) : over > 0 ? 'good' as const : over < 0 ? 'warn' as const : 'ok' as const;
    const badge = over === null
      ? (pct >= 0.5 ? 'Above .500 pace' : 'Below .500 pace')
      : over === 0 ? 'Right on expectation' : `${over > 0 ? '+' : ''}${over.toFixed(2)} wins vs expected`;
    return {
      pct, expWins, expLosses, over, tone, badge,
      chart: {
        type: 'bar', title: 'Expected record', categories,
        series: [{ name: 'Games', values }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Win % = ${rs}^${x} ÷ (${rs}^${x} + ${ra}^${x}) = ${(pct * 100).toFixed(2)}%`,
        `Expected wins = ${pct.toFixed(4)} × ${g} = ${expWins.toFixed(2)}`,
        ...(over === null ? [] : [`Actual minus expected = ${w} − ${expWins.toFixed(2)} = ${over.toFixed(2)}`]),
      ],
    };
  },
  content: {
    formula: [
      'Expected win % = RS^x ÷ (RS^x + RA^x)',
      'Expected wins = expected win % × games',
      'RS = runs or points scored, RA = allowed, x = exponent (2 in the original)',
    ],
    body: [
      'Pythagorean expectation, introduced by Bill James, estimates how many games a team should have won from how many runs or points it scored and allowed. Teams that win a lot of close games, or lose a lot of blowouts, often finish above or below it, so it is a quick luck check.',
      'For example, a team that scores 800 and allows 700 over 162 games has 800² ÷ (800² + 700²) = 640,000 ÷ 1,130,000 = 0.5664, or about 91.75 expected wins. If it actually won 95, it beat expectation by about 3.25 wins.',
      'The exponent is an assumption. 2 is the classic value, and about 1.83 fits baseball slightly better. Other sports need other exponents, so change it to match your league. The result is an estimate, not a prediction.',
    ],
    faq: [
      { q: 'What is Pythagorean win expectation?', a: 'It is a formula that estimates win percentage from points or runs scored and allowed: RS^x ÷ (RS^x + RA^x). With 800 scored, 700 allowed and an exponent of 2, it gives 0.5664.' },
      { q: 'How many wins is that over a season?', a: 'Multiply the win percentage by games played. 0.5664 × 162 is about 91.75 expected wins.' },
      { q: 'What exponent should I use?', a: 'Use 2 for the classic formula, about 1.83 for baseball, and a league-specific value for other sports. It is editable here, and changing it changes the result.' },
      { q: 'What does actual wins vs expected mean?', a: 'It is actual wins minus expected wins. 95 actual wins against 91.75 expected is +3.25, which suggests some luck in close games.' },
      { q: 'Is this related to the Pythagorean theorem?', a: 'Only by name. The formula resembles a^2 + b^2, but it is a statistical fit, not geometry.' },
    ],
    sources: [
      { label: 'Baseball-Reference: Pythagorean Theorem of Baseball', url: 'https://www.baseball-reference.com/bullpen/Pythagorean_Theorem_of_Baseball' },
    ],
  },
  related: ['baseball-stats', 'elo-rating', 'shooting-efficiency'],
  examples: [
    // 800^2 / (800^2 + 700^2) = 640000 / 1130000 = 0.566372; x 162 = 91.7522
    { values: { scored: 800, allowed: 700, games: 162, exponent: 2 }, expect: { pct: 640000 / 1130000, expWins: (640000 / 1130000) * 162 }, tolerance: 1e-9 },
    // 650^2 / (650^2 + 750^2) = 422500 / 985000 = 0.428934; x 162 = 69.49
    { values: { scored: 650, allowed: 750, games: 162, exponent: 2 }, expect: { pct: 422500 / 985000, expWins: (422500 / 985000) * 162 }, tolerance: 1e-9 },
    // 95 actual wins - 91.7522 = +3.2478 (about +3.25)
    { values: { scored: 800, allowed: 700, games: 162, exponent: 2, wins: 95 }, expect: { over: 95 - (640000 / 1130000) * 162 }, tolerance: 1e-9 },
  ],
});
