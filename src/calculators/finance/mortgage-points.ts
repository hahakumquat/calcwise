import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'mortgage-points',
  title: 'Mortgage Points Calculator',
  category: 'finance',
  description: 'Find out if buying discount points on your mortgage pays off: the upfront cost, the monthly saving, and how many months until you break even.',
  keywords: ['mortgage points calculator', 'discount points break even', 'are mortgage points worth it', 'buy down mortgage rate', 'points vs rate'],
  updated: '2026-11-17',
  popular: false,
  inputs: [
    { id: 'loan', label: 'Loan amount', type: 'number', prefix: '$', default: 300000, min: 1, step: 5000, info: 'The amount you borrow, not the home price.' },
    { id: 'rate', label: 'Rate with no points', type: 'number', suffix: '%', default: 7, min: 0, max: 30, step: 0.125, info: 'The interest rate the lender quotes if you buy zero points.' },
    { id: 'points', label: 'Points to buy', type: 'number', default: 1, min: 0, max: 5, step: 0.25, info: 'One point costs 1% of the loan amount.' },
    { id: 'cut', label: 'Rate cut per point', type: 'number', suffix: '%', default: 0.25, min: 0, max: 2, step: 0.125, info: 'Lenders often knock about 0.25% off the rate per point, but it varies. Use the number on your loan estimate.' },
    { id: 'years', label: 'Loan term (years)', type: 'number', default: 30, min: 1, max: 40, step: 1, info: 'Length of the mortgage.' },
    { id: 'stay', label: 'Years you expect to keep the loan', type: 'number', default: 10, min: 0, max: 40, step: 1, info: 'Until you sell or refinance. Points only pay off if you stay past the break-even point.' },
  ],
  outputs: [
    { id: 'breakeven', label: 'Break-even', format: 'number', precision: 1, suffix: ' months', primary: true, info: 'Cost of the points divided by the monthly payment saving.' },
    { id: 'cost', label: 'Cost of points', format: 'currency', precision: 0, info: 'Points × 1% × loan amount, paid at closing.' },
    { id: 'saving', label: 'Monthly saving', format: 'currency', precision: 2, info: 'Payment at the higher rate minus payment at the lower rate.' },
    { id: 'newRate', label: 'Rate after points', format: 'percent', precision: 3, info: 'Starting rate minus the cut per point × points.' },
    { id: 'net', label: 'Net gain or loss at your stay length', format: 'currency', precision: 0, info: 'Monthly saving × months you stay, minus the cost of the points. Ignores what that cash could earn elsewhere.' },
  ],
  compute: (v) => {
    const loan = num(v.loan);
    const rate = num(v.rate);
    const pts = num(v.points);
    const cut = num(v.cut);
    const years = num(v.years);
    const stay = num(v.stay);
    if (loan === null || rate === null || pts === null || cut === null || years === null || stay === null) return { breakeven: null };
    if (loan <= 0 || rate < 0 || pts < 0 || cut < 0 || years < 1) return { breakeven: null };
    const newRate = Math.max(0, rate - pts * cut);
    const n = Math.round(years * 12);
    const payOld = amortizedPayment(loan, rate, n);
    const payNew = amortizedPayment(loan, newRate, n);
    const saving = payOld - payNew;
    const cost = (pts / 100) * loan;
    const months = Math.min(stay * 12, n);
    const net = saving * months - cost;
    const breakeven = cost === 0 ? 0 : saving > 0 ? cost / saving : null;
    if (breakeven === null) return { breakeven: null };
    const marks: number[] = [];
    for (let y = 0; y <= Math.min(years, 15); y++) marks.push(y);
    return {
      breakeven,
      cost,
      saving,
      newRate: newRate / 100,
      net,
      chart: {
        type: 'line',
        title: 'Cumulative saving minus cost of points',
        x: marks,
        xLabel: 'Years',
        series: [{ name: 'Net position', values: marks.map((y) => saving * 12 * y - cost) }],
        yFormat: { format: 'currency', precision: 0 },
      },
      steps: [
        `Points cost = ${fmt(pts, 2)}% × ${money(loan, 0)} = ${money(cost, 0)}`,
        `Payment at ${fmt(rate, 3)}% = ${money(payOld)}; at ${fmt(newRate, 3)}% = ${money(payNew)}`,
        `Saving = ${money(saving)} a month; break-even = ${money(cost, 0)} ÷ ${money(saving)} = ${fmt(breakeven)} months`,
      ],
      note: breakeven === 0 ? 'No points bought, so there is nothing to recover.' : breakeven > months ? `You plan to keep the loan ${fmt(months / 12)} years, which is shorter than the ${fmt(breakeven)}-month break-even. The points would not pay off.` : `Past month ${Math.ceil(breakeven)} the points start saving you money. At ${fmt(months / 12)} years you are ahead by ${money(net, 0)}.`,
    };
  },
  content: {
    formula: [
      'Cost of points = points × 1% × loan amount',
      'Monthly payment = loan × r ÷ (1 − (1 + r)⁻ⁿ), r = yearly rate ÷ 12',
      'Break-even (months) = cost of points ÷ (payment before − payment after)',
    ],
    body: [
      'Mortgage discount points are fees you pay at closing in exchange for a lower interest rate. One point costs 1% of the loan amount and usually lowers the rate by around 0.25%, though lenders differ. The real question is whether you will keep the loan long enough to earn the money back.',
      'For a $300,000 30-year loan at 7%, one point costs $3,000 and drops the rate to 6.75%. The payment falls from $1,995.91 to $1,945.79, a saving of about $50.11 a month. Break-even is $3,000 ÷ $50.11, about 59.9 months, or five years. Keep the loan for ten years and you are about $3,014 ahead; sell after three and you are out roughly $1,200.',
      'This is a simple break-even. It ignores what the cash could earn if invested or used as a larger down payment, and it assumes you never pay the loan down early. Points may be tax deductible in some cases; ask a tax professional. Use the exact rate cut from your Loan Estimate.',
    ],
    faq: [
      { q: 'How many months does it take for mortgage points to pay off?', a: 'Divide the cost of the points by the monthly payment saving. At $3,000 cost and about $50 saved a month, that is roughly 60 months.' },
      { q: 'How much does one point lower the rate?', a: 'Often about 0.25%, but it depends on the lender and market. Check your Loan Estimate and enter the actual figure.' },
      { q: 'Are points worth it if I plan to refinance?', a: 'Rarely. If you might refinance or move before the break-even month, the points will not pay for themselves.' },
      { q: 'What is the difference between points and a lender credit?', a: 'Points cost money now to lower your rate. A lender credit works the other way: you accept a higher rate and the lender reduces your closing costs.' },
    ],
    sources: [
      { label: 'CFPB: What are discount points and lender credits?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-are-points-and-lender-credits-and-how-do-they-work-en-136/' },
    ],
  },
  related: ['mortgage', 'refinance', 'extra-mortgage-payment', 'home-affordability'],
  examples: [
    {
      // 300000 @7%/360: 1995.9075; @6.75%: 1945.7943; saving 50.1132; cost 3000; 3000/50.1132 = 59.86; 120*50.1132-3000 = 3013.58
      values: { loan: 300000, rate: 7, points: 1, cut: 0.25, years: 30, stay: 10 },
      expect: { cost: 3000, saving: 50.11, breakeven: 59.86, newRate: 0.0675, net: 3013.58 },
      tolerance: 1e-2,
    },
    {
      // 400000 @6%: 2398.20; 2 pts at 0.25 -> 5.5%: 2271.16; saving 127.05; cost 8000; 8000/127.05 = 62.97; stay 3y: 36*127.0461-8000 = -3426.34
      values: { loan: 400000, rate: 6, points: 2, cut: 0.25, years: 30, stay: 3 },
      expect: { cost: 8000, saving: 127.05, breakeven: 62.97, net: -3426.34 },
      tolerance: 1e-2,
    },
  ],
});
