import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'pressure',
  [
    { id: 'bar', name: 'Bar', info: '100,000 pascals, close to atmospheric pressure. Common for tires and diving in Europe.' },
    { id: 'psi', name: 'Pounds per square inch', info: 'Pounds-force per square inch, about 6,895 Pa. US tire pressures are usually 30–35 psi.' },
    { id: 'kpa', name: 'Kilopascals', info: '1,000 pascals. Tire placards in Canada and Australia often use kPa.' },
    { id: 'pa', name: 'Pascals', info: 'The SI unit: one newton of force per square meter.' },
    { id: 'atm', name: 'Atmospheres', info: 'Standard atmosphere, exactly 101,325 Pa — average air pressure at sea level.' },
    { id: 'mmhg', name: 'Millimeters of mercury', info: 'Millimeters of mercury, about 133.3 Pa. Blood pressure is measured in mmHg.' },
  ],
  'bar',
  { chartUnits: ['bar', 'atm'], chartTitle: 'Bar and atmospheres side by side' },
);

export default defineCalculator({
  slug: 'pressure-converter',
  title: 'Pressure Converter',
  category: 'conversion',
  description: 'Convert pressure between psi, bar, kPa, pascals, atmospheres and mmHg.',
  keywords: ['psi to bar', 'bar to psi', 'kpa to psi', 'tire pressure', 'atm', 'mmhg'],
  inputs: [{ id: 'value', label: 'Pressure', type: 'number', unit: 'pressure', defaultUnit: 'psi', default: 32, info: 'Enter a pressure and pick its unit; every other unit updates instantly.' }],
  outputs: conv.outputs,
  compute: conv.compute,
  content: {
    formula: ['1 Pa = 1 N/m²', '1 bar = 100,000 Pa = 100 kPa', '1 atm = 101,325 Pa (exact)', '1 psi ≈ 6,894.757 Pa', '1 mmHg ≈ 133.322 Pa'],
    body: [
      'Pressure is force per unit area. The SI unit, the pascal, is one newton per square meter — a tiny amount, so kilopascals are used for most practical figures. The bar (100 kPa) is close to atmospheric pressure at sea level and is popular in Europe for tires and scuba tanks.',
      'In the US, tire and air-compressor pressures are usually given in psi (pounds-force per square inch). A typical passenger-car tire at 32–35 psi is about 2.2–2.4 bar. These are gauge pressures — the amount above the surrounding air.',
      'The standard atmosphere is defined as exactly 101,325 Pa. Blood pressure is still measured in millimeters of mercury, an old unit based on how high air pressure pushes a column of mercury: one atmosphere supports 760 mm.',
    ],
    faq: [
      { q: 'What is 2.5 bar in psi?', a: 'About 36.3 psi.' },
      { q: 'What is the difference between psi and psig?', a: 'psig is gauge pressure (relative to the air around you) and psia is absolute pressure (relative to a vacuum). psia = psig + about 14.7 at sea level. The conversion factors are the same for both.' },
    ],
  },
  related: ['energy-converter', 'temperature-converter'],
  examples: [
    { values: { value: 101325 }, expect: { atm: 1, kpa: 101.325, bar: 1.01325, mmhg: 759.99986, psi: 14.6959487755 }, tolerance: 1e-7 },
    { values: { value: 6894.757293168 }, expect: { psi: 1, bar: 0.06894757293168 } },
  ],
});
