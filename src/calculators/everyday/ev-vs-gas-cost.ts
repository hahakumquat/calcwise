import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'ev-vs-gas-cost',
  title: 'EV vs Gas Cost Calculator',
  category: 'everyday',
  description: 'Compare what an electric car and a gas car cost per mile and per year, from your own electricity price, gas price and mileage.',
  keywords: ['ev vs gas', 'electric car cost per mile', 'ev charging cost', 'gas vs electric', 'cost to charge ev', 'ev savings'],
  inputs: [
    { id: 'kwh100', label: 'EV energy use', type: 'number', suffix: 'kWh / 100 mi', default: 30, min: 0, step: 0.5, info: 'Electricity the EV uses per 100 miles, from its window sticker or trip computer. Many EVs use 25–35 kWh per 100 miles.' },
    { id: 'rate', label: 'Electricity price', type: 'number', prefix: '$', suffix: 'per kWh', default: 0.17, min: 0, step: 0.01, info: 'What you pay per kWh where you charge. Home rates are on your bill; public fast chargers usually cost more.' },
    { id: 'mpg', label: 'Gas car fuel economy', type: 'number', suffix: 'mpg', default: 28, min: 0, step: 0.5, info: 'Miles per US gallon of the gas car you are comparing against.' },
    { id: 'gas', label: 'Gas price', type: 'number', prefix: '$', suffix: 'per gal', default: 3.5, min: 0, step: 0.01, info: 'What you pay at the pump per US gallon.' },
    { id: 'miles', label: 'Miles driven per year', type: 'number', suffix: 'miles', default: 12000, min: 0, step: 100, info: 'Your yearly mileage. Check the odometer between two dates if unsure.' },
  ],
  outputs: [
    { id: 'saving', label: 'Yearly fuel saving with an EV', format: 'currency', primary: true, info: 'Gas cost per year minus electricity cost per year. Negative means the gas car is cheaper to fuel.' },
    { id: 'evMile', label: 'EV cost per mile', format: 'currency', precision: 3, info: 'kWh per 100 miles ÷ 100 × price per kWh.' },
    { id: 'gasMile', label: 'Gas car cost per mile', format: 'currency', precision: 3, info: 'Gas price ÷ miles per gallon.' },
    { id: 'evYear', label: 'EV energy cost per year', format: 'currency', info: 'EV cost per mile × miles per year.' },
    { id: 'gasYear', label: 'Gas cost per year', format: 'currency', info: 'Gas cost per mile × miles per year.' },
    { id: 'pct', label: 'EV cost vs gas', format: 'percent', precision: 0, info: 'EV cost per mile as a share of gas cost per mile.' },
  ],
  compute: (v) => {
    const kwh = num(v.kwh100);
    const rate = num(v.rate);
    const mpg = num(v.mpg);
    const gas = num(v.gas);
    const miles = num(v.miles);
    if (kwh === null || rate === null || mpg === null || gas === null || miles === null || kwh < 0 || rate < 0 || mpg <= 0 || gas < 0 || miles < 0) return { saving: null };
    const evMile = (kwh / 100) * rate;
    const gasMile = gas / mpg;
    const evYear = evMile * miles;
    const gasYear = gasMile * miles;
    return {
      saving: gasYear - evYear,
      evMile,
      gasMile,
      evYear,
      gasYear,
      pct: gasMile > 0 ? evMile / gasMile : null,
      chart: {
        type: 'bar',
        title: 'Fuel cost per year',
        categories: ['Electric', 'Gas'],
        series: [{ name: 'Per year', values: [evYear, gasYear] }],
        format: { format: 'currency' },
        highlight: evYear <= gasYear ? 0 : 1,
      },
      steps: [
        `EV per mile = ${kwh} ÷ 100 × $${rate.toFixed(3)} = $${evMile.toFixed(3)}`,
        `Gas per mile = $${gas.toFixed(2)} ÷ ${mpg} mpg = $${gasMile.toFixed(3)}`,
        `Per year over ${miles.toLocaleString('en-US')} miles: $${evYear.toFixed(2)} vs $${gasYear.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: ['EV cost per mile = (kWh per 100 mi ÷ 100) × price per kWh', 'Gas cost per mile = price per gallon ÷ mpg', 'Yearly saving = (gas per mile − EV per mile) × miles per year'],
    body: [
      'Fuel is the easiest part of the EV-versus-gas question to put a number on. An EV’s cost per mile is its energy use times your electricity price; a gas car’s is the pump price divided by its miles per gallon.',
      'The result depends mostly on where you charge. Home charging at a typical residential rate is usually much cheaper per mile than gas, while public fast charging can cost several times more per kWh and shrink the gap or even reverse it. Enter the price you actually pay, or an average if you mix both.',
      'This compares fuel only. Purchase price, incentives, insurance, maintenance, depreciation, a home charger and charging losses are not included, so treat the saving as one input to the full decision, not the whole answer.',
    ],
    faq: [
      { q: 'How do I find my EV’s kWh per 100 miles?', a: 'Use the window sticker or the trip computer. If you only know miles per kWh, divide 100 by it: 3.3 miles per kWh is about 30 kWh per 100 miles.' },
      { q: 'Does this include charging losses?', a: 'Only if your kWh per 100 miles figure does. Figures measured at the wall or meter include losses; some rated figures may not.' },
      { q: 'Is public fast charging cheaper than gas?', a: 'Not always. At a high price per kWh the EV cost per mile can match or exceed an efficient gas car. Enter the public rate to test it.' },
      { q: 'What is included in the yearly saving?', a: 'Only the energy cost: gas spend minus electricity spend over the miles you enter. Insurance, maintenance, purchase price and incentives are excluded.' },
    ],
    sources: [
      { label: 'US Dept. of Energy: fuel economy and cost to drive (fueleconomy.gov)', url: 'https://www.fueleconomy.gov/' },
    ],
  },
  related: ['gas-cost', 'electricity-cost', 'commute-cost', 'fuel-economy-converter'],
  examples: [
    // 30/100 × 0.17 = 0.051; 3.5/28 = 0.125; ×12000 = 612 vs 1500; saving 888
    { values: { kwh100: 30, rate: 0.17, mpg: 28, gas: 3.5, miles: 12000 }, expect: { evMile: 0.051, gasMile: 0.125, evYear: 612, gasYear: 1500, saving: 888 }, tolerance: 1e-6 },
    // 25/100 × 0.40 = 0.10; 3/30 = 0.10; equal -> 0 saving, 100%
    { values: { kwh100: 25, rate: 0.4, mpg: 30, gas: 3, miles: 10000 }, expect: { saving: 0, pct: 1 }, tolerance: 1e-9 },
    // 30/100 × 0.50 = 0.15; 4/40 = 0.10; 10000 mi -> 1500 vs 1000, saving -500
    { values: { kwh100: 30, rate: 0.5, mpg: 40, gas: 4, miles: 10000 }, expect: { saving: -500 }, tolerance: 1e-9 },
  ],
});
