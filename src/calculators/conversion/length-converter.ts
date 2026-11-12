import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'length',
  [
    { id: 'm', name: 'Meters', info: 'The SI base unit of length, defined by the distance light travels in 1/299,792,458 of a second.' },
    { id: 'cm', name: 'Centimeters', info: 'One hundredth of a meter. 2.54 cm make an inch.' },
    { id: 'mm', name: 'Millimeters', info: 'One thousandth of a meter — the unit on most engineering drawings.' },
    { id: 'km', name: 'Kilometers', precision: 8, info: '1,000 meters. Road distances outside the US and UK are in kilometers.' },
    { id: 'in', name: 'Inches', info: 'Exactly 2.54 cm. Twelve inches make a foot.' },
    { id: 'ft', name: 'Feet', info: 'Exactly 0.3048 m, or 12 inches. Used for heights and room sizes in the US.' },
    { id: 'yd', name: 'Yards', info: 'Exactly 0.9144 m, or 3 feet. Used for fabric and American football fields.' },
    { id: 'mi', name: 'Miles', precision: 8, info: 'Exactly 1,609.344 m, or 5,280 feet. The standard US road distance.' },
    { id: 'nmi', name: 'Nautical miles', precision: 8, info: 'Exactly 1,852 m, about one minute of latitude. Used at sea and in aviation.' },
  ],
  'm',
  {
  chartUnits: ['m', 'yd', 'ft'], chartTitle: 'Meters, yards and feet side by side',
  extra: (m) => {
    const totalIn = m / 0.0254;
    const sign = totalIn < 0 ? '−' : '';
    let ft = Math.floor(Math.abs(totalIn) / 12);
    let inch = Math.round((Math.abs(totalIn) - ft * 12) * 100) / 100;
    if (inch >= 12) {
      ft += 1;
      inch -= 12;
    }
    return { ftin: `${sign}${ft} ft ${inch} in` };
  } },
);

export default defineCalculator({
  slug: 'length-converter',
  title: 'Length Converter',
  category: 'conversion',
  description: 'Convert between meters, centimeters, millimeters, kilometers, inches, feet, yards and miles.',
  keywords: ['feet to meters', 'inches to cm', 'cm to inches', 'km to miles', 'miles to km', 'meters to feet', 'distance converter'],
  popular: true,
  inputs: [{ id: 'value', label: 'Length', type: 'number', unit: 'length', defaultUnit: 'ft', default: 6, info: 'Enter a length and pick its unit; every other unit updates instantly.' }],
  outputs: [...conv.outputs, { id: 'ftin', label: 'Feet and inches', format: 'text', info: 'The length in whole feet and remaining inches, the usual way to state a person’s height in the US.' }],
  compute: conv.compute,
  content: {
    formula: ['1 in = 2.54 cm (exact)', '1 ft = 12 in = 0.3048 m', '1 yd = 3 ft = 0.9144 m', '1 mi = 5,280 ft = 1.609344 km', '1 nmi = 1,852 m'],
    body: [
      'Since the 1959 international yard and pound agreement, the inch has been defined as exactly 2.54 centimeters. Every other US customary length follows from it, so conversions such as 1 foot = 0.3048 m and 1 mile = 1.609344 km are exact, not approximations.',
      'The meter itself is defined by the speed of light: the distance light travels in a vacuum in 1/299,792,458 of a second. Metric prefixes then step by powers of ten — 1 km = 1,000 m, 1 m = 100 cm = 1,000 mm.',
      'The nautical mile, used in aviation and shipping, is 1,852 m — roughly one minute of latitude. Choose any input unit and every other unit updates at once; heights are also shown in feet and inches.',
    ],
    faq: [
      { q: 'How many centimeters are in a foot?', a: 'Exactly 30.48 cm.' },
      { q: 'How do I convert my height from cm to feet and inches?', a: 'Switch the input unit to cm and enter your height; the “Feet and inches” output shows it directly. 175 cm is 5 ft 8.9 in.' },
      { q: 'Is a kilometer longer than a mile?', a: 'No. A mile is about 1.61 km, so 10 km (a “10K” race) is about 6.2 miles.' },
    ],
  },
  related: ['area-converter', 'volume-converter', 'speed-converter', 'square-footage'],
  examples: [
    { values: { value: 0.3048 }, expect: { ft: 1, in: 12, m: 0.3048, cm: 30.48, yd: 1 / 3, ftin: '1 ft 0 in' } },
    { values: { value: 1609.344 }, expect: { mi: 1, km: 1.609344, ft: 5280 } },
    { values: { value: 1.75 }, expect: { ftin: '5 ft 8.9 in' } },
  ],
});
