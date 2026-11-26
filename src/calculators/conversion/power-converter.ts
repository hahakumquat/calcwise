import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'power',
  [
    { id: 'w', name: 'Watts', info: 'The SI unit of power: one joule per second. Appliance labels list watts.' },
    { id: 'kw', name: 'Kilowatts', precision: 8, info: '1,000 watts. Electric heaters, car motors and home circuits are often quoted in kW.' },
    { id: 'hp', name: 'Horsepower (mechanical)', info: 'Mechanical (imperial) horsepower, about 745.7 W. The usual hp in the US and UK for engines and tools.' },
    { id: 'ps', name: 'Metric horsepower (PS)', info: 'Metric horsepower, 735.49875 W (75 kgf·m/s). Used on European and Japanese car specs as PS, CV or cv.' },
    { id: 'btuh', name: 'BTU per hour', info: 'British thermal units per hour, about 0.29307 W. US heaters, furnaces and air conditioners are rated in BTU/h.' },
    { id: 'rton', name: 'Refrigeration tons', precision: 8, info: 'One ton of refrigeration is 12,000 BTU/h, about 3.517 kW. Air conditioners are sized in tons.' },
  ],
  'w',
  { chartUnits: ['w', 'hp', 'ps'], chartTitle: 'The same power in watts and horsepower' },
);

export default defineCalculator({
  slug: 'power-converter',
  title: 'Power Converter',
  category: 'conversion',
  description: 'Convert power between watts, kilowatts, horsepower, metric horsepower (PS), BTU/h and tons of refrigeration.',
  keywords: ['watts to hp', 'hp to watts', 'kw to hp', 'watts to btu/h', 'btu/h to watts', 'horsepower to kw', 'ps to kw'],
  inputs: [{ id: 'value', label: 'Power', type: 'number', unit: 'power', units: ['w', 'kw', 'hp', 'ps', 'btuh', 'rton'], defaultUnit: 'w', default: 1500, info: 'Enter a power and pick its unit; every other unit updates instantly.' }],
  outputs: conv.outputs,
  compute: conv.compute,
  content: {
    formula: [
      '1 kW = 1,000 W',
      '1 hp (mechanical) = 745.6999 W',
      '1 PS (metric hp) = 735.49875 W',
      '1 BTU/h ≈ 0.29307107 W',
      '1 ton of refrigeration = 12,000 BTU/h ≈ 3,516.85 W',
    ],
    body: [
      'Power is the rate of doing work or using energy. The SI unit is the watt, one joule per second. Everything here is a fixed multiple of it, so converting is a single multiplication and division.',
      'Heaters and air conditioners in the US are sold in BTU/h, while the electricity they draw is printed in watts. A 1,500 W space heater puts out about 5,118 BTU/h. Engines are quoted in horsepower: one mechanical hp is about 745.7 W, so 2 hp is about 1,491 W.',
      'Two horsepowers exist. The mechanical (imperial) hp is 745.6999 W, and the metric horsepower (PS) is 735.49875 W, about 1.4% smaller. Car brochures outside the US usually mean PS, so check which one before comparing engines.',
    ],
    faq: [
      { q: 'How many watts are in a horsepower?', a: 'One mechanical horsepower is 745.6999 W, or about 0.7457 kW. One metric horsepower (PS) is 735.49875 W.' },
      { q: 'How do I convert watts to BTU/h?', a: 'Divide watts by 0.29307107, or multiply by about 3.41214. A 1,500 W heater gives off 5,118.2 BTU/h.' },
      { q: 'How many kW is 12,000 BTU/h?', a: '12,000 BTU/h is one ton of refrigeration, which is 3,516.85 W or about 3.52 kW of cooling or heating power.' },
      { q: 'Is a BTU/h the same as a BTU?', a: 'No. A BTU is an amount of energy (about 1,055 J). BTU/h is a rate, energy per hour. Use the energy converter for BTU, kWh and joules.' },
    ],
    sources: [
      { label: 'NIST Special Publication 811: Guide for the Use of the International System of Units (watt and unit definitions)', url: 'https://www.nist.gov/pml/special-publication-811' },
      { label: 'Definitions used: 1 mechanical hp = 550 ft·lbf/s = 745.6999 W; 1 PS = 75 kgf·m/s = 735.49875 W; 1 BTU (IT) = 1,055.05585262 J, so 1 BTU/h = 0.29307107 W; 1 ton of refrigeration = 12,000 BTU/h. General reference values, not re-checked against the publications for this page.' },
    ],
  },
  related: ['energy-converter', 'personal-heater-cost', 'electricity-cost'],
  examples: [
    // Inputs reach compute() in the base unit, watts.
    // 1 hp = 745.69987158227 W; 745.69987158227 / 1000 = 0.74569987 kW; / 735.49875 = 1.01386967 PS.
    { values: { value: 745.69987158227 }, expect: { hp: 1, w: 745.69987158227, kw: 0.74569987, ps: 1.01386967 }, tolerance: 1e-6 },
    // 1500 W / 0.29307107017 = 5118.2124 BTU/h; 1500 / 745.69987158 = 2.01153313 hp; 1.5 kW.
    { values: { value: 1500 }, expect: { btuh: 5118.2124, hp: 2.01153313, kw: 1.5 }, tolerance: 1e-6 },
    // 12,000 BTU/h = 12000 x 1055.05585262 / 3600 = 3516.85284 W = 1 ton.
    { values: { value: 3516.85284207 }, expect: { btuh: 12000, rton: 1, kw: 3.51685284 }, tolerance: 1e-6 },
  ],
});
