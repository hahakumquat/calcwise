import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'winter-mpg-penalty',
  title: 'Winter MPG Penalty: Extra Fuel Cost in the Cold',
  category: 'everyday',
  description: 'See what cold weather adds to your fuel bill. Enter your mild-weather mpg and a winter drop to get the extra gallons and cost per month and season.',
  keywords: ['winter mpg penalty', 'cold weather fuel economy cost', 'extra gas cost in winter', 'winter gas mileage drop', 'winter fuel cost calculator'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'miles', label: 'Miles a month', type: 'number', default: 1000, min: 0, step: 50, info: 'How far you drive in a typical month.' },
    { id: 'mpg', label: 'MPG in mild weather', type: 'number', default: 30, min: 0, step: 1, info: 'Your usual fuel economy.' },
    { id: 'drop', label: 'Winter drop', type: 'number', suffix: '%', default: 15, min: 0, max: 90, step: 1, info: 'Your own estimate of the mpg loss in the cold. It varies by car and trip length.' },
    { id: 'price', label: 'Fuel price per gallon', type: 'number', prefix: '$', default: 3.4, min: 0, step: 0.05, info: 'What you pay per gallon.' },
    { id: 'months', label: 'Winter months', type: 'number', default: 4, min: 0, max: 12, step: 1, info: 'How many months the drop applies.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Extra cost per month', format: 'currency', precision: 2, primary: true, info: 'Extra gallons × fuel price.' },
    { id: 'season', label: 'Extra cost per season', format: 'currency', precision: 2, info: 'Monthly extra × winter months.' },
    { id: 'winterMpg', label: 'Winter mpg', format: 'number', precision: 1, info: 'Mild mpg × (1 − drop).' },
    { id: 'gallons', label: 'Extra gallons per month', format: 'number', precision: 2, info: 'Miles ÷ winter mpg − miles ÷ mild mpg.' },
  ],
  compute: (v) => {
    const miles = num(v.miles);
    const mpg = num(v.mpg);
    const drop = num(v.drop);
    const price = num(v.price);
    const months = num(v.months);
    if (miles === null || mpg === null || drop === null || price === null || months === null) return { monthly: null };
    if (miles < 0 || mpg <= 0 || drop < 0 || drop >= 100 || price < 0 || months < 0) return { monthly: null };
    const winterMpg = mpg * (1 - drop / 100);
    const mildGal = miles / mpg;
    const winterGal = miles / winterMpg;
    const gallons = winterGal - mildGal;
    const monthly = gallons * price;
    const season = monthly * months;
    return {
      monthly,
      season,
      winterMpg,
      gallons,
      tone: 'ok',
      badge: `Cold adds about ${money(season)} a season`,
      note: `A ${fmt(drop, 1)}% drop takes ${fmt(mpg, 1)} mpg down to ${fmt(winterMpg, 1)} mpg. Driving ${fmt(miles, 0)} miles then uses ${fmt(gallons)} more gallons, which is ${money(monthly)} a month and ${money(season)} over ${fmt(months, 0)} months. The drop is your own estimate, not a measured figure.`,
      chart: {
        type: 'bar' as const,
        title: 'Fuel cost per month',
        categories: ['Mild weather', 'Winter'],
        series: [{ name: 'Fuel cost', values: [mildGal * price, winterGal * price] }],
        format: CURRENCY,
        highlight: 1,
      },
      steps: [
        `Winter mpg = ${fmt(mpg, 1)} × (1 − ${fmt(drop, 1)}%) = ${fmt(winterMpg, 2)}`,
        `Extra gallons = ${fmt(miles, 0)} ÷ ${fmt(winterMpg, 2)} − ${fmt(miles, 0)} ÷ ${fmt(mpg, 1)} = ${fmt(gallons, 2)}`,
        `Extra cost = ${fmt(gallons, 2)} × ${money(price)} = ${money(monthly)} a month`,
        `Season = ${money(monthly)} × ${fmt(months, 0)} = ${money(season)}`,
      ],
    };
  },
  content: {
    formula: [
      'Winter mpg = mild mpg × (1 − drop %)',
      'Extra gallons = miles ÷ winter mpg − miles ÷ mild mpg',
      'Extra cost = extra gallons × fuel price',
      'Season = monthly extra × winter months',
    ],
    body: [
      'Cold air, short trips and winter fuel can all lower your mpg. This calculator turns a percentage drop into dollars, so you can see what the cold season adds to your fuel bill.',
      'Example: 1,000 miles a month at 30 mpg with a 15% winter drop and fuel at $3.40. Winter mpg is 25.5. Gallons go from 33.33 to 39.22, which is 5.88 more a month. That is $20.00 a month, or $80.00 over 4 winter months.',
      'The size of the drop depends on your car, your trips and the weather, so the percentage here is your own estimate and not a measured figure. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How big is the winter mpg drop?', a: 'It varies by car and trip length. Compare a few tanks in summer and winter to find your own number, then enter it.' },
      { q: 'Why does the cold lower mpg?', a: 'Short trips, engine warm-up, denser air and winter fuel blends can all play a part. This tool does not model the causes, only the percentage you enter.' },
      { q: 'Does this work for electric cars?', a: 'No, it is for fuel. For an EV, see the EV versus gas cost calculator.' },
      { q: 'How is the season cost worked out?', a: 'The extra cost for one month times the number of winter months you enter.' },
    ],
    sources: [],
  },
  related: ['gas-cost', 'cost-per-mile', 'winter-tire-cost', 'tire-pressure-cold'],
  examples: [
    // winter mpg 30*.85=25.5; gallons 1000/25.5-1000/30=39.2157-33.3333=5.8824; monthly *3.4=20; season 80
    { values: { miles: 1000, mpg: 30, drop: 15, price: 3.4, months: 4 }, expect: { winterMpg: 25.5, gallons: 1000 / 25.5 - 1000 / 30, monthly: 20, season: 80 } },
    // 20 mpg, 50%: winter 10; 500/10-500/20=25 gal; price 4 -> 100; 3 months -> 300
    { values: { miles: 500, mpg: 20, drop: 50, price: 4, months: 3 }, expect: { winterMpg: 10, gallons: 25, monthly: 100, season: 300 } },
  ],
});
