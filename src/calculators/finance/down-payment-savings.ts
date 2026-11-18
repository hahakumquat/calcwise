import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'down-payment-savings',
  title: 'Down Payment Savings Calculator',
  category: 'finance',
  description: 'Find how much to save each month for a house down payment and closing costs, given the home price, what you have saved, your timeline and savings interest.',
  keywords: ['down payment calculator', 'how much to save for a house', 'house down payment savings', 'closing costs', 'home savings plan'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'price', label: 'Home price', type: 'number', prefix: '$', default: 400000, min: 0, step: 5000, info: 'The price of the home you want to buy.' },
    { id: 'down', label: 'Down payment', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'Share of the price you pay up front.' },
    { id: 'closing', label: 'Closing costs', type: 'number', suffix: '%', default: 3, min: 0, max: 20, step: 0.5, info: 'Fees paid at closing, often around 2% to 5% of the price. Use 0 to leave them out.' },
    { id: 'saved', label: 'Already saved', type: 'number', prefix: '$', default: 5000, min: 0, step: 500, optional: true, info: 'Money you have set aside for this goal.' },
    { id: 'apy', label: 'Savings interest (APY)', type: 'number', suffix: '%', default: 4, min: 0, max: 30, step: 0.1, optional: true, info: 'Yearly yield of the account holding the money. Use 0 for none.' },
    { id: 'years', label: 'Years until you buy', type: 'number', default: 3, min: 0.25, max: 40, step: 0.25, info: 'How long you have to save.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Save each month', format: 'currency', precision: 0, primary: true, info: 'Deposit at the end of each month to reach the target on time.' },
    { id: 'target', label: 'Cash needed', format: 'currency', precision: 0, info: 'Down payment plus closing costs.' },
    { id: 'interest', label: 'Interest earned', format: 'currency', precision: 0, info: 'Growth on your savings and deposits.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const down = num(v.down);
    const closing = num(v.closing) ?? 0;
    const saved = num(v.saved) ?? 0;
    const apy = num(v.apy) ?? 0;
    const years = num(v.years);
    if (price === null || down === null || years === null || price <= 0 || down < 0 || down > 100 || closing < 0 || saved < 0 || apy < 0 || years <= 0) return { monthly: null };
    const n = Math.round(years * 12);
    if (n < 1) return { monthly: null };
    const target = (price * (down + closing)) / 100;
    const i = Math.pow(1 + apy / 100, 1 / 12) - 1;
    const growth = Math.pow(1 + i, n);
    const savedFv = saved * growth;
    const remaining = Math.max(0, target - savedFv);
    const monthly = i === 0 ? remaining / n : (remaining * i) / (growth - 1);
    const deposits = monthly * n;
    const interest = Math.max(0, savedFv - saved + (i === 0 ? 0 : monthly * ((growth - 1) / i) - deposits));
    return {
      monthly,
      target,
      interest,
      chart: {
        type: 'bar',
        title: 'Where the cash comes from ($)',
        categories: ['Already saved', 'Monthly deposits', 'Interest'],
        series: [{ name: 'Dollars', values: [saved, deposits, interest] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Cash needed = $${fmt(price, 0)} × (${fmt(down)}% + ${fmt(closing)}%) = $${fmt(target, 0)}`,
        `Your $${fmt(saved, 0)} grows to $${fmt(savedFv, 0)} in ${n} months at ${fmt(apy)}% APY`,
        `Still to cover = $${fmt(remaining, 0)}; monthly deposit = $${fmt(monthly, 0)}`,
      ],
      note: remaining === 0
        ? 'Your current savings will already reach the target in that time, with no further deposits.'
        : `Saving $${fmt(monthly, 0)} a month for ${n} months gets you to $${fmt(target, 0)}. Rates and prices change, so treat this as a plan, not a promise.`,
    };
  },
  content: {
    formula: ['Cash needed = home price × (down payment % + closing cost %)', 'Monthly deposit = (cash needed − savings × (1 + i)^n) × i ÷ ((1 + i)^n − 1)', 'i = (1 + APY)^(1/12) − 1 is the monthly rate; n is the number of months'],
    body: [
      'A down payment is the part of the home price you pay up front, and closing costs are the fees due when the sale completes. Both come out of your savings, so this calculator adds them into one target.',
      'Your existing savings keep earning interest while you add monthly deposits. The calculator grows what you have saved, subtracts it from the target, and finds the level deposit that covers the rest by your buy date.',
      'Putting 20% down avoids private mortgage insurance on many conventional loans, but lenders also offer loans with much smaller down payments. A smaller down payment means a bigger loan and a bigger monthly payment.',
      'Interest is shown as a steady yearly yield. Real savings rates change, so rerun the numbers if your rate moves.',
    ],
    faq: [
      { q: 'How much should I save for a down payment?', a: 'It depends on the loan. Many buyers put down between 3% and 20% of the price, plus about 2% to 5% for closing costs. Set the percentages to match your loan offer.' },
      { q: 'How is the monthly amount worked out?', a: 'Your current savings grow at the interest rate you enter, and the monthly deposit covers the gap to the target. For $400,000 at 10% down plus 3% closing, 0% interest, $4,000 saved and 4 years, the target is $52,000 and the deposit is $48,000 ÷ 48 = $1,000 a month.' },
      { q: 'Does it include the monthly mortgage payment?', a: 'No. It only plans the up-front cash. Use the mortgage calculator for the monthly payment.' },
      { q: 'What if I already have enough?', a: 'If your savings plus interest reach the target in the time you set, the monthly deposit shows $0.' },
    ],
    sources: [
      { label: 'Consumer Financial Protection Bureau: closing costs explained', url: 'https://www.consumerfinance.gov/owning-a-home/closing/' },
      { label: 'Consumer Financial Protection Bureau: down payments', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-down-payment-en-110/' },
    ],
  },
  related: ['mortgage', 'home-affordability', 'savings-goal', 'rent-vs-buy', 'apy-calculator', 'emergency-fund'],
  examples: [
    // target 400000*0.13 = 52000; 0% interest; (52000-4000)/48 = 1000
    { values: { price: 400000, down: 10, closing: 3, saved: 4000, apy: 0, years: 4 }, expect: { monthly: 1000, target: 52000, interest: 0 }, tolerance: 1e-6 },
    // already enough: 100000*20% = 20000, saved 25000, apy 0 -> 0
    { values: { price: 100000, down: 20, closing: 0, saved: 25000, apy: 0, years: 2 }, expect: { monthly: 0, target: 20000, interest: 0 }, tolerance: 1e-6 },
  ],
});
