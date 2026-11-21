import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'fuel-tank-runtime',
  title: 'Propane & Heating Oil Tank Runtime Calculator',
  category: 'everyday',
  description: 'Estimate how many days a propane or heating oil tank will last from its size, gauge reading, fuel energy and how hard your furnace runs.',
  keywords: ['propane tank how long will it last', 'heating oil tank runtime', 'propane tank calculator', 'how long will my oil tank last', 'fuel tank days remaining', 'propane usage calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'size', label: 'Tank size', type: 'number', default: 500, min: 1, step: 10, suffix: 'gal', info: 'Nominal tank capacity in gallons. Propane tanks are normally filled to 80% at most, so use the usable size if you know it.' },
    { id: 'level', label: 'Gauge reading', type: 'number', default: 40, min: 0, max: 100, step: 1, suffix: '%', info: 'What the tank gauge shows. Gauges are approximate, so treat the answer as a guide.' },
    { id: 'btuGal', label: 'Energy per gallon', type: 'number', default: 91500, min: 1, step: 500, suffix: 'BTU', help: 'About 91,500 for propane, about 138,500 for heating oil.', info: 'Heat content of one gallon of fuel. Commonly quoted figures are about 91,500 BTU for propane and about 138,500 BTU for heating oil; check your supplier.' },
    { id: 'btuHr', label: 'Appliance output', type: 'number', default: 60000, min: 1, step: 1000, suffix: 'BTU/h', info: 'Input rating of the furnace or boiler, from its nameplate. Add other appliances on the same tank for a total.' },
    { id: 'hours', label: 'Hours running per day', type: 'number', default: 8, min: 0.1, max: 24, step: 0.5, suffix: 'h', info: 'Average hours the appliance runs in a day. This changes a lot with the weather, so use a cold-day figure for a safe estimate.' },
    { id: 'price', label: 'Price per gallon', type: 'number', prefix: '$', optional: true, min: 0, step: 0.05, info: 'Optional. Adds a cost per day.' },
  ],
  outputs: [
    { id: 'days', label: 'Days of fuel left', format: 'number', precision: 1, primary: true, info: 'Gallons left × energy per gallon ÷ (BTU per hour × hours per day).' },
    { id: 'gallons', label: 'Gallons left', format: 'number', precision: 1, suffix: 'gal', info: 'Tank size × gauge reading.' },
    { id: 'perDay', label: 'Gallons used per day', format: 'number', precision: 2, suffix: 'gal', info: 'BTU per hour × hours ÷ energy per gallon.' },
    { id: 'costDay', label: 'Cost per day', format: 'currency', info: 'Gallons per day × price per gallon. Needs a price.' },
    { id: 'orderIn', label: 'Days until the 20% mark', format: 'number', precision: 1, info: 'Days until the tank reaches 20%, a common point to book a delivery. Zero if it is already there.' },
  ],
  compute: (v) => {
    const size = num(v.size);
    const level = num(v.level);
    const btuGal = num(v.btuGal);
    const btuHr = num(v.btuHr);
    const hours = num(v.hours);
    const price = num(v.price) ?? 0;
    if (size === null || level === null || btuGal === null || btuHr === null || hours === null) return { days: null };
    if (size <= 0 || level < 0 || level > 100 || btuGal <= 0 || btuHr <= 0 || hours <= 0 || hours > 24 || price < 0) return { days: null };

    const gallons = (size * level) / 100;
    const perDay = (btuHr * hours) / btuGal;
    const days = gallons / perDay;
    const reserve = size * 0.2;
    const orderIn = Math.max(0, gallons - reserve) / perDay;
    const costDay = perDay * price;
    const lowFuel = level < 20 || days < 14;

    const levels = [100, 75, 50, 25, 10];
    return {
      days,
      gallons,
      perDay,
      costDay,
      orderIn,
      tone: lowFuel ? 'warn' : 'good',
      badge: lowFuel ? 'Order soon' : 'Comfortable',
      chart: {
        type: 'bar',
        title: 'Days of fuel at each gauge level',
        categories: levels.map((l) => `${l}%`),
        series: [{ name: 'Days', values: levels.map((l) => +(((size * l) / 100) / perDay).toFixed(1)) }],
        format: { format: 'number' },
      },
      steps: [
        `Gallons left = ${size} × ${level}% = ${+gallons.toFixed(2)} gal`,
        `Energy left = ${+gallons.toFixed(2)} × ${btuGal.toLocaleString('en-US')} = ${Math.round(gallons * btuGal).toLocaleString('en-US')} BTU`,
        `Use per day = ${btuHr.toLocaleString('en-US')} × ${hours} h = ${Math.round(btuHr * hours).toLocaleString('en-US')} BTU (${+perDay.toFixed(2)} gal)`,
        `Days left = ${Math.round(gallons * btuGal).toLocaleString('en-US')} ÷ ${Math.round(btuHr * hours).toLocaleString('en-US')} = ${+days.toFixed(1)}`,
        ...(price > 0 ? [`Cost per day = ${+perDay.toFixed(2)} gal × ${money(price, 2)} = ${money(costDay, 2)}`] : []),
      ],
      note: 'Gauges are approximate and usage swings with the weather. Book a delivery before the tank drops to about 20%, and use a cold-day run time for a safe estimate.',
    };
  },
  content: {
    formula: [
      'Gallons left = tank size × gauge reading',
      'Gallons per day = appliance BTU per hour × hours per day ÷ BTU per gallon',
      'Days left = gallons left ÷ gallons per day',
    ],
    body: [
      'A tank gauge tells you how full the tank is, not how long it will last. This calculator turns the gauge reading into days by comparing the fuel you have with the heat your furnace or boiler draws each day.',
      'Enter the tank size, the gauge reading, the energy in a gallon of your fuel and the appliance rating from its nameplate. Then estimate how many hours a day it runs. In deep cold that can be most of the day, so try a few values.',
      'Real usage also depends on the weather, the home and how well the appliance is tuned, so treat the answer as a planning guide. Book a delivery with a margin rather than waiting for empty.',
    ],
    sections: [],
    faq: [
      { q: 'How long will a 500 gallon tank at 40% last?', a: '40% of 500 gal is 200 gal. At 91,500 BTU per gallon that is 18,300,000 BTU. A 60,000 BTU/h furnace running 8 hours uses 480,000 BTU a day, so the fuel lasts about 38.1 days.' },
      { q: 'How many BTU are in a gallon of propane or heating oil?', a: 'Commonly quoted figures are about 91,500 BTU for propane and about 138,500 BTU for heating oil. The exact value varies a little, so use your supplier\'s number if you have it.' },
      { q: 'When should I order more fuel?', a: 'Many suppliers suggest ordering before the gauge reaches about 20%, since gauges are approximate and deliveries can be delayed in bad weather.' },
      { q: 'How do I find how many hours my furnace runs?', a: 'Estimate from past deliveries: gallons used ÷ days, then work back to hours. Or try 6, 10 and 14 hours here to see the range.' },
      { q: 'Does the tank size include the unusable space?', a: 'Propane tanks are normally filled to about 80%, so a 500 gallon tank holds about 400 gallons. Enter the usable size if you want a tighter estimate.' },
    ],
    sources: [
      { label: 'U.S. EIA: Units and calculators explained', url: 'https://www.eia.gov/energyexplained/units-and-calculators/' },
    ],
  },
  related: ['heating-cost', 'firewood-cord', 'thermostat-setback', 'energy-converter'],
  examples: [
    {
      // 500 × 40% = 200 gal; 60,000 × 8 = 480,000 BTU/day; 480,000 / 91,500 = 5.2459 gal/day; 200 / 5.2459 = 38.125 days.
      // Days to 20% (100 gal reserve): (200 - 100) / 5.2459 = 19.0625. Cost at $3: 5.2459 × 3 = 15.7377.
      values: { size: 500, level: 40, btuGal: 91500, btuHr: 60000, hours: 8, price: 3 },
      expect: { days: 38.125, gallons: 200, perDay: 5.2459, costDay: 15.7377, orderIn: 19.0625 },
      tolerance: 0.001,
    },
    {
      // 250 × 80% = 200 gal; 100,000 × 10 = 1,000,000 BTU/day; 1,000,000 / 138,500 = 7.2202 gal/day; 200 / 7.2202 = 27.7 days.
      // 20% reserve = 50 gal: (200 - 50) / 7.2202 = 20.775.
      values: { size: 250, level: 80, btuGal: 138500, btuHr: 100000, hours: 10, price: 0 },
      expect: { days: 27.7, gallons: 200, perDay: 7.2202, orderIn: 20.775 },
      tolerance: 0.001,
    },
  ],
});
