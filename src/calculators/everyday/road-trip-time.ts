import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const dur = (min: number) => {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h === 0 ? `${r} min` : `${h} h ${r} min`;
};

const clock = (totalMin: number) => {
  const m = Math.round(totalMin);
  const days = Math.floor(m / 1440);
  const inDay = m - days * 1440;
  const h24 = Math.floor(inDay / 60);
  const mm = inDay % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ap = h24 < 12 ? 'AM' : 'PM';
  const t = `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
  return days === 0 ? t : `${t} (+${days} day${days > 1 ? 's' : ''})`;
};

export default defineCalculator({
  slug: 'road-trip-time',
  title: 'Road Trip Time Calculator',
  category: 'everyday',
  description: 'Work out how long a road trip takes with rest stops included, and what time you will arrive. Enter distance, average speed, stops and departure time.',
  keywords: ['road trip time calculator', 'driving time calculator', 'how long will my drive take', 'arrival time calculator', 'trip duration with stops', 'drive time with breaks'],
  updated: '2026-11-21',
  inputs: [
    { id: 'distance', label: 'Trip distance', type: 'number', default: 450, min: 1, max: 20000, step: 1, suffix: 'mi or km', info: 'Total distance. Use miles with mph or kilometres with km/h; the answer is the same as long as the units match.' },
    { id: 'speed', label: 'Average driving speed', type: 'number', default: 60, min: 5, max: 200, step: 1, suffix: 'mph or km/h', info: 'Your average while moving, including slower towns and traffic, not the speed limit.' },
    { id: 'stops', label: 'Number of stops', type: 'number', default: 3, min: 0, max: 50, step: 1, info: 'Fuel, food and rest breaks.' },
    { id: 'stopMin', label: 'Minutes per stop', type: 'number', default: 20, min: 0, max: 240, step: 5, suffix: 'min', info: 'Average time each stop takes.' },
    { id: 'depHour', label: 'Departure hour (0-23)', type: 'number', default: 8, min: 0, max: 23, step: 1, info: '24-hour clock: 8 is 8 AM, 17 is 5 PM.' },
    { id: 'depMin', label: 'Departure minute', type: 'number', default: 0, min: 0, max: 59, step: 5, info: 'Minutes past the hour.' },
  ],
  outputs: [
    { id: 'total', label: 'Total trip time', format: 'text', primary: true, info: 'Driving time plus all stops.' },
    { id: 'arrival', label: 'Arrival time', format: 'text', info: 'Departure plus total trip time. "+1 day" means after midnight.' },
    { id: 'driving', label: 'Driving time', format: 'text', info: 'Distance divided by average speed.' },
    { id: 'stopTime', label: 'Time stopped', format: 'text', info: 'Number of stops times minutes per stop.' },
  ],
  compute: (v) => {
    const d = num(v.distance), s = num(v.speed), n = num(v.stops), sm = num(v.stopMin), h = num(v.depHour), mi = num(v.depMin);
    if (d === null || s === null || n === null || sm === null || h === null || mi === null) return { total: null, note: 'Fill in every field.' };
    if (d <= 0 || s <= 0) return { total: null, error: 'Distance and speed must be above 0.' };
    if (n < 0 || sm < 0) return { total: null, error: 'Stops cannot be negative.' };
    if (h < 0 || h > 23 || mi < 0 || mi > 59) return { total: null, error: 'Departure is a 24-hour time: hour 0-23, minute 0-59.' };
    const driveMin = (d / s) * 60;
    const stopMinTotal = n * sm;
    const totalMin = driveMin + stopMinTotal;
    const arriveAt = h * 60 + mi + totalMin;
    return {
      total: dur(totalMin),
      arrival: clock(arriveAt),
      driving: dur(driveMin),
      stopTime: dur(stopMinTotal),
      tone: 'ok',
      badge: `Arrive ${clock(arriveAt)}`,
      chart: {
        type: 'bar',
        title: 'Where the time goes (hours)',
        categories: ['Driving', 'Stopped'],
        series: [{ name: 'Hours', values: [driveMin / 60, stopMinTotal / 60] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Driving = ${d} ÷ ${s} = ${(d / s).toFixed(2)} h = ${dur(driveMin)}`,
        `Stops = ${n} × ${sm} min = ${dur(stopMinTotal)}`,
        `Total = ${dur(driveMin)} + ${dur(stopMinTotal)} = ${dur(totalMin)}`,
        `Arrival = departure + total = ${clock(arriveAt)}`,
      ],
    };
  },
  content: {
    formula: ['Driving time = distance ÷ average speed', 'Stopped time = number of stops × minutes per stop', 'Arrival = departure time + driving time + stopped time'],
    body: [
      'Maps apps give a driving time, but they rarely include the stops that real trips need. This calculator adds fuel, food and rest breaks to the driving time so you can plan an honest arrival time.',
      'Use your average moving speed, not the speed limit. On a mixed route with towns and traffic, 55 to 60 mph is a common planning figure; on open interstate it may be higher. The distance and speed can be miles and mph or kilometres and km/h, as long as they match.',
      'Safety agencies recommend regular breaks on long drives. If you drive more than a few hours at a stretch, plan a stop about every two hours and pad the number of stops rather than the speed.',
    ],
    faq: [
      { q: 'How long does a 450 mile drive take?', a: 'At an average of 60 mph it is 7.5 hours of driving. With three 20-minute stops, the total is 8 hours 30 minutes.' },
      { q: 'What does "+1 day" next to the arrival time mean?', a: 'The trip ends after midnight, so you arrive on the next calendar day.' },
      { q: 'What average speed should I use?', a: 'Your realistic average while moving. Use a number below the speed limit if the route has towns, traffic or construction.' },
      { q: 'Does it work in kilometres?', a: 'Yes. Enter kilometres and km/h. The calculation is the same, only the units change.' },
    ],
    sources: [
      { label: 'NHTSA: Drowsy driving', url: 'https://www.nhtsa.gov/risky-driving/drowsy-driving' },
    ],
  },
  related: ['gas-cost', 'commute-cost', 'ev-vs-gas-cost', 'tire-pressure-cold'],
  examples: [
    { values: { distance: 450, speed: 60, stops: 3, stopMin: 20, depHour: 8, depMin: 0 }, expect: { total: '8 h 30 min', arrival: '4:30 PM', driving: '7 h 30 min', stopTime: '1 h 0 min' } },
    { values: { distance: 300, speed: 65, stops: 0, stopMin: 20, depHour: 22, depMin: 0 }, expect: { total: '4 h 37 min', arrival: '2:37 AM (+1 day)', driving: '4 h 37 min', stopTime: '0 min' } },
    { values: { distance: 120, speed: 60, stops: 1, stopMin: 15, depHour: 12, depMin: 0 }, expect: { total: '2 h 15 min', arrival: '2:15 PM' } },
  ],
});
