import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { parseClock, formatHM } from '../../lib/helpers/everyday';

/** Minutes after midnight (may be negative) -> "9:50 PM (previous day)". */
const clock = (totalMin: number) => {
  const m = Math.round(totalMin);
  const days = Math.floor(m / 1440); // negative when before midnight
  const inDay = m - days * 1440;
  const h24 = Math.floor(inDay / 60);
  const mm = inDay % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const t = `${h12}:${String(mm).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
  if (days === 0) return t;
  const back = -days;
  return `${t} (${back === 1 ? 'previous day' : `${back} days earlier`})`;
};

export default defineCalculator({
  slug: 'airport-leave-time',
  title: 'Airport Leave Time Calculator',
  category: 'everyday',
  description: 'Work out what time to leave home for your flight. Enter departure time, time at the airport, travel, parking or shuttle time and a buffer.',
  keywords: ['airport leave time calculator', 'what time should i leave for the airport', 'when to leave for flight', 'time to leave for airport', 'airport arrival time planner'],
  updated: '2026-11-21',
  inputs: [
    { id: 'departure', label: 'Flight departure time', type: 'text', default: '14:30', placeholder: 'HH:MM or 2:30 pm', info: 'Scheduled departure in 24-hour (14:30) or 12-hour (2:30 pm) format.' },
    { id: 'airport', label: 'Minutes at the airport before departure', type: 'number', default: 120, min: 0, max: 600, step: 5, suffix: 'min', info: 'Your own choice for check-in, security and getting to the gate. Check your airline for its own check-in and bag cut-offs.' },
    { id: 'travel', label: 'Drive or transit time', type: 'number', default: 35, min: 0, max: 600, step: 5, suffix: 'min', info: 'Door to the airport, at the time of day you will travel.' },
    { id: 'parking', label: 'Parking or shuttle time', type: 'number', default: 20, min: 0, max: 240, step: 5, suffix: 'min', info: 'Finding a spot, parking shuttle, rental car return or drop-off.' },
    { id: 'buffer', label: 'Extra buffer', type: 'number', default: 15, min: 0, max: 240, step: 5, suffix: 'min', info: 'Spare time for traffic, delays or a missed turn.' },
  ],
  outputs: [
    { id: 'leave', label: 'Leave home at', format: 'text', primary: true, info: 'Departure time minus all the minutes below.' },
    { id: 'total', label: 'Total lead time', format: 'text', info: 'Airport time plus travel, parking and buffer.' },
    { id: 'arriveAirport', label: 'Arrive at the airport by', format: 'text', info: 'Departure minus the minutes you chose to spend at the airport.' },
  ],
  compute: (v) => {
    const dep = parseClock(v.departure);
    const a = num(v.airport), t = num(v.travel), p = num(v.parking), b = num(v.buffer);
    if (typeof v.departure === 'string' && v.departure.trim() === '') return { leave: null, note: 'Enter your departure time.' };
    if (dep === null) return { leave: null, error: 'Enter the departure time like 14:30 or 2:30 pm.' };
    if (a === null || t === null || p === null || b === null) return { leave: null, note: 'Fill in every field.' };
    if (a < 0 || t < 0 || p < 0 || b < 0) return { leave: null, error: 'Minutes cannot be negative.' };
    const total = a + t + p + b;
    const leaveAt = (dep % 1440) - total;
    const arriveAt = (dep % 1440) - a;
    return {
      leave: clock(leaveAt),
      total: formatHM(total),
      arriveAirport: clock(arriveAt),
      tone: 'ok',
      badge: `Leave ${clock(leaveAt)}`,
      chart: {
        type: 'bar',
        title: 'Where the lead time goes (minutes)',
        categories: ['At airport', 'Travel', 'Parking/shuttle', 'Buffer'],
        series: [{ name: 'Minutes', values: [a, t, p, b] }],
        format: { format: 'number', precision: 0 },
      },
      steps: [
        `Total lead time = ${a} + ${t} + ${p} + ${b} = ${total} min (${formatHM(total)})`,
        `Leave = departure ${clock(dep % 1440)} - ${formatHM(total)} = ${clock(leaveAt)}`,
      ],
    };
  },
  content: {
    formula: ['Leave time = departure time - (minutes at airport + travel + parking or shuttle + buffer)'],
    body: [
      'Missing a flight usually comes down to adding up the small pieces wrong. This calculator works backwards from your departure time: it subtracts the time you want at the airport, the trip there, parking or shuttle time and a safety buffer, and tells you when to walk out the door.',
      'The minutes at the airport are your own choice, not a rule. Two hours is a common comfortable default, but the right number depends on the airport, the time of day and whether you check a bag. Check your airline for its own check-in and bag drop cut-offs, and treat those as a minimum.',
      'If the result falls before midnight, it is shown as the previous day, for example a 1:00 AM departure can mean leaving at 9:50 PM the evening before. Travel times from a maps app change with traffic, so use the estimate for the hour you will actually travel.',
    ],
    faq: [
      { q: 'What time should I leave for a 2:30 PM flight?', a: 'With 120 minutes at the airport, 35 minutes of travel, 20 minutes of parking or shuttle and a 15 minute buffer, the total is 190 minutes (3 h 10 min), so leave at 11:20 AM.' },
      { q: 'What if my flight is just after midnight?', a: 'The result rolls back to the previous day. For a 1:00 AM departure with the same 190 minutes, you leave at 9:50 PM the evening before.' },
      { q: 'How early should I be at the airport?', a: 'That is up to you and your airline. The default of 120 minutes is only a starting point you can change. Check your airline for its own check-in cut-offs.' },
      { q: 'Does it include security wait times?', a: 'Not separately. Include the time you expect for check-in and security in the minutes at the airport, or add it to the buffer.' },
    ],
    sources: [
      { label: 'TSA: Travel tips', url: 'https://www.tsa.gov/travel/travel-tips' },
    ],
  },
  related: ['road-trip-time', 'time-zone-converter', 'drive-vs-fly-cost'],
  examples: [
    // 14:30 = 870 min; 120+35+20+15 = 190; 870 - 190 = 680 = 11:20 AM. Airport arrival 870-120 = 750 = 12:30 PM.
    { values: { departure: '14:30', airport: 120, travel: 35, parking: 20, buffer: 15 }, expect: { leave: '11:20 AM', total: '3 h 10 min', arriveAirport: '12:30 PM' } },
    // 01:00 = 60 min; 60 - 190 = -130 -> 1440 - 130 = 1310 = 21:50 previous day. Airport arrival 60-120 = -60 -> 11:00 PM previous day.
    { values: { departure: '01:00', airport: 120, travel: 35, parking: 20, buffer: 15 }, expect: { leave: '9:50 PM (previous day)', total: '3 h 10 min', arriveAirport: '11:00 PM (previous day)' } },
  ],
});
