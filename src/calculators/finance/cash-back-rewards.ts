import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CATS = [
  { id: 'groceries', label: 'Groceries', spend: 600, rate: 3 },
  { id: 'dining', label: 'Dining', spend: 300, rate: 3 },
  { id: 'gas', label: 'Gas and transit', spend: 150, rate: 2 },
  { id: 'other', label: 'Everything else', spend: 450, rate: 1 },
] as const;

export default defineCalculator({
  slug: 'cash-back-rewards',
  title: 'Cash Back Rewards Calculator',
  category: 'finance',
  description: 'Add up the cash back a card earns across groceries, dining, gas and other spending, take off the annual fee, and compare it with a simple flat-rate card.',
  keywords: ['cash back calculator', 'cash back rewards calculator', 'credit card cash back by category', 'how much cash back will I earn', 'best cash back card', 'cash back vs flat rate card'],
  updated: '2026-11-21',
  inputs: [
    ...CATS.flatMap((c) => [
      { id: `${c.id}Spend`, label: `${c.label}: monthly spend`, type: 'number' as const, prefix: '$', default: c.spend, min: 0, step: 25, info: `What you spend on ${c.label.toLowerCase()} each month, on this card.` },
      { id: `${c.id}Rate`, label: `${c.label}: cash back rate`, type: 'number' as const, suffix: '%', default: c.rate, min: 0, step: 0.5, info: 'The cash back percent the card pays in this category. Use the rate from the card terms.' },
    ]),
    { id: 'fee', label: 'Annual fee', type: 'number', prefix: '$', default: 95, min: 0, step: 5, optional: true, info: 'What the card charges each year. Use 0 for a no-fee card.' },
    { id: 'flatRate', label: 'Flat-rate card to compare', type: 'number', suffix: '%', default: 2, min: 0, step: 0.25, optional: true, info: 'A no-fee card that pays the same percent on everything. Used as the benchmark.' },
  ],
  outputs: [
    { id: 'net', label: 'Net cash back per year', format: 'currency', primary: true, info: 'Cash back earned across all categories over 12 months, minus the annual fee.' },
    { id: 'gross', label: 'Cash back before the fee', format: 'currency', info: 'Sum of monthly spend × rate for each category, times 12.' },
    { id: 'effective', label: 'Effective rate on all spend', format: 'percent', precision: 2, info: 'Cash back before the fee ÷ total spend.' },
    { id: 'flat', label: 'Flat-rate card per year', format: 'currency', info: 'Total yearly spend × the flat rate.' },
    { id: 'advantage', label: 'This card vs flat-rate card', format: 'currency', info: 'Net cash back minus the flat-rate card. Positive means this card earns more.' },
  ],
  compute: (v) => {
    const fee = num(v.fee) ?? 0;
    const flatRate = num(v.flatRate) ?? 0;
    const rows: { label: string; spend: number; rate: number }[] = [];
    for (const c of CATS) {
      const spend = num(v[`${c.id}Spend`]);
      const rate = num(v[`${c.id}Rate`]);
      if (spend === null || rate === null) return { net: null, note: 'Enter a monthly spend and a cash back rate for each category.' };
      rows.push({ label: c.label, spend, rate });
    }
    if (fee < 0 || flatRate < 0 || rows.some((r) => r.spend < 0 || r.rate < 0)) return { net: null, error: 'Values cannot be negative.' };
    const monthlyBack = rows.map((r) => (r.spend * r.rate) / 100);
    const grossMonthly = monthlyBack.reduce((a, b) => a + b, 0);
    const gross = grossMonthly * 12;
    const spendYear = rows.reduce((a, r) => a + r.spend, 0) * 12;
    if (spendYear === 0) return { net: null, note: 'Enter some monthly spending to see the cash back.' };
    const net = gross - fee;
    const flat = (spendYear * flatRate) / 100;
    const adv = net - flat;
    return {
      net,
      gross,
      effective: gross / spendYear,
      flat,
      advantage: adv,
      tone: adv > 0 ? 'good' : adv === 0 ? 'ok' : 'warn',
      badge: adv > 0 ? 'Beats the flat-rate card' : adv === 0 ? 'Even with flat rate' : 'Flat-rate card wins',
      chart: {
        type: 'bar',
        title: 'Cash back per year by category',
        categories: rows.map((r) => r.label),
        series: [{ name: 'Cash back', values: monthlyBack.map((m) => m * 12) }],
        format: { format: 'currency' },
      },
      steps: [
        ...rows.map((r, i) => `${r.label}: ${usd(r.spend)} × ${r.rate}% = ${usd(monthlyBack[i])} a month`),
        `Before the fee: ${usd(grossMonthly)} × 12 = ${usd(gross)} on ${usd(spendYear)} of spend`,
        `After the fee: ${usd(gross)} − ${usd(fee)} = ${usd(net)}`,
        `Flat-rate card: ${usd(spendYear)} × ${flatRate}% = ${usd(flat)}, so the difference is ${usd(adv)}`,
      ],
      note: 'Cash back only counts if you pay the statement in full each month. Interest on a balance usually costs more than the rewards. Category caps and rotating rates are not modelled.',
    };
  },
  content: {
    formula: [
      'Monthly cash back = Σ (category spend × category rate)',
      'Yearly cash back = monthly cash back × 12',
      'Net cash back = yearly cash back − annual fee',
      'Effective rate = yearly cash back ÷ yearly spend',
      'Flat-rate card = yearly spend × flat rate',
    ],
    body: [
      'Many cash back cards pay a higher rate on a few categories and a low base rate on everything else. The headline rate is rarely what you earn, because your own spending is split across all of them. This calculator multiplies what you spend in each category by that category\'s rate, adds it up, and takes off the annual fee.',
      'The effective rate shows the blended percent you really earn on your total spending. Compare it with the flat-rate card, which pays one rate on everything with no fee. The category card only wins if your spending lands in its bonus categories often enough to cover the fee and beat the flat rate.',
      'Rates are inputs, so you can type in any card\'s terms. Look at a recent statement or your bank app to estimate monthly spend per category. Enter 0 for a category you do not use.',
      'This ignores spending caps, rotating categories, sign-up bonuses, and the value of points that are not worth a cent each. For points cards see the points value calculator, and for one card\'s fee in detail see the credit card annual fee calculator.',
    ],
    faq: [
      { q: 'How much cash back does the default example earn?', a: 'Groceries $600 × 3% = $18, dining $300 × 3% = $9, gas $150 × 2% = $3 and everything else $450 × 1% = $4.50. That is $34.50 a month, or $414 a year, on $18,000 of spend.' },
      { q: 'What is the effective rate in that example?', a: '$414 ÷ $18,000 = 2.3%. That is the blended rate across all categories, before the fee.' },
      { q: 'Does a $95 fee make it worth it against a 2% flat card?', a: 'Not in this example. After the fee the card earns $414 − $95 = $319. The 2% flat card earns $18,000 × 2% = $360, so the flat card is $41 ahead.' },
      { q: 'What if the card has no annual fee?', a: 'Then the net equals the cash back before the fee. With a $0 fee, the same spending earns $414 against $360, so the category card is $54 ahead.' },
    ],
    sources: [
      { label: 'Cash back (Investopedia)', url: 'https://www.investopedia.com/terms/c/cash-back.asp' },
    ],
  },
  related: ['credit-card-annual-fee', 'points-value', 'credit-card-payoff', 'foreign-transaction-fee'],
  examples: [
    // monthly: 600*.03=18, 300*.03=9, 150*.02=3, 450*.01=4.5 => 34.5; gross 414; spend 1500*12=18000
    // net 414-95=319; effective 414/18000=0.023; flat 18000*.02=360; adv 319-360=-41
    { values: { groceriesSpend: 600, groceriesRate: 3, diningSpend: 300, diningRate: 3, gasSpend: 150, gasRate: 2, otherSpend: 450, otherRate: 1, fee: 95, flatRate: 2 }, expect: { net: 319, gross: 414, effective: 0.023, flat: 360, advantage: -41 }, tolerance: 1e-6 },
    // no fee: net 414; flat 360; adv 54
    { values: { groceriesSpend: 600, groceriesRate: 3, diningSpend: 300, diningRate: 3, gasSpend: 150, gasRate: 2, otherSpend: 450, otherRate: 1, fee: 0, flatRate: 2 }, expect: { net: 414, gross: 414, flat: 360, advantage: 54 }, tolerance: 1e-6 },
    // groceries only: 1000*.05=50/mo => 600/yr; spend 12000; fee 0; effective 0.05; flat 12000*.02=240; adv 360
    { values: { groceriesSpend: 1000, groceriesRate: 5, diningSpend: 0, diningRate: 0, gasSpend: 0, gasRate: 0, otherSpend: 0, otherRate: 0, fee: 0, flatRate: 2 }, expect: { net: 600, gross: 600, effective: 0.05, flat: 240, advantage: 360 }, tolerance: 1e-6 },
  ],
});
