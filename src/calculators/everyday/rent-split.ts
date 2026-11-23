import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const N = 4;
const rooms = Array.from({ length: N }, (_, i) => i + 1);

export default defineCalculator({
  slug: 'rent-split',
  title: 'Rent Split by Room Size Calculator',
  category: 'everyday',
  description: 'Split rent between roommates by room size, with an optional share for common areas and a flat premium for perks like an ensuite bathroom or parking.',
  keywords: ['rent split calculator', 'split rent by room size', 'roommate rent calculator', 'fair rent split', 'rent split by square footage', 'split rent unequal rooms'],
  updated: '2026-11-17',
  inputs: [
    { id: 'rent', label: 'Total monthly rent', type: 'number', prefix: '$', default: 2000, min: 0, step: 10, info: 'The full rent for the home each month, before utilities.' },
    { id: 'common', label: 'Share of rent for common space', type: 'number', suffix: '%', default: 40, min: 0, max: 100, step: 5, optional: true, info: 'The part of the rent that pays for shared areas (kitchen, living room, hall). It is split equally between everyone. Use 0 to split the whole rent by room size.' },
    ...rooms.flatMap((n) => [
      { id: `area${n}`, label: `Room ${n} size`, type: 'number' as const, suffix: 'sq ft', ...(n <= 2 ? { default: n === 1 ? 150 : 100 } : { optional: true }), min: 0, step: 5, info: n === 1 ? 'The floor area of the private room. Leave a room blank or at 0 to leave that person out.' : 'Floor area of this private room in square feet. Blank or 0 means no one lives here.' },
      { id: `prem${n}`, label: `Room ${n} premium`, type: 'number' as const, prefix: '$', optional: true, min: 0, step: 5, info: 'A flat monthly amount this person pays for a perk such as an ensuite bathroom, a balcony or a parking spot. It comes off the pool before the rest is shared by size.' },
    ]),
  ],
  outputs: [
    { id: 'pay1', label: 'Room 1 pays', format: 'currency', primary: true, info: 'Equal share of common space + premium + share of the private pool by room size.' },
    ...rooms.slice(1).map((n) => ({ id: `pay${n}`, label: `Room ${n} pays`, format: 'currency' as const, info: `Room ${n}’s equal share of common space, plus its premium, plus its share of the private pool by room size.` })),
    { id: 'commonEach', label: 'Common space, each', format: 'currency', info: 'Rent × common share ÷ number of people.' },
    { id: 'pool', label: 'Private pool split by size', format: 'currency', info: 'Rent × (1 − common share) minus all premiums. This is shared in proportion to room area.' },
    { id: 'perSqft', label: 'Pool price per sq ft', format: 'currency', precision: 2, info: 'The private pool divided by the total room area.' },
  ],
  compute: (v) => {
    const rent = num(v.rent);
    const c = (num(v.common) ?? 0) / 100;
    const areas = rooms.map((n) => num(v[`area${n}`]) ?? 0);
    const prems = rooms.map((n) => num(v[`prem${n}`]) ?? 0);
    if (rent === null || rent <= 0) return { pay1: null };
    if (areas.some((a) => a < 0) || prems.some((p) => p < 0) || c < 0 || c > 1) return { pay1: null, error: 'Sizes, premiums and percentages cannot be negative, and the common share must be 0–100%.' };
    const active = areas.map((a) => a > 0);
    const count = active.filter(Boolean).length;
    if (count < 2) return { pay1: null, error: 'Enter at least two room sizes.' };
    const totalArea = areas.reduce((a, b) => a + b, 0);
    const commonEach = (rent * c) / count;
    const premSum = prems.reduce((a, b, i) => a + (active[i] ? b : 0), 0);
    const pool = rent * (1 - c) - premSum;
    if (pool < 0) return { pay1: null, error: 'The premiums are larger than the private part of the rent. Lower them or raise the private share.' };
    const perSqft = pool / totalArea;
    const pays = areas.map((a, i) => (active[i] ? commonEach + prems[i] + perSqft * a : null));

    const out: Record<string, number | string | null | ChartSpec | string[] | undefined> = { commonEach, pool, perSqft };
    pays.forEach((p, i) => { out[`pay${i + 1}`] = p; });
    const slices = pays.flatMap((p, i) => (p === null ? [] : [{ label: `Room ${i + 1}`, value: p }]));
    const chart: ChartSpec = { type: 'donut', title: 'Who pays what', format: { format: 'currency' }, slices, centerValue: money(rent, 2), centerLabel: 'rent' };
    const steps = [
      `Common space = ${money(rent)} × ${+(c * 100).toFixed(2)}% = ${money(rent * c)}, so ${money(commonEach)} each for ${count} people.`,
      `Private pool = ${money(rent)} × ${+((1 - c) * 100).toFixed(2)}% − ${money(premSum)} premiums = ${money(pool)}.`,
      `Price per sq ft = ${money(pool)} ÷ ${+totalArea.toFixed(2)} sq ft = ${money(perSqft, 4)}.`,
    ];
    pays.forEach((p, i) => {
      if (p !== null) steps.push(`Room ${i + 1} = ${money(commonEach)} + ${money(prems[i])} + ${+areas[i].toFixed(2)} × ${money(perSqft, 4)} = ${money(p)}.`);
    });
    return {
      ...out,
      tone: 'ok',
      badge: `${count} people, ${money(rent)} rent`,
      chart,
      note: 'This is a fair starting point for a conversation, not a rule. Light, noise and who has the closet can matter as much as square feet. Shares are rounded to the cent for display.',
      steps,
    };
  },
  content: {
    formula: [
      'Common each = rent × common % ÷ number of people',
      'Pool = rent × (1 − common %) − premiums',
      'Room pays = common each + own premium + pool × own area ÷ total area',
    ],
    body: [
      'Splitting rent evenly is easy, but it rarely feels fair when one roommate has a much bigger room. This calculator splits the rent by room size instead. Enter the rent and the size of each private room, and each person pays in proportion to the space they use.',
      'Shared rooms such as the kitchen and living room belong to everyone, so you can set aside a share of the rent for common space and split that part equally. Set it to 0% to split the whole rent by room size. Perks like an ensuite bathroom or a parking spot can be priced as a flat premium, which is taken out first and charged only to the person who has it.',
      'Use the result as a starting point for a conversation. It is arithmetic, not a rule: you can always nudge the numbers for light, noise or the best closet.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Rent is $2,000 and two roommates have rooms of 150 and 100 sq ft. With 40% set aside for common space, $800 is split equally, $400 each. The remaining $1,200 is split by size: $1,200 ÷ 250 sq ft = $4.80 per sq ft, so $720 and $480. The totals are $1,120 and $880, which add up to $2,000.',
          'With 0% common space the whole $2,000 is split by size: $1,200 and $800.',
        ],
      },
    ],
    faq: [
      { q: 'How do I split rent fairly between roommates?', a: 'Split by room size, and share common space equally. For $2,000 rent, rooms of 150 and 100 sq ft and 40% common space, the roommates pay $1,120 and $880.' },
      { q: 'What does the common space share do?', a: 'It sets aside a percentage of the rent for shared areas and divides it equally. At 40% of $2,000 that is $800, or $400 each for two people.' },
      { q: 'How are premiums handled?', a: 'A premium is a flat monthly amount charged to one person and subtracted from the pool before the rest is split by size, so the total always equals the rent.' },
      { q: 'Should I split by square feet or just evenly?', a: 'Neither is a rule. Splitting by size is often seen as fairer when rooms differ a lot. Talk it through and agree before signing.' },
      { q: 'Can I use it for more than four people?', a: 'This calculator has four rooms. For other splits, see the bill splitter for uneven shares.' },
    ],
    sources: [{ label: 'Omni Calculator: rent split calculator (method comparison)', url: 'https://www.omnicalculator.com/finance/rent-split' }],
  },
  related: ['bill-splitter', 'income-based-bill-split', 'rent-affordability', 'tip', 'living-alone-cost', 'house-hacking-offset'],
  examples: [
    // Common 40% = 800 → 400 each. Pool = 1200 / 250 sq ft = 4.8/sq ft → 720 and 480. Totals 1120 and 880.
    { values: { rent: 2000, common: 40, area1: 150, area2: 100 }, expect: { pay1: 1120, pay2: 880, commonEach: 400, pool: 1200, perSqft: 4.8 } },
    // 0% common: 1200 and 800.
    { values: { rent: 2000, common: 0, area1: 150, area2: 100 }, expect: { pay1: 1200, pay2: 800 } },
    // Premium 100 for room 1, 0% common: pool = 1900 / 250 = 7.6; room 1 = 100 + 1140 = 1240; room 2 = 760.
    { values: { rent: 2000, common: 0, area1: 150, area2: 100, prem1: 100 }, expect: { pay1: 1240, pay2: 760 } },
  ],
});
