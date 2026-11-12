import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'speed',
  [
    { id: 'kph', name: 'Kilometers per hour', info: 'Kilometers per hour — road speeds in most of the world.' },
    { id: 'mph', name: 'Miles per hour', info: 'Miles per hour — road speeds in the US and UK. 1 mph = 1.609344 km/h exactly.' },
    { id: 'mps', name: 'Meters per second', info: 'Meters per second, the SI unit of speed. Multiply by 3.6 for km/h.' },
    { id: 'fps', name: 'Feet per second', info: 'Feet per second, used in ballistics and some engineering. 60 mph = 88 ft/s.' },
    { id: 'kn', name: 'Knots', info: 'Knots: one nautical mile per hour, about 1.15 mph. Used at sea and in aviation.' },
  ],
  'kph',
  {
  chartUnits: ['kph', 'mph', 'kn', 'mps'], chartTitle: 'The same speed in different units',
  extra: (mps) => {
    if (mps <= 0) return { pace: null };
    const minPerKm = 1000 / mps / 60;
    const fmt = (m: number) => {
      const s = Math.round(m * 60);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };
    return { pace: `${fmt(minPerKm)} min/km · ${fmt(minPerKm * 1.609344)} min/mi` };
  } },
);

export default defineCalculator({
  slug: 'speed-converter',
  title: 'Speed Converter',
  category: 'conversion',
  description: 'Convert speeds between mph, km/h, meters per second, feet per second and knots, with running pace.',
  keywords: ['mph to kmh', 'km/h to mph', 'kph to mph', 'knots to mph', 'm/s to km/h', 'velocity converter'],
  inputs: [{ id: 'value', label: 'Speed', type: 'number', unit: 'speed', defaultUnit: 'mph', default: 60, info: 'Enter a speed and pick its unit; every other unit updates instantly.' }],
  outputs: [...conv.outputs, { id: 'pace', label: 'Equivalent pace', format: 'text', info: 'Time needed to cover one kilometer and one mile at this speed, as runners measure it.' }],
  compute: conv.compute,
  content: {
    formula: ['1 mph = 1.609344 km/h (exact)', '1 m/s = 3.6 km/h', '1 knot = 1 nmi/h = 1.852 km/h', '1 ft/s = 0.3048 m/s'],
    body: [
      'Every speed unit is a length unit divided by a time unit, so the conversions follow from the exact length definitions: a mile is 1.609344 km, so 60 mph is 96.56 km/h. To go from m/s to km/h multiply by 3.6 (3,600 seconds per hour ÷ 1,000 meters per kilometer).',
      'Knots — nautical miles per hour — are used at sea and in aviation because a nautical mile corresponds to one minute of latitude, which makes chart navigation simple. One knot is about 1.15 mph.',
      'Runners and walkers often think in pace rather than speed, so the converter also shows the time needed per kilometer and per mile at the entered speed.',
    ],
    faq: [
      { q: 'What is 100 km/h in mph?', a: 'About 62.1 mph.' },
      { q: 'How fast is the speed of sound?', a: 'About 343 m/s (1,235 km/h or 767 mph) in dry air at 20 °C. It varies with temperature.' },
    ],
  },
  related: ['length-converter', 'time-converter', 'gas-cost'],
  examples: [
    { values: { value: 26.8224 }, expect: { mph: 60, kph: 96.56064, fps: 88, pace: '0:37 min/km · 1:00 min/mi' } },
    { values: { value: 10 }, expect: { kph: 36 } },
    { values: { value: 0.514444444444 }, expect: { kn: 1 }, tolerance: 1e-9 },
  ],
});
