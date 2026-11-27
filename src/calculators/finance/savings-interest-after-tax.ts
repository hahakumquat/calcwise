import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'savings-interest-after-tax',
  title: 'Savings Interest After Tax Calculator',
  seoTitle: 'Savings Interest After Tax Calculator',
  metaDescription: 'See what a savings account really pays after tax: interest earned, tax owed, after-tax yield and the real yield after inflation, from one balance and APY.',
  updated: '2026-11-27',
  category: 'finance',
  description: 'Turn a savings balance and APY into interest, tax, after-tax yield and the real yield after inflation.',
  keywords: ['savings interest after tax calculator', 'high yield savings after tax', 'after tax apy', '1099-int interest tax', 'real yield savings account'],
  popular: false,
  inputs: [
    { id: 'balance', label: 'Savings balance', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'One year of interest on this balance, with no deposits or withdrawals.' },
    { id: 'apy', label: 'APY', type: 'number', suffix: '%', default: 4.5, min: 0, max: 100, step: 0.05, info: 'The annual percentage yield your account pays.' },
    { id: 'fed', label: 'Federal marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 99, step: 1, info: 'Your own estimate of your federal bracket. The calculator does not look anything up.' },
    { id: 'state', label: 'State tax rate (optional)', type: 'number', suffix: '%', default: 2, min: 0, max: 99, step: 0.5, info: 'Leave at 0 if your state does not tax interest.' },
    { id: 'infl', label: 'Inflation (optional)', type: 'number', suffix: '%', default: 3, min: 0, max: 100, step: 0.1, info: 'Used for the real yield. Set 0 to ignore it.' },
  ],
  outputs: [
    { id: 'aftertaxInterest', label: 'Interest kept after tax', format: 'currency', precision: 2, primary: true, info: 'Interest minus tax.' },
    { id: 'interest', label: 'Interest earned', format: 'currency', precision: 2, info: 'Balance × APY.' },
    { id: 'tax', label: 'Tax on the interest', format: 'currency', precision: 2, info: 'Interest × (federal + state rate).' },
    { id: 'aty', label: 'After-tax yield', format: 'number', precision: 3, suffix: '%', info: 'APY × (1 − combined rate).' },
    { id: 'real', label: 'Real after-tax yield', format: 'number', precision: 3, suffix: '%', info: '(1 + after-tax yield) ÷ (1 + inflation) − 1.' },
  ],
  compute: (v) => {
    const b = num(v.balance), a = num(v.apy), f = num(v.fed), s = num(v.state), i = num(v.infl);
    if (b === null || a === null || f === null || s === null || i === null) return { interest: null };
    if (b < 0 || a < 0 || f < 0 || s < 0 || i < 0) return { interest: null, error: 'Values cannot be negative.' };
    const rate = f + s;
    if (rate >= 100) return { interest: null, error: 'Federal plus state rate must be below 100%.' };
    const k = 1 - rate / 100;
    const interest = b * a / 100;
    const tax = interest * rate / 100;
    const kept = interest - tax;
    const aty = a * k;
    const real = ((1 + aty / 100) / (1 + i / 100) - 1) * 100;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Where one year of interest goes ($)',
      categories: ['Kept', 'Tax'],
      series: [{ name: 'Interest', values: [kept, tax] }],
      format: { format: 'currency' },
    };
    return {
      interest, tax, aftertaxInterest: kept, aty, real,
      tone: real >= 0 ? 'ok' : 'warn',
      badge: real >= 0 ? 'Beats inflation after tax' : 'Loses to inflation after tax',
      chart,
      steps: [
        `Interest = $${b} × ${a}% = $${+interest.toFixed(2)}`,
        `Combined tax rate = ${f}% + ${s}% = ${+rate.toFixed(2)}%, tax = $${+tax.toFixed(2)}`,
        `After-tax yield = ${a}% × ${+k.toFixed(4)} = ${+aty.toFixed(3)}%`,
        `Real yield = ${+(1 + aty / 100).toFixed(5)} ÷ ${+(1 + i / 100).toFixed(4)} − 1 = ${+real.toFixed(3)}%`,
      ],
      note: 'Adding federal and state rates ignores that state tax may be deductible federally. Interest is reported on Form 1099-INT. This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'Interest = balance × APY',
      'Tax = interest × (federal rate + state rate)',
      'After-tax yield = APY × (1 − combined rate)',
      'Real after-tax yield = (1 + after-tax yield) ÷ (1 + inflation) − 1',
    ],
    body: [
      'Interest from a savings account is taxed as ordinary income, so the APY on the sign-up page is not what you keep. The bank reports it to you on Form 1099-INT, and the tax comes out of your own return.',
      'Enter a balance, the APY, your federal marginal rate and, if it applies, a state rate. The calculator shows the interest, the tax, what you keep, the after-tax yield and the real yield once inflation is taken out.',
      'Rates are inputs, so use your own bracket. This page covers one year with no deposits and gives no tax advice.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          '$10,000 at 4.5% earns $450. At a 24% combined rate the tax is $108, so you keep $342, an after-tax yield of 3.42%. With 3% inflation the real yield is 1.0342 ÷ 1.03 − 1 = 0.408%: you stay ahead, but only just.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The tax-equivalent yield calculator compares tax-free and taxable yields, the savings account switch calculator shows the gain from a better APY, and the real rate of return calculator adjusts any return for inflation.',
        ],
      },
    ],
    faq: [
      { q: 'How much tax do I pay on savings interest?', a: 'Interest is taxed as ordinary income at your marginal rate. At 24% combined, $450 of interest costs $108 in tax and leaves $342.' },
      { q: 'What is the after-tax yield?', a: 'APY × (1 − combined tax rate). A 4.5% APY at 24% is 3.42% after tax.' },
      { q: 'What is the real yield?', a: 'The after-tax yield adjusted for inflation: (1 + after-tax yield) ÷ (1 + inflation) − 1. With 3.42% and 3% inflation it is 0.408%.' },
      { q: 'Is state tax added to the federal rate?', a: 'Here it is, as a simple estimate. In practice state tax may be deductible federally, so the true combined rate can be a little lower.' },
    ],
    sources: [],
  },
  related: ['tax-equivalent-yield', 'savings-account-switch', 'real-rate-of-return'],
  examples: [
    // 10000*.045=450; k=.76; tax 108; kept 342; aty 3.42; real 1.0342/1.03-1=0.4077670%
    { values: { balance: 10000, apy: 4.5, fed: 22, state: 2, infl: 3 }, expect: { interest: 450, tax: 108, aftertaxInterest: 342, aty: 3.42, real: 0.407767 }, tolerance: 1e-4 },
    // 20000*.04=800; rate 30% tax 240; kept 560; aty 2.8; real 0 infl => 2.8
    { values: { balance: 20000, apy: 4, fed: 24, state: 6, infl: 0 }, expect: { interest: 800, tax: 240, aftertaxInterest: 560, aty: 2.8, real: 2.8 }, tolerance: 1e-6 },
  ],
});
