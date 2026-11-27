import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { parseClock } from '../../lib/helpers/everyday';

const clock = (totalMin: number) => {
  const m = Math.round(totalMin);
  const h24 = Math.floor(m / 60) % 24;
  const mm = ((m % 60) + 60) % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
};

export default defineCalculator({
  slug: 'layover-buffer',
  title: 'Layover Connection Time Checker',
  category: 'everyday',
  description: 'Check whether a delayed flight still leaves enough time to connect. See your spare minutes, the delay you can absorb and whether the connection looks missed.',
  keywords: ['layover calculator', 'connection time calculator', 'will i make my connection', 'minimum connection time', 'flight delay connection buffer', 'tight layover'],
  updated: '2026-11-27',
  inputs: [
    { id: 'arrive', label: 'Scheduled arrival time', type: 'text', default: '14:10', placeholder: 'HH:MM or 2:10 pm', info: 'When your first flight is scheduled to land, in 24-hour (14:10) or 12-hour (2:10 pm) format. Same day only.' },
    { id: 'delay', label: 'Arrival delay', type: 'number', default: 25, min: 0, max: 600, step: 5, suffix: 'min', info: 'How late the first flight is expected to land. Use 0 for on time.' },
    { id: 'depart', label: 'Next flight departure time', type: 'text', default: '15:20', placeholder: 'HH:MM or 3:20 pm', info: 'Scheduled departure of your connecting flight, on the same day.' },
    { id: 'min', label: 'Minimum connection time', type: 'number', default: 45, min: 0, max: 600, step: 5, suffix: 'min', info: 'The least time you need between landing and departure. Check the airline and airport rule; it varies with gates, immigration, bag transfers and terminal changes.' },
  ],
  outputs: [
    { id: 'buffer', label: 'Buffer after the minimum', format: 'number', precision: 0, primary: true, info: 'Time to connect minus your minimum connection time, in minutes. Below zero means you have less than your minimum.' },
    { id: 'actual', label: 'Actual arrival', format: 'text', info: 'Scheduled arrival plus the delay.' },
    { id: 'connect', label: 'Time to connect (min)', format: 'number', precision: 0, info: 'Departure time minus actual arrival, in minutes. Negative means the flight leaves before you land.' },
    { id: 'absorb', label: 'Delay you can absorb (min)', format: 'number', precision: 0, info: '(Departure minus scheduled arrival) minus the minimum. The most delay you can take before dropping below your minimum. Negative means the schedule is already under the minimum.' },
  ],
  compute: (v) => {
    const arr = parseClock(v.arrive);
    const dep = parseClock(v.depart);
    const d = num(v.delay);
    const mn = num(v.min);
    if (typeof v.arrive === 'string' && v.arrive.trim() === '') return { buffer: null, note: 'Enter your scheduled arrival time.' };
    if (typeof v.depart === 'string' && v.depart.trim() === '') return { buffer: null, note: 'Enter your next departure time.' };
    if (arr === null) return { buffer: null, error: 'Enter the arrival time like 14:10 or 2:10 pm.' };
    if (dep === null) return { buffer: null, error: 'Enter the departure time like 15:20 or 3:20 pm.' };
    if (d === null || mn === null) return { buffer: null, note: 'Fill in every field.' };
    if (d < 0 || mn < 0) return { buffer: null, error: 'Delay and minimum connection time cannot be negative.' };
    if (arr + d >= 1440 || dep >= 1440) return { buffer: null, error: 'This checker is for same-day connections only. The arrival and departure must both fall before midnight.' };
    const actualMin = arr + d;
    const connect = dep - actualMin;
    const buffer = connect - mn;
    const absorb = dep - arr - mn;
    const out = { buffer, actual: clock(actualMin), connect, absorb };
    const chart = {
      type: 'bar' as const,
      title: 'Minutes to connect vs minimum (0 if the flight has left)',
      categories: ['Minimum needed', 'Time to connect'],
      series: [{ name: 'Minutes', values: [mn, Math.max(connect, 0)] }],
      format: { format: 'number' as const, precision: 0 },
      highlight: 1,
    };
    const steps = [
      `Actual arrival = ${clock(arr)} + ${d} min = ${clock(actualMin)}`,
      `Time to connect = ${clock(dep)} - ${clock(actualMin)} = ${connect} min`,
      `Buffer = ${connect} - ${mn} = ${buffer} min`,
      `Delay you can absorb = (${dep - arr}) - ${mn} = ${absorb} min`,
    ];
    if (connect < 0) {
      return { ...out, tone: 'bad', badge: 'Likely missed', note: `You would land ${-connect} min after the next flight is scheduled to leave. This is not travel advice: ask the airline about rebooking.`, steps, chart };
    }
    if (buffer < 0) {
      return { ...out, tone: 'bad', badge: 'Likely missed', note: `You would have ${connect} min, which is ${-buffer} min under your ${mn} min minimum. Gates, immigration and bags vary, and this is not travel advice.`, steps, chart };
    }
    if (buffer === 0) {
      return { ...out, tone: 'warn', badge: 'Tight', note: `You have exactly your ${mn} min minimum and no spare time. Any further delay puts the connection at risk. Not travel advice.`, steps, chart };
    }
    return { ...out, tone: 'good', badge: `${buffer} min spare`, note: `You have ${buffer} min more than your ${mn} min minimum. You could absorb ${Math.max(absorb, 0)} min of delay on the first flight. Not travel advice.`, steps, chart };
  },
  content: {
    formula: [
      'Actual arrival = scheduled arrival + delay',
      'Time to connect = departure - actual arrival',
      'Buffer = time to connect - minimum connection time',
      'Delay you can absorb = (departure - scheduled arrival) - minimum connection time',
    ],
    body: [
      'When your first flight runs late, the question is whether the connection still works. This checker adds the delay to your scheduled arrival, compares it with the next departure, and shows how many minutes you have left after your own minimum connection time.',
      'The minimum connection time is your input. The default of 45 minutes is only a starting point: check the airline and airport rule for your route, since terminal changes, immigration, security re-screening and bag transfers can all push it higher.',
      'It also shows the delay you can absorb, which is how late the first flight can land before you drop below your minimum. If the buffer is below zero, the connection is flagged as likely missed. If you would land after the next flight leaves, the time to connect is negative.',
      'This is a same-day check only and is not travel advice. Gates, boarding cut-offs, immigration queues and bags vary, so use the numbers as a rough guide and ask the airline if you are close.',
    ],
    faq: [
      { q: 'Arriving 14:10, 25 min late, departing 15:20, minimum 45: will I make it?', a: 'You land at 2:35 PM, which leaves 45 minutes to connect. That equals the minimum, so the buffer is 0 and you can absorb 25 minutes of delay. It is tight.' },
      { q: 'What if I arrive at 10:00 on time and depart at 11:30 with a 60 minute minimum?', a: 'You have 90 minutes to connect, a buffer of 30 minutes, and you can absorb a 30 minute delay.' },
      { q: 'What happens if I land after the next flight leaves?', a: 'For arrival 17:00, 50 min late, departure 17:45 and minimum 40, you land at 5:50 PM, 5 minutes after departure. Time to connect is -5, the buffer is -45 and the connection is flagged as likely missed.' },
      { q: 'What minimum connection time should I use?', a: 'Check the airline and airport rule. The 45 minute default is only a placeholder, and international or terminal-change connections often need more.' },
      { q: 'Does it work for overnight or time-zone connections?', a: 'No. It is for same-day connections with both times in the same time zone. Use the time zone converter first if your times are in different zones.' },
    ],
    sources: [],
  },
  related: ['airport-leave-time', 'time-zone-converter'],
  examples: [
    // 14:10 = 850; +25 = 875 (14:35); depart 15:20 = 920; connect 45; buffer 0; absorb 920-850-45 = 25
    { values: { arrive: '14:10', delay: 25, depart: '15:20', min: 45 }, expect: { buffer: 0, actual: '2:35 PM', connect: 45, absorb: 25 } },
    // 10:00 = 600; 11:30 = 690; connect 90; buffer 30; absorb 90-60 = 30
    { values: { arrive: '10:00', delay: 0, depart: '11:30', min: 60 }, expect: { buffer: 30, actual: '10:00 AM', connect: 90, absorb: 30 } },
    // 17:00 = 1020; +50 = 1070 (5:50 PM); depart 17:45 = 1065; connect -5; buffer -45; absorb 45-40 = 5
    { values: { arrive: '17:00', delay: 50, depart: '17:45', min: 40 }, expect: { buffer: -45, actual: '5:50 PM', connect: -5, absorb: 5 } },
  ],
});
