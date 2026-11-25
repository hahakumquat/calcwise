import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'bulk-buy-break-even',
  title: 'Bulk Buy Break-Even With Spoilage Calculator',
  category: 'finance',
  description: 'Check whether the bulk pack still saves money once spoilage is counted. Enter both packs, your use rate and shelf life to see the real cost per unit.',
  keywords: ['bulk buy calculator', 'is buying in bulk cheaper', 'bulk buying spoilage', 'bulk vs small pack break even', 'warehouse bulk savings'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'bulkPrice', label: 'Bulk pack price', type: 'number', prefix: '$', default: 24, min: 0, step: 0.5, info: 'What the big pack costs.' },
    { id: 'bulkUnits', label: 'Units in the bulk pack', type: 'number', default: 48, min: 1, step: 1, info: 'Items, ounces, rolls or servings, as long as both packs use the same unit.' },
    { id: 'smallPrice', label: 'Small pack price', type: 'number', prefix: '$', default: 5, min: 0, step: 0.5, info: 'What the regular pack costs.' },
    { id: 'smallUnits', label: 'Units in the small pack', type: 'number', default: 6, min: 1, step: 1, info: 'Same unit as the bulk pack.' },
    { id: 'use', label: 'Units you use per week', type: 'number', default: 2, min: 0, step: 0.5, info: 'How fast you actually go through it.' },
    { id: 'shelf', label: 'Shelf life', type: 'number', suffix: 'weeks', default: 20, min: 0, step: 1, info: 'How long it stays good after you buy it. Anything left after that is thrown out.' },
  ],
  outputs: [
    { id: 'effective', label: 'Real cost per unit, bulk', format: 'currency', precision: 3, primary: true, info: 'Bulk price ÷ units you actually use.' },
    { id: 'small', label: 'Cost per unit, small pack', format: 'currency', precision: 3, info: 'Small price ÷ small units.' },
    { id: 'savings', label: 'Savings with bulk', format: 'currency', precision: 2, info: 'What the units you use would cost in small packs − the bulk price. Negative means bulk loses.' },
    { id: 'wastePct', label: 'Share wasted', format: 'number', suffix: '%', precision: 0, info: 'Units thrown out ÷ units in the bulk pack.' },
    { id: 'breakEven', label: 'Break-even units used', format: 'number', precision: 1, info: 'Bulk price ÷ small-pack cost per unit. Use at least this many.' },
  ],
  compute: (v) => {
    const bulkPrice = num(v.bulkPrice);
    const bulkUnits = num(v.bulkUnits);
    const smallPrice = num(v.smallPrice);
    const smallUnits = num(v.smallUnits);
    const use = num(v.use);
    const shelf = num(v.shelf);
    if (bulkPrice === null || bulkUnits === null || smallPrice === null || smallUnits === null || use === null || shelf === null) return { effective: null };
    if (bulkPrice < 0 || bulkUnits <= 0 || smallPrice <= 0 || smallUnits <= 0 || use <= 0 || shelf <= 0) return { effective: null };
    const used = Math.min(bulkUnits, use * shelf);
    const wasted = bulkUnits - used;
    const effective = bulkPrice / used;
    const small = smallPrice / smallUnits;
    const savings = used * small - bulkPrice;
    const wastePct = (wasted / bulkUnits) * 100;
    const breakEven = bulkPrice / small;
    const wins = savings >= 0;
    return {
      effective,
      small,
      savings,
      wastePct,
      breakEven,
      tone: wins ? 'good' : 'warn',
      badge: wins ? `Bulk saves ${money(savings)}` : `Bulk costs ${money(-savings)} more`,
      note: `You would use ${fmt(used)} of ${fmt(bulkUnits, 0)} units before they spoil, so bulk really costs ${money(effective)} a unit against ${money(small)} for the small pack. You need to use at least ${fmt(breakEven)} units for bulk to win.`,
      chart: {
        type: 'bar' as const,
        title: 'Cost per unit you use',
        categories: ['Small pack', 'Bulk pack'],
        series: [{ name: 'Cost per unit', values: [small, effective] }],
        format: CURRENCY,
        highlight: wins ? 1 : 0,
      },
      steps: [
        `Units used = min(${fmt(bulkUnits, 0)}, ${fmt(use)} × ${fmt(shelf, 0)} weeks) = ${fmt(used, 2)}`,
        `Real bulk cost per unit = ${money(bulkPrice)} ÷ ${fmt(used, 2)} = ${money(effective)}`,
        `Small pack per unit = ${money(smallPrice)} ÷ ${fmt(smallUnits, 0)} = ${money(small)}`,
        `Savings = ${fmt(used, 2)} × ${money(small)} − ${money(bulkPrice)} = ${money(savings)}`,
      ],
    };
  },
  content: {
    formula: [
      'Units used = smaller of (bulk units, use per week × shelf life in weeks)',
      'Real bulk cost per unit = bulk price ÷ units used',
      'Savings = units used × small-pack cost per unit − bulk price',
      'Break-even units = bulk price ÷ small-pack cost per unit',
    ],
    body: [
      'A bulk pack only saves money if you finish it. This calculator counts what spoils before you use it, then compares the real cost per unit with the small pack.',
      'Example: a $24 pack of 48 against $5 for 6. Using 2 a week with a 20-week shelf life, you get through 40 units and throw out 8. Bulk really costs $0.60 a unit against $0.833. The 40 units would cost $33.33 in small packs, so bulk saves $9.33. Break-even is 28.8 units.',
      'It assumes both packs share a unit, and that you use the same amount either way. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'When is buying in bulk not worth it?', a: 'When you use fewer units than the break-even figure before the shelf life ends. The calculator shows that number.' },
      { q: 'What if I freeze it?', a: 'Enter the longer shelf life you get from freezing it.' },
      { q: 'Does it include storage or membership costs?', a: 'No. For a membership, see the warehouse membership break-even calculator.' },
      { q: 'How is spoilage worked out?', a: 'Use per week times shelf life gives units you can use. Anything in the pack beyond that counts as thrown out.' },
    ],
    sources: [],
  },
  related: ['unit-price', 'warehouse-membership-break-even'],
  examples: [
    // used min(48,40)=40; eff 24/40=.6; small 5/6=.83333; savings 40*.83333-24=9.3333; waste 8/48=16.667%; breakeven 24/.83333=28.8
    { values: { bulkPrice: 24, bulkUnits: 48, smallPrice: 5, smallUnits: 6, use: 2, shelf: 20 }, expect: { effective: 0.6, small: 5 / 6, savings: 40 * (5 / 6) - 24, wastePct: (8 / 48) * 100, breakEven: 28.8 } },
    // used min(10,2*2=4)=4; eff 10/4=2.5; small 4/4=1; savings 4-10=-6; waste 60%; breakeven 10
    { values: { bulkPrice: 10, bulkUnits: 10, smallPrice: 4, smallUnits: 4, use: 2, shelf: 2 }, expect: { effective: 2.5, small: 1, savings: -6, wastePct: 60, breakEven: 10 } },
  ],
});
