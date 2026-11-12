import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'electricity-cost',
  title: 'Electricity Cost Calculator',
  category: 'everyday',
  description: 'Find how much an appliance costs to run per day, month and year from its wattage, hours of use and your electricity rate.',
  keywords: ['power cost', 'kWh cost', 'appliance energy cost', 'electric bill', 'wattage cost', 'energy usage'],
  inputs: [
    { id: 'power', label: 'Power draw', type: 'number', unit: 'power', units: ['w', 'kw'], defaultUnit: 'w', default: 1000, min: 0, help: 'Check the label or manual; use the average draw for appliances that cycle on and off.', info: 'How much power the device uses while running, from its label. An LED bulb is about 10 W, a TV 100 W, a space heater 1,500 W.' },
    { id: 'hours', label: 'Use per day', type: 'number', suffix: 'h/day', default: 3, min: 0, max: 24, info: 'Average hours the device runs each day. Use 24 for always-on equipment.' },
    { id: 'rate', label: 'Electricity rate', type: 'number', prefix: '$', suffix: '/kWh', default: 0.17, min: 0, step: 0.01, info: 'What you pay per kilowatt-hour. Divide your bill total by the kWh used to get an all-in rate; the US average is around 16–18¢.' },
    { id: 'qty', label: 'Number of devices', type: 'number', default: 1, min: 1, step: 1, optional: true, info: 'How many identical devices run on the same schedule.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Cost per month', format: 'currency', primary: true, info: 'Average monthly cost, using 365 ÷ 12 ≈ 30.4 days per month.' },
    { id: 'daily', label: 'Cost per day', format: 'currency', precision: 3, info: 'Energy used per day × your electricity rate.' },
    { id: 'yearly', label: 'Cost per year', format: 'currency', info: 'Daily cost × 365 days.' },
    { id: 'kwhDay', label: 'Energy per day', precision: 3, suffix: 'kWh', info: 'Kilowatt-hours used per day: kilowatts × hours × devices.' },
    { id: 'kwhYear', label: 'Energy per year', precision: 1, suffix: 'kWh', info: 'Kilowatt-hours used in a year — comparable with the yearly figure on EnergyGuide labels.' },
  ],
  compute: (v) => {
    const w = num(v.power);
    const h = num(v.hours);
    const rate = num(v.rate);
    const qty = num(v.qty) ?? 1;
    if (w === null || h === null || rate === null || w < 0 || h < 0 || h > 24 || rate < 0 || qty < 0) return { monthly: null };
    const kwhDay = (w / 1000) * h * qty;
    const daily = kwhDay * rate;
    return {
      daily,
      monthly: (daily * 365) / 12,
      yearly: daily * 365,
      kwhDay,
      kwhYear: kwhDay * 365,
      chart: {
        type: 'bar',
        title: 'Running cost',
        categories: ['Per day', 'Per month', 'Per year'],
        series: [{ name: 'Cost', values: [daily, (daily * 365) / 12, daily * 365] }],
        format: { format: 'currency' },
        highlight: 1,
      },
      steps: [`Energy = ${w / 1000} kW × ${h} h × ${qty} = ${kwhDay.toFixed(3)} kWh/day`, `Cost = ${kwhDay.toFixed(3)} kWh × $${rate} = $${daily.toFixed(3)}/day`, 'Month = 365 ÷ 12 ≈ 30.42 days'],
    };
  },
  content: {
    formula: ['kWh per day = watts ÷ 1000 × hours per day', 'Cost = kWh × price per kWh', 'Monthly = daily × 365 ÷ 12'],
    body: [
      'Your utility bills you for energy in kilowatt-hours (kWh): one kilowatt drawn for one hour. A 1,000 W space heater running for 3 hours uses 3 kWh; a 10 W LED bulb would need 100 hours to use one.',
      'The US average residential rate is roughly 16–18 cents per kWh, but it ranges from around 11 cents to over 40 cents depending on the state and time of use. Divide the total on your bill by the kWh used to get your own all-in rate.',
      'Appliances with thermostats or compressors — fridges, freezers, air conditioners, heaters on low — do not draw their rated power all the time. For those, use the yearly kWh from the EnergyGuide label, or measure with a plug-in power meter.',
    ],
    faq: [
      { q: 'How many watts is a kilowatt?', a: '1 kW = 1,000 W. Horsepower ratings on motors convert at 1 hp ≈ 746 W.' },
      { q: 'What does standby power cost?', a: 'A device idling at 5 W around the clock uses 43.8 kWh a year — about $7.50 at 17¢/kWh. Several of them add up.' },
    ],
  },
  related: ['energy-converter', 'gas-cost', 'unit-price'],
  examples: [
    { values: { power: 1000, hours: 3, rate: 0.15, qty: 1 }, expect: { kwhDay: 3, daily: 0.45, monthly: 13.6875, yearly: 164.25, kwhYear: 1095 } },
    { values: { power: 10, hours: 24, rate: 0.2, qty: 5 }, expect: { kwhDay: 1.2, daily: 0.24 } },
  ],
});
