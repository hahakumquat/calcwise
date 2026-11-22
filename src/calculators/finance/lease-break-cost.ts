import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'lease-break-cost',
  title: 'Lease Break Cost Calculator',
  category: 'finance',
  description: 'Compare the cost of breaking a lease early: a fee clause in months of rent versus paying until the landlord re-lets, against staying put to the end.',
  keywords: ['lease break cost calculator', 'cost to break a lease', 'early lease termination fee', 'break lease re-letting fee', 'how much to break a lease', 'end lease early'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'remaining', label: 'Months remaining on lease', type: 'number', default: 8, min: 0, step: 1, suffix: 'months', info: 'Full months left until the lease ends.' },
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', default: 1500, min: 0, step: 50, info: 'Rent you pay each month.' },
    { id: 'feeMonths', label: 'Fee clause', type: 'number', default: 2, min: 0, step: 0.5, suffix: 'months of rent', info: 'Early-termination fee in months of rent. Enter 0 if your lease has none.' },
    { id: 'relet', label: 'Months until re-let', type: 'number', default: 2, min: 0, step: 1, suffix: 'months', info: 'How long you expect to keep paying until a new tenant starts.' },
    { id: 'reletFee', label: 'Re-letting fee', type: 'number', prefix: '$', default: 750, min: 0, step: 50, info: 'Advertising or agent fee the landlord charges to find a replacement.' },
  ],
  outputs: [
    { id: 'cheaper', label: 'Cheaper way out', format: 'currency', precision: 0, primary: true, info: 'The lower of the fee route and the re-let route.' },
    { id: 'feeRoute', label: 'Fee route', format: 'currency', precision: 0, info: 'Fee months × monthly rent.' },
    { id: 'reletRoute', label: 'Re-let route', format: 'currency', precision: 0, info: 'Months until re-let × rent + re-letting fee.' },
    { id: 'stay', label: 'Staying to the end (reference)', format: 'currency', precision: 0, info: 'Months remaining × monthly rent.' },
  ],
  compute: (v) => {
    const rem = num(v.remaining);
    const rent = num(v.rent);
    const fm = num(v.feeMonths);
    const rl = num(v.relet);
    const rf = num(v.reletFee);
    if (rem === null || rent === null || fm === null || rl === null || rf === null) return { cheaper: null };
    if (rem < 0 || rent <= 0 || fm < 0 || rl < 0 || rf < 0) return { cheaper: null };
    const feeRoute = fm * rent;
    const reletRoute = rl * rent + rf;
    const stay = rem * rent;
    const cheaper = Math.min(feeRoute, reletRoute);
    const winner = feeRoute < reletRoute ? 'the fee route' : reletRoute < feeRoute ? 'the re-let route' : 'either route';
    const saved = stay - cheaper;
    return {
      cheaper,
      feeRoute,
      reletRoute,
      stay,
      tone: saved > 0 ? 'good' : 'warn',
      badge: feeRoute === reletRoute ? 'Both routes cost the same' : `${feeRoute < reletRoute ? 'Fee route' : 'Re-let route'} is cheaper`,
      note: `The fee route costs ${money(feeRoute)} and the re-let route costs ${money(reletRoute)}, so ${winner} is cheaper at ${money(cheaper)}. Staying to the end costs ${money(stay)}${saved > 0 ? `, so leaving early costs ${money(saved)} less in rent` : `, which is no more than leaving early`}. Terms vary by lease and local law; this is not legal advice.`,
      chart: {
        type: 'bar',
        title: 'Cost by option',
        categories: ['Fee route', 'Re-let route', 'Stay'],
        series: [{ name: 'Cost', values: [feeRoute, reletRoute, stay] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Fee route = ${fm} months × ${money(rent)} = ${money(feeRoute)}`,
        `Re-let route = ${rl} months × ${money(rent)} + ${money(rf)} = ${money(reletRoute)}`,
        `Staying = ${rem} months × ${money(rent)} = ${money(stay)}`,
      ],
    };
  },
  content: {
    formula: [
      'Fee route = fee months × monthly rent',
      'Re-let route = months until re-let × monthly rent + re-letting fee',
      'Staying (reference) = months remaining × monthly rent',
    ],
    body: [
      'Breaking a lease usually follows one of two paths. Some leases state a fee, often one or two months of rent, that ends your obligation. Others make you pay rent until the landlord finds a new tenant, plus a re-letting or advertising fee. This calculator prices both and shows which is cheaper.',
      'Example: 8 months left at $1,500 a month. A 2-month fee clause costs $3,000. Paying 2 months until a replacement moves in plus a $750 re-letting fee costs $3,750. Staying to the end would cost $12,000 in rent. The fee route is cheaper by $750.',
      'Terms vary by lease and local law, and many places require landlords to try to re-let. This is not legal advice, so read your lease and check your local rules. Deposits, notice periods and unpaid-rent claims are not included. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does it cost to break a lease?', a: 'It depends on the lease. With a fee clause, fee months × rent: 2 months at $1,500 is $3,000. Without one, you may pay rent until re-let plus a fee: 2 months × $1,500 + $750 is $3,750.' },
      { q: 'Which route is cheaper?', a: 'The calculator compares the two totals and reports the lower. In the example the fee route ($3,000) beats the re-let route ($3,750).' },
      { q: 'How does breaking compare with staying?', a: 'Staying means paying every remaining month. With 8 months at $1,500 that is $12,000, much more than either route in the example, though you would also keep the home.' },
      { q: 'Is this legal advice?', a: 'No. Lease terms and local law vary, including whether landlords must re-let. Check your lease and local rules.' },
    ],
    sources: [],
  },
  related: ['prorated-rent', 'moving-cost', 'rent-increase-impact', 'rent-vs-buy', 'rent-affordability', 'rent-split'],
  examples: [
    // fee 2 x 1500 = 3000; re-let 2 x 1500 + 750 = 3750; stay 8 x 1500 = 12000; cheaper 3000
    { values: { remaining: 8, rent: 1500, feeMonths: 2, relet: 2, reletFee: 750 }, expect: { feeRoute: 3000, reletRoute: 3750, stay: 12000, cheaper: 3000 }, tolerance: 1e-6 },
    // no fee clause: 0 fee route; re-let 1 x 1000 + 0 = 1000; stay 6000
    { values: { remaining: 6, rent: 1000, feeMonths: 0, relet: 1, reletFee: 0 }, expect: { feeRoute: 0, reletRoute: 1000, stay: 6000, cheaper: 0 }, tolerance: 1e-6 },
  ],
});
