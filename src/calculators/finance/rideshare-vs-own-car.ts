import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const COSTS = ['payment', 'insurance', 'parking', 'maintenance', 'fuel', 'other'] as const;

export default defineCalculator({
  slug: 'rideshare-vs-own-car',
  title: 'Rideshare vs Owning a Car Calculator',
  category: 'finance',
  description: 'Compare your monthly cost of owning a car with taking rideshare instead, and see how many rides a month it takes for owning to become the cheaper choice.',
  keywords: ['rideshare vs owning a car', 'uber vs owning a car', 'is it cheaper to uber than own a car', 'car ownership cost vs rideshare', 'break-even rides per month', 'do i need a car'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'payment', label: 'Car payment', type: 'number', prefix: '$', default: 450, min: 0, step: 10, suffix: 'per month', optional: true, info: 'Monthly loan or lease payment. Leave blank or 0 if the car is paid off.' },
    { id: 'insurance', label: 'Insurance', type: 'number', prefix: '$', default: 130, min: 0, step: 5, suffix: 'per month', optional: true, info: 'Monthly premium. If you pay every six or twelve months, divide it down to a month.' },
    { id: 'parking', label: 'Parking', type: 'number', prefix: '$', default: 100, min: 0, step: 5, suffix: 'per month', optional: true, info: 'Garage, permit or reserved space. Leave blank if parking is free.' },
    { id: 'maintenance', label: 'Maintenance and repairs', type: 'number', prefix: '$', default: 60, min: 0, step: 5, suffix: 'per month', optional: true, info: 'Your own monthly average for servicing, tires and repairs.' },
    { id: 'fuel', label: 'Fuel or charging', type: 'number', prefix: '$', default: 120, min: 0, step: 5, suffix: 'per month', optional: true, info: 'What you spend on gas or charging in a typical month.' },
    { id: 'other', label: 'Other fixed costs', type: 'number', prefix: '$', default: 40, min: 0, step: 5, suffix: 'per month', optional: true, info: 'Registration, inspections, tolls, car washes and so on, as a monthly figure.' },
    { id: 'rides', label: 'Rideshare trips', type: 'number', default: 40, min: 0, step: 1, suffix: 'per month', info: 'How many rides you would take in a month if you did not own a car.' },
    { id: 'fare', label: 'Average fare per ride', type: 'number', prefix: '$', default: 18, min: 0, step: 0.5, info: 'Typical cost of one ride including tip and fees. Use your own recent receipts.' },
  ],
  outputs: [
    { id: 'diff', label: 'Monthly difference', format: 'currency', precision: 2, primary: true, info: 'The gap between owning and rideshare each month, always shown as a positive amount.' },
    { id: 'own', label: 'Owning a car', format: 'currency', precision: 2, info: 'Sum of all your monthly car costs.' },
    { id: 'ride', label: 'Rideshare', format: 'currency', precision: 2, info: 'Rides per month × average fare.' },
    { id: 'annual', label: 'Annual difference', format: 'currency', precision: 2, info: 'Monthly difference × 12.' },
    { id: 'breakEven', label: 'Break-even rides per month', format: 'number', precision: 1, info: 'Owning cost ÷ fare. Above this many rides, owning is cheaper.' },
  ],
  compute: (v) => {
    const parts = COSTS.map((k) => num(v[k]) ?? 0);
    const rides = num(v.rides);
    const fare = num(v.fare);
    if (rides === null || fare === null) return { diff: null };
    if (parts.some((p) => p < 0) || rides < 0 || fare < 0) return { diff: null };
    if (fare === 0) return { diff: null, error: 'Enter an average fare above zero.' };
    const own = parts.reduce((a, b) => a + b, 0);
    const ride = rides * fare;
    const gap = ride - own; // positive: owning is cheaper
    const diff = Math.abs(gap);
    const annual = diff * 12;
    const breakEven = own / fare;
    const ownCheaper = gap > 0;
    const tie = gap === 0;
    const winner = tie ? 'Same cost' : ownCheaper ? 'Owning is cheaper' : 'Rideshare is cheaper';
    const top = Math.max(Math.ceil(Math.max(rides, breakEven) * 1.5), 10);
    const step = Math.max(Math.ceil(top / 20), 1);
    const xs: number[] = [];
    for (let x = 0; x <= top; x += step) xs.push(x);
    return {
      diff,
      own,
      ride,
      annual,
      breakEven,
      tone: tie ? 'ok' : 'good',
      badge: tie ? 'Same cost' : `${winner} by ${money(diff)}/mo`,
      note: tie
        ? `Owning costs ${money(own)} a month and ${fmt(rides, 0)} rides at ${money(fare)} cost the same.`
        : `Owning costs ${money(own)} a month; ${fmt(rides, 0)} rides at ${money(fare)} cost ${money(ride)}. ${winner} by ${money(diff)} a month, ${money(annual)} a year. Break-even is ${fmt(breakEven)} rides a month.`,
      chart: {
        type: 'line',
        title: 'Monthly cost by number of rides',
        x: xs,
        xLabel: 'Rides per month',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Rideshare', values: xs.map((x) => x * fare) },
          { name: 'Owning a car', values: xs.map(() => own) },
        ],
        markers: [{ x: Math.round(breakEven), label: `Break-even ≈ ${fmt(breakEven)} rides` }],
      },
      steps: [
        `Owning = ${parts.map((p) => money(p)).join(' + ')} = ${money(own)}`,
        `Rideshare = ${fmt(rides, 2)} × ${money(fare)} = ${money(ride)}`,
        `Difference = ${money(ride)} − ${money(own)} = ${money(gap)} (${tie ? 'equal' : ownCheaper ? 'owning is cheaper' : 'rideshare is cheaper'})`,
        `Break-even = ${money(own)} ÷ ${money(fare)} = ${fmt(breakEven, 2)} rides`,
      ],
    };
  },
  content: {
    formula: [
      'Owning = payment + insurance + parking + maintenance + fuel + other fixed costs',
      'Rideshare = rides per month × average fare',
      'Difference = |rideshare − owning|, × 12 for the year',
      'Break-even rides = owning ÷ average fare',
    ],
    body: [
      'Owning a car is mostly fixed cost: the payment, insurance and parking arrive whether or not you drive. Rideshare is the opposite, since you pay per trip. So the real question is how many rides a month your car replaces.',
      'Example: payment $450, insurance $130, parking $100, maintenance $60, fuel $120 and $40 of other costs add up to $900 a month. At 40 rides a month and $18 a ride, rideshare is $720, which is $180 a month cheaper, or $2,160 a year. The break-even is $900 ÷ $18 = 50 rides. At 60 rides, rideshare is $1,080 and owning is $180 cheaper.',
      'Every figure is your own input, so the calculator assumes no typical fares or costs. Use recent receipts for the fare and your bank statements for the car. Depreciation, the loss in value of the car, and the opportunity cost of money tied up in it are not included unless you put them in the other fixed costs. Rideshare cost here also ignores trips you would take by bus, bike or on foot, and the convenience of having a car. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is it cheaper to use rideshare than own a car?', a: 'It depends on how many rides you take. With the example costs of $900 a month and an $18 fare, rideshare is cheaper below 50 rides a month and owning is cheaper above it.' },
      { q: 'How is the break-even number calculated?', a: 'Monthly cost of owning divided by the average fare. $900 ÷ $18 = 50 rides a month. At exactly that number the two cost the same.' },
      { q: 'What costs should I include for owning?', a: 'The car payment, insurance, parking, maintenance, fuel and other fixed costs such as registration, all as monthly amounts. Divide yearly bills by 12.' },
      { q: 'Does this include depreciation?', a: 'No. There is no depreciation input, so a car losing value is not counted unless you add an allowance to other fixed costs. That makes owning look somewhat cheaper than it really is.' },
      { q: 'What fare should I use?', a: 'Your own average per ride including tip and fees, from recent receipts. The calculator does not assume a fare, and surge pricing or longer trips will raise it.' },
    ],
    sources: [],
  },
  related: ['cost-per-mile', 'gig-driver-profit', 'ev-vs-gas-cost', 'car-lease-vs-buy', 'car-affordability', 'gas-cost'],
  examples: [
    // own 450+130+100+60+120+40 = 900; rideshare 40*18 = 720; rideshare cheaper by 180; annual 2160; break-even 900/18 = 50
    { values: { payment: 450, insurance: 130, parking: 100, maintenance: 60, fuel: 120, other: 40, rides: 40, fare: 18 }, expect: { own: 900, ride: 720, diff: 180, annual: 2160, breakEven: 50 }, tolerance: 1e-6 },
    // 60*18 = 1080; owning cheaper by 180
    { values: { payment: 450, insurance: 130, parking: 100, maintenance: 60, fuel: 120, other: 40, rides: 60, fare: 18 }, expect: { own: 900, ride: 1080, diff: 180, annual: 2160, breakEven: 50 }, tolerance: 1e-6 },
    // own 300+100+0+50+80+0 = 530; 20*25 = 500; diff 30; annual 360; break-even 530/25 = 21.2
    { values: { payment: 300, insurance: 100, parking: 0, maintenance: 50, fuel: 80, other: 0, rides: 20, fare: 25 }, expect: { own: 530, ride: 500, diff: 30, annual: 360, breakEven: 21.2 }, tolerance: 1e-6 },
  ],
});
