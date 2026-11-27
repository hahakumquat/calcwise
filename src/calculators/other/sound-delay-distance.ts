import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const MILE = 1609.344;
const FOOT = 0.3048;
const speedAt = (c: number) => 331.3 + 0.606 * c;

export default defineCalculator({
  slug: 'sound-delay-distance',
  title: 'Flash-to-Bang Distance Calculator',
  category: 'other',
  description: 'Count the seconds between a flash and its bang to estimate how far away lightning or a firework is, in metres, miles and feet, adjusted for air temperature.',
  keywords: ['flash to bang calculator', 'how far away is lightning', 'thunder distance calculator', 'firework distance from sound delay', 'speed of sound distance calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'sec', label: 'Seconds from flash to sound', type: 'number', default: 5, min: 0, step: 0.5, info: 'Count from the moment you see the flash or burst until you hear the bang.' },
    { id: 'unit', label: 'Temperature unit', type: 'select', segmented: true, default: 'C', options: [{ value: 'C', label: 'Celsius' }, { value: 'F', label: 'Fahrenheit' }], info: 'Choose the unit your thermometer or forecast uses.' },
    { id: 'temp', label: 'Air temperature', type: 'number', default: 20, step: 1, help: 'Sound travels a little faster in warmer air.', info: 'Outdoor air temperature in the unit above.' },
  ],
  outputs: [
    { id: 'm', label: 'Distance (m)', format: 'number', precision: 0, primary: true, info: 'Speed of sound times the delay. Light travel time is ignored.' },
    { id: 'mi', label: 'Distance (miles)', format: 'number', precision: 2, info: 'Metres divided by 1,609.344.' },
    { id: 'ft', label: 'Distance (feet)', format: 'number', precision: 0, info: 'Metres divided by 0.3048.' },
    { id: 'v', label: 'Speed of sound (m/s)', format: 'number', precision: 2, info: '331.3 + 0.606 × temperature in °C, an approximation.' },
    { id: 'spm', label: 'Seconds per mile', format: 'number', precision: 2, info: 'How many seconds of delay equal one mile at this temperature.' },
  ],
  compute: (x) => {
    const s = num(x.sec), t = num(x.temp);
    if (s === null || t === null) return { m: null };
    if (s < 0) return { m: null, error: 'Enter a delay of 0 seconds or more.' };
    const c = x.unit === 'F' ? ((t - 32) * 5) / 9 : t;
    if (c < -60 || c > 60) return { m: null, error: 'Enter an outdoor air temperature between -60 and 60 °C (-76 and 140 °F).' };
    const v = speedAt(c);
    const m = v * s;
    const mi = m / MILE;
    const secs = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20];
    return {
      m,
      mi,
      ft: m / FOOT,
      v,
      spm: MILE / v,
      tone: s < 3 ? 'warn' : 'ok',
      badge: `${fmt(+mi.toFixed(2))} mi away`,
      chart: {
        type: 'bar',
        title: 'Distance (miles) for other delays at this temperature',
        categories: secs.map((k) => `${k} s`),
        series: [{ name: 'Distance', values: secs.map((k) => (v * k) / MILE) }],
        format: { format: 'number', precision: 2 },
      },
      steps: [
        `Speed of sound = 331.3 + 0.606 × ${fmt(+c.toFixed(2))} = ${fmt(+v.toFixed(2))} m/s`,
        `Distance = ${fmt(+v.toFixed(2))} × ${fmt(s)} = ${fmt(+m.toFixed(1))} m`,
        `= ${fmt(+mi.toFixed(2))} mi = ${fmt(Math.round(m / FOOT))} ft`,
      ],
      note: 'An estimate only. If you can hear thunder, you are close enough to be struck: go indoors.',
    };
  },
  content: {
    formula: ['Speed of sound (m/s) ≈ 331.3 + 0.606 × T, with T in °C', 'Distance = speed of sound × seconds', 'Miles = metres ÷ 1,609.344; feet = metres ÷ 0.3048'],
    body: [
      'Light reaches you almost instantly, while sound takes noticeable time, so the gap between a flash and its bang tells you the distance. Multiply the seconds by the speed of sound. In air that speed is roughly 331.3 + 0.606 × T metres per second, where T is the temperature in °C. This straight-line formula is an approximation that works well at everyday outdoor temperatures. The time light takes is ignored.',
      'At 20 °C the speed is 343.42 m/s. A 5 second delay gives 1,717.1 m, which is 1.07 miles or about 5,634 feet. At that temperature one mile takes 4.69 seconds, so the familiar rule of about 5 seconds per mile is close.',
      'Treat the result as an estimate: wind, humidity, terrain and your counting all add error. If you can hear thunder at all, lightning can reach you, so move indoors.',
    ],
    faq: [
      { q: 'How far away is lightning if I count 5 seconds?', a: 'At 20 °C, about 1,717 m, which is 1.07 miles or 5,634 feet.' },
      { q: 'How far is a firework if the bang arrives 3 seconds after the burst at 0 °C?', a: 'The speed of sound is 331.3 m/s at 0 °C, so it is about 994 m, which is 0.62 miles.' },
      { q: 'Does temperature matter?', a: 'A little. Sound is about 0.6 m/s faster for each extra degree Celsius, so the same delay means a slightly longer distance on a warm day.' },
      { q: 'How many seconds equal a mile?', a: 'About 4.69 seconds at 20 °C. Counting 5 seconds per mile is a handy rule of thumb.' },
      { q: 'Is the formula exact?', a: 'No. It is a standard approximation for the speed of sound in dry air, and real air varies a little.' },
    ],
    sources: [],
  },
  related: ['speed-converter', 'frequency-wavelength', 'stopping-distance'],
  examples: [
    // v = 331.3 + 0.606*20 = 343.42; d = 1717.1 m; mi = 1717.1/1609.344 = 1.066956; ft = 1717.1/0.3048 = 5633.530; spm = 1609.344/343.42 = 4.6862
    { values: { sec: 5, unit: 'C', temp: 20 }, expect: { m: 1717.1, mi: 1.066956, ft: 5633.530, v: 343.42, spm: 4.6862 }, tolerance: 0.001 },
    // 68 F = 20 C; 10 s -> 3434.2 m; /1609.344 = 2.133913
    { values: { sec: 10, unit: 'F', temp: 68 }, expect: { m: 3434.2, mi: 2.133913, v: 343.42 }, tolerance: 0.001 },
    // 0 C: v = 331.3; 3 s -> 993.9 m; /1609.344 = 0.617581; /0.3048 = 3260.827
    { values: { sec: 3, unit: 'C', temp: 0 }, expect: { m: 993.9, mi: 0.617581, ft: 3260.827, v: 331.3 }, tolerance: 0.001 },
  ],
});
