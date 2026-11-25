import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const HOURS = [4, 8, 12, 16, 24];

export default defineCalculator({
  slug: 'humidifier-runtime',
  title: 'Humidifier Runtime and Running Cost Calculator',
  category: 'everyday',
  description: 'Find how long a humidifier tank lasts, how often you refill it and what it costs to run, from tank size, output per hour, wattage and your electricity rate.',
  keywords: ['humidifier runtime', 'how long does a humidifier tank last', 'humidifier running cost', 'humidifier electricity cost', 'humidifier refills per day', 'humidifier water use'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'tank', label: 'Tank size', type: 'number', default: 4, min: 0.1, step: 0.5, suffix: 'L', info: 'Water tank capacity in litres, from the box or label. 1 US gallon is about 3.79 L.' },
    { id: 'output', label: 'Output', type: 'number', default: 300, min: 1, step: 10, suffix: 'mL/h', info: 'Water the unit puts into the air per hour, from the spec sheet. Many home units list 200 to 400 mL/h on the highest setting.' },
    { id: 'hours', label: 'Running per day', type: 'number', default: 12, min: 0, max: 24, step: 1, suffix: 'h/day', info: 'Average hours it runs each day.' },
    { id: 'watts', label: 'Power draw', type: 'number', default: 25, min: 0, step: 1, suffix: 'W', info: 'From the label. Ultrasonic units are often 20 to 40 W; warm-mist units can be several hundred.' },
    { id: 'rate', label: 'Electricity rate', type: 'number', default: 0.17, min: 0, step: 0.01, prefix: '$', suffix: '/kWh', info: 'What you pay per kilowatt-hour, from your bill.' },
  ],
  outputs: [
    { id: 'tankHours', label: 'One tank lasts', format: 'number', precision: 1, suffix: 'h', primary: true, info: 'Tank volume divided by output per hour.' },
    { id: 'refills', label: 'Refills per day', format: 'number', precision: 2, info: 'Running hours per day divided by hours per tank.' },
    { id: 'waterDay', label: 'Water per day', format: 'number', precision: 1, suffix: 'L', info: 'Output per hour × hours per day.' },
    { id: 'daily', label: 'Electricity per day', format: 'currency', precision: 3, info: 'Watts ÷ 1,000 × hours × rate.' },
    { id: 'monthly', label: 'Electricity per 30 days', format: 'currency', info: 'Daily electricity cost × 30.' },
  ],
  compute: (v) => {
    const tank = num(v.tank);
    const out = num(v.output);
    const h = num(v.hours);
    const w = num(v.watts);
    const rate = num(v.rate);
    if (tank === null || tank <= 0) return { tankHours: null, error: 'Enter the tank size in litres.' };
    if (out === null || out <= 0) return { tankHours: null, error: 'Enter the output in mL per hour.' };
    if (h === null || h < 0 || h > 24) return { tankHours: null, error: 'Enter running hours between 0 and 24.' };
    if (w === null || w < 0 || rate === null || rate < 0) return { tankHours: null, error: 'Enter your wattage and electricity rate.' };
    const tankHours = (tank * 1000) / out;
    const refills = h / tankHours;
    const waterDay = (out * h) / 1000;
    const kwh = (w / 1000) * h;
    const daily = kwh * rate;
    const monthly = daily * 30;
    return {
      tankHours,
      refills,
      waterDay,
      daily,
      monthly,
      tone: 'ok',
      badge: `${fmt(tankHours, 1)} h per tank`,
      note: `A ${fmt(tank, 1)} L tank at ${fmt(out, 0)} mL/h lasts ${fmt(tankHours, 1)} hours. Real output changes with room humidity and the setting, so treat this as a guide.`,
      chart: {
        type: 'bar' as const,
        title: 'Water used per day by hours running',
        categories: HOURS.map((x) => `${x} h`),
        series: [{ name: 'Litres', values: HOURS.map((x) => (out * x) / 1000) }],
        format: { suffix: 'L', precision: 1 },
      },
      steps: [
        `Hours per tank = ${fmt(tank, 1)} L × 1,000 ÷ ${fmt(out, 0)} mL/h = ${fmt(tankHours, 2)} h`,
        `Refills per day = ${fmt(h, 1)} h ÷ ${fmt(tankHours, 2)} h = ${fmt(refills, 2)}`,
        `Energy = ${fmt(w, 0)} W ÷ 1,000 × ${fmt(h, 1)} h = ${fmt(kwh, 3)} kWh; cost = ${fmt(kwh, 3)} × $${fmt(rate, 3)} = $${fmt(daily, 3)} per day`,
      ],
    };
  },
  content: {
    formula: ['Hours per tank = tank in mL ÷ output in mL per hour', 'Refills per day = hours running ÷ hours per tank', 'Daily cost = watts ÷ 1,000 × hours × rate'],
    body: [
      'A humidifier tank does not last a fixed time. It lasts as long as the tank volume divided by how fast the unit puts water into the air. Both numbers are on the box or the spec sheet, so you can work out refill frequency before you buy.',
      'Example: a 4 L tank at 300 mL/h lasts 4,000 ÷ 300 = 13.3 hours. Run it 12 hours a day and you refill 12 ÷ 13.33 = 0.9 times a day, using 3.6 L of water. At 25 W and $0.17 per kWh, 12 hours costs 0.025 × 12 × 0.17 = $0.051 a day, about $1.53 over 30 days.',
      'Output is usually quoted for the highest setting, so a lower setting stretches the tank. Warm-mist units draw far more power than ultrasonic ones, which is why wattage is an input. This does not include filters, cleaning supplies or the cost of the water itself. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How long does a humidifier tank last?', a: 'Tank volume in millilitres divided by output in mL per hour. A 4 L tank at 300 mL/h lasts 4,000 ÷ 300 = 13.3 hours.' },
      { q: 'How much does it cost to run a humidifier?', a: 'Watts ÷ 1,000 × hours × your rate. A 25 W unit running 12 hours at $0.17 per kWh costs about $0.051 a day, or $1.53 over 30 days.' },
      { q: 'How many times a day do I refill?', a: 'Hours running per day divided by hours per tank. 12 hours with a 13.3-hour tank is 0.9 refills a day.' },
      { q: 'Where do I find the output figure?', a: 'On the box, manual or product page, usually in mL/h or gal/day. One US gallon a day is about 158 mL/h.' },
      { q: 'Does this include the cost of the water?', a: 'No. It covers electricity only, since water is usually a tiny cost compared with the power or the filters.' },
    ],
    sources: [
      { label: 'U.S. EPA: Mold and moisture', url: 'https://www.epa.gov/mold/mold-and-moisture' },
    ],
  },
  related: ['electricity-cost', 'standby-power-cost', 'heating-cost'],
  examples: [
    // 4000/300 = 13.3333 h; 12/13.3333 = 0.9; 0.3*12 = 3.6 L; 0.025*12 = 0.3 kWh *0.17 = 0.051; *30 = 1.53
    { values: { tank: 4, output: 300, hours: 12, watts: 25, rate: 0.17 }, expect: { tankHours: 13.333333, refills: 0.9, waterDay: 3.6, daily: 0.051, monthly: 1.53 }, tolerance: 1e-5 },
    // 2000/250 = 8 h; 8/8 = 1; 2 L; 0.35*8 = 2.8 kWh *0.20 = 0.56; *30 = 16.8
    { values: { tank: 2, output: 250, hours: 8, watts: 350, rate: 0.2 }, expect: { tankHours: 8, refills: 1, waterDay: 2, daily: 0.56, monthly: 16.8 }, tolerance: 1e-5 },
  ],
});
