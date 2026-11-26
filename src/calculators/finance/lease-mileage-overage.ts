import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const mi = (x: number) => `${Math.round(x).toLocaleString('en-US')} miles`;

export default defineCalculator({
  slug: 'lease-mileage-overage',
  title: 'Lease Mileage Overage Calculator',
  category: 'finance',
  description: 'Project your car lease mileage at return from your pace so far, see the excess-mileage fee, and the monthly miles that keep you under the cap.',
  keywords: ['lease mileage overage calculator', 'excess mileage fee lease', 'lease mileage penalty', 'over mileage lease cost', 'car lease miles over', 'lease mileage allowance'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'annual', label: 'Annual mileage allowance', type: 'number', default: 12000, min: 1, step: 500, suffix: 'miles/year', info: 'Miles per year in your lease contract, often 10,000, 12,000 or 15,000.' },
    { id: 'term', label: 'Lease term', type: 'number', default: 36, min: 1, step: 1, suffix: 'months', info: 'Total length of the lease.' },
    { id: 'elapsed', label: 'Months elapsed', type: 'number', default: 30, min: 1, step: 1, suffix: 'months', info: 'Months since the lease started. Enter the full term if you are returning the car now.' },
    { id: 'driven', label: 'Miles driven so far', type: 'number', default: 33000, min: 0, step: 500, suffix: 'miles', info: 'Odometer reading now minus the odometer at lease start.' },
    { id: 'fee', label: 'Fee per extra mile', type: 'number', prefix: '$', default: 0.25, min: 0, step: 0.01, info: 'Excess-mileage charge in your contract, commonly $0.15 to $0.30 a mile.' },
  ],
  outputs: [
    { id: 'overageFee', label: 'Projected overage fee', format: 'currency', precision: 0, primary: true, info: 'Miles over the total allowance × fee per mile.' },
    { id: 'projected', label: 'Projected miles at return', format: 'number', precision: 0, info: 'Miles so far ÷ months elapsed × lease term.' },
    { id: 'allowance', label: 'Total allowance', format: 'number', precision: 0, info: 'Annual allowance × term ÷ 12.' },
    { id: 'overMiles', label: 'Projected miles over', format: 'number', precision: 0, info: 'Projected miles minus total allowance, never below 0.' },
    { id: 'capPace', label: 'Monthly pace to stay under', format: 'number', precision: 0, info: 'Allowance left ÷ months left. 0 if the allowance is already used up or the lease is over.' },
    { id: 'currentPace', label: 'Your pace so far', format: 'number', precision: 0, info: 'Miles so far ÷ months elapsed.' },
  ],
  compute: (v) => {
    const annual = num(v.annual);
    const term = num(v.term);
    const elapsed = num(v.elapsed);
    const driven = num(v.driven);
    const fee = num(v.fee);
    if (annual === null || term === null || elapsed === null || driven === null || fee === null) return { overageFee: null };
    if (annual <= 0 || term <= 0 || elapsed <= 0 || elapsed > term || driven < 0 || fee < 0) return { overageFee: null };
    const allowance = (annual * term) / 12;
    const currentPace = driven / elapsed;
    const projected = currentPace * term;
    const overMiles = Math.max(0, projected - allowance);
    const overageFee = overMiles * fee;
    const left = term - elapsed;
    const capPace = left > 0 ? Math.max(0, allowance - driven) / left : 0;
    const note = overMiles > 0
      ? `At ${mi(currentPace)} a month you would reach about ${mi(projected)} against a ${mi(allowance)} allowance, which is ${mi(overMiles)} over and a fee of about ${money(overageFee, 0)} at ${money(fee)} a mile.${left > 0 ? ` To avoid it, drive no more than ${mi(capPace)} a month for the remaining ${left} months.` : ''} Your contract sets the real rate; some leases also allow buying extra miles in advance, usually at a lower price.`
      : `At ${mi(currentPace)} a month you would reach about ${mi(projected)}, under the ${mi(allowance)} allowance, so no overage fee is projected. Most leases do not refund unused miles.`;
    return {
      overageFee,
      projected,
      allowance,
      overMiles,
      capPace,
      currentPace,
      tone: overMiles > 0 ? 'warn' : 'good',
      badge: overMiles > 0 ? `About ${mi(overMiles)} over` : 'Under your allowance',
      note,
      chart: {
        type: 'bar',
        title: 'Miles at lease end',
        categories: ['Allowance', 'Projected'],
        series: [{ name: 'Miles', values: [allowance, projected] }],
        format: { format: 'integer' },
      },
      steps: [
        `Total allowance = ${annual.toLocaleString('en-US')} × ${term} ÷ 12 = ${mi(allowance)}`,
        `Projected miles = ${driven.toLocaleString('en-US')} ÷ ${elapsed} × ${term} = ${mi(projected)}`,
        `Miles over = ${mi(overMiles)}`,
        `Fee = ${mi(overMiles)} × ${money(fee)} = ${money(overageFee)}`,
      ],
    };
  },
  content: {
    formula: [
      'Total allowance = annual allowance × lease term in months ÷ 12',
      'Projected miles = miles so far ÷ months elapsed × lease term',
      'Overage fee = max(0, projected miles - total allowance) × fee per mile',
      'Monthly pace to stay under = (allowance - miles so far) ÷ months left',
    ],
    body: [
      'Most car leases cap the miles you can drive and charge a fee for every mile over, usually 15 to 30 cents. The bill arrives at return, so it helps to check your pace before the last few months. This calculator projects your total from your mileage so far and prices the overage.',
      'Example: a 36-month lease with 12,000 miles a year allows 36,000 miles. After 30 months you have driven 33,000, a pace of 1,100 a month, which projects to 39,600 miles at return. That is 3,600 over, and at $0.25 a mile the fee is $900. To stay under, you would need to average 500 miles a month for the last 6 months.',
      'The projection assumes you keep driving at the same pace. Check your contract for the exact fee, any buffer, and whether you can pre-buy miles at a lower rate. Taxes and other end-of-lease charges are not included. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much is the lease mileage overage fee?', a: 'It is miles over the total allowance × the fee per mile. In the example, 3,600 miles over at $0.25 is $900.' },
      { q: 'How is the projected mileage worked out?', a: 'Miles so far ÷ months elapsed × lease term. 33,000 miles in 30 months is 1,100 a month, so 36 months projects to 39,600 miles.' },
      { q: 'How many miles a month can I drive to stay under?', a: 'Allowance left ÷ months left. With a 36,000-mile allowance, 33,000 driven and 6 months left, that is 3,000 ÷ 6 = 500 miles a month.' },
      { q: 'Do unused miles get refunded?', a: 'Usually not. If you finish under the allowance, this calculator shows no fee and does not credit the spare miles. Check your contract for any exceptions.' },
      { q: 'Can I lower the fee?', a: 'Some lessors let you buy extra miles in advance at a lower rate than the end-of-lease charge, or you may be able to trade the car in early. Ask your lessor; terms vary.' },
    ],
    sources: [],
  },
  related: ['car-lease-vs-buy', 'lease-break-cost', 'cost-per-mile', 'car-affordability', 'depreciation-calculator', 'fuel-tank-runtime'],
  examples: [
    // allowance 12000*36/12 = 36000; pace 33000/30 = 1100; projected 1100*36 = 39600; over 3600; fee 3600*0.25 = 900; capPace (36000-33000)/6 = 500
    { values: { annual: 12000, term: 36, elapsed: 30, driven: 33000, fee: 0.25 }, expect: { allowance: 36000, currentPace: 1100, projected: 39600, overMiles: 3600, overageFee: 900, capPace: 500 }, tolerance: 1e-6 },
    // allowance 10000*24/12 = 20000; returning now (24 of 24), driven 18000; over 0; fee 0; capPace 0
    { values: { annual: 10000, term: 24, elapsed: 24, driven: 18000, fee: 0.3 }, expect: { allowance: 20000, projected: 18000, overMiles: 0, overageFee: 0, capPace: 0 }, tolerance: 1e-6 },
  ],
});
