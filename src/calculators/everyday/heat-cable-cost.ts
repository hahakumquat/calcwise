import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const DAYS = [30, 60, 90, 120];

export default defineCalculator({
  slug: 'heat-cable-cost',
  title: 'Heat Cable Running Cost Calculator',
  category: 'everyday',
  description: 'Estimate what a heat cable costs to run for pipes or gutters from watts per foot, length, thermostat on-time, hours plugged in, days and your electricity rate.',
  keywords: ['heat cable cost', 'heat tape cost to run', 'pipe heating cable electricity', 'gutter heat cable cost', 'heat trace cable kwh', 'heat tape running cost per month'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'wpf', label: 'Watts per foot', type: 'number', default: 5, min: 0, step: 0.5, suffix: 'W/ft', info: 'From the label or box. Pipe heat cable is often 3 to 8 W/ft; check yours.' },
    { id: 'length', label: 'Cable length', type: 'number', default: 30, min: 0, step: 1, suffix: 'ft', info: 'Feet of cable plugged in.' },
    { id: 'duty', label: 'Time the cable is actually on', type: 'number', default: 50, min: 0, max: 100, step: 5, suffix: '%', info: 'Cables with a thermostat cycle on and off. Use 100% if yours has none. Real on-time depends on the weather.' },
    { id: 'hours', label: 'Hours plugged in per day', type: 'number', default: 24, min: 0, max: 24, step: 1, suffix: 'h', info: 'How many hours a day the cable has power.' },
    { id: 'days', label: 'Days in use', type: 'number', default: 90, min: 0, step: 1, suffix: 'days', info: 'Days the cable is plugged in this winter.' },
    { id: 'rate', label: 'Electricity rate', type: 'number', default: 0.17, min: 0, step: 0.01, prefix: '$', suffix: '/kWh', info: 'What you pay per kilowatt-hour, from your bill.' },
  ],
  outputs: [
    { id: 'cost', label: 'Running cost', format: 'currency', primary: true, info: 'kWh used over the period × electricity rate.' },
    { id: 'watts', label: 'Full power', format: 'number', precision: 0, suffix: 'W', info: 'Watts per foot × length.' },
    { id: 'kwhDay', label: 'Energy per day', format: 'number', precision: 2, suffix: 'kWh', info: 'Watts × hours × on-time ÷ 1,000.' },
    { id: 'kwh', label: 'Energy over the period', format: 'number', precision: 1, suffix: 'kWh', info: 'Energy per day × days.' },
    { id: 'perDay', label: 'Cost per day', format: 'currency', info: 'Energy per day × rate.' },
  ],
  compute: (v) => {
    const wpf = num(v.wpf);
    const len = num(v.length);
    const duty = num(v.duty);
    const h = num(v.hours);
    const days = num(v.days);
    const rate = num(v.rate);
    if (wpf === null || wpf < 0 || len === null || len < 0) return { cost: null, error: 'Enter the watts per foot and the cable length.' };
    if (duty === null || duty < 0 || duty > 100) return { cost: null, error: 'Enter an on-time between 0 and 100%.' };
    if (h === null || h < 0 || h > 24) return { cost: null, error: 'Enter hours plugged in between 0 and 24.' };
    if (days === null || days < 0 || rate === null || rate < 0) return { cost: null, error: 'Enter the days in use and your electricity rate.' };
    const watts = wpf * len;
    const kwhDay = (watts * h * (duty / 100)) / 1000;
    const kwh = kwhDay * days;
    const cost = kwh * rate;
    const perDay = kwhDay * rate;
    return {
      cost,
      watts,
      kwhDay,
      kwh,
      perDay,
      tone: 'ok',
      badge: `$${fmt(cost)} for ${fmt(days, 0)} days`,
      note: `${fmt(len, 0)} ft at ${fmt(wpf, 1)} W/ft draws ${fmt(watts, 0)} W when on. A thermostat cycles it, so real on-time swings with the weather. Use the rating on your cable's label.`,
      chart: {
        type: 'bar' as const,
        title: 'Running cost by days in use',
        categories: DAYS.map((d) => `${d} days`),
        series: [{ name: 'Cost', values: DAYS.map((d) => perDay * d) }],
        format: { format: 'currency' },
      },
      steps: [
        `Power = ${fmt(wpf, 1)} W/ft × ${fmt(len, 0)} ft = ${fmt(watts, 0)} W`,
        `Energy per day = ${fmt(watts, 0)} W × ${fmt(h, 1)} h × ${fmt(duty, 0)}% ÷ 1,000 = ${fmt(kwhDay, 2)} kWh; over ${fmt(days, 0)} days = ${fmt(kwh, 1)} kWh`,
        `Cost = ${fmt(kwh, 1)} kWh × $${fmt(rate)} = $${fmt(cost)}`,
      ],
    };
  },
  content: {
    formula: ['Power in watts = watts per foot × length', 'kWh per day = watts × hours × on-time % ÷ 1,000', 'Cost = kWh per day × days × rate'],
    body: [
      'A heat cable costs what any electric heater costs: power times time times your rate. The label gives watts per foot, so multiply by the length to get full power. The only soft number is on-time, because a thermostat switches the cable off when it is warm.',
      'Example: 30 ft at 5 W/ft is 150 W. Plugged in 24 hours a day and on half the time, it uses 0.15 × 24 × 0.5 = 1.8 kWh a day. Over 90 days that is 162 kWh, which at $0.17 per kWh costs $27.54. A cable with no thermostat on at 100% would cost twice that.',
      'On-time depends on how cold it gets, so run the calculator at a couple of percentages to see a range. Some cables draw more when colder, so the label rating is a guide. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does a heat cable cost to run?', a: 'Watts × hours × on-time ÷ 1,000 gives kWh a day, then multiply by your rate. 150 W for 24 h at 50% is 1.8 kWh, or about $0.31 a day at $0.17 per kWh.' },
      { q: 'Does a thermostat save money?', a: 'Yes. It switches the cable off in mild weather, so the on-time can be well under 100%. Without one, use 100%.' },
      { q: 'What on-time percentage should I use?', a: 'It depends on your climate and the thermostat setting. Try 25%, 50% and 100% to see a range, then compare against your bill.' },
      { q: 'Where do I find watts per foot?', a: 'It is printed on the cable, the plug end or the box, often as W/ft. Use that figure.' },
      { q: 'Does this apply to gutter cables?', a: 'Yes. The arithmetic is the same: label watts per foot, length, on-time, hours and rate.' },
    ],
    sources: [
      { label: 'U.S. Department of Energy: Estimating appliance and home electronic energy use', url: 'https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use' },
    ],
  },
  related: ['electricity-cost', 'standby-power-cost', 'heating-cost'],
  examples: [
    // 5*30 = 150 W; 150*24*0.5/1000 = 1.8; *90 = 162; *0.17 = 27.54; per day 0.306
    { values: { wpf: 5, length: 30, duty: 50, hours: 24, days: 90, rate: 0.17 }, expect: { cost: 27.54, watts: 150, kwhDay: 1.8, kwh: 162, perDay: 0.306 }, tolerance: 1e-5 },
    // 3*50 = 150 W; 3.6 kWh/day; *30 = 108; *0.15 = 16.2
    { values: { wpf: 3, length: 50, duty: 100, hours: 24, days: 30, rate: 0.15 }, expect: { cost: 16.2, watts: 150, kwhDay: 3.6, kwh: 108, perDay: 0.54 }, tolerance: 1e-5 },
  ],
});
