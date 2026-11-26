import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'dehumidifier-cost',
  title: 'Dehumidifier Running Cost Calculator',
  category: 'everyday',
  description: 'Estimate what a dehumidifier costs per day and per season from its watts, hours, duty cycle and electricity price, plus the cost per pint of water removed.',
  keywords: ['dehumidifier running cost', 'how much does a dehumidifier cost to run', 'dehumidifier electricity cost', 'dehumidifier cost per day', 'cost per pint dehumidifier'],
  updated: '2026-11-26',
  inputs: [
    { id: 'watts', label: 'Power', type: 'number', suffix: 'W', default: 500, min: 0, step: 10, info: 'Watts from the label on the dehumidifier.' },
    { id: 'hours', label: 'Hours per day', type: 'number', suffix: 'h', default: 12, min: 0, max: 24, step: 0.5, info: 'Hours the unit is switched on each day.' },
    { id: 'duty', label: 'Duty cycle', type: 'number', suffix: '%', default: 80, min: 0, max: 100, step: 5, info: 'Share of the on-time the compressor actually runs. A humidistat cycles it off once the room is dry. Use 100 if unsure.' },
    { id: 'price', label: 'Electricity price', type: 'number', prefix: '$', suffix: '/kWh', default: 0.16, min: 0, step: 0.01, info: 'Your rate from the electric bill, in dollars per kWh.' },
    { id: 'days', label: 'Days of use', type: 'number', default: 90, min: 1, max: 366, step: 1, info: 'How many days you will run it this season.' },
    { id: 'pints', label: 'Water removed per day', type: 'number', suffix: 'pints', default: 30, min: 0, step: 1, optional: true, info: 'Optional. Pints in the collection tank or drain per day. Leave blank to skip the cost per pint.' },
  ],
  outputs: [
    { id: 'season', label: 'Cost for the season', format: 'currency', primary: true, info: 'Cost per day × days.' },
    { id: 'perDay', label: 'Cost per day', format: 'currency', precision: 3, info: 'kWh per day × price per kWh.' },
    { id: 'kwhDay', label: 'Energy per day', format: 'number', precision: 2, suffix: 'kWh', info: 'Watts × hours × duty cycle ÷ 1,000.' },
    { id: 'perPint', label: 'Cost per pint removed', format: 'currency', precision: 4, info: 'Cost per day ÷ pints per day. Shown only if you enter pints.' },
  ],
  compute: (v) => {
    const w = num(v.watts), h = num(v.hours), d = num(v.duty), price = num(v.price), days = num(v.days), pints = num(v.pints);
    if ([w, h, d, price, days].some((x) => x === null)) return { season: null };
    if ((w as number) < 0 || (price as number) < 0 || (days as number) < 1) return { season: null };
    if ((h as number) < 0 || (h as number) > 24 || (d as number) < 0 || (d as number) > 100) return { season: null };
    const kwhDay = ((w as number) * (h as number) * ((d as number) / 100)) / 1000;
    const perDay = kwhDay * (price as number);
    const season = perDay * (days as number);
    const perPint = pints !== null && pints > 0 ? perDay / pints : null;
    return {
      season,
      perDay,
      kwhDay,
      perPint,
      tone: 'ok',
      badge: 'Estimate',
      note: `${money(perDay)} a day over ${fmt(days as number, 0)} days is ${money(season)}. This is an estimate: the label wattage is for lab conditions, and the real duty cycle and pints a day depend on how humid the room is.`,
      chart: {
        type: 'bar' as const,
        title: 'Cost over time',
        categories: ['1 day', '1 week', '30 days', `${fmt(days as number, 0)} days`],
        series: [{ name: 'Cost', values: [perDay, perDay * 7, perDay * 30, season] }],
        format: CURRENCY,
        highlight: 3,
      },
      steps: [
        `Energy a day: ${fmt(w as number, 0)} W × ${fmt(h as number)} h × ${fmt(d as number)}% ÷ 1,000 = ${fmt(kwhDay, 3)} kWh`,
        `Cost a day: ${fmt(kwhDay, 3)} kWh × ${money(price as number)} = ${money(perDay)}`,
        `Season: ${money(perDay)} × ${fmt(days as number, 0)} = ${money(season)}`,
        ...(perPint !== null ? [`Per pint: ${money(perDay)} ÷ ${fmt(pints as number, 0)} = ${perPint.toFixed(4).replace(/^/, '$')}`] : []),
      ],
    };
  },
  content: {
    formula: [
      'kWh per day = watts × hours per day × duty cycle ÷ 1,000',
      'Cost per day = kWh per day × price per kWh',
      'Season cost = cost per day × days',
      'Cost per pint = cost per day ÷ pints removed per day',
    ],
    body: [
      'A dehumidifier runs a compressor, so it uses far more power than a fan. Enter the watts from its label, the hours it is on, a duty cycle for the humidistat switching it off, and your price per kWh to see the cost per day and per season.',
      'The duty cycle is the share of the on-time the compressor draws full power. In a damp basement it may run almost all the time, while in a drier room it cycles off. Use 100% if you are not sure.',
      'Pints removed per day depends on the humidity of the room, and the capacity on the label is measured in lab conditions, so treat the cost per pint as an estimate. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does a dehumidifier cost to run per day?', a: 'With the defaults, 500 W for 12 hours at an 80% duty cycle uses 4.8 kWh a day. At $0.16 per kWh that is $0.768 a day. This is an estimate, because the real duty cycle depends on the room.' },
      { q: 'What does a season cost?', a: 'At $0.768 a day for 90 days the season costs $69.12. A second case, 300 W for 10 hours at 100% and $0.20 per kWh, uses 3 kWh a day, costs $0.60 a day and $36.00 over 60 days.' },
      { q: 'What is the cost per pint?', a: 'Divide the daily cost by the pints removed. $0.768 ÷ 30 pints is $0.0256 a pint. Pints a day vary with humidity, so this is a rough guide.' },
      { q: 'Why is my real cost different?', a: 'The label wattage and pint rating are for lab conditions. Room humidity, temperature and how often the humidistat switches it off all change the result.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'humidifier-runtime', 'personal-heater-cost'],
  examples: [
    // kWh = 500*12*0.8/1000 = 4.8; day = 4.8*0.16 = 0.768; season = 0.768*90 = 69.12; per pint = 0.768/30 = 0.0256
    { values: { watts: 500, hours: 12, duty: 80, price: 0.16, days: 90, pints: 30 }, expect: { kwhDay: 4.8, perDay: 0.768, season: 69.12, perPint: 0.0256 }, tolerance: 1e-9 },
    // kWh = 300*10*1/1000 = 3; day = 3*0.20 = 0.60; season = 0.60*60 = 36.00
    { values: { watts: 300, hours: 10, duty: 100, price: 0.2, days: 60 }, expect: { kwhDay: 3, perDay: 0.6, season: 36 }, tolerance: 1e-9 },
  ],
});
