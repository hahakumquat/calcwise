import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'pmi-calculator',
  title: 'PMI Calculator',
  category: 'finance',
  description: 'Estimate monthly PMI, the month your loan balance reaches 80% and 78% of the home price, and the total PMI you would pay before it can end.',
  keywords: ['pmi calculator', 'private mortgage insurance calculator', 'when does pmi go away', 'pmi drop off calculator', 'how long will i pay pmi', 'cancel pmi 80 percent'],
  updated: '2026-11-27',
  popular: false,
  inputs: [
    { id: 'price', label: 'Home price', type: 'number', prefix: '$', default: 400000, min: 0, step: 1000, info: 'Purchase price. Rules for ending PMI are tied to the original value of the home.' },
    { id: 'down', label: 'Down payment', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.5, info: 'Percent of the price you pay up front. PMI normally applies below 20%.' },
    { id: 'rate', label: 'Loan interest rate', type: 'number', suffix: '%', default: 6.5, min: 0, step: 0.05, info: 'Annual mortgage rate.' },
    { id: 'years', label: 'Loan term', type: 'number', suffix: 'years', default: 30, min: 1, max: 50, step: 1, info: 'Length of the loan in years.' },
    { id: 'pmiRate', label: 'PMI rate', type: 'number', suffix: '% a year', default: 0.8, min: 0, step: 0.05, info: 'Annual PMI as a percent of the loan. Read it from your lender estimate; it varies with credit score and down payment.' },
  ],
  outputs: [
    { id: 'requestMonth', label: 'Payment when balance hits 80% of price', format: 'number', precision: 0, suffix: 'months', primary: true, info: 'First payment after which the balance is at or below 80% of the home price. You can usually ask the lender to cancel PMI around then.' },
    { id: 'autoMonth', label: 'Payment when balance hits 78% of price', format: 'number', precision: 0, suffix: 'months', info: 'First payment after which the balance is at or below 78% of the home price. PMI is generally supposed to end automatically around then.' },
    { id: 'pmiMonthly', label: 'PMI per month', format: 'currency', precision: 2, info: 'Loan amount × PMI rate ÷ 12.' },
    { id: 'payment', label: 'Principal and interest payment', format: 'currency', precision: 2, info: 'Standard amortized payment, not including PMI, taxes or insurance.' },
    { id: 'pmiToRequest', label: 'PMI paid to the 80% month', format: 'currency', precision: 2, info: 'Monthly PMI × the 80% month.' },
    { id: 'pmiToAuto', label: 'PMI paid to the 78% month', format: 'currency', precision: 2, info: 'Monthly PMI × the 78% month.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const down = num(v.down);
    const rate = num(v.rate);
    const years = num(v.years);
    const pmiRate = num(v.pmiRate);
    if (price === null || down === null || rate === null || years === null || pmiRate === null) return { requestMonth: null };
    if (price <= 0 || down < 0 || down > 100 || rate < 0 || years < 1 || pmiRate < 0) return { requestMonth: null };
    if (down >= 20) {
      return { requestMonth: null, error: 'With 20% or more down, PMI normally is not required on a conventional loan, so there is nothing to estimate. Lower the down payment to see PMI.' };
    }
    const loan = price * (1 - down / 100);
    const n = Math.round(years * 12);
    const i = rate / 100 / 12;
    const payment = i === 0 ? loan / n : (loan * i) / (1 - (1 + i) ** -n);
    const pmiMonthly = (loan * pmiRate) / 100 / 12;
    let bal = loan;
    let req = 0;
    let auto = 0;
    let balReq = 0;
    let balAuto = 0;
    const yrs: (number)[] = [0];
    const bals: number[] = [loan];
    for (let k = 1; k <= n; k++) {
      bal = Math.max(0, bal * (1 + i) - payment);
      if (!req && bal <= 0.8 * price + 1e-9) { req = k; balReq = bal; }
      if (!auto && bal <= 0.78 * price + 1e-9) { auto = k; balAuto = bal; }
      if (k % 12 === 0) { yrs.push(k / 12); bals.push(bal); }
    }
    if (!req || !auto) return { requestMonth: null, error: 'The balance never reaches 80% of the price with these inputs.' };
    const pmiReq = pmiMonthly * req;
    const pmiAuto = pmiMonthly * auto;
    const yearsMax = Math.max(1, Math.ceil(auto / 12) + 1);
    const cut = Math.min(yrs.length, yearsMax + 1);
    const x = yrs.slice(0, cut);
    return {
      requestMonth: req,
      autoMonth: auto,
      pmiMonthly,
      payment,
      pmiToRequest: pmiReq,
      pmiToAuto: pmiAuto,
      tone: 'warn',
      badge: `${money(pmiMonthly)} a month`,
      note: `On a ${money(loan)} loan, PMI at ${pmiRate}% is ${money(pmiMonthly)} a month. The balance reaches 80% of the price after payment ${req} (${(req / 12).toFixed(1)} years), when you can usually ask to cancel, and 78% after payment ${auto} (${(auto / 12).toFixed(1)} years), when it should end automatically. PMI paid by then: ${money(pmiReq)} to month ${req}, ${money(pmiAuto)} to month ${auto}. Rules vary by loan type and lender.`,
      chart: {
        type: 'line',
        title: 'Loan balance vs 80% and 78% of price',
        x,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Loan balance', values: bals.slice(0, cut) },
          { name: '80% of price', values: x.map(() => price * 0.8) },
          { name: '78% of price', values: x.map(() => price * 0.78) },
        ],
      },
      steps: [
        `Loan = ${money(price)} × (1 − ${down}%) = ${money(loan)}`,
        `PMI = ${money(loan)} × ${pmiRate}% ÷ 12 = ${money(pmiMonthly)} a month`,
        `Payment = ${money(payment)}; balance ${money(balReq)} after month ${req} (80% line ${money(price * 0.8)})`,
        `Balance ${money(balAuto)} after month ${auto} (78% line ${money(price * 0.78)})`,
      ],
    };
  },
  content: {
    formula: [
      'Loan = price × (1 − down payment %)',
      'PMI per month = loan × annual PMI rate ÷ 12',
      'Payment = L × i ÷ (1 − (1 + i)^−n), with i = rate ÷ 12; balance after each payment = balance × (1 + i) − payment',
      '80% month = first payment where balance ≤ 0.80 × price; 78% month = first where balance ≤ 0.78 × price',
      'Total PMI = PMI per month × that month',
    ],
    body: [
      'Private mortgage insurance (PMI) is a monthly charge on many conventional loans when you put less than 20% down. It protects the lender, not you. This calculator estimates the monthly cost and, using your normal payment schedule, when the balance falls to 80% and 78% of the original price.',
      'Example: a $400,000 home with 5% down is a $380,000 loan at 6.5% for 30 years. PMI at 0.8% a year is $253.33 a month and the payment is $2,401.86. The balance first drops to 80% of the price ($320,000) after payment 124, at $319,500.32, and to 78% ($312,000) after payment 135, at $311,913.52. PMI paid is $31,413.33 through month 124 and $34,200.00 through month 135.',
      'In general, US rules let you ask the lender to cancel PMI once the balance reaches 80% of the original value (if you are current and meet the lender conditions), and require it to end automatically at 78% on a schedule. Lenders can set extra conditions, FHA loans follow different insurance rules, and extra payments or a new appraisal can change the dates. Check your own loan documents. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much is PMI a month?', a: 'Loan amount × the annual PMI rate ÷ 12. On a $380,000 loan at 0.8% a year, that is $253.33 a month. Your lender estimate gives the real rate.' },
      { q: 'When can I stop paying PMI?', a: 'In the example, the balance is at or below 80% of the $400,000 price after payment 124 (about 10.3 years), when you can generally request cancellation, and at or below 78% after payment 135 (about 11.3 years), when it should end automatically. Lender rules and loan type can change this.' },
      { q: 'How much PMI will I pay in total?', a: 'Monthly PMI times the months until it ends. In the example that is $31,413.33 through month 124 or $34,200.00 through month 135.' },
      { q: 'What if I put 20% down?', a: 'Conventional loans generally do not require PMI at 20% down, so the calculator shows no PMI result.' },
      { q: 'Do extra payments end PMI sooner?', a: 'Yes, they lower the balance faster, so you reach 80% earlier. This calculator assumes the regular schedule; try the extra mortgage payment calculator to see the effect.' },
    ],
    sources: [
      { label: 'CFPB: How do I get rid of private mortgage insurance (PMI)?', url: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-get-rid-of-private-mortgage-insurance-pmi-en-202/' },
      { label: 'Homeowners Protection Act of 1998 (12 U.S.C. ch. 49)', url: 'https://www.law.cornell.edu/uscode/text/12/chapter-49' },
    ],
  },
  related: ['mortgage', 'extra-mortgage-payment', 'mortgage-recast', 'mortgage-points'],
  examples: [
    // loan 380000; PMI 253.33; payment 2401.86; 80% month 124; 78% month 135; PMI 31413.33 / 34200
    { values: { price: 400000, down: 5, rate: 6.5, years: 30, pmiRate: 0.8 }, expect: { pmiMonthly: 253.33, payment: 2401.86, requestMonth: 124, autoMonth: 135, pmiToRequest: 31413.33, pmiToAuto: 34200 }, tolerance: 0.01 },
    // loan 270000; PMI 112.50; payment 1796.32; months 101 / 115; PMI 11362.50 / 12937.50
    { values: { price: 300000, down: 10, rate: 7, years: 30, pmiRate: 0.5 }, expect: { pmiMonthly: 112.5, payment: 1796.32, requestMonth: 101, autoMonth: 115, pmiToRequest: 11362.5, pmiToAuto: 12937.5 }, tolerance: 0.01 },
  ],
});
