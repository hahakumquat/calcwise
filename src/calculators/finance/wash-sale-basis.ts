import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 0) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'wash-sale-basis',
  title: 'Wash Sale Calculator: Loss and New Basis',
  category: 'finance',
  description: 'Work out how much of a stock loss a wash sale disallows, the loss you can still claim and the adjusted cost basis of the shares you bought back.',
  keywords: ['wash sale calculator', 'wash sale disallowed loss', 'wash sale adjusted basis', 'wash sale rule example', 'repurchase after loss'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'sold', label: 'Shares sold at a loss', type: 'number', default: 100, min: 0, step: 1, info: 'How many shares you sold at a loss.' },
    { id: 'salePrice', label: 'Sale price per share', type: 'number', prefix: '$', default: 40, min: 0, step: 0.01, info: 'What you sold each share for.' },
    { id: 'cost', label: 'Original cost per share', type: 'number', prefix: '$', default: 50, min: 0, step: 0.01, info: 'What you originally paid per share.' },
    { id: 'rebought', label: 'Shares bought back in the window', type: 'number', default: 60, min: 0, step: 1, info: 'Shares of the same or a substantially identical security bought in the 30 days before or after the sale.' },
    { id: 'rebuyPrice', label: 'Repurchase price per share', type: 'number', prefix: '$', default: 42, min: 0, step: 0.01, info: 'What you paid per share for the replacement shares.' },
  ],
  outputs: [
    { id: 'disallowed', label: 'Disallowed loss', format: 'currency', precision: 2, primary: true, info: 'Loss × washed shares ÷ shares sold. It is added to the basis of the new shares.' },
    { id: 'allowed', label: 'Loss you can claim now', format: 'currency', precision: 2, info: 'Total loss − disallowed loss.' },
    { id: 'loss', label: 'Total loss on the sale', format: 'currency', precision: 2, info: '(Cost − sale price) × shares sold.' },
    { id: 'newBasis', label: 'New basis per repurchased share', format: 'currency', precision: 2, info: 'Repurchase price + disallowed loss ÷ washed shares.' },
  ],
  compute: (v) => {
    const sold = num(v.sold);
    const sp = num(v.salePrice);
    const cost = num(v.cost);
    const rebought = num(v.rebought);
    const rp = num(v.rebuyPrice);
    if (sold === null || sp === null || cost === null || rebought === null || rp === null) return { disallowed: null };
    if (sold <= 0 || sp < 0 || cost < 0 || rebought < 0 || rp < 0) return { disallowed: null };
    if (sp >= cost) {
      return { disallowed: 0, allowed: 0, loss: 0, newBasis: rp, tone: 'ok', badge: 'No loss, no wash sale', note: 'The sale price is not below your cost, so there is no loss for the wash sale rule to disallow.' };
    }
    const loss = (cost - sp) * sold;
    const washed = Math.min(sold, rebought);
    const disallowed = (loss * washed) / sold;
    const allowed = loss - disallowed;
    const newBasis = washed > 0 ? rp + disallowed / washed : rp;
    return {
      disallowed,
      allowed,
      loss,
      newBasis,
      tone: disallowed > 0 ? 'warn' : 'good',
      badge: disallowed > 0 ? `${money(disallowed)} of the loss is deferred` : 'Full loss allowed',
      note: disallowed > 0
        ? `${fmt(washed)} of ${fmt(sold)} shares are washed. You can claim ${money(allowed)} now; the other ${money(disallowed)} is added to the basis of the ${fmt(washed)} repurchased shares, making it ${money(newBasis)} a share instead of ${money(rp)}.`
        : 'You bought nothing back in the window, so the whole loss counts.',
      chart: {
        type: 'bar' as const,
        title: 'Loss claimed now vs deferred',
        categories: ['Claim now', 'Deferred into basis'],
        series: [{ name: 'Loss', values: [allowed, disallowed] }],
        format: CURRENCY,
        highlight: 1,
      },
      steps: [
        `Loss = (${money(cost)} − ${money(sp)}) × ${fmt(sold)} = ${money(loss)}`,
        `Washed shares = smaller of ${fmt(sold)} sold and ${fmt(rebought)} bought back = ${fmt(washed)}`,
        `Disallowed = ${money(loss)} × ${fmt(washed)} ÷ ${fmt(sold)} = ${money(disallowed)}`,
        `New basis per share = ${money(rp)} + ${money(disallowed)} ÷ ${fmt(washed)} = ${money(newBasis)}`,
      ],
    };
  },
  content: {
    formula: [
      'Loss = (cost − sale price) × shares sold',
      'Washed shares = smaller of (shares sold, shares bought back)',
      'Disallowed loss = loss × washed shares ÷ shares sold',
      'New basis per repurchased share = repurchase price + disallowed loss ÷ washed shares',
    ],
    body: [
      'A wash sale happens when you sell a security at a loss and buy the same or a substantially identical one shortly before or after. The loss on the washed shares is not lost for good; it moves into the basis of the shares you bought back, so you get it back when you finally sell them.',
      'Example: sell 100 shares at $40 that cost $50, then buy back 60 at $42. The loss is $1,000. Sixty of 100 shares are washed, so $600 is disallowed and $400 can be claimed. The 60 new shares have a basis of $42 + $600 ÷ 60 = $52.00 each.',
      'The IRS rule covers purchases in the 30 days before and the 30 days after the sale, and has details this page does not model (other accounts, spouses, IRAs, options). Check the current rule on irs.gov or with a tax professional. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is the wash sale window?', a: 'The IRS counts purchases made in the 30 days before or after the sale. Confirm the current rule on irs.gov, because this calculator takes the repurchased share count as an input and does not check dates.' },
      { q: 'Is the disallowed loss gone?', a: 'No. It is added to the basis of the replacement shares, so it reduces your gain or increases your loss when you sell them.' },
      { q: 'What if I bought back more shares than I sold?', a: 'Only as many shares as you sold can be washed, so the calculator uses the smaller number.' },
      { q: 'Does this work for a gain?', a: 'No. The wash sale rule only applies to losses. If the sale price is at or above cost, the result is zero.' },
    ],
    sources: [],
  },
  related: ['tax-loss-harvesting', 'capital-loss-carryover'],
  examples: [
    // loss 10*100=1000; washed 60; disallowed 600; allowed 400; basis 42+600/60=52
    { values: { sold: 100, salePrice: 40, cost: 50, rebought: 60, rebuyPrice: 42 }, expect: { disallowed: 600, allowed: 400, loss: 1000, newBasis: 52 } },
    // loss 15*50=750; washed min(50,80)=50; disallowed 750; allowed 0; basis 31+750/50=46
    { values: { sold: 50, salePrice: 30, cost: 45, rebought: 80, rebuyPrice: 31 }, expect: { disallowed: 750, allowed: 0, loss: 750, newBasis: 46 } },
  ],
});
