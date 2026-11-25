import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const FT_PER_MILE = 5280;
const M_PER_FT = 0.3048;
const FT_PER_FLIGHT = 10;
const GRADES = [5, 10, 12, 15];

export default defineCalculator({
  slug: 'treadmill-incline-gain',
  title: 'Treadmill Incline Vertical Feet Calculator',
  category: 'sports',
  description: 'Work out how many vertical feet and metres you climb on a treadmill from your speed, incline percent grade and time. Includes distance and flights of stairs.',
  keywords: ['treadmill incline calculator', 'treadmill elevation gain', 'vertical feet treadmill', 'incline walking elevation', '12 3 30 elevation gain', 'treadmill grade to feet climbed'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'speed', label: 'Treadmill speed', type: 'number', suffix: 'mph', default: 3, min: 0.1, step: 0.1, info: 'Belt speed in miles per hour, as shown on the console.' },
    { id: 'grade', label: 'Incline (percent grade)', type: 'number', suffix: '%', default: 12, min: 0, max: 40, step: 0.5, info: 'The incline setting as a percent grade, not degrees. 12 means 12 feet of rise per 100 feet of horizontal distance.' },
    { id: 'minutes', label: 'Time', type: 'number', suffix: 'min', default: 30, min: 1, step: 1, info: 'Total minutes spent at this speed and incline.' },
  ],
  outputs: [
    { id: 'gainFt', label: 'Vertical gain', format: 'number', precision: 1, suffix: 'ft', primary: true, info: 'Horizontal distance times the grade.' },
    { id: 'gainM', label: 'Vertical gain (metres)', format: 'number', precision: 1, suffix: 'm', info: 'Vertical feet times 0.3048.' },
    { id: 'miles', label: 'Distance', format: 'number', precision: 2, suffix: 'mi', info: 'Speed times hours.' },
    { id: 'flights', label: 'Flights of stairs (10 ft each)', format: 'number', precision: 1, info: 'Vertical feet divided by 10.' },
  ],
  compute: (v) => {
    const speed = num(v.speed);
    const grade = num(v.grade);
    const min = num(v.minutes);
    if (speed === null || speed <= 0) return { gainFt: null, error: 'Enter the treadmill speed in mph.' };
    if (grade === null || grade < 0) return { gainFt: null, error: 'Enter an incline of 0% or more.' };
    if (min === null || min <= 0) return { gainFt: null, error: 'Enter how many minutes you were on the treadmill.' };
    const miles = (speed * min) / 60;
    const horizFt = miles * FT_PER_MILE;
    const gainFt = (horizFt * grade) / 100;
    const gainM = gainFt * M_PER_FT;
    const flights = gainFt / FT_PER_FLIGHT;
    return {
      gainFt,
      gainM,
      miles,
      flights,
      tone: 'ok',
      badge: `${fmt(gainFt, 0)} ft climbed`,
      note: `${fmt(speed, 1)} mph at ${fmt(grade, 1)}% for ${fmt(min, 0)} min covers ${fmt(miles, 2)} mi and climbs about ${fmt(gainFt, 1)} ft (${fmt(gainM, 1)} m). Assumes grade is rise over horizontal distance.`,
      chart: {
        type: 'bar' as const,
        title: `Vertical feet at ${fmt(speed, 1)} mph for ${fmt(min, 0)} min, by incline`,
        categories: GRADES.map((g) => `${g}%`),
        series: [{ name: 'Vertical feet', values: GRADES.map((g) => (horizFt * g) / 100) }],
        format: { suffix: 'ft', precision: 0 },
      },
      steps: [
        `Distance = ${fmt(speed, 1)} mph × ${fmt(min, 0)} ÷ 60 = ${fmt(miles, 3)} mi`,
        `Horizontal feet = ${fmt(miles, 3)} × 5,280 = ${fmt(horizFt, 1)} ft`,
        `Vertical gain = ${fmt(horizFt, 1)} × ${fmt(grade, 1)} ÷ 100 = ${fmt(gainFt, 1)} ft`,
        `Metres = ${fmt(gainFt, 1)} × 0.3048 = ${fmt(gainM, 1)} m; flights = ${fmt(gainFt, 1)} ÷ 10 = ${fmt(flights, 1)}`,
      ],
    };
  },
  content: {
    formula: [
      'Distance (mi) = speed (mph) × minutes ÷ 60',
      'Vertical gain (ft) = distance (mi) × 5,280 × grade ÷ 100',
      'Metres = feet × 0.3048',
    ],
    body: [
      'Treadmill incline is shown as a percent grade. A grade is rise divided by horizontal run, so 12% means 12 feet up for every 100 feet of flat distance. This calculator reads your incline that way, not as an angle in degrees, and treats the belt distance as the horizontal run. That is how most consoles and the popular "12-3-30" routine are described.',
      'Example with the defaults: 3 mph for 30 minutes is 1.5 miles, or 7,920 feet. At 12% that is 7,920 × 0.12 = 950.4 feet of vertical gain, about 289.7 metres. At 10 feet per flight of stairs, that is roughly 95 flights.',
      'Console readouts and real-world slope can differ a little between machines, so treat the answer as an estimate. The stairs figure is just arithmetic with a 10 ft flight. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How many vertical feet is 12% incline at 3 mph for 30 minutes?', a: '950.4 feet. You cover 1.5 miles (7,920 ft) and climb 12% of that: 7,920 × 0.12 = 950.4 ft, or about 289.7 m.' },
      { q: 'Is treadmill incline percent or degrees?', a: 'Almost always percent grade. A 12% grade is about 6.8 degrees, not 12 degrees. This calculator expects percent grade.' },
      { q: 'How do I convert vertical feet to metres?', a: 'Multiply by 0.3048. For 950.4 ft that is 289.7 m.' },
      { q: 'How many flights of stairs is that?', a: 'Dividing by 10 feet per flight gives 95.0 flights for the default 950.4 ft. Real flights vary, so use it as a rough comparison.' },
      { q: 'Does doubling the speed double the climb?', a: 'Yes, for the same time and grade. Climb is proportional to distance, so 6 mph at 12% for 30 minutes gives 1,900.8 ft. Doubling the incline also doubles it.' },
    ],
    sources: [
      { label: 'Wikipedia: Grade (slope)', url: 'https://en.wikipedia.org/wiki/Grade_(slope)' },
    ],
  },
  related: ['pace', 'slope', 'heart-rate-zones'],
  examples: [
    // 3*30/60 = 1.5 mi; *5280 = 7920 ft; *0.12 = 950.4 ft; *0.3048 = 289.69 m; /10 = 95.04
    { values: { speed: 3, grade: 12, minutes: 30 }, expect: { gainFt: 950.4, miles: 1.5, flights: 95.04 }, tolerance: 1e-5 },
    // 3.5*45/60 = 2.625 mi; *5280 = 13860 ft; *0.10 = 1386 ft
    { values: { speed: 3.5, grade: 10, minutes: 45 }, expect: { gainFt: 1386, miles: 2.625, flights: 138.6 }, tolerance: 1e-5 },
  ],
});
