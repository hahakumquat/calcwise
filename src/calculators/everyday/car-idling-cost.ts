import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'car-idling-cost',
  title: 'Car Idling Cost Calculator',
  category: 'everyday',
  description: 'Work out how much fuel and money you burn idling: minutes per day, days a year, fuel burned per hour and the price of gas. Pure arithmetic.',
  keywords: ['car idling cost calculator', 'how much gas does idling use', 'idling fuel cost', 'warm up car cost', 'remote start fuel cost', 'cost of idling per year'],
  updated: '2026-11-24',
  inputs: [
    { id: 'minutes', label: 'Idle minutes per day', type: 'number', suffix: 'min', default: 10, min: 0, step: 1, info: 'Warming up, waiting in a pickup line, or sitting at the curb. Count a typical day you idle.' },
    { id: 'days', label: 'Days a year you idle', type: 'number', suffix: 'days', default: 120, min: 0, max: 366, step: 1, info: 'How many days a year this happens, for example the cold months.' },
    { id: 'burn', label: 'Fuel burned per hour idling', type: 'number', suffix: 'gal/h', default: 0.3, min: 0, step: 0.05, info: 'Your vehicle’s idle burn rate in US gallons per hour. 0.3 is an example; it varies with engine size and conditions, so use your own estimate.' },
    { id: 'price', label: 'Fuel price', type: 'number', prefix: '$', default: 3.5, min: 0, step: 0.01, info: 'Price per US gallon.' },
  ],
  outputs: [
    { id: 'cost', label: 'Idling cost per year', format: 'currency', primary: true, info: 'Gallons × price.' },
    { id: 'gallons', label: 'Fuel burned per year', format: 'number', precision: 2, suffix: ' gal', info: 'Hours idling × gallons per hour.' },
    { id: 'hours', label: 'Hours idling per year', format: 'number', precision: 1, suffix: ' h', info: 'Minutes per day × days ÷ 60.' },
  ],
  compute: (v) => {
    const minutes = num(v.minutes), days = num(v.days), burn = num(v.burn), price = num(v.price);
    if ([minutes, days, burn, price].some((x) => x === null)) return { cost: null };
    if ([minutes, days, burn, price].some((x) => (x as number) < 0)) return { cost: null, error: 'Values cannot be negative.' };
    const hours = ((minutes as number) * (days as number)) / 60;
    const gallons = hours * (burn as number);
    const cost = gallons * (price as number);
    return {
      cost, gallons, hours,
      tone: 'ok',
      badge: `${hours.toFixed(1)} hours idling a year`,
      chart: {
        type: 'bar',
        title: 'What idling costs',
        categories: ['Per idle day', 'Per year'],
        series: [{ name: 'Cost', values: [days === 0 ? 0 : cost / (days as number), cost] }],
        format: { format: 'currency' },
      },
      steps: [
        `Hours: ${minutes} min × ${days} days ÷ 60 = ${hours.toFixed(2)} h`,
        `Fuel: ${hours.toFixed(2)} h × ${burn} gal/h = ${gallons.toFixed(2)} gal`,
        `Cost: ${gallons.toFixed(2)} gal × ${usd(price as number)} = ${usd(cost)}`,
      ],
      note: 'Arithmetic on the numbers you enter. It gives no advice on warm-up time or engine wear.',
    };
  },
  content: {
    formula: [
      'Hours idling = minutes per day × days a year ÷ 60',
      'Fuel = hours × gallons burned per hour',
      'Cost = fuel × price per gallon',
    ],
    body: [
      'Idling burns fuel without moving you anywhere. A few minutes a day looks small, but it repeats on every cold morning and every pickup line. This calculator turns those minutes into hours, gallons and dollars for a year.',
      'You supply the burn rate. It depends on the engine and conditions, so the default of 0.3 gallons per hour is only an example. Use your own estimate if you have one.',
      'It is arithmetic only. It does not say how long a car should warm up or how idling affects an engine.',
    ],
    faq: [
      { q: 'What is the cost in the example?', a: 'Idling 10 minutes a day for 120 days is 20 hours. At 0.3 gallons per hour that is 6 gallons, and at $3.50 a gallon it costs $21.00.' },
      { q: 'Where do I find my idle burn rate?', a: 'It varies by vehicle, so it is an input. Use your own estimate rather than relying on the example value.' },
      { q: 'Does this tell me how long to warm up my car?', a: 'No. It only turns your idle time into fuel and cost.' },
      { q: 'Does it work in litres?', a: 'It uses US gallons and dollars. Enter your burn rate in gallons per hour and your price per gallon.' },
    ],
    sources: [],
  },
  related: ['gas-cost', 'cost-per-mile'],
  examples: [
    // hours 10*120/60 = 20; gallons 6; cost 21
    { values: { minutes: 10, days: 120, burn: 0.3, price: 3.5 }, expect: { hours: 20, gallons: 6, cost: 21 }, tolerance: 0.001 },
    // 30*365/60 = 182.5 h; *0.5 = 91.25 gal; *4 = 365
    { values: { minutes: 30, days: 365, burn: 0.5, price: 4 }, expect: { hours: 182.5, gallons: 91.25, cost: 365 }, tolerance: 0.001 },
    { values: { minutes: 0, days: 100, burn: 0.3, price: 3.5 }, expect: { cost: 0, hours: 0 }, tolerance: 0.001 },
  ],
});
