import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'renew-vs-move',
  title: 'Renew the Lease or Move? Break-Even Calculator',
  category: 'finance',
  description: 'Compare your renewal rent with a new place and the one-off cost of moving. See the monthly saving, the break-even month and your net over the stay.',
  keywords: ['renew lease or move calculator', 'should i move or renew my lease', 'moving break even calculator', 'rent renewal vs moving cost', 'is it worth moving for cheaper rent'],
  updated: '2026-11-24',
  inputs: [
    { id: 'renewRent', label: 'Renewal rent per month', type: 'number', prefix: '$', default: 1950, min: 0, step: 25, info: 'The rent your landlord offers if you stay.' },
    { id: 'newRent', label: 'New place rent per month', type: 'number', prefix: '$', default: 1700, min: 0, step: 25, info: 'The rent at the place you would move to.' },
    { id: 'moveCost', label: 'One-off cost of moving', type: 'number', prefix: '$', default: 2400, min: 0, step: 100, info: 'Movers, deposits you will not get back, overlap rent, cleaning and fees.' },
    { id: 'months', label: 'Months you expect to stay', type: 'number', suffix: 'months', default: 24, min: 1, max: 600, step: 1, info: 'How long you would live in the new place.' },
  ],
  outputs: [
    { id: 'net', label: 'Net gain from moving over your stay', format: 'currency', primary: true, info: 'Monthly saving × months − moving cost. Negative means staying is cheaper.' },
    { id: 'saving', label: 'Rent saving per month', format: 'currency', info: 'Renewal rent − new rent. Negative means the new place costs more.' },
    { id: 'breakEven', label: 'Break-even', format: 'number', precision: 1, suffix: 'months', info: 'Moving cost ÷ monthly saving. Shown as 0 when the new place saves nothing, so moving never pays back.' },
    { id: 'stayCost', label: 'Rent if you renew', format: 'currency', info: 'Renewal rent × months.' },
    { id: 'moveTotal', label: 'Rent plus moving cost if you move', format: 'currency', info: 'New rent × months + moving cost.' },
  ],
  compute: (v) => {
    const r = num(v.renewRent), n = num(v.newRent), c = num(v.moveCost), m = num(v.months);
    if ([r, n, c, m].some((x) => x === null)) return { net: null };
    if ([r, n, c].some((x) => (x as number) < 0)) return { net: null, error: 'Values cannot be negative.' };
    if ((m as number) < 1) return { net: null, error: 'Enter at least 1 month.' };
    const saving = (r as number) - (n as number);
    const stayCost = (r as number) * (m as number);
    const moveTotal = (n as number) * (m as number) + (c as number);
    const net = stayCost - moveTotal;
    const never = saving <= 0;
    const breakEven = never ? 0 : (c as number) / saving;
    const pays = net >= 0;
    return {
      net, saving, breakEven, stayCost, moveTotal,
      tone: pays ? 'good' : 'warn',
      badge: never
        ? 'Moving never pays back on rent alone'
        : pays
          ? `Moving pays back after ${breakEven.toFixed(1)} months`
          : `Staying is ${usd(-net)} cheaper over ${m} months`,
      chart: {
        type: 'bar',
        title: `Total cost over ${m} months`,
        categories: ['Renew', 'Move'],
        series: [{ name: 'Total', values: [stayCost, moveTotal] }],
        format: { format: 'currency' },
      },
      steps: [
        `Monthly saving: ${usd(r as number)} − ${usd(n as number)} = ${usd(saving)}`,
        never ? 'The new place is not cheaper, so the moving cost is never recovered.' : `Break-even: ${usd(c as number)} ÷ ${usd(saving)} = ${breakEven.toFixed(1)} months`,
        `Renew: ${usd(r as number)} × ${m} = ${usd(stayCost)}`,
        `Move: ${usd(n as number)} × ${m} + ${usd(c as number)} = ${usd(moveTotal)}`,
        `Net gain from moving: ${usd(stayCost)} − ${usd(moveTotal)} = ${usd(net)}`,
      ],
      note: 'Rent and moving cost only. It ignores commute, utilities, rent increases at the new place, lease-break fees and how much you like each home.',
    };
  },
  content: {
    formula: [
      'Monthly saving = renewal rent − new rent',
      'Break-even months = moving cost ÷ monthly saving (only if the saving is above 0)',
      'Net gain = monthly saving × months − moving cost',
    ],
    body: [
      'A cheaper apartment only helps if it saves enough to cover the cost of getting there. Movers, deposits you will not get back, overlap rent and cleaning can add up to a few months of savings before you come out ahead.',
      'Enter the renewal rent, the new rent, the total one-off cost of moving and how long you expect to stay. The break-even shows how many months of savings it takes to recover the cost, and the net shows where you land by the end of your stay.',
      'Everything here is an input you estimate. Check your lease for notice rules and fees before deciding.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'Renewing at $1,950 vs moving to $1,700 saves $250 a month. A $2,400 move breaks even after 9.6 months, and over 24 months you gain $250 × 24 − $2,400 = $3,600.' },
      { q: 'What if the new place costs more?', a: 'Then the monthly saving is zero or negative, the move never pays back on rent alone, and the break-even shows 0. Moving would be for other reasons.' },
      { q: 'What counts as moving cost?', a: 'Movers or truck rental, deposits you will not get back, rent paid on both places during the overlap, cleaning, utility setup and any fees.' },
      { q: 'Does it include rent increases later?', a: 'No. It assumes both rents stay flat. If either is likely to rise, compare again with the higher rent.' },
    ],
    sources: [
      { label: 'Consumer Financial Protection Bureau: Renting a home', url: 'https://www.consumerfinance.gov/consumer-tools/renting/' },
    ],
  },
  related: ['rent-increase-impact', 'moving-cost', 'lease-break-cost'],
  examples: [
    // saving 250, break-even 2400/250 = 9.6, net = 250*24 - 2400 = 3600
    { values: { renewRent: 1950, newRent: 1700, moveCost: 2400, months: 24 }, expect: { net: 3600, saving: 250, breakEven: 9.6, stayCost: 46800, moveTotal: 43200 }, tolerance: 0.01 },
    // saving 100, be 12, net 100*6 - 1200 = -600
    { values: { renewRent: 1500, newRent: 1400, moveCost: 1200, months: 6 }, expect: { net: -600, saving: 100, breakEven: 12 }, tolerance: 0.01 },
    // new place dearer: saving -100, be 0, net -100*12 - 500 = -1700
    { values: { renewRent: 1000, newRent: 1100, moveCost: 500, months: 12 }, expect: { net: -1700, saving: -100, breakEven: 0 }, tolerance: 0.01 },
  ],
});
