import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const GAL_L = 3.785411784;

export default defineCalculator({
  slug: 'gas-cost',
  title: 'Gas Cost Calculator',
  category: 'everyday',
  description: 'Estimate the fuel cost of a road trip from distance, fuel economy and the price of gas.',
  keywords: ['fuel cost', 'trip cost', 'road trip', 'mpg', 'petrol cost', 'gas money', 'fuel calculator'],
  inputs: [
    { id: 'distance', label: 'Trip distance', type: 'number', unit: 'length', units: ['mi', 'km'], defaultUnit: 'mi', default: 300, min: 0, info: 'One-way driving distance. A map app’s route distance is more accurate than a straight line.' },
    { id: 'efficiency', label: 'Fuel economy', type: 'number', unit: 'fuel', units: ['mpg', 'mpguk', 'kmpl', 'l100'], defaultUnit: 'mpg', default: 25, min: 0, info: 'How far the vehicle goes per unit of fuel. Typical cars get 25–35 mpg on the highway; check your trip computer for a real figure.' },
    { id: 'price', label: 'Fuel price', type: 'number', prefix: '$', default: 3.5, min: 0, step: 0.01, info: 'What you pay at the pump, per gallon or per litre (choose below).' },
    {
      id: 'priceUnit',
      label: 'Price is per',
      type: 'select',
      segmented: true,
      default: 'gal',
      info: 'US stations price per gallon; most other countries price per litre.',
      options: [
        { value: 'gal', label: 'US gallon' },
        { value: 'l', label: 'Litre' },
      ],
    },
    { id: 'roundTrip', label: 'Round trip (double the distance)', type: 'toggle', default: false, info: 'Turn on to include the drive back, doubling the distance and the cost.' },
    { id: 'people', label: 'Split between', type: 'number', suffix: 'people', default: 1, min: 1, step: 1, optional: true, info: 'How many people are sharing the fuel cost evenly.' },
    { id: 'tolls', label: 'Tolls and parking', type: 'number', prefix: '$', default: 0, min: 0, step: 0.01, optional: true, info: 'Total tolls and parking for the whole trip. Optional; leave at 0 for fuel only.' },
    { id: 'nights', label: 'Nights away', type: 'number', suffix: 'nights', default: 0, min: 0, step: 1, optional: true, info: 'Nights you will pay for lodging. Optional.' },
    { id: 'lodging', label: 'Lodging per night', type: 'number', prefix: '$', default: 0, min: 0, step: 1, optional: true, info: 'Cost of one room per night, split with everyone sharing it. Optional.' },
    { id: 'food', label: 'Food per person per day', type: 'number', prefix: '$', default: 0, min: 0, step: 1, optional: true, info: 'Meals and snacks for one person for one day. Counted for nights away plus one day. Optional.' },
  ],
  outputs: [
    { id: 'cost', label: 'Fuel cost', format: 'currency', primary: true, info: 'Total cost of the fuel burned on the trip.' },
    { id: 'fuel', label: 'Fuel needed', unit: 'volume', units: ['gal', 'l', 'impgal'], defaultUnit: 'gal', precision: 2, info: 'How much fuel the trip uses: distance divided by fuel economy.' },
    { id: 'perPerson', label: 'Cost per person', format: 'currency', info: 'Fuel cost divided by the number of people sharing.' },
    { id: 'perMile', label: 'Cost per mile', format: 'currency', precision: 3, info: 'Fuel cost for each mile driven — handy for comparing cars or charging mileage.' },
    { id: 'perKm', label: 'Cost per km', format: 'currency', precision: 3, info: 'Fuel cost for each kilometre driven.' },
    { id: 'tripTotal', label: 'Total trip cost', format: 'currency', info: 'Fuel plus tolls, lodging and food. Equals the fuel cost if you leave the extras at 0.' },
    { id: 'tripPerPerson', label: 'Trip cost per person', format: 'currency', info: 'Fuel, tolls and lodging split evenly, plus each person’s own food.' },
  ],
  compute: (v) => {
    const dM = num(v.distance);
    const eff = num(v.efficiency); // km per litre
    const price = num(v.price);
    if (dM === null || !eff || price === null || dM < 0 || eff <= 0 || price < 0) return { cost: null };
    const km = (dM / 1000) * (v.roundTrip === 'on' ? 2 : 1);
    const litres = km / eff;
    const cost = v.priceUnit === 'l' ? litres * price : (litres / GAL_L) * price;
    const people = num(v.people) ?? 1;
    const nPeople = people >= 1 ? people : 1;
    const nights = Math.max(0, num(v.nights) ?? 0);
    const shared = cost + Math.max(0, num(v.tolls) ?? 0) + nights * Math.max(0, num(v.lodging) ?? 0);
    const foodEach = (nights + 1) * Math.max(0, num(v.food) ?? 0);
    const perMile = km > 0 ? cost / (km / 1.609344) : null;
    return {
      cost,
      fuel: litres / 1000,
      perPerson: people >= 1 ? cost / people : null,
      perMile,
      perKm: km > 0 ? cost / km : null,
      tripTotal: shared + foodEach * nPeople,
      tripPerPerson: shared / nPeople + foodEach,
      chart: {
        type: 'bar',
        title: 'Trip fuel cost',
        categories: ['Whole trip', 'Per person', 'Per 100 miles'],
        series: [{ name: 'Cost', values: [cost, people >= 1 ? cost / people : cost, (perMile ?? 0) * 100] }],
        format: { format: 'currency' },
        highlight: 0,
      },
      steps: [
        `Distance = ${km.toFixed(1)} km (${(km / 1.609344).toFixed(1)} mi)`,
        `Fuel = distance ÷ economy = ${litres.toFixed(2)} L (${(litres / GAL_L).toFixed(2)} US gal)`,
        `Cost = fuel × price = $${cost.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: ['Fuel used = distance ÷ fuel economy', 'Cost = fuel used × price per unit of fuel', 'With L/100 km: fuel (L) = distance (km) × L/100 km ÷ 100'],
    body: [
      'Trip fuel cost comes down to two numbers: how much fuel the journey burns and what that fuel costs. Divide the distance by your fuel economy to get gallons or litres, then multiply by the pump price.',
      'Use a realistic fuel economy. Window-sticker figures are measured under gentle test cycles; sustained highway speeds above 65 mph, roof boxes, towing, heavy loads and air-conditioning can cut real-world mileage by 10–25%. Your car’s trip computer or a fill-up-to-fill-up calculation is the best source.',
      'You can mix units freely — miles with L/100 km, or kilometres with a price per US gallon. Everything is converted internally, and the fuel needed can be shown in US gallons, litres or imperial gallons.',
    ],
    faq: [
      { q: 'What is the difference between US and UK mpg?', a: 'A UK (imperial) gallon is 4.546 L, about 20% larger than a US gallon of 3.785 L, so the same car shows a higher mpg figure in the UK. Pick the matching unit to avoid underestimating the cost.' },
      { q: 'How do I convert mpg to L/100 km?', a: 'Divide 235.21 by the US mpg figure. 25 mpg is about 9.4 L/100 km.' },
      { q: 'Does this include tolls or wear and tear?', a: 'The fuel cost does not, but the optional tolls, lodging and food fields feed the total trip cost. Wear and tear is not included; the IRS mileage rate is a common benchmark for the full per-mile cost of running a car.' },
      { q: 'How is food counted?', a: 'Food per person per day is multiplied by the nights away plus one day, then by the number of people. Lodging is one room per night, split evenly.' },
    ],
  },
  related: ['cost-per-mile', 'electricity-cost', 'unit-price', 'fuel-economy-converter', 'speed-converter', 'volume-converter'],
  examples: [
    // 300 mi at 25 mpg = 12 US gal; × $3.50 = $42
    { values: { distance: 482803.2, efficiency: 25 * 0.425143707, price: 3.5, priceUnit: 'gal', roundTrip: 'off', people: 2 }, expect: { cost: 42, perPerson: 21, perMile: 0.14 }, tolerance: 1e-6 },
    // 100 km at 8 L/100 km (12.5 km/L), round trip = 16 L × 1.80 = 28.80
    { values: { distance: 100000, efficiency: 12.5, price: 1.8, priceUnit: 'l', roundTrip: 'on', people: 1 }, expect: { cost: 28.8, fuel: 0.016 } },
    // 500 mi round trip at 28 mpg, $3.50: 17.857 gal = $62.50 fuel; + $10 tolls = $72.50; 2 people = $36.25 each
    { values: { distance: 250 * 1609.344, efficiency: 28 * 0.425143707, price: 3.5, priceUnit: 'gal', roundTrip: 'on', people: 2, tolls: 10, nights: 0, lodging: 0, food: 0 }, expect: { cost: 62.5, tripTotal: 72.5, tripPerPerson: 36.25 }, tolerance: 1e-3 },
    // 300 mi at 25 mpg = $42 fuel; 2 nights x $100 + 3 days x $30 food = 42 + 200 + 90 = 332 for one person
    { values: { distance: 482803.2, efficiency: 25 * 0.425143707, price: 3.5, priceUnit: 'gal', roundTrip: 'off', people: 1, tolls: 0, nights: 2, lodging: 100, food: 30 }, expect: { tripTotal: 332, tripPerPerson: 332 }, tolerance: 1e-6 },
  ],
});
