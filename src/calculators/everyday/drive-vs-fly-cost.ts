import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'drive-vs-fly-cost',
  title: 'Drive vs Fly Cost Calculator',
  category: 'everyday',
  description: 'Compare the total cost of driving with flying for a trip: fuel, tolls, fares, bag fees and airport transport, for the whole group and per person.',
  keywords: ['drive vs fly cost calculator', 'is it cheaper to drive or fly', 'holiday trip cost drive or fly', 'road trip vs flight cost', 'cost to drive vs flight for family', 'driving vs flying'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'miles', label: 'Round-trip driving distance', type: 'number', suffix: 'mi', default: 1000, min: 1, step: 50, info: 'Total miles there and back. Use a maps app for the route.' },
    { id: 'mpg', label: 'Car fuel economy', type: 'number', suffix: 'mpg', default: 28, min: 1, max: 150, step: 1, info: 'Miles per gallon of the car you would drive.' },
    { id: 'gas', label: 'Gas price', type: 'number', prefix: '$', suffix: '/gal', default: 3.2, min: 0, step: 0.05, info: 'Price per gallon where you will fill up.' },
    { id: 'tolls', label: 'Tolls and parking (drive)', type: 'number', prefix: '$', default: 20, min: 0, step: 5, optional: true, info: 'Total tolls, parking and hotel parking for the whole drive.' },
    { id: 'wear', label: 'Wear and tear per mile', type: 'number', prefix: '$', default: 0, min: 0, step: 0.01, optional: true, info: 'Optional. A per-mile allowance for tyres, oil and depreciation. Leave at 0 to count only fuel and tolls.' },
    { id: 'people', label: 'Travelers', type: 'number', default: 4, min: 1, max: 20, step: 1, info: 'Everyone who needs a plane ticket. Driving costs the same for any number of people in the car.' },
    { id: 'fare', label: 'Round-trip fare per person', type: 'number', prefix: '$', default: 250, min: 0, step: 10, info: 'The ticket price you were quoted, round trip, per person.' },
    { id: 'bags', label: 'Bag fees per person', type: 'number', prefix: '$', default: 60, min: 0, step: 5, optional: true, info: 'Checked-bag fees for the round trip, per person.' },
    { id: 'transport', label: 'Airport transport and parking (fly)', type: 'number', prefix: '$', default: 80, min: 0, step: 10, optional: true, info: 'Rides, rental car or airport parking for the whole group, both ends.' },
  ],
  outputs: [
    { id: 'drive', label: 'Driving total', format: 'currency', primary: true, info: 'Miles ÷ mpg × gas price + tolls + miles × wear per mile.' },
    { id: 'fly', label: 'Flying total', format: 'currency', info: 'Travelers × (fare + bag fees) + airport transport.' },
    { id: 'difference', label: 'Driving saves', format: 'currency', info: 'Flying total minus driving total. Negative means flying is cheaper.' },
    { id: 'drivePer', label: 'Driving, per person', format: 'currency', info: 'Driving total ÷ travelers.' },
    { id: 'flyPer', label: 'Flying, per person', format: 'currency', info: 'Flying total ÷ travelers.' },
  ],
  compute: (v) => {
    const miles = num(v.miles);
    const mpg = num(v.mpg);
    const gas = num(v.gas);
    const tolls = num(v.tolls) ?? 0;
    const wear = num(v.wear) ?? 0;
    const people = num(v.people);
    const fare = num(v.fare);
    const bags = num(v.bags) ?? 0;
    const transport = num(v.transport) ?? 0;
    if (miles === null || mpg === null || gas === null || people === null || fare === null) return { drive: null };
    if (miles <= 0 || mpg <= 0 || gas < 0 || people < 1 || fare < 0 || tolls < 0 || wear < 0 || bags < 0 || transport < 0) return { drive: null };
    const n = Math.round(people);
    const gallons = miles / mpg;
    const fuel = gallons * gas;
    const wearCost = miles * wear;
    const drive = fuel + tolls + wearCost;
    const flyTickets = n * (fare + bags);
    const fly = flyTickets + transport;
    const diff = fly - drive;
    const driveWins = diff >= 0;
    return {
      drive,
      fly,
      difference: diff,
      drivePer: drive / n,
      flyPer: fly / n,
      tone: driveWins ? 'good' : 'ok',
      badge: driveWins ? `Driving is ${money(diff, 0)} cheaper` : `Flying is ${money(-diff, 0)} cheaper`,
      note: `Driving costs ${money(drive)} (${money(drive / n)} a person) against ${money(fly)} for flying (${money(fly / n)} a person). Money only: the calculator does not count travel time, rest stops or hotel nights on the road.`,
      chart: {
        type: 'bar',
        title: 'Total trip cost',
        categories: ['Drive', 'Fly'],
        series: [{ name: 'Total', values: [+drive.toFixed(2), +fly.toFixed(2)] }],
        format: { format: 'currency' },
        highlight: driveWins ? 0 : 1,
      },
      steps: [
        `Fuel = ${miles} mi ÷ ${mpg} mpg = ${gallons.toFixed(3)} gal × ${money(gas)} = ${money(fuel)}`,
        `Driving = ${money(fuel)} + ${money(tolls)} tolls and parking${wear ? ` + ${money(wearCost)} wear` : ''} = ${money(drive)}`,
        `Flying = ${n} × (${money(fare)} + ${money(bags)}) + ${money(transport)} = ${money(fly)}`,
        `Difference = ${money(fly)} − ${money(drive)} = ${money(diff)}`,
      ],
    };
  },
  content: {
    formula: [
      'Driving = miles ÷ mpg × gas price + tolls and parking + miles × wear per mile',
      'Flying = travelers × (fare + bag fees) + airport transport',
      'Per person = total ÷ travelers',
    ],
    body: [
      'The cheapest way to travel depends on how many people are going. Driving costs roughly the same whether the car holds one person or four, while every extra flyer adds another ticket and more bag fees. That is why driving often wins for families and flying for solo trips.',
      'Fill in the prices you were actually quoted. The calculator does not look up fares or fuel prices, and it does not include a mileage rate unless you enter your own wear and tear per mile. Airport transport covers rides, a rental car or parking at either end.',
      'This compares money only. A long drive can add hotel nights, meals and a lot of time, and a flight can add delays. Weigh those yourself; the road trip time calculator helps with the driving hours. Everything runs in your browser.',
    ],
    faq: [
      { q: 'Is it cheaper to drive or fly?', a: 'Compare the totals. For 1,000 miles at 28 mpg and $3.20 a gallon, fuel is $114.29; with $20 in tolls driving costs $134.29. Flying four people at $250 plus $60 of bags each, plus $80 transport, is $1,320.' },
      { q: 'How is the fuel cost worked out?', a: 'Miles divided by miles per gallon gives gallons, which you multiply by the gas price. 1,000 ÷ 28 = 35.714 gallons × $3.20 = $114.29.' },
      { q: 'Why does the group size matter?', a: 'Driving is one cost for the car, but flying is a ticket and bag fees for each person. Four travelers pay four fares.' },
      { q: 'Should I include wear and tear?', a: 'It is optional. If you want to count tyres, oil and depreciation, enter your own cents per mile. The default is 0, so only fuel and tolls count.' },
      { q: 'Does it include time or hotels?', a: 'No. It compares money only. Add hotel nights or lost work time yourself if they apply.' },
    ],
    sources: [{ label: 'fueleconomy.gov: Find a car and its MPG', url: 'https://www.fueleconomy.gov/' }],
  },
  related: ['gas-cost', 'road-trip-time', 'holiday-spending-total', 'fuel-economy-converter', 'bill-splitter'],
  examples: [
    // 1000/28 = 35.714286 gal × 3.20 = 114.2857; + 20 = 134.2857. Fly 4 × (250+60) = 1240 + 80 = 1320. Diff 1185.7143; per person 33.5714 / 330.
    { values: { miles: 1000, mpg: 28, gas: 3.2, tolls: 20, wear: 0, people: 4, fare: 250, bags: 60, transport: 80 }, expect: { drive: 134.2857, fly: 1320, difference: 1185.7143, drivePer: 33.5714, flyPer: 330 }, tolerance: 1e-3 },
    // Solo, 600 mi at 30 mpg, $3 = 60; wear 0.10 × 600 = 60 → 120. Fly 1 × (150 + 0) + 40 = 190... diff 70.
    { values: { miles: 600, mpg: 30, gas: 3, tolls: 0, wear: 0.1, people: 1, fare: 150, bags: 0, transport: 40 }, expect: { drive: 120, fly: 190, difference: 70 }, tolerance: 1e-6 },
    // Flying cheaper: 2000 mi at 20 mpg, $4 = 400 + 100 tolls = 500; fly 1 × 200 + 0 = 200; diff −300.
    { values: { miles: 2000, mpg: 20, gas: 4, tolls: 100, wear: 0, people: 1, fare: 200, bags: 0, transport: 0 }, expect: { drive: 500, fly: 200, difference: -300 }, tolerance: 1e-6 },
  ],
});
