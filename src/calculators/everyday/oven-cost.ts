import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'oven-cost',
  title: 'Oven Cost Calculator',
  category: 'everyday',
  description: 'Find what it costs to run your oven for a bake or a whole baking day, electric or gas, with a duty cycle for the element or burner cycling on and off.',
  keywords: ['oven cost calculator', 'how much does it cost to run an oven', 'oven electricity cost per hour', 'gas oven cost per hour', 'cost to bake cookies', 'cost of running an oven for 4 hours'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'hours', label: 'Oven time per bake', type: 'number', default: 4, min: 0, step: 0.25, suffix: 'hours', info: 'Total time the oven is on, including preheat.' },
    { id: 'bakes', label: 'Bakes per year', type: 'number', default: 12, min: 0, step: 1, info: 'How many times a year you run it this long.' },
    { id: 'duty', label: 'Duty cycle', type: 'number', default: 50, min: 0, max: 100, step: 5, suffix: '%', info: 'Share of the time the element or burner is actually heating. An estimate; once up to temperature it cycles on and off.' },
    { id: 'kw', label: 'Electric oven power', type: 'number', default: 2.4, min: 0, step: 0.1, suffix: 'kW', info: 'Your estimate while heating. See the data plate (watts ÷ 1,000).' },
    { id: 'energy', label: 'Electricity price', type: 'number', prefix: '$', default: 0.16, min: 0, step: 0.01, suffix: 'per kWh', info: 'On your electric bill.' },
    { id: 'btu', label: 'Gas oven burner rating', type: 'number', default: 15000, min: 0, step: 500, suffix: 'BTU/h', info: 'Your estimate. Check the manual or data plate.' },
    { id: 'gas', label: 'Gas price', type: 'number', prefix: '$', default: 1.5, min: 0, step: 0.05, suffix: 'per therm', info: 'On your gas bill. 1 therm = 100,000 BTU.' },
  ],
  outputs: [
    { id: 'electric', label: 'Electric cost per bake', format: 'currency', precision: 2, primary: true, info: 'Hours × kW × duty cycle × electricity price.' },
    { id: 'gasCost', label: 'Gas cost per bake', format: 'currency', precision: 2, info: 'Hours × BTU/h × duty cycle ÷ 100,000 × price per therm.' },
    { id: 'electricYear', label: 'Electric cost per year', format: 'currency', precision: 2, info: 'Electric cost per bake × bakes per year.' },
    { id: 'gasYear', label: 'Gas cost per year', format: 'currency', precision: 2, info: 'Gas cost per bake × bakes per year.' },
  ],
  compute: (v) => {
    const hours = num(v.hours), bakes = num(v.bakes), duty = num(v.duty), kw = num(v.kw);
    const energy = num(v.energy), btu = num(v.btu), gas = num(v.gas);
    const all = [hours, bakes, duty, kw, energy, btu, gas];
    if (all.some((x) => x === null || x < 0)) return { electric: null };
    if (duty! > 100) return { electric: null };
    const d = duty! / 100;
    const kwh = hours! * kw! * d;
    const therms = (hours! * btu! * d) / 100000;
    const electric = kwh * energy!;
    const gasCost = therms * gas!;
    const electricYear = electric * bakes!;
    const gasYear = gasCost * bakes!;
    return {
      electric,
      gasCost,
      electricYear,
      gasYear,
      tone: 'ok',
      badge: `${money(electric)} a bake`,
      note: `A ${fmt(hours!)}-hour bake at ${fmt(duty!, 0)}% duty cycle uses ${fmt(kwh)} kWh if electric, which is ${money(electric)}, or ${fmt(therms, 3)} therms if gas, which is ${money(gasCost)}. Over ${fmt(bakes!, 0)} bakes a year that is ${money(electricYear)} electric or ${money(gasYear)} gas. The duty cycle is an estimate.`,
      chart: {
        type: 'bar',
        title: 'Cost per bake',
        categories: ['Electric', 'Gas'],
        series: [{ name: 'Per bake', values: [electric, gasCost] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Electric = ${fmt(hours!)} h × ${fmt(kw!)} kW × ${fmt(duty!, 0)}% = ${fmt(kwh)} kWh × ${money(energy!)} = ${money(electric)}`,
        `Gas = ${fmt(hours!)} h × ${fmt(btu!, 0)} BTU/h × ${fmt(duty!, 0)}% ÷ 100,000 = ${fmt(therms, 3)} therms × ${money(gas!)} = ${money(gasCost)}`,
        `Per year = ${money(electric)} or ${money(gasCost)} × ${fmt(bakes!, 0)} bakes = ${money(electricYear)} or ${money(gasYear)}`,
      ],
    };
  },
  content: {
    formula: [
      'Electric cost = hours × kW × duty cycle × price per kWh',
      'Gas cost = hours × BTU/h × duty cycle ÷ 100,000 × price per therm',
      'Cost per year = cost per bake × bakes per year',
    ],
    body: [
      'An oven does not heat flat out the whole time. After preheating, the element or burner switches on and off to hold the temperature, so the real cost depends on the share of time it is actually heating. That share is the duty cycle, and it is an estimate you can change.',
      'The calculator shows an electric and a gas figure side by side so you can use whichever matches your oven. All power, burner and price inputs are your own estimates; check the data plate or manual and your utility bills.',
      'Example: a 4-hour bake day at a 50% duty cycle. Electric at 2.4 kW and $0.16 per kWh is 4 × 2.4 × 0.5 = 4.8 kWh, or $0.77. Gas at 15,000 BTU/h is 30,000 BTU, or 0.3 therms, at $1.50 that is $0.45. Twelve such days a year come to $9.22 electric or $5.40 gas.',
      'Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does it cost to run an oven for 4 hours?', a: 'With the default estimates, $0.77 for an electric oven (4.8 kWh at $0.16) or $0.45 for a gas oven (0.3 therms at $1.50). Your power, prices and duty cycle change this.' },
      { q: 'What is a duty cycle?', a: 'The share of the time the element or burner is actually heating. Once the oven reaches temperature it cycles on and off, so 50% is a rough guess, not a measured value.' },
      { q: 'How much does an oven cost per year?', a: 'At 12 four-hour bakes a year with the defaults, $9.22 electric or $5.40 gas. Change the bakes per year for your own habits.' },
      { q: 'What is a therm?', a: 'A unit of gas energy equal to 100,000 BTU. Gas bills are often priced per therm; if yours is per cubic foot or CCF, use your bill’s conversion.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'laundry-cost', 'shower-cost', 'energy-upgrade-payback'],
  examples: [
    // kwh 4*2.4*.5=4.8 *0.16=0.768; therms 4*15000*.5/1e5=0.3 *1.5=0.45; year 12 -> 9.216, 5.40
    { values: { hours: 4, bakes: 12, duty: 50, kw: 2.4, energy: 0.16, btu: 15000, gas: 1.5 }, expect: { electric: 0.768, gasCost: 0.45, electricYear: 9.216, gasYear: 5.4 }, tolerance: 0.01 },
    // kwh 1*3*1=3 *0.2=0.60; therms 12000/1e5=0.12 *2=0.24; year 10 -> 6.00, 2.40
    { values: { hours: 1, bakes: 10, duty: 100, kw: 3, energy: 0.2, btu: 12000, gas: 2 }, expect: { electric: 0.6, gasCost: 0.24, electricYear: 6, gasYear: 2.4 }, tolerance: 0.01 },
  ],
});
