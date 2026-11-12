import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, CURRENCY, money, moneyDonut, pct, toMonths, YEAR_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'mortgage',
  title: 'Mortgage Calculator',
  category: 'finance',
  description: 'Estimate your full monthly mortgage payment — principal and interest plus property tax, insurance, HOA and PMI.',
  keywords: ['mortgage payment', 'home loan', 'PITI', 'house payment', 'PMI', 'amortization', 'monthly mortgage'],
  popular: true,
  inputs: [
    { id: 'price', label: 'Home price', type: 'number', prefix: '$', default: 400000, min: 0, step: 1000, info: 'The purchase price of the home — the agreed offer, or the list price if you are still shopping.' },
    {
      id: 'downType',
      label: 'Down payment entered as',
      type: 'select',
      segmented: true,
      default: 'percent',
      options: [
        { value: 'percent', label: '% of price' },
        { value: 'amount', label: '$ amount' },
      ],
      info: 'Choose whether to type your down payment as a percentage of the price or as a dollar figure.',
    },
    { id: 'downPercent', label: 'Down payment', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 0.5, showWhen: { input: 'downType', is: 'percent' }, info: 'The share of the price you pay up front. Conventional loans allow as little as 3%; 20% avoids PMI.' },
    { id: 'downAmount', label: 'Down payment', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, showWhen: { input: 'downType', is: 'amount' }, info: 'The cash you put toward the purchase at closing, not counting closing costs.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 6.5, min: 0, step: 0.125, info: 'The annual note rate on your loan (not the APR). Check a lender quote or recent average 30-year fixed rates.' },
    { id: 'term', label: 'Loan term', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 30, min: 0, info: 'How long you have to repay the loan. 30 years is most common; 15-year loans have higher payments but far less interest.' },
    { id: 'taxRate', label: 'Property tax (per year)', type: 'number', suffix: '% of price', default: 1.1, min: 0, step: 0.05, optional: true, info: 'Yearly property tax as a share of the home value. U.S. averages are about 0.3%–2.2%; the county assessor or listing shows the real bill.' },
    { id: 'insurance', label: 'Homeowners insurance (per year)', type: 'number', prefix: '$', default: 1800, min: 0, optional: true, info: 'Your annual homeowners policy premium. Get a quote from an insurer; $1,200–$3,000 is typical, more in storm-prone areas.' },
    { id: 'hoa', label: 'HOA dues (per month)', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', info: 'Monthly homeowners-association fees for condos and planned communities. The listing usually states them; leave blank if none.' },
    { id: 'pmiRate', label: 'PMI rate (per year)', type: 'number', suffix: '% of loan', default: 0.5, min: 0, step: 0.05, optional: true, help: 'Only charged when the down payment is under 20%.', info: 'Private mortgage insurance, charged yearly as a percentage of the loan when you put down less than 20%. Typically 0.3%–1.5% depending on credit score.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Total monthly payment', format: 'currency', primary: true, info: 'Everything you pay each month: principal, interest, property tax, insurance, HOA and PMI combined.' },
    { id: 'pi', label: 'Principal & interest', format: 'currency', info: 'The fixed loan payment itself. It stays the same for the whole term on a fixed-rate mortgage.' },
    { id: 'monthlyTax', label: 'Property tax', format: 'currency', info: 'One twelfth of the yearly property tax, usually collected by the lender into escrow.' },
    { id: 'monthlyInsurance', label: 'Homeowners insurance', format: 'currency', info: 'One twelfth of the yearly insurance premium, usually paid through escrow.' },
    { id: 'monthlyHoa', label: 'HOA dues', format: 'currency', info: 'Monthly association dues, paid directly to the HOA rather than the lender.' },
    { id: 'monthlyPmi', label: 'PMI', format: 'currency', info: 'Monthly mortgage insurance. It is zero with 20% or more down and can be removed once you reach 20% equity.' },
    { id: 'loanAmount', label: 'Loan amount', format: 'currency', info: 'The amount you borrow: the home price minus your down payment.' },
    { id: 'downPaid', label: 'Down payment', format: 'currency', info: 'Your down payment in dollars, whichever way you entered it.' },
    { id: 'totalInterest', label: 'Total interest over the loan', format: 'currency', info: 'All interest paid if you keep the loan for its full term with no extra payments.' },
    { id: 'months', label: 'Payments', format: 'integer', suffix: 'months', info: 'The number of monthly payments in the loan term.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const rate = num(v.rate);
    const termS = num(v.term);
    const down = v.downType === 'amount' ? num(v.downAmount) : num(v.downPercent);
    if (price === null || down === null || rate === null || termS === null) return { monthly: null };
    if (price <= 0 || down < 0 || rate < 0) return { monthly: null };
    const n = toMonths(termS);
    if (n <= 0) return { monthly: null, error: 'Enter a loan term of at least one month.' };
    const downPaid = v.downType === 'amount' ? down : (price * down) / 100;
    if (downPaid > price) return { monthly: null, error: 'The down payment is larger than the home price.' };
    const loan = price - downPaid;
    const ltv = loan / price;
    const pi = loan > 0 ? amortizedPayment(loan, rate, n) : 0;
    const monthlyTax = (price * (num(v.taxRate) ?? 0)) / 100 / 12;
    const monthlyInsurance = (num(v.insurance) ?? 0) / 12;
    const monthlyHoa = num(v.hoa) ?? 0;
    const monthlyPmi = ltv > 0.8 ? (loan * (num(v.pmiRate) ?? 0)) / 100 / 12 : 0;
    const monthly = pi + monthlyTax + monthlyInsurance + monthlyHoa + monthlyPmi;
    const totalInterest = pi * n - loan;
    // Yearly balance for the chart.
    const r = rate / 100 / 12;
    const years: number[] = [0];
    const balance: number[] = [loan];
    const equity: number[] = [downPaid];
    let bal = loan;
    for (let m = 1; m <= n; m++) {
      bal = Math.max(0, bal - (pi - bal * r));
      if (m % 12 === 0 || m === n) {
        years.push(+(m / 12).toFixed(2));
        balance.push(bal);
        equity.push(price - bal);
      }
    }
    return {
      monthly,
      pi,
      monthlyTax,
      monthlyInsurance,
      monthlyHoa,
      monthlyPmi,
      loanAmount: loan,
      downPaid,
      totalInterest,
      months: n,
      chart: [
        moneyDonut(
          'Monthly payment breakdown',
          [
            { label: 'Principal & interest', value: pi },
            { label: 'Property tax', value: monthlyTax },
            { label: 'Insurance', value: monthlyInsurance },
            { label: 'HOA', value: monthlyHoa },
            { label: 'PMI', value: monthlyPmi },
          ],
          money(monthly, 0),
          'per month',
        ),
        { type: 'line', title: 'Loan balance and equity (at purchase price)', x: years, xLabel: 'Years', yFormat: CURRENCY, series: [{ name: 'Loan balance', values: balance }, { name: 'Your equity', values: equity }] },
      ],
      steps: [
        `Loan = ${money(price, 0)} − ${money(downPaid, 0)} down = ${money(loan, 0)} (loan-to-value ${pct(ltv, 1)})`,
        `Monthly rate r = ${rate}% ÷ 12; n = ${n} payments`,
        `Principal & interest = L·r ÷ (1 − (1 + r)^−n) = ${money(pi)}`,
        `+ tax ${money(monthlyTax)} + insurance ${money(monthlyInsurance)} + HOA ${money(monthlyHoa)} + PMI ${money(monthlyPmi)} = ${money(monthly)}`,
      ],
      note:
        ltv > 0.8
          ? `With ${pct(1 - ltv, 1)} down you will likely pay PMI until the balance falls to 80% of the home's original value.`
          : `With ${pct(1 - ltv, 1)} down there is no PMI. Over ${+(n / 12).toFixed(1)} years you would pay ${money(totalInterest, 0)} in interest.`,
    };
  },
  content: {
    formula: [
      'P&I = L · r ÷ (1 − (1 + r)^−n)',
      'L = home price − down payment, r = annual rate ÷ 12, n = years × 12',
      'Monthly payment = P&I + property tax ÷ 12 + insurance ÷ 12 + HOA + PMI',
    ],
    body: [
      'A mortgage payment has two layers. The core is principal and interest (P&I): a fixed amount, set by the loan size, rate and term, that pays the loan off exactly on schedule. On top of that most lenders collect property tax and homeowners insurance through an escrow account, and some homes add HOA dues and private mortgage insurance. Lenders call the full bundle PITI — principal, interest, taxes and insurance.',
      'Property tax is entered as a yearly percentage of the home price because that is how it is usually quoted; U.S. effective rates range from about 0.3% to over 2% depending on the state and county. Check the listing or the county assessor for the real figure, since a new purchase often triggers a reassessment.',
      'Private mortgage insurance protects the lender when you put down less than 20% on a conventional loan. It typically costs 0.3%–1.5% of the loan per year. You can ask to cancel it once your balance reaches 80% of the original value, and it ends automatically at 78%. FHA loans use a different mortgage insurance premium that this calculator does not model.',
      'The total interest figure shows how much the loan really costs. On a 30-year loan it often exceeds half the amount borrowed. A 15-year term, a bigger down payment or occasional extra principal payments all shrink it.',
    ],
    faq: [
      { q: 'How much of my income should go to the mortgage?', a: 'A common guideline is to keep the full housing payment under 28% of gross monthly income and all debt payments under 36%. Lenders may approve more, but staying under these levels leaves room for savings and surprises.' },
      { q: 'Is it worth putting 20% down?', a: 'Putting 20% down avoids PMI and lowers the payment, but it is not required. If a large down payment would empty your emergency fund, a smaller one with PMI for a few years can be the safer choice.' },
      { q: 'Why will my real payment differ from this estimate?', a: 'Escrow amounts change when tax bills and insurance premiums change, and lenders may hold a cushion in escrow. Your Loan Estimate shows the exact figures for your loan.' },
    ],
  },
  related: ['home-affordability', 'refinance', 'loan', 'apr', 'income-tax'],
  examples: [
    {
      values: { price: 400000, downType: 'percent', downPercent: 20, downAmount: null, rate: 6.5, term: 30 * YEAR_S, taxRate: 1.1, insurance: 1800, hoa: null, pmiRate: 0.5 },
      expect: { pi: 2022.62, monthlyTax: 366.67, monthlyPmi: 0, monthly: 2539.29, loanAmount: 320000 },
      tolerance: 0.00001,
    },
    {
      values: { price: 300000, downType: 'amount', downPercent: null, downAmount: 30000, rate: 6, term: 30 * YEAR_S, taxRate: 0, insurance: 0, hoa: 100, pmiRate: 0.6 },
      expect: { pi: 1618.79, monthlyPmi: 135, monthly: 1853.79 },
      tolerance: 0.00001,
    },
  ],
});
