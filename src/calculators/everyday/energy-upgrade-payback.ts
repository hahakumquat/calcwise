import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'energy-upgrade-payback',
  title: 'Energy Upgrade Payback Calculator',
  category: 'everyday',
  description: 'Find how many kWh and dollars a bulb or appliance upgrade saves each year, and how many months until the savings pay back what you spent.',
  keywords: ['energy upgrade payback', 'led bulb payback calculator', 'appliance upgrade savings', 'how long to pay back led bulbs', 'energy savings calculator', 'watts saved to dollars'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'units', label: 'Number of units', type: 'number', default: 10, min: 1, step: 1, info: 'How many bulbs or devices you are swapping.' },
    { id: 'oldW', label: 'Old power draw', type: 'number', default: 60, min: 0, step: 1, suffix: 'watts', info: 'Watts of one old unit, from its label.' },
    { id: 'newW', label: 'New power draw', type: 'number', default: 9, min: 0, step: 1, suffix: 'watts', info: 'Watts of one new unit, from its label.' },
    { id: 'hours', label: 'Hours used per day', type: 'number', default: 3, min: 0, max: 24, step: 0.5, suffix: 'hours', info: 'Average daily running time.' },
    { id: 'price', label: 'Electricity price', type: 'number', prefix: '$', default: 0.16, min: 0, step: 0.01, suffix: 'per kWh', info: 'Check your bill for your own rate.' },
    { id: 'cost', label: 'Total upgrade cost', type: 'number', prefix: '$', default: 30, min: 0, step: 1, info: 'What all the new units cost, after any rebate.' },
  ],
  outputs: [
    { id: 'months', label: 'Payback time', format: 'number', precision: 1, suffix: 'months', primary: true, info: 'Upgrade cost ÷ yearly savings × 12.' },
    { id: 'saved', label: 'Saved per year', format: 'currency', precision: 2, info: 'kWh saved × price per kWh.' },
    { id: 'kwh', label: 'Energy saved per year', format: 'number', precision: 2, suffix: 'kWh', info: '(Old − new watts) ÷ 1,000 × units × hours × 365.' },
  ],
  compute: (v) => {
    const units = num(v.units);
    const oldW = num(v.oldW);
    const newW = num(v.newW);
    const hours = num(v.hours);
    const price = num(v.price);
    const cost = num(v.cost);
    if (units === null || oldW === null || newW === null || hours === null || price === null || cost === null) return { months: null };
    if (units <= 0 || oldW < 0 || newW < 0 || hours < 0 || price < 0 || cost < 0) return { months: null };
    const kwh = ((oldW - newW) / 1000) * units * hours * 365;
    const saved = kwh * price;
    if (saved <= 0) {
      return { months: null, kwh, saved, error: 'This upgrade saves no energy or money with these numbers, so it never pays back.' };
    }
    const months = (cost / saved) * 12;
    return {
      months,
      saved,
      kwh,
      tone: 'good',
      badge: `Pays back in ${fmt(months, 1)} months`,
      note: `Swapping ${fmt(units, 0)} units from ${fmt(oldW, 0)} W to ${fmt(newW, 0)} W saves ${fmt(kwh)} kWh, or ${money(saved)}, a year. A ${money(cost)} upgrade pays for itself in ${fmt(months, 1)} months.`,
      chart: {
        type: 'bar',
        title: 'Cumulative savings vs upgrade cost',
        categories: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        series: [{ name: 'Savings', values: [1, 2, 3, 4, 5].map((y) => saved * y) }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Energy saved = (${fmt(oldW, 0)} − ${fmt(newW, 0)}) ÷ 1,000 × ${fmt(units, 0)} × ${fmt(hours)} × 365 = ${fmt(kwh)} kWh`,
        `Saved = ${fmt(kwh)} × ${money(price)} = ${money(saved)} a year`,
        `Payback = ${money(cost)} ÷ ${money(saved)} × 12 = ${fmt(months, 1)} months`,
      ],
    };
  },
  content: {
    formula: [
      'kWh saved per year = (old watts − new watts) ÷ 1,000 × units × hours per day × 365',
      'Saved per year = kWh saved × price per kWh',
      'Payback months = upgrade cost ÷ saved per year × 12',
    ],
    body: [
      'Efficient bulbs and appliances use fewer watts for the same job, and the saving is easy to price: fewer watts, over the hours you use them, at your electricity rate. This calculator turns that into dollars a year and a payback time.',
      'Example: swap 10 bulbs from 60 W to 9 W, used 3 hours a day, at $0.16 per kWh, for a total of $30. Each saves 51 W, so 51 ÷ 1,000 × 10 × 3 × 365 = 558.45 kWh a year, or $89.35. The $30 pays back in about 4.0 months.',
      'Watts, hours and price are your own inputs. Real use varies, and this ignores bulb lifespan, heating or cooling side effects and rate changes. For a cost figure for any device, see the electricity cost calculator. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate how much an upgrade saves?', a: 'Subtract the new watts from the old, divide by 1,000, then multiply by units, hours per day and 365 for kWh a year. Multiply by your price per kWh for dollars.' },
      { q: 'How long do LED bulbs take to pay back?', a: 'It depends on your use and rate. In the example, 10 bulbs swapped from 60 W to 9 W for $30 pay back in about 4.0 months at 3 hours a day.' },
      { q: 'Where do I find my electricity price?', a: 'On your electricity bill, as a price per kWh. Use the total rate if you can, not only the supply rate.' },
      { q: 'What if the new unit uses more power?', a: 'Then there are no savings and no payback. The calculator tells you so.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'heating-cost', 'thermostat-setback', 'gas-cost', 'thermostat-setback'],
  examples: [
    // kWh 51/1000*10*3*365 = 558.45; saved 558.45*0.16 = 89.352; months 30/89.352*12 = 4.02900
    { values: { units: 10, oldW: 60, newW: 9, hours: 3, price: 0.16, cost: 30 }, expect: { kwh: 558.45, saved: 89.352, months: 4.029 }, tolerance: 1e-3 },
    // kWh 100/1000*1*10*365 = 365; saved 365*0.2 = 73; months 146/73*12 = 24
    { values: { units: 1, oldW: 150, newW: 50, hours: 10, price: 0.2, cost: 146 }, expect: { kwh: 365, saved: 73, months: 24 }, tolerance: 1e-6 },
  ],
});
