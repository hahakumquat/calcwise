import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'treasury-bill-yield',
  title: 'Treasury Bill Yield Calculator',
  category: 'finance',
  description: 'Turn a T-bill price into its discount rate and investment yield, see your dollar gain, and find the price implied by a quoted discount rate.',
  metaDescription: 'Treasury bill yield calculator: enter face value, price and days to maturity to get the discount rate, investment yield and dollar gain, or price from a rate.',
  updated: '2026-11-26',
  keywords: ['treasury bill yield calculator', 't-bill calculator', 'treasury bill discount rate', 'bond equivalent yield calculator', 't-bill price from discount rate', 'investment rate t-bill'],
  inputs: [
    { id: 'face', label: 'Face value', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'The amount the bill pays at maturity (par value).' },
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 9800, min: 0, step: 0.01, info: 'What you pay today. A T-bill sells below face value; the difference is your interest.' },
    { id: 'days', label: 'Days to maturity', type: 'number', suffix: 'days', default: 182, min: 1, step: 1, info: 'Calendar days from purchase to maturity, such as 28, 91, 182 or 364.' },
    { id: 'quoted', label: 'Quoted discount rate (for price)', type: 'number', suffix: '% a year', default: 4, min: 0, step: 0.01, info: 'Optional: a discount rate from an auction or quote. Used only for the "price from this rate" result.' },
  ],
  outputs: [
    { id: 'discount', label: 'Discount rate', format: 'percent', precision: 3, primary: true, info: '(Face − price) ÷ face × 360 ÷ days. The way T-bill rates are usually quoted.' },
    { id: 'yield', label: 'Investment yield (365-day)', format: 'percent', precision: 3, info: '(Face − price) ÷ price × 365 ÷ days. Return on what you actually pay, on a 365-day year.' },
    { id: 'gain', label: 'Dollar gain at maturity', format: 'currency', info: 'Face value minus purchase price.' },
    { id: 'priceFromRate', label: 'Price at the quoted discount rate', format: 'currency', info: 'Face × (1 − rate × days ÷ 360).' },
  ],
  compute: (v) => {
    const F = num(v.face);
    const P = num(v.price);
    const d = num(v.days);
    const q = num(v.quoted);
    if (F === null || P === null || d === null) return { discount: null };
    if (F <= 0 || P <= 0 || d <= 0) return { discount: null, error: 'Face value, price and days must all be above zero.' };
    if (P >= F) return { discount: null, error: 'The price must be below face value. A T-bill sold at or above face value earns nothing.' };
    const gain = F - P;
    const discount = (gain / F) * (360 / d);
    const yld = (gain / P) * (365 / d);
    let priceFromRate: number | null = null;
    if (q !== null && q >= 0) {
      priceFromRate = F * (1 - (q / 100) * d / 360);
      if (priceFromRate <= 0) priceFromRate = null;
    }
    const pct = (x: number) => +(x * 100).toFixed(3);
    return {
      discount,
      yield: yld,
      gain,
      priceFromRate,
      tone: 'ok',
      badge: `${pct(yld)}% yield`,
      chart: {
        type: 'bar',
        title: 'Discount rate vs investment yield (% a year)',
        categories: ['Discount rate', 'Investment yield'],
        series: [{ name: '% a year', values: [pct(discount), pct(yld)] }],
      },
      steps: [
        `Gain = ${money(F)} − ${money(P)} = ${money(gain)}`,
        `Discount rate = ${money(gain)} ÷ ${money(F)} × 360 ÷ ${d} = ${pct(discount)}%`,
        `Investment yield = ${money(gain)} ÷ ${money(P)} × 365 ÷ ${d} = ${pct(yld)}%`,
        'The yield is higher because it divides by the smaller price you paid and uses a 365-day year. Longer bills are quoted with semiannual compounding by the Treasury, so this simple figure is an estimate for them.',
      ],
    };
  },
  content: {
    formula: [
      'Discount rate = (F − P) ÷ F × 360 ÷ d',
      'Investment yield = (F − P) ÷ P × 365 ÷ d',
      'Price from discount rate = F × (1 − rate × d ÷ 360)',
    ],
    body: [
      'A Treasury bill pays no coupon. You buy it below face value and receive the full face value at maturity, and the difference is your interest. Because of that, its return can be quoted two ways.',
      'The discount rate measures the gain as a share of the face value, on a 360-day year. The investment yield measures the same gain as a share of the price you paid, on a 365-day year, so it is the fairer figure to compare with a savings account or CD. This calculator uses 365 days, not 366, even in a leap year.',
      'With a $10,000 face value bought at $9,800 with 182 days to go, your gain is $200. The discount rate is 200 ÷ 10,000 × 360 ÷ 182 = 3.956%, and the investment yield is 200 ÷ 9,800 × 365 ÷ 182 = 4.093%.',
      'This is the simple version of the formulas. For bills longer than 182 days the official bond-equivalent yield uses a slightly different, compounded formula, so treat the result as an estimate there. Check the exact rate on your confirmation.',
    ],
    faq: [
      { q: 'What is the difference between the discount rate and the investment yield?', a: 'The discount rate divides the gain by the face value and uses a 360-day year. The investment yield divides by the price you paid and uses 365 days. For $10,000 face, $9,800 price and 182 days, they are 3.956% and 4.093%.' },
      { q: 'How do I find the price from a discount rate?', a: 'Price = face × (1 − rate × days ÷ 360). A 4% discount rate on $10,000 with 91 days to maturity gives $10,000 × (1 − 0.04 × 91 ÷ 360) = $9,898.89.' },
      { q: 'How much do I earn on a $10,000 bill bought at $9,900 with 91 days left?', a: 'You earn $100. That is a 3.956% discount rate and a 4.052% investment yield.' },
      { q: 'Does this use 365 or 366 days?', a: 'It always uses 365 for the investment yield, even in a leap year, and 360 for the discount rate.' },
    ],
    sources: [
      { label: 'TreasuryDirect: Treasury bills', url: 'https://www.treasurydirect.gov/marketable-securities/treasury-bills/' },
      { label: 'Investor.gov: Treasury bills (SEC)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/treasury' },
    ],
  },
  related: ['apy-calculator', 'cd-ladder', 'simple-interest'],
  examples: [
    // gain 200; discount = 200/10000*360/182 = 0.0395604; yield = 200/9800*365/182 = 0.0409285; price at 4%, 182d = 10000*(1-0.04*182/360) = 9797.7778
    { values: { face: 10000, price: 9800, days: 182, quoted: 4 }, expect: { discount: 0.0395604, yield: 0.0409285, gain: 200, priceFromRate: 9797.7778 }, tolerance: 0.0001 },
    // gain 100; discount = 0.01*360/91 = 0.0395604; yield = 100/9900*365/91 = 0.0405150; price at 4%, 91d = 10000*(1-0.04*91/360) = 9898.8889
    { values: { face: 10000, price: 9900, days: 91, quoted: 4 }, expect: { discount: 0.0395604, yield: 0.040515, gain: 100, priceFromRate: 9898.8889 }, tolerance: 0.0001 },
  ],
});
