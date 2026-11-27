import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const cents = (n: number) => Math.round(n * 100 + (n >= 0 ? 1e-9 : -1e-9)) / 100;

export default defineCalculator({
  slug: 'gift-card-balance',
  title: 'Gift Card Balance Calculator',
  category: 'finance',
  description: 'Enter your gift card balance, purchases and sales tax to see what is left, the biggest pre-tax item that fits, and the cash top-up for a pricier item.',
  keywords: ['gift card balance calculator', 'gift card remaining balance', 'gift card top up', 'gift card plus cash', 'how much can i spend on gift card with tax'],
  updated: '2026-11-27',
  inputs: [
    { id: 'balance', label: 'Starting gift card balance', type: 'number', prefix: '$', default: 100, min: 0, step: 1, info: 'The amount loaded on the card before any of the purchases below.' },
    { id: 'purchases', label: 'Purchases so far (before tax)', type: 'list', default: '34.50, 28.00', placeholder: 'e.g. 34.50, 28.00', help: 'One pre-tax price per purchase', info: 'The pre-tax price of each item you already bought with this card. Separate with commas, spaces or new lines. Leave empty if you have not spent anything.' },
    { id: 'tax', label: 'Sales tax rate', type: 'number', suffix: '%', default: 8, min: 0, max: 30, step: 0.1, info: 'The tax added at checkout. Enter 0 if there is none. Each purchase is charged price × (1 + tax rate), rounded to the cent.' },
    { id: 'candidate', label: 'Item you want next (before tax)', type: 'number', prefix: '$', default: 35, min: 0, step: 0.5, info: 'The pre-tax price of the item you are considering. Used to work out any cash top-up.' },
  ],
  outputs: [
    { id: 'remaining', label: 'Balance remaining', format: 'currency', primary: true, info: 'Starting balance minus every purchase with tax added. Negative means the purchases cost more than the card held.' },
    { id: 'spent', label: 'Spent so far (with tax)', format: 'currency', info: 'Sum of each purchase × (1 + tax rate).' },
    { id: 'largest', label: 'Largest pre-tax item that fits', format: 'currency', info: 'Balance remaining ÷ (1 + tax rate), rounded down to the cent. Zero if nothing is left.' },
    { id: 'candidateCost', label: 'Your item with tax', format: 'currency', info: 'Item price × (1 + tax rate).' },
    { id: 'topUp', label: 'Cash top-up needed', format: 'currency', info: 'What your item costs with tax beyond the balance remaining. Zero if the card covers it.' },
    { id: 'status', label: 'Result', format: 'text', info: 'Whether the card covers your item.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const taxPct = num(v.tax);
    const candidate = num(v.candidate);
    const list = (Array.isArray(v.purchases) ? (v.purchases as unknown[]) : []).map((p) => Number(p)).filter((p) => Number.isFinite(p));
    if (balance === null || taxPct === null || candidate === null || balance < 0 || taxPct < 0 || candidate < 0 || list.some((p) => p < 0)) return { remaining: null };
    const k = 1 + taxPct / 100;
    const charges = list.map((p) => cents(p * k));
    const spent = cents(charges.reduce((a, b) => a + b, 0));
    const remaining = cents(balance - spent);
    let largest = remaining > 0 ? Math.floor((remaining / k) * 100 + 1e-9) / 100 : 0;
    while (largest > 0 && cents(largest * k) > remaining + 1e-9) largest = cents(largest - 0.01);
    const candidateCost = cents(candidate * k);
    const topUp = Math.max(0, cents(candidateCost - remaining));
    const over = remaining < 0;
    const status = candidate === 0 ? 'No item entered' : topUp === 0 ? 'Card covers it' : `Add $${fmt(topUp)} cash`;
    const itemNote = candidate > 0 ? (topUp === 0 ? ` Your $${fmt(candidate)} item costs $${fmt(candidateCost)} with tax, so the card covers it.` : ` Your $${fmt(candidate)} item costs $${fmt(candidateCost)} with tax, so you would add $${fmt(topUp)}.`) : '';
    return {
      remaining,
      spent,
      largest,
      candidateCost,
      topUp,
      status,
      tone: over ? ('bad' as const) : remaining === 0 ? ('ok' as const) : topUp === 0 ? ('good' as const) : ('warn' as const),
      badge: over ? 'Overspent' : remaining === 0 ? 'Card is empty' : topUp === 0 ? 'Covered' : 'Top-up needed',
      note: over
        ? `Your purchases with tax come to $${fmt(spent)}, which is $${fmt(-remaining)} more than the $${fmt(balance)} on the card. Check the amounts or plan to pay the difference.`
        : `$${fmt(remaining)} is left. The biggest item that fits is $${fmt(largest)} before tax.${itemNote}`,
      chart: {
        type: 'bar',
        title: 'Gift card balance ($)',
        categories: ['Starting balance', 'Spent (with tax)', 'Remaining'],
        series: [{ name: 'Amount', values: [balance, spent, Math.max(0, remaining)] }],
        format: { format: 'currency' },
      },
      steps: [
        ...charges.map((c, i) => `Purchase ${i + 1} = $${fmt(list[i])} × ${fmt(k, 4)} = $${fmt(c)}`),
        `Remaining = $${fmt(balance)} − $${fmt(spent)} = $${fmt(remaining)}`,
        `Largest item before tax = $${fmt(Math.max(0, remaining))} ÷ ${fmt(k, 4)}, rounded down = $${fmt(largest)}`,
        `Your item with tax = $${fmt(candidate)} × ${fmt(k, 4)} = $${fmt(candidateCost)}`,
        `Top-up = max(0, $${fmt(candidateCost)} − $${fmt(remaining)}) = $${fmt(topUp)}`,
      ],
    };
  },
  content: {
    formula: [
      'Charge for each purchase = pre-tax price × (1 + tax rate), rounded to the cent',
      'Remaining = starting balance − sum of charges',
      'Largest pre-tax item that fits = remaining ÷ (1 + tax rate), rounded down to the cent',
      'Top-up = max(0, item price × (1 + tax rate) − remaining)',
    ],
    body: [
      'A gift card balance shrinks by more than the sticker prices, because sales tax is added to every purchase. Enter what is on the card, the pre-tax price of each thing you have bought, and your tax rate, and the calculator shows what is left.',
      'It also answers the two questions that come up at the till. What is the most expensive item I can still buy with what is left, before tax? And if I want something pricier, how much cash do I need to add? A $100 card with purchases of $34.50 and $28.00 at 8% tax has $32.50 left, which covers an item up to $30.09 before tax.',
      'Rules differ by store and state. Some retailers charge tax on the card at the till and some do not, and some let you split a payment between a card and cash. This tool assumes tax is added to every purchase and the card pays first. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How do I find my gift card balance after purchases?', a: 'Multiply each pre-tax price by 1 plus the tax rate, add the results, and subtract from the starting balance. With a $100 card, purchases of $34.50 and $28.00 and 8% tax, the charges are $37.26 and $30.24, so $100 − $67.50 leaves $32.50.' },
      { q: 'What is the most I can spend before tax with what is left?', a: 'Divide the remaining balance by 1 plus the tax rate and round down to the cent. $32.50 ÷ 1.08 = $30.09 (rounded down from $30.0925), so a $30.09 item costs $32.50 with tax.' },
      { q: 'How much cash do I need to top up?', a: 'Take the price of the item with tax and subtract the remaining balance. A $35.00 item at 8% tax costs $37.80, so with $32.50 left you add $5.30. If the card covers the item, the top-up is zero.' },
      { q: 'What happens if my purchases cost more than the card?', a: 'The remaining balance shows as negative and the result is flagged as overspent. That usually means an amount was entered wrongly, or that you paid the difference another way.' },
      { q: 'Does the calculator work if there is no sales tax?', a: 'Yes. Enter 0 for the tax rate. Charges then equal the pre-tax prices, and the largest item that fits is simply the remaining balance.' },
    ],
  },
  related: ['discount', 'sales-tax'],
  examples: [
    // charges 34.50 × 1.08 = 37.26 and 28.00 × 1.08 = 30.24; spent 67.50; remaining 100 − 67.50 = 32.50;
    // largest floor(32.50 ÷ 1.08 × 100) / 100 = floor(3009.259) / 100 = 30.09; candidate 35 × 1.08 = 37.80; top-up 37.80 − 32.50 = 5.30.
    { values: { balance: 100, purchases: [34.5, 28], tax: 8, candidate: 35 }, expect: { remaining: 32.5, spent: 67.5, largest: 30.09, candidateCost: 37.8, topUp: 5.3, status: 'Add $5.30 cash', badge: 'Top-up needed', tone: 'warn' }, tolerance: 1e-9 },
    // no tax: spent 20 + 15 = 35; remaining 30 − 35 = −5; largest 0; candidate 10 costs 10; top-up 10 − (−5) = 15.
    { values: { balance: 30, purchases: [20, 15], tax: 0, candidate: 10 }, expect: { remaining: -5, spent: 35, largest: 0, topUp: 15, badge: 'Overspent', tone: 'bad' }, tolerance: 1e-9 },
    // 10% tax: charge 40 × 1.1 = 44; remaining 50 − 44 = 6; largest 6 ÷ 1.1 = 5.4545 -> 5.45; candidate 5 × 1.1 = 5.50 <= 6, top-up 0.
    { values: { balance: 50, purchases: [40], tax: 10, candidate: 5 }, expect: { remaining: 6, spent: 44, largest: 5.45, candidateCost: 5.5, topUp: 0, status: 'Card covers it', badge: 'Covered', tone: 'good' }, tolerance: 1e-9 },
    // nothing spent, no tax: remaining 25; largest 25; candidate 20 covered.
    { values: { balance: 25, purchases: [], tax: 0, candidate: 20 }, expect: { remaining: 25, spent: 0, largest: 25, topUp: 0, status: 'Card covers it' }, tolerance: 1e-9 },
  ],
});
