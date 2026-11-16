import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const r1 = (x: number) => Math.round(x * 10) / 10;

// NWS wind chill index (2001), US units: T in deg F, V in mph.
const windChillF = (t: number, v: number) => {
  const p = Math.pow(v, 0.16);
  return 35.74 + 0.6215 * t - 35.75 * p + 0.4275 * t * p;
};

export default defineCalculator({
  slug: 'wind-chill',
  title: 'Wind Chill Calculator',
  category: 'everyday',
  description: 'Find the wind chill "feels like" temperature from air temperature and wind speed, in °F or °C, using the US National Weather Service formula.',
  keywords: ['wind chill calculator', 'feels like temperature', 'wind chill chart', 'wind chill formula', 'wind chill celsius'],
  inputs: [
    {
      id: 'unit', label: 'Units', type: 'select', default: 'us', segmented: true,
      options: [{ value: 'us', label: '°F and mph' }, { value: 'si', label: '°C and km/h' }],
      info: 'Pick US units (°F, mph) or metric (°C, km/h).',
    },
    { id: 'temp', label: 'Air temperature', type: 'number', default: 20, step: 1, info: 'Actual air temperature in the units chosen above.' },
    { id: 'wind', label: 'Wind speed', type: 'number', default: 15, min: 0, step: 1, info: 'Wind speed in mph or km/h, as chosen above.' },
  ],
  outputs: [
    { id: 'chill', label: 'Feels like', precision: 1, primary: true, suffix: '°', info: 'Wind chill index in your chosen unit. Only defined at or below 50 °F (10 °C) with wind above 3 mph (4.8 km/h).' },
    { id: 'drop', label: 'Colder than the air by', precision: 1, suffix: '°', info: 'Air temperature minus wind chill.' },
  ],
  compute: (v) => {
    const si = v.unit === 'si';
    const t = num(v.temp);
    const w = num(v.wind);
    if (t === null || w === null) return { chill: null };
    if (w < 0) return { chill: null, error: 'Wind speed cannot be negative.' };
    const tF = si ? (t * 9) / 5 + 32 : t;
    const mph = si ? w / 1.609344 : w;
    if (tF > 50 || mph <= 3) {
      return { chill: null, error: 'Wind chill is only defined at or below 50 °F (10 °C) with wind above 3 mph (4.8 km/h).' };
    }
    const cF = windChillF(tF, mph);
    const chill = si ? ((cF - 32) * 5) / 9 : cF;
    const drop = t - chill;
    const speeds = [5, 10, 15, 20, 30, 40].filter((s) => s > 3);
    const seriesVals = speeds.map((s) => {
      const f = windChillF(tF, s);
      return si ? ((f - 32) * 5) / 9 : f;
    });
    return {
      chill,
      drop,
      chart: {
        type: 'bar',
        title: `Feels like at ${t}° by wind speed (mph)`,
        categories: speeds.map((s) => `${s}`),
        series: [{ name: 'Feels like', values: seriesVals }],
        format: { format: 'integer', suffix: '°' },
      },
      steps: [
        `Air ${r1(tF)} °F, wind ${r1(mph)} mph`,
        `Wind chill = 35.74 + 0.6215T − 35.75V^0.16 + 0.4275TV^0.16 = ${r1(cF)} °F`,
      ],
    };
  },
  content: {
    formula: ['Wind chill (°F) = 35.74 + 0.6215T − 35.75 V^0.16 + 0.4275 T V^0.16', 'T = air temperature in °F, V = wind speed in mph'],
    body: [
      'Wind chill is how cold bare skin feels when moving air strips heat away faster than still air would. It is not a real air temperature: a thermometer in the wind still reads the air temperature. Enter the temperature and wind speed to get the "feels like" value from the US National Weather Service index.',
      'The formula only applies at or below 50 °F (10 °C) and when the wind is above 3 mph (about 4.8 km/h). Outside that range the calculator says so rather than guessing. Metric inputs are converted to °F and mph, run through the same formula, then converted back.',
      'Wind chill assumes shade at night. Direct sun can make it feel warmer, and the index says nothing about wet clothes or exposed skin time, so dress for the conditions and check your local forecast warnings.',
    ],
    faq: [
      { q: 'What is the wind chill at 0 °F with a 15 mph wind?', a: 'About −19.4 °F. That is 35.74 − 35.75 × 15^0.16 = 35.74 − 55.13.' },
      { q: 'Why does it say wind chill is not defined?', a: 'The NWS formula is valid only at or below 50 °F (10 °C) with wind above 3 mph (4.8 km/h). Outside that range the index is not meaningful.' },
      { q: 'Does wind chill change the real temperature?', a: 'No. Pipes, cars and other objects only cool to the air temperature. Wind chill describes the effect on exposed skin of people and animals.' },
    ],
    sources: [
      { label: 'US National Weather Service: Wind chill', url: 'https://www.weather.gov/ama/WindChill' },
    ],
  },
  related: ['heating-cost', 'holiday-lights', 'year-progress'],
  examples: [
    // 15^0.16 = 1.54228; 35.74 - 35.75*1.54228 = -19.398 (NWS rounds to -19)
    { values: { unit: 'us', temp: 0, wind: 15 }, expect: { chill: -19.397954, drop: 19.397954 } },
    // 20 F, 10 mph: 35.74 + 12.43 - 35.75*1.44544 + 0.4275*20*1.44544 = 8.854
    { values: { unit: 'us', temp: 20, wind: 10 }, expect: { chill: 8.854039 } },
    // -10 C = 14 F, 20 km/h = 12.427 mph -> -0.1048 F = -17.836 C
    { values: { unit: 'si', temp: -10, wind: 20 }, expect: { chill: -17.836006 } },
  ],
});
