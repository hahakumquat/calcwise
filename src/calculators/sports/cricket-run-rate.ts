import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

/** Parse cricket notation (12.3 = 12 overs 3 balls) into true overs, or an error message. */
function parseOvers(x: number, label: string): { overs: number } | { error: string } {
  if (x < 0) return { error: `${label} cannot be negative.` };
  const whole = Math.floor(x + 1e-9);
  const tenths = (x - whole) * 10;
  const balls = Math.round(tenths);
  if (Math.abs(tenths - balls) > 1e-6) return { error: `${label}: use cricket notation such as 12.3 (12 overs, 3 balls).` };
  if (balls > 5) return { error: `${label}: the balls digit must be 0 to 5 (12.6 is not valid; write 13.0).` };
  return { overs: whole + balls / 6 };
}

const r2 = (x: number) => x.toFixed(2);

export default defineCalculator({
  slug: 'cricket-run-rate',
  title: 'Cricket Run Rate and NRR Calculator',
  category: 'sports',
  description: 'Work out the current and required run rate in a chase from overs in cricket notation, plus net run rate (NRR) from two innings totals.',
  metaDescription: 'Cricket run rate calculator: current rate, required run rate for a target, and net run rate (NRR). Overs in cricket notation, so 12.3 means 12 overs 3 balls.',
  updated: '2026-11-28',
  keywords: ['cricket run rate calculator', 'required run rate calculator', 'net run rate calculator', 'NRR calculator', 'cricket overs calculator', 'current run rate'],
  inputs: [
    { id: 'target', label: 'Target (runs to win)', type: 'number', default: 180, min: 1, step: 1, info: 'The total the chasing side needs to reach. Enter the winning score, not the runs still needed.' },
    { id: 'runs', label: 'Runs scored so far', type: 'number', default: 98, min: 0, step: 1, info: 'The chasing side’s score at this moment.' },
    { id: 'overs', label: 'Overs bowled', type: 'number', default: 12.3, min: 0, step: 0.1, info: 'In cricket notation: 12.3 means 12 overs and 3 balls. The digit after the point is balls, 0 to 5.' },
    { id: 'matchOvers', label: 'Overs in the match', type: 'number', default: 20, min: 1, step: 1, info: 'The innings limit: 20 for T20, 50 for a one-day match, or a reduced figure after rain.' },
    { id: 'nrrScored', label: 'NRR: runs scored (optional)', type: 'number', optional: true, min: 0, step: 1, info: 'Total runs your side scored across the season or tournament. Fill in all four NRR boxes to get net run rate.' },
    { id: 'nrrFaced', label: 'NRR: overs faced (optional)', type: 'number', optional: true, min: 0, step: 0.1, info: 'Overs your side batted, in cricket notation. If you were all out, enter the full quota of overs.' },
    { id: 'nrrConceded', label: 'NRR: runs conceded (optional)', type: 'number', optional: true, min: 0, step: 1, info: 'Total runs the opposition scored against you.' },
    { id: 'nrrBowled', label: 'NRR: overs bowled (optional)', type: 'number', optional: true, min: 0, step: 0.1, info: 'Overs your side bowled, in cricket notation. If you bowled the opposition out, enter the full quota of overs.' },
  ],
  outputs: [
    { id: 'requiredRate', label: 'Required run rate', precision: 2, suffix: 'runs/over', primary: true, info: 'Runs still needed divided by overs remaining.' },
    { id: 'currentRate', label: 'Current run rate', precision: 2, suffix: 'runs/over', info: 'Runs scored divided by true overs bowled.' },
    { id: 'trueOvers', label: 'Overs bowled (decimal)', precision: 4, suffix: 'overs', info: 'Cricket notation converted to true overs: whole overs plus balls ÷ 6.' },
    { id: 'runsNeeded', label: 'Runs needed', format: 'integer', info: 'Target minus runs scored.' },
    { id: 'ballsLeft', label: 'Balls remaining', format: 'integer', info: 'Balls left in the innings.' },
    { id: 'nrr', label: 'Net run rate (NRR)', precision: 3, info: 'Runs scored per over faced minus runs conceded per over bowled. Shown when all four NRR boxes are filled.' },
  ],
  compute: (v) => {
    const target = num(v.target);
    const runs = num(v.runs);
    const oversIn = num(v.overs);
    const matchOvers = num(v.matchOvers);
    if (target === null || runs === null || oversIn === null || matchOvers === null) return { requiredRate: null };
    if (target <= 0 || matchOvers <= 0) return { requiredRate: null, error: 'Enter a target and match length above 0.' };
    if (runs < 0) return { requiredRate: null, error: 'Runs scored cannot be negative.' };
    const po = parseOvers(oversIn, 'Overs bowled');
    if ('error' in po) return { requiredRate: null, error: po.error };
    if (po.overs > matchOvers + 1e-9) return { requiredRate: null, error: `Overs bowled cannot be more than the ${matchOvers}-over limit.` };

    const overs = po.overs;
    const currentRate = overs > 0 ? runs / overs : null;
    const runsNeeded = Math.max(0, target - runs);
    const remaining = matchOvers - overs;
    const ballsLeft = Math.round(remaining * 6);
    const requiredRate = remaining > 1e-9 ? runsNeeded / remaining : null;

    // Optional net run rate: all four boxes needed.
    const ns = num(v.nrrScored);
    const nf = num(v.nrrFaced);
    const nc = num(v.nrrConceded);
    const nb = num(v.nrrBowled);
    let nrr: number | null = null;
    const steps: string[] = [];
    if (ns !== null && nf !== null && nc !== null && nb !== null) {
      const pf = parseOvers(nf, 'NRR overs faced');
      if ('error' in pf) return { requiredRate: null, error: pf.error };
      const pb = parseOvers(nb, 'NRR overs bowled');
      if ('error' in pb) return { requiredRate: null, error: pb.error };
      if (ns < 0 || nc < 0) return { requiredRate: null, error: 'NRR runs cannot be negative.' };
      if (pf.overs <= 0 || pb.overs <= 0) return { requiredRate: null, error: 'NRR overs faced and bowled must be above 0.' };
      nrr = ns / pf.overs - nc / pb.overs;
      steps.push(`NRR = ${ns} ÷ ${pf.overs.toFixed(4)} − ${nc} ÷ ${pb.overs.toFixed(4)} = ${nrr.toFixed(3)}`);
    }

    let tone: 'good' | 'ok' | 'warn' | 'bad' = 'ok';
    let badge: string;
    if (runsNeeded === 0) {
      tone = 'good';
      badge = 'Target reached';
    } else if (requiredRate === null) {
      tone = 'bad';
      badge = 'Innings over';
    } else if (currentRate !== null && requiredRate > currentRate * 1.5) {
      tone = 'warn';
      badge = `Need ${r2(requiredRate)} an over`;
    } else {
      badge = `Need ${r2(requiredRate)} an over`;
    }

    steps.unshift(
      `True overs = ${Math.floor(overs + 1e-9)} + ${Math.round((overs - Math.floor(overs + 1e-9)) * 6)}/6 = ${overs.toFixed(4)}`,
      currentRate !== null ? `Current rate = ${runs} ÷ ${overs.toFixed(4)} = ${r2(currentRate)}` : 'Current rate needs at least one ball bowled.',
      requiredRate !== null ? `Required rate = (${target} − ${runs}) ÷ (${matchOvers} − ${overs.toFixed(4)}) = ${r2(requiredRate)}` : 'No overs remain.',
    );

    const result: Record<string, unknown> = {
      trueOvers: overs,
      currentRate,
      runsNeeded,
      ballsLeft,
      requiredRate,
      nrr,
      tone,
      badge,
      note: 'For net run rate, an innings where a side is all out counts as the full quota of overs, not the overs actually faced.',
      steps,
    };
    if (currentRate !== null && requiredRate !== null) {
      result.chart = {
        type: 'bar',
        title: 'Runs per over',
        categories: ['Current rate', 'Required rate'],
        series: [{ name: 'Runs per over', values: [Math.round(currentRate * 100) / 100, Math.round(requiredRate * 100) / 100] }],
        highlight: 1,
      };
    }
    return result as ReturnType<Parameters<typeof defineCalculator>[0]['compute']>;
  },
  content: {
    formula: ['True overs = whole overs + balls ÷ 6', 'Current run rate = runs ÷ true overs', 'Required run rate = (target − runs) ÷ (match overs − true overs)', 'NRR = runs scored ÷ overs faced − runs conceded ÷ overs bowled'],
    body: [
      'Cricket writes overs as a decimal that is not really a decimal: 12.3 means 12 overs and 3 balls, and the digit after the point can only be 0 to 5 because six balls make an over. To do the maths, convert to true overs by dividing the balls by 6. So 12.3 is 12.5 true overs, and 19.2 is 19.3333.',
      'The current run rate is runs divided by true overs. The required run rate is the runs still needed divided by the overs left in the innings. If the required rate is well above the current rate, the chasing side has to accelerate.',
      'Net run rate (NRR) is the tie-break in many leagues: runs scored per over faced, minus runs conceded per over bowled. A side that is bowled out counts as having faced the full quota of overs, not the overs it actually batted. The same applies to the opposition when you bowl them out. Check the rules of your competition for rain-affected matches.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Chasing 180 in a 20-over match, a side is 98 after 12.3 overs. True overs are 12 + 3/6 = 12.5, so the current rate is 98 ÷ 12.5 = 7.84. They need 180 − 98 = 82 from 7.5 overs, a required rate of 82 ÷ 7.5 = 10.93.',
          'For NRR, say a side scored 160 in 20 overs (8.000 an over) and conceded 150 in 19.2 overs (150 ÷ 19.3333 = 7.759 an over). Net run rate is 8.000 − 7.759 = +0.241.',
        ],
      },
    ],
    faq: [
      { q: 'What does 12.3 overs mean in cricket?', a: '12 overs and 3 balls, which is 12 + 3/6 = 12.5 true overs. The digit after the point is balls and can only be 0 to 5.' },
      { q: 'What is the required run rate for 180 when a side is 98 after 12.3 overs in a 20-over game?', a: 'They need 82 runs from 7.5 overs, so the required rate is 82 ÷ 7.5 = 10.93 runs per over. The current rate is 98 ÷ 12.5 = 7.84.' },
      { q: 'How is net run rate calculated?', a: 'Runs scored divided by overs faced, minus runs conceded divided by overs bowled. Scoring 160 in 20 overs and conceding 150 in 19.2 overs gives 8.000 − 7.759 = +0.241.' },
      { q: 'How does NRR treat an all-out innings?', a: 'A side that is all out is counted as having faced the full quota of overs, not the overs actually used. Enter the full quota in the NRR boxes.' },
      { q: 'Why does the calculator reject 12.6?', a: 'Six balls make an over, so the balls digit only goes up to 5. Six balls after 12 overs is written 13.0.' },
    ],
    sources: [{ label: 'Laws of Cricket, MCC' , url: 'https://www.lords.org/mcc/the-laws-of-cricket' }],
  },
  related: ['bowling-average', 'baseball-stats', 'pythagorean-win-expectation'],
  examples: [
    // 12.3 -> 12 + 3/6 = 12.5; current 98/12.5 = 7.84; need 82 from 7.5 overs = 10.9333; balls left = 7.5*6 = 45
    { values: { target: 180, runs: 98, overs: 12.3, matchOvers: 20 }, expect: { trueOvers: 12.5, currentRate: 7.84, runsNeeded: 82, ballsLeft: 45, requiredRate: 82 / 7.5 }, tolerance: 1e-6 },
    // NRR: 160/20 = 8; 150/(19+2/6) = 7.758621; difference 0.241379
    { values: { target: 180, runs: 98, overs: 12.3, matchOvers: 20, nrrScored: 160, nrrFaced: 20, nrrConceded: 150, nrrBowled: 19.2 }, expect: { nrr: 8 - 150 / (19 + 2 / 6) }, tolerance: 1e-6 },
    // 50-over chase: 300 target, 150 after 25.0 overs: current 6, need 150 from 25 = 6
    { values: { target: 300, runs: 150, overs: 25, matchOvers: 50 }, expect: { currentRate: 6, requiredRate: 6, ballsLeft: 150 }, tolerance: 1e-6 },
  ],
});
