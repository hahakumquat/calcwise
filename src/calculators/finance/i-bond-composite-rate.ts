import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

// Rounds to 2 decimals of a percent, with a tiny nudge so 4.015 rounds up despite binary floating point.
const round2 = (pct: number) => Math.round(pct * 100 + 1e-7) / 100;

export default defineCalculator({
  slug: 'i-bond-composite-rate',
  title: 'I Bond Composite Rate Calculator',
  category: 'finance',
  description: 'Turn an I bond fixed rate and semiannual inflation rate into the composite rate, annual rate and about six months of interest on your purchase.',
  keywords: ['i bond calculator', 'i bond composite rate', 'series i savings bond', 'savings bond interest', 'i bond fixed rate', 'treasurydirect i bond'],
  updated: '2026-11-28',
  inputs: [
    { id: 'amount', label: 'Purchase amount', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'How much you put into the I bond. Electronic I bonds can be bought in any amount from $25 up to the annual purchase limit.' },
    { id: 'fixed', label: 'Fixed rate', type: 'number', suffix: '%', default: 1, min: 0, max: 10, step: 0.01, info: 'The fixed rate for the bond, set on the month you buy it and unchanged for the life of the bond. Enter the rate shown at treasurydirect.gov. It cannot be negative.' },
    { id: 'infl', label: 'Semiannual inflation rate', type: 'number', suffix: '%', default: 1.5, min: -10, max: 20, step: 0.01, info: 'The six-month inflation rate announced by the Treasury, not the yearly figure. It can be negative in a deflation period. Enter it as announced.' },
  ],
  outputs: [
    { id: 'composite', label: 'Composite rate (annual)', format: 'number', precision: 2, suffix: '%', primary: true, info: 'Fixed rate + 2 × semiannual inflation + fixed × semiannual inflation, rounded to the nearest 0.01 percent and never below 0.' },
    { id: 'interest6', label: 'Interest for six months', format: 'currency', precision: 2, info: 'Purchase amount × composite rate ÷ 2. About right; Treasury interest is added monthly and compounds twice a year.' },
    { id: 'annual', label: 'Interest for a year at this rate', format: 'currency', precision: 2, info: 'Purchase amount × composite rate, ignoring compounding.' },
    { id: 'inflPart', label: 'Inflation part of the rate', format: 'number', precision: 2, suffix: '%', info: '2 × semiannual inflation + fixed × semiannual inflation, before rounding the total.' },
  ],
  compute: (v) => {
    const amount = num(v.amount);
    const fixed = num(v.fixed);
    const infl = num(v.infl);
    if (amount === null || fixed === null || infl === null) return { composite: null };
    if (fixed < 0) return { composite: null, error: 'The fixed rate cannot be negative. I bonds have a fixed rate of 0% or more.' };
    if (amount < 0) return { composite: null, error: 'The purchase amount cannot be negative.' };
    const f = fixed / 100;
    const s = infl / 100;
    const raw = f + 2 * s + f * s; // TreasuryDirect formula, as a decimal
    const rawPct = raw * 100;
    const composite = Math.max(0, round2(rawPct));
    const interest6 = (amount * composite) / 200;
    const annual = (amount * composite) / 100;
    const inflPart = (2 * s + f * s) * 100;
    const floored = rawPct < 0;
    return {
      composite,
      interest6,
      annual,
      inflPart,
      tone: composite > 0 ? 'good' : 'warn',
      badge: floored ? 'Rate floored at 0%' : `${composite.toFixed(2)}% for the next 6 months`,
      chart: {
        type: 'bar',
        title: 'What makes up the composite rate (% a year)',
        categories: ['Fixed rate', 'Inflation part', 'Composite'],
        series: [{ name: 'Rate', values: [fixed, inflPart, composite] }],
        format: { format: 'number', precision: 2, suffix: '%' },
        highlight: 2,
      },
      steps: [
        `Raw rate = ${fixed.toFixed(2)}% + 2 × ${infl.toFixed(2)}% + ${fixed.toFixed(2)}% × ${infl.toFixed(2)}% = ${rawPct.toFixed(5)}%`,
        floored ? 'The result is below zero, so the composite rate is floored at 0.00%.' : `Rounded to the nearest 0.01 percent: ${composite.toFixed(2)}%`,
        `Six months of interest ≈ ${money(amount)} × ${composite.toFixed(2)}% ÷ 2 = ${money(interest6)}`,
      ],
      note: 'Rates reset every 1 May and 1 November, and the fixed rate stays the same for the 30-year life of the bond. You cannot cash an I bond in the first 12 months, and cashing before 5 years costs the last 3 months of interest. Check current rates and rules at treasurydirect.gov before you buy. This is an estimate, not advice.',
    };
  },
  content: {
    formula: [
      'Composite rate = fixed + 2 × semiannual inflation + fixed × semiannual inflation (all as decimals)',
      'Rounded to the nearest 0.01 percent; never below 0',
      'Six-month interest ≈ amount × composite rate ÷ 2',
    ],
    body: [
      'A Series I savings bond earns a composite rate made of two parts: a fixed rate that is set when you buy the bond and never changes, and an inflation rate that the Treasury recalculates twice a year. The Treasury publishes the formula on TreasuryDirect, and this calculator applies it to the numbers you enter.',
      'You type in the fixed rate and the semiannual inflation rate yourself, so the result is only as current as those two inputs. Look up the fixed rate for your purchase month and the latest announced inflation rate at treasurydirect.gov. The calculator does not assume any current rate.',
      'The composite rate applies for six months at a time. New rates are announced for each 1 May and 1 November. The fixed rate stays for 30 years. You cannot redeem an I bond during the first 12 months, and if you cash it in before 5 years you lose the last 3 months of interest.',
    ],
    faq: [
      { q: 'What is the composite rate in the example?', a: 'With a 1.00% fixed rate and 1.50% semiannual inflation, the raw rate is 0.0100 + 0.0300 + 0.00015 = 0.04015. Rounded to the nearest 0.01 percent that is 4.02%. On $5,000, six months of interest is about 5,000 × 0.0402 ÷ 2 = $100.50.' },
      { q: 'How often does the I bond rate change?', a: 'The inflation part is reset every six months, on 1 May and 1 November. Your own bond follows a six-month cycle from the month you bought it. The fixed rate does not change.' },
      { q: 'Can the composite rate be negative?', a: 'No. If deflation pushes the formula below zero, the composite rate is floored at 0%, and the bond value does not fall.' },
      { q: 'Is there a penalty for cashing out early?', a: 'You cannot cash an I bond in the first 12 months. Before 5 years you lose the last 3 months of interest. After 5 years there is no penalty.' },
      { q: 'Why is the six-month interest only approximate?', a: 'The Treasury adds interest monthly and compounds it every six months, and its rounding differs slightly. This calculator uses amount × composite rate ÷ 2, which is close for a single period.' },
    ],
    sources: [
      { label: 'TreasuryDirect: Series I savings bonds, interest rates', url: 'https://www.treasurydirect.gov/savings-bonds/i-bonds/i-bonds-interest-rates/' },
    ],
  },
  related: ['savings-interest-after-tax', 'cd-ladder', 'apy-calculator'],
  examples: [
    // 0.01 + 2*0.015 + 0.01*0.015 = 0.04015 -> 4.02%; 5000*0.0402/2 = 100.50; yearly 201.00; inflation part 3.015
    { values: { amount: 5000, fixed: 1, infl: 1.5 }, expect: { composite: 4.02, interest6: 100.5, annual: 201, inflPart: 3.015 }, tolerance: 1e-6 },
    // 0.0 + 2*0.0125 + 0 = 0.025 -> 2.50%; 10000*0.025/2 = 125
    { values: { amount: 10000, fixed: 0, infl: 1.25 }, expect: { composite: 2.5, interest6: 125 }, tolerance: 1e-6 },
    // 0.005 + 2*(-0.03) + 0.005*(-0.03) = -0.05515 -> floored at 0
    { values: { amount: 1000, fixed: 0.5, infl: -3 }, expect: { composite: 0, interest6: 0 }, tolerance: 1e-6 },
  ],
});
