import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'car-lease-vs-buy',
  title: 'Car Lease vs Buy Calculator',
  category: 'finance',
  description: 'Compare the real monthly cost of leasing a car with buying it on a loan and selling it later, using your own prices, payments and resale value.',
  keywords: ['lease vs buy car calculator', 'should i lease or buy a car', 'car lease vs loan cost per month', 'lease or finance calculator', 'cost of leasing vs buying'],
  updated: '2026-11-21',
  inputs: [
    { id: 'price', label: 'Car price (buy)', type: 'number', prefix: '$', default: 35000, min: 0, step: 500, info: 'Price you would pay to buy it, before insurance and registration.' },
    { id: 'down', label: 'Down payment (buy)', type: 'number', prefix: '$', default: 5000, min: 0, step: 500, info: 'Cash you put down when buying. The rest is borrowed.' },
    { id: 'apr', label: 'Loan interest rate (APR)', type: 'number', suffix: '%', default: 6, min: 0, step: 0.1, info: 'The yearly interest rate on the car loan.' },
    { id: 'months', label: 'Loan length', type: 'number', suffix: 'months', default: 60, min: 1, step: 6, info: 'How many monthly payments the loan has.' },
    { id: 'resale', label: 'Value of the car when you sell it', type: 'number', prefix: '$', default: 18000, min: 0, step: 500, info: 'Your estimate of what it sells for at the end of the loan.' },
    { id: 'leasePay', label: 'Lease payment per month', type: 'number', prefix: '$', default: 400, min: 0, step: 10, info: 'The monthly lease payment on the quote.' },
    { id: 'leaseMonths', label: 'Lease length', type: 'number', suffix: 'months', default: 36, min: 1, step: 6, info: 'How many months the lease runs.' },
    { id: 'signing', label: 'Due at lease signing', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, optional: true, info: 'First payment, fees and any down payment on the lease.' },
  ],
  outputs: [
    { id: 'diff', label: 'Lease costs more (or less) per month than buying', format: 'currency', primary: true, info: 'Lease cost per month minus buy cost per month. Negative means leasing is cheaper per month.' },
    { id: 'buyMonthly', label: 'Buy: net cost per month', format: 'currency', info: '(Down payment + loan payments − resale value) ÷ loan months.' },
    { id: 'leaseMonthly', label: 'Lease: cost per month', format: 'currency', info: '(Due at signing + payments × months) ÷ lease months.' },
    { id: 'loanPay', label: 'Loan payment per month', format: 'currency', info: 'The standard monthly payment on the amount borrowed.' },
    { id: 'buyNet', label: 'Buy: total net cost', format: 'currency', info: 'Everything paid to buy, minus what the car sells for.' },
    { id: 'leaseTotal', label: 'Lease: total cost', format: 'currency', info: 'Due at signing plus all lease payments.' },
  ],
  compute: (v) => {
    const price = num(v.price), down = num(v.down), apr = num(v.apr), n = num(v.months), resale = num(v.resale);
    const lp = num(v.leasePay), lm = num(v.leaseMonths);
    const signing = num(v.signing) ?? 0;
    if ([price, down, apr, n, resale, lp, lm].some((x) => x === null)) return { diff: null, note: 'Fill in the buy and lease details.' };
    const P = price as number, D = down as number, A = apr as number, N = n as number, R = resale as number, LP = lp as number, LM = lm as number;
    if (P < 0 || D < 0 || A < 0 || R < 0 || LP < 0 || signing < 0) return { diff: null, error: 'Values cannot be negative.' };
    if (N < 1 || LM < 1) return { diff: null, error: 'Loan and lease lengths must be at least 1 month.' };
    if (D > P) return { diff: null, error: 'The down payment cannot be more than the price.' };
    const loan = P - D;
    const r = A / 100 / 12;
    const pay = loan === 0 ? 0 : r === 0 ? loan / N : (loan * r) / (1 - Math.pow(1 + r, -N));
    const paid = D + pay * N;
    const buyNet = paid - R;
    const buyMonthly = buyNet / N;
    const leaseTotal = signing + LP * LM;
    const leaseMonthly = leaseTotal / LM;
    const diff = leaseMonthly - buyMonthly;
    return {
      diff,
      buyMonthly,
      leaseMonthly,
      loanPay: pay,
      buyNet,
      leaseTotal,
      tone: diff < 0 ? 'good' : diff === 0 ? 'ok' : 'warn',
      badge: diff < 0 ? 'Leasing is cheaper per month' : diff === 0 ? 'Even' : 'Buying is cheaper per month',
      chart: {
        type: 'bar',
        title: 'Cost per month',
        categories: ['Buy (net of resale)', 'Lease'],
        series: [{ name: 'Per month', values: [buyMonthly, leaseMonthly] }],
        format: { format: 'currency' },
      },
      steps: [
        `Loan = ${usd(P)} − ${usd(D)} down = ${usd(loan)}; payment = ${usd(pay)} a month for ${N} months`,
        `Buy net cost = ${usd(D)} + ${usd(pay * N)} − ${usd(R)} resale = ${usd(buyNet)}, or ${usd(buyMonthly)} a month`,
        `Lease cost = ${usd(signing)} + ${usd(LP)} × ${LM} = ${usd(leaseTotal)}, or ${usd(leaseMonthly)} a month`,
        `Difference = ${usd(leaseMonthly)} − ${usd(buyMonthly)} = ${usd(diff)} a month`,
      ],
      note: 'Insurance, registration, taxes, mileage fees and repairs are not included. Per-month figures spread each option over its own length; a longer period of ownership lowers the buy figure.',
    };
  },
  content: {
    formula: [
      'Loan payment = loan × r ÷ (1 − (1 + r)^−n), where r = APR ÷ 12 and n = loan months',
      'Buy net cost = down payment + loan payment × n − resale value',
      'Lease cost = due at signing + lease payment × lease months',
      'Cost per month = total cost ÷ months',
    ],
    body: [
      'A lease payment looks small next to a loan payment, but they are not the same thing. With a loan you end up owning a car that is still worth something. With a lease you hand it back. This calculator puts both on one footing: what you pay out in total, minus what the car is worth when you sell it, spread over the months.',
      'For buying, enter the price, your down payment, the loan rate and length, and your honest guess at the resale value. For leasing, enter the monthly payment, the number of months and whatever is due when you sign. Resale value is the biggest unknown, so try a lower number to see how the answer moves.',
      'Per-month figures are spread over each option’s own length, so a 60-month loan is compared with a 36-month lease. Owning the car for longer than the loan lowers the buy figure further, while a lease means you start over with a new car and a new payment at the end.',
      'This leaves out insurance, registration, sales tax, mileage-overage and wear charges, and repairs. Add those yourself if they differ between the two options. For the loan alone, see the auto loan calculator.',
    ],
    faq: [
      { q: 'Is leasing cheaper than buying?', a: 'Often per month, yes, but you own nothing at the end. With the defaults ($35,000 car, $5,000 down, 6% for 60 months, $18,000 resale, lease $400 for 36 months with $2,000 at signing) buying nets out at $363.32 a month and leasing at $455.56, so leasing costs about $92.24 more a month.' },
      { q: 'How is the loan payment worked out?', a: 'The standard loan formula: loan × r ÷ (1 − (1 + r)^−n) with r the monthly rate. For $30,000 at 6% over 60 months that is $579.98 a month.' },
      { q: 'Why does resale value matter so much?', a: 'It is money you get back. A car that keeps its value lowers the real cost of buying, so a small change in your resale guess can flip the result.' },
      { q: 'What is not included?', a: 'Insurance, registration, taxes, lease mileage and wear charges, and repairs. Compare those separately.' },
    ],
    sources: [
      { label: 'Leasing a car (Consumer Financial Protection Bureau)', url: 'https://www.consumerfinance.gov/consumer-tools/auto-loans/' },
    ],
  },
  related: ['auto-loan', 'loan-comparison', 'loan', 'apr'],
  examples: [
    // loan 30000, r 0.005, n 60 -> 579.98404588; paid 5000 + 34799.04275 = 39799.04275; net 21799.04275; /60 = 363.317379; lease 2000+14400 = 16400 /36 = 455.555556; diff 92.238176
    { values: { price: 35000, down: 5000, apr: 6, months: 60, resale: 18000, leasePay: 400, leaseMonths: 36, signing: 2000 }, expect: { loanPay: 579.98404588, buyNet: 21799.04275, buyMonthly: 363.317379, leaseMonthly: 455.555556, leaseTotal: 16400, diff: 92.238176 }, tolerance: 1e-3 },
    // 0% APR: loan 24000 / 48 = 500; paid 6000+24000 = 30000; net 30000-15000 = 15000; /48 = 312.5; lease 300x24 = 7200/24 = 300; diff -12.5
    { values: { price: 30000, down: 6000, apr: 0, months: 48, resale: 15000, leasePay: 300, leaseMonths: 24, signing: 0 }, expect: { loanPay: 500, buyNet: 15000, buyMonthly: 312.5, leaseMonthly: 300, diff: -12.5 }, tolerance: 1e-6 },
  ],
});
