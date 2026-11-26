import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'hot-tub-cost',
  title: 'Hot Tub Running Cost Calculator',
  category: 'everyday',
  description: 'Estimate what a hot tub costs per month, per soak and per year from its daily kWh, your electricity price, chemicals and filters, and how often you soak.',
  keywords: ['hot tub running cost', 'how much does a hot tub cost to run per month', 'hot tub electricity cost', 'cost per soak', 'hot tub monthly cost'],
  updated: '2026-11-26',
  inputs: [
    { id: 'kwhDay', label: 'Energy used per day', type: 'number', suffix: 'kWh', default: 6, min: 0, step: 0.5, info: 'Your best estimate in kWh a day, from a meter reading or the spec sheet. Cold weather and a poor cover push it up, so this is an estimate.' },
    { id: 'price', label: 'Electricity price', type: 'number', prefix: '$', suffix: '/kWh', default: 0.16, min: 0, step: 0.01, info: 'Your rate from the electric bill, in dollars per kWh.' },
    { id: 'chem', label: 'Chemicals and filters per month', type: 'number', prefix: '$', default: 25, min: 0, step: 5, info: 'Sanitiser, balancers, test strips and filter replacements averaged over a month.' },
    { id: 'soaks', label: 'Soaks per month', type: 'number', default: 20, min: 1, step: 1, info: 'How many times you use the tub in a month.' },
    { id: 'months', label: 'Months', type: 'number', default: 12, min: 1, max: 120, step: 1, info: 'How many months to total up.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Cost per month', format: 'currency', primary: true, info: 'Electricity for 30 days plus chemicals and filters.' },
    { id: 'perSoak', label: 'Cost per soak', format: 'currency', info: 'Monthly cost ÷ soaks per month.' },
    { id: 'total', label: 'Total over the period', format: 'currency', info: 'Monthly cost × months.' },
    { id: 'power', label: 'Electricity per month', format: 'currency', info: 'kWh a day × price × 30.' },
    { id: 'kwhMonth', label: 'Energy per month', format: 'number', precision: 0, suffix: 'kWh', info: 'kWh a day × 30.' },
  ],
  compute: (v) => {
    const kwh = num(v.kwhDay), price = num(v.price), chem = num(v.chem), soaks = num(v.soaks), months = num(v.months);
    if ([kwh, price, chem, soaks, months].some((x) => x === null)) return { monthly: null };
    if ((kwh as number) < 0 || (price as number) < 0 || (chem as number) < 0 || (soaks as number) < 1 || (months as number) < 1) return { monthly: null };
    const kwhMonth = (kwh as number) * 30;
    const power = kwhMonth * (price as number);
    const monthly = power + (chem as number);
    const perSoak = monthly / (soaks as number);
    const total = monthly * (months as number);
    return {
      monthly,
      perSoak,
      total,
      power,
      kwhMonth,
      tone: 'ok',
      badge: 'Estimate',
      note: `About ${money(perSoak)} a soak and ${money(total)} over ${fmt(months as number, 0)} months. This is an estimate: cold weather, wind and a worn cover can raise kWh a day a lot, so check it against your meter.`,
      chart: {
        type: 'donut' as const,
        title: 'Where a month goes',
        slices: [
          { label: 'Electricity', value: power },
          { label: 'Chemicals and filters', value: chem as number },
        ],
        format: CURRENCY,
        centerLabel: 'per month',
        centerValue: money(monthly),
      },
      steps: [
        `Energy a month: ${fmt(kwh as number)} kWh × 30 = ${fmt(kwhMonth)} kWh`,
        `Electricity: ${fmt(kwhMonth)} kWh × ${money(price as number)} = ${money(power)}`,
        `Monthly: ${money(power)} + ${money(chem as number)} = ${money(monthly)}`,
        `Per soak: ${money(monthly)} ÷ ${fmt(soaks as number, 0)} = ${money(perSoak)}`,
        `Total: ${money(monthly)} × ${fmt(months as number, 0)} = ${money(total)}`,
      ],
    };
  },
  content: {
    formula: [
      'Electricity per month = kWh per day × price per kWh × 30',
      'Cost per month = electricity per month + chemicals and filters',
      'Cost per soak = cost per month ÷ soaks per month',
      'Total = cost per month × months',
    ],
    body: [
      'A hot tub never fully switches off: it keeps the water hot all day, so most of the running cost is the electricity to hold the temperature, not the soaks themselves. Enter your daily kWh, your price per kWh and what you spend on chemicals and filters to see a monthly cost and a cost per soak.',
      'The daily kWh is the number that matters most and the one that varies most. Read it from a meter or plug-in energy monitor if you can, or use the spec sheet figure as a starting point. Cold weather, wind, a poor cover and a high set temperature all raise it, so treat the result as an estimate.',
      'Purchase price, repairs, water and depreciation are not included. For other appliances, see the electricity cost calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much does a hot tub cost to run per month?', a: 'With the defaults of 6 kWh a day at $0.16 per kWh, electricity is $28.80 a month, and with $25 for chemicals and filters the total is $53.80 a month. This is an estimate, because your kWh a day depends on weather and cover.' },
      { q: 'What does one soak cost?', a: 'Divide the monthly cost by how often you soak. $53.80 over 20 soaks is $2.69 a soak. At 8 soaks a month the same tub costs more per soak, so using it more spreads the fixed cost.' },
      { q: 'What does a year cost?', a: 'At $53.80 a month for 12 months the total is $645.60. A second case, 4 kWh a day at $0.20 with $15 of chemicals and 8 soaks a month, gives $24.00 of power, $39.00 a month and $468.00 a year.' },
      { q: 'Why is my real bill different?', a: 'Cold weather, a worn cover, a high set temperature and long heat-up times all raise kWh a day. Measure it with a plug-in meter or compare two bills for a better number.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'heating-cost', 'water-heater-cost'],
  examples: [
    // power = 6*0.16*30 = 28.80; monthly = 28.80+25 = 53.80; per soak = 53.80/20 = 2.69; total = 53.80*12 = 645.60; kWh/month = 180
    { values: { kwhDay: 6, price: 0.16, chem: 25, soaks: 20, months: 12 }, expect: { power: 28.8, monthly: 53.8, perSoak: 2.69, total: 645.6, kwhMonth: 180 }, tolerance: 1e-9 },
    // power = 4*0.20*30 = 24.00; monthly = 39.00; per soak = 39/8 = 4.875; total = 39*12 = 468.00; kWh/month = 120
    { values: { kwhDay: 4, price: 0.2, chem: 15, soaks: 8, months: 12 }, expect: { power: 24, monthly: 39, perSoak: 4.875, total: 468, kwhMonth: 120 }, tolerance: 1e-9 },
  ],
});
