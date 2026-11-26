import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'excess-baggage-fee',
  title: 'Excess Baggage Fee Calculator: Repack and Save',
  category: 'everyday',
  description: 'Enter your airline\'s per-bag weight limit and overweight fee, then your bag weights. See the fee, and whether repacking between bags avoids it.',
  keywords: ['excess baggage fee calculator', 'overweight bag fee', 'luggage weight limit calculator', 'overweight suitcase repack', 'checked bag weight checker', 'baggage fee estimator'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'unit', label: 'Weight unit', type: 'select', default: 'lb', options: [{ value: 'lb', label: 'Pounds (lb)' }, { value: 'kg', label: 'Kilograms (kg)' }], info: 'Only a label. Use the same unit for the limit and every bag; nothing is converted.' },
    { id: 'limit', label: 'Weight limit per bag', type: 'number', default: 50, min: 0.1, step: 0.5, info: 'The per-bag limit on your ticket or the airline\'s baggage page. We do not know it for you; limits differ by airline, route and fare.' },
    { id: 'bagFee', label: 'Fee per overweight bag', type: 'number', prefix: '$', default: 100, min: 0, step: 5, info: 'What the airline charges for each bag over the limit. Check your airline, as fees vary and can have several tiers.' },
    { id: 'bag1', label: 'Bag 1 weight', type: 'number', default: 52, min: 0, step: 0.5, info: 'Weigh the packed bag on a home scale. Airport scales can differ a little, so leave a small margin.' },
    { id: 'bag2', label: 'Bag 2 weight', type: 'number', default: 44, min: 0, step: 0.5, optional: true, info: 'Leave blank if you have no second bag.' },
    { id: 'bag3', label: 'Bag 3 weight', type: 'number', default: 50, min: 0, step: 0.5, optional: true, info: 'Leave blank if you have no third bag.' },
    { id: 'bag4', label: 'Bag 4 weight', type: 'number', min: 0, step: 0.5, optional: true, info: 'Leave blank if you have no fourth bag.' },
  ],
  outputs: [
    { id: 'fee', label: 'Overweight fee', format: 'currency', primary: true, info: 'Bags over the limit × fee per overweight bag.' },
    { id: 'over', label: 'Bags over the limit', format: 'integer', info: 'Bags weighing more than the limit. A bag exactly at the limit is not over.' },
    { id: 'move', label: 'Weight over the limit', format: 'number', info: 'Total weight above the limit across the heavy bags, in the unit you chose.' },
    { id: 'leave', label: 'Must leave out', format: 'number', info: 'Weight that cannot fit in any bag even after repacking evenly. 0 means a repack can avoid every fee.' },
  ],
  compute: (v) => {
    const limit = num(v.limit);
    const fee = num(v.bagFee);
    const b1 = num(v.bag1);
    if (limit === null || fee === null || b1 === null) return { fee: null };
    if (limit <= 0 || fee < 0 || b1 < 0) return { fee: null };
    const unit = v.unit === 'kg' ? 'kg' : 'lb';

    const weights: number[] = [b1];
    for (const id of ['bag2', 'bag3', 'bag4']) {
      const x = num(v[id]);
      if (x === null) continue;
      if (x < 0) return { fee: null };
      weights.push(x);
    }

    const n = weights.length;
    const overBags = weights.filter((w) => w > limit);
    const over = overBags.length;
    const total = weights.reduce((a, b) => a + b, 0);
    const capacity = limit * n;
    const totalFee = over * fee;
    const move = overBags.reduce((a, w) => a + (w - limit), 0);
    const leave = Math.max(0, total - capacity);
    const r = (x: number) => +x.toFixed(2);

    let tone: 'good' | 'warn' | 'bad';
    let badge: string;
    let note: string;
    if (over === 0) {
      tone = 'good';
      badge = 'No overweight bags';
      note = 'Every bag is at or under your limit, so no overweight fee applies. Weigh again just before you leave, since souvenirs add up.';
    } else if (leave === 0) {
      tone = 'warn';
      badge = 'Repack to avoid the fee';
      note = `Together your bags weigh ${r(total)} ${unit}, within the combined ${r(capacity)} ${unit}. Move about ${r(move)} ${unit} from the heavy ${over === 1 ? 'bag' : 'bags'} into bags with spare room and the fee goes away.`;
    } else {
      tone = 'bad';
      badge = 'Fee hard to avoid';
      note = `Your bags weigh ${r(total)} ${unit} in total, above the combined ${r(capacity)} ${unit}. Take out at least ${r(leave)} ${unit} (wear it, post it or leave it) to avoid every fee, or pay ${money(totalFee, 2)}.`;
    }

    return {
      fee: totalFee,
      over,
      move: r(move),
      leave: r(leave),
      tone,
      badge,
      chart: {
        type: 'bar',
        title: `Bag weight vs limit (${unit})`,
        categories: weights.map((_, i) => `Bag ${i + 1}`),
        series: [
          { name: 'Weight', values: weights.map(r) },
          { name: 'Limit', values: weights.map(() => limit) },
        ],
        format: { format: 'number' },
      },
      steps: [
        `Bags over ${limit} ${unit}: ${over} of ${n}${over ? ` (${weights.map((w, i) => (w > limit ? `bag ${i + 1} at ${r(w)}` : '')).filter(Boolean).join(', ')})` : ''}`,
        `Fee = ${over} × ${money(fee, 2)} = ${money(totalFee, 2)}`,
        `Total weight ${r(total)} ${unit} vs combined allowance ${n} × ${limit} = ${r(capacity)} ${unit}`,
        leave === 0 ? 'The total fits the combined allowance, so repacking can work.' : `${r(leave)} ${unit} is over the combined allowance, so it has to come out of the bags.`,
      ],
      note,
    };
  },
  content: {
    formula: [
      'Bags over = number of bags heavier than the limit',
      'Fee = bags over × fee per overweight bag',
      'Repack test: if total weight ≤ limit × number of bags, moving items between bags can avoid every fee',
      'Must leave out = total weight − limit × number of bags (if positive)',
    ],
    body: [
      'Enter the weight limit and overweight fee from your airline, then weigh each packed bag. The calculator counts how many bags are over, adds up the fee, and checks whether your bags could share the load.',
      'The numbers are all yours. We do not store any airline\'s limits or fees, because they change by airline, route, fare and bag type. Always confirm them on your booking or the airline\'s baggage page.',
      'The repack test assumes you can move items freely between the bags you entered and that every bag has the same limit. Bag size and dimension rules still apply, and airport scales can read a little differently from yours.',
    ],
    sections: [],
    faq: [
      { q: 'What if the bags weigh 52, 44 and 50 with a 50 limit and a $100 fee?', a: 'One bag is over, so the fee is $100. The three bags total 146, within the combined 150, so moving 2 from the first bag into the 44 bag avoids the fee entirely.' },
      { q: 'What if the bags weigh 52, 48 and 61?', a: 'Two bags are over, so the fee is $200. The total is 161 against a combined 150, so at least 11 has to come out of the luggage altogether. Repacking alone cannot fix it.' },
      { q: 'Is a bag exactly at the limit overweight?', a: 'Here it counts as fine, only weights above the limit are over. Your airline may measure differently, so leave a small margin.' },
      { q: 'Do I need to enter four bags?', a: 'No. Only bag 1 is required. Leave the others blank and they are ignored in the fee and the repack test.' },
      { q: 'Does this know my airline\'s rules?', a: 'No. The limit and fee are inputs, so it works for any airline, but you must enter the figures from your own booking or the airline\'s website.' },
      { q: 'Does it convert between lb and kg?', a: 'No. The unit choice is only a label. Enter the limit and the bag weights in the same unit.' },
    ],
  },
  related: ['dimensional-weight', 'airport-leave-time', 'trip-budget', 'weight-converter'],
  examples: [
    {
      // Limit 50: bag 52 is over (1 bag) -> fee 1 × 100 = 100. Over by 2 -> move 2.
      // Total 52 + 44 + 50 = 146 <= 3 × 50 = 150, so leave = 0.
      values: { unit: 'lb', limit: 50, bagFee: 100, bag1: 52, bag2: 44, bag3: 50, bag4: null },
      expect: { fee: 100, over: 1, move: 2, leave: 0 },
    },
    {
      // Bags 52 and 61 are over (2 bags) -> fee 200. Overages 2 + 11 = 13.
      // Total 52 + 48 + 61 = 161; allowance 150; leave 11.
      values: { unit: 'lb', limit: 50, bagFee: 100, bag1: 52, bag2: 48, bag3: 61, bag4: null },
      expect: { fee: 200, over: 2, move: 13, leave: 11 },
    },
    {
      // Limit 23 kg, fee 75, bags 22.5 and 23: none over -> fee 0; total 45.5 <= 46.
      values: { unit: 'kg', limit: 23, bagFee: 75, bag1: 22.5, bag2: 23, bag3: null, bag4: null },
      expect: { fee: 0, over: 0, move: 0, leave: 0 },
    },
  ],
});
