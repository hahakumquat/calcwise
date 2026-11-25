import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd3 = (n: number) => '$' + n.toFixed(3);
const usd = (n: number) => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'dishwasher-vs-hand-wash',
  title: 'Dishwasher vs Hand Washing Cost',
  category: 'everyday',
  description: 'Compare the water and energy cost of a dishwasher load against washing the same dishes by hand, per load and per year. Enter your own usage figures.',
  keywords: ['dishwasher vs hand washing cost', 'does a dishwasher save money', 'dishwasher cost per load', 'hand washing dishes water cost', 'is it cheaper to wash dishes by hand'],
  updated: '2026-11-25',
  inputs: [
    { id: 'dwWater', label: 'Water per dishwasher load', type: 'number', suffix: 'gal', default: 4, min: 0, step: 0.5, info: 'Check the machine\'s manual or label.' },
    { id: 'dwKwh', label: 'Energy per dishwasher load', type: 'number', suffix: 'kWh', default: 0.9, min: 0, step: 0.1, info: 'Including water heating if the machine heats its own water.' },
    { id: 'handWater', label: 'Water per load of hand washing', type: 'number', suffix: 'gal', default: 15, min: 0, step: 0.5, info: 'Your estimate for the same amount of dishes. Time the tap and multiply by the flow rate.' },
    { id: 'handKwh', label: 'Hot water energy per hand-washed load', type: 'number', suffix: 'kWh', default: 1.5, min: 0, step: 0.1, info: 'Energy your water heater uses to heat that water.' },
    { id: 'waterPrice', label: 'Water price', type: 'number', prefix: '$', suffix: 'per gal', default: 0.005, min: 0, step: 0.001, info: 'On your bill, including sewer. $5 per 1,000 gallons is $0.005.' },
    { id: 'kwhPrice', label: 'Electricity price', type: 'number', prefix: '$', suffix: 'per kWh', default: 0.16, min: 0, step: 0.01, info: 'On your electric bill.' },
    { id: 'loads', label: 'Loads per week', type: 'number', default: 5, min: 0, step: 1, info: 'Dishwasher-sized loads of dishes.' },
  ],
  outputs: [
    { id: 'saved', label: 'Dishwasher saves per year', format: 'currency', primary: true, info: 'Hand-washing cost minus dishwasher cost over a year. Negative means hand washing is cheaper.' },
    { id: 'dwCost', label: 'Dishwasher cost per load', format: 'currency', info: 'Water × water price + kWh × electricity price.' },
    { id: 'handCost', label: 'Hand washing cost per load', format: 'currency', info: 'Same formula with the hand-washing figures.' },
  ],
  compute: (v) => {
    const dwWater = num(v.dwWater), dwKwh = num(v.dwKwh), handWater = num(v.handWater), handKwh = num(v.handKwh), wp = num(v.waterPrice), kp = num(v.kwhPrice), loads = num(v.loads);
    if ([dwWater, dwKwh, handWater, handKwh, wp, kp, loads].some((x) => x === null)) return { saved: null };
    if ([dwWater, dwKwh, handWater, handKwh, wp, kp, loads].some((x) => (x as number) < 0)) return { saved: null, error: 'Amounts cannot be negative.' };
    const dw = dwWater! * wp! + dwKwh! * kp!;
    const hand = handWater! * wp! + handKwh! * kp!;
    const perLoad = hand - dw;
    const yearLoads = loads! * 52;
    const saved = perLoad * yearLoads;
    return {
      saved, dwCost: dw, handCost: hand,
      tone: saved > 0 ? 'good' : saved < 0 ? 'warn' : 'good',
      badge: saved > 0 ? 'The dishwasher is cheaper to run' : saved < 0 ? 'Hand washing is cheaper with these numbers' : 'No difference',
      chart: {
        type: 'bar',
        title: 'Cost per year',
        categories: ['Dishwasher', 'Hand washing'],
        series: [{ name: 'Per year', values: [dw * yearLoads, hand * yearLoads] }],
        format: { format: 'currency' },
      },
      steps: [
        `Dishwasher per load = ${dwWater} × ${usd3(wp!)} + ${dwKwh} × ${usd3(kp!)} = ${usd3(dw)}`,
        `Hand washing per load = ${handWater} × ${usd3(wp!)} + ${handKwh} × ${usd3(kp!)} = ${usd3(hand)}`,
        `Difference per load = ${usd3(perLoad)}`,
        `Per year = ${usd3(perLoad)} × ${loads} loads × 52 = ${usd(saved)}`,
      ],
      note: 'Detergent, the machine\'s purchase price and your time are not counted. Every usage figure is your own estimate.',
    };
  },
  content: {
    formula: ['Cost per load = water × water price + energy × electricity price', 'Saving per load = hand-washing cost − dishwasher cost', 'Saving per year = saving per load × loads per week × 52'],
    body: [
      'Whether a dishwasher saves money depends on how much water and hot-water energy each method uses. A modern machine uses a few gallons per load; washing the same dishes by hand with the tap running can use several times that.',
      'Example: a dishwasher using 4 gal and 0.9 kWh against hand washing at 15 gal and 1.5 kWh, with water at $0.005 per gallon and power at $0.16 per kWh. That is $0.164 against $0.315 a load, saving $0.151 a load. At 5 loads a week (260 a year) that is $39.26 a year. Second example: 3 gal and 1.2 kWh against 8 gal and 1.0 kWh at $0.004 and $0.20 makes hand washing cheaper by $0.02 a load, $7.28 a year at 7 loads a week.',
      'Either side can win, which is why every figure is an input. Detergent and your time are not counted. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is a dishwasher cheaper than washing by hand?', a: 'Often, when hand washing uses a lot of running hot water. With 4 gal against 15 gal per load, the example saves about $39 a year at 5 loads a week.' },
      { q: 'Can hand washing be cheaper?', a: 'Yes. With a machine at 3 gal and 1.2 kWh and careful hand washing at 8 gal and 1.0 kWh, hand washing wins by about $0.02 a load.' },
      { q: 'Where do I find my usage figures?', a: 'The dishwasher\'s manual or label gives water and energy per cycle. For hand washing, time the tap and multiply by its flow rate, then estimate water heater energy.' },
      { q: 'What is not included?', a: 'Detergent, the purchase price of the dishwasher and your time. The result covers water and energy only.' },
    ],
    sources: [
      { label: 'ENERGY STAR: Dishwashers', url: 'https://www.energystar.gov/products/dishwashers' },
    ],
  },
  related: ['laundry-cost', 'shower-cost', 'electricity-cost'],
  examples: [
    // dw 4*.005+.9*.16=.02+.144=.164; hand .075+.24=.315; diff .151; *260 = 39.26
    { values: { dwWater: 4, dwKwh: 0.9, handWater: 15, handKwh: 1.5, waterPrice: 0.005, kwhPrice: 0.16, loads: 5 }, expect: { saved: 39.26, dwCost: 0.164, handCost: 0.315 }, tolerance: 0.001 },
    // dw .012+.24=.252; hand .032+.2=.232; diff -.02; *364 = -7.28
    { values: { dwWater: 3, dwKwh: 1.2, handWater: 8, handKwh: 1.0, waterPrice: 0.004, kwhPrice: 0.2, loads: 7 }, expect: { saved: -7.28, dwCost: 0.252, handCost: 0.232 }, tolerance: 0.001 },
  ],
});
