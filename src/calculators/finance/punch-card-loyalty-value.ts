import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number) => `${(+(n * 100).toFixed(1)).toLocaleString('en-US')}%`;

export default defineCalculator({
  slug: 'punch-card-loyalty-value',
  title: 'Punch Card Loyalty Reward Value Calculator',
  category: 'finance',
  description: 'See the real discount of a punch card or buy-N-get-one-free reward: effective percent off, cost per visit and the value of the free item.',
  keywords: ['punch card calculator', 'loyalty card value', 'buy 9 get 1 free discount', 'stamp card value', 'coffee loyalty card worth it', 'loyalty reward discount'],
  updated: '2026-11-28',
  inputs: [
    { id: 'price', label: 'Price per item', type: 'number', prefix: '$', default: 5, min: 0.01, step: 0.25, info: 'What you pay each visit, for example a coffee.' },
    { id: 'purchases', label: 'Paid purchases before the reward', type: 'number', default: 9, min: 1, step: 1, info: 'How many items you pay for to earn one reward. A "10 punches, the 10th is free" card is 9. A "buy 10, get 1 free" card is 10.' },
    { id: 'reward', label: 'Value of the reward', type: 'number', prefix: '$', default: 5, min: 0, step: 0.25, info: 'What the free item or credit is worth. For a free item at the same price, enter the price again.' },
  ],
  outputs: [
    { id: 'discount', label: 'Effective discount', format: 'percent', precision: 1, primary: true, info: 'Reward ÷ (what you pay + reward): the share of the value you get that you did not pay for.' },
    { id: 'perVisit', label: 'Cost per visit', format: 'currency', info: 'What you pay for a full card ÷ (paid purchases + 1 visit for the reward).' },
    { id: 'freeValue', label: 'Free item value', format: 'currency', info: 'The reward value you entered, shown here for comparison.' },
    { id: 'spend', label: 'You pay per full card', format: 'currency', info: 'Price times the number of paid purchases on one card.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const n = num(v.purchases);
    const reward = num(v.reward);
    if (price === null || n === null || reward === null || price <= 0 || n < 1 || !Number.isInteger(n) || reward < 0) return { discount: null };
    const spend = price * n;
    const discount = reward / (spend + reward);
    const perVisit = spend / (n + 1);
    return {
      discount,
      perVisit,
      freeValue: reward,
      spend,
      tone: discount >= 0.1 ? ('good' as const) : ('ok' as const),
      badge: `${pct(discount)} off`,
      note: `You pay $${fmt(spend)} over ${n} visits and get a $${fmt(reward)} reward, so the card is worth ${pct(discount)}. The card is only a saving if you would have bought these items anyway, and you finish it before it expires.`,
      chart: {
        type: 'bar' as const,
        title: 'Cost per visit ($)',
        categories: ['Regular price', 'With the card'],
        series: [{ name: 'Per visit', values: [price, perVisit] }],
        format: { format: 'currency' as const },
        highlight: 1,
      },
      steps: [
        `You pay per full card = $${fmt(price)} × ${n} = $${fmt(spend)}`,
        `Effective discount = $${fmt(reward)} ÷ ($${fmt(spend)} + $${fmt(reward)}) = ${pct(discount)}`,
        `Cost per visit = $${fmt(spend)} ÷ (${n} + 1) = $${fmt(perVisit)}`,
      ],
    };
  },
  content: {
    formula: [
      'You pay per card = price × paid purchases',
      'Effective discount = reward ÷ (you pay per card + reward)',
      'Cost per visit = you pay per card ÷ (paid purchases + 1)',
    ],
    body: [
      'A punch card feels like a freebie, but it is a discount you can measure. You pay for a set number of items, then get one reward. This calculator turns that into a percent off and a cost per visit so you can compare it with other deals.',
      'Check the wording on your card, because it changes the number. A "10 punches, the 10th is free" card means you pay for 9 and the 10th is free, so enter 9. A "buy 10, get 1 free" card means you pay for 10 and get an 11th free, so enter 10. The first is 10% off a $5 item, the second is 9.1%.',
      'Example: a $5 item, 9 paid purchases and a $5 free item. You pay $45 and receive $50 of value, so the discount is 5 ÷ 50 = 10%. The cost per visit is $45 ÷ 10 = $4.50. The calculator assumes you redeem the reward as one extra visit at the same worth and complete the card. A card that expires, or one you stop using, saves less. It also does not count extra items you buy only to fill the card. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much is a "buy 9 get 1 free" card worth?', a: 'With a $5 item and a $5 reward you pay $45 for $50 of value, which is 5 ÷ 50 = 10% off, or $4.50 per visit.' },
      { q: 'What do I enter for "10th one free"?', a: 'Enter 9 paid purchases. You pay for 9 and the 10th is the reward.' },
      { q: 'What do I enter for "buy 10, get 1 free"?', a: 'Enter 10 paid purchases. You pay for 10 and get an 11th free, which is 1 ÷ 11, or 9.1% off at equal prices.' },
      { q: 'How is the cost per visit worked out?', a: 'What you pay for a full card divided by the paid purchases plus the one visit the reward covers. For $45 over 10 visits that is $4.50.' },
      { q: 'Is a punch card a good deal?', a: 'Only if you would buy the items anyway and finish the card before it expires. Spending extra to fill a card cancels the saving.' },
    ],
    sources: [],
  },
  related: ['buy-n-get-m', 'points-value', 'cash-back-rewards', 'discount', 'cost-per-use'],
  examples: [
    // spend 5*9=45; discount 5/50 = 0.1; per visit 45/10 = 4.5
    { values: { price: 5, purchases: 9, reward: 5 }, expect: { discount: 0.1, perVisit: 4.5, freeValue: 5, spend: 45 }, tolerance: 1e-9 },
    // spend 4.5*7 = 31.5; discount 6/37.5 = 0.16; per visit 31.5/8 = 3.9375
    { values: { price: 4.5, purchases: 7, reward: 6 }, expect: { discount: 0.16, perVisit: 3.9375, spend: 31.5 }, tolerance: 1e-9 },
  ],
});
