import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'ev-winter-range',
  title: 'EV Winter Range: Miles and Cost Lost to Cold',
  category: 'everyday',
  description: 'Turn a cold-weather range loss into numbers. Enter rated range and your winter loss to see winter miles, miles lost and the extra charging cost per mile.',
  keywords: ['ev winter range calculator', 'electric car range in cold weather', 'ev range loss cold', 'ev winter charging cost', 'cold weather ev range'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'range', label: 'Rated range', type: 'number', suffix: 'mi', default: 300, min: 0, step: 5, info: 'Full-battery range in mild weather, from your own experience or the car’s specs.' },
    { id: 'loss', label: 'Cold range loss', type: 'number', suffix: '%', default: 25, min: 0, max: 90, step: 1, info: 'Your own estimate of the range lost in the cold. It varies by car, speed, heating and trip length.' },
    { id: 'battery', label: 'Battery size', type: 'number', suffix: 'kWh', default: 75, min: 0, step: 1, info: 'Usable battery capacity in kWh.' },
    { id: 'price', label: 'Electricity price', type: 'number', prefix: '$', suffix: 'per kWh', default: 0.16, min: 0, step: 0.01, info: 'What you pay per kWh where you charge.' },
    { id: 'miles', label: 'Winter miles driven', type: 'number', suffix: 'mi', default: 1000, min: 0, step: 50, info: 'Miles you drive while the loss applies, for the extra cost total.' },
  ],
  outputs: [
    { id: 'winterRange', label: 'Winter range', format: 'number', suffix: 'mi', precision: 0, primary: true, info: 'Rated range × (1 − loss).' },
    { id: 'lost', label: 'Miles lost', format: 'number', suffix: 'mi', precision: 0, info: 'Rated range − winter range.' },
    { id: 'mildCpm', label: 'Cost per mile, mild', format: 'currency', precision: 3, info: 'Battery kWh × price ÷ rated range.' },
    { id: 'winterCpm', label: 'Cost per mile, winter', format: 'currency', precision: 3, info: 'Battery kWh × price ÷ winter range.' },
    { id: 'extra', label: 'Extra charging cost', format: 'currency', precision: 2, info: '(Winter − mild cost per mile) × winter miles.' },
  ],
  compute: (v) => {
    const range = num(v.range);
    const loss = num(v.loss);
    const battery = num(v.battery);
    const price = num(v.price);
    const miles = num(v.miles);
    if (range === null || loss === null || battery === null || price === null || miles === null) return { winterRange: null };
    if (range <= 0 || loss < 0 || loss >= 100 || battery < 0 || price < 0 || miles < 0) return { winterRange: null };
    const winterRange = range * (1 - loss / 100);
    const lost = range - winterRange;
    const mildCpm = (battery * price) / range;
    const winterCpm = (battery * price) / winterRange;
    const extra = (winterCpm - mildCpm) * miles;
    return {
      winterRange,
      lost,
      mildCpm,
      winterCpm,
      extra,
      tone: 'ok',
      badge: `About ${fmt(winterRange, 0)} miles in the cold`,
      note: `A ${fmt(loss, 1)}% loss takes ${fmt(range, 0)} miles down to ${fmt(winterRange, 0)}. Each mile costs ${money(winterCpm)} instead of ${money(mildCpm)}, so ${fmt(miles, 0)} winter miles cost ${money(extra)} more. The loss is your own estimate, and charging losses are not included.`,
      chart: {
        type: 'bar' as const,
        title: 'Range per full charge (miles)',
        categories: ['Mild weather', 'Winter'],
        series: [{ name: 'Range', values: [range, winterRange] }],
        format: { format: 'integer', suffix: ' mi' },
        highlight: 1,
      },
      steps: [
        `Winter range = ${fmt(range, 0)} × (1 − ${fmt(loss, 1)}%) = ${fmt(winterRange, 1)} mi`,
        `Mild cost per mile = ${fmt(battery, 1)} kWh × ${money(price)} ÷ ${fmt(range, 0)} = ${money(mildCpm)}`,
        `Winter cost per mile = ${fmt(battery, 1)} × ${money(price)} ÷ ${fmt(winterRange, 1)} = ${money(winterCpm)}`,
        `Extra = (${money(winterCpm)} − ${money(mildCpm)}) × ${fmt(miles, 0)} = ${money(extra)}`,
      ],
    };
  },
  content: {
    formula: [
      'Winter range = rated range × (1 − loss %)',
      'Cost per mile = battery kWh × price per kWh ÷ range',
      'Extra cost = (winter cost per mile − mild cost per mile) × winter miles',
    ],
    body: [
      'Cold weather, cabin heat and short trips can shrink an electric car’s range. This calculator turns your own loss estimate into winter miles and the extra it costs to cover the same distance.',
      'Example: a 300-mile car with a 25% loss has 225 miles of winter range, so 75 are lost. With a 75 kWh battery and electricity at $0.16 a kWh, a mile costs $0.040 in mild weather and $0.053 in winter. Over 1,000 winter miles that is $13.33 more.',
      'The percentage is yours to choose, not a measured figure, and the cost uses the full battery at your price with no charging loss. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much range does an EV lose in the cold?', a: 'It depends on the car, the temperature, speed and how much you heat the cabin. Note your own range on a cold day and enter that loss.' },
      { q: 'Does this include charging losses?', a: 'No. It uses battery kWh times your price. For losses and session cost, see the EV charging time calculator.' },
      { q: 'Is this for gas cars?', a: 'No. For gas, see the winter MPG penalty calculator.' },
      { q: 'How is the extra cost worked out?', a: 'The difference between winter and mild cost per mile, times the winter miles you enter.' },
    ],
    sources: [],
  },
  related: ['ev-charging-time', 'ev-vs-gas-cost', 'winter-mpg-penalty', 'cost-per-mile'],
  examples: [
    // winter 300*.75=225; lost 75; mild 75*.16/300=.04; winter 12/225=.053333; extra .013333*1000=13.3333
    { values: { range: 300, loss: 25, battery: 75, price: 0.16, miles: 1000 }, expect: { winterRange: 225, lost: 75, mildCpm: 0.04, winterCpm: 12 / 225, extra: (12 / 225 - 0.04) * 1000 } },
    // 200 mi, 50%: winter 100; lost 100; battery 60, price .20: 12/200=.06; 12/100=.12; 500 mi -> .06*500=30
    { values: { range: 200, loss: 50, battery: 60, price: 0.2, miles: 500 }, expect: { winterRange: 100, lost: 100, mildCpm: 0.06, winterCpm: 0.12, extra: 30 } },
  ],
});
