import { defineCalculator, type ChartSpec, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'gas-detour',
  title: 'Gas Station Detour Calculator',
  category: 'everyday',
  description: 'Is the cheaper gas station worth the drive? Compare the savings on your fill-up with the fuel and time the detour costs.',
  metaDescription: 'Gas station detour calculator: see if driving to a cheaper station saves money after the extra fuel and your time, plus the break-even detour distance.',
  updated: '2026-11-27',
  keywords: ['gas station detour calculator', 'is cheaper gas worth the drive', 'drive further for cheaper gas', 'gas price detour break even', 'cheaper gas station savings'],
  inputs: [
    { id: 'gallons', label: 'Gallons to buy', type: 'number', suffix: 'gal', default: 12, min: 0, step: 0.5, info: 'How much fuel you expect to put in.' },
    { id: 'near', label: 'Price at the near station', type: 'number', prefix: '$', suffix: 'per gal', default: 3.5, min: 0, step: 0.01, info: 'Price per gallon at the station on your way.' },
    { id: 'far', label: 'Price at the far station', type: 'number', prefix: '$', suffix: 'per gal', default: 3.3, min: 0, step: 0.01, info: 'Price per gallon at the cheaper station you would detour to.' },
    { id: 'miles', label: 'Extra round-trip miles', type: 'number', suffix: 'miles', default: 6, min: 0, step: 0.5, info: 'How many more miles the detour adds in total, there and back.' },
    { id: 'mpg', label: 'Your fuel economy', type: 'number', suffix: 'mpg', default: 25, min: 0, step: 0.5, info: 'Miles per gallon your car gets.' },
    { id: 'wage', label: 'Value of your time', type: 'number', prefix: '$', suffix: 'per hour', default: 0, min: 0, step: 1, optional: true, info: 'Optional. Put a price on your time. Leave at 0 to ignore it.' },
    { id: 'minutes', label: 'Extra minutes', type: 'number', suffix: 'min', default: 0, min: 0, step: 1, optional: true, info: 'Optional. How many extra minutes the detour takes.' },
  ],
  outputs: [
    { id: 'net', label: 'Net saving', format: 'currency', primary: true, info: 'Gross savings minus the detour fuel cost and the value of your time. Negative means the detour costs you money.' },
    { id: 'gross', label: 'Gross savings on the fill-up', format: 'currency', info: 'Gallons × (near price − far price).' },
    { id: 'fuel', label: 'Detour fuel cost', format: 'currency', precision: 3, info: 'Extra miles ÷ mpg × far price.' },
    { id: 'timeCost', label: 'Value of your time', format: 'currency', info: 'Extra minutes ÷ 60 × hourly value.' },
    { id: 'breakEven', label: 'Break-even extra miles', format: 'number', precision: 1, suffix: 'miles', info: 'The longest round-trip detour where fuel alone still leaves you even: gross savings × mpg ÷ far price. Does not include time.' },
  ],
  compute: (v) => {
    const gallons = num(v.gallons);
    const near = num(v.near);
    const far = num(v.far);
    const miles = num(v.miles);
    const mpg = num(v.mpg);
    const wage = num(v.wage) ?? 0;
    const minutes = num(v.minutes) ?? 0;
    if (gallons === null || near === null || far === null || miles === null || mpg === null) return { net: null };
    if (mpg <= 0) return { net: null, error: 'Fuel economy must be greater than 0.' };
    if (far <= 0) return { net: null, error: 'The far station price must be greater than 0.' };
    if (gallons < 0 || near < 0 || miles < 0 || wage < 0 || minutes < 0) {
      return { net: null, error: 'Gallons, prices, miles and time cannot be negative.' };
    }
    const gross = gallons * (near - far);
    const fuel = (miles / mpg) * far;
    const timeCost = (minutes / 60) * wage;
    const net = gross - fuel - timeCost;
    const breakEven = gross > 0 ? (gross * mpg) / far : 0;
    const worth = net > 0;
    const out: ComputeResult = {
      net, gross, fuel, timeCost, breakEven,
      tone: worth ? 'good' : net === 0 ? 'ok' : 'bad',
      badge: worth ? 'Worth the detour' : net === 0 ? 'Break-even' : 'Not worth it',
    };
    out.steps = [
      `Gross savings = ${gallons} gal × (${money(near)} − ${money(far)}) = ${money(gross)}`,
      `Detour fuel = ${miles} mi ÷ ${mpg} mpg × ${money(far)} = ${money(fuel, 3)}`,
      `Time = ${minutes} min ÷ 60 × ${money(wage)} = ${money(timeCost)}`,
      `Net = ${money(gross)} − ${money(fuel, 3)} − ${money(timeCost)} = ${money(net)}`,
      gross > 0
        ? `Break-even (fuel only) = ${money(gross)} × ${mpg} ÷ ${money(far)} = ${breakEven.toFixed(1)} extra miles`
        : 'The far station is not cheaper, so no detour pays off.',
    ];
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Savings vs what the detour costs',
      categories: ['Gross savings', 'Detour fuel', 'Your time', 'Net'],
      series: [{ name: 'Dollars', values: [gross, fuel, timeCost, net] }],
      format: { format: 'currency' },
    };
    out.chart = chart;
    return out;
  },
  content: {
    formula: [
      'Gross savings = gallons × (near price − far price)',
      'Detour fuel cost = extra miles ÷ mpg × far price',
      'Net saving = gross savings − detour fuel cost − time cost',
      'Break-even extra miles = gross savings × mpg ÷ far price',
    ],
    body: [
      'A station a few miles away might sell gas for 20 cents less, but the drive burns fuel too. This calculator compares what you save on the fill-up with what the extra miles cost, and optionally the value of your time.',
      'For example, buying 12 gallons at $3.50 near or $3.30 far saves $2.40. A 6-mile round-trip detour at 25 mpg burns 0.24 gallons, or $0.792 at the far price. The net saving is $1.608, so the detour is worth it, but only just. The break-even is about 18.2 extra miles.',
      'Add a value for your time and the answer can flip. At $20 an hour, 10 extra minutes is $3.33, which turns the same trip into a loss of about $1.73. Wear and tear on the car is not included.',
    ],
    faq: [
      { q: 'Is it worth driving to a cheaper gas station?', a: 'Only if the savings on your fill-up are bigger than the fuel the extra miles use. With the defaults, 12 gallons saves $2.40 and the 6-mile detour costs $0.792 in fuel, a net saving of $1.608.' },
      { q: 'How far can I drive before the detour stops paying?', a: 'Gross savings × mpg ÷ far price. With $2.40 saved, 25 mpg and a $3.30 price, that is about 18.2 extra round-trip miles. This counts fuel only, not your time.' },
      { q: 'Should I count my time?', a: 'That is up to you. Enter an hourly value and the extra minutes. At $20 an hour, 10 extra minutes costs $3.33, so the default trip would lose about $1.73 overall.' },
      { q: 'Does this include wear and tear on the car?', a: 'No. It counts fuel and, optionally, time. Maintenance and tire wear would make long detours less attractive.' },
    ],
    sources: [],
  },
  related: ['gas-cost', 'cost-per-mile'],
  examples: [
    // gross 12 x (3.50-3.30) = 2.40; fuel 6/25 x 3.30 = 0.792; net 2.40-0.792 = 1.608; break-even 2.4x25/3.30 = 18.1818
    { values: { gallons: 12, near: 3.5, far: 3.3, miles: 6, mpg: 25, wage: 0, minutes: 0 }, expect: { gross: 2.4, fuel: 0.792, timeCost: 0, net: 1.608, breakEven: 18.1818 }, tolerance: 0.001 },
    // time 10/60 x 20 = 3.3333; net 2.40 - 0.792 - 3.3333 = -1.7253
    { values: { gallons: 12, near: 3.5, far: 3.3, miles: 6, mpg: 25, wage: 20, minutes: 10 }, expect: { timeCost: 3.3333, net: -1.7253 }, tolerance: 0.001 },
  ],
});
