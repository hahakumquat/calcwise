import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

// Price of a bond paying semiannual coupons, given the semiannual yield y.
function bondPrice(face: number, coupon: number, n: number, y: number): number {
  if (y === 0) return coupon * n + face;
  return coupon * (1 - Math.pow(1 + y, -n)) / y + face * Math.pow(1 + y, -n);
}

export default defineCalculator({
  slug: 'bond-yield-calculator',
  title: 'Bond Yield to Maturity Calculator',
  category: 'finance',
  description: 'Find a bond’s yield to maturity and current yield from its price, coupon rate, face value and years left. Semiannual coupons, plain-English results.',
  keywords: ['bond yield calculator', 'yield to maturity calculator', 'ytm calculator', 'current yield bond', 'bond price vs yield'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'price', label: 'Bond price', type: 'number', prefix: '$', default: 950, min: 0, step: 1, info: 'What you pay for the bond today (not including accrued interest).' },
    { id: 'face', label: 'Face value', type: 'number', prefix: '$', default: 1000, min: 0, step: 100, info: 'The amount repaid at maturity. Most bonds are $1,000.' },
    { id: 'coupon', label: 'Coupon rate', type: 'number', suffix: '%', default: 5, min: 0, max: 50, step: 0.125, info: 'Yearly interest as a percent of face value, paid twice a year.' },
    { id: 'years', label: 'Years to maturity', type: 'number', suffix: 'years', default: 10, min: 0.5, max: 100, step: 0.5, info: 'Rounded to the nearest half year, since coupons are paid twice a year.' },
  ],
  outputs: [
    { id: 'ytm', label: 'Yield to maturity', format: 'number', precision: 3, suffix: '%', primary: true, info: 'The yearly return if you hold to maturity and every coupon is paid (semiannual rate × 2).' },
    { id: 'current', label: 'Current yield', format: 'number', precision: 3, suffix: '%', info: 'Yearly coupon ÷ price.' },
    { id: 'annualCoupon', label: 'Coupon income per year', format: 'currency', info: 'Face value × coupon rate.' },
    { id: 'totalReturn', label: 'Total profit if held to maturity', format: 'currency', precision: 0, info: 'All coupons plus face value, minus the price paid.' },
  ],
  compute: (v) => {
    const price = num(v.price), face = num(v.face), cr = num(v.coupon), years = num(v.years);
    if (price === null || face === null || cr === null || years === null) return { ytm: null };
    if (price <= 0 || face <= 0 || cr < 0 || years < 0.5) return { ytm: null };
    const n = Math.round(years * 2);
    const c = (face * cr) / 100 / 2;
    // Bisection on the semiannual yield; price falls as yield rises.
    let lo = -0.5, hi = 1;
    if (bondPrice(face, c, n, lo) < price || bondPrice(face, c, n, hi) > price) return { ytm: null };
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (bondPrice(face, c, n, mid) > price) lo = mid; else hi = mid;
    }
    const y = (lo + hi) / 2;
    const ytm = y * 2 * 100;
    const annual = c * 2;
    const total = c * n + face - price;
    const yields: number[] = [];
    const prices: number[] = [];
    for (let p = 1; p <= 12; p++) {
      yields.push(p);
      prices.push(bondPrice(face, c, n, p / 100 / 2));
    }
    return {
      ytm,
      current: (annual / price) * 100,
      annualCoupon: annual,
      totalReturn: total,
      chart: {
        type: 'line',
        title: 'Bond price at different yields',
        x: yields,
        xLabel: 'Yield to maturity (%)',
        yFormat: { format: 'currency' },
        series: [{ name: 'Fair price', values: prices }],
      },
      steps: [
        `${n} coupons of ${money(c)} (half of ${money(annual)} a year), then ${money(face, 0)} at maturity`,
        `Find the semiannual yield y where the present value of those payments equals ${money(price)}`,
        `y = ${(y * 100).toFixed(4)}% per half year, so yield to maturity = ${ytm.toFixed(3)}%`,
      ],
      note: price < face
        ? `You pay less than face value, so your yield (${ytm.toFixed(2)}%) is above the ${cr}% coupon rate.`
        : price > face
          ? `You pay more than face value, so your yield (${ytm.toFixed(2)}%) is below the ${cr}% coupon rate.`
          : `You pay exactly face value, so your yield equals the ${cr}% coupon rate.`,
    };
  },
  content: {
    formula: ['Price = Σ coupon ÷ (1 + y)^t + face ÷ (1 + y)^n, where y is the semiannual yield and n the number of coupons', 'Yield to maturity = y × 2', 'Current yield = yearly coupon ÷ price'],
    body: [
      'Yield to maturity (YTM) is the single yearly rate that makes the present value of all a bond’s remaining payments equal to its price. It assumes you hold the bond until it matures and that every coupon is paid on time.',
      'A bond bought below face value (at a discount) yields more than its coupon rate, because you also gain when it repays the full face value. A bond bought above face value (at a premium) yields less. At exactly face value, the yield equals the coupon rate.',
      'For a $1,000 bond with a 5% coupon and 10 years left, a price of $950 gives a yield to maturity of about 5.66%. The current yield is lower, about 5.26%, because it ignores the $50 gain at maturity.',
      'This calculator uses semiannual coupons, the US convention, and quotes the yield as the semiannual rate doubled (the bond-equivalent yield). It does not include accrued interest, taxes, fees, or the risk of default or early redemption (calls).',
    ],
    faq: [
      { q: 'What is yield to maturity?', a: 'The yearly return you earn if you buy at today’s price, collect every coupon, and hold until the bond repays its face value.' },
      { q: 'Why is my yield higher than the coupon rate?', a: 'Because you paid less than face value. You earn the coupons and also gain the difference when the bond matures at face value.' },
      { q: 'What is the difference between current yield and YTM?', a: 'Current yield is only the yearly coupon divided by the price. YTM also counts the gain or loss between price and face value over the time left.' },
      { q: 'Does this handle callable bonds or accrued interest?', a: 'No. It assumes the bond runs to maturity and uses a clean price with no accrued interest.' },
    ],
    sources: [
      { label: 'Bonds (Investor.gov, SEC)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds' },
      { label: 'Yield to maturity (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Yield_to_maturity' },
    ],
  },
  related: ['present-value', 'npv-irr-calculator', 'cd', 'real-rate-of-return', 'apy-calculator', 'tax-equivalent-yield'],
  examples: [
    { values: { price: 1000, face: 1000, coupon: 5, years: 10 }, expect: { ytm: 5, current: 5, annualCoupon: 50, totalReturn: 500 }, tolerance: 1e-4 },
    { values: { price: 600, face: 1000, coupon: 0, years: 10 }, expect: { ytm: 5.1741, totalReturn: 400 }, tolerance: 0.002 },
    { values: { price: 950, face: 1000, coupon: 5, years: 10 }, expect: { ytm: 5.6617, current: 5.2632, totalReturn: 550 }, tolerance: 0.002 },
  ],
});
