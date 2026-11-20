import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Innings are written in baseball notation: 200.1 = 200 and 1/3, 200.2 = 200 and 2/3.
function parseInnings(raw: unknown): number | null {
  const n = num(raw);
  if (n === null || n < 0) return null;
  const whole = Math.floor(n + 1e-9);
  const outs = Math.round((n - whole) * 10);
  if (outs > 2 || Math.abs((n - whole) * 10 - outs) > 1e-6) return null;
  return whole + outs / 3;
}

export default defineCalculator({
  slug: 'baseball-stats',
  title: 'Baseball Stats Calculator (OPS, ERA, WHIP)',
  category: 'sports',
  description: 'Calculate batting average, on-base percentage, slugging and OPS for a hitter, or ERA and WHIP for a pitcher, from raw season totals.',
  metaDescription: 'Work out batting average, OBP, SLG and OPS for hitters, or ERA and WHIP for pitchers, from your counting stats. Free baseball stats calculator.',
  updated: '2026-11-20',
  keywords: ['baseball stats calculator', 'batting average calculator', 'OBP calculator', 'OPS calculator', 'ERA calculator', 'WHIP calculator', 'slugging percentage'],
  inputs: [
    {
      id: 'mode', label: 'Player type', type: 'select', default: 'batter',
      options: [{ value: 'batter', label: 'Batter' }, { value: 'pitcher', label: 'Pitcher' }],
      info: 'Choose Batter for AVG, OBP, SLG and OPS, or Pitcher for ERA and WHIP.',
    },
    { id: 'ab', label: 'At bats (AB)', type: 'number', default: 500, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Official at bats. Walks, hit by pitch and sacrifice flies are not at bats.' },
    { id: 'h', label: 'Hits (H)', type: 'number', default: 150, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Total hits, including doubles, triples and home runs.' },
    { id: 'doubles', label: 'Doubles (2B)', type: 'number', default: 30, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Hits that are doubles. These are already counted in hits.' },
    { id: 'triples', label: 'Triples (3B)', type: 'number', default: 3, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Hits that are triples. These are already counted in hits.' },
    { id: 'hr', label: 'Home runs (HR)', type: 'number', default: 20, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Hits that are home runs. These are already counted in hits.' },
    { id: 'bb', label: 'Walks (BB)', type: 'number', default: 60, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Bases on balls, including intentional walks.' },
    { id: 'hbp', label: 'Hit by pitch (HBP)', type: 'number', default: 5, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Times hit by a pitch.' },
    { id: 'sf', label: 'Sacrifice flies (SF)', type: 'number', default: 5, min: 0, step: 1, showWhen: { input: 'mode', is: 'batter' }, info: 'Sacrifice flies. They count in on-base percentage but not at bats.' },
    { id: 'ip', label: 'Innings pitched (IP)', type: 'number', default: 200, min: 0, step: 0.1, showWhen: { input: 'mode', is: 'pitcher' }, info: 'Use baseball notation: 200.1 means 200 and 1/3 innings, 200.2 means 200 and 2/3. Only .0, .1 and .2 are valid.' },
    { id: 'er', label: 'Earned runs (ER)', type: 'number', default: 70, min: 0, step: 1, showWhen: { input: 'mode', is: 'pitcher' }, info: 'Earned runs allowed, not total runs.' },
    { id: 'pbb', label: 'Walks allowed (BB)', type: 'number', default: 50, min: 0, step: 1, showWhen: { input: 'mode', is: 'pitcher' }, info: 'Walks the pitcher issued.' },
    { id: 'ph', label: 'Hits allowed (H)', type: 'number', default: 180, min: 0, step: 1, showWhen: { input: 'mode', is: 'pitcher' }, info: 'Hits the pitcher gave up.' },
  ],
  outputs: [
    { id: 'avg', label: 'Batting average (AVG)', format: 'number', precision: 3, primary: true, showWhen: { input: 'mode', is: 'batter' }, info: 'Hits divided by at bats.' },
    { id: 'obp', label: 'On-base percentage (OBP)', format: 'number', precision: 3, showWhen: { input: 'mode', is: 'batter' }, info: 'How often the batter reaches base: (H + BB + HBP) ÷ (AB + BB + HBP + SF).' },
    { id: 'slg', label: 'Slugging (SLG)', format: 'number', precision: 3, showWhen: { input: 'mode', is: 'batter' }, info: 'Total bases divided by at bats.' },
    { id: 'ops', label: 'OPS', format: 'number', precision: 3, showWhen: { input: 'mode', is: 'batter' }, info: 'On-base percentage plus slugging.' },
    { id: 'tb', label: 'Total bases', format: 'integer', showWhen: { input: 'mode', is: 'batter' }, info: 'Singles + 2 × doubles + 3 × triples + 4 × home runs.' },
    { id: 'era', label: 'Earned run average (ERA)', format: 'number', precision: 2, primary: true, showWhen: { input: 'mode', is: 'pitcher' }, info: 'Earned runs allowed per nine innings.' },
    { id: 'whip', label: 'WHIP', format: 'number', precision: 2, showWhen: { input: 'mode', is: 'pitcher' }, info: 'Walks plus hits allowed per inning pitched.' },
    { id: 'ipTrue', label: 'Innings as a decimal', format: 'number', precision: 3, suffix: 'IP', showWhen: { input: 'mode', is: 'pitcher' }, info: 'Your innings converted from thirds to a true decimal, which is what the formulas use.' },
  ],
  compute: (v) => {
    if (v.mode === 'pitcher') {
      const ip = parseInnings(v.ip);
      const er = num(v.er);
      const bb = num(v.pbb);
      const h = num(v.ph);
      if (ip === null) return { era: null, error: 'Enter innings like 200, 200.1 or 200.2 (only .0, .1 and .2 are valid).' };
      if (er === null || bb === null || h === null || er < 0 || bb < 0 || h < 0) return { era: null };
      if (ip <= 0) return { era: null, error: 'Innings pitched must be above zero.' };
      const era = (9 * er) / ip;
      const whip = (bb + h) / ip;
      return {
        era, whip, ipTrue: ip,
        chart: {
          type: 'bar', title: 'Your ERA and WHIP', categories: ['ERA', 'WHIP'],
          series: [{ name: 'Value', values: [Math.round(era * 100) / 100, Math.round(whip * 100) / 100] }],
          format: { format: 'number', precision: 2 },
        },
        steps: [
          `ERA = 9 × ${er} ÷ ${ip.toFixed(3)} = ${era.toFixed(2)}`,
          `WHIP = (${bb} + ${h}) ÷ ${ip.toFixed(3)} = ${whip.toFixed(2)}`,
        ],
      };
    }
    const ab = num(v.ab);
    const h = num(v.h);
    const d = num(v.doubles) ?? 0;
    const t = num(v.triples) ?? 0;
    const hr = num(v.hr) ?? 0;
    const bb = num(v.bb) ?? 0;
    const hbp = num(v.hbp) ?? 0;
    const sf = num(v.sf) ?? 0;
    if (ab === null || h === null) return { avg: null };
    if ([ab, h, d, t, hr, bb, hbp, sf].some((x) => x < 0)) return { avg: null, error: 'Counts cannot be negative.' };
    if (h > ab) return { avg: null, error: 'Hits cannot be more than at bats.' };
    if (d + t + hr > h) return { avg: null, error: 'Doubles, triples and home runs together cannot be more than hits.' };
    if (ab === 0) return { avg: null, error: 'Enter at least one at bat.' };
    const singles = h - d - t - hr;
    const tb = singles + 2 * d + 3 * t + 4 * hr;
    const avg = h / ab;
    const obp = (h + bb + hbp) / (ab + bb + hbp + sf);
    const slg = tb / ab;
    return {
      avg, obp, slg, ops: obp + slg, tb,
      chart: {
        type: 'bar', title: 'Your slash line', categories: ['AVG', 'OBP', 'SLG', 'OPS'],
        series: [{ name: 'Value', values: [avg, obp, slg, obp + slg].map((x) => Math.round(x * 1000) / 1000) }],
        format: { format: 'number', precision: 3 },
      },
      steps: [
        `Singles = ${h} − ${d} − ${t} − ${hr} = ${singles}; total bases = ${tb}`,
        `AVG = ${h} ÷ ${ab} = ${avg.toFixed(3)}`,
        `OBP = ${h + bb + hbp} ÷ ${ab + bb + hbp + sf} = ${obp.toFixed(3)}`,
        `SLG = ${tb} ÷ ${ab} = ${slg.toFixed(3)}; OPS = ${(obp + slg).toFixed(3)}`,
      ],
    };
  },
  content: {
    formula: [
      'AVG = H ÷ AB',
      'OBP = (H + BB + HBP) ÷ (AB + BB + HBP + SF)',
      'SLG = TB ÷ AB, where TB = 1B + 2×2B + 3×3B + 4×HR',
      'OPS = OBP + SLG',
      'ERA = 9 × ER ÷ IP',
      'WHIP = (BB + H) ÷ IP',
    ],
    body: [
      'Batting average is hits divided by at bats. It ignores walks and treats every hit alike, which is why on-base percentage and slugging were added. OBP counts walks and hit by pitch; SLG weights extra-base hits by the bases they earn. OPS adds the two together.',
      'For example, 150 hits in 500 at bats is a .300 average. With 60 walks, 5 hit by pitch and 5 sacrifice flies, the on-base percentage is 215 ÷ 570 = .377. With 30 doubles, 3 triples and 20 home runs, total bases are 97 + 60 + 9 + 80 = 246, so slugging is .492 and OPS is .869.',
      'Pitchers are measured per inning. ERA is earned runs per nine innings: 70 earned runs in 200 innings is 9 × 70 ÷ 200 = 3.15. WHIP is walks plus hits per inning: (50 + 180) ÷ 200 = 1.15.',
      'Innings are counted in thirds, written .1 and .2. So 200.1 is 200⅓ innings, not 200.1 as a decimal, and this calculator converts it for you.',
    ],
    faq: [
      { q: 'How do you calculate batting average?', a: 'Divide hits by at bats. 150 hits in 500 at bats is 150 ÷ 500 = .300.' },
      { q: 'Why does OBP use sacrifice flies but AVG does not?', a: 'A sacrifice fly is not charged as an at bat, so it is absent from batting average. On-base percentage counts it in the denominator because the batter made an out.' },
      { q: 'What is a good OPS?', a: 'It depends on the league and season. As a rough guide, .700 is around average in recent MLB seasons, and .900 or higher is star level. Compare with the league average for the year you care about.' },
      { q: 'How do I enter partial innings?', a: 'Use baseball notation: 200.1 is 200 and one third, 200.2 is 200 and two thirds. The calculator converts them, so 70 earned runs in 200.1 innings gives an ERA of 3.14.' },
      { q: 'Does ERA include unearned runs?', a: 'No. Only earned runs count, so enter earned runs rather than total runs allowed.' },
    ],
    sources: [
      { label: 'MLB Glossary: official definitions of AVG, OBP, SLG, OPS, ERA and WHIP', url: 'https://www.mlb.com/glossary' },
    ],
  },
  related: ['pace', 'one-rep-max'],
  examples: [
    // 1B = 150-30-3-20 = 97; TB = 97+60+9+80 = 246; OBP = 215/570; SLG = 246/500 = .492
    { values: { mode: 'batter', ab: 500, h: 150, doubles: 30, triples: 3, hr: 20, bb: 60, hbp: 5, sf: 5 }, expect: { avg: 0.3, obp: 215 / 570, slg: 0.492, ops: 215 / 570 + 0.492, tb: 246 }, tolerance: 1e-9 },
    { values: { mode: 'pitcher', ip: 200, er: 70, pbb: 50, ph: 180 }, expect: { era: 3.15, whip: 1.15, ipTrue: 200 }, tolerance: 1e-9 },
    // 200.1 = 200 1/3 IP; ERA = 630 / (601/3) = 1890/601
    { values: { mode: 'pitcher', ip: 200.1, er: 70, pbb: 50, ph: 180 }, expect: { era: 1890 / 601, whip: 690 / 601 }, tolerance: 1e-9 },
  ],
});
