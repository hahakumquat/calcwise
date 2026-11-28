import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const BTU_PER_THERM = 100000;

export default defineCalculator({
  slug: 'fireplace-cost-per-hour',
  title: 'Fireplace Cost per Hour Calculator',
  category: 'everyday',
  description: 'See what a fireplace costs per hour and per evening for an electric, gas log or wood fire, using your own fuel price and burn rate. Fuel cost only.',
  keywords: ['fireplace cost per hour', 'gas fireplace cost to run', 'electric fireplace cost', 'wood fire cost per hour', 'gas log cost'],
  updated: '2026-11-28',
  inputs: [
    { id: 'type', label: 'Fireplace type', type: 'select', default: 'electric', segmented: true, options: [
      { value: 'electric', label: 'Electric' },
      { value: 'gas', label: 'Gas' },
      { value: 'wood', label: 'Wood' },
    ], info: 'Pick the fuel your fireplace uses.' },
    { id: 'kw', label: 'Power draw', type: 'number', suffix: 'kW', default: 1.5, min: 0, step: 0.1, showWhen: { input: 'type', is: 'electric' }, info: 'Heater power in kilowatts, on the label. Many electric fireplace heaters draw 1.5 kW on high.' },
    { id: 'kwhPrice', label: 'Electricity price', type: 'number', prefix: '$', suffix: 'per kWh', default: 0.16, min: 0, step: 0.01, showWhen: { input: 'type', is: 'electric' }, info: 'Price per kilowatt-hour on your power bill.' },
    { id: 'btu', label: 'Gas burn rate', type: 'number', suffix: 'BTU/hr', default: 25000, min: 0, step: 1000, showWhen: { input: 'type', is: 'gas' }, info: 'Input rating of the logs or insert, in BTU per hour, from the manual or label.' },
    { id: 'thermPrice', label: 'Gas price', type: 'number', prefix: '$', suffix: 'per therm', default: 1.5, min: 0, step: 0.05, showWhen: { input: 'type', is: 'gas' }, info: 'Price per therm on your gas bill. 1 therm is 100,000 BTU.' },
    { id: 'cordPrice', label: 'Cord price', type: 'number', prefix: '$', default: 300, min: 0, step: 10, showWhen: { input: 'type', is: 'wood' }, info: 'What you pay for a full cord of firewood.' },
    { id: 'hoursPerCord', label: 'Burning hours per cord', type: 'number', suffix: 'hours', default: 100, min: 1, step: 5, showWhen: { input: 'type', is: 'wood' }, info: 'Your own estimate of how many hours one cord lasts. It varies a lot with wood, stove and how hot you burn.' },
    { id: 'hours', label: 'Hours per evening', type: 'number', suffix: 'hours', default: 4, min: 0, step: 0.5, info: 'How long the fire is on in a typical evening.' },
  ],
  outputs: [
    { id: 'perHour', label: 'Cost per hour', format: 'currency', precision: 3, primary: true, info: 'Fuel cost for one hour of burning.' },
    { id: 'perEvening', label: 'Cost per evening', format: 'currency', info: 'Cost per hour × hours per evening.' },
  ],
  compute: (v) => {
    const t = String(v.type);
    const hrs = num(v.hours);
    if (hrs === null || hrs < 0) return { perHour: null };
    let perHour: number;
    let step: string;
    if (t === 'electric') {
      const kw = num(v.kw), p = num(v.kwhPrice);
      if (kw === null || p === null || kw < 0 || p < 0) return { perHour: null };
      perHour = kw * p;
      step = `Electric: ${kw} kW × $${p}/kWh = $${perHour.toFixed(3)} per hour`;
    } else if (t === 'gas') {
      const b = num(v.btu), p = num(v.thermPrice);
      if (b === null || p === null || b < 0 || p < 0) return { perHour: null };
      perHour = (b / BTU_PER_THERM) * p;
      step = `Gas: ${b} ÷ 100,000 × $${p}/therm = $${perHour.toFixed(3)} per hour`;
    } else if (t === 'wood') {
      const c = num(v.cordPrice), h = num(v.hoursPerCord);
      if (c === null || h === null || c < 0 || h <= 0) return { perHour: null };
      perHour = c / h;
      step = `Wood: $${c} ÷ ${h} hours = $${perHour.toFixed(3)} per hour`;
    } else return { perHour: null };
    const perEvening = perHour * hrs;
    return {
      perHour,
      perEvening,
      tone: 'ok',
      badge: `$${fmt(perEvening)} for a ${hrs}-hour evening`,
      note: 'This is the cost of fuel only, not the heat delivered to the room. Rates are the ones you entered.',
      chart: {
        type: 'bar',
        title: 'Cost by hours of burning',
        categories: ['1 hour', `${hrs} hours`, '30 evenings'],
        series: [{ name: 'Cost', values: [perHour, perEvening, perEvening * 30] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [step, `Evening: $${perHour.toFixed(3)} × ${hrs} h = $${perEvening.toFixed(2)}`],
    };
  },
  content: {
    formula: [
      'Electric: cost per hour = kW × price per kWh',
      'Gas: cost per hour = BTU per hour ÷ 100,000 × price per therm',
      'Wood: cost per hour = cord price ÷ burning hours per cord',
      'Per evening = cost per hour × hours',
    ],
    body: [
      'A fireplace feels cheap or expensive depending on its fuel. This calculator turns the rate you pay into a cost per hour and per evening, using your numbers for every price and burn rate.',
      'For electric, kilowatts times your price per kWh is the whole story. For gas, one therm is 100,000 BTU, so a 25,000 BTU per hour log set burns a quarter of a therm each hour. For wood, the burning hours per cord is your own estimate, so adjust it to your habits.',
      'Only fuel is counted: no equipment, chimney cleaning or maintenance. It also does not measure heat delivered, because a wood fireplace sends much of its heat up the chimney while an electric heater turns nearly all its power into room heat. For a whole-house comparison see the heating fuel cost calculator, and for wood amounts the firewood cord calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'What does an electric fireplace cost per hour?', a: 'At 1.5 kW and $0.16 per kWh it is $0.24 per hour, or $0.96 for a 4-hour evening.' },
      { q: 'What does a gas fireplace cost per hour?', a: 'At 25,000 BTU per hour and $1.50 per therm it is $0.375 per hour, shown as $0.38, or $1.50 for a 4-hour evening.' },
      { q: 'How is wood priced per hour?', a: 'A $300 cord that lasts 100 hours costs $3.00 per hour, or $12.00 for 4 hours. Your hours per cord will differ.' },
      { q: 'Is this the cost of heating the room?', a: 'No. It is fuel cost only, not heat delivered.' },
    ],
    sources: [
      { label: 'US EIA: Units and calculators (therm and BTU)', url: 'https://www.eia.gov/energyexplained/units-and-calculators/' },
    ],
  },
  related: ['heating-fuel-cost', 'firewood-cord', 'personal-heater-cost'],
  examples: [
    // 1.5 * 0.16 = 0.24; *4 = 0.96
    { values: { type: 'electric', kw: 1.5, kwhPrice: 0.16, hours: 4 }, expect: { perHour: 0.24, perEvening: 0.96 }, tolerance: 1e-9 },
    // 25000/100000 * 1.5 = 0.375; *4 = 1.5
    { values: { type: 'gas', btu: 25000, thermPrice: 1.5, hours: 4 }, expect: { perHour: 0.375, perEvening: 1.5 }, tolerance: 1e-9 },
    // 300/100 = 3; *4 = 12
    { values: { type: 'wood', cordPrice: 300, hoursPerCord: 100, hours: 4 }, expect: { perHour: 3, perEvening: 12 }, tolerance: 1e-9 },
  ],
});
