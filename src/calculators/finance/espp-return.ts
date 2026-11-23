import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'espp-return',
  title: 'ESPP Return Calculator: Discount and Lookback',
  category: 'finance',
  description: 'See what an ESPP purchase is worth: purchase price, shares bought, value at purchase and your return on the contribution, with and without the lookback.',
  keywords: ['espp calculator', 'espp return calculator', 'espp discount and lookback', 'employee stock purchase plan return', 'espp instant gain', 'espp lookback provision'],
  updated: '2026-11-23',
  inputs: [
    { id: 'contribution', label: 'Contribution for the offering period', type: 'number', prefix: '$', default: 6000, min: 0, step: 100, info: 'The total taken from your pay over the offering period, which is what buys shares on the purchase date.' },
    { id: 'discount', label: 'Plan discount', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'The discount your plan applies to the price. 15% is the most common maximum under a qualified plan.' },
    { id: 'start', label: 'Stock price at offering start', type: 'number', prefix: '$', default: 40, min: 0, step: 0.5, info: 'Share price on the first day of the offering period.' },
    { id: 'end', label: 'Stock price at purchase date', type: 'number', prefix: '$', default: 50, min: 0, step: 0.5, info: 'Share price on the day your plan buys the shares.' },
    { id: 'lookback', label: 'Lookback provision', type: 'toggle', default: true, info: 'On: the discount applies to the lower of the start and purchase prices. Off: it applies to the purchase price only. Check your plan documents.' },
  ],
  outputs: [
    { id: 'returnPct', label: 'Return on your contribution', format: 'percent', precision: 2, primary: true, info: 'Instant gain divided by your contribution, before tax and before any later change in price.' },
    { id: 'purchasePrice', label: 'Purchase price per share', format: 'currency', info: 'Lower of start and purchase price (with lookback) or the purchase price (without), times (1 − discount).' },
    { id: 'shares', label: 'Shares bought', format: 'number', precision: 4, info: 'Contribution ÷ purchase price. Many plans buy whole shares only, so your count may be rounded down.' },
    { id: 'value', label: 'Value at purchase date', format: 'currency', info: 'Shares × the stock price on the purchase date.' },
    { id: 'gain', label: 'Instant gain', format: 'currency', info: 'Value at purchase date minus your contribution, before tax.' },
  ],
  compute: (v) => {
    const c = num(v.contribution);
    const d = num(v.discount);
    const start = num(v.start);
    const end = num(v.end);
    if (c === null || d === null || start === null || end === null) return { returnPct: null };
    if (c < 0 || d < 0 || start < 0 || end < 0) return { returnPct: null, error: 'Values cannot be negative.' };
    if (d >= 100) return { returnPct: null, error: 'The discount must be below 100%.' };
    if (c === 0 || end === 0 || start === 0) return { returnPct: null, note: 'Enter a contribution and both stock prices to see the result.' };
    const lookback = v.lookback === 'on';
    const base = lookback ? Math.min(start, end) : end;
    const price = base * (1 - d / 100);
    const shares = c / price;
    const value = shares * end;
    const gain = value - c;
    const ret = gain / c;
    // Same purchase without lookback, for the chart comparison
    const noLbPrice = end * (1 - d / 100);
    const noLbValue = (c / noLbPrice) * end;
    const lbValue = lookback ? value : (c / (Math.min(start, end) * (1 - d / 100))) * end;
    return {
      returnPct: ret,
      purchasePrice: price,
      shares,
      value,
      gain,
      tone: ret >= 0.15 ? 'good' : ret > 0 ? 'ok' : 'warn',
      badge: lookback && start < end ? 'Lookback is boosting your discount' : ret > 0 ? 'Discount is paying off' : 'No discount',
      chart: {
        type: 'bar',
        title: 'Value at purchase vs. what you put in',
        categories: ['Contribution', 'Without lookback', 'With lookback'],
        series: [{ name: 'Value', values: [c, noLbValue, lbValue] }],
        format: { format: 'currency' },
      },
      steps: [
        `Base price: ${lookback ? `lower of ${usd(start)} and ${usd(end)}` : `purchase date price`} = ${usd(base)}`,
        `Purchase price: ${usd(base)} × (1 − ${d}%) = ${usd(price)}`,
        `Shares: ${usd(c)} ÷ ${usd(price)} = ${shares.toFixed(4)}`,
        `Value: ${shares.toFixed(4)} × ${usd(end)} = ${usd(value)}`,
        `Gain: ${usd(value)} − ${usd(c)} = ${usd(gain)}, a return of ${(ret * 100).toFixed(2)}%`,
      ],
      note: 'This is the gain on paper at the purchase date, before tax. Tax treatment (qualifying vs disqualifying dispositions) and plan limits, such as the $25,000 IRS cap on the fair market value you can buy per year, are not computed. Check your plan documents and irs.gov.',
    };
  },
  content: {
    formula: [
      'Purchase price = (lower of start and purchase price with lookback, or purchase price without) × (1 − discount)',
      'Shares = contribution ÷ purchase price',
      'Value at purchase date = shares × purchase date price',
      'Instant gain = value − contribution',
      'Return = gain ÷ contribution',
    ],
    body: [
      'An employee stock purchase plan (ESPP) lets you buy your employer\'s stock through payroll deductions at a discount, often up to 15%. Money builds up over an offering period, then the plan buys shares on the purchase date. This calculator shows the purchase price, how many shares you get, what they are worth that day and your return on the money you contributed.',
      'Many plans add a lookback. The discount is applied to the lower of the price at the start of the offering and the price on the purchase date. If the stock rose during the period, the lookback sets your price off the older, lower number, so the effective discount is much larger than 15%. If the stock fell, the lookback does nothing extra, because the purchase price is already the lower one.',
      'The return shown is the instant gain on paper if you valued the shares at the purchase date price. It is not the return after you sell: the price can move afterwards, and tax applies. Selling right away versus holding is a separate decision, and the tax result depends on how long you hold.',
      'What this does not compute: tax treatment (qualifying vs disqualifying dispositions), your plan\'s limits such as the $25,000 IRS cap on the fair market value of stock you can buy in a calendar year, whole-share rounding, fees, and currency. Check your plan documents and irs.gov for those. For other equity pay see the RSU tax and stock option exercise calculators.',
    ],
    faq: [
      { q: 'How does the lookback change my return?', a: 'With $6,000 contributed, a 15% discount, a $40 start price and a $50 purchase price, the lookback sets your price at $40 × 0.85 = $34.00. You get 176.4706 shares worth $8,823.53, an instant gain of $2,823.53, or 47.06%. Without the lookback the price is $50 × 0.85 = $42.50, giving 141.1765 shares worth $7,058.82, a gain of $1,058.82, or 17.65%.' },
      { q: 'What if the stock falls during the offering?', a: 'The lookback uses the lower price, which is then the purchase date price, so you get the plain discount. At a 15% discount, your instant return is about 17.65% (1 ÷ 0.85 − 1) however far the stock fell. You are still exposed to further drops after you buy.' },
      { q: 'Is this gain taxed?', a: 'Yes, in some form, but this calculator does not compute it. How the discount and later gain are taxed depends on whether your sale is a qualifying or disqualifying disposition. Check IRS Publication 525 and irs.gov, or ask a tax professional.' },
      { q: 'Is there a limit on how much I can buy?', a: 'Under a qualified plan the IRS limits purchases to $25,000 of stock fair market value per calendar year, measured at the offering start price, and your plan may set a lower cap. This calculator does not apply any limit, so check your plan documents.' },
      { q: 'Is the return guaranteed?', a: 'No. It is the value on the purchase date. If you hold the shares, their price can fall below what you paid, and you could lose money on the position.' },
    ],
    sources: [
      { label: 'IRS: Employee stock purchase plans (Topic 427)', url: 'https://www.irs.gov/taxtopics/tc427' },
      { label: 'IRS Publication 525: Taxable and Nontaxable Income', url: 'https://www.irs.gov/publications/p525' },
    ],
  },
  related: ['rsu-tax', 'stock-option-exercise', 'stock-profit-calculator'],
  examples: [
    // 40 × 0.85 = 34; 6000/34 = 176.470588; value 176.470588 × 50 = 8823.5294; gain 2823.5294; return 0.470588
    { values: { contribution: 6000, discount: 15, start: 40, end: 50, lookback: 'on' }, expect: { purchasePrice: 34, shares: 176.4706, value: 8823.53, gain: 2823.53, returnPct: 0.4706 }, tolerance: 1e-3 },
    // 50 × 0.85 = 42.5; 6000/42.5 = 141.176471; value 7058.8235; gain 1058.8235; return 0.176471
    { values: { contribution: 6000, discount: 15, start: 40, end: 50, lookback: 'off' }, expect: { purchasePrice: 42.5, shares: 141.1765, value: 7058.82, gain: 1058.82, returnPct: 0.1765 }, tolerance: 1e-3 },
    // stock fell: lookback min(50,40)=40 → 34; same as above start/end swapped: 6000/34 × 40 = 7058.8235
    { values: { contribution: 6000, discount: 15, start: 50, end: 40, lookback: 'on' }, expect: { purchasePrice: 34, value: 7058.82, returnPct: 0.1765 }, tolerance: 1e-3 },
  ],
});
