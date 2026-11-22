import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'warehouse-membership-break-even',
  title: 'Warehouse Club Membership Break-Even Calculator',
  category: 'finance',
  description: 'See whether a warehouse club membership pays for itself: net savings after the annual fee, and the yearly spend where the fee breaks even.',
  keywords: ['warehouse club membership worth it', 'costco membership break even', 'sams club membership calculator', 'bulk store membership savings', 'membership fee break even spend'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'fee', label: 'Annual membership fee', type: 'number', prefix: '$', default: 65, min: 0, step: 1, info: 'The yearly fee for your membership level.' },
    { id: 'spend', label: 'Yearly spend at the club', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'What you expect to buy there in a year.' },
    { id: 'pct', label: 'Savings vs your usual store', type: 'number', default: 12, min: 0, max: 100, step: 0.5, suffix: '%', info: 'Your own estimate. Compare a few regular items to get it.' },
    { id: 'extra', label: 'Extra unplanned spend', type: 'number', prefix: '$', default: 80, min: 0, step: 10, info: 'Things you would not otherwise have bought. Be honest.' },
  ],
  outputs: [
    { id: 'net', label: 'Net savings per year', format: 'currency', precision: 2, primary: true, info: 'Saved − fee − extra spend. Negative means it costs you.' },
    { id: 'saved', label: 'Saved on purchases', format: 'currency', precision: 2, info: 'Yearly spend × savings %.' },
    { id: 'breakeven', label: 'Break-even yearly spend', format: 'currency', precision: 2, info: 'Fee ÷ savings %. Spend above this covers the fee.' },
    { id: 'monthly', label: 'Break-even per month', format: 'currency', precision: 2, info: 'Break-even yearly spend ÷ 12.' },
  ],
  compute: (v) => {
    const fee = num(v.fee), spend = num(v.spend), pct = num(v.pct), extra = num(v.extra);
    if (fee === null || spend === null || pct === null || extra === null) return { net: null };
    if (fee < 0 || spend < 0 || extra < 0 || pct < 0 || pct > 100) return { net: null };
    const saved = spend * (pct / 100);
    const net = saved - fee - extra;
    if (pct === 0) return { net, saved, breakeven: null, monthly: null, error: 'With 0% savings the membership can never pay for itself.' };
    const breakeven = fee / (pct / 100);
    const monthly = breakeven / 12;
    const good = net >= 0;
    return {
      net,
      saved,
      breakeven,
      monthly,
      tone: good ? 'good' : 'bad',
      badge: good ? `Worth it: ${money(net)} ahead` : `Not worth it: ${money(-net)} behind`,
      note: `Buying ${money(spend)} a year at ${fmt(pct, 1)}% savings saves ${money(saved)}. After the ${money(fee)} fee and ${money(extra)} of extra spending you are ${net >= 0 ? money(net) + ' ahead' : money(-net) + ' behind'}. The fee alone breaks even at ${money(breakeven)} a year (${money(monthly)} a month).`,
      chart: {
        type: 'bar',
        title: 'Net savings at different yearly spend',
        categories: ['50%', '100%', '150%', '200%'],
        series: [{ name: 'Net', values: [0.5, 1, 1.5, 2].map((m) => spend * m * (pct / 100) - fee - extra) }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Saved = ${money(spend)} × ${fmt(pct, 1)}% = ${money(saved)}`,
        `Net = ${money(saved)} − ${money(fee)} − ${money(extra)} = ${money(net)}`,
        `Break-even spend = ${money(fee)} ÷ ${fmt(pct, 1)}% = ${money(breakeven)} a year`,
      ],
    };
  },
  content: {
    formula: [
      'Saved = yearly spend × savings %',
      'Net savings = saved − annual fee − extra unplanned spend',
      'Break-even yearly spend = annual fee ÷ savings %',
    ],
    body: [
      'A club membership is a fee you pay up front to get lower prices later. It pays off only if what you save on things you would buy anyway is more than the fee, and more than what you spend on extras you did not plan to buy.',
      'Example: a $65 fee, $1,800 a year spent at the club, 12% cheaper than your usual store, and $80 of unplanned extras. You save $216, so net is $216 − $65 − $80 = $71. The fee breaks even at $65 ÷ 12% = $541.67 a year, or $45.14 a month.',
      'The savings percentage is your own estimate, so check a handful of regular items. Perks such as gas discounts or member rewards are not included. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I know if a warehouse membership is worth it?', a: 'Divide the annual fee by your savings percentage. If you spend more than that at the club each year, and do not overbuy, the fee pays for itself.' },
      { q: 'What is the break-even spend for a $65 fee?', a: 'At 12% savings it is $541.67 a year, or $45.14 a month. At 6% savings it doubles to $1,083.33.' },
      { q: 'Why include extra unplanned spend?', a: 'Bulk stores make it easy to buy things you did not need. That spending cancels out savings, so it belongs in the sum.' },
      { q: 'Does this include gas or other perks?', a: 'No. Add their value to your savings percentage estimate if you use them regularly.' },
    ],
    sources: [],
  },
  related: ['unit-price', 'break-even', 'price-hike-impact', 'subscription-cost'],
  examples: [
    // saved 1800*.12 = 216; net 216-65-80 = 71; breakeven 65/.12 = 541.6667; monthly 45.1389
    { values: { fee: 65, spend: 1800, pct: 12, extra: 80 }, expect: { saved: 216, net: 71, breakeven: 541.6667, monthly: 45.1389 }, tolerance: 1e-3 },
    // saved 600*.05 = 30; net 30-120-0 = -90; breakeven 2400; monthly 200
    { values: { fee: 120, spend: 600, pct: 5, extra: 0 }, expect: { saved: 30, net: -90, breakeven: 2400, monthly: 200 }, tolerance: 1e-6 },
  ],
});
