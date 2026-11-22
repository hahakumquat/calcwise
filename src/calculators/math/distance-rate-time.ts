import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const solveIs = (...ids: string[]) => ({ input: 'solve', is: ids });

const fmt = (x: number) => String(Math.round(x * 100) / 100);

const dur = (hours: number) => {
  const m = Math.round(hours * 60);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h === 0 ? `${r} min` : `${h} h ${r} min`;
};

export default defineCalculator({
  slug: 'distance-rate-time',
  title: 'Distance, Rate and Time Calculator',
  category: 'math',
  description: 'Solve distance = speed x time for whichever value you are missing. Enter any two of distance, speed and time and get the third, with the steps.',
  keywords: ['distance rate time calculator', 'distance speed time calculator', 'd = rt calculator', 'speed calculator', 'time from distance and speed', 'distance formula speed time'],
  updated: '2026-11-22',
  inputs: [
    { id: 'solve', label: 'Solve for', type: 'select', default: 'time', options: [{ value: 'distance', label: 'Distance' }, { value: 'speed', label: 'Speed' }, { value: 'time', label: 'Time' }], segmented: true, info: 'Pick the value you do not know. You fill in the other two.' },
    { id: 'system', label: 'Units', type: 'select', default: 'imperial', options: [{ value: 'imperial', label: 'Miles, mph' }, { value: 'metric', label: 'Kilometres, km/h' }], segmented: true, info: 'Distance and speed use matching units: miles with mph, or kilometres with km/h.' },
    { id: 'distance', label: 'Distance', type: 'number', default: 150, min: 0, step: 1, suffix: 'mi or km', showWhen: solveIs('speed', 'time'), info: 'How far you travel, in miles or kilometres to match the units above.' },
    { id: 'speed', label: 'Speed', type: 'number', default: 60, min: 0, step: 1, suffix: 'mph or km/h', showWhen: solveIs('distance', 'time'), info: 'Average speed over the whole trip, not the top speed.' },
    { id: 'hours', label: 'Time: hours', type: 'number', default: 2, min: 0, step: 1, suffix: 'h', showWhen: solveIs('distance', 'speed'), info: 'Whole hours of travel time. Decimals work too (2.5 is 2 h 30 min).' },
    { id: 'minutes', label: 'Time: minutes', type: 'number', default: 30, min: 0, step: 1, suffix: 'min', showWhen: solveIs('distance', 'speed'), info: 'Extra minutes of travel time, added to the hours.' },
  ],
  outputs: [
    { id: 'result', label: 'Answer', format: 'text', primary: true, info: 'The value you chose to solve for.' },
    { id: 'distanceOut', label: 'Distance', format: 'text', info: 'Total distance travelled.' },
    { id: 'speedOut', label: 'Speed', format: 'text', info: 'Distance divided by time.' },
    { id: 'timeOut', label: 'Time', format: 'text', info: 'Travel time as hours and minutes.' },
  ],
  compute: (v) => {
    const mode = String(v.solve ?? 'time');
    const metric = v.system === 'metric';
    const du = metric ? 'km' : 'mi';
    const su = metric ? 'km/h' : 'mph';
    let d = num(v.distance), s = num(v.speed), t: number | null = null;
    if (mode !== 'time') {
      const h = num(v.hours), m = num(v.minutes);
      if (h === null || m === null) return { result: null, note: 'Enter the time in hours and minutes.' };
      if (h < 0 || m < 0) return { result: null, error: 'Time cannot be negative.' };
      t = h + m / 60;
      if (t <= 0) return { result: null, error: 'Time must be greater than 0.' };
    }
    if (mode !== 'speed' && mode !== 'distance') {
      if (d === null || s === null) return { result: null, note: 'Enter distance and speed.' };
    } else if (mode === 'speed') {
      if (d === null) return { result: null, note: 'Enter the distance.' };
    } else if (s === null) return { result: null, note: 'Enter the speed.' };

    if (mode !== 'distance' && d !== null && d < 0) return { result: null, error: 'Distance cannot be negative.' };
    if (mode !== 'speed' && s !== null && s < 0) return { result: null, error: 'Speed cannot be negative.' };
    if (mode === 'time' && (s === null || s <= 0)) return { result: null, error: 'Speed must be greater than 0 to find a time.' };
    if (mode === 'distance' && (s === null || s <= 0)) return { result: null, error: 'Speed must be greater than 0.' };

    let steps: string[];
    let answer: string;
    if (mode === 'distance') {
      d = s! * t!;
      answer = `${fmt(d)} ${du}`;
      steps = [`Distance = speed × time`, `Distance = ${fmt(s!)} ${su} × ${fmt(t!)} h = ${fmt(d)} ${du}`];
    } else if (mode === 'speed') {
      s = d! / t!;
      answer = `${fmt(s)} ${su}`;
      steps = [`Speed = distance ÷ time`, `Speed = ${fmt(d!)} ${du} ÷ ${fmt(t!)} h = ${fmt(s)} ${su}`];
    } else {
      t = d! / s!;
      answer = dur(t);
      steps = [`Time = distance ÷ speed`, `Time = ${fmt(d!)} ${du} ÷ ${fmt(s!)} ${su} = ${fmt(t)} h = ${dur(t)}`];
    }
    return {
      result: answer,
      distanceOut: `${fmt(d!)} ${du}`,
      speedOut: `${fmt(s!)} ${su}`,
      timeOut: dur(t!),
      tone: 'ok',
      badge: answer,
      chart: {
        type: 'bar',
        title: `Distance covered (${du}) after each hour`,
        categories: Array.from({ length: Math.min(8, Math.max(1, Math.ceil(t!))) }, (_, i) => `${i + 1} h`),
        series: [{ name: du, values: Array.from({ length: Math.min(8, Math.max(1, Math.ceil(t!))) }, (_, i) => s! * (i + 1)) }],
        format: { format: 'number', precision: 0 },
      },
      steps,
    };
  },
  content: {
    formula: ['Distance = speed × time', 'Speed = distance ÷ time', 'Time = distance ÷ speed'],
    body: [
      'Distance, rate and time are tied together by one equation: distance equals rate times time (d = rt). Know any two and you can find the third. Choose which value you are missing, fill in the other two, and the calculator shows the answer with the working.',
      'Keep your units matching. Miles go with mph and kilometres go with km/h. If your time is in minutes, divide by 60 to get hours first, or just use the hours and minutes boxes and let the calculator convert.',
      'The speed here is an average over the whole journey. Stops, traffic and slower sections all lower the average, so a trip rarely takes exactly distance divided by the speed limit.',
    ],
    faq: [
      { q: 'How long does it take to go 150 miles at 60 mph?', a: '150 ÷ 60 = 2.5 hours, which is 2 hours 30 minutes.' },
      { q: 'How far do I travel in 2.5 hours at 55 mph?', a: '55 × 2.5 = 137.5 miles. Enter 2 hours and 30 minutes.' },
      { q: 'What speed covers 150 miles in 3 hours?', a: '150 ÷ 3 = 50 mph.' },
      { q: 'Why does it say time must be greater than 0?', a: 'Speed is distance divided by time, and you cannot divide by zero. Zero speed also has no finite travel time. Enter a value above 0.' },
      { q: 'Can I use kilometres?', a: 'Yes. Switch the units to kilometres and km/h. The formula is identical.' },
    ],
    sources: [
      { label: 'Khan Academy: Distance, rate and time', url: 'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities' },
    ],
  },
  related: ['road-trip-time', 'pace'],
  examples: [
    // 150 / 60 = 2.5 h = 2 h 30 min
    { values: { solve: 'time', system: 'imperial', distance: 150, speed: 60 }, expect: { result: '2 h 30 min', distanceOut: '150 mi', speedOut: '60 mph', timeOut: '2 h 30 min' } },
    // 55 * (2 + 30/60) = 137.5
    { values: { solve: 'distance', system: 'imperial', speed: 55, hours: 2, minutes: 30 }, expect: { result: '137.5 mi', timeOut: '2 h 30 min' } },
    // 150 / 3 = 50
    { values: { solve: 'speed', system: 'imperial', distance: 150, hours: 3, minutes: 0 }, expect: { result: '50 mph' } },
    // 100 km / 80 km/h = 1.25 h = 1 h 15 min
    { values: { solve: 'time', system: 'metric', distance: 100, speed: 80 }, expect: { result: '1 h 15 min', speedOut: '80 km/h' } },
  ],
});
