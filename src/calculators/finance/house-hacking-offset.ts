import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'house-hacking-offset',
  title: 'House Hacking Calculator',
  seoTitle: 'House Hacking Calculator',
  metaDescription: 'Rent out a room and see your net housing cost: rent after vacancy and costs, what you still pay each month, and the share of the payment covered.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Work out your net monthly housing cost after renting a room or unit, with vacancy and extra costs taken off the rent, and how much of your payment the tenant covers.',
  keywords: ['house hacking calculator', 'rent a room to pay mortgage', 'mortgage offset by rent', 'net housing cost with tenant', 'house hacking numbers'],
  popular: false,
  inputs: [
    { id: 'payment', label: 'Housing payment per month', type: 'number', prefix: '$', default: 2400, min: 0, step: 50, info: 'Mortgage, property tax and insurance together.' },
    { id: 'rent', label: 'Rent you receive per month', type: 'number', prefix: '$', default: 900, min: 0, step: 25, info: 'Total rent from the room or unit when it is occupied.' },
    { id: 'vacancy', label: 'Vacancy', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 1, info: 'Share of the time the room sits empty. Use your own estimate.' },
    { id: 'costs', label: 'Extra costs per month', type: 'number', prefix: '$', default: 150, min: 0, step: 10, info: 'Utilities, repairs and anything else the tenant adds.' },
  ],
  outputs: [
    { id: 'net', label: 'Your net housing cost per month', format: 'currency', precision: 2, primary: true, info: 'Payment - net rent. Negative means the rent more than covers the payment.' },
    { id: 'netRent', label: 'Net rent per month', format: 'currency', precision: 2, info: 'Rent × (1 - vacancy) - extra costs.' },
    { id: 'yearly', label: 'Your net housing cost per year', format: 'currency', info: 'Net housing cost × 12.' },
    { id: 'covered', label: 'Share of the payment covered', format: 'number', precision: 1, suffix: '%', info: 'Net rent ÷ payment.' },
  ],
  compute: (v) => {
    const payment = num(v.payment), rent = num(v.rent), vac = num(v.vacancy), costs = num(v.costs);
    if ([payment, rent, vac, costs].some((x) => x === null)) return { net: null };
    if ([payment!, rent!, vac!, costs!].some((x) => x < 0)) return { net: null, error: 'Amounts cannot be negative.' };
    if (vac! > 100) return { net: null, error: 'Vacancy cannot be over 100%.' };
    const netRent = rent! * (1 - vac! / 100) - costs!;
    const net = payment! - netRent;
    const covered = payment! > 0 ? (netRent / payment!) * 100 : 0;
    return {
      net, netRent, yearly: net * 12, covered,
      tone: netRent > 0 ? 'ok' : 'warn',
      badge: netRent <= 0 ? 'The extra costs cancel out the rent' : `${+covered.toFixed(1)}% of the payment covered`,
      chart: {
        type: 'bar',
        title: 'Monthly housing payment',
        categories: ['Payment', 'Net rent', 'You pay'],
        series: [{ name: 'Per month', values: [payment!, Math.max(netRent, 0), Math.max(net, 0)] }],
        format: { format: 'currency' },
      },
      steps: [
        `Net rent = ${money(rent!, 0)} × (1 - ${vac}%) - ${money(costs!, 0)} = ${money(netRent, 2)}`,
        `Your cost = ${money(payment!, 0)} - ${money(netRent, 2)} = ${money(net, 2)} a month`,
        `Covered = ${money(netRent, 2)} ÷ ${money(payment!, 0)} = ${+covered.toFixed(1)}%`,
      ],
      note: 'Taxes on the rent, landlord rules and lender or insurance conditions are not included. Check them before you rent a room.',
    };
  },
  content: {
    formula: [
      'Net rent = rent × (1 - vacancy) - extra costs',
      'Net housing cost = housing payment - net rent',
      'Share covered = net rent ÷ housing payment',
    ],
    body: [
      'House hacking means living in a property and renting part of it, so a tenant pays down your housing cost. The honest number is not the rent on the lease but what is left after empty months and the costs a tenant adds.',
      'Enter your full housing payment, the rent, a vacancy estimate and extra monthly costs. The result is what you still pay each month and the share of the payment the tenant covers.',
      'This is a cash-flow view only. Income tax on rent, local rules for renting rooms and your lender\'s or insurer\'s conditions can all change the picture, so check them first.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A $2,400 payment, $900 of rent, 5% vacancy and $150 of extra costs gives net rent of $900 × 0.95 - $150 = $705.',
          'You pay $2,400 - $705 = $1,695 a month, or $20,340 a year, and the tenant covers $705 ÷ $2,400 = 29.4% of the payment.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The rent split calculator divides one rent between people, and the cash on cash return calculator values a whole rental property.',
        ],
      },
    ],
    faq: [
      { q: 'How do I calculate house hacking income?', a: 'Take the rent, remove the share lost to vacancy, then subtract extra costs. $900 at 5% vacancy less $150 is $705 a month.' },
      { q: 'What vacancy should I use?', a: 'It depends on your area and how you find tenants. Five to ten percent is a common planning guess, but use your own figure.' },
      { q: 'Is rent income taxed?', a: 'Often yes, but rules differ. This calculator does not model tax, so account for it separately.' },
      { q: 'Can the rent cover the whole payment?', a: 'If net rent is at least the payment, your net cost is zero or negative. The result shows a negative number in that case.' },
    ],
    sources: [],
  },
  related: ['rent-split', 'cash-on-cash-return', 'mortgage', 'rent-vs-buy'],
  examples: [
    // 900*.95=855-150=705; 2400-705=1695; yearly 20340; 705/2400=29.375%
    { values: { payment: 2400, rent: 900, vacancy: 5, costs: 150 }, expect: { netRent: 705, net: 1695, yearly: 20340, covered: 29.375 }, tolerance: 1e-6 },
    // 3000 rent, 0 vacancy, 500 costs -> 2500 net rent; payment 2000 -> net -500
    { values: { payment: 2000, rent: 3000, vacancy: 0, costs: 500 }, expect: { netRent: 2500, net: -500, covered: 125 }, tolerance: 1e-6 },
  ],
});
