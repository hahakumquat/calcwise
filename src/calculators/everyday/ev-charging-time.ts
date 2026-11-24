import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const hm = (h: number) => {
  const total = Math.round(h * 60);
  return `${Math.floor(total / 60)} h ${total % 60} min`;
};

export default defineCalculator({
  slug: 'ev-charging-time',
  title: 'EV Charging Time and Cost Calculator',
  category: 'everyday',
  description: 'Work out how long one EV charging session takes and what it costs, from battery size, start and end charge, charger power and your electricity price.',
  keywords: ['ev charging time calculator', 'how long to charge an electric car', 'cost to charge ev', 'ev charging cost per session', 'level 2 charging time'],
  updated: '2026-11-24',
  inputs: [
    { id: 'size', label: 'Battery size', type: 'number', suffix: 'kWh', default: 75, min: 0, step: 1, info: 'Usable battery capacity in kWh, from your car’s specs.' },
    { id: 'start', label: 'Starting charge', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 1, info: 'Battery level when you plug in.' },
    { id: 'end', label: 'Target charge', type: 'number', suffix: '%', default: 80, min: 0, max: 100, step: 1, info: 'Battery level you want to stop at.' },
    { id: 'kw', label: 'Charger power', type: 'number', suffix: 'kW', default: 7.2, min: 0, step: 0.1, info: 'Power the charger delivers. A home Level 2 charger is often around 7 kW.' },
    { id: 'loss', label: 'Charging loss', type: 'number', suffix: '%', default: 10, min: 0, max: 50, step: 1, info: 'Assumption: share of wall energy lost as heat. 10% is a common rough figure; yours may differ, and cold weather can raise it.' },
    { id: 'rate', label: 'Electricity price', type: 'number', prefix: '$', suffix: 'per kWh', default: 0.16, min: 0, step: 0.01, info: 'What you pay per kWh where you charge.' },
    { id: 'mikwh', label: 'Efficiency (optional)', type: 'number', suffix: 'mi / kWh', default: 3.5, min: 0, step: 0.1, optional: true, info: 'Miles per kWh of battery energy. Leave blank to skip the miles added.' },
  ],
  outputs: [
    { id: 'hours', label: 'Charging time', format: 'number', suffix: 'hours', precision: 2, primary: true, info: 'Energy from the wall ÷ charger power.' },
    { id: 'cost', label: 'Cost of the session', format: 'currency', info: 'Energy from the wall × price per kWh.' },
    { id: 'battery', label: 'Energy into the battery', format: 'number', suffix: 'kWh', precision: 1, info: 'Battery size × (target − start) ÷ 100.' },
    { id: 'wall', label: 'Energy from the wall', format: 'number', suffix: 'kWh', precision: 1, info: 'Energy into the battery ÷ (1 − loss).' },
    { id: 'miles', label: 'Miles added', format: 'number', suffix: 'mi', precision: 0, info: 'Energy into the battery × miles per kWh.' },
  ],
  compute: (v) => {
    const size = num(v.size);
    const start = num(v.start);
    const end = num(v.end);
    const kw = num(v.kw);
    const loss = num(v.loss);
    const rate = num(v.rate);
    if (size === null || start === null || end === null || kw === null || loss === null || rate === null) return { hours: null };
    if (size < 0 || start < 0 || end < 0 || rate < 0) return { hours: null, error: 'Values cannot be negative.' };
    if (start > 100 || end > 100) return { hours: null, error: 'Charge levels cannot be above 100%.' };
    if (end <= start) return { hours: null, error: 'Target charge must be above the starting charge.' };
    if (kw <= 0) return { hours: null, error: 'Charger power must be above 0.' };
    if (loss < 0 || loss >= 100) return { hours: null, error: 'Charging loss must be between 0 and 99%.' };
    const battery = (size * (end - start)) / 100;
    const wall = battery / (1 - loss / 100);
    const hours = wall / kw;
    const cost = wall * rate;
    const mikwh = v.mikwh === undefined || v.mikwh === '' ? null : num(v.mikwh);
    const miles = mikwh !== null && mikwh > 0 ? battery * mikwh : null;
    const steps = [
      `Into the battery: ${size} kWh × (${end} − ${start}) ÷ 100 = ${battery.toFixed(1)} kWh`,
      `From the wall: ${battery.toFixed(1)} ÷ (1 − ${loss / 100}) = ${wall.toFixed(1)} kWh`,
      `Time: ${wall.toFixed(1)} kWh ÷ ${kw} kW = ${hours.toFixed(2)} h (${hm(hours)})`,
      `Cost: ${wall.toFixed(1)} kWh × ${usd(rate)} = ${usd(cost)}`,
    ];
    if (miles !== null) steps.push(`Miles added: ${battery.toFixed(1)} kWh × ${mikwh} = ${miles.toFixed(0)} mi`);
    return {
      hours, cost, battery, wall, miles,
      tone: 'ok',
      badge: `${hm(hours)} and ${usd(cost)}`,
      chart: {
        type: 'bar',
        title: 'Energy for this session (kWh)',
        categories: ['Into battery', 'From wall'],
        series: [{ name: 'kWh', values: [battery, wall] }],
        format: { format: 'number' },
      },
      steps,
      note: 'Assumes a constant charging power. DC fast charging slows as the battery fills and is not modelled, and cold weather changes losses. The loss figure is an assumption you can change.',
    };
  },
  content: {
    formula: [
      'Energy into battery = battery size × (target % − start %) ÷ 100',
      'Energy from the wall = energy into battery ÷ (1 − loss)',
      'Time = energy from the wall ÷ charger power; cost = energy from the wall × price',
    ],
    body: [
      'Charging an EV is a sum of three things: how much energy the battery needs, how much extra the wall has to supply to cover losses, and how fast the charger delivers it.',
      'Enter your battery size, where you start and where you stop, and the charger power. The result gives hours, cost and, if you enter efficiency, the miles you add.',
      'Most people stop near 80% on daily charging, which is why the example runs from 20% to 80%. The charging loss is an assumption, so change it if you know your own figure.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A 75 kWh battery charged from 20% to 80% takes 45 kWh. With 10% loss the wall supplies 50 kWh. At 7.2 kW that is 6.94 hours (6 h 57 min), and at $0.16 per kWh it costs $8.00. At 3.5 miles per kWh it adds 157.5 miles.' },
      { q: 'Does this work for DC fast charging?', a: 'Only roughly. Fast chargers slow down as the battery fills, so use an average power over the session rather than the peak.' },
      { q: 'Why is there a charging loss?', a: 'Some wall energy turns to heat in the charger and battery, so the wall supplies more than the battery stores. The 10% default is an assumption, not a measured value for your car.' },
      { q: 'How do I find my battery size?', a: 'Check your car’s specs or manual and use the usable capacity in kWh.' },
    ],
    sources: [
      { label: 'US Dept. of Energy: charging an electric vehicle', url: 'https://afdc.energy.gov/fuels/electricity-charging-home' },
    ],
  },
  related: ['ev-vs-gas-cost', 'gas-cost', 'electricity-cost'],
  examples: [
    // battery 75*60/100=45; wall 45/0.9=50; hours 50/7.2=6.9444; cost 50*0.16=8; miles 45*3.5=157.5
    { values: { size: 75, start: 20, end: 80, kw: 7.2, loss: 10, rate: 0.16, mikwh: 3.5 }, expect: { battery: 45, wall: 50, hours: 6.9444, cost: 8, miles: 157.5 }, tolerance: 0.001 },
    // 60 kWh, 0 to 100, 0% loss, 10 kW, $0.20: 60 kWh, 6 h, $12
    { values: { size: 60, start: 0, end: 100, kw: 10, loss: 0, rate: 0.2, mikwh: 4 }, expect: { battery: 60, wall: 60, hours: 6, cost: 12, miles: 240 }, tolerance: 1e-9 },
  ],
});
