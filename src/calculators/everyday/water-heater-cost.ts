import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'water-heater-cost',
  title: 'Water Heater Running Cost Calculator',
  category: 'everyday',
  description: 'Estimate what your electric water heater costs per day and per year from hot water use, inlet and set temperature, efficiency and your electricity price.',
  keywords: ['water heater cost calculator', 'electric water heater running cost', 'hot water cost per year', 'cost to heat water', 'water heater kwh per day'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'gallons', label: 'Hot water used per day', type: 'number', suffix: 'gal', default: 40, min: 0, step: 1, info: 'Gallons of hot water drawn per day for the whole household.' },
    { id: 'inlet', label: 'Cold inlet water temperature', type: 'number', suffix: '°F', default: 55, step: 1, info: 'Colder in winter, so the same shower costs more.' },
    { id: 'setTemp', label: 'Heater set temperature', type: 'number', suffix: '°F', default: 120, step: 1, info: 'The thermostat setting on the tank.' },
    { id: 'efficiency', label: 'Efficiency', type: 'number', default: 0.92, min: 0.1, step: 0.01, info: 'As a fraction: 0.92 for a typical electric tank. Use your unit’s energy factor.' },
    { id: 'price', label: 'Electricity price', type: 'number', prefix: '$', suffix: '/kWh', default: 0.16, min: 0, step: 0.01, info: 'Your electricity rate from the bill, in dollars per kWh.' },
  ],
  outputs: [
    { id: 'yearly', label: 'Cost per year', format: 'currency', precision: 2, primary: true, info: 'Daily cost × 365.' },
    { id: 'daily', label: 'Cost per day', format: 'currency', precision: 2, info: 'Daily energy × your price per kWh.' },
    { id: 'kwhDay', label: 'Energy per day', format: 'number', suffix: 'kWh', precision: 2, info: 'Gallons × 8.34 lb × temperature rise ÷ 3,412 BTU per kWh ÷ efficiency.' },
  ],
  compute: (v) => {
    const gal = num(v.gallons);
    const inlet = num(v.inlet);
    const set = num(v.setTemp);
    const eff = num(v.efficiency);
    const price = num(v.price);
    if (gal === null || inlet === null || set === null || eff === null || price === null) return { yearly: null };
    if (gal < 0 || eff <= 0 || eff > 1 || price < 0 || set <= inlet) return { yearly: null };
    const kwhDay = (gal * 8.34 * (set - inlet)) / 3412 / eff;
    const daily = kwhDay * price;
    const yearly = daily * 365;
    return {
      yearly,
      daily,
      kwhDay,
      tone: 'ok',
      badge: `${money(yearly)} a year`,
      note: `Heating ${fmt(gal, 0)} gallons from ${fmt(inlet, 0)}°F to ${fmt(set, 0)}°F takes ${fmt(kwhDay)} kWh a day, or ${money(daily)}. Each degree colder the inlet water gets adds about ${money(daily / (set - inlet))} a day.`,
      chart: {
        type: 'bar' as const,
        title: 'Running cost by period',
        categories: ['Per month', 'Per quarter'],
        series: [{ name: 'Cost', values: [yearly / 12, yearly / 4] }],
        format: CURRENCY,
        highlight: 0,
      },
      steps: [
        `kWh per day = ${fmt(gal, 0)} × 8.34 × (${fmt(set, 0)} − ${fmt(inlet, 0)}) ÷ 3,412 ÷ ${fmt(eff)} = ${fmt(kwhDay)}`,
        `Cost per day = ${fmt(kwhDay)} × ${money(price)} = ${money(daily)}`,
        `Cost per year = ${money(daily)} × 365 = ${money(yearly)}`,
      ],
    };
  },
  content: {
    formula: [
      'kWh per day = gallons × 8.34 lb/gal × (set °F − inlet °F) ÷ 3,412 BTU/kWh ÷ efficiency',
      'Cost per year = kWh per day × price per kWh × 365',
    ],
    body: [
      'Water weighs about 8.34 pounds a gallon, and it takes 1 BTU to raise a pound by 1°F. One kWh is 3,412 BTU. That gives the energy needed to heat your daily hot water, divided by the heater’s efficiency.',
      'Example: 40 gallons a day, heated from 55°F to 120°F, at 0.92 efficiency and $0.16 per kWh. That is 6.91 kWh a day, $1.11 a day and $403.42 a year.',
      'This is for an electric tank. Standby loss counts only through the efficiency figure, and gas heaters and heat pumps are not covered because efficiency is capped at 1. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Why does winter cost more?', a: 'Cold inlet water means a bigger temperature rise. Dropping inlet from 55°F to 45°F in the example adds about 15% to the energy per gallon.' },
      { q: 'How much does lowering the set temperature save?', a: 'With 55°F inlet water, 120°F needs a 65°F rise and 130°F needs 75°F, so dropping from 130°F to 120°F cuts energy per gallon by about 13%.' },
      { q: 'Does this work for gas?', a: 'Not directly. Gas is priced per therm, not kWh, and this tool caps efficiency at 1.' },
      { q: 'How do I find my daily hot water use?', a: 'Households commonly use somewhere around 40 to 60 gallons a day, but it varies a lot, so use your own estimate.' },
    ],
    sources: [],
  },
  related: ['shower-cost', 'electricity-cost'],
  examples: [
    { values: { gallons: 40, inlet: 55, setTemp: 120, efficiency: 0.92, price: 0.16 }, expect: { kwhDay: 6.907844436515623, daily: 1.1052551098424996, yearly: 403.4181150925124 } },
    { values: { gallons: 60, inlet: 50, setTemp: 125, efficiency: 1, price: 0.2 }, expect: { kwhDay: 10.999413833528722, yearly: 802.9572098475967 } },
  ],
});
