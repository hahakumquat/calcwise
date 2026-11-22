import { defineCalculator } from '../../lib/types';
import type { ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct, CURRENCY } from '../../lib/helpers/finance';

// Balance after `months` months: B = B * (1 + r/12) + contribution, contribution added at month end.
function balance(start: number, monthly: number, netPct: number, months: number): number {
  const i = netPct / 100 / 12;
  let b = start;
  for (let m = 0; m < months; m++) b = b * (1 + i) + monthly;
  return b;
}

export default defineCalculator({
  slug: 'investment-fee-drag',
  title: 'Investment Fee Drag Calculator',
  category: 'finance',
  description: 'See what a 1% fund fee costs over decades: two funds with different expense ratios, side by side, with the final balances and the gap.',
  keywords: ['investment fee calculator', 'expense ratio calculator', 'fund fees over time', 'cost of 1% fee', 'index fund vs actively managed', 'fee drag'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'start', label: 'Starting balance', type: 'number', prefix: '$', default: 10000, min: 0, step: 1000, info: 'What you have invested today. Use 0 if you are starting from scratch.' },
    { id: 'monthly', label: 'Monthly contribution', type: 'number', prefix: '$', default: 500, min: 0, step: 50, info: 'Added at the end of every month.' },
    { id: 'gross', label: 'Gross annual return', type: 'number', suffix: '%', default: 7, min: 0, max: 30, step: 0.5, info: 'The return before fund fees. An assumption, not a promise; real returns change every year.' },
    { id: 'years', label: 'Years invested', type: 'number', default: 30, min: 1, max: 60, step: 1, info: 'How long the money stays invested.' },
    { id: 'feeA', label: 'Fund A annual fee', type: 'number', suffix: '%', default: 0.05, min: 0, max: 5, step: 0.01, info: 'The expense ratio of the lower-cost fund, e.g. 0.05% for a broad index fund. Check your fund\'s fact sheet.' },
    { id: 'feeB', label: 'Fund B annual fee', type: 'number', suffix: '%', default: 1, min: 0, max: 5, step: 0.01, info: 'The expense ratio of the higher-cost fund, e.g. 1.00% for some actively managed funds or advisor-wrapped portfolios.' },
  ],
  outputs: [
    { id: 'drag', label: 'What the higher fee costs you', format: 'currency', primary: true, info: 'Final balance of the cheaper fund minus the final balance of the dearer one.' },
    { id: 'balanceA', label: 'Fund A final balance', format: 'currency', info: 'Gross return minus fund A\'s fee, compounded monthly with month-end contributions.' },
    { id: 'balanceB', label: 'Fund B final balance', format: 'currency', info: 'Gross return minus fund B\'s fee, compounded monthly with month-end contributions.' },
    { id: 'contributed', label: 'Total you put in', format: 'currency', info: 'Starting balance plus every monthly contribution. The same for both funds.' },
    { id: 'shareLost', label: 'Share of the cheaper balance lost', format: 'percent', precision: 1, info: 'The gap divided by the cheaper fund\'s final balance.' },
  ],
  compute: (v) => {
    const start = num(v.start) ?? 0;
    const monthly = num(v.monthly) ?? 0;
    const gross = num(v.gross);
    const yearsIn = num(v.years);
    const feeA = num(v.feeA) ?? 0;
    const feeB = num(v.feeB) ?? 0;
    if (gross === null || yearsIn === null) return { drag: null };
    if (start < 0 || monthly < 0 || feeA < 0 || feeB < 0) return { drag: null, error: 'Amounts and fees cannot be negative.' };
    if (start === 0 && monthly === 0) return { drag: null, error: 'Enter a starting balance or a monthly contribution.' };
    if (yearsIn < 1) return { drag: null, error: 'Enter at least 1 year.' };
    const years = Math.round(yearsIn);
    const months = years * 12;
    const netA = gross - feeA;
    const netB = gross - feeB;
    if (netA <= -100 || netB <= -100) return { drag: null, error: 'A fee that large leaves no return to compound.' };
    const balA = balance(start, monthly, netA, months);
    const balB = balance(start, monthly, netB, months);
    const contributed = start + monthly * months;
    const drag = balA - balB;
    const shareLost = balA > 0 ? drag / balA : 0;

    const x: number[] = [];
    const sa: number[] = [];
    const sb: number[] = [];
    for (let y = 0; y <= years; y++) {
      x.push(y);
      sa.push(balance(start, monthly, netA, y * 12));
      sb.push(balance(start, monthly, netB, y * 12));
    }
    const chart: ChartSpec = {
      type: 'line',
      title: 'Balance over the years',
      x,
      xLabel: 'Years',
      xFormat: { format: 'integer' },
      yFormat: CURRENCY,
      series: [
        { name: `Fund A (${+feeA.toFixed(2)}% fee)`, values: sa },
        { name: `Fund B (${+feeB.toFixed(2)}% fee)`, values: sb },
      ],
    };

    const diff = Math.abs(drag);
    const same = diff < 0.005;
    const tone = same ? 'ok' : drag > 0 ? 'bad' : 'good';
    const badge = same ? 'Same fee' : drag > 0 ? 'Fund B costs more' : 'Fund A costs more';
    return {
      drag,
      balanceA: balA,
      balanceB: balB,
      contributed,
      shareLost,
      tone,
      badge,
      chart,
      steps: [
        `Net return A = ${gross}% − ${feeA}% = ${+netA.toFixed(4)}%; net return B = ${gross}% − ${feeB}% = ${+netB.toFixed(4)}%`,
        `Each month: balance = balance × (1 + net rate ÷ 12) + ${money(monthly)}, repeated ${months} times`,
        `Fund A ends at ${money(balA, 0)}; fund B ends at ${money(balB, 0)}`,
        `Difference = ${money(drag, 0)} on ${money(contributed, 0)} contributed (${pct(shareLost, 1)} of fund A's balance)`,
      ],
      note: same
        ? 'Both funds charge the same fee, so they end at the same balance.'
        : `Over ${years} years the ${drag > 0 ? 'higher' : 'lower'} fee leaves you ${money(diff, 0)} ${drag > 0 ? 'behind' : 'ahead'}, ${pct(Math.abs(shareLost), 1)} of the cheaper balance. This assumes a constant return, which real markets never give.`,
    };
  },
  content: {
    formula: [
      'Net return = gross return − annual fee',
      'Each month: balance = balance × (1 + net return ÷ 12) + monthly contribution',
      'Repeat for 12 × years months, once per fund; fee drag = balance A − balance B',
    ],
    body: [
      'A fund fee looks small because it is quoted as a percentage of your balance each year. But it comes out of your return every year, so it also removes the growth that money would have earned later. Over decades the gap grows faster than the fee suggests.',
      'Take $10,000 plus $500 a month for 30 years at a 7% gross return. A fund charging 0.05% grows at 6.95% and ends near $683,965. A fund charging 1.00% grows at 6.00% and ends near $562,483. You put in $190,000 either way, yet the higher fee leaves you about $121,482 behind, roughly 18% of the cheaper balance.',
      'The calculator assumes a constant return, which real markets never give, and it ignores taxes, trading costs and inflation. A higher-fee fund may deliver a different gross return from a cheaper one; this tool shows the cost of the fee when everything else is equal, so you can judge what extra return it would need to justify itself.',
    ],
    faq: [
      { q: 'How much does a 1% fund fee cost over 30 years?', a: 'With $10,000 to start, $500 a month and a 7% gross return, a 1.00% fee ends at about $562,483 versus about $683,965 at 0.05%. That is a gap of about $121,482 on $190,000 contributed.' },
      { q: 'Why is the gap bigger than 1% of my money?', a: 'The fee is taken every year from a growing balance, and each dollar lost also stops earning for the remaining years. Here the 0.95 percentage points of extra fee shrink the final balance by about 18%.' },
      { q: 'Where do I find my fund\'s fee?', a: 'Look for the expense ratio on the fund\'s fact sheet or prospectus. Advisor or platform fees are charged on top, so add them to the fund fee for a fuller picture.' },
      { q: 'Does this predict my returns?', a: 'No. It assumes a constant return, which real markets never give. Real returns vary year to year; the fee comparison is the useful part, not the exact dollar figures.' },
    ],
    sources: [
      { label: 'Mutual fund fees and expenses (Investor.gov, SEC)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/mutual-fund-fees-and-expenses' },
      { label: 'Fees and expenses (FINRA)', url: 'https://www.finra.org/investors/investing/investment-products/mutual-funds' },
    ],
  },
  related: ['investment', 'compound-interest', 'cost-of-waiting', 'retirement', 'rule-of-72', 'savings-goal'],
  examples: [
    // Net 6.95% vs 6.00%, 360 months of B = B*(1+r/12)+500, checked with a script: 683,965.10 and 562,483.27; gap 121,481.83; contributed 10,000 + 500*360 = 190,000.
    { values: { start: 10000, monthly: 500, gross: 7, years: 30, feeA: 0.05, feeB: 1 }, expect: { balanceA: 683965.1, balanceB: 562483.27, drag: 121481.83, contributed: 190000 }, tolerance: 0.01 },
    // No contributions, 1 year: 1000 x (1.005)^12 = 1061.68 (6% net) vs 1000 x (1 + 0.05/12)^12 = 1051.16 (5% net); gap 10.52.
    { values: { start: 1000, monthly: 0, gross: 6, years: 1, feeA: 0, feeB: 1 }, expect: { balanceA: 1061.678, balanceB: 1051.162, drag: 10.516, contributed: 1000 }, tolerance: 0.01 },
    // 0% return, no fees: just the money put in, 100 x 120 = 12,000.
    { values: { start: 0, monthly: 100, gross: 0, years: 10, feeA: 0, feeB: 0 }, expect: { balanceA: 12000, balanceB: 12000, drag: 0, contributed: 12000 }, tolerance: 1e-6 },
  ],
});
