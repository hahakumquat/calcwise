import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'commute-cost',
  title: 'Commute Cost Calculator',
  category: 'everyday',
  description: 'Work out what your commute costs per year in fuel, parking and tolls, and how many hours it takes. Compare a drive to the office with working from home.',
  keywords: ['commute cost calculator', 'cost of commuting', 'daily commute cost', 'how much does my commute cost', 'commute time per year', 'return to office cost'],
  updated: '2026-11-17',
  inputs: [
    { id: 'miles', label: 'One-way distance', type: 'number', suffix: 'miles', default: 20, min: 0, step: 1, info: 'Miles from home to work, one way. The calculator doubles it for the round trip.' },
    { id: 'days', label: 'Commute days per year', type: 'number', default: 250, min: 0, max: 366, step: 1, info: 'How many days a year you travel to work. Five days a week for 50 weeks is 250; three days a week is about 150.' },
    { id: 'mpg', label: 'Fuel economy', type: 'number', suffix: 'mpg', default: 25, min: 1, step: 1, info: 'Miles per US gallon in your real driving. Your trip computer is a good source.' },
    { id: 'price', label: 'Fuel price', type: 'number', prefix: '$', suffix: 'per gal', default: 3.2, min: 0, step: 0.01, info: 'Price of a US gallon of fuel.' },
    { id: 'daily', label: 'Parking and tolls per day', type: 'number', prefix: '$', optional: true, min: 0, step: 0.5, info: 'Parking, tolls or transit fares you pay on each commute day. Leave blank for none.' },
    { id: 'minutes', label: 'One-way travel time', type: 'number', suffix: 'min', default: 30, min: 0, step: 5, info: 'Minutes door to door, one way.' },
    { id: 'wear', label: 'Wear and tear per mile', type: 'number', prefix: '$', optional: true, min: 0, step: 0.01, info: 'Optional. Tyres, servicing and depreciation per mile, if you want to count them. Leave blank to count fuel only.' },
  ],
  outputs: [
    { id: 'total', label: 'Cost per year', format: 'currency', primary: true, info: 'Fuel + parking and tolls + wear and tear over all commute days.' },
    { id: 'perDay', label: 'Cost per commute day', format: 'currency', info: 'The yearly cost divided by the number of commute days.' },
    { id: 'fuel', label: 'Fuel per year', format: 'currency', info: 'Round-trip miles × days ÷ mpg × fuel price.' },
    { id: 'milesYear', label: 'Miles per year', format: 'number', precision: 0, info: 'Round-trip distance × commute days.' },
    { id: 'hours', label: 'Hours per year', format: 'number', precision: 0, suffix: 'h', info: 'Round-trip minutes × days ÷ 60.' },
    { id: 'workDays', label: 'Eight-hour days', format: 'number', precision: 1, info: 'The yearly commute hours expressed as eight-hour days.' },
  ],
  compute: (v) => {
    const one = num(v.miles);
    const days = num(v.days);
    const mpg = num(v.mpg);
    const price = num(v.price);
    const daily = num(v.daily) ?? 0;
    const mins = num(v.minutes) ?? 0;
    const wear = num(v.wear) ?? 0;
    if (one === null || days === null || mpg === null || price === null) return { total: null };
    if (one < 0 || days < 0 || price < 0 || daily < 0 || mins < 0 || wear < 0) return { total: null, error: 'Values cannot be negative.' };
    if (mpg <= 0) return { total: null, error: 'Fuel economy must be above 0.' };
    const miles = 2 * one * days;
    const fuel = (miles / mpg) * price;
    const extras = daily * days;
    const wearCost = miles * wear;
    const total = fuel + extras + wearCost;
    const hours = (2 * mins * days) / 60;
    const chart: ChartSpec = {
      type: 'donut',
      title: 'Where the money goes',
      format: { format: 'currency' },
      slices: [
        { label: 'Fuel', value: fuel },
        { label: 'Parking and tolls', value: extras },
        { label: 'Wear and tear', value: wearCost },
      ].filter((s) => s.value > 0),
      centerValue: money(total),
      centerLabel: 'per year',
    };
    return {
      total,
      perDay: days > 0 ? total / days : null,
      fuel,
      milesYear: miles,
      hours,
      workDays: hours / 8,
      tone: 'ok',
      badge: `${Math.round(hours)} h a year commuting`,
      chart: total > 0 ? chart : undefined,
      note: 'Fuel only unless you add parking, tolls or wear. Commute time is unpaid for most people, so the hours are a cost too.',
      steps: [
        `Miles = 2 × ${one} × ${days} days = ${+miles.toFixed(1)} miles.`,
        `Fuel = ${+miles.toFixed(1)} ÷ ${mpg} mpg × ${money(price, 2)} = ${money(fuel)}.`,
        `Parking and tolls = ${money(daily, 2)} × ${days} = ${money(extras)}; wear = ${money(wearCost)}.`,
        `Time = 2 × ${mins} min × ${days} days ÷ 60 = ${+hours.toFixed(1)} hours.`,
      ],
    };
  },
  content: {
    formula: [
      'Miles per year = 2 × one-way miles × commute days',
      'Fuel = miles ÷ mpg × price per gallon',
      'Total = fuel + parking and tolls × days + wear per mile × miles',
      'Hours per year = 2 × one-way minutes × days ÷ 60',
    ],
    body: [
      'A commute feels cheap one day at a time and expensive over a year. Enter your one-way distance, how many days you travel, your fuel economy and the price of fuel to see the yearly bill and the hours it takes.',
      'Add parking and tolls if you pay them, and an optional wear-and-tear cost per mile if you want to count tyres, servicing and depreciation. Whatever per-mile figure you use, it is your own estimate; the calculator does not assume one.',
      'The time is often the bigger cost. Use the result to compare an office day with a work-from-home day, or to weigh a new job that is further away.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A 20-mile one-way commute for 250 days is 2 × 20 × 250 = 10,000 miles. At 25 mpg that burns 400 gallons, and at $3.20 a gallon the fuel costs $1,280 a year, or $5.12 per commute day.',
          'At 30 minutes each way, the commute takes 2 × 30 × 250 ÷ 60 = 250 hours a year, about 31 eight-hour days.',
        ],
      },
    ],
    faq: [
      { q: 'How much does a commute cost per year?', a: 'It depends on distance, days, fuel economy and price. A 20-mile one-way commute, 250 days, 25 mpg and $3.20 fuel costs $1,280 a year in fuel before parking, tolls or wear.' },
      { q: 'How many hours a year is a 30-minute commute?', a: 'Each way 30 minutes means 60 minutes a day. Over 250 days that is 250 hours, about 31 eight-hour days.' },
      { q: 'Does this include wear and tear?', a: 'Only if you enter a per-mile figure. It is blank by default, so the result is fuel plus any parking and tolls you add.' },
      { q: 'How do I compare working from home?', a: 'Lower the commute days to your office days, for example 150 for three days a week, and compare the yearly cost and hours with 250.' },
    ],
    sources: [{ label: 'US DOE fuel economy: fuel cost and mpg basics', url: 'https://www.fueleconomy.gov/' }],
  },
  related: ['gas-cost', 'salary-to-hourly', 'hours-worked'],
  examples: [
    // miles = 2*20*250 = 10000; fuel = 10000/25*3.2 = 1280; hours = 2*30*250/60 = 250; 250/8 = 31.25; per day 5.12
    { values: { miles: 20, days: 250, mpg: 25, price: 3.2, minutes: 30 }, expect: { total: 1280, fuel: 1280, milesYear: 10000, hours: 250, workDays: 31.25, perDay: 5.12 } },
    // + $10/day parking = 2500 extra -> 3780; wear $0.10/mi = 1000 -> 4780 with both
    { values: { miles: 20, days: 250, mpg: 25, price: 3.2, minutes: 30, daily: 10, wear: 0.1 }, expect: { total: 4780 } },
    // 150 days: miles 6000, fuel 6000/25*3.2 = 768
    { values: { miles: 20, days: 150, mpg: 25, price: 3.2, minutes: 30 }, expect: { fuel: 768, hours: 150 } },
  ],
});
