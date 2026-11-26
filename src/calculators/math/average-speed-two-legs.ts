import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (x: number) => String(Math.round(x * 100) / 100);

const dur = (hours: number) => {
  const m = Math.round(hours * 60);
  return `${Math.floor(m / 60)} h ${m % 60} min`;
};

export default defineCalculator({
  slug: 'average-speed-two-legs',
  title: 'Average Speed Calculator (Round Trip)',
  category: 'math',
  description: 'Find your true average speed for a trip out and back at two different speeds. See why it is not the simple average, with total time and the gap.',
  keywords: ['average speed calculator', 'average speed round trip', 'average speed two speeds', 'harmonic mean speed', 'average speed out and back', 'average speed same distance different speeds'],
  updated: '2026-11-26',
  inputs: [
    { id: 'system', label: 'Units', type: 'select', default: 'imperial', options: [{ value: 'imperial', label: 'Miles, mph' }, { value: 'metric', label: 'Kilometres, km/h' }], segmented: true, info: 'Distance and speed use matching units: miles with mph, or kilometres with km/h.' },
    { id: 'speedOut', label: 'Speed out', type: 'number', default: 60, min: 0, step: 1, suffix: 'mph or km/h', info: 'Your average speed on the first leg.' },
    { id: 'speedBack', label: 'Speed back', type: 'number', default: 30, min: 0, step: 1, suffix: 'mph or km/h', info: 'Your average speed on the second leg.' },
    { id: 'distance', label: 'Distance each way', type: 'number', default: 100, min: 0, step: 1, suffix: 'mi or km', info: 'Length of one leg. Both legs are assumed to be the same distance.' },
  ],
  outputs: [
    { id: 'avg', label: 'True average speed', format: 'text', primary: true, info: 'Total distance divided by total time.' },
    { id: 'totalTime', label: 'Total time', format: 'text', info: 'Time out plus time back.' },
    { id: 'totalDistance', label: 'Total distance', format: 'text', info: 'Both legs added together.' },
    { id: 'naive', label: 'Simple average of the speeds', format: 'text', info: 'The two speeds added and halved. This is the tempting but wrong answer.' },
    { id: 'gap', label: 'Gap', format: 'text', info: 'How much the simple average overstates the true average.' },
  ],
  compute: (v) => {
    const metric = v.system === 'metric';
    const du = metric ? 'km' : 'mi';
    const su = metric ? 'km/h' : 'mph';
    const a = num(v.speedOut), b = num(v.speedBack), d = num(v.distance);
    if (a === null || b === null || d === null) return { avg: null, note: 'Enter both speeds and the distance each way.' };
    if (a <= 0 || b <= 0) return { avg: null, error: 'Both speeds must be greater than 0.' };
    if (d <= 0) return { avg: null, error: 'Distance must be greater than 0.' };

    const t1 = d / a, t2 = d / b;
    const total = t1 + t2;
    const avg = (2 * d) / total;
    const naive = (a + b) / 2;
    const gap = naive - avg;
    return {
      avg: `${fmt(avg)} ${su}`,
      totalTime: dur(total),
      totalDistance: `${fmt(2 * d)} ${du}`,
      naive: `${fmt(naive)} ${su}`,
      gap: `${fmt(gap)} ${su}`,
      tone: 'ok',
      badge: `${fmt(avg)} ${su}`,
      chart: {
        type: 'bar',
        title: `Time spent on each leg (hours)`,
        categories: ['Out', 'Back'],
        series: [{ name: 'Hours', values: [t1, t2] }],
        format: { format: 'number', precision: 2 },
      },
      steps: [
        `Time out = ${fmt(d)} ${du} ÷ ${fmt(a)} ${su} = ${fmt(t1)} h`,
        `Time back = ${fmt(d)} ${du} ÷ ${fmt(b)} ${su} = ${fmt(t2)} h`,
        `Average speed = total distance ÷ total time = ${fmt(2 * d)} ${du} ÷ ${fmt(total)} h = ${fmt(avg)} ${su}`,
      ],
    };
  },
  content: {
    formula: ['Average speed = total distance ÷ total time', 'Equal distances: 2ab ÷ (a + b)'],
    body: [
      'Drive 100 miles out at 60 mph and 100 miles back at 30 mph, and your average speed is not 45 mph. It is 40 mph. Average speed is always total distance divided by total time, and the slow leg takes far longer, so it counts for more.',
      'When both legs are the same distance, the result works out to the harmonic mean of the two speeds: 2ab ÷ (a + b). It always sits at or below the simple average, and the two only match when the speeds are equal.',
      'The simple average only works when you spend equal time at each speed, not equal distance. Half an hour at 60 and half an hour at 30 really does average 45. The trap is that the slower leg lasts longer when the distance is fixed.',
    ],
    faq: [
      { q: 'What is the average speed for 60 mph out and 30 mph back?', a: 'With 100 miles each way, the trip takes 1.67 h + 3.33 h = 5 h for 200 miles, so the average is 200 ÷ 5 = 40 mph, not 45 mph. The distance each way does not change the answer as long as both legs match.' },
      { q: 'Why is the average speed not just (a + b) ÷ 2?', a: 'Because you spend more time at the slower speed. Average speed weights each speed by time, and a fixed distance takes longer at a low speed. The simple average treats both legs as lasting equally long.' },
      { q: 'Does the distance change the average speed?', a: 'Not for equal legs. Only the two speeds matter, so 60 and 30 gives 40 mph whether each leg is 10 miles or 1,000. The distance only changes the total time.' },
      { q: 'How big is the gap between the true and simple average?', a: 'For 60 and 30 the simple average is 45 mph and the true average is 40 mph, a gap of 5 mph. The more different the two speeds are, the bigger the gap.' },
      { q: 'What if the legs are different distances?', a: 'This calculator assumes equal legs. For unequal legs, add both distances and divide by the sum of each leg\'s time. The distance, rate and time calculator can find each leg\'s time.' },
    ],
  },
  related: ['distance-rate-time', 'road-trip-time', 'pace'],
  examples: [
    // 100/60 + 100/30 = 1.6667 + 3.3333 = 5 h; 200 / 5 = 40; naive 45; gap 5
    { values: { system: 'imperial', speedOut: 60, speedBack: 30, distance: 100 }, expect: { avg: '40 mph', totalTime: '5 h 0 min', totalDistance: '200 mi', naive: '45 mph', gap: '5 mph' } },
    // 50/40 + 50/60 = 1.25 + 0.8333 = 2.0833 h = 125 min; 100 / 2.0833 = 48; naive 50; gap 2
    { values: { system: 'metric', speedOut: 40, speedBack: 60, distance: 50 }, expect: { avg: '48 km/h', totalTime: '2 h 5 min', naive: '50 km/h', gap: '2 km/h' } },
    // equal speeds: avg = naive = 50, gap 0; 10/50*2 = 0.4 h = 24 min
    { values: { system: 'imperial', speedOut: 50, speedBack: 50, distance: 10 }, expect: { avg: '50 mph', totalTime: '0 h 24 min', gap: '0 mph' } },
  ],
});
