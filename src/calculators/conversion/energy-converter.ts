import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'energy',
  [
    { id: 'kj', name: 'Kilojoules', info: '1,000 joules. Food labels outside the US list energy in kJ.' },
    { id: 'j', name: 'Joules', info: 'The SI unit of energy: one watt for one second.' },
    { id: 'cal', name: 'Calories (small)', info: 'The small calorie, exactly 4.184 J — about the energy to warm 1 g of water by 1 °C.' },
    { id: 'kcal', name: 'Kilocalories (food Calories)', info: '1,000 small calories = one food Calorie, 4.184 kJ.' },
    { id: 'wh', name: 'Watt-hours', info: '3,600 joules: one watt sustained for an hour. Battery capacities use Wh.' },
    { id: 'kwh', name: 'Kilowatt-hours', precision: 8, info: '3.6 million joules. Electricity bills charge per kWh.' },
    { id: 'btu', name: 'British thermal units', info: 'British thermal unit, about 1,055 J. US furnaces and air conditioners are rated in BTU.' },
  ],
  'kj',
  { chartUnits: ['kj', 'btu', 'wh', 'kcal'], chartTitle: 'The same energy in units of similar size' },
);

export default defineCalculator({
  slug: 'energy-converter',
  title: 'Energy Converter',
  category: 'conversion',
  description: 'Convert energy between joules, kilojoules, calories, kilocalories, watt-hours, kWh and BTU.',
  keywords: ['kcal to kj', 'calories to kilojoules', 'joules to calories', 'kwh to btu', 'btu to kwh', 'energy units'],
  inputs: [{ id: 'value', label: 'Energy', type: 'number', unit: 'energy', defaultUnit: 'kcal', default: 2000, info: 'Enter an amount of energy and pick its unit; every other unit updates instantly.' }],
  outputs: conv.outputs,
  compute: conv.compute,
  content: {
    formula: ['1 cal (thermochemical) = 4.184 J', '1 kcal = 1 food Calorie = 4.184 kJ', '1 Wh = 3,600 J; 1 kWh = 3.6 MJ', '1 BTU (IT) ≈ 1,055.06 J'],
    body: [
      'The joule is the SI unit of energy: the work done by a force of one newton over one meter, or one watt of power for one second. Everything else here is a fixed multiple of it.',
      'Food labels say “Calories” but mean kilocalories: a 2,000 Calorie diet is 2,000 kcal, or about 8,370 kJ — the figure printed on labels in Australia and Europe. A small calorie (cal) is the energy to warm one gram of water by about one degree Celsius.',
      'Electricity is billed in kilowatt-hours, and heating and air-conditioning equipment in the US is rated in BTU. One kWh is about 3,412 BTU, which is why a 1.5 kW space heater is roughly a 5,000 BTU/h heater.',
    ],
    faq: [
      { q: 'How many kJ are in a calorie?', a: 'One food Calorie (kcal) is 4.184 kJ. One small calorie is 4.184 J.' },
      { q: 'How much energy is 1 kWh?', a: '3.6 million joules — enough to run a 100 W bulb for 10 hours, or about 860 food Calories.' },
    ],
  },
  related: ['electricity-cost', 'temperature-converter', 'pressure-converter'],
  examples: [
    { values: { value: 8368000 }, expect: { kcal: 2000, kj: 8368, cal: 2000000 } },
    { values: { value: 3.6e6 }, expect: { kwh: 1, wh: 1000, btu: 3412.14163 }, tolerance: 1e-8 },
  ],
});
