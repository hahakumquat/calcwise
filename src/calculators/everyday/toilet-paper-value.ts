import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const money = (x: number, d = 2) => `$${x.toFixed(d)}`;

export default defineCalculator({
  slug: 'toilet-paper-value',
  title: 'Toilet Paper Value Calculator',
  category: 'everyday',
  description: 'Compare two toilet paper packs by cost per 100 sheets and per roll to see which is the better deal, and how much cheaper it is.',
  keywords: ['toilet paper cost per sheet', 'toilet paper price comparison', 'cost per 100 sheets', 'best value toilet paper', 'mega roll vs regular roll', 'bath tissue unit price'],
  updated: '2026-11-27',
  inputs: [
    { id: 'priceA', label: 'Pack A price', type: 'number', prefix: '$', default: 24, min: 0, step: 0.01, info: 'The shelf price of pack A, after any discount or coupon.' },
    { id: 'rollsA', label: 'Pack A rolls', type: 'number', default: 24, min: 0, step: 1, info: 'The number of rolls in pack A, as printed on the package.' },
    { id: 'sheetsA', label: 'Pack A sheets per roll', type: 'number', default: 200, min: 0, step: 1, help: 'Use the printed sheet count, not "mega" or "double" claims.', info: 'The sheets per roll printed on the label. For "mega" or "double" rolls, enter the sheet count printed, not the marketing claim.' },
    { id: 'priceB', label: 'Pack B price', type: 'number', prefix: '$', default: 18, min: 0, step: 0.01, info: 'The shelf price of pack B.' },
    { id: 'rollsB', label: 'Pack B rolls', type: 'number', default: 12, min: 0, step: 1, info: 'The number of rolls in pack B.' },
    { id: 'sheetsB', label: 'Pack B sheets per roll', type: 'number', default: 400, min: 0, step: 1, info: 'The sheets per roll printed on the label for pack B.' },
  ],
  outputs: [
    { id: 'best', label: 'Better value', format: 'text', primary: true, info: 'The pack with the lower cost per sheet.' },
    { id: 'saving', label: 'Saving per sheet with the better pack', format: 'percent', precision: 1, info: '1 minus the cheaper cost per sheet divided by the dearer one.' },
    { id: 'costA', label: 'Pack A cost per 100 sheets', format: 'currency', precision: 4, info: 'Pack A price divided by its total sheets, times 100.' },
    { id: 'costB', label: 'Pack B cost per 100 sheets', format: 'currency', precision: 4, info: 'Pack B price divided by its total sheets, times 100.' },
    { id: 'rollA', label: 'Pack A cost per roll', format: 'currency', precision: 2, info: 'Pack A price divided by its number of rolls.' },
    { id: 'rollB', label: 'Pack B cost per roll', format: 'currency', precision: 2, info: 'Pack B price divided by its number of rolls.' },
    { id: 'sheetsTotalA', label: 'Pack A total sheets', format: 'integer', info: 'Rolls times sheets per roll.' },
    { id: 'sheetsTotalB', label: 'Pack B total sheets', format: 'integer', info: 'Rolls times sheets per roll.' },
  ],
  compute: (v) => {
    const pA = num(v.priceA), rA = num(v.rollsA), sA = num(v.sheetsA);
    const pB = num(v.priceB), rB = num(v.rollsB), sB = num(v.sheetsB);
    if (pA === null || rA === null || sA === null || pB === null || rB === null || sB === null) return { best: null };
    if (pA <= 0 || rA <= 0 || sA <= 0 || pB <= 0 || rB <= 0 || sB <= 0) {
      return { best: null, error: 'Enter a value above 0 for every price, roll count and sheet count.' };
    }
    const totA = rA * sA;
    const totB = rB * sB;
    const costA = (pA / totA) * 100;
    const costB = (pB / totB) * 100;
    const rollA = pA / rA;
    const rollB = pB / rB;
    const same = Math.abs(costA - costB) < 1e-12;
    const lo = Math.min(costA, costB);
    const hi = Math.max(costA, costB);
    const saving = same ? 0 : 1 - lo / hi;
    const winner = costA < costB ? 'A' : 'B';
    const best = same ? 'Same cost per sheet' : `Pack ${winner}`;
    const note = same
      ? 'Both packs cost the same per sheet, so there is no saving. Choose on sheet size, ply or how many rolls you want to store.'
      : `Pack ${winner} is ${(saving * 100).toFixed(1)}% cheaper per sheet. Sheet size and ply differ between brands, so a cheaper sheet is not always a cheaper clean.`;
    return {
      best,
      saving,
      costA,
      costB,
      rollA,
      rollB,
      sheetsTotalA: totA,
      sheetsTotalB: totB,
      tone: same ? 'warn' : 'ok',
      badge: same ? 'Tie' : `${(saving * 100).toFixed(1)}% cheaper`,
      note,
      chart: {
        type: 'bar',
        title: 'Cost per 100 sheets (lower is better)',
        categories: ['Pack A', 'Pack B'],
        series: [{ name: 'Cost per 100 sheets', values: [costA, costB] }],
        format: { format: 'currency', precision: 3 },
        ...(same ? {} : { highlight: winner === 'A' ? 0 : 1 }),
      },
      steps: [
        `A: ${rA} rolls × ${sA} sheets = ${totA} sheets; ${money(pA)} ÷ ${totA} × 100 = ${money(costA, 4)} per 100 sheets`,
        `B: ${rB} rolls × ${sB} sheets = ${totB} sheets; ${money(pB)} ÷ ${totB} × 100 = ${money(costB, 4)} per 100 sheets`,
        same ? 'The cost per sheet is equal, so the saving is 0%' : `Saving = 1 − ${money(lo, 4)} ÷ ${money(hi, 4)} = ${(saving * 100).toFixed(1)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Total sheets = rolls × sheets per roll',
      'Cost per 100 sheets = price ÷ total sheets × 100',
      'Saving = 1 − cheaper cost per sheet ÷ dearer cost per sheet',
    ],
    body: [
      'Roll counts are a poor guide to value, because a "mega" or "family" roll can hold anywhere from 200 to 400 sheets. Multiplying rolls by sheets per roll gives the total sheets in each pack, and dividing the price by that total gives a fair cost per 100 sheets.',
      'Enter the price, number of rolls and sheets per roll for two packs. Use the sheet count printed on the label, not marketing claims such as "double" or "mega" rolls. The calculator also shows the cost per roll, which is handy when you compare against your usual brand.',
      'For example, a $24.00 pack of 24 rolls with 200 sheets each has 4,800 sheets, or $0.50 per 100. A $18.00 pack of 12 rolls with 400 sheets each also has 4,800 sheets, but costs $0.375 per 100, which is 25.0% cheaper. The second pack costs $1.50 per roll against $1.00, yet it is the better buy.',
      'Sheet size and ply differ between brands, and this calculator counts sheets only. A thicker 2-ply or a larger sheet may last longer, so treat the result as the price of paper by the sheet, then adjust for what you actually prefer.',
    ],
    faq: [
      { q: 'How do I compare toilet paper prices fairly?', a: 'Multiply rolls by sheets per roll to get total sheets, then divide the price by total sheets and multiply by 100. That gives the cost per 100 sheets for each pack.' },
      { q: 'Is a $24 pack of 24 rolls with 200 sheets cheaper than $18 for 12 rolls with 400 sheets?', a: 'No. Both packs hold 4,800 sheets. The $24 pack costs $0.50 per 100 sheets and the $18 pack costs $0.375, so the $18 pack is 25.0% cheaper.' },
      { q: 'What if a pack says "mega" or "double" rolls?', a: 'Ignore the claim and enter the sheet count printed on the package. Marketing terms compare to a brand\'s own regular roll, not to other brands.' },
      { q: 'Does sheet size or ply matter?', a: 'Yes. Sheet size and ply differ between brands, and this calculator counts sheets only. A bigger or thicker sheet may do more work per sheet.' },
      { q: 'What if both packs cost the same per sheet?', a: 'The calculator reports a tie with a 0% saving. A $15.00 pack of 12 rolls with 250 sheets each is 3,000 sheets, or $0.50 per 100, the same as the $24.00 example.' },
    ],
    sources: [],
  },
  related: ['unit-price', 'diaper-cost'],
  examples: [
    // A: 24 x 200 = 4800 sheets; 24 / 4800 * 100 = 0.50. B: 12 x 400 = 4800; 18 / 4800 * 100 = 0.375. Saving = 1 - 0.375/0.5 = 0.25.
    { values: { priceA: 24, rollsA: 24, sheetsA: 200, priceB: 18, rollsB: 12, sheetsB: 400 }, expect: { costA: 0.5, costB: 0.375, rollA: 1, rollB: 1.5, sheetsTotalA: 4800, sheetsTotalB: 4800, saving: 0.25 }, tolerance: 1e-9 },
    // A = B: 12 x 250 = 3000 sheets; 15 / 3000 * 100 = 0.50 for both, so no saving.
    { values: { priceA: 15, rollsA: 12, sheetsA: 250, priceB: 15, rollsB: 12, sheetsB: 250 }, expect: { costA: 0.5, costB: 0.5, sheetsTotalA: 3000, saving: 0 }, tolerance: 1e-9 },
    // A 15 / 3000 * 100 = 0.50; B 30 / (24 x 200 = 4800) * 100 = 0.625; saving = 1 - 0.5 / 0.625 = 0.2
    { values: { priceA: 15, rollsA: 12, sheetsA: 250, priceB: 30, rollsB: 24, sheetsB: 200 }, expect: { costA: 0.5, costB: 0.625, rollA: 1.25, rollB: 1.25, saving: 0.2 }, tolerance: 1e-9 },
  ],
});
