import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'cost-per-use',
  title: 'Cost Per Use Calculator',
  category: 'finance',
  description: 'Find what an item really costs each time you use it, and how many uses it takes to beat renting, borrowing or buying a cheaper option each time.',
  keywords: ['cost per use calculator', 'cost per wear', 'is it worth buying', 'cost per use formula', 'buy vs rent break even', 'cost per use of an item'],
  updated: '2026-11-17',
  inputs: [
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 200, min: 0, step: 1, info: 'What you paid, or are about to pay, for the item.' },
    { id: 'running', label: 'Upkeep and running costs', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'Everything else you will spend on it over its life: repairs, cleaning, batteries, subscriptions, accessories.' },
    { id: 'resale', label: 'Resale value at the end', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'What you could sell it for when you are done. Leave at 0 if you would keep or bin it.' },
    { id: 'uses', label: 'Total uses', type: 'number', default: 100, min: 1, step: 1, info: 'How many times you expect to use or wear it in total. Be honest: use what you really did with similar items.' },
    { id: 'alt', label: 'Cost of the alternative per use', type: 'number', prefix: '$', default: 5, min: 0, step: 0.5, info: 'What one use would cost otherwise: a rental, a day pass, a takeaway coffee, a cheaper item. Set to 0 to skip the comparison.' },
  ],
  outputs: [
    { id: 'perUse', label: 'Cost per use', format: 'currency', primary: true, info: '(Price + upkeep − resale value) ÷ total uses.' },
    { id: 'net', label: 'Net cost of owning it', format: 'currency', info: 'Price plus upkeep, minus what you get back at resale.' },
    { id: 'breakeven', label: 'Break-even uses', format: 'number', precision: 1, suffix: 'uses', info: 'Net cost ÷ alternative cost per use. Use it more than this and owning beats the alternative.' },
    { id: 'saving', label: 'Saving vs the alternative', format: 'currency', info: 'Alternative cost × total uses, minus the net cost. Negative means the alternative is cheaper.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const running = num(v.running) ?? 0;
    const resale = num(v.resale) ?? 0;
    const uses = num(v.uses);
    const alt = num(v.alt) ?? 0;
    if (price === null || uses === null || price < 0 || running < 0 || resale < 0 || uses < 1 || alt < 0) return { perUse: null };
    const net = price + running - resale;
    if (net < 0) return { perUse: null, error: 'Resale value is higher than everything you spend, so the item pays for itself. Check your numbers.' };
    const perUse = net / uses;
    const compare = alt > 0;
    const breakeven = compare ? net / alt : null;
    const saving = compare ? alt * uses - net : null;
    const max = Math.max(10, Math.ceil(uses * 2));
    const xs: number[] = [];
    const own: number[] = [];
    const ref: number[] = [];
    for (let k = 1; k <= 20; k++) {
      const u = Math.max(1, Math.round((max * k) / 20));
      if (xs[xs.length - 1] === u) continue;
      xs.push(u);
      own.push(net / u);
      ref.push(alt);
    }
    const series = [{ name: 'Your cost per use', values: own }, ...(compare ? [{ name: 'Alternative', values: ref }] : [])];
    const worth = compare ? perUse < alt : null;
    return {
      perUse,
      net,
      breakeven,
      saving,
      tone: worth === null ? ('ok' as const) : worth ? ('good' as const) : perUse === alt ? ('ok' as const) : ('bad' as const),
      badge: worth === null ? 'Per-use cost' : worth ? 'Worth it' : perUse === alt ? 'Break-even' : 'Not worth it yet',
      note: compare
        ? worth
          ? `Each use costs $${fmt(perUse, 2)}, under the $${fmt(alt, 2)} alternative. Over ${fmt(uses)} uses you come out $${fmt(saving as number, 2)} ahead.`
          : perUse === alt
            ? `Each use costs $${fmt(perUse, 2)}, exactly the alternative, so owning and the alternative cost the same.`
            : `Each use costs $${fmt(perUse, 2)}, more than the $${fmt(alt, 2)} alternative. You need ${fmt(breakeven as number, 1)} uses to break even, against ${fmt(uses)} planned.`
        : `Each use costs $${fmt(perUse, 2)}. Add a cost for the alternative to see how many uses it takes to break even.`,
      chart: {
        type: 'line',
        title: 'Cost per use falls the more you use it',
        x: xs,
        xLabel: 'Total uses',
        yFormat: { format: 'currency' },
        series,
      },
      steps: [
        `Net cost = $${fmt(price, 2)} + $${fmt(running, 2)} − $${fmt(resale, 2)} = $${fmt(net, 2)}`,
        `Cost per use = $${fmt(net, 2)} ÷ ${fmt(uses)} = $${fmt(perUse, 2)}`,
        ...(compare ? [`Break-even uses = $${fmt(net, 2)} ÷ $${fmt(alt, 2)} = ${fmt(breakeven as number, 1)}`] : []),
      ],
    };
  },
  content: {
    formula: [
      'Cost per use = (price + upkeep − resale value) ÷ total uses',
      'Break-even uses = net cost ÷ alternative cost per use',
      'Saving = alternative cost per use × total uses − net cost',
    ],
    body: [
      'A price tag tells you what something costs on day one. Cost per use tells you what it costs each time you actually use it, which is a better way to judge things you buy to keep: boots, a coat, a bike, a blender, a gym bag. A $200 coat worn 100 times costs $2 a wear. A $40 coat worn twice costs $20 a wear.',
      'This calculator adds the purchase price and any upkeep, subtracts what you could sell it for, and divides by how many times you expect to use it. If you give it a price for the alternative, such as renting or paying per visit, it also shows how many uses it takes for owning to win.',
      'The result is only as good as the number of uses you enter. People tend to overestimate how often they will use something new, so use the real figures from similar items you already own. Everything runs in your browser.',
    ],
    sections: [
      {
        heading: 'Why the number of uses matters most',
        paragraphs: [
          'The chart shows the cost per use dropping fast at first and then flattening. The first few uses carry most of the price, so the biggest gains come from making sure you pass the break-even point at all, not from squeezing out the last few uses.',
          'Cost per use is not the whole story. Quality, comfort, repairability and how much you enjoy something all count, and so does the cost of storing it. Use the figure as one input to the decision.',
        ],
      },
    ],
    faq: [
      { q: 'How do you calculate cost per use?', a: 'Add the price and any upkeep, subtract the resale value, then divide by the number of uses. A $200 item with $20 of upkeep and $20 resale value used 100 times costs $200 ÷ 100 = $2.00 per use.' },
      { q: 'How is the break-even number worked out?', a: 'Divide the net cost by what one use of the alternative costs. With a net cost of $200 and an alternative of $5 per use, you break even at 40 uses. Use it more than that and owning is cheaper.' },
      { q: 'What does a negative saving mean?', a: 'It means the alternative would be cheaper over the uses you entered. For $120 used 10 times against an $8 alternative, you spend $120 against $80, so owning costs $40 more.' },
      { q: 'Should I include resale value?', a: 'Only if you realistically expect to sell the item. A bike or a phone often keeps some value; clothes usually keep little. Leave it at 0 to be cautious.' },
    ],
  },
  related: ['subscription-cost', 'latte-factor', 'gym-cost-per-visit', 'break-even', 'unit-price'],
  examples: [
    // net = 200 + 20 − 20 = 200; per use 200 ÷ 100 = 2; break-even 200 ÷ 5 = 40; saving 5 × 100 − 200 = 300.
    { values: { price: 200, running: 20, resale: 20, uses: 100, alt: 5 }, expect: { perUse: 2, net: 200, breakeven: 40, saving: 300 }, tolerance: 1e-9 },
    // net 120; per use 12; break-even 120 ÷ 8 = 15; saving 80 − 120 = −40.
    { values: { price: 120, running: 0, resale: 0, uses: 10, alt: 8 }, expect: { perUse: 12, net: 120, breakeven: 15, saving: -40 }, tolerance: 1e-9 },
  ],
});
