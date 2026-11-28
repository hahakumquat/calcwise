import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtDuration } from '../../lib/helpers/health';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
// Standard race distances: swim in metres, bike and run in kilometres.
const RACES: Record<string, { name: string; swim: number; bike: number; run: number }> = {
  sprint: { name: 'Sprint', swim: 750, bike: 20, run: 5 },
  olympic: { name: 'Olympic', swim: 1500, bike: 40, run: 10 },
  half: { name: '70.3 (half-distance)', swim: 1900, bike: 90, run: 21.0975 },
  full: { name: 'Ironman (full-distance)', swim: 3800, bike: 180, run: 42.195 },
};

export default defineCalculator({
  slug: 'triathlon-time',
  title: 'Triathlon Finish Time Calculator',
  category: 'sports',
  description: 'Estimate your triathlon finish time from swim pace, bike speed, run pace and transitions for sprint, Olympic, 70.3 and Ironman races, with a split chart.',
  keywords: ['triathlon finish time calculator', 'triathlon pace calculator', 'ironman time calculator', '70.3 finish time', 'olympic triathlon time', 'sprint triathlon time', 'triathlon splits'],
  updated: '2026-11-28',
  popular: false,
  inputs: [
    {
      id: 'race', label: 'Race distance', type: 'select', default: 'olympic',
      options: [
        { value: 'sprint', label: 'Sprint (750 m / 20 km / 5 km)' },
        { value: 'olympic', label: 'Olympic (1.5 km / 40 km / 10 km)' },
        { value: 'half', label: '70.3 (1.9 km / 90 km / 21.1 km)' },
        { value: 'full', label: 'Ironman (3.8 km / 180 km / 42.2 km)' },
      ],
      info: 'Standard race distances. Real courses vary a little.',
    },
    { id: 'swimMin', label: 'Swim pace per 100 m — minutes', type: 'number', suffix: 'min', default: 2, min: 0, step: 1, info: 'Minutes part of your swim pace per 100 m.' },
    { id: 'swimSec', label: 'Swim pace per 100 m — seconds', type: 'number', suffix: 's', default: 0, min: 0, step: 1, info: 'Seconds part of your swim pace per 100 m.' },
    { id: 'bikeSpeed', label: 'Bike speed', type: 'number', suffix: 'km/h', default: 30, min: 1, step: 0.5, info: 'Average speed on the bike leg.' },
    { id: 'runMin', label: 'Run pace per km — minutes', type: 'number', suffix: 'min', default: 5, min: 0, step: 1, info: 'Minutes part of your run pace per kilometre.' },
    { id: 'runSec', label: 'Run pace per km — seconds', type: 'number', suffix: 's', default: 30, min: 0, step: 1, info: 'Seconds part of your run pace per kilometre.' },
    { id: 't1', label: 'T1 (swim to bike)', type: 'number', suffix: 'min', default: 2, min: 0, step: 0.5, info: 'Time in the first transition.' },
    { id: 't2', label: 'T2 (bike to run)', type: 'number', suffix: 'min', default: 1, min: 0, step: 0.5, info: 'Time in the second transition.' },
  ],
  outputs: [
    { id: 'total', label: 'Finish time', format: 'text', primary: true, info: 'Swim + T1 + bike + T2 + run.' },
    { id: 'swim', label: 'Swim', format: 'text', info: 'Swim distance at your swim pace.' },
    { id: 'bike', label: 'Bike', format: 'text', info: 'Bike distance at your average speed.' },
    { id: 'run', label: 'Run', format: 'text', info: 'Run distance at your run pace.' },
    { id: 'transitions', label: 'Transitions', format: 'text', info: 'Time spent in the two transitions, T1 and T2 added together.' },
  ],
  compute: (v) => {
    const race = RACES[String(v.race)] ?? RACES.olympic;
    const sm = num(v.swimMin) ?? 0;
    const ss = num(v.swimSec) ?? 0;
    const speed = num(v.bikeSpeed);
    const rm = num(v.runMin) ?? 0;
    const rs = num(v.runSec) ?? 0;
    const t1 = num(v.t1) ?? 0;
    const t2 = num(v.t2) ?? 0;
    const swimPace = sm * 60 + ss;
    const runPace = rm * 60 + rs;
    if (sm < 0 || ss < 0 || swimPace <= 0) return { total: null, error: 'Enter your swim pace per 100 m.' };
    if (speed === null || speed <= 0) return { total: null, error: 'Enter your average bike speed in km/h.' };
    if (rm < 0 || rs < 0 || runPace <= 0) return { total: null, error: 'Enter your run pace per km.' };
    if (t1 < 0 || t2 < 0) return { total: null, error: 'Transition times cannot be negative.' };
    const swimT = (race.swim / 100) * swimPace;
    const bikeT = (race.bike / speed) * 3600;
    const runT = race.run * runPace;
    const trans = (t1 + t2) * 60;
    const total = swimT + bikeT + runT + trans;
    return {
      total: fmtDuration(total),
      swim: fmtDuration(swimT),
      bike: fmtDuration(bikeT),
      run: fmtDuration(runT),
      transitions: fmtDuration(trans),
      tone: 'ok',
      badge: fmtDuration(total),
      note: `${race.name}: swim ${fmtDuration(swimT)}, bike ${fmtDuration(bikeT)}, run ${fmtDuration(runT)} and ${fmtDuration(trans)} in transitions add up to ${fmtDuration(total)}. The bike is ${fmt((bikeT / total) * 100, 0)}% of your race.`,
      chart: {
        type: 'donut' as const,
        title: 'Where the time goes',
        slices: [
          { label: 'Swim', value: swimT },
          { label: 'Bike', value: bikeT },
          { label: 'Run', value: runT },
          { label: 'Transitions', value: trans },
        ].filter((s) => s.value > 0),
        centerLabel: 'Finish',
        centerValue: fmtDuration(total),
      },
      steps: [
        `Swim = ${fmt(race.swim, 0)} m ÷ 100 × ${fmt(swimPace, 0)} s = ${fmt(swimT, 0)} s = ${fmtDuration(swimT)}`,
        `Bike = ${fmt(race.bike, 0)} km ÷ ${fmt(speed, 1)} km/h = ${fmt(bikeT / 3600, 3)} h = ${fmtDuration(bikeT)}`,
        `Run = ${fmt(race.run, 4)} km × ${fmt(runPace, 0)} s = ${fmt(runT, 0)} s = ${fmtDuration(runT)}`,
        `Transitions = ${fmt(t1, 1)} + ${fmt(t2, 1)} min = ${fmtDuration(trans)}`,
        `Total = ${fmtDuration(total)}`,
      ],
    };
  },
  content: {
    formula: ['Swim time = swim distance ÷ 100 × pace per 100 m', 'Bike time = bike distance ÷ average speed', 'Run time = run distance × pace per km', 'Finish time = swim + T1 + bike + T2 + run'],
    body: [
      'A triathlon finish time is the sum of five parts: the swim, the first transition (T1), the bike, the second transition (T2) and the run. Enter a pace for each leg and pick the race, and this adds them up using the standard distances.',
      'Example: an Olympic race is 1,500 m, 40 km and 10 km. Swimming at 2:00 per 100 m takes 15 × 120 = 1,800 s (30:00). Biking at 30 km/h takes 40 ÷ 30 = 1.333 h (1:20:00). Running at 5:30 per km takes 10 × 330 = 3,300 s (55:00). With 2 min in T1 and 1 min in T2, the total is 2:48:00.',
      'The chart shows which leg takes the most time, which is usually the bike. Paces tend to slow in longer races, so for a 70.3 or Ironman use the pace you can hold for hours, not your short-race pace. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate my triathlon finish time?', a: 'Add swim time, T1, bike time, T2 and run time. For an Olympic race at 2:00 per 100 m, 30 km/h and 5:30 per km, with 2 and 1 minutes of transitions, that is 30:00 + 2:00 + 1:20:00 + 1:00 + 55:00 = 2:48:00.' },
      { q: 'What are the standard triathlon distances?', a: 'Sprint is 750 m swim, 20 km bike, 5 km run. Olympic is 1,500 m, 40 km, 10 km. A 70.3 is 1,900 m, 90 km, 21.0975 km. An Ironman is 3,800 m, 180 km, 42.195 km. These are the distances used here.' },
      { q: 'What is a good 70.3 finish time?', a: 'It depends on age and experience, so there is no single answer. As an arithmetic example, 1:45 per 100 m, 32 km/h, 5:00 per km and 5 minutes of transitions gives 5:12:29.' },
      { q: 'Should I use my short-race pace for an Ironman?', a: 'Usually not. Pace drops over longer distances, so use a pace you could hold for the whole race. This calculator assumes the pace you enter stays constant.' },
      { q: 'Do the distances match my race exactly?', a: 'Not always. Real courses can be a bit longer or shorter than the standard distances, so treat the result as an estimate.' },
    ],
    sources: [
      { label: 'Wikipedia: Triathlon', url: 'https://en.wikipedia.org/wiki/Triathlon' },
      { label: 'Wikipedia: Ironman Triathlon', url: 'https://en.wikipedia.org/wiki/Ironman_Triathlon' },
    ],
  },
  related: ['swim-pace-per-100', 'pace', 'race-time-predictor', 'bike-gear-speed'],
  examples: [
    // swim 15 x 120 = 1800; bike 40/30 h = 4800; run 10 x 330 = 3300; T 180 -> 10080 s = 2:48:00
    { values: { race: 'olympic', swimMin: 2, swimSec: 0, bikeSpeed: 30, runMin: 5, runSec: 30, t1: 2, t2: 1 }, expect: { total: '2:48:00', swim: '30:00', bike: '1:20:00', run: '55:00', transitions: '3:00' } },
    // swim 7.5 x 120 = 900; bike 20/25 h = 2880; run 5 x 360 = 1800; T 180 -> 5760 s = 1:36:00
    { values: { race: 'sprint', swimMin: 2, swimSec: 0, bikeSpeed: 25, runMin: 6, runSec: 0, t1: 2, t2: 1 }, expect: { total: '1:36:00', swim: '15:00', bike: '48:00', run: '30:00' } },
    // swim 19 x 105 = 1995; bike 90/32 h = 10125; run 21.0975 x 300 = 6329.25; T 300 -> 18749.25 s = 5:12:29
    { values: { race: 'half', swimMin: 1, swimSec: 45, bikeSpeed: 32, runMin: 5, runSec: 0, t1: 3, t2: 2 }, expect: { total: '5:12:29', swim: '33:15', bike: '2:48:45', run: '1:45:29' } },
  ],
});
