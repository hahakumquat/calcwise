import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, moneyDonut, monthIdx } from '../../lib/helpers/finance';
import { amortizedPayment, money, MONTH_S, toMonths } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'auto-loan',
  title: 'Auto Loan Calculator',
  category: 'finance',
  description: 'Estimate your monthly car payment including sales tax, fees, down payment and trade-in value.',
  keywords: ['car loan', 'car payment', 'auto financing', 'vehicle loan', 'trade-in', 'car finance'],
  popular: true,
  inputs: [
    { id: 'price', label: 'Vehicle price', type: 'number', prefix: '$', default: 35000, min: 0, step: 500, info: 'The negotiated price of the vehicle before taxes, fees and any trade-in.' },
    { id: 'down', label: 'Down payment (cash)', type: 'number', prefix: '$', default: 5000, min: 0, optional: true, info: 'Cash you pay up front. Around 10%–20% of the price keeps the loan below the car\'s value.' },
    { id: 'tradeIn', label: 'Trade-in value', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', info: 'What the dealer is giving you for your current car. Check online valuation tools to see if the offer is fair.' },
    { id: 'tradeOwed', label: 'Still owed on trade-in', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', info: 'The payoff amount still owed on the car you are trading in. Your lender can give you an exact payoff quote.' },
    { id: 'taxRate', label: 'Sales tax rate', type: 'number', suffix: '%', default: 7, min: 0, step: 0.05, optional: true, info: 'Your combined state and local sales tax rate for vehicles, based on where you register the car.' },
    {
      id: 'taxTrade',
      info: 'Most states charge tax only on the price minus your trade-in; a few tax the full price.',
      label: 'Sales tax applies to',
      type: 'select',
      default: 'net',
      options: [
        { value: 'net', label: 'Price minus trade-in (most states)' },
        { value: 'full', label: 'Full price' },
      ],
    },
    { id: 'fees', label: 'Title, registration & dealer fees', type: 'number', prefix: '$', default: 800, min: 0, optional: true, help: 'Assumed to be financed.', info: 'Title, registration, documentation and other dealer fees. They are usually a few hundred to a couple of thousand dollars.' },
    { id: 'rate', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 6.9, min: 0, step: 0.05, info: 'The APR on the auto loan. Get pre-approved by a bank or credit union to compare with the dealer\'s offer.' },
    { id: 'term', label: 'Loan term', type: 'number', unit: 'time', units: ['mo', 'yr'], defaultUnit: 'mo', default: 60, min: 0, info: 'How long you have to repay. 36–72 months is common; longer terms lower the payment but cost more interest.' },
  ],
  outputs: [
    { id: 'payment', label: 'Monthly payment', format: 'currency', primary: true, info: 'Your fixed monthly loan payment for the amount financed.' },
    { id: 'loanAmount', label: 'Amount financed', format: 'currency', info: 'The amount you borrow after adding tax and fees and subtracting your down payment and trade-in equity.' },
    { id: 'salesTax', label: 'Sales tax', format: 'currency', info: 'Sales tax on the purchase, which is added to what you finance.' },
    { id: 'totalInterest', label: 'Total interest', format: 'currency', info: 'Interest paid over the whole loan on top of the amount financed.' },
    { id: 'totalCost', label: 'Total cost of the car', format: 'currency', help: 'Payments + down payment + trade-in equity used.', info: 'Everything the car costs you: all loan payments plus your down payment and the trade-in equity you used.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const rate = num(v.rate);
    const termS = num(v.term);
    if (price === null || rate === null || termS === null || price <= 0 || rate < 0) return { payment: null };
    const n = toMonths(termS);
    if (n <= 0) return { payment: null, error: 'Enter a loan term of at least one month.' };
    const down = num(v.down) ?? 0;
    const tradeIn = num(v.tradeIn) ?? 0;
    const owed = num(v.tradeOwed) ?? 0;
    const fees = num(v.fees) ?? 0;
    const taxRate = (num(v.taxRate) ?? 0) / 100;
    const taxable = v.taxTrade === 'full' ? price : Math.max(0, price - tradeIn);
    const salesTax = taxable * taxRate;
    const equity = tradeIn - owed; // negative = rolled-over negative equity
    const loanAmount = price + salesTax + fees - down - equity;
    if (loanAmount <= 0) return { chart: moneyDonut('Total cost breakdown', [{ label: 'Vehicle price', value: price }, { label: 'Sales tax', value: salesTax }, { label: 'Fees', value: fees }]), payment: 0, loanAmount: 0, salesTax, totalInterest: 0, totalCost: price + salesTax + fees, note: 'Your down payment and trade-in cover the whole purchase — no loan needed.' };
    const payment = amortizedPayment(loanAmount, rate, n);
    const totalInterest = payment * n - loanAmount;
    const r = rate / 100 / 12;
    const idx = monthIdx(n);
    const bal = idx.map((m) => Math.max(0, r === 0 ? loanAmount - payment * m : loanAmount * (1 + r) ** m - (payment * ((1 + r) ** m - 1)) / r));
    return {
      payment,
      loanAmount,
      salesTax,
      totalInterest,
      totalCost: payment * n + down + equity,
      chart: [moneyDonut('Total cost breakdown', [{ label: 'Vehicle price', value: price }, { label: 'Sales tax', value: salesTax }, { label: 'Fees', value: fees }, { label: 'Interest', value: totalInterest }]), { type: 'line', title: 'Loan balance', x: idx, xLabel: 'Months', yFormat: CURRENCY, series: [{ name: 'Balance', values: bal }] }],
      steps: [
        `Sales tax = ${money(taxable)} × ${+(taxRate * 100).toFixed(4)}% = ${money(salesTax)}`,
        `Financed = ${money(price)} + ${money(salesTax)} tax + ${money(fees)} fees − ${money(down)} down − ${money(equity)} trade-in equity = ${money(loanAmount)}`,
        `Payment = L·r ÷ (1 − (1 + r)^−n) with r = ${rate}% ÷ 12, n = ${n} → ${money(payment)}`,
      ],
      note:
        equity < 0
          ? `${money(-equity)} of negative equity from your trade-in is being rolled into this loan.`
          : `Over ${n} months you pay ${money(totalInterest)} in interest.`,
    };
  },
  content: {
    formula: [
      'Amount financed = price + sales tax + fees − down payment − (trade-in − amount owed)',
      'Payment = L · r ÷ (1 − (1 + r)^−n), r = APR ÷ 12',
    ],
    body: [
      'A car payment depends on how much you finance, not just on the sticker price. Sales tax, title and registration fees and dealer documentation fees are usually added to the loan, while your cash down payment and any trade-in equity are subtracted.',
      'Most U.S. states charge sales tax only on the difference between the new car\'s price and your trade-in, which makes trading in at the dealer worth more than its face value. A few states — including California, Michigan and Virginia — tax the full price; choose "Full price" if that applies to you.',
      'If you owe more on your current car than it is worth, the shortfall (negative equity) is typically rolled into the new loan. That raises the payment and means you start the new loan underwater, so it is worth paying down or waiting if you can.',
      'Longer terms like 72 or 84 months lower the payment but raise total interest and keep you owing more than the car is worth for longer. Compare the total cost line, not just the monthly figure.',
    ],
    faq: [
      { q: 'How much should I put down on a car?', a: 'Around 20% on a new car (10% on used) is a common target. It keeps the loan below the car\'s value as it depreciates and lowers both the payment and total interest.' },
      { q: 'Is the dealer\'s rate the same as APR?', a: 'Usually the quoted auto rate is the APR. If the lender adds separate loan fees, the true APR is higher; use the APR calculator to check.' },
      { q: 'What credit score do I need for the best rate?', a: 'Lenders typically reserve their lowest rates for scores above about 720. Getting pre-approved by a bank or credit union before visiting the dealer gives you a rate to compare against.' },
    ],
  },
  related: ['loan', 'apr', 'sales-tax', 'take-home-pay'],
  examples: [
    {
      values: { price: 35000, down: 5000, tradeIn: null, tradeOwed: null, taxRate: 7, taxTrade: 'net', fees: 800, rate: 6.9, term: 60 * MONTH_S },
      expect: { salesTax: 2450, loanAmount: 33250, payment: 656.8222 },
      tolerance: 0.00001,
    },
    {
      values: { price: 30000, down: 0, tradeIn: 10000, tradeOwed: 4000, taxRate: 5, taxTrade: 'net', fees: 0, rate: 0, term: 48 * MONTH_S },
      expect: { salesTax: 1000, loanAmount: 25000, payment: 520.8333333 },
      tolerance: 0.00001,
    },
  ],
});
