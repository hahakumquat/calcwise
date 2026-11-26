import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const r1 = (x: number) => Math.round(x * 10) / 10;
const signed = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(1)}`;

export default defineCalculator({
  slug: 'elo-rating',
  title: 'Elo Rating Calculator: Expected Score & Change',
  category: 'sports',
  description: 'Enter your Elo rating, your opponent\'s rating, the K factor and the result to get your expected score, the rating change and your new rating.',
  keywords: ['elo rating calculator', 'elo calculator', 'chess rating change', 'elo expected score', 'elo k factor', 'elo win probability'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'you', label: 'Your rating', type: 'number', default: 1500, min: 0, step: 1, info: 'Your current Elo rating before the game.' },
    { id: 'opp', label: 'Opponent rating', type: 'number', default: 1700, min: 0, step: 1, info: 'Your opponent\'s rating before the game.' },
    { id: 'k', label: 'K factor (editable)', type: 'number', default: 32, min: 0, step: 1, info: 'How far one game can move a rating. 32 is a common default. Federations and sites set their own K, often 10 to 40.' },
    {
      id: 'result', label: 'Result', type: 'select', default: '1', segmented: true,
      options: [{ value: '1', label: 'Win' }, { value: '0.5', label: 'Draw' }, { value: '0', label: 'Loss' }],
      info: 'Actual score S: win 1, draw 0.5, loss 0.',
    },
  ],
  outputs: [
    { id: 'newRating', label: 'New rating', format: 'number', precision: 1, primary: true, info: 'Your rating plus the change, to one decimal.' },
    { id: 'change', label: 'Rating change', format: 'number', precision: 1, info: 'K × (S − E). Positive means you gain points.' },
    { id: 'expected', label: 'Expected score', format: 'number', precision: 4, info: 'E = 1 ÷ (1 + 10^((opponent − you) ÷ 400)). Roughly your win chance, counting a draw as half.' },
    { id: 'oppChange', label: 'Opponent change (same K)', format: 'number', precision: 1, info: 'The opponent gains exactly what you lose if both use the same K.' },
  ],
  compute: (v) => {
    const you = num(v.you);
    const opp = num(v.opp);
    const k = num(v.k);
    const s = Number(v.result);
    if (you === null || opp === null || k === null || k < 0 || ![0, 0.5, 1].includes(s)) return { newRating: null };
    const e = 1 / (1 + Math.pow(10, (opp - you) / 400));
    const change = k * (s - e);
    const label = s === 1 ? 'Win' : s === 0.5 ? 'Draw' : 'Loss';
    const c = r1(change);
    return {
      newRating: r1(you + change),
      change: c,
      expected: e,
      oppChange: -c,
      tone: change > 0 ? 'good' as const : change < 0 ? 'warn' as const : 'ok' as const,
      badge: `${label}: ${signed(c)} points`,
      note: `Expected score ${e.toFixed(4)} against a ${opp} opponent. Federations use their own K and rules, so official ratings may differ.`,
      chart: { type: 'bar' as const, title: 'Rating before and after', categories: ['Before', 'After'], series: [{ name: 'Rating', values: [you, r1(you + change)] }], format: { format: 'integer' as const } },
      steps: [
        `Expected score E = 1 ÷ (1 + 10^((${opp} − ${you}) ÷ 400)) = ${e.toFixed(4)}`,
        `Change = K × (S − E) = ${k} × (${s} − ${e.toFixed(4)}) = ${signed(c)}`,
        `New rating = ${you} ${change < 0 ? '−' : '+'} ${Math.abs(c).toFixed(1)} = ${r1(you + change).toFixed(1)}`,
      ],
    };
  },
  content: {
    formula: [
      'Expected score E = 1 ÷ (1 + 10^((opponent − you) ÷ 400))',
      'Actual score S = 1 for a win, 0.5 for a draw, 0 for a loss',
      'New rating = your rating + K × (S − E)',
    ],
    body: [
      'The Elo system predicts how many points you should score against an opponent from the rating gap, then moves your rating by how far the real result beat or missed that prediction. A gap of 400 points means the stronger player is expected to score about 91%.',
      'Example: you are 1500, your opponent is 1700, K is 32 and you win. E is 0.2402, so the change is 32 × (1 − 0.2402) = +24.3 and your new rating is 1524.3. If the opponent uses the same K they lose 24.3. Another: 1800 against 1500 with a loss gives E 0.8490, a change of −27.2 and a new rating of 1772.8.',
      'Federations, chess sites and games use their own K factors, rating floors and rules for new players, so this is the basic formula and may not match an official rating exactly. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What does the expected score mean?', a: 'It is the points you are predicted to score in one game, counting a win as 1 and a draw as 0.5. At 1500 against 1700 it is 0.2402.' },
      { q: 'What K factor should I use?', a: 'Use the K your federation or site uses. This calculator defaults to 32 and you can edit it. A higher K moves ratings faster.' },
      { q: 'Does a draw ever change my rating?', a: 'Yes, unless you are rated equally. A draw gives S = 0.5, so the higher-rated player loses points and the lower-rated player gains. At 1600 against 1600 a draw changes nothing.' },
      { q: 'Does my opponent lose what I gain?', a: 'Only if both ratings use the same K. In the 1500 versus 1700 win with K 32, the opponent loses 24.3 points.' },
    ],
    sources: [],
  },
  related: ['probability', 'expected-value', 'percent-difference'],
  examples: [
    // E = 1/(1+10^0.5) = 1/4.16228 = 0.240253; change = 32*(1-0.240253) = 24.3119 -> 24.3; new 1524.3
    { values: { you: 1500, opp: 1700, k: 32, result: '1' }, expect: { expected: 0.2403, change: 24.3, newRating: 1524.3, oppChange: -24.3 }, tolerance: 1e-3 },
    // E = 1/(1+10^-0.75) = 1/1.177828 = 0.849020; change = 32*(0-0.84902) = -27.1686 -> -27.2; new 1772.8
    { values: { you: 1800, opp: 1500, k: 32, result: '0' }, expect: { expected: 0.849, change: -27.2, newRating: 1772.8 }, tolerance: 1e-3 },
    // Equal ratings: E = 0.5, draw S = 0.5, change 0
    { values: { you: 1600, opp: 1600, k: 20, result: '0.5' }, expect: { expected: 0.5, change: 0, newRating: 1600 } },
  ],
});
