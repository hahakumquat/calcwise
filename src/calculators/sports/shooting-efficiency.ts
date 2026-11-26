import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'shooting-efficiency',
  title: 'Basketball Shooting Efficiency (eFG%, TS%)',
  category: 'sports',
  description: 'Work out FG%, effective field goal percentage (eFG%), true shooting percentage (TS%) and points per shot from a basketball box score line.',
  metaDescription: 'Calculate eFG%, true shooting percentage (TS%), FG% and points per shot from field goals, threes and free throws. Free basketball efficiency calculator.',
  updated: '2026-11-26',
  keywords: ['true shooting percentage calculator', 'eFG% calculator', 'effective field goal percentage', 'TS% calculator', 'basketball shooting efficiency', 'points per shot'],
  inputs: [
    { id: 'fgm', label: 'Field goals made (FGM)', type: 'number', default: 10, min: 0, step: 1, info: 'All made field goals, including three-pointers.' },
    { id: 'tpm', label: 'Three-pointers made (3PM)', type: 'number', default: 3, min: 0, step: 1, info: 'Made threes. These are already counted in field goals made.' },
    { id: 'fga', label: 'Field goals attempted (FGA)', type: 'number', default: 20, min: 0, step: 1, info: 'All field goal attempts, including threes.' },
    { id: 'ftm', label: 'Free throws made (FTM)', type: 'number', default: 5, min: 0, step: 1, info: 'Made free throws.' },
    { id: 'fta', label: 'Free throws attempted (FTA)', type: 'number', default: 6, min: 0, step: 1, info: 'Free throw attempts.' },
  ],
  outputs: [
    { id: 'ts', label: 'True shooting (TS%)', format: 'percent', precision: 1, primary: true, info: 'Points per scoring attempt, counting threes and free throws: PTS ÷ (2 × (FGA + 0.44 × FTA)).' },
    { id: 'efg', label: 'Effective FG% (eFG%)', format: 'percent', precision: 1, info: 'FG% adjusted so a made three counts 1.5 times a made two: (FGM + 0.5 × 3PM) ÷ FGA.' },
    { id: 'fg', label: 'Field goal % (FG%)', format: 'percent', precision: 1, info: 'Field goals made divided by attempted.' },
    { id: 'points', label: 'Points scored', format: 'integer', info: 'Calculated as 2 × FGM + 3PM + FTM.' },
    { id: 'pps', label: 'Points per field goal attempt', format: 'number', precision: 2, info: 'Total points divided by field goal attempts. Free throw points are included.' },
  ],
  compute: (v) => {
    const fgm = num(v.fgm);
    const tpm = num(v.tpm) ?? 0;
    const fga = num(v.fga);
    const ftm = num(v.ftm) ?? 0;
    const fta = num(v.fta) ?? 0;
    if (fgm === null || fga === null) return { ts: null };
    if ([fgm, tpm, fga, ftm, fta].some((x) => x < 0)) return { ts: null, error: 'Counts cannot be negative.' };
    if (fgm > fga) return { ts: null, error: 'Field goals made cannot be more than attempted.' };
    if (tpm > fgm) return { ts: null, error: 'Three-pointers made cannot be more than field goals made.' };
    if (ftm > fta) return { ts: null, error: 'Free throws made cannot be more than attempted.' };
    const tsa = fga + 0.44 * fta;
    if (tsa <= 0) return { ts: null, error: 'Enter at least one shot attempt.' };
    const points = 2 * fgm + tpm + ftm;
    const ts = points / (2 * tsa);
    const fg = fga > 0 ? fgm / fga : null;
    const efg = fga > 0 ? (fgm + 0.5 * tpm) / fga : null;
    const pps = fga > 0 ? points / fga : null;
    const round = (x: number | null) => (x === null ? 0 : Math.round(x * 1000) / 1000);
    return {
      ts, efg, fg, points, pps,
      chart: {
        type: 'bar', title: 'Shooting percentages', categories: ['FG%', 'eFG%', 'TS%'],
        series: [{ name: 'Percentage', values: [round(fg), round(efg), round(ts)] }],
        format: { format: 'percent', precision: 1 },
      },
      steps: [
        `Points = 2 × ${fgm} + ${tpm} + ${ftm} = ${points}`,
        fga > 0 ? `eFG% = (${fgm} + 0.5 × ${tpm}) ÷ ${fga} = ${((efg as number) * 100).toFixed(1)}%` : 'No field goal attempts, so FG% and eFG% are not defined.',
        `TS% = ${points} ÷ (2 × (${fga} + 0.44 × ${fta})) = ${points} ÷ ${(2 * tsa).toFixed(2)} = ${(ts * 100).toFixed(1)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Points = 2 × FGM + 3PM + FTM',
      'FG% = FGM ÷ FGA',
      'eFG% = (FGM + 0.5 × 3PM) ÷ FGA',
      'TS% = PTS ÷ (2 × (FGA + 0.44 × FTA))',
    ],
    body: [
      'Plain field goal percentage treats a three the same as a two, and ignores free throws. Effective field goal percentage (eFG%) fixes the first problem by giving a made three 1.5 times the credit of a made two. True shooting percentage (TS%) goes further and folds in free throws, so it measures points per scoring attempt.',
      'For example, a player who makes 10 of 20 field goals, with 3 threes, and 5 of 6 free throws scores 2 × 10 + 3 + 5 = 28 points. FG% is 50.0%, eFG% is (10 + 1.5) ÷ 20 = 57.5%, and TS% is 28 ÷ (2 × (20 + 2.64)) = 61.8%.',
      'The 0.44 factor estimates how many possessions free throw attempts use, since some trips to the line come in pairs, some are and-ones, and some are technicals. Because it is an estimate, TS% is a good comparison tool rather than an exact count.',
      'Points are calculated from your inputs (two points per field goal, one extra per three, one per free throw), so you do not enter them separately.',
    ],
    faq: [
      { q: 'How do you calculate eFG%?', a: 'Add half your made threes to your made field goals, then divide by field goal attempts. 10 makes including 3 threes on 20 attempts is (10 + 1.5) ÷ 20 = 57.5%.' },
      { q: 'How do you calculate true shooting percentage?', a: 'Divide points by twice the sum of field goal attempts and 0.44 times free throw attempts. 28 points on 20 FGA and 6 FTA is 28 ÷ (2 × 22.64) = 61.8%.' },
      { q: 'What is a good TS%?', a: 'It varies by era, but league average has been around 55 to 58% in recent NBA seasons, and 60% or more is generally considered very efficient. Compare with the league average for the season you care about.' },
      { q: 'Why is TS% higher than FG%?', a: 'Threes and free throws both add points per attempt. A player who shoots 50% on twos and gets to the line often will usually have a TS% above their FG%.' },
      { q: 'Why 0.44 for free throws?', a: 'It is an empirical estimate of the share of free throw attempts that end a possession, so it is not an exact count.' },
    ],
    sources: [
      { label: 'Basketball-Reference glossary: definitions of eFG% and TS%', url: 'https://www.basketball-reference.com/about/glossary.html' },
    ],
  },
  related: ['one-rep-max', 'baseball-stats', 'elo-rating'],
  examples: [
    // pts = 20+3+5 = 28; FG = 10/20; eFG = 11.5/20 = .575; TS = 28/(2*22.64) = 28/45.28; PPS = 28/20 = 1.4
    { values: { fgm: 10, tpm: 3, fga: 20, ftm: 5, fta: 6 }, expect: { points: 28, fg: 0.5, efg: 0.575, ts: 28 / 45.28, pps: 1.4 }, tolerance: 1e-9 },
    // no threes, no free throws: pts = 16; every rate = 50%
    { values: { fgm: 8, tpm: 0, fga: 16, ftm: 0, fta: 0 }, expect: { points: 16, fg: 0.5, efg: 0.5, ts: 0.5, pps: 1 }, tolerance: 1e-9 },
    // 5 of 10, all threes: pts = 10+5 = 15; eFG = 7.5/10; TS = 15/20
    { values: { fgm: 5, tpm: 5, fga: 10, ftm: 0, fta: 0 }, expect: { points: 15, fg: 0.5, efg: 0.75, ts: 0.75, pps: 1.5 }, tolerance: 1e-9 },
  ],
});
