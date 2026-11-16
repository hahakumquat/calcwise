import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const N = 6;
const ids = Array.from({ length: N }, (_, i) => `p${i + 1}`);

export default defineCalculator({
  slug: 'bill-splitter',
  title: 'Bill Splitter with Tax and Tip',
  category: 'everyday',
  description: 'Split a bill unevenly: enter what each person ordered and get their fair share of tax and tip, in proportion to their own subtotal.',
  keywords: ['bill splitter', 'split bill with tax and tip', 'uneven bill split', 'split check by what you ordered', 'itemized bill split', 'restaurant bill calculator'],
  updated: '2026-11-16',
  inputs: [
    ...ids.map((id, i) => ({
      id,
      label: `Person ${i + 1}`,
      type: 'number' as const,
      prefix: '$',
      ...(i < 3 ? { default: [30, 20, 50][i] } : {}),
      min: 0,
      step: 0.01,
      ...(i >= 2 ? { optional: true } : {}),
      info: i === 0
        ? 'The total of the items this person ordered, before tax and tip. Leave a person blank or at 0 to leave them out.'
        : 'Item subtotal for this person, before tax and tip. Blank or 0 means they are ignored.',
    })),
    { id: 'tax', label: 'Tax (total on the bill)', type: 'number', prefix: '$', default: 8, min: 0, step: 0.01, optional: true, info: 'The tax amount printed on the bill, in dollars. It is shared in proportion to each person’s subtotal.' },
    { id: 'tipPct', label: 'Tip', type: 'number', suffix: '%', default: 20, min: 0, step: 1, optional: true, info: 'The tip as a percentage. 15–20% is customary for table service in the US.' },
    {
      id: 'tipBase',
      label: 'Tip is calculated on',
      type: 'select',
      default: 'pre',
      info: 'Most guides say tipping on the pre-tax subtotal is fine; some people tip on the after-tax total.',
      options: [
        { value: 'pre', label: 'Pre-tax subtotal' },
        { value: 'post', label: 'After-tax total' },
      ],
    },
  ],
  outputs: [
    { id: 'total', label: 'Total bill with tax and tip', format: 'currency', primary: true, info: 'Everyone’s subtotals plus tax plus tip.' },
    { id: 'subtotal', label: 'Subtotal', format: 'currency', info: 'The sum of all the item subtotals you entered.' },
    { id: 'taxOut', label: 'Tax', format: 'currency', info: 'The tax amount you entered.' },
    { id: 'tipOut', label: 'Tip', format: 'currency', info: 'Tip percentage × the subtotal, or × (subtotal + tax) if you chose after-tax.' },
    ...ids.map((id, i) => ({ id: `share${i + 1}`, label: `Person ${i + 1} pays`, format: 'currency' as const, info: `Person ${i + 1}’s subtotal plus their proportional share of tax and tip.` })),
  ],
  compute: (v) => {
    const amounts = ids.map((id) => num(v[id]) ?? 0);
    const tax = num(v.tax) ?? 0;
    const pct = num(v.tipPct) ?? 0;
    const after = v.tipBase === 'post';
    if (amounts.some((a) => a < 0) || tax < 0 || pct < 0) return { total: null, error: 'Amounts and percentages cannot be negative.' };
    const sum = amounts.reduce((a, b) => a + b, 0);
    if (sum <= 0) return { total: null };

    const tip = ((after ? sum + tax : sum) * pct) / 100;
    const total = sum + tax + tip;
    const shares = amounts.map((a) => (a > 0 ? a + ((tax + tip) * a) / sum : null));
    const count = amounts.filter((a) => a > 0).length;
    const extra = tax + tip;

    const out: Record<string, number | string | null | ChartSpec | string[] | undefined> = { total, subtotal: sum, taxOut: tax, tipOut: tip };
    shares.forEach((s, i) => { out[`share${i + 1}`] = s; });

    const slices = shares.flatMap((s, i) => (s ? [{ label: `Person ${i + 1}`, value: s }] : []));
    const chart: ChartSpec = { type: 'donut', title: 'Each person’s share', format: { format: 'currency' }, slices, centerValue: money(total, 2), centerLabel: 'total' };

    const steps = [
      `Subtotal = ${money(sum)}`,
      `Tip = ${pct}% × ${money(after ? sum + tax : sum)} (${after ? 'after tax' : 'pre-tax'}) = ${money(tip)}`,
      `Total = ${money(sum)} + ${money(tax)} + ${money(tip)} = ${money(total)}`,
      `Each share = own subtotal × (${money(total)} ÷ ${money(sum)}) when tax and tip are both proportional`,
    ];
    amounts.forEach((a, i) => {
      if (a > 0) steps.push(`Person ${i + 1} = ${money(a)} + ${money(tax)} × ${money(a)}/${money(sum)} + ${money(tip)} × ${money(a)}/${money(sum)} = ${money(shares[i] as number)}`);
    });

    return {
      ...out,
      tone: 'ok',
      badge: `${count} ${count === 1 ? 'person' : 'people'}, ${money(extra)} tax and tip shared by subtotal`,
      chart,
      note: 'Each person’s tax and tip is proportional to what they ordered. Shared items such as appetizers should be added to each person’s subtotal in the portion they ate. Shares are rounded to the cent for display, so they can differ from the total by a cent.',
      steps,
    };
  },
  content: {
    formula: [
      'Tip = tip % × subtotal (or × (subtotal + tax) if tipping after tax)',
      'Person’s share = own subtotal + tax × own ÷ sum + tip × own ÷ sum',
      'Total = sum of subtotals + tax + tip',
    ],
    body: [
      'Enter what each person ordered before tax and tip, then the tax shown on the bill and the tip percentage you want to leave. Each person pays their own subtotal plus a share of the tax and the tip that matches how much of the bill was theirs.',
      'This is fairer than an even split when orders differ a lot. Someone who had a $20 meal pays a smaller share of the tax and tip than someone who had a $50 one. People with a blank or zero subtotal are left out.',
      'By default the tip is a percentage of the pre-tax subtotal. Switch the option to tip on the after-tax total if that is your habit; the tip gets a little larger and everyone’s share rises in proportion.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Three people order $30, $20 and $50, a $100 subtotal. Tax is $8 and the tip is 20% of the pre-tax subtotal, which is $20. The total is $128. The first person pays $30 + $2.40 + $6.00 = $38.40, the second pays $25.60 and the third pays $64.00.',
          'If the same table tips on the after-tax total instead, the tip is 20% × $108 = $21.60, the total is $129.60, and the shares become $38.88, $25.92 and $64.80.',
        ],
      },
    ],
    faq: [
      { q: 'How do I split a bill when everyone ordered different amounts?', a: 'Enter each person’s subtotal. Each person pays their subtotal plus tax and tip in proportion to it. For $30, $20 and $50 with $8 tax and a 20% pre-tax tip, they pay $38.40, $25.60 and $64.00.' },
      { q: 'Should I tip on the pre-tax or after-tax amount?', a: 'Either is acceptable and many people use the pre-tax subtotal. With $100 subtotal, $8 tax and 20%, the tip is $20 pre-tax or $21.60 after tax, a difference of $1.60.' },
      { q: 'How is the tax divided?', a: 'In proportion to each person’s subtotal. Someone with $30 of a $100 subtotal pays 30% of the $8 tax, which is $2.40.' },
      { q: 'What about shared appetizers?', a: 'Add each person’s portion of the shared item to their own subtotal before entering it.' },
      { q: 'Can I use more than six people?', a: 'This calculator has six slots. Combine people who are paying together into one subtotal, or use the tip calculator for an even split.' },
    ],
    sources: [{ label: 'US Consumer Financial Protection Bureau: consumer tools and guidance', url: 'https://www.consumerfinance.gov/' }],
  },
  related: ['tip', 'unit-price', 'discount'],
  examples: [
    // Sum 100; tip = 20% × 100 = 20; total = 100 + 8 + 20 = 128.
    // A = 30 + 8×0.3 + 20×0.3 = 38.40; B = 20 + 1.6 + 4 = 25.60; C = 50 + 4 + 10 = 64.00.
    { values: { p1: 30, p2: 20, p3: 50, tax: 8, tipPct: 20, tipBase: 'pre' }, expect: { total: 128, subtotal: 100, tipOut: 20, share1: 38.4, share2: 25.6, share3: 64 } },
    // Tip = 20% × 108 = 21.60; total 129.60; A = 30 + 2.4 + 6.48 = 38.88; B = 20 + 1.6 + 4.32 = 25.92; C = 50 + 4 + 10.80 = 64.80.
    { values: { p1: 30, p2: 20, p3: 50, tax: 8, tipPct: 20, tipBase: 'post' }, expect: { total: 129.6, tipOut: 21.6, share1: 38.88, share2: 25.92, share3: 64.8 } },
  ],
});
