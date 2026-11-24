import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'transit-pass-break-even',
  title: 'Transit Pass Break-Even: Pass vs Pay Per Ride',
  category: 'everyday',
  description: 'Find how many rides a month make a transit pass worth it. Compare the pass price with paying each fare and see the monthly and yearly difference.',
  keywords: ['transit pass break even', 'monthly pass vs pay per ride', 'is a monthly metro pass worth it', 'bus pass vs single fare', 'commuter pass calculator'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'pass', label: 'Monthly pass price', type: 'number', prefix: '$', default: 127, min: 0, step: 1, info: 'The price of the pass for one month.' },
    { id: 'fare', label: 'Single fare', type: 'number', prefix: '$', default: 2.75, min: 0, step: 0.25, info: 'What one ride costs when you pay as you go.' },
    { id: 'rides', label: 'Rides you take a month', type: 'number', default: 44, min: 0, step: 1, info: 'A round trip counts as two rides.' },
  ],
  outputs: [
    { id: 'saving', label: 'Pass saves per month', format: 'currency', precision: 2, primary: true, info: 'Pay-per-ride cost − pass price. Negative means the pass costs more.' },
    { id: 'breakEven', label: 'Break-even rides a month', format: 'number', precision: 0, info: 'Pass price ÷ fare, rounded up to a whole ride.' },
    { id: 'payGo', label: 'Pay-per-ride cost a month', format: 'currency', precision: 2, info: 'Rides × single fare.' },
    { id: 'yearly', label: 'Difference per year', format: 'currency', precision: 2, info: 'Monthly saving × 12.' },
  ],
  compute: (v) => {
    const pass = num(v.pass);
    const fare = num(v.fare);
    const rides = num(v.rides);
    if (pass === null || fare === null || rides === null) return { saving: null };
    if (pass < 0 || fare <= 0 || rides < 0) return { saving: null };
    const r = Math.round(rides);
    const breakEven = Math.ceil(pass / fare - 1e-9);
    const payGo = r * fare;
    const saving = payGo - pass;
    const yearly = saving * 12;
    const max = Math.max(breakEven * 2, r * 2, 10);
    const step = Math.max(1, Math.round(max / 12));
    const xs: number[] = [];
    for (let i = 0; i <= max; i += step) xs.push(i);
    return {
      saving,
      breakEven,
      payGo,
      yearly,
      tone: saving > 0 ? 'good' : saving < 0 ? 'warn' : 'ok',
      badge: saving > 0 ? `Pass saves ${money(saving)} a month` : saving < 0 ? `Pay per ride saves ${money(-saving)} a month` : 'Exactly even',
      note: `The pass pays for itself at ${breakEven} rides a month. At ${r} rides, paying each fare costs ${money(payGo)} against ${money(pass)} for the pass, so ${saving >= 0 ? 'the pass saves' : 'the pass costs'} ${money(Math.abs(saving))} a month, ${money(Math.abs(yearly))} a year.`,
      chart: {
        type: 'line' as const,
        title: 'Monthly cost by number of rides',
        x: xs,
        xLabel: 'Rides a month',
        yFormat: { format: 'currency' as const },
        series: [
          { name: 'Pay per ride', values: xs.map((x) => x * fare) },
          { name: 'Monthly pass', values: xs.map(() => pass) },
        ],
      },
      steps: [
        `Break-even = ${money(pass)} ÷ ${money(fare)} = ${fmt(pass / fare, 2)}, so ${breakEven} rides`,
        `Pay per ride = ${r} × ${money(fare)} = ${money(payGo)}`,
        `Saving = ${money(payGo)} − ${money(pass)} = ${money(saving)}`,
        `Per year = ${money(saving)} × 12 = ${money(yearly)}`,
      ],
    };
  },
  content: {
    formula: [
      'Break-even rides = pass price ÷ single fare, rounded up',
      'Pay-per-ride cost = rides × single fare',
      'Saving = pay-per-ride cost − pass price',
      'Per year = saving × 12',
    ],
    body: [
      'A monthly pass is a bet on how often you ride. Below a certain number of rides the pass loses; above it, every extra ride is free. This calculator finds that number and shows what your real riding is worth.',
      'Example: a $127 pass and a $2.75 fare. 127 ÷ 2.75 = 46.18, so you need 47 rides a month. At 44 rides you would pay $121.00 in fares, so the pass costs $6 more. At 60 rides you would pay $165.00, so the pass saves $38 a month, which is $456 a year.',
      'The tool assumes a flat single fare and no fare caps, transfers or employer benefits. If your agency caps weekly or monthly spending, your pay-per-ride cost may be lower than shown. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How many rides make a monthly pass worth it?', a: 'Divide the pass price by the single fare and round up. A $127 pass at $2.75 a ride needs 47 rides.' },
      { q: 'Does a round trip count as one ride?', a: 'No, count it as two rides, one each way, unless your fare covers both directions.' },
      { q: 'What about fare caps?', a: 'If your agency caps spending, paying per ride may cost less than this tool shows. Use your typical capped monthly spend as the pay-per-ride cost.' },
      { q: 'Is the yearly figure exact?', a: 'It multiplies one month by 12. It assumes you ride the same amount every month.' },
      { q: 'What if my employer pays for part of the pass?', a: 'Enter the price you actually pay for the pass.' },
    ],
    sources: [],
  },
  related: ['commute-cost', 'real-hourly-wage', 'annual-vs-monthly-plan', 'ev-vs-gas-cost'],
  examples: [
    // breakEven ceil(46.18)=47; payGo 44*2.75=121; saving -6; yearly -72
    { values: { pass: 127, fare: 2.75, rides: 44 }, expect: { breakEven: 47, payGo: 121, saving: -6, yearly: -72 } },
    // payGo 60*2.75=165; saving 38; yearly 456
    { values: { pass: 127, fare: 2.75, rides: 60 }, expect: { breakEven: 47, payGo: 165, saving: 38, yearly: 456 } },
  ],
});
