import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'price-adjustment-refund',
  title: 'Price Adjustment Refund: Is the Claim Worth It?',
  category: 'finance',
  description: 'Work out the refund when a price drops after you buy, subtract the time it takes to claim, and see how many days of the window are left.',
  keywords: ['price adjustment calculator', 'price drop refund', 'price match after purchase', 'black friday price adjustment', 'is a price adjustment worth it'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'paid', label: 'Price you paid (each)', type: 'number', prefix: '$', default: 249.99, min: 0, step: 1, info: 'The unit price on your receipt.' },
    { id: 'now', label: 'Current lower price (each)', type: 'number', prefix: '$', default: 199.99, min: 0, step: 1, info: 'The price now, from the same store.' },
    { id: 'qty', label: 'Quantity', type: 'number', default: 2, min: 1, step: 1, info: 'How many you bought.' },
    { id: 'minutes', label: 'Minutes to make the claim', type: 'number', suffix: 'min', default: 15, min: 0, step: 5, info: 'Chat, phone or in-store time, including finding the receipt.' },
    { id: 'rate', label: 'Value of an hour of your time', type: 'number', prefix: '$', default: 20, min: 0, step: 1, info: 'What an hour is worth to you. Use 0 to ignore time.' },
    { id: 'window', label: 'Store policy window', type: 'number', suffix: 'days', default: 14, min: 0, step: 1, info: 'Days after purchase the store allows a price adjustment. Check the store\'s policy; many exclude some items.' },
    { id: 'since', label: 'Days since you bought it', type: 'number', suffix: 'days', default: 6, min: 0, step: 1, info: 'Count from the purchase date.' },
  ],
  outputs: [
    { id: 'net', label: 'Net gain from claiming', format: 'currency', precision: 2, primary: true, info: 'Refund minus the value of your time.' },
    { id: 'refund', label: 'Refund', format: 'currency', precision: 2, info: '(Price paid − current price) × quantity.' },
    { id: 'timeCost', label: 'Time cost', format: 'currency', precision: 2, info: 'Minutes ÷ 60 × value of an hour.' },
    { id: 'drop', label: 'Price drop', format: 'percent', precision: 1, info: 'Drop as a share of the price you paid.' },
    { id: 'left', label: 'Days left in the window', format: 'number', precision: 0, suffix: 'days', info: 'Window minus days since purchase, never below zero.' },
  ],
  compute: (v) => {
    const paid = num(v.paid);
    const now = num(v.now);
    const qty = num(v.qty);
    const minutes = num(v.minutes);
    const rate = num(v.rate);
    const win = num(v.window);
    const since = num(v.since);
    if (paid === null || now === null || qty === null || minutes === null || rate === null || win === null || since === null) return { net: null };
    if (paid <= 0 || now < 0 || qty < 1 || minutes < 0 || rate < 0 || win < 0 || since < 0) return { net: null };
    const refund = Math.max(0, paid - now) * qty;
    const timeCost = minutes / 60 * rate;
    const net = refund - timeCost;
    const drop = Math.max(0, paid - now) / paid;
    const left = Math.max(0, win - since);
    const expired = left === 0;
    const dropped = now < paid;
    const worth = net > 0;
    const tone = !dropped ? 'warn' : expired ? 'warn' : worth ? 'ok' : 'warn';
    const note = !dropped
      ? 'The current price is not lower than what you paid, so there is nothing to claim.'
      : expired
        ? `The price dropped ${fmt(drop * 100, 1)}%, a ${money(refund)} refund, but the ${fmt(win, 0)}-day window has passed. Some stores still help if you ask; the policy is theirs.`
        : worth
          ? `Claiming a ${money(refund)} refund takes about ${fmt(minutes, 0)} minutes, worth ${money(timeCost)} to you, so you net ${money(net)}. You have ${fmt(left, 0)} day${left === 1 ? '' : 's'} left in the window.`
          : `The ${money(refund)} refund is smaller than the ${money(timeCost)} your time is worth, so claiming nets ${money(net)}. It may still be worth it if you do not value the time.`;
    return {
      net,
      refund,
      timeCost,
      drop,
      left,
      tone,
      badge: !dropped ? 'No drop' : expired ? 'Window passed' : worth ? `${money(net)} net` : 'Not worth it',
      note,
      chart: {
        type: 'bar' as const,
        title: 'Refund vs the cost of your time',
        categories: ['Refund', 'Time cost', 'Net gain'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Amount', values: [refund, timeCost, net] }],
      },
      steps: [
        `Refund = (${money(paid)} − ${money(now)}) × ${fmt(qty, 0)} = ${money(refund)}`,
        `Time cost = ${fmt(minutes, 0)} ÷ 60 × ${money(rate)} = ${money(timeCost)}`,
        `Net = ${money(refund)} − ${money(timeCost)} = ${money(net)}`,
        `Price drop = ${fmt(drop * 100, 1)}%; days left = ${fmt(win, 0)} − ${fmt(since, 0)} = ${fmt(left, 0)}`,
      ],
    };
  },
  content: {
    formula: [
      'Refund = (price paid − current price) × quantity',
      'Time cost = minutes ÷ 60 × value of an hour',
      'Net gain = refund − time cost',
      'Days left = policy window − days since purchase',
    ],
    body: [
      'Prices often fall again soon after a big sale. Some stores will refund the difference if you ask within a set window. This calculator turns that into a number: the refund, what the claim costs in time, and how many days you have left.',
      'Example: you paid $249.99 each for 2 items and the price is now $199.99. The refund is $100.00. A 15-minute claim at $20 an hour costs $5.00 of time, so you net $95.00. The drop is 20.0%, and with a 14-day window and 6 days gone, 8 days are left.',
      'Window lengths and exclusions vary by store, so enter your store\'s own policy. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is a price adjustment?', a: 'It is a refund of the difference when an item you bought goes on sale at the same store within a set period. At $249.99 paid and $199.99 now, that is $50.00 per item.' },
      { q: 'How long is the window?', a: 'It depends on the store; 14 days is only an example. Enter the number from your store\'s policy.' },
      { q: 'Is it worth the time?', a: 'Compare the refund with minutes ÷ 60 × your hourly value. For $100.00 and 15 minutes at $20 an hour, the net is $95.00.' },
      { q: 'Does this cover price matching a competitor?', a: 'No. It covers a drop at the store where you bought. Competitor price matching has its own rules.' },
      { q: 'What if the window has passed?', a: 'The calculator shows the refund but flags that the window is over. Some stores make exceptions, but that is up to them.' },
    ],
    sources: [],
  },
  related: ['black-friday-deal-check', 'discount', 'real-hourly-wage', 'free-shipping-threshold'],
  examples: [
    // refund 50*2=100; time 15/60*20=5; net 95; drop 50/249.99=0.200008; left 8
    { values: { paid: 249.99, now: 199.99, qty: 2, minutes: 15, rate: 20, window: 14, since: 6 }, expect: { refund: 100, timeCost: 5, net: 95, drop: 0.2, left: 8 }, tolerance: 0.001 },
    // refund 10; time 30/60*20=10; net 0; drop 0.1; window over -> 0
    { values: { paid: 100, now: 90, qty: 1, minutes: 30, rate: 20, window: 14, since: 20 }, expect: { refund: 10, timeCost: 10, net: 0, drop: 0.1, left: 0 } },
  ],
});
