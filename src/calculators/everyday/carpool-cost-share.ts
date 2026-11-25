import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'carpool-cost-share',
  title: 'Carpool and Road Trip Cost Share Calculator',
  category: 'everyday',
  description: 'Split the cost of a carpool or road trip fairly. Enter miles, mpg, fuel price, tolls and wear per mile to see the total and what each person pays.',
  keywords: ['carpool cost calculator', 'road trip cost split', 'gas split calculator', 'how much to charge for a ride', 'carpool gas share', 'road trip cost per person'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'miles', label: 'Round-trip distance', type: 'number', default: 600, min: 1, step: 10, suffix: 'mi', info: 'Total miles driven for the whole trip, there and back.' },
    { id: 'mpg', label: 'Car fuel economy', type: 'number', default: 28, min: 1, step: 1, suffix: 'mpg', info: 'Miles per gallon from your car or the trip computer.' },
    { id: 'price', label: 'Fuel price', type: 'number', default: 3.2, min: 0, step: 0.05, prefix: '$', suffix: '/gal', info: 'Average price per gallon on the trip.' },
    { id: 'tolls', label: 'Tolls and parking', type: 'number', default: 24, min: 0, step: 1, prefix: '$', info: 'All tolls and parking for the trip.' },
    { id: 'wear', label: 'Wear per mile', type: 'number', default: 0.1, min: 0, step: 0.01, prefix: '$', suffix: '/mi', info: 'Optional. Tyres, oil and maintenance per mile. Use 0 to split only fuel and tolls.' },
    { id: 'pax', label: 'Passengers besides the driver', type: 'number', default: 3, min: 0, max: 20, step: 1, info: 'People riding along who are not driving.' },
    {
      id: 'driver', label: 'Driver pays a share', type: 'select', default: 'yes',
      options: [{ value: 'yes', label: 'Yes, split between everyone' }, { value: 'no', label: 'No, passengers cover it' }],
      info: 'Whether the driver counts as one of the people splitting the cost. It is the group\'s choice.',
    },
  ],
  outputs: [
    { id: 'each', label: 'Each person pays', format: 'currency', primary: true, info: 'Total cost divided by the number of people splitting it.' },
    { id: 'total', label: 'Total trip cost', format: 'currency', info: 'Fuel + wear + tolls and parking.' },
    { id: 'fuel', label: 'Fuel', format: 'currency', info: 'Miles ÷ mpg × fuel price.' },
    { id: 'wearCost', label: 'Wear and tear', format: 'currency', info: 'Miles × wear per mile.' },
    { id: 'people', label: 'People splitting', format: 'number', precision: 0, info: 'Passengers, plus the driver if the driver pays a share.' },
  ],
  compute: (v) => {
    const miles = num(v.miles);
    const mpg = num(v.mpg);
    const price = num(v.price);
    const tolls = num(v.tolls);
    const wear = num(v.wear);
    const pax = num(v.pax);
    if (miles === null || miles <= 0) return { each: null, error: 'Enter the round-trip miles.' };
    if (mpg === null || mpg <= 0) return { each: null, error: 'Enter the car\'s miles per gallon.' };
    if (price === null || price < 0) return { each: null, error: 'Enter the fuel price per gallon.' };
    if (tolls === null || tolls < 0 || wear === null || wear < 0) return { each: null, error: 'Tolls and wear cannot be negative.' };
    if (pax === null || pax < 0) return { each: null, error: 'Enter how many passengers there are.' };
    const p = Math.floor(pax);
    const driverPays = v.driver !== 'no';
    const people = driverPays ? p + 1 : p;
    if (people < 1) return { each: null, error: 'Add at least one passenger, or let the driver pay a share.' };
    const fuel = (miles / mpg) * price;
    const wearCost = miles * wear;
    const total = fuel + wearCost + tolls;
    const each = total / people;
    return {
      each,
      total,
      fuel,
      wearCost,
      people,
      tone: 'ok',
      badge: `$${fmt(each)} each`,
      note: `${people} ${people === 1 ? 'person' : 'people'} split $${fmt(total)}. The wear rate is your own estimate, so set it to 0 if you only want to share fuel and tolls.`,
      chart: {
        type: 'bar' as const,
        title: 'Where the trip cost goes',
        categories: ['Fuel', 'Wear', 'Tolls and parking'],
        series: [{ name: 'Cost', values: [fuel, wearCost, tolls] }],
        format: { format: 'currency' },
      },
      steps: [
        `Fuel = ${fmt(miles, 0)} mi ÷ ${fmt(mpg, 1)} mpg × $${fmt(price)} = $${fmt(fuel)}`,
        `Wear = ${fmt(miles, 0)} mi × $${fmt(wear)} = $${fmt(wearCost)}; tolls and parking = $${fmt(tolls)}`,
        `Total = $${fmt(total)}; ÷ ${people} = $${fmt(each)} each`,
      ],
    };
  },
  content: {
    formula: ['Fuel = miles ÷ mpg × price per gallon', 'Wear = miles × wear per mile', 'Each = (fuel + wear + tolls) ÷ people splitting'],
    body: [
      'Splitting a road trip is easier when everyone sees the same numbers. Fuel depends on distance, your car\'s mpg and the pump price. Tolls and parking are shared as they come. Wear on the car is optional, but it is the part drivers most often forget.',
      'Example: 600 miles at 28 mpg and $3.20 a gallon uses 21.43 gallons, which is $68.57 of fuel. Add $60.00 of wear at $0.10 a mile and $24 of tolls and the trip costs $152.57. With the driver and 3 passengers sharing, that is $38.14 each.',
      'Whether the driver pays a share is the group\'s choice, so there is a switch for it. This calculator is a fair-split tool, not a tax or reimbursement rate. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I split gas for a road trip?', a: 'Divide miles by mpg to get gallons, multiply by the price, add tolls and parking, then divide by the number of people. 600 mi at 28 mpg and $3.20 is $68.57 of fuel.' },
      { q: 'Should the driver pay a share?', a: 'It is up to the group. Many groups split everything evenly, including the driver. Others have passengers cover the full cost. The switch shows both.' },
      { q: 'What wear per mile should I use?', a: 'Use your own estimate for tyres, oil and maintenance, or 0 to skip it. The default of $0.10 a mile is an example, not an official rate.' },
      { q: 'Does it matter how many people are in the car?', a: 'Fuel use barely changes with one more rider, so the total stays about the same and each share falls as more people join.' },
      { q: 'Why is the result different from the IRS mileage rate?', a: 'The IRS rate is for business deductions and bundles in many costs. This tool just splits what the trip actually costs plus your own wear estimate.' },
    ],
    sources: [
      { label: 'U.S. Department of Energy: Fuel economy', url: 'https://www.fueleconomy.gov/' },
    ],
  },
  related: ['rideshare-vs-own-car', 'cost-per-mile', 'gas-cost'],
  examples: [
    // 600/28 = 21.428571 *3.2 = 68.571429; wear 60; tolls 24; total 152.571429; /4 = 38.142857
    { values: { miles: 600, mpg: 28, price: 3.2, tolls: 24, wear: 0.1, pax: 3, driver: 'yes' }, expect: { each: 38.142857, total: 152.571429, fuel: 68.571429, wearCost: 60, people: 4 }, tolerance: 1e-5 },
    // 250/25 = 10 *3.4 = 34; wear 30; total 64; 1 passenger + driver = 2 -> 32
    { values: { miles: 250, mpg: 25, price: 3.4, tolls: 0, wear: 0.12, pax: 1, driver: 'yes' }, expect: { each: 32, total: 64, fuel: 34, wearCost: 30, people: 2 }, tolerance: 1e-5 },
    // driver does not pay: 64 / 1 passenger = 64
    { values: { miles: 250, mpg: 25, price: 3.4, tolls: 0, wear: 0.12, pax: 1, driver: 'no' }, expect: { each: 64, people: 1 }, tolerance: 1e-5 },
  ],
});
