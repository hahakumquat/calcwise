import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'escrow-shortage',
  title: 'Escrow Shortage: New Mortgage Payment',
  category: 'finance',
  description: 'Turn your escrow analysis letter into a new monthly payment: spread the shortage over 12 months or fewer and see the increase and the payment after it ends.',
  keywords: ['escrow shortage calculator', 'new mortgage payment after escrow analysis', 'escrow shortage spread over 12 months', 'why did my mortgage payment go up', 'escrow payment increase'],
  updated: '2026-11-28',
  inputs: [
    { id: 'tax', label: 'Annual property tax', type: 'number', prefix: '$', default: 4800, min: 0, step: 100, info: 'Yearly property tax bill the servicer pays from escrow.' },
    { id: 'ins', label: 'Annual homeowners insurance', type: 'number', prefix: '$', default: 1800, min: 0, step: 100, info: 'Yearly insurance premium the servicer pays from escrow.' },
    { id: 'cur', label: 'Current monthly escrow payment', type: 'number', prefix: '$', default: 450, min: 0, step: 10, info: 'The tax and insurance part of your current payment.' },
    { id: 'short', label: 'Shortage amount', type: 'number', prefix: '$', default: 600, min: 0, step: 50, info: 'The shortage shown on your escrow analysis letter.' },
    { id: 'months', label: 'Months to spread the shortage', type: 'number', default: 12, min: 1, step: 1, info: 'The letter states the period, often 12 months.' },
    { id: 'pi', label: 'Monthly principal and interest', type: 'number', prefix: '$', default: 1800, min: 0, step: 25, info: 'Your loan payment before escrow. Does not change.' },
  ],
  outputs: [
    { id: 'newEscrow', label: 'New monthly escrow payment', format: 'currency', primary: true, info: 'Required monthly escrow plus the shortage spread.' },
    { id: 'increase', label: 'Increase from current escrow', format: 'currency', info: 'New escrow minus current escrow.' },
    { id: 'newTotal', label: 'New total monthly payment', format: 'currency', info: 'Principal and interest plus new escrow.' },
    { id: 'after', label: 'Total payment after the shortage ends', format: 'currency', info: 'Principal and interest plus required escrow (tax + insurance ÷ 12).' },
  ],
  compute: (v) => {
    const tax = num(v.tax), ins = num(v.ins), cur = num(v.cur), sh = num(v.short), mo = num(v.months), pi = num(v.pi);
    if (tax === null || ins === null || cur === null || sh === null || mo === null || pi === null) return { newEscrow: null };
    if (tax < 0 || ins < 0 || cur < 0 || sh < 0 || pi < 0) return { newEscrow: null, error: 'Amounts cannot be negative.' };
    if (mo <= 0) return { newEscrow: null, error: 'Months to spread the shortage must be above 0.' };
    const required = (tax + ins) / 12;
    const perMonth = sh / mo;
    const newEscrow = required + perMonth;
    const increase = newEscrow - cur;
    const newTotal = pi + newEscrow;
    const after = pi + required;
    const oldTotal = pi + cur;
    return {
      newEscrow, increase, newTotal, after,
      tone: increase > 0 ? 'warn' : 'good',
      badge: increase > 0 ? `Up ${usd(increase)} a month` : 'No increase',
      chart: {
        type: 'bar',
        title: 'Total monthly payment',
        categories: ['Current', 'New (with shortage)', 'After shortage ends'],
        series: [{ name: 'Payment', values: [oldTotal, newTotal, after] }],
        format: { format: 'currency' },
        highlight: 1,
      },
      steps: [
        `Required escrow = (${usd(tax)} + ${usd(ins)}) ÷ 12 = ${usd(required)} a month`,
        `Shortage per month = ${usd(sh)} ÷ ${mo} = ${usd(perMonth)}`,
        `New escrow = ${usd(required)} + ${usd(perMonth)} = ${usd(newEscrow)} (${usd(increase)} vs current)`,
        `New total = ${usd(pi)} + ${usd(newEscrow)} = ${usd(newTotal)}, versus ${usd(oldTotal)} now`,
        `After ${mo} months the escrow falls to ${usd(required)}, a total of ${usd(after)} if tax and insurance stay the same.`,
      ],
      note: 'Your lender\'s escrow letter is the authority. Servicers may also hold a cushion (US rules allow up to two months of escrow payments), so your letter can differ. Confirm at consumerfinance.gov.',
    };
  },
  content: {
    formula: [
      'Required monthly escrow = (annual tax + annual insurance) ÷ 12',
      'Shortage per month = shortage ÷ months to spread',
      'New escrow = required escrow + shortage per month',
      'New total payment = principal and interest + new escrow',
    ],
    body: [
      'Once a year your mortgage servicer reviews your escrow account. If taxes or insurance rose, the account can fall short, and the letter asks you to cover the shortage and raise your monthly escrow.',
      'This calculator does the arithmetic from your letter: what the escrow must be to cover next year\'s bills, plus the shortage spread over the months given. When the spread ends, the escrow drops back to the required amount, provided tax and insurance do not change again.',
      'The letter from your lender is the final word. Servicers can add a cushion and may offer to take the shortage as a lump sum instead.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'Tax of $4,800 and insurance of $1,800 need $550 a month. A $600 shortage over 12 months adds $50, so the new escrow is $600, up $150 from $450. With $1,800 principal and interest the total is $2,400, up from $2,250.' },
      { q: 'What happens after the shortage is paid off?', a: 'The escrow drops to the required amount. In the example that is $550, so the total payment is $2,350, if tax and insurance stay the same.' },
      { q: 'Can I pay the shortage in a lump sum?', a: 'Often yes. Paying it up front means the new escrow is only the required $550 a month. Ask your servicer.' },
      { q: 'Why does my letter show a different number?', a: 'Servicers may hold a cushion of up to two months of escrow payments under US rules, and use their own projected bills. The letter is the authority.' },
    ],
    sources: [{ label: 'CFPB: What is an escrow shortage?', url: 'https://www.consumerfinance.gov/ask-cfpb/' }],
  },
  related: ['mortgage', 'mortgage-interest-year', 'pmi-calculator'],
  examples: [
    // required (4800+1800)/12 = 550; shortage 600/12 = 50; new 600; +150; total 1800+600 = 2400; after 2350
    { values: { tax: 4800, ins: 1800, cur: 450, short: 600, months: 12, pi: 1800 }, expect: { newEscrow: 600, increase: 150, newTotal: 2400, after: 2350 }, tolerance: 0.01 },
    // shortage over 6: 600/6 = 100; new 650; +200; total 2450
    { values: { tax: 4800, ins: 1800, cur: 450, short: 600, months: 6, pi: 1800 }, expect: { newEscrow: 650, increase: 200, newTotal: 2450, after: 2350 }, tolerance: 0.01 },
  ],
});
