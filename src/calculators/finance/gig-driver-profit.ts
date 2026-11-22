import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'gig-driver-profit',
  title: 'Gig Driver Profit Per Hour Calculator',
  category: 'finance',
  description: 'Find what delivery and rideshare driving really pays per hour after fuel and per-mile costs such as wear, counting every hour including waiting time.',
  keywords: ['gig driver profit', 'rideshare profit per hour', 'delivery driver earnings calculator', 'doordash profit per hour', 'uber driver net pay', 'real hourly pay after gas'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'gross', label: 'Gross earnings', type: 'number', prefix: '$', default: 240, min: 0, step: 5, info: 'Fares or delivery pay from the app, before any of your own costs.' },
    { id: 'tips', label: 'Tips', type: 'number', prefix: '$', default: 40, min: 0, step: 5, optional: true, info: 'Tips you received. Leave blank if none.' },
    { id: 'hours', label: 'Hours worked', type: 'number', default: 8, min: 0, step: 0.25, suffix: 'hours', info: 'Every hour you were logged in, including waiting for orders and driving between jobs.' },
    { id: 'miles', label: 'Miles driven', type: 'number', default: 150, min: 0, step: 1, suffix: 'miles', info: 'All miles, including the ones without a passenger or order.' },
    { id: 'mpg', label: 'Fuel economy', type: 'number', default: 25, min: 1, step: 0.5, suffix: 'mpg', info: 'Miles per gallon for your vehicle.' },
    { id: 'fuel', label: 'Fuel price', type: 'number', prefix: '$', default: 3.5, min: 0, step: 0.05, suffix: 'per gallon', info: 'What you pay per gallon.' },
    { id: 'perMile', label: 'Other cost per mile', type: 'number', prefix: '$', default: 0.1, min: 0, step: 0.01, optional: true, info: 'Your own estimate of wear, tyres, maintenance and depreciation per mile. Leave blank or 0 to count fuel only.' },
  ],
  outputs: [
    { id: 'perHour', label: 'Net per hour', format: 'currency', precision: 2, primary: true, info: 'Net earnings ÷ hours worked.' },
    { id: 'net', label: 'Net earnings', format: 'currency', precision: 2, info: 'Gross + tips − fuel − other per-mile costs.' },
    { id: 'fuelCost', label: 'Fuel cost', format: 'currency', precision: 2, info: 'Miles ÷ mpg × fuel price.' },
    { id: 'otherCost', label: 'Other per-mile costs', format: 'currency', precision: 2, info: 'Miles × your other cost per mile.' },
    { id: 'grossHour', label: 'Gross per hour', format: 'currency', precision: 2, info: '(Gross + tips) ÷ hours, before costs.' },
  ],
  compute: (v) => {
    const gross = num(v.gross);
    const tips = num(v.tips) ?? 0;
    const hours = num(v.hours);
    const miles = num(v.miles);
    const mpg = num(v.mpg);
    const price = num(v.fuel);
    const other = num(v.perMile) ?? 0;
    if (gross === null || hours === null || miles === null || mpg === null || price === null) return { perHour: null };
    if (gross < 0 || tips < 0 || hours < 0 || miles < 0 || mpg <= 0 || price < 0 || other < 0) return { perHour: null };
    if (hours === 0) return { perHour: null, error: 'Enter the hours you worked, above zero.' };
    const fuelCost = (miles / mpg) * price;
    const otherCost = miles * other;
    const income = gross + tips;
    const net = income - fuelCost - otherCost;
    const perHour = net / hours;
    const grossHour = income / hours;
    return {
      perHour,
      net,
      fuelCost,
      otherCost,
      grossHour,
      tone: net < 0 ? 'bad' : 'good',
      badge: `${money(perHour)} an hour`,
      note: `You earned ${money(income)}, spent ${money(fuelCost + otherCost)} on fuel and per-mile costs, and kept ${money(net)} over ${fmt(hours)} hours: ${money(perHour)} an hour, against ${money(grossHour)} before costs.`,
      chart: net >= 0
        ? {
            type: 'donut',
            title: 'Where your earnings go',
            slices: [
              { label: 'Net earnings', value: net },
              { label: 'Fuel', value: fuelCost },
              { label: 'Other per-mile costs', value: otherCost },
            ],
            format: { format: 'currency', precision: 2 },
            centerLabel: 'Earned',
            centerValue: money(income),
          }
        : undefined,
      steps: [
        `Fuel = ${fmt(miles)} ÷ ${fmt(mpg)} × ${money(price)} = ${money(fuelCost)}`,
        `Other costs = ${fmt(miles)} × ${money(other)} = ${money(otherCost)}`,
        `Net = ${money(gross)} + ${money(tips)} − ${money(fuelCost)} − ${money(otherCost)} = ${money(net)}`,
        `Per hour = ${money(net)} ÷ ${fmt(hours)} = ${money(perHour)}`,
      ],
    };
  },
  content: {
    formula: [
      'Fuel cost = miles ÷ mpg × fuel price',
      'Other costs = miles × other cost per mile',
      'Net = gross + tips − fuel − other costs',
      'Net per hour = net ÷ hours worked',
    ],
    body: [
      'Gig apps show what you were paid, not what you kept. Every mile burns fuel and wears the car, and the hours spent waiting for the next job count too. This calculator turns a shift into a real hourly figure.',
      'Example: $240 in earnings plus $40 in tips over 8 hours and 150 miles, in a 25 mpg car with fuel at $3.50 a gallon. Fuel is 150 ÷ 25 × $3.50 = $21.00. At $0.10 a mile for wear, other costs are $15.00. Net is $280 − $21 − $15 = $244.00, or $30.50 an hour.',
      'The other cost per mile is your own estimate, so no rate is assumed: leave it at 0 to count fuel only, or enter a figure that reflects your car. Income tax, self-employment tax, insurance and phone costs are not included, so your take-home will be lower. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I work out gig driver profit per hour?', a: 'Add gross earnings and tips, subtract fuel and your per-mile costs, then divide by all hours worked. In the example, $244.00 net over 8 hours is $30.50 an hour.' },
      { q: 'How is fuel cost calculated?', a: 'Miles divided by mpg gives gallons, times the price per gallon. 150 miles at 25 mpg is 6 gallons, which at $3.50 is $21.00.' },
      { q: 'What should I enter for other cost per mile?', a: 'Your own estimate of wear, maintenance and depreciation per mile. The calculator does not assume a rate. At $0.10 a mile, 150 miles adds $15.00.' },
      { q: 'Does this include taxes?', a: 'No. It shows earnings after fuel and per-mile costs, before income and self-employment tax.' },
    ],
    sources: [],
  },
  related: ['gas-cost', 'business-mileage-deduction', 'salary-to-hourly', 'freelance-rate', 'side-hustle-goal'],
  examples: [
    // fuel 150/25*3.5 = 21; other 150*0.10 = 15; net 240+40-21-15 = 244; per hour 244/8 = 30.5; gross/h 280/8 = 35
    { values: { gross: 240, tips: 40, hours: 8, miles: 150, mpg: 25, fuel: 3.5, perMile: 0.1 }, expect: { fuelCost: 21, otherCost: 15, net: 244, perHour: 30.5, grossHour: 35 }, tolerance: 1e-6 },
    // fuel 100/20*4 = 20; other 0; net 150-20 = 130; per hour 130/5 = 26
    { values: { gross: 150, tips: 0, hours: 5, miles: 100, mpg: 20, fuel: 4, perMile: 0 }, expect: { fuelCost: 20, otherCost: 0, net: 130, perHour: 26 }, tolerance: 1e-6 },
  ],
});
