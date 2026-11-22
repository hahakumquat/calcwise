import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'home-sale-net-proceeds',
  title: 'Home Sale Net Proceeds Calculator',
  category: 'finance',
  description: 'Estimate the cash you keep when you sell a home after agent commission, closing costs, mortgage payoff and repairs, or find the price you need for a target.',
  keywords: ['home sale net proceeds', 'house sale proceeds calculator', 'how much will i net selling my house', 'seller closing costs calculator', 'sale price needed to net', 'selling costs estimate'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'price', label: 'Sale price', type: 'number', prefix: '$', default: 400000, min: 0, step: 1000, info: 'The price the buyer pays.' },
    { id: 'payoff', label: 'Mortgage payoff', type: 'number', prefix: '$', default: 250000, min: 0, step: 1000, optional: true, info: 'What you still owe, from your lender\'s payoff quote. Leave blank if none.' },
    { id: 'commission', label: 'Agent commission', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.25, optional: true, info: 'Total commission as a percent of the sale price. Negotiable and varies.' },
    { id: 'closing', label: 'Other seller closing costs', type: 'number', suffix: '%', default: 1.5, min: 0, max: 20, step: 0.25, optional: true, info: 'Title, transfer taxes and similar, as a percent of price. Varies by place.' },
    { id: 'credits', label: 'Repairs and credits to the buyer', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, optional: true, info: 'Repairs and concessions you agree to pay.' },
    { id: 'target', label: 'Target cash in hand', type: 'number', prefix: '$', min: 0, step: 1000, optional: true, info: 'Optional. Enter what you want to net to see the price needed.' },
  ],
  outputs: [
    { id: 'net', label: 'Net proceeds', format: 'currency', precision: 0, primary: true, info: 'Price − commission − closing costs − credits − mortgage payoff.' },
    { id: 'costs', label: 'Selling costs', format: 'currency', precision: 0, info: 'Commission plus other closing costs plus repairs and credits.' },
    { id: 'needed', label: 'Price needed for your target', format: 'currency', precision: 0, info: '(Target + payoff + credits) ÷ (1 − commission − closing). Only shown if you set a target.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const payoff = num(v.payoff) ?? 0;
    const commission = (num(v.commission) ?? 0) / 100;
    const closing = (num(v.closing) ?? 0) / 100;
    const credits = num(v.credits) ?? 0;
    const target = num(v.target);
    if (price === null || price <= 0) return { net: null };
    if (payoff < 0 || commission < 0 || closing < 0 || credits < 0 || (target !== null && target < 0)) return { net: null };
    if (commission + closing >= 1) return { net: null, error: 'Commission and closing costs must add up to less than 100%.' };
    const pctCosts = price * (commission + closing);
    const costs = pctCosts + credits;
    const net = price - costs - payoff;
    const needed = target !== null ? (target + payoff + credits) / (1 - commission - closing) : null;
    return {
      net,
      costs,
      needed,
      tone: net >= 0 ? 'good' : 'bad',
      badge: `${money(net)} in your pocket`,
      note: `Selling at ${money(price)} costs ${money(costs)} in commission, closing costs and credits. After the ${money(payoff)} payoff you keep ${money(net)}.${needed !== null ? ` To net ${money(target ?? 0)} you need a price of ${money(needed)}.` : ''} Capital gains tax is not included.`,
      chart: net >= 0
        ? {
            type: 'donut',
            title: 'Where the sale price goes',
            slices: [
              { label: 'You keep', value: net },
              { label: 'Mortgage payoff', value: payoff },
              { label: 'Commission', value: price * commission },
              { label: 'Closing costs', value: price * closing },
              { label: 'Repairs and credits', value: credits },
            ].filter((s) => s.value > 0),
            format: { format: 'currency', precision: 0 },
            centerLabel: 'Sale price',
            centerValue: money(price),
          }
        : undefined,
      steps: [
        `Costs = ${money(price)} × (${commission * 100}% + ${closing * 100}%) + ${money(credits)} = ${money(costs)}`,
        `Net = ${money(price)} − ${money(costs)} − ${money(payoff)} = ${money(net)}`,
        ...(needed !== null ? [`Price for target = (${money(target ?? 0)} + ${money(payoff)} + ${money(credits)}) ÷ (1 − ${(commission + closing) * 100}%) = ${money(needed)}`] : []),
      ],
    };
  },
  content: {
    formula: [
      'Net = price × (1 − commission − closing) − credits − mortgage payoff',
      'Price for a target = (target + payoff + credits) ÷ (1 − commission − closing)',
    ],
    body: [
      'The sale price is not what you take home. Agent commission and closing costs come off the top as a share of the price, then any repairs or credits you agreed to, and then the mortgage is paid off. What is left is your net proceeds.',
      'Example: a $400,000 sale with a $250,000 payoff, 5% commission, 1.5% other closing costs and $3,000 of repairs. Commission and closing costs come to $26,000, plus $3,000 of repairs, so costs are $29,000 and net proceeds are $400,000 − $29,000 − $250,000 = $121,000. To net exactly $121,000, the price needed is ($121,000 + $250,000 + $3,000) ÷ 0.935 = $400,000.',
      'Commission and closing cost rates vary by place and deal, so every figure here is yours to set. Capital gains tax, prorated property tax and moving costs are not included. This is an estimate, not tax or legal advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate net proceeds from selling a house?', a: 'Take the sale price, subtract commission and closing costs (percentages of the price), repairs and credits, and the mortgage payoff. The example nets $121,000.' },
      { q: 'What price do I need to net a specific amount?', a: '(Target + payoff + credits) ÷ (1 − commission − closing). Enter a target above and the calculator does it for you.' },
      { q: 'Does this include capital gains tax?', a: 'No. Tax depends on your gain and situation, so it is left out.' },
      { q: 'What commission and closing cost rates should I use?', a: 'Use the figures in your listing agreement and your agent\'s estimate. They vary and are not assumed; 5% and 1.5% above are only examples.' },
    ],
    sources: [],
  },
  related: ['mortgage', 'extra-mortgage-payment', 'rent-vs-buy', 'capital-gains-tax', 'mortgage-points'],
  examples: [
    // costs 400000*0.065 = 26000 + 3000 = 29000; net 400000-29000-250000 = 121000; needed (121000+250000+3000)/0.935 = 400000
    { values: { price: 400000, payoff: 250000, commission: 5, closing: 1.5, credits: 3000, target: 121000 }, expect: { costs: 29000, net: 121000, needed: 400000 }, tolerance: 1e-4 },
    // no payoff: 200000*(1-0.06) = 188000
    { values: { price: 200000, commission: 6, closing: 0 }, expect: { costs: 12000, net: 188000 }, tolerance: 1e-6 },
  ],
});
