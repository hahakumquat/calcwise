import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { nums } from '../../lib/helpers/math-extra';

type Lot = { name: string; shares: number; cost: number; long: boolean };
type Sale = { taken: { lot: Lot; qty: number; gain: number }[]; st: number; lt: number; tax: number };

const money = (x: number) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const label = (i: number) => String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String(Math.floor(i / 26)) : '');

function sell(order: Lot[], qty: number, price: number, stRate: number, ltRate: number): Sale {
  let left = qty;
  let st = 0;
  let lt = 0;
  const taken: Sale['taken'] = [];
  for (const lot of order) {
    if (left <= 1e-12) break;
    const q = Math.min(lot.shares, left);
    const gain = q * (price - lot.cost);
    left -= q;
    taken.push({ lot, qty: q, gain });
    if (lot.long) lt += gain;
    else st += gain;
  }
  // Short and long totals offset when signs differ; the remaining gain keeps the rate of the positive side.
  let tax = 0;
  if (st > 0 && lt > 0) tax = st * stRate + lt * ltRate;
  else {
    const net = st + lt;
    if (net > 0) tax = net * (st > 0 ? stRate : ltRate);
  }
  return { taken, st, lt, tax };
}

const describe = (name: string, s: Sale) =>
  `${name}: ${s.taken.map((t) => `${t.qty} from lot ${t.lot.name} (${money(t.gain)})`).join(', ')}. Short ${money(s.st)}, long ${money(s.lt)}, tax ${money(s.tax)}`;

export default defineCalculator({
  slug: 'tax-lot-sale-methods',
  title: 'Tax Lot Sale Calculator: FIFO vs LIFO vs HIFO',
  category: 'finance',
  description: 'Compare the capital gains tax on selling shares by FIFO, LIFO or HIFO across your tax lots, using the tax rates you enter.',
  metaDescription: 'Tax lot calculator: compare FIFO, LIFO and HIFO for a share sale across your lots and see the estimated capital gains tax for each method.',
  updated: '2026-11-28',
  keywords: ['fifo vs lifo vs hifo', 'tax lot selling calculator', 'specific identification shares', 'hifo calculator', 'cost basis method calculator', 'capital gains tax lot'],
  inputs: [
    { id: 'shares', label: 'Shares in each lot', type: 'list', default: '100, 100, 100', placeholder: 'e.g. 100, 100, 100', help: 'Oldest lot first', info: 'Number of shares bought in each purchase, oldest purchase first. Separate with commas or spaces. Lots are named A, B, C in this order.' },
    { id: 'costs', label: 'Cost per share of each lot', type: 'list', default: '20, 80, 50', placeholder: 'e.g. 20, 80, 50', help: 'Same order as the shares', info: 'The price paid per share for each lot, including fees if you like, in the same order as the shares.' },
    { id: 'terms', label: 'Long-term flag of each lot', type: 'list', default: '1, 1, 0', placeholder: 'e.g. 1, 1, 0', help: '1 = held over a year, 0 = a year or less', info: 'Enter 1 for a lot you have held for more than one year (long-term) and 0 for a year or less (short-term), in the same order.' },
    { id: 'qty', label: 'Shares to sell', type: 'number', default: 150, min: 0, step: 1, info: 'Total shares to sell. It cannot be more than you hold across all lots.' },
    { id: 'price', label: 'Sale price per share', type: 'number', prefix: '$', default: 70, min: 0, step: 0.01, info: 'The price you expect to sell at.' },
    { id: 'stRate', label: 'Short-term tax rate (assumption)', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 0.5, info: 'Your assumed rate on short-term gains, usually your ordinary income bracket. This is your estimate, not tax advice.' },
    { id: 'ltRate', label: 'Long-term tax rate (assumption)', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 0.5, info: 'Your assumed rate on long-term gains (federal rates are 0%, 15% or 20%). This is your estimate, not tax advice.' },
  ],
  outputs: [
    { id: 'best', label: 'Lowest estimated tax', format: 'currency', precision: 2, primary: true, info: 'The smallest tax of the three methods for this sale.' },
    { id: 'bestMethod', label: 'Method with lowest tax', format: 'text', info: 'FIFO, LIFO or HIFO. If tied, the first of FIFO, LIFO, HIFO is shown.' },
    { id: 'fifoTax', label: 'Tax using FIFO', format: 'currency', precision: 2, info: 'First in, first out: the oldest lots are sold first. This is the usual broker default.' },
    { id: 'lifoTax', label: 'Tax using LIFO', format: 'currency', precision: 2, info: 'Last in, first out: the newest lots are sold first.' },
    { id: 'hifoTax', label: 'Tax using HIFO', format: 'currency', precision: 2, info: 'Highest in, first out: the lots with the highest cost per share are sold first, which usually gives the smallest gain.' },
    { id: 'saving', label: 'Saving versus FIFO', format: 'currency', precision: 2, info: 'FIFO tax minus the lowest tax. Zero if FIFO is already the lowest.' },
  ],
  compute: (v) => {
    const shares = nums(v.shares);
    const costs = nums(v.costs);
    const terms = nums(v.terms);
    const qty = num(v.qty);
    const price = num(v.price);
    const stPct = num(v.stRate);
    const ltPct = num(v.ltRate);
    if (!shares.length || !costs.length || !terms.length || qty === null || price === null || stPct === null || ltPct === null) return { best: null };
    if (shares.length !== costs.length || shares.length !== terms.length) return { best: null, error: `Enter the same number of shares, costs and long-term flags (you have ${shares.length}, ${costs.length} and ${terms.length}).` };
    if (shares.some((s) => s <= 0)) return { best: null, error: 'Each lot needs more than 0 shares.' };
    if (costs.some((c) => c < 0)) return { best: null, error: 'Cost per share cannot be negative.' };
    if (terms.some((t) => t !== 0 && t !== 1)) return { best: null, error: 'Use 1 for long-term or 0 for short-term in the flags list.' };
    if (qty <= 0) return { best: null, error: 'Enter a number of shares to sell above 0.' };
    if (price < 0) return { best: null, error: 'Sale price cannot be negative.' };
    if (stPct < 0 || ltPct < 0 || stPct > 100 || ltPct > 100) return { best: null, error: 'Tax rates must be between 0 and 100.' };
    const held = shares.reduce((a, b) => a + b, 0);
    if (qty > held + 1e-9) return { best: null, error: `You are selling ${qty} shares but your lots hold only ${held}.` };

    const lots: Lot[] = shares.map((s, i) => ({ name: label(i), shares: s, cost: costs[i], long: terms[i] === 1 }));
    const stR = stPct / 100;
    const ltR = ltPct / 100;
    const fifo = sell(lots, qty, price, stR, ltR);
    const lifo = sell([...lots].reverse(), qty, price, stR, ltR);
    const hifo = sell([...lots].sort((a, b) => b.cost - a.cost), qty, price, stR, ltR); // stable: ties keep oldest first
    const all = [
      { name: 'FIFO', s: fifo },
      { name: 'LIFO', s: lifo },
      { name: 'HIFO', s: hifo },
    ];
    const best = all.reduce((a, b) => (b.s.tax < a.s.tax - 1e-9 ? b : a));
    const saving = Math.max(0, fifo.tax - best.s.tax);
    return {
      best: best.s.tax,
      bestMethod: best.name,
      fifoTax: fifo.tax,
      lifoTax: lifo.tax,
      hifoTax: hifo.tax,
      saving,
      tone: saving > 0 ? 'good' : 'ok',
      badge: saving > 0 ? `${best.name} saves ${money(saving)}` : `${best.name} is lowest`,
      note: 'Estimate only: ignores the 3.8% NIIT, the $3,000 annual loss limit and wash sales. Confirm the rules in IRS Publication 550.',
      chart: {
        type: 'bar',
        title: 'Estimated tax by method ($)',
        categories: all.map((m) => m.name),
        series: [{ name: 'Tax', values: all.map((m) => m.s.tax) }],
        format: { format: 'currency', precision: 0 },
        highlight: all.indexOf(best),
      },
      steps: all.map((m) => describe(m.name, m.s)),
    };
  },
  content: {
    formula: ['Gain on a lot = shares sold × (sale price − cost per share)', 'FIFO sells the oldest lot first, LIFO the newest, HIFO the highest cost per share', 'Short-term and long-term totals offset when their signs differ; any net gain is taxed at the rate of the side that is positive', 'Tax = gain × rate, or 0 for a net loss'],
    body: [
      'When you bought the same stock at different times and prices, which shares you sell decides your gain. FIFO sells the oldest shares first, LIFO the newest, and HIFO the ones you paid the most for. Selling high-cost shares gives a smaller gain, or a loss, so HIFO often gives the lowest tax today.',
      'Holding period matters too. Gains on shares held for more than a year are long-term and usually taxed at a lower rate than short-term gains. If one side has a loss and the other a gain, the loss offsets the gain first. Enter the lots oldest first, with a 1 for long-term or 0 for short-term, and your own assumed tax rates.',
      'This is an estimate. It leaves out the 3.8% net investment income tax, the $3,000 annual limit on deducting net losses, wash sale rules and state tax. Brokers default to FIFO, and you generally have to choose another method before the trade settles. Confirm the rules for your situation in IRS Publication 550.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Lots: A has 100 shares at $20 (long-term, oldest), B has 100 at $80 (long-term) and C has 100 at $50 (short-term, newest). Sell 150 at $70 with rates of 24% short-term and 15% long-term.',
          'FIFO sells A (100 × 50 = +5,000) and 50 of B (50 × −10 = −500): long-term 4,500, tax $675. LIFO sells C (+2,000 short-term) and 50 of B (−500 long-term): net 1,500 short-term, tax $360. HIFO sells B (−1,000 long-term) and 50 of C (+1,000 short-term): net 0, tax $0.',
        ],
      },
    ],
    faq: [
      { q: 'What is the tax in the example when selling 150 shares by FIFO?', a: 'FIFO sells all of lot A for +5,000 and 50 shares of lot B for −500. The long-term gain is 4,500, taxed at 15%, which is $675.' },
      { q: 'What is the tax in the example using LIFO?', a: 'LIFO sells lot C for +2,000 (short-term) and 50 of lot B for −500 (long-term). The net is 1,500 short-term, taxed at 24%, which is $360.' },
      { q: 'What is the tax in the example using HIFO?', a: 'HIFO sells lot B for −1,000 (long-term) and 50 of lot C for +1,000 (short-term). They cancel to 0, so the tax is $0.' },
      { q: 'Can I sell more shares than my lots hold?', a: 'No. The calculator shows an error if the shares to sell exceed the total in your lots.' },
      { q: 'Does this include NIIT, wash sales or the loss limit?', a: 'No. It ignores the 3.8% NIIT, the $3,000 annual loss deduction limit, wash sales and state tax. Your rates are your own assumptions. Check IRS Publication 550 for the rules.' },
    ],
    sources: [{ label: 'IRS Publication 550: Investment Income and Expenses', url: 'https://www.irs.gov/publications/p550' }],
  },
  related: ['average-cost-basis', 'wash-sale-basis', 'capital-loss-carryover'],
  examples: [
    // A 100@20 L, B 100@80 L, C 100@50 S; sell 150 @70. FIFO: A +5000, B50 -500 -> LT 4500 *15% = 675
    // LIFO: C +2000 ST, B50 -500 LT -> net 1500 ST *24% = 360. HIFO: B100 -1000 LT, C50 +1000 ST -> net 0 -> 0
    { values: { shares: [100, 100, 100], costs: [20, 80, 50], terms: [1, 1, 0], qty: 150, price: 70, stRate: 24, ltRate: 15 }, expect: { fifoTax: 675, lifoTax: 360, hifoTax: 0, best: 0, bestMethod: 'HIFO', saving: 675 }, tolerance: 1e-9 },
    // Two long lots 100@10 and 100@40, sell 100 @50, 15%: FIFO gain 4000 -> 600; LIFO gain 1000 -> 150; HIFO same as LIFO -> 150
    { values: { shares: [100, 100], costs: [10, 40], terms: [1, 1], qty: 100, price: 50, stRate: 24, ltRate: 15 }, expect: { fifoTax: 600, lifoTax: 150, hifoTax: 150, best: 150, bestMethod: 'LIFO', saving: 450 }, tolerance: 1e-9 },
    // Single short lot 10@100 sold at 80: loss -200, tax 0 for every method
    { values: { shares: [10], costs: [100], terms: [0], qty: 10, price: 80, stRate: 24, ltRate: 15 }, expect: { fifoTax: 0, lifoTax: 0, hifoTax: 0, best: 0, bestMethod: 'FIFO', saving: 0 }, tolerance: 1e-9 },
  ],
});
