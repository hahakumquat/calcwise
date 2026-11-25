import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Q = [1, 2, 3, 4] as const;
const defPaid = [4000, 5000, 3000, 5000];
const defDays = [300, 240, 150, 90];

export default defineCalculator({
  slug: 'underpayment-penalty-estimate',
  title: 'Underpayment penalty on estimated taxes',
  category: 'finance',
  description: 'Estimate the penalty for paying estimated tax late or short, quarter by quarter, from your shortfall, days underpaid and the IRS annual penalty rate.',
  keywords: ['underpayment penalty calculator', 'estimated tax penalty calculator', 'form 2210 penalty estimate', 'late estimated tax payment penalty', 'irs underpayment interest rate', 'how much is the underpayment penalty'],
  updated: '2026-11-25',
  inputs: [
    { id: 'annual', label: 'Annual required payment', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'The total you needed to pay for the year (for example the safe harbor amount). Each quarter is due one quarter of it.' },
    ...Q.map((q) => ({ id: `paid${q}`, label: `Paid for quarter ${q}`, type: 'number' as const, prefix: '$', default: defPaid[q - 1], min: 0, step: 100, info: `Estimated payments plus withholding counted for quarter ${q}.` })),
    ...Q.map((q) => ({ id: `days${q}`, label: `Days underpaid, quarter ${q}`, type: 'number' as const, default: defDays[q - 1], min: 0, max: 366, step: 1, info: `Days from the quarter ${q} due date until the shortfall was paid, or until the return due date (usually April 15) if it never was.` })),
    { id: 'rate', label: 'Annual penalty rate', type: 'number', suffix: '%', default: 8, min: 0, max: 100, step: 0.1, info: 'The IRS sets this rate each quarter. Check irs.gov for the current rate; 8 is a placeholder.' },
  ],
  outputs: [
    { id: 'total', label: 'Estimated penalty', format: 'currency', primary: true, info: 'Sum of shortfall × rate × days ÷ 365 across the four quarters.' },
    { id: 'shortfall', label: 'Total shortfall', format: 'currency', info: 'Sum of the amounts you paid below each quarter\'s required payment.' },
    { id: 'quarter', label: 'Required per quarter', format: 'currency', info: 'Annual required payment ÷ 4.' },
    { id: 'p1', label: 'Penalty, quarter 1', format: 'currency', info: 'Shortfall × rate × days ÷ 365 for quarter 1.' },
    { id: 'p2', label: 'Penalty, quarter 2', format: 'currency', info: 'Shortfall × rate × days ÷ 365 for quarter 2.' },
    { id: 'p3', label: 'Penalty, quarter 3', format: 'currency', info: 'Shortfall × rate × days ÷ 365 for quarter 3.' },
    { id: 'p4', label: 'Penalty, quarter 4', format: 'currency', info: 'Shortfall × rate × days ÷ 365 for quarter 4.' },
  ],
  compute: (v) => {
    const annual = num(v.annual);
    const rate = num(v.rate);
    const paid = Q.map((q) => num(v[`paid${q}`]));
    const days = Q.map((q) => num(v[`days${q}`]));
    if (annual === null || rate === null || paid.some((x) => x === null) || days.some((x) => x === null)) return { total: null };
    if (annual < 0 || rate < 0 || paid.some((x) => (x as number) < 0) || days.some((x) => (x as number) < 0)) return { total: null, error: 'Values cannot be negative.' };
    const quarter = annual / 4;
    const short = paid.map((p) => Math.max(0, quarter - (p as number)));
    const pen = short.map((s, i) => (s * (rate / 100) * (days[i] as number)) / 365);
    const total = pen.reduce((a, b) => a + b, 0);
    const shortfall = short.reduce((a, b) => a + b, 0);
    return {
      total,
      shortfall,
      quarter,
      p1: pen[0], p2: pen[1], p3: pen[2], p4: pen[3],
      tone: total === 0 ? 'good' : total < 100 ? 'ok' : 'warn',
      badge: total === 0 ? 'No penalty on these numbers' : 'About ' + usd(total) + ' in penalty',
      chart: {
        type: 'bar',
        title: 'Estimated penalty by quarter',
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [{ name: 'Penalty', values: pen }],
        format: { format: 'currency' },
      },
      steps: [
        `Required each quarter: ${usd(annual)} ÷ 4 = ${usd(quarter)}`,
        ...short.map((s, i) => `Q${i + 1}: shortfall ${usd(s)} × ${rate}% × ${days[i]} ÷ 365 = ${usd(pen[i])}`),
        `Total penalty: ${usd(total)} on a total shortfall of ${usd(shortfall)}`,
      ],
      note: 'Simple interest on each quarter\'s shortfall. The real IRS Form 2210 calculation applies the rate in force each quarter, applies later payments to the oldest shortfall first, and has its own exceptions, so treat this as an estimate.',
    };
  },
  content: {
    formula: [
      'Required per quarter = annual required payment ÷ 4',
      'Shortfall = required per quarter − amount paid (minimum 0)',
      'Penalty = shortfall × annual rate × days underpaid ÷ 365',
      'Total penalty = sum of the four quarters',
    ],
    body: [
      'When you pay federal estimated tax late or too little, the IRS charges an underpayment penalty. It works like interest: it is charged on each quarter\'s shortfall for the number of days it stayed unpaid, at a rate the IRS resets every quarter.',
      'This calculator uses simple interest so you can see the size of the problem. Enter the annual amount you were required to pay, what you paid toward each quarter, and how many days each shortfall stayed open. Then enter the current annual rate from irs.gov. The 8% default is only a placeholder.',
      'Overpaying one quarter does not automatically cover another here, and the calculator ignores that on purpose to keep it simple. Form 2210 applies extra payments to the earliest unpaid amount, which can lower the real figure. Withholding is treated as paid on the dates it is withheld, so you can enter it quarter by quarter if you know the split.',
      'Use this for a quick estimate, then use the Form 2210 worksheet or tax software for the figure you file. If you owe less than $1,000 after credits and withholding, there is generally no penalty at all.',
    ],
    faq: [
      { q: 'How is the underpayment penalty calculated here?', a: 'For each quarter: shortfall × annual rate × days underpaid ÷ 365. With the defaults, quarter 1 is $1,000 short for 300 days at 8%, which is $65.75, and quarter 3 is $2,000 short for 150 days, also $65.75, so the total is $131.51.' },
      { q: 'What penalty rate should I use?', a: 'Use the IRS underpayment rate for the period, which is published quarterly on irs.gov. It is the federal short-term rate plus 3 percentage points and can change each quarter. The 8% default is only a placeholder.' },
      { q: 'Will this match Form 2210?', a: 'Not exactly. Form 2210 uses the rate for each period, applies later payments to the oldest shortfall first, and has exceptions. This tool uses one rate and simple interest, so it gives an estimate.' },
      { q: 'How many days should I enter?', a: 'Count from the quarter\'s due date to the day you paid the shortfall. If you never caught up, count to the return due date, usually April 15. Due dates are generally April 15, June 15, September 15 and January 15.' },
      { q: 'How can I avoid the penalty?', a: 'Pay at least 90% of this year\'s tax or 100% of last year\'s (110% for higher incomes) in time. Our estimated tax safe harbor calculator shows that amount.' },
    ],
    sources: [
      { label: 'IRS: Form 2210, Underpayment of Estimated Tax by Individuals', url: 'https://www.irs.gov/forms-pubs/about-form-2210' },
      { label: 'IRS Topic no. 306, Penalty for underpayment of estimated tax', url: 'https://www.irs.gov/taxtopics/tc306' },
      { label: 'IRS: Quarterly interest rates', url: 'https://www.irs.gov/payments/quarterly-interest-rates' },
    ],
  },
  related: ['estimated-tax-safe-harbor', 'self-employment-tax', 'take-home-pay'],
  examples: [
    // required/quarter 5000; shortfalls 1000,0,2000,0. Q1 1000*0.08*300/365 = 24000/365 = 65.7534; Q3 2000*0.08*150/365 = 24000/365 = 65.7534; total 48000/365 = 131.5068
    { values: { annual: 20000, paid1: 4000, paid2: 5000, paid3: 3000, paid4: 5000, days1: 300, days2: 240, days3: 150, days4: 90, rate: 8 }, expect: { quarter: 5000, shortfall: 3000, p1: 24000 / 365, p2: 0, p3: 24000 / 365, p4: 0, total: 48000 / 365 }, tolerance: 1e-6 },
    // 10000/4 = 2500 per quarter, nothing paid, 365 days at 10%: each 2500*0.1 = 250; total 1000; shortfall 10000
    { values: { annual: 10000, paid1: 0, paid2: 0, paid3: 0, paid4: 0, days1: 365, days2: 365, days3: 365, days4: 365, rate: 10 }, expect: { total: 1000, shortfall: 10000, p1: 250, p4: 250 }, tolerance: 1e-6 },
    // fully paid 3000 >= 2500 each quarter: no shortfall, no penalty
    { values: { annual: 10000, paid1: 3000, paid2: 3000, paid3: 3000, paid4: 3000, days1: 100, days2: 100, days3: 100, days4: 100, rate: 8 }, expect: { total: 0, shortfall: 0 }, tolerance: 1e-6 },
  ],
});
