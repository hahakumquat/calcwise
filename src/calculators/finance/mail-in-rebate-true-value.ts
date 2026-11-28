import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number) => `${(+(n * 100).toFixed(1)).toLocaleString('en-US')}%`;

export default defineCalculator({
  slug: 'mail-in-rebate-true-value',
  title: 'Mail-In Rebate True Value Calculator',
  category: 'finance',
  description: 'Work out the real price of a mail-in rebate deal using your own chance of claiming it, and the claim rate where it beats a cheaper no-rebate price.',
  keywords: ['mail in rebate calculator', 'rebate true cost', 'is a rebate worth it', 'rebate vs lower price', 'expected price with rebate', 'rebate break even'],
  updated: '2026-11-28',
  inputs: [
    { id: 'price', label: 'Price you pay at the register', type: 'number', prefix: '$', default: 100, min: 0.01, step: 1, info: 'The sticker price before the rebate comes back.' },
    { id: 'rebate', label: 'Rebate amount', type: 'number', prefix: '$', default: 30, min: 0, step: 1, info: 'What the mail-in or online rebate pays if you claim it correctly.' },
    { id: 'claim', label: 'Chance you will claim it', type: 'number', suffix: '%', default: 70, min: 0, max: 100, step: 5, info: 'Your honest guess. Think of the forms, deadlines, lost receipts and rejected claims. 100 means you are certain to get it.' },
    { id: 'alt', label: 'Same item without a rebate (optional)', type: 'number', prefix: '$', min: 0, step: 1, optional: true, info: 'A price for the same item elsewhere with no rebate. Fill it in to see the claim chance where the rebate deal wins.' },
  ],
  outputs: [
    { id: 'expected', label: 'Expected net price', format: 'currency', primary: true, info: 'Price − chance of claiming × rebate. The average you pay if you made this purchase many times.' },
    { id: 'discount', label: 'Effective discount', format: 'percent', precision: 1, info: 'Chance of claiming × rebate ÷ price.' },
    { id: 'ifClaimed', label: 'Net price if you claim', format: 'currency', info: 'Price − rebate.' },
    { id: 'breakEven', label: 'Break-even claim chance', format: 'percent', precision: 1, info: '(Price − no-rebate price) ÷ rebate. Above this chance of claiming, the rebate deal is cheaper on average.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const rebate = num(v.rebate);
    const claim = num(v.claim);
    const alt = num(v.alt);
    if (price === null || rebate === null || claim === null || price <= 0 || rebate < 0 || claim < 0 || claim > 100) return { expected: null };
    if (alt !== null && alt < 0) return { expected: null };
    const p = claim / 100;
    const expected = price - p * rebate;
    const discount = (p * rebate) / price;
    const ifClaimed = price - rebate;
    const out: Record<string, unknown> = { expected, discount, ifClaimed };
    const cats = ['Sticker price', 'Expected net', 'Net if you claim'];
    const vals = [price, expected, ifClaimed];
    const steps = [
      `Expected rebate = ${pct(p)} × $${fmt(rebate)} = $${fmt(p * rebate)}`,
      `Expected net price = $${fmt(price)} − $${fmt(p * rebate)} = $${fmt(expected)}`,
      `Effective discount = $${fmt(p * rebate)} ÷ $${fmt(price)} = ${pct(discount)}`,
    ];
    let note = `On average this deal costs $${fmt(expected)}, a ${pct(discount)} discount, not the $${fmt(ifClaimed)} the rebate promises.`;
    let tone: 'good' | 'ok' | 'warn' = 'ok';
    if (alt !== null) {
      cats.push('No-rebate price');
      vals.push(alt);
      if (rebate > 0) {
        const be = (price - alt) / rebate;
        steps.push(`Break-even chance = ($${fmt(price)} − $${fmt(alt)}) ÷ $${fmt(rebate)} = ${pct(Math.max(be, 0))}`);
        if (be <= 0) {
          out.breakEven = 0;
          note += ` The rebate item is no dearer than the $${fmt(alt)} option even if you never claim.`;
        } else if (be > 1) {
          note += ` Even a certain claim ($${fmt(ifClaimed)}) does not beat $${fmt(alt)}, so the no-rebate option wins.`;
        } else {
          out.breakEven = be;
        }
      }
      const wins = expected < alt;
      tone = wins ? 'good' : 'warn';
      note += wins ? ` That beats the $${fmt(alt)} no-rebate price.` : ` That does not beat the $${fmt(alt)} no-rebate price.`;
    }
    return {
      ...out,
      tone,
      badge: alt !== null ? (expected < alt ? 'Rebate deal wins' : 'No-rebate wins') : `${pct(discount)} off on average`,
      note,
      chart: {
        type: 'bar' as const,
        title: 'Price comparison ($)',
        categories: cats,
        series: [{ name: 'Price', values: vals }],
        format: { format: 'currency' as const },
        highlight: 1,
      },
      steps,
    };
  },
  content: {
    formula: [
      'Expected net price = price − (chance of claiming × rebate)',
      'Effective discount = chance of claiming × rebate ÷ price',
      'Break-even claim chance = (price − no-rebate price) ÷ rebate',
    ],
    body: [
      'A mail-in rebate only saves money if you actually collect it. Forms get lost, deadlines pass, receipts fade and claims get rejected. This calculator takes your own honest chance of claiming and works out the average price you really pay.',
      'Example: a $100 item with a $30 rebate and a 70% chance you will claim it. The expected rebate is 0.70 × $30 = $21, so the expected net price is $79, which is a 21% discount instead of 30%. If you could buy it elsewhere for $85 with no rebate, the break-even claim chance is ($100 − $85) ÷ $30 = 50%. At 70% the rebate deal wins; below 50% the $85 price wins.',
      'The chance of claiming is your own guess, not a statistic, so be honest about it. A rebate that takes a few minutes online with a deadline you can see is more likely to be claimed than one that needs a printed form, a barcode cut-out and a stamp. Also count the time and postage it costs you, which this calculator does not. It treats the rebate as a plain dollar amount and ignores tax. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is the expected net price worked out?', a: 'Price minus chance of claiming times rebate. A $100 item with a $30 rebate and a 70% chance gives $100 − 0.70 × $30 = $79.' },
      { q: 'What is the break-even claim chance?', a: 'The claim chance where the rebate deal costs the same, on average, as the no-rebate price: (price − no-rebate price) ÷ rebate. For $100, $85 and a $30 rebate, that is 50%.' },
      { q: 'What if the no-rebate price is higher than the rebate price?', a: 'Then the rebate deal costs less even if you never claim, so the break-even is shown as 0%.' },
      { q: 'What if even a certain claim does not beat the other price?', a: 'The break-even would be over 100%, so no break-even is shown and the note says the no-rebate option wins.' },
      { q: 'How do I pick my chance of claiming?', a: 'Be honest about your past. If you have missed rebates before, use a lower number. Online claims with a clear deadline are easier to finish than mailed forms. The tool does not know the store and does not collect anything.' },
    ],
    sources: [],
  },
  related: ['rebate-vs-low-apr', 'black-friday-deal-check', 'discount', 'buy-n-get-m', 'cash-back-rewards'],
  examples: [
    // 100 - 0.7*30 = 79; discount 21/100 = 0.21; 100-30 = 70; break-even (100-85)/30 = 0.5
    { values: { price: 100, rebate: 30, claim: 70, alt: 85 }, expect: { expected: 79, discount: 0.21, ifClaimed: 70, breakEven: 0.5 }, tolerance: 1e-9 },
    // 100 - 0.5*20 = 90; discount 10/100 = 0.1; break-even 15/20 = 0.75
    { values: { price: 100, rebate: 20, claim: 50, alt: 85 }, expect: { expected: 90, discount: 0.1, ifClaimed: 80, breakEven: 0.75 }, tolerance: 1e-9 },
  ],
});
