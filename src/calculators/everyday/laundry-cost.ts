import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'laundry-cost',
  title: 'Laundry Cost Calculator',
  category: 'everyday',
  description: 'Find what each load of laundry costs in electricity, water and detergent, and what your laundry adds up to per year. Enter your own estimates and prices.',
  keywords: ['laundry cost calculator', 'cost per load of laundry', 'how much does a load of laundry cost', 'dryer cost per load', 'washing machine cost per year', 'cost of doing laundry'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'perWeek', label: 'Loads per week', type: 'number', default: 4, min: 0, step: 1, info: 'Washer loads in the household, counted together.' },
    { id: 'washKwh', label: 'Washer energy per load', type: 'number', default: 0.5, min: 0, step: 0.05, suffix: 'kWh', info: 'Your estimate. Check the machine label or a plug-in power meter.' },
    { id: 'dryerKw', label: 'Dryer power', type: 'number', default: 5, min: 0, step: 0.1, suffix: 'kW', info: 'Your estimate. Often on the dryer data plate in watts; divide by 1,000.' },
    { id: 'dryerMin', label: 'Dryer time per load', type: 'number', default: 45, min: 0, step: 5, suffix: 'min', info: 'Minutes the dryer actually runs, on average.' },
    { id: 'energy', label: 'Electricity price', type: 'number', prefix: '$', default: 0.16, min: 0, step: 0.01, suffix: 'per kWh', info: 'On your electric bill.' },
    { id: 'gal', label: 'Water per load', type: 'number', default: 20, min: 0, step: 1, suffix: 'gal', info: 'Your estimate of water used by the washer per load.' },
    { id: 'water', label: 'Water and sewer price', type: 'number', prefix: '$', default: 6, min: 0, step: 0.1, suffix: 'per 1,000 gal', info: 'On your water bill. Combined water and sewer if billed.' },
    { id: 'soap', label: 'Detergent cost per load', type: 'number', prefix: '$', default: 0.25, min: 0, step: 0.05, info: 'Detergent price divided by the loads in the container.' },
  ],
  outputs: [
    { id: 'perLoad', label: 'Cost per load', format: 'currency', precision: 2, primary: true, info: 'Electricity, water and detergent for one load.' },
    { id: 'perYear', label: 'Cost per year', format: 'currency', precision: 2, info: 'Cost per load × loads per week × 52.' },
    { id: 'dryerCost', label: 'Dryer share per load', format: 'currency', precision: 2, info: 'Dryer kW × hours × electricity price.' },
    { id: 'kwh', label: 'Energy per load', format: 'number', precision: 2, suffix: 'kWh', info: 'Washer kWh plus dryer kW × minutes ÷ 60.' },
  ],
  compute: (v) => {
    const perWeek = num(v.perWeek), washKwh = num(v.washKwh), dryerKw = num(v.dryerKw), dryerMin = num(v.dryerMin);
    const energy = num(v.energy), gal = num(v.gal), water = num(v.water), soap = num(v.soap);
    const all = [perWeek, washKwh, dryerKw, dryerMin, energy, gal, water, soap];
    if (all.some((x) => x === null)) return { perLoad: null };
    if (all.some((x) => x! < 0)) return { perLoad: null };
    const dryerKwh = dryerKw! * (dryerMin! / 60);
    const kwh = washKwh! + dryerKwh;
    const washCost = washKwh! * energy!;
    const dryerCost = dryerKwh * energy!;
    const waterCost = (gal! / 1000) * water!;
    const perLoad = washCost + dryerCost + waterCost + soap!;
    const loads = perWeek! * 52;
    const perYear = perLoad * loads;
    return {
      perLoad,
      perYear,
      dryerCost,
      kwh,
      tone: 'ok',
      badge: `${money(perYear)} a year`,
      note: `Each load uses ${fmt(kwh)} kWh by your estimates. That is ${money(dryerCost)} for the dryer, ${money(washCost)} for the washer, ${money(waterCost)} for water and ${money(soap!)} for detergent: ${money(perLoad)} a load and ${money(perYear)} over ${fmt(loads, 0)} loads a year.`,
      chart: {
        type: 'bar',
        title: 'Where each load’s cost goes',
        categories: ['Dryer', 'Washer', 'Water', 'Detergent'],
        series: [{ name: 'Per load', values: [dryerCost, washCost, waterCost, soap!] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Energy = ${fmt(washKwh!)} + ${fmt(dryerKw!)} × ${fmt(dryerMin!, 0)} ÷ 60 = ${fmt(kwh)} kWh`,
        `Per load = ${fmt(kwh)} × ${money(energy!)} + ${fmt(gal!, 0)} ÷ 1,000 × ${money(water!)} + ${money(soap!)} = ${money(perLoad)}`,
        `Per year = ${money(perLoad)} × ${fmt(perWeek!, 0)} × 52 = ${money(perYear)}`,
      ],
    };
  },
  content: {
    formula: [
      'Energy per load (kWh) = washer kWh + dryer kW × dryer minutes ÷ 60',
      'Cost per load = energy × electricity price + water gallons ÷ 1,000 × water and sewer price + detergent cost',
      'Cost per year = cost per load × loads per week × 52',
    ],
    body: [
      'A load of laundry costs three things: electricity, water and detergent. Electricity covers the washer motor and any water heating the washer does, plus the dryer, which is usually the largest single part. The calculator adds them up from the numbers you enter.',
      'Every input is your own estimate, so the result is only as good as those numbers. Machine labels, a plug-in power meter and your utility bills are the best places to get them. Nothing here assumes anything about a particular brand or model.',
      'Example: 4 loads a week, 0.5 kWh for the washer, a 5 kW dryer running 45 minutes, $0.16 per kWh, 20 gallons at $6 per 1,000 gallons and $0.25 of detergent. Energy is 0.5 + 5 × 45 ÷ 60 = 4.25 kWh, or $0.68. Water adds $0.12 and detergent $0.25, so a load is $1.05. Over 208 loads a year that is $218.40, with $0.60 of each load going to the dryer.',
      'Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does a load of laundry cost?', a: 'With the default estimates, $1.05: $0.68 of electricity, $0.12 of water and $0.25 of detergent. Your own energy use, prices and detergent change this.' },
      { q: 'How much does laundry cost per year?', a: 'At 4 loads a week with the defaults, 208 loads cost $218.40 a year. Change the loads per week to match your household.' },
      { q: 'How much of the cost is the dryer?', a: 'With the defaults, the dryer is $0.60 of the $1.05 load, because a 5 kW dryer running 45 minutes uses 3.75 kWh at $0.16. Shorter dryer time lowers it directly.' },
      { q: 'Where do I find my numbers?', a: 'Use machine labels or a plug-in power meter for kWh, the dryer data plate for power, and your utility bills for prices. These are estimates, so treat the result as approximate.' },
    ],
    sources: [],
  },
  related: ['electricity-cost', 'shower-cost'],
  examples: [
    // energy 0.5 + 5*45/60 = 4.25 kWh; *0.16 = 0.68; water 20/1000*6 = 0.12; soap 0.25 -> 1.05; year 1.05*4*52 = 218.40; dryer 3.75*0.16 = 0.60
    { values: { perWeek: 4, washKwh: 0.5, dryerKw: 5, dryerMin: 45, energy: 0.16, gal: 20, water: 6, soap: 0.25 }, expect: { perLoad: 1.05, perYear: 218.4, dryerCost: 0.6, kwh: 4.25 }, tolerance: 0.01 },
    // energy 0.3 + 3*60/60 = 3.3 kWh; *0.2 = 0.66; water 15/1000*4 = 0.06; soap 0.4 -> 1.12; year 1.12*2*52 = 116.48; dryer 3*0.2 = 0.60
    { values: { perWeek: 2, washKwh: 0.3, dryerKw: 3, dryerMin: 60, energy: 0.2, gal: 15, water: 4, soap: 0.4 }, expect: { perLoad: 1.12, perYear: 116.48, dryerCost: 0.6, kwh: 3.3 }, tolerance: 0.01 },
  ],
});
